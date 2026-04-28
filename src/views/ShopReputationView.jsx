import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../components/Icon.jsx';
import { useReputation } from '../hooks/useReputation';
import { useMonitoringLogs } from '../hooks/useMonitoringLogs';
import { useAppContext } from '../context/AppContext.jsx';

const SITE_COLS = [
    { code: 'MX', flag: '🇲🇽', name: '墨西哥' },
    { code: 'BR', flag: '🇧🇷', name: '巴西' },
    { code: 'AR', flag: '🇦🇷', name: '阿根廷' },
    { code: 'CO', flag: '🇨🇴', name: '哥伦比亚' },
    { code: 'CL', flag: '🇨🇱', name: '智利' },
    { code: 'UY', flag: '🇺🇾', name: '乌拉圭' },
];

const STATUS_META = {
    green: { dot: 'bg-emerald-400', text: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', pulse: '' },
    yellow: { dot: 'bg-amber-400', text: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', pulse: 'animate-pulse' },
    red: { dot: 'bg-rose-400', text: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200', pulse: 'relative after:absolute after:inset-0 after:rounded-full after:bg-rose-500 after:animate-ping after:opacity-40' },
};

// 辅助函数：根据指标数值和站点状态计算颜色
const getMetricColor = (val, siteStatus, newCount = 0) => {
    const num = parseFloat(val || '0') || 0;
    // 如果数值为0且无新增，始终显示中性色
    if (num <= 0 && newCount <= 0) return 'text-slate-800';
    // 否则跟随站点状态颜色
    if (siteStatus === 'red') return 'text-rose-500';
    if (siteStatus === 'yellow') return 'text-amber-500';
    return 'text-slate-800';
};

const Tooltip = ({ data, storeName, site, position, onClose }) => {
    if (!data) return null;
    const siteInfo = SITE_COLS.find(c => c.code === site) || { flag: '🌐', name: site };
    const statusLabel = data.status === 'green' ? '健康' : data.status === 'yellow' ? '预警' : '危险';
    const meta = STATUS_META[data.status] || STATUS_META.green;

    return (
        <div
            className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in zoom-in-95 duration-200"
            style={{ left: position.x, top: position.y, minWidth: '220px' }}
            onMouseLeave={onClose}
        >
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <span className="text-xl">{siteInfo.flag}</span>
                <div className="flex-1">
                    <p className="text-[12px] font-black text-slate-800">{storeName}</p>
                    <p className="text-[10px] text-slate-400">{siteInfo.name}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${meta.bg} ${meta.text}`}>{statusLabel}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <div className={`flex flex-col items-center gap-1 p-2 rounded-xl ${parseFloat(data.reclamos) > 0 || data.new_claims > 0 ? 'bg-rose-50' : 'bg-slate-50'}`}>
                    <p className="text-[8px] text-slate-400 font-bold">投诉率</p>
                    <p className={`text-sm font-black ${getMetricColor(data.reclamos, data.status, data.new_claims)}`}>{data.reclamos}</p>
                </div>
                <div className={`flex flex-col items-center gap-1 p-2 rounded-xl ${parseFloat(data.despacho) > 0 || data.new_delayed > 0 ? 'bg-amber-50' : 'bg-slate-50'}`}>
                    <p className="text-[8px] text-slate-400 font-bold">延误率</p>
                    <p className={`text-sm font-black ${getMetricColor(data.despacho, data.status, data.new_delayed)}`}>{data.despacho}</p>
                </div>
                <div className={`flex flex-col items-center gap-1 p-2 rounded-xl ${parseFloat(data.cancel) > 0 || data.new_cancel > 0 ? 'bg-purple-50' : 'bg-slate-50'}`}>
                    <p className="text-[8px] text-slate-400 font-bold">取消率</p>
                    <p className={`text-sm font-black ${getMetricColor(data.cancel, data.status, data.new_cancel)}`}>{data.cancel || '0.00%'}</p>
                </div>
            </div>
        </div>
    );
};

const ShopReputationView = () => {
    const { reputation, loading: shopsLoading } = useReputation();
    const { logs, loading: logsLoading } = useMonitoringLogs(30);
    const { activeShop, setActiveShop } = useAppContext();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, abnormal, healthy
    const [hoveredCell, setHoveredCell] = useState(null);
    const [hoveredPos, setHoveredPos] = useState({ x: 0, y: 0 });
    const logEndRef = useRef(null);

    // Auto-scroll logs to bottom
    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    // Group shops by account (group_label or part of nickname)
    const storeGroups = useMemo(() => {
        const groups = {};
        (reputation || []).forEach(s => {
            const key = s.group_label || 'Other';
            if (!groups[key]) groups[key] = [];
            groups[key].push(s);
        });
        return groups;
    }, [reputation]);

    const groupNames = Object.keys(storeGroups);

    // Set default active shop if none selected
    useEffect(() => {
        if (!activeShop && groupNames.length > 0) {
            const dajie = groupNames.find(n => n.includes('大姐'));
            setActiveShop(dajie || groupNames[0]);
        }
    }, [groupNames, activeShop, setActiveShop]);

    // Filtered groups
    const filteredGroups = useMemo(() => {
        return groupNames.filter(name => {
            const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchesSearch) return false;
            
            if (statusFilter === 'all') return true;
            const hasAbnormal = storeGroups[name].some(s => s.status !== 'green' || s.is_suspended);
            return statusFilter === 'abnormal' ? hasAbnormal : !hasAbnormal;
        });
    }, [groupNames, searchQuery, statusFilter, storeGroups]);

    const activeShopSites = activeShop ? (storeGroups[activeShop] || []) : (storeGroups[groupNames[0]] || []);

    const handleCellEnter = (e, siteCode, storeName, siteData) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setHoveredPos({ x: rect.right + 10, y: rect.top });
        setHoveredCell({ site: siteCode, storeName, data: siteData });
    };

    const handleCellLeave = () => setHoveredCell(null);

    const handleLogClick = (log) => {
        // Try to find the shop name in the message (e.g., "[警告] 大姐店-阿根廷站")
        const match = log.message.match(/\]\s+(.*?)-/);
        if (match && match[1]) {
            const groupName = match[1].trim();
            if (storeGroups[groupName]) {
                setActiveShop(groupName);
                // Flash the matrix for feedback
                const el = document.getElementById(`shop-row-${groupName}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('ring-2', 'ring-indigo-500', 'ring-offset-2');
                    setTimeout(() => el.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-2'), 2000);
                }
            }
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-hidden">
            <div className="flex items-start gap-6 h-full">
                {/* 左侧：监控核心区 */}
                <div className="flex-1 flex flex-col gap-4 h-full min-w-0">
                    {/* 1. 顶部监控状态条 */}
                    <div className="flex items-center justify-between px-5 py-2 rounded-3xl bg-white border border-slate-200 shadow-sm shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></div>
                            </div>
                            <span className="text-[11px] font-black text-indigo-700 uppercase tracking-widest">云帆 AI 实时守卫监控中</span>
                            <span className="text-[11px] text-slate-300">|</span>
                            <span className="text-[11px] text-slate-500 font-bold">已连接 {groupNames.length} 个店铺组 / {(reputation || []).length} 个站点</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-mono uppercase">Last Sync</span>
                            <span className="text-[10px] text-slate-700 font-black">{logs[0]?.timestamp ? new Date(logs[0].timestamp).toLocaleTimeString() : '--:--:--'}</span>
                        </div>
                    </div>

            {/* 店铺筛选与全局雷达矩阵 */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0 flex-[0_0_38%]">
                <div className="px-5 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${statusFilter === 'all' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-100'}`}
                        >全部 ({groupNames.length})</button>
                        <button 
                            onClick={() => setStatusFilter('abnormal')}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${statusFilter === 'abnormal' ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 'text-slate-500 hover:bg-slate-100'}`}
                        >异常 ({groupNames.filter(n => storeGroups[n].some(s => s.status !== 'green' || s.is_suspended)).length})</button>
                    </div>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="搜索..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-48 pl-8 pr-4 py-1.5 rounded-xl bg-white border border-slate-200 text-[10px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                        <Icon name="search" className="absolute left-3 top-2 w-3 h-3 text-slate-400" />
                    </div>
                </div>

                <div className="p-4 flex flex-col flex-1 min-h-0">
                    <div className="grid grid-cols-[160px_1fr] gap-4 mb-2 text-[9px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-100 pb-1 shrink-0">
                        <div>店铺分组</div>
                        <div className="grid grid-cols-6 gap-2 text-center">
                            {SITE_COLS.map(c => <div key={c.code}>{c.flag} {c.name}</div>)}
                        </div>
                    </div>

                    <div className="space-y-1 flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                        {filteredGroups.map(name => {
                            const isSelected = activeShop === name || (!activeShop && name === groupNames[0]);
                            const sites = storeGroups[name];
                            return (
                                <div 
                                    key={name}
                                    id={`shop-row-${name}`}
                                    onClick={() => setActiveShop(name)}
                                    className={`grid grid-cols-[160px_1fr] gap-4 p-3 rounded-2xl cursor-pointer transition-all group ${isSelected ? 'bg-indigo-50 border border-indigo-100 shadow-sm' : 'hover:bg-slate-50 border border-transparent'}`}
                                >
                                    <div className="flex flex-col justify-center">
                                        <span className={`text-[12px] font-black truncate ${isSelected ? 'text-indigo-600' : 'text-slate-700'}`}>{name}</span>
                                        {isSelected && <span className="text-[8px] font-black text-indigo-400 uppercase mt-0.5 tracking-tighter">Selected ▸</span>}
                                    </div>
                                    <div className="grid grid-cols-6 gap-2">
                                        {SITE_COLS.map(col => {
                                            const siteData = sites.find(s => s.site === col.code);
                                            if (!siteData) return <div key={col.code} className="flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-slate-100"></div></div>;
                                            const meta = STATUS_META[siteData.status] || STATUS_META.green;
                                            return (
                                                <div 
                                                    key={col.code} 
                                                    className="flex items-center justify-center relative"
                                                    onMouseEnter={(e) => handleCellEnter(e, col.code, name, siteData)}
                                                    onMouseLeave={handleCellLeave}
                                                >
                                                    <div className={`w-3 h-3 rounded-full ${meta.dot} ${meta.pulse} shadow-sm border border-white`}></div>
                                                    {(siteData.new_claims > 0 || siteData.new_violations > 0) && (
                                                        <div className="absolute -top-1.5 -right-1 bg-rose-500 text-white text-[7px] font-black px-1 rounded-full border border-white">
                                                            +{(siteData.new_claims || 0) + (siteData.new_violations || 0)}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

                    {/* 3. 站点详情卡片 */}
                    <div className="flex-1 flex flex-col gap-2 min-h-0">
                        <div className="flex items-center justify-between px-2 shrink-0">
                            <div className="flex items-center gap-2">
                                <Icon name="layout" className="w-4 h-4 text-indigo-500" />
                                <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{activeShop || '大姐店'} · 站点异常明细</h3>
                            </div>
                        </div>
                    <div className="grid grid-cols-3 gap-3 flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0">
                        {SITE_COLS.map(col => {
                            const siteData = activeShopSites.find(s => s.site === col.code);
                            const meta = siteData ? STATUS_META[siteData.status] : null;
                            return (
                                <div key={col.code} className={`p-3 rounded-2xl border transition-all ${siteData ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50/50 border-dashed border-slate-200 opacity-60'}`}>
                                    <div className="flex items-center justify-between mb-3 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">{col.flag}</span>
                                            <div className="flex flex-col">
                                                <span className="text-[12px] font-black text-slate-800">{col.name}</span>
                                                {siteData?.alert_date && <span className="text-[7px] text-slate-400 font-bold uppercase tracking-tighter">Sync: {siteData.alert_date}</span>}
                                            </div>
                                        </div>
                                        {siteData?.is_suspended && <span className="px-1 py-0.5 rounded-lg bg-rose-50 text-rose-500 text-[8px] font-black uppercase">Suspended</span>}
                                    </div>

                                    {siteData ? (
                                        <div className="space-y-2.5">
                                            <div className="grid grid-cols-3 gap-1">
                                                <div className="flex flex-col items-center p-1 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                                                    <p className="text-[9px] font-black text-indigo-500/80 uppercase mb-0.5 tracking-tight">投诉率</p>
                                                    <div className="flex items-center gap-0.5">
                                                        <p className={`text-[14px] font-black ${getMetricColor(siteData.reclamos, siteData.status, siteData.new_claims)}`}>{siteData.reclamos}</p>
                                                        {siteData.new_claims > 0 && <span className="text-rose-500 text-[8px] font-black animate-pulse">+{siteData.new_claims}</span>}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center p-1 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                                                    <p className="text-[9px] font-black text-slate-500/80 uppercase mb-0.5 tracking-tight">延误率</p>
                                                    <div className="flex items-center gap-0.5">
                                                        <p className={`text-[14px] font-black ${getMetricColor(siteData.despacho, siteData.status, siteData.new_delayed)}`}>{siteData.despacho}</p>
                                                        {siteData.new_delayed > 0 && <span className="text-amber-500"><Icon name="alert-triangle" className="w-2.5 h-2.5" /></span>}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center p-1 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                                                    <p className="text-[9px] font-black text-slate-500/80 uppercase mb-0.5 tracking-tight">取消率</p>
                                                    <p className={`text-[14px] font-black ${getMetricColor(siteData.cancel, siteData.status, siteData.new_cancel)}`}>{siteData.cancel || '0.00%'}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-100">
                                                <div className="flex flex-col items-center">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[9px] font-black text-indigo-500/80 uppercase tracking-tight">官方信用</span>
                                                        {siteData.status === 'red' && siteData.claims_history === 'Healthy' && (
                                                            <span className="text-[6px] bg-amber-100 text-amber-600 px-0.5 rounded-sm font-black animate-pulse">Lag</span>
                                                        )}
                                                    </div>
                                                    <span className={`text-[10px] font-black ${siteData.claims_history === 'Healthy' ? 'text-emerald-500' : 'text-amber-500'}`}>{siteData.claims_history || '正常'}</span>
                                                </div>
                                                <div className="flex flex-col items-center border-l border-r border-slate-100 px-0.5">
                                                    <span className="text-[9px] font-black text-slate-500/80 uppercase tracking-tight">今日违规</span>
                                                    <span className={`text-[10px] font-black ${siteData.new_violations > 0 ? 'text-rose-500' : 'text-slate-300'}`}>+{siteData.new_violations || 0}</span>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[9px] font-black text-slate-500/80 uppercase tracking-tight">未读消息</span>
                                                    <span className={`text-[10px] font-black ${siteData.new_messages > 0 ? 'text-indigo-500' : 'text-slate-300'}`}>+{siteData.new_messages || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-6 flex flex-col items-center justify-center text-slate-200">
                                            <span className="text-lg mb-1">—</span>
                                            <span className="text-[8px] font-bold uppercase">未开通</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                </div>

                {/* 右侧：实时日志 (全高对齐) */}
                <div className="w-[320px] self-stretch flex flex-col h-full min-h-0">
                    <div className="bg-slate-50/80 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/60 shadow-inner flex flex-col h-full min-h-0">
                        <div className="flex items-center justify-between mb-4 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                            <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest">实时守卫日志</h3>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100 shadow-sm">LIVE FEED</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-0">
                        {logs.map((log, i) => {
                            const date = new Date(log.timestamp);
                            const isRecent = Date.now() - date.getTime() < 300000; // 5分钟内
                            
                            return (
                                <div 
                                    key={log.id || i} 
                                    onClick={() => handleLogClick(log)}
                                    className={`relative p-3 rounded-2xl border transition-all cursor-pointer group/log ${
                                        log.level === 'error' ? 'bg-rose-50/50 border-rose-200 hover:bg-rose-50' : 
                                        log.level === 'warning' ? 'bg-amber-50/50 border-amber-200 hover:bg-amber-50' : 
                                        'bg-white border-slate-200 hover:border-indigo-300 shadow-sm'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${
                                                log.level === 'error' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 
                                                log.level === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                                            }`}></div>
                                            <span className={`text-[10px] font-black uppercase tracking-tighter ${
                                                log.level === 'error' ? 'text-rose-600' : 
                                                log.level === 'warning' ? 'text-amber-600' : 'text-emerald-600'
                                            }`}>
                                                {log.level === 'error' ? '严重警告' : log.level === 'warning' ? '实时警告' : '系统通知'}
                                            </span>
                                        </div>
                                        <span className="text-[8px] font-mono text-slate-400">
                                            {isRecent ? '刚刚' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-700 leading-snug">{log.message}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        {log.site_id && (
                                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[8px] font-black text-slate-500 uppercase tracking-tighter">
                                                {log.site_id === 'MLM' ? '墨西哥站' : 
                                                 log.site_id === 'MLB' ? '巴西站' : 
                                                 log.site_id === 'MLA' ? '阿根廷站' : 
                                                 log.site_id === 'MCO' ? '哥伦比亚站' : 
                                                 log.site_id === 'MLC' ? '智利站' : 
                                                 log.site_id === 'MLU' ? '乌拉圭站' : log.site_id}
                                            </span>
                                        )}
                                        <span className="text-[7px] text-indigo-400 opacity-0 group-hover/log:opacity-100 transition-opacity font-bold uppercase">定位站点 ▸</span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={logEndRef} />
                        {logs.length === 0 && <div className="text-center py-10 text-slate-400 text-[10px]">等待日志接入...</div>}
                    </div>

                    <button className="mt-4 w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[9px] font-black text-slate-500 uppercase tracking-widest transition-all shadow-sm shrink-0">
                        查看完整历史
                    </button>
                </div>
            </div>
        </div>

        {hoveredCell && createPortal((
            <Tooltip
                data={hoveredCell.data}
                storeName={hoveredCell.storeName}
                site={hoveredCell.site}
                position={hoveredPos}
                onClose={handleCellLeave}
            />
        ), document.body)}
    </div>
);
};

export default ShopReputationView;

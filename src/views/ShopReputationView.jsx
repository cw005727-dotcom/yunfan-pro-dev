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

const OFFICIAL_META = {
    '5_green': { ring: 'border-emerald-500', bg: 'bg-emerald-500', label: '深绿' },
    '4_light_green': { ring: 'border-lime-400', bg: 'bg-lime-400', label: '浅绿' },
    '3_yellow': { ring: 'border-amber-400', bg: 'bg-amber-400', label: '黄色' },
    '2_orange': { ring: 'border-orange-400', bg: 'bg-orange-400', label: '橙色' },
    '1_red': { ring: 'border-rose-500', bg: 'bg-rose-500', label: '红色' },
};

const getOfficialMeta = (level) => OFFICIAL_META[level] || OFFICIAL_META['5_green'];

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
    const offMeta = getOfficialMeta(data.reputation_level);

    return (
        <div
            className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in zoom-in-95 duration-200"
            style={{ 
                left: position.x > window.innerWidth - 250 ? position.x - 260 : position.x, 
                top: position.y > window.innerHeight - 200 ? position.y - 150 : position.y, 
                minWidth: '240px' 
            }}
            onMouseLeave={onClose}
        >
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <span className="text-xl">{siteInfo.flag}</span>
                <div className="flex-1">
                    <p className="text-[12px] font-black text-slate-800">{storeName}</p>
                    <p className="text-[11px] text-slate-500 font-bold">{siteInfo.name}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-black text-slate-500 uppercase">官方信誉</span>
                    <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${offMeta.bg}`}></div>
                        <span className="text-[11px] font-black text-slate-700">{offMeta.label}</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1 border-l border-slate-100 pl-2">
                    <span className="text-[11px] font-black text-slate-500 uppercase">系统判定</span>
                    <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${meta.dot} ${meta.pulse}`}></div>
                        <span className={`text-[11px] font-black ${meta.text}`}>{statusLabel}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                    <div className={`flex flex-col items-center gap-1 p-2 rounded-xl ${parseFloat(data.reclamos) > 0 || data.new_claims > 0 ? 'bg-rose-50' : 'bg-slate-50'}`}>
                        <p className="text-[11px] text-slate-500 font-bold">投诉率</p>
                        <p className={`text-sm font-black ${getMetricColor(data.reclamos, data.status, data.new_claims)}`}>{data.reclamos}</p>
                    </div>
                    <div className={`flex flex-col items-center gap-1 p-2 rounded-xl ${parseFloat(data.despacho) > 0 || data.new_delayed > 0 ? 'bg-amber-50' : 'bg-slate-50'}`}>
                        <p className="text-[11px] text-slate-500 font-bold">延误率</p>
                        <p className={`text-sm font-black ${getMetricColor(data.despacho, data.status, data.new_delayed)}`}>{data.despacho}</p>
                    </div>
                    <div className={`flex flex-col items-center gap-1 p-2 rounded-xl ${parseFloat(data.cancel) > 0 || data.new_cancel > 0 ? 'bg-purple-50' : 'bg-slate-50'}`}>
                        <p className="text-[11px] text-slate-500 font-bold">取消率</p>
                        <p className={`text-sm font-black ${getMetricColor(data.cancel, data.status, data.new_cancel)}`}>{data.cancel || '0.00%'}</p>
                    </div>
                </div>

                {(data.new_claims > 0 || data.new_violations > 0) && (
                    <div className="pt-2 border-t border-dashed border-slate-100">
                        <p className="text-[11px] font-black text-slate-500 uppercase mb-2">今日紧急待办</p>
                        <div className="space-y-1.5">
                            {data.new_claims > 0 && (
                                <div className="flex justify-between items-center px-2 py-1 rounded-lg bg-rose-50 border border-rose-100">
                                    <span className="text-[11px] font-bold text-rose-600 whitespace-nowrap">🚨 新增投诉纠纷</span>
                                    <span className="text-[11px] font-black text-rose-600">+{data.new_claims}</span>
                                </div>
                            )}
                            {data.new_violations > 0 && (
                                <div className="flex justify-between items-center px-2 py-1 rounded-lg bg-amber-50 border border-amber-100">
                                    <span className="text-[11px] font-bold text-amber-600">⚠️ 新增违规处罚</span>
                                    <span className="text-[11px] font-black text-amber-600">+{data.new_violations}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ShopReputationView = () => {
    const { reputation, loading: shopsLoading } = useReputation();
    const { logs } = useMonitoringLogs(5); // Keep a few logs for the sync timestamp
    const { activeShop, setActiveShop } = useAppContext();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, abnormal, healthy
    const [hoveredCell, setHoveredCell] = useState(null);
    const [hoveredPos, setHoveredPos] = useState({ x: 0, y: 0 });

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

    return (
        <div className="h-full overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col lg:flex-row items-start gap-6 h-full">
                {/* 监控核心区 (Full Width) */}
                <div className="flex-1 flex flex-col gap-4 h-full min-w-0 w-full">
                    {/* 1. 顶部监控状态条 */}
                    <div className="flex items-center justify-between px-5 py-2 rounded-3xl bg-white border border-slate-200 shadow-sm shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></div>
                            </div>
                            <span className="text-[11px] font-black text-indigo-700 uppercase tracking-widest">云帆 AI 实时守卫监控中</span>
                            <span className="text-[11px] text-slate-500">|</span>
                            <span className="text-[11px] text-slate-500 font-bold">已连接 {groupNames.length} 个店铺组 / {(reputation || []).length} 个站点</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-500 font-mono uppercase">Last Sync</span>
                            <span className="text-[11px] text-slate-700 font-black">{logs[0]?.timestamp ? new Date(logs[0].timestamp).toLocaleTimeString() : '--:--:--'}</span>
                        </div>
                    </div>

            {/* 店铺筛选与全局雷达矩阵 */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0 flex-[0_0_38%]">
                <div className="px-5 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${statusFilter === 'all' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-100'}`}
                        >全部 ({groupNames.length})</button>
                        <button 
                            onClick={() => setStatusFilter('abnormal')}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${statusFilter === 'abnormal' ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 'text-slate-500 hover:bg-slate-100'}`}
                        >异常 ({groupNames.filter(n => storeGroups[n].some(s => s.status !== 'green' || s.is_suspended)).length})</button>
                    </div>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="搜索..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-48 pl-8 pr-4 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                        <Icon name="search" className="absolute left-3 top-2 w-3 h-3 text-slate-500" />
                    </div>
                </div>

                <div className="p-4 flex flex-col flex-1 min-h-0 overflow-x-auto no-scrollbar">
                    <div className="min-w-[600px] flex-1 flex flex-col">
                        <div className="grid grid-cols-[160px_1fr] gap-4 mb-2 text-[11px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-100 pb-1 shrink-0">
                            <div className="whitespace-nowrap">店铺分组</div>
                            <div className="grid grid-cols-6 gap-2 text-center">
                                {SITE_COLS.map(c => <div key={c.code} className="whitespace-nowrap">{c.flag} {c.name}</div>)}
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
                                            {isSelected && <span className="text-[11px] font-black text-indigo-400 uppercase mt-0.5 tracking-tighter">Selected ▸</span>}
                                        </div>
                                        <div className="grid grid-cols-6 gap-2">
                                        {SITE_COLS.map(col => {
                                            const siteData = sites.find(s => s.site === col.code);
                                            if (!siteData) return <div key={col.code} className="flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-slate-100"></div></div>;
                                            const meta = STATUS_META[siteData.status] || STATUS_META.green;
                                            const offMeta = getOfficialMeta(siteData.reputation_level);
                                            return (
                                                <div 
                                                    key={col.code} 
                                                    className="flex items-center justify-center relative"
                                                    onMouseEnter={(e) => handleCellEnter(e, col.code, name, siteData)}
                                                    onMouseLeave={handleCellLeave}
                                                >
                                                    {/* 双重状态指示器：外圈代表官方，内点代表系统判定 */}
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${offMeta.ring} bg-white/50`}>
                                                        <div className={`w-2 h-2 rounded-full ${meta.dot} ${meta.pulse} shadow-sm`}></div>
                                                    </div>
                                                    
                                                    {(siteData.new_claims > 0 || siteData.new_violations > 0) && (
                                                        <div className="absolute -top-1.5 -right-1 bg-rose-500 text-white text-[11px] font-black px-1 rounded-full border border-white">
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
                                                {siteData?.last_updated && <span className="text-[11px] text-slate-500 font-bold uppercase tracking-tighter">刷新 {siteData.last_updated.slice(11, 16)}</span>}
                                            </div>
                                        </div>
                                        {siteData?.is_suspended && <span className="px-1 py-0.5 rounded-lg bg-rose-50 text-rose-500 text-[11px] font-black uppercase">Suspended</span>}
                                    </div>

                                    {siteData ? (
                                        <div className="space-y-2.5">
                                            <div className="grid grid-cols-3 gap-1">
                                                <div className="flex flex-col items-center p-1 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                                                    <p className="text-[11px] font-black text-indigo-500/80 uppercase mb-0.5 tracking-tight">投诉率</p>
                                                    <div className="flex items-center gap-0.5">
                                                        <p className={`text-[14px] font-black ${getMetricColor(siteData.reclamos, siteData.status, siteData.new_claims)}`}>{siteData.reclamos}</p>
                                                        {siteData.new_claims > 0 && <span className="text-rose-500 text-[11px] font-black animate-pulse">+{siteData.new_claims}</span>}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center p-1 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                                                    <p className="text-[11px] font-black text-slate-500/80 uppercase mb-0.5 tracking-tight">延误率</p>
                                                    <div className="flex items-center gap-0.5">
                                                        <p className={`text-[14px] font-black ${getMetricColor(siteData.despacho, siteData.status, siteData.new_delayed)}`}>{siteData.despacho}</p>
                                                        {siteData.new_delayed > 0 && <span className="text-amber-500"><Icon name="alert-triangle" className="w-2.5 h-2.5" /></span>}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center p-1 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                                                    <p className="text-[11px] font-black text-slate-500/80 uppercase mb-0.5 tracking-tight">取消率</p>
                                                    <p className={`text-[14px] font-black ${getMetricColor(siteData.cancel, siteData.status, siteData.new_cancel)}`}>{siteData.cancel || '0.00%'}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-100">
                                                <div className="flex flex-col items-center">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[11px] font-black text-indigo-500/80 uppercase tracking-tight">官方信用</span>
                                                        <span className="text-[7px] px-1 bg-indigo-50 text-indigo-400 rounded font-black uppercase tracking-tighter">[ML官方]</span>
                                                        {siteData.status === 'red' && siteData.claims_history === 'Healthy' && (
                                                            <span className="text-[11px] whitespace-nowrap bg-amber-100 text-amber-600 px-0.5 rounded-sm font-black animate-pulse">Lag</span>
                                                        )}
                                                    </div>
                                                    <span className={`text-[11px] font-black ${siteData.claims_history === 'Healthy' ? 'text-emerald-500' : 'text-amber-500'}`}>{siteData.claims_history || '正常'}</span>
                                                </div>
                                                <div className="flex flex-col items-center border-l border-r border-slate-100 px-0.5">
                                                    <span className="text-[11px] font-black text-slate-500/80 uppercase tracking-tight">今日违规</span>
                                                    <span className={`text-[11px] font-black ${siteData.new_violations > 0 ? 'text-rose-500' : 'text-slate-500'}`}>+{siteData.new_violations || 0}</span>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[11px] font-black text-slate-500/80 uppercase tracking-tight">未读消息</span>
                                                    <span className={`text-[11px] font-black ${siteData.new_messages > 0 ? 'text-indigo-500' : 'text-slate-500'}`}>+{siteData.new_messages || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-6 flex flex-col items-center justify-center text-slate-500">
                                            <span className="text-lg mb-1">—</span>
                                            <span className="text-[11px] font-bold uppercase">未开通</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    </div>
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

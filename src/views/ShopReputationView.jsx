import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import { useReputation } from '../hooks/useReputation';
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
    green: { dot: 'bg-emerald-400' },
    yellow: { dot: 'bg-amber-400' },
    red: { dot: 'bg-rose-400', pulse: 'animate-pulse' },
};

// Strip site suffix from name to get the real store name (all names have -XX or -XXX suffix)
const getGroupKey = (s) => (s.name || s.account || '').replace(/-(MLB|MLM|MLA|MCO|MLC|MLU|MBT|CBT|MX|BR|AR|CO|CL|UY)$/i, '').trim();

const Tooltip = ({ data, storeName, site, position, onClose }) => {
    if (!data) return null;
    const siteInfo = SITE_COLS.find(c => c.code === site) || { flag: '🌐', name: site };
    const statusLabel = data.status === 'green' ? '健康' : data.status === 'yellow' ? '预警' : '危险';
    return (
        <div
            className="fixed z-50 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 animate-in fade-in zoom-in-95 duration-150"
            style={{ 
                left: position.x, 
                top: position.y,
                minWidth: '200px'
            }}
            onMouseLeave={onClose}
        >
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <span className="text-xl">{siteInfo.flag}</span>
                <div>
                    <p className="text-[12px] font-black text-slate-800">{storeName}</p>
                    <p className="text-[10px] text-slate-400">{siteInfo.name}</p>
                </div>
                <span className={`ml-auto px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    data.status === 'green' ? 'bg-emerald-100 text-emerald-600' :
                    data.status === 'yellow' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                }`}>{statusLabel}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-rose-50">
                    <p className="text-[8px] text-slate-400 font-bold">投诉率</p>
                    <p className="text-sm font-black text-rose-500">{data.reclamos}</p>
                    <p className="text-[8px] text-slate-400">{data.reclamos_v}单</p>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-amber-50">
                    <p className="text-[8px] text-slate-400 font-bold">延误率</p>
                    <p className="text-sm font-black text-amber-500">{data.despacho}</p>
                    <p className="text-[8px] text-slate-400">{data.despacho_v}单</p>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-purple-50">
                    <p className="text-[8px] text-slate-400 font-bold">取消率</p>
                    <p className="text-sm font-black text-purple-500">{data.cancel}</p>
                    <p className="text-[8px] text-slate-400">{data.cancel_v}单</p>
                </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[8px] text-slate-400">考核基数 {data.total_v} 单</span>
                <span className="text-[8px] text-slate-400">score {data.score}</span>
            </div>
        </div>
    );
};

const ShopReputationView = () => {
    const { activeShop, shopList } = useAppContext();
    const { reputation: shops, loading, error } = useReputation(activeShop);
    const [hoveredCell, setHoveredCell] = useState(null);
    const [hoveredPos, setHoveredPos] = useState({ x: 0, y: 0 });

    // Group shops by base store name (strip site suffix), but prefer group_label
    const storeGroups = {};
    shops.forEach(s => {
        // [过滤逻辑] 忽略总部的 CBT 虚拟站点，只展示具体国家的物理站点
        if (s.site === 'CBT') return;

        // Use group_label if available, otherwise fall back to name parsing
        const key = (s.group_label && s.group_label.trim()) ? s.group_label.trim() : getGroupKey(s);
        if (!storeGroups[key]) storeGroups[key] = {};
        
        // [修复逻辑] 处理同一站点多个子账号的情况 (如 MLM)
        // 如果该站点已有数据，优先保留“危险(red)”或“预警(yellow)”的数据，确保风险不被覆盖
        const existing = storeGroups[key][s.site];
        if (!existing || (s.status === 'red' && existing.status !== 'red') || (s.status === 'yellow' && existing.status === 'green')) {
            storeGroups[key][s.site] = s;
        }
    });

    const storeNames = Object.keys(storeGroups);

    // Compute per-store stats
    const storeStats = {};
    storeNames.forEach(name => {
        const siteMap = storeGroups[name];
        const statuses = Object.values(siteMap).map(s => s.status);
        const overall = statuses.includes('red') ? 'red' : statuses.includes('yellow') ? 'yellow' : 'green';
        const counts = {
            green: statuses.filter(s => s === 'green').length,
            yellow: statuses.filter(s => s === 'yellow').length,
            red: statuses.filter(s => s === 'red').length,
        };
        storeStats[name] = { overall, counts, siteMap };
    });

    // Sort: red first, then yellow, then green
    const sortedStores = [...storeNames].sort((a, b) => {
        const order = { red: 0, yellow: 1, green: 2 };
        return (order[storeStats[b]?.overall] || 3) - (order[storeStats[a]?.overall] || 3);
    });

    const totalGreen = shops.filter(s => s.status === 'green').length;
    const totalYellow = shops.filter(s => s.status === 'yellow').length;
    const totalRed = shops.filter(s => s.status === 'red').length;

    const handleCellHover = (e, storeName, site, cell) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setHoveredPos({
            x: rect.left,
            y: rect.bottom + 8,
        });
        setHoveredCell({ storeName, site, data: cell });
    };

    const handleCellLeave = () => setHoveredCell(null);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">拉取中...</span>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center h-64 text-rose-500 text-sm font-medium">
            数据加载失败：{error}
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">店铺声誉中心</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                        {shops.length} 个站点 · {sortedStores.length} 个店铺
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Group filter */}
                    <select
                      value={activeShop || ''}
                      onChange={e => { const v = e.target.value; setActiveShop(v || null); }}
                      className="text-[10px] font-black rounded-xl px-3 py-2 border border-slate-200 shadow-sm bg-white"
                    >
                      <option value="">全部店铺</option>
                      {shopList.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="flex items-center gap-4 px-4 py-2.5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-[10px] font-black text-slate-600">{totalGreen} 健康</span>
                        </div>
                        <div className="w-px h-3 bg-slate-200" />
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                            <span className="text-[10px] font-black text-slate-600">{totalYellow} 预警</span>
                        </div>
                        <div className="w-px h-3 bg-slate-200" />
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-rose-400" />
                            <span className="text-[10px] font-black text-slate-600">{totalRed} 危险</span>
                        </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
            </div>

            {/* Matrix Table */}
            <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-xl">🏪</span>
                                            <span className="text-[10px] text-slate-600 font-bold normal-case tracking-normal">店铺</span>
                                        </div>
                                    </th>
                                {SITE_COLS.map(site => (
                                    <th key={site.code} className="px-3 py-4 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-xl">{site.flag}</span>
                                            <span className="text-[10px] text-slate-600 font-bold normal-case tracking-normal">{site.name}</span>
                                        </div>
                                    </th>
                                ))}
                                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">汇总</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedStores.map((storeName, ai) => {
                                const stats = storeStats[storeName];
                                const overallMeta = {
                                    green: { badge: 'bg-emerald-100 text-emerald-600', label: '优质' },
                                    yellow: { badge: 'bg-amber-100 text-amber-600', label: '预警' },
                                    red: { badge: 'bg-rose-100 text-rose-600', label: '危险' },
                                }[stats.overall];
                                return (
                                    <tr key={storeName} className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors">
                                        <td className="px-6 py-4 text-center">
                                            <p className="text-[16px] font-black text-slate-800 leading-tight">{storeName}</p>
                                        </td>
                                        {SITE_COLS.map(site => {
                                            const cell = stats.siteMap[site.code];
                                            const meta = cell ? STATUS_META[cell.status] : null;
                                            const isHovered = hoveredCell?.storeName === storeName && hoveredCell?.site === site.code;
                                            return (
                                                <td key={site.code} className="px-3 py-4 text-center">
                                                    {cell ? (
                                                        <div
                                                            onMouseEnter={(e) => handleCellHover(e, storeName, site.code, cell)}
                                                            onMouseLeave={handleCellLeave}
                                                            className={`w-10 h-10 rounded-2xl flex items-center justify-center mx-auto cursor-pointer transition-all duration-150 border-2
                                                                ${isHovered ? 'border-slate-400 shadow-md scale-110' : 'border-transparent hover:border-slate-200 hover:scale-105'}
                                                                ${meta?.pulse ? 'animate-pulse' : ''}`}
                                                            style={{
                                                                background: cell.status === 'green' ? '#d1fae5' : cell.status === 'yellow' ? '#fef3c7' : '#ffe4e6',
                                                            }}
                                                        >
                                                            <div className={`w-4 h-4 rounded-full ${meta?.dot}`} />
                                                        </div>
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto bg-slate-50/60">
                                                            <span className="text-slate-300 text-sm font-black">—</span>
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-[11px] font-black text-slate-500">
                                                {stats.counts.green} 🟢 · {stats.counts.yellow} 🟡 · {stats.counts.red} 🔴
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {sortedStores.length === 0 && (
                        <div className="py-16 text-center text-slate-400 text-sm">暂无店铺数据</div>
                    )}
                </div>
            </div>

            <p className="text-center text-[9px] text-slate-300 font-medium">悬停彩点查看详细指标</p>

            {hoveredCell && (
                <Tooltip
                    data={hoveredCell.data}
                    storeName={hoveredCell.storeName}
                    site={hoveredCell.site}
                    position={hoveredPos}
                    onClose={handleCellLeave}
                />
            )}
        </div>
    );
};

export default ShopReputationView;

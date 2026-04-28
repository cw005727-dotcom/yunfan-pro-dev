import { useState, useEffect } from 'react';
import Icon from '../components/Icon.jsx';
import ListingEditModal from './ListingEditModal.jsx';
import { useProductPerformance } from '../hooks/useProductPerformance';
import { useSmartRotation } from '../hooks/useSmartRotation';

const SmartRotationCard = ({ site, onRotated }) => {
    const { recommendation, loading, isApplying, applyRotation } = useSmartRotation(site === 'all' ? 'MLM' : site);
    
    if (loading || !recommendation || !recommendation.remove_item) return null;

    return (
        <div className="mb-6 p-4 rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
            
            <div className="relative flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md">
                            <Icon name="zap" className="w-4 h-4 text-amber-300" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-white/90">智能轮替建议</h3>
                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-bold uppercase tracking-tighter">AI Optimized</span>
                    </div>
                    
                    <p className="text-sm font-medium leading-relaxed mb-4 text-white/80 italic">
                        "{recommendation.reason}"
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                            <div className="text-[10px] text-white/60 mb-1 uppercase font-black">建议下架</div>
                            <div className="text-xs font-bold truncate">{recommendation.remove_item.name}</div>
                            <div className="text-[10px] text-rose-300 font-bold mt-1">曝光转化率过低</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                            <div className="text-[10px] text-white/60 mb-1 uppercase font-black">建议上架</div>
                            <div className="text-xs font-bold truncate">{recommendation.add_item.name}</div>
                            <div className="text-[10px] text-emerald-300 font-bold mt-1">趋势热度潜力极大</div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 min-w-[160px]">
                    <div className="text-[10px] text-white/60 mb-1 uppercase font-black">预估增益</div>
                    <div className="text-3xl font-black text-amber-300 mb-4 tracking-tighter">
                        {recommendation.estimated_gain || '+18.5%'}
                    </div>
                    <button 
                        onClick={async () => {
                            const ok = await applyRotation();
                            if (ok) onRotated();
                        }}
                        disabled={isApplying}
                        className="w-full py-2.5 px-4 rounded-xl bg-white text-blue-600 text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                        {isApplying ? '执行中...' : '立即执行'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const TABS = [
    { key: 'new',      label: '上新关注',  suffix: '🆕' },
    { key: 'hot',      label: '潜力爆款',  suffix: '🔥' },
    { key: 'cart',     label: '已售商品',  suffix: '⚡' },
    { key: 'risk',     label: '风险产品',  suffix: '⚠️' },
    { key: 'inactive', label: '无效商品',  suffix: '💤' },
    { key: 'all',      label: '全部商品',  suffix: '🌐' },
];

const SITE_TABS = [
    { key: 'all', label: '全部',      flag: '🌐' },
    { key: 'MLM', label: '🇲🇽 墨西哥', flag: '🇲🇽' },
    { key: 'MLB', label: '🇧🇷 巴西',   flag: '🇧🇷' },
    { key: 'MLA', label: '🇦🇷 阿根廷', flag: '🇦🇷' },
    { key: 'MCO', label: '🇨🇴 哥伦比亚',flag: '🇨🇴' },
];


const fmt = (n) => {
    if (!n && n !== 0) return '—';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
};

const fmtPct = (v) => `${((v || 0) * 100).toFixed(1)}%`;

const fmtDate = (iso) => {
    if (!iso) return null;
    try {
        const d = new Date(iso);
        return `${d.getMonth()+1}/${d.getDate()}`;
    } catch { return null; }
};

const healthCls = (s) => {
    const n = Number(s || 0);
    if (n >= 80) return { cls: 'bg-emerald-50 border border-emerald-200 text-emerald-600', dot: 'bg-emerald-400' };
    if (n >= 60) return { cls: 'bg-amber-50 border border-amber-200 text-amber-600', dot: 'bg-amber-400' };
    return          { cls: 'bg-rose-50 border border-rose-200 text-rose-500', dot: 'bg-rose-400' };
};

const ProductPerformanceView = () => {
    const [activeTab, setActiveTab] = useState('new');
    const [activeSite, setActiveSite] = useState('all');
    const { products: allItems, summary, loading: isLoading, refresh: refreshPerf } = useProductPerformance(activeSite);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [imgErrors, setImgErrors] = useState({});

    const avg = {
        exp:    allItems.length ? allItems.reduce((s,i) => s+(i.exposure||0), 0) / allItems.length : 0,
        clicks: allItems.length ? allItems.reduce((s,i) => s+(i.clicks||0), 0) / allItems.length : 0,
        returns:allItems.length ? allItems.reduce((s,i) => s+(i.returns||0), 0) / allItems.length : 0,
    };

    const categorized = {
        new:      allItems.filter(d => (d.days_listed || 0) <= 15)
                         .sort((a,b) => (b.days_listed||0) - (a.days_listed||0)),
        hot:      allItems.filter(d => {
                         const c = [d.exposure>=avg.exp, d.clicks>=avg.clicks, d.carts>0];
                         return c.filter(Boolean).length >= 2;
                     }).sort((a,b) => (b.cart_rate||0) - (a.cart_rate||0)),
        cart:     [...allItems].sort((a,b) => (b.cart_rate||0) - (a.cart_rate||0)).slice(0,5),
        risk:     allItems.filter(d => {
                         const ss = d.sub_status ? JSON.parse(d.sub_status) : [];
                         return (d.claims||0)>0 || (d.returns||0)>avg.returns || ss.includes('bpp_report') || ss.includes('forbidden') || d.status === 'under_review';
                     }).sort((a,b) => ((b.claims||0)+(b.returns||0)) - ((a.claims||0)+(a.returns||0))),
        inactive: allItems.filter(d => (d.days_listed||0)>30 && (d.exposure||0)<avg.exp && (d.carts||0)===0)
                         .sort((a,b) => (b.days_listed||0) - (a.days_listed||0)),
        all:      [...allItems].sort((a,b) => (b.exposure||0) - (a.exposure||0)),
    };

    const filtered = activeSite === 'all'
        ? categorized[activeTab]
        : categorized[activeTab].filter(i => i.site_id === activeSite);

    const thumbs = (key) => categorized[key].slice(0,3).map(d => ({ url: d.image_url, id: d.item_id }));

    const totalExp    = summary?.total_exposure || allItems.reduce((s,i) => s+(i.exposure||0), 0);
    const totalCarts  = summary?.total_carts || allItems.reduce((s,i) => s+(i.carts||0), 0);
    const totalClicks = summary?.total_clicks || allItems.reduce((s,i) => s+(i.clicks||0), 0);
    const avgHealth   = allItems.length ? Math.round(allItems.reduce((s,i) => s+(i.health_score||0), 0) / allItems.length) : 0;

    const Row = ({ item, idx }) => {
        const h = healthCls(item.health_score);
        const pi = Number(item.price_index || 0);
        const piCls = pi >= 1 ? 'text-emerald-500' : pi >= 0.9 ? 'text-amber-500' : 'text-rose-500';
        const rank = idx + 1;
        return (
            <div 
                onClick={() => { setSelectedItem(item); setIsEditOpen(true); }}
                className="grid grid-cols-12 gap-2 items-center px-4 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/40 transition-colors cursor-pointer group"
            >
                <div className="col-span-1 flex items-center justify-center gap-1.5">
                    <span className={`text-[12px] font-black w-5 text-center ${rank<=3?'text-amber-400':idx<10?'text-slate-300':'text-slate-300'}`}>{rank}</span>
                    {item.is_core === 1 && <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" title="核心商品"></div>}
                </div>
                <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        {item.image_url && !imgErrors[item.item_id] ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover"
                                onError={() => setImgErrors(p => ({...p, [item.item_id]: true}))} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Icon name="package" className="w-4 h-4 text-slate-200" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-bold text-slate-700 truncate group-hover:text-indigo-500 transition-colors">{item.name}</p>
                        {item.start_time && <p className="text-[9px] text-slate-300">{fmtDate(item.start_time)} 上架</p>}
                    </div>
                </div>
                <div className="col-span-1 text-center">
                    <span className="text-[12px] font-black text-slate-400">{item.site_id}</span>
                </div>
                <div className="col-span-1 text-center">
                    <span className="text-[12px] font-black text-slate-500 tabular-nums">{item.days_listed ?? '—'}d</span>
                </div>
                <div className="col-span-1 text-center">
                    <span className="text-[12px] font-black text-slate-600 tabular-nums">{fmt(item.exposure)}</span>
                </div>
                <div className="col-span-1 text-center">
                    <span className="text-[12px] font-black text-slate-600 tabular-nums">{fmt(item.clicks)}</span>
                </div>
                <div className="col-span-1 text-center">
                    <span className="text-[12px] font-black text-violet-500 tabular-nums">{fmtPct(item.cart_rate)}</span>
                </div>
                <div className="col-span-1 flex items-center justify-center">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[12px] font-black ${h.cls}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${h.dot}`}></div>
                        {item.health_score}
                    </div>
                </div>
                <div className="col-span-1 text-center">
                    <span className={`text-[12px] font-black tabular-nums ${piCls}`}>
                        {pi > 0 ? `${pi.toFixed(2)}x` : '—'}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-[26px] font-black text-slate-800 tracking-tight">商品性能表</h3>

                </div>
                <div className="flex items-center gap-2 mt-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-[10px] text-slate-400 font-medium">实时更新</span>
                </div>
            </div>

            {/* Site Filter */}
            <div className="flex items-center gap-2 flex-wrap">
                {[
                    { key: 'all', label: '🌐 全部' },
                    { key: 'MLM', label: '🇲🇽 墨西哥' },
                    { key: 'MLB', label: '🇧🇷 巴西' },
                    { key: 'MLA', label: '🇦🇷 阿根廷' },
                    { key: 'MCO', label: '🇨🇴 哥伦比亚' },
                    { key: 'MX',  label: '🇲🇽 MX' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveSite(tab.key)}
                        className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                            activeSite === tab.key
                                ? 'bg-slate-800 text-white shadow-xl'
                                : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:shadow-md'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* 智能轮替建议 */}
            <SmartRotationCard site={activeSite} onRotated={refreshPerf} />

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            {/* KPI: Top 5 by exposure */}
            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Icon name="eye" className="w-4 h-4 text-indigo-400" />
                    <span className="text-[22px] font-black text-indigo-600 leading-none">总曝光</span>
                    <span className="ml-auto text-[22px] font-black text-indigo-700 leading-none">{fmt(totalExp)}</span>
                </div>
                <div className="hidden md:block space-y-2">
                    {[...allItems].sort((a,b) => (b.exposure||0)-(a.exposure||0)).slice(0,5).map((item, idx) => (
                        <div key={item.item_id} className="flex items-center gap-2">
                            <span className={`text-[10px] font-black w-4 text-right shrink-0 ${idx===0?'text-amber-400':idx===1?'text-slate-400':idx===2?'text-orange-400':'text-slate-300'}`}>{idx+1}</span>
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-indigo-200 shrink-0">
                                {item.image_url && !imgErrors[item.item_id] ? (
                                    <img src={item.image_url} alt="" className="w-full h-full object-cover"
                                        onError={() => setImgErrors(p=>({...p,[item.item_id]:true}))} />
                                ) : <Icon name="package" className="w-5 h-5 text-indigo-200 mx-auto mt-2.5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-mono font-black text-indigo-600 truncate">{item.item_id}</p>
                                <p className="text-[9px] text-indigo-400">{item.start_time ? `${fmtDate(item.start_time)} 上架` : (item.last_updated ? `${fmtDate(item.last_updated.split(' ')[0])} 同步` : '待同步')}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-[12px] font-black text-indigo-600 tabular-nums">{fmt(item.exposure)}</p>
                                <p className="text-[9px] text-indigo-400">{fmt(item.clicks)}点击 · {fmt(item.carts)}加车</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* KPI: Top 5 by carts */}
            <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-violet-100 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Icon name="shopping-cart" className="w-4 h-4 text-violet-400" />
                    <span className="text-[22px] font-black text-violet-600 leading-none">总加车</span>
                    <span className="ml-auto text-[22px] font-black text-violet-700 leading-none">{fmt(totalCarts)}</span>
                </div>
                <div className="hidden md:block space-y-2">
                    {[...allItems].sort((a,b) => (b.carts||0)-(a.carts||0)).slice(0,5).map((item, idx) => (
                        <div key={item.item_id} className="flex items-center gap-2">
                            <span className={`text-[10px] font-black w-4 text-right shrink-0 ${idx===0?'text-amber-400':idx===1?'text-slate-400':idx===2?'text-orange-400':'text-slate-300'}`}>{idx+1}</span>
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-violet-200 shrink-0">
                                {item.image_url && !imgErrors[item.item_id] ? (
                                    <img src={item.image_url} alt="" className="w-full h-full object-cover"
                                        onError={() => setImgErrors(p=>({...p,[item.item_id]:true}))} />
                                ) : <Icon name="package" className="w-5 h-5 text-violet-200 mx-auto mt-2.5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-mono font-black text-violet-600 truncate">{item.item_id}</p>
                                <p className="text-[9px] text-violet-400">{item.start_time ? `${fmtDate(item.start_time)} 上架` : (item.last_updated ? `${fmtDate(item.last_updated.split(' ')[0])} 同步` : '待同步')}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-[12px] font-black text-violet-600 tabular-nums">{fmt(item.carts)}</p>
                                <p className="text-[9px] text-violet-400">{fmt(item.exposure)}曝光 · {fmt(item.clicks)}点击</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* KPI: Top 5 by clicks */}
            <div className="rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-100 to-orange-100 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Icon name="mouse-pointer-click" className="w-4 h-4 text-amber-600" />
                    <span className="text-[22px] font-black text-amber-700 leading-none">总点击</span>
                    <span className="ml-auto text-[22px] font-black text-amber-800 leading-none">{fmt(totalClicks)}</span>
                </div>
                <div className="hidden md:block space-y-2">
                    {[...allItems].sort((a,b)=>(b.clicks||0)-(a.clicks||0)).slice(0,5).map((item, idx) => (
                        <div key={item.item_id} className="flex items-center gap-2">
                            <span className={`text-[10px] font-black w-4 text-right shrink-0 ${idx===0?'text-amber-600':idx===1?'text-amber-400':idx===2?'text-orange-400':'text-amber-300'}`}>{idx+1}</span>
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-amber-300 shrink-0">
                                {item.image_url && !imgErrors[item.item_id] ? (
                                    <img src={item.image_url} alt="" className="w-full h-full object-cover"
                                        onError={()=>setImgErrors(p=>({...p,[item.item_id]:true}))} />
                                ) : <Icon name="package" className="w-5 h-5 text-amber-400 mx-auto mt-2.5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-mono font-black text-amber-700 truncate">{item.item_id}</p>
                                <p className="text-[9px] text-amber-500">{item.start_time ? `${fmtDate(item.start_time)} 上架` : '无上架时间'}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-[12px] font-black text-amber-700 tabular-nums">{fmt(item.clicks)}</p>
                                <p className="text-[9px] text-amber-500">{fmt(item.exposure)}曝光 · {fmt(item.carts)}加车</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto snap-x snap-mandatory -mx-1 px-1">
                {TABS.filter(t=>t.key!=='all').map(tab => {
                    const count = categorized[tab.key].length;
                    const ts = thumbs(tab.key);
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`relative flex items-center gap-2 pl-3 pr-4 py-3 rounded-2xl transition-all shrink-0 snap-start ${
                                isActive
                                    ? 'bg-slate-800 text-white shadow-xl shadow-slate-300/50'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-md'
                            }`}
                        >
                            {ts.length > 0 ? (
                                <div className="flex items-center gap-1.5">
                                    {ts.map((t,i) => (
                                        <div key={i} className={`w-8 h-8 rounded-xl overflow-hidden border-2 ${isActive?'border-slate-500':'border-slate-200'} bg-slate-100 shrink-0`}>
                                            {t.url && !imgErrors[t.id] ? (
                                                <img src={t.url} alt="" className="w-full h-full object-cover"
                                                    onError={() => setImgErrors(p => ({...p, [t.id]: true}))} />
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <span className={`text-[12px] ${isActive?'text-white/60':'text-slate-300'}`}>{tab.suffix}</span>
                            )}
                            <span className="text-[11px] font-black whitespace-nowrap">{tab.label}</span>
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-lg ml-auto ${isActive?'bg-white/20 text-white':'bg-slate-100 text-slate-400'}`}>{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* Category description */}
            <div className="px-1">
                {activeTab === 'new' && (
                    <p className="text-[10px] text-slate-500 font-medium">
                        <span className="text-emerald-600 font-black">🆕 上新关注</span>
                        <span className="mx-2 text-slate-300">·</span>
                        ≤15天上架，按上架时间倒序
                    </p>
                )}
                {activeTab === 'hot' && (
                    <p className="text-[10px] text-orange-500 font-medium">
                        <span className="text-orange-600 font-black">🔥 潜力爆款</span>
                        <span className="mx-2 text-orange-300">·</span>
                        曝光≥店均 | 点击≥店均 | 加车&gt;0（满足任意二项即入选），按加车率排序
                    </p>
                )}
                {activeTab === 'cart' && (
                    <p className="text-[10px] text-indigo-500 font-medium">
                        <span className="text-indigo-600 font-black">⚡ 已售商品</span>
                        <span className="mx-2 text-indigo-300">·</span>
                        单品加车率前5名，反映购买意向最强的商品
                    </p>
                )}
                {activeTab === 'risk' && (
                    <p className="text-[10px] text-rose-500 font-medium">
                        <span className="text-rose-600 font-black">⚠️ 风险/侵权产品</span>
                        <span className="mx-2 text-rose-300">·</span>
                        投诉&gt;0 | 退货&gt;均值 | 含有 BPP 侵权报告 | 状态为审核中 (Under Review)
                        {categorized.risk.length === 0 && <span className="ml-2 text-emerald-400">（当前无风险/侵权商品）</span>}
                    </p>
                )}
                {activeTab === 'inactive' && (
                    <p className="text-[10px] text-slate-400 font-medium">
                        <span className="text-slate-500 font-black">💤 无效商品</span>
                        <span className="mx-2 text-slate-300">·</span>
                        上架&gt;30天 + 曝光&lt;店均 + 加车=0
                        {categorized.inactive.length === 0 && <span className="ml-2 text-emerald-400">（暂无无效商品）</span>}
                    </p>
                )}

            </div>

            {/* Table header label */}
            <div className="flex items-center justify-between px-1">
                <p className="text-[10px] text-slate-400 font-black">
                    {TABS.find(t=>t.key===activeTab)?.suffix} {TABS.find(t=>t.key===activeTab)?.label}
                    <span className="ml-1 text-slate-300">·</span>
                    <span className="ml-1">{filtered.length}件商品</span>
                </p>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                    {['#','商品','站点','天数','曝光','点击','加车率','健康分','价格指数'].map((h,i) => {
                        const cols = ['', 'col-span-3 text-left', 'col-span-1 text-center', 'col-span-1 text-center', 'col-span-1 text-center', 'col-span-1 text-center', 'col-span-1 text-center', 'col-span-1 text-center', 'col-span-1 text-center'];
                        return <div key={i} className={`text-[9px] font-black uppercase tracking-widest text-slate-400 ${cols[i]||'col-span-1 text-center'}`}>{h}</div>;
                    })}
                </div>
                {filtered.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                        <Icon name="inbox" className="w-10 h-10 mx-auto mb-2 opacity-25" />
                        <p className="text-[11px] font-black uppercase tracking-widest">暂无数据</p>
                    </div>
                ) : filtered.map((item, idx) => <Row key={item.item_id} item={item} idx={idx} />)}
            </div>

            <ListingEditModal 
                isOpen={isEditOpen} 
                onClose={() => setIsEditOpen(false)} 
                item={selectedItem} 
            />
        </div>
    );
};

export default ProductPerformanceView;

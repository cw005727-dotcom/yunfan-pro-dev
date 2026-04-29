import { useState, useEffect, useRef, useMemo } from 'react';
import Icon from '../components/Icon.jsx';
import ListingEditModal from './ListingEditModal.jsx';
import { useProductPerformance } from '../hooks/useProductPerformance';
import { useSmartRotation } from '../hooks/useSmartRotation';
import { useAppContext } from '../context/AppContext.jsx';
import { API_BASE } from '../api/client';

// 引入 Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

const TABS = [
    { key: 'new',      label: '上新关注',  suffix: '🆕', desc: '上架 15 天内的新品监控：SKU 级深度漏斗追踪。' },
    { key: 'hot',      label: '潜力爆款',  suffix: '🔥', desc: '每个站点曝光排名前20的高热度商品，全店共可显示120个（6站×20）' },
    { key: 'cart',     label: '已售商品',  suffix: '⚡' },
    { key: 'risk',     label: '风险产品',  suffix: '⚠️' },
    { key: 'inactive', label: '无效商品',  suffix: '💤' },
];

const HotPotentialItem = ({ item, isSelected, onSelect, top20Avg }) => {
    const [compData, setCompData] = useState(null);
    const [loadingComp, setLoadingComp] = useState(false);
    const [showDetail, setShowDetail] = useState(false);

    // 获取同款比价
    const fetchCompetitors = async (e) => {
        e.stopPropagation();
        if (showDetail) {
            setShowDetail(false);
            return;
        }
        try {
            setLoadingComp(true);
            const res = await fetch(`${API_BASE}/competitor_prices?item_id=${item.item_id}&name=${encodeURIComponent(item.name)}&price=${item.price}&site=${item.site_id}`);
            const data = await res.json();
            
            if (data && data.competitors) {
                setCompData(data);
                setShowDetail(true);
            } else {
                console.error("Malformed competitor data:", data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingComp(false);
        }
    };

    // 智能诊断逻辑
    const getSmartDiagnosis = () => {
        const highlights = [];
        const concerns = [];
        
        const expScore = (item.exposure || 0) / (top20Avg?.exposure || 1);

        if (expScore > 1.2) highlights.push("曝光强劲");
        if (expScore < 0.6) concerns.push("曝光严重不足");

        return {
            summary: highlights.length > 0 ? `亮点: ${highlights.join('、')}` : "亮点: -",
            focus: concerns.length > 0 ? `不足: ${concerns.join('、')}` : "不足: -"
        };
    };

    const diag = getSmartDiagnosis();

    return (
        <div className="flex flex-col gap-2">
            <div 
                onClick={onSelect}
                className={`group px-6 py-3 rounded-2xl border transition-all cursor-pointer grid grid-cols-[50px_130px_70px_1fr_90px] gap-4 items-center ${isSelected ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' : 'bg-white border-slate-50 hover:border-slate-100'}`}
            >
                {/* 主图 */}
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                    <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                
                {/* SKU & 上架日期 */}
                <div className="min-w-0">
                    <div className="text-[10px] font-black text-slate-800 truncate leading-none mb-1 uppercase tracking-tight cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => { const id = item.item_id?.split('-').pop() || ''; navigator.clipboard.writeText(id); }} title="点击复制">SKU: {item.item_id?.split('-').pop() || 'N/A'} <span className="text-slate-300 text-[8px]">📋</span></div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{item.start_time || '2026-04-15'}</div>
                </div>

                {/* 指标展示 */}
                <div className="text-center">
                    <p className="text-[12px] font-black text-slate-800 tracking-tighter">{item.exposure >= 1000 ? (item.exposure/1000).toFixed(1)+'K' : item.exposure}</p>
                </div>

                {/* 智能诊断总结 */}
                <div className="flex flex-col gap-0.5 border-l border-slate-50 pl-4 min-w-0">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tight whitespace-normal leading-tight">{diag.summary}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter whitespace-normal leading-tight">{diag.focus}</p>
                </div>

                {/* 操作：同款比价 (Premium Redesign) */}
                <div className="flex justify-center">
                    <button 
                        onClick={fetchCompetitors}
                        disabled={loadingComp}
                        className={`
                            relative px-2 py-2 rounded-xl text-[9px] font-black transition-all overflow-hidden
                            flex items-center justify-center gap-1.5 w-full group/btn active:scale-95
                            ${showDetail 
                                ? 'bg-slate-900 text-white shadow-lg' 
                                : 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5'
                            }
                        `}
                    >
                        {/* Shimmer Effect */}
                        {!showDetail && !loadingComp && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                        )}
                        
                        {loadingComp ? (
                            <Icon name="loader" className="w-3 h-3 animate-spin" />
                        ) : (
                            <div className="relative">
                                <Icon name={showDetail ? "chevron-up" : "zap"} className={`w-3 h-3 ${!showDetail && 'group-hover/btn:scale-125 transition-transform'}`} />
                                {!showDetail && <span className="absolute -top-1 -right-1 w-1 h-1 bg-emerald-400 rounded-full animate-ping opacity-75"></span>}
                            </div>
                        )}
                        <span className="relative z-10 uppercase tracking-tight">{showDetail ? '收起' : '比价'}</span>
                    </button>
                </div>
            </div>

            {/* 同款比价详情面板 */}
            {showDetail && compData && (
                <div className="mx-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex gap-4">
                            <div className="bg-white px-3 py-1 rounded-lg border border-slate-100">
                                <p className="text-[8px] font-black text-slate-400 uppercase">全网最低</p>
                                <p className="text-[14px] font-black text-rose-500">${compData.min_price}</p>
                            </div>
                            <div className="bg-white px-3 py-1 rounded-lg border border-slate-100">
                                <p className="text-[8px] font-black text-slate-400 uppercase">同款均价</p>
                                <p className="text-[14px] font-black text-slate-800">${compData.avg_price}</p>
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400">🔍 实时检索结果 (Top 3 竞品)</p>
                    </div>
                    <div className="space-y-2">
                        {Array.isArray(compData?.competitors) && compData.competitors.map((c, i) => (
                            <div key={i} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between group/line hover:border-indigo-200 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">{i+1}</div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-700">{c.title}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">{c.seller}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[13px] font-black text-slate-900">${c.price}</p>
                                    <p className="text-[9px] font-bold text-emerald-500">月销 {c.sales}+</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const NewArrivalItem = ({ item, isSelected, onSelect, activeMetric }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hoverPoint, setHoverPoint] = useState(null); // 存储当前鼠标悬停的数据点

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/product_history?item_id=${item.item_id}`);
                const data = await res.json();
                setHistory(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error("History error:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [item.item_id]);

    const chartData = useMemo(() => ({
        labels: history.map(h => h.record_date),
        datasets: [{
            data: history.map(h => h[activeMetric] || 0),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.05)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHitRadius: 20,
            borderWidth: 1.5
        }]
    }), [history, activeMetric]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        onHover: (event, elements) => {
            if (elements && elements.length > 0) {
                const index = elements[0].index;
                setHoverPoint(history[index]);
            } else {
                setHoverPoint(null);
            }
        },
        plugins: { 
            legend: { display: false }, 
            tooltip: { enabled: false } // 禁用默认气泡
        },
        scales: { x: { display: false }, y: { display: false } }
    };

    return (
        <div 
            onClick={onSelect}
            className={`group px-6 py-3 rounded-2xl border transition-all cursor-pointer grid grid-cols-[50px_130px_70px_1fr] gap-4 items-center ${isSelected ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' : 'bg-white border-slate-50 hover:border-slate-100 hover:shadow-sm'}`}
        >
            {/* 主图 */}
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>

            {/* SKU & 上架日期 */}
            <div className="min-w-0">
                <div className="text-[10px] font-black text-slate-800 truncate leading-none mb-1 uppercase tracking-tight cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => { const id = item.item_id?.split('-').pop() || ''; navigator.clipboard.writeText(id); }} title="点击复制">SKU: {item.item_id?.split('-').pop() || 'N/A'} <span className="text-slate-300 text-[8px]">📋</span></div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{item.start_time || '2026-04-15'}</div>
            </div>

            {/* 数值区 - 极简显示 */}
            <div className={`text-center transition-all ${activeMetric === 'exposure' ? 'opacity-100' : 'opacity-40'}`}>
                <p className={`text-[12px] font-black tracking-tighter ${activeMetric === 'exposure' ? 'text-indigo-600' : 'text-slate-800'}`}>{item.exposure >= 1000 ? (item.exposure/1000).toFixed(1)+'K' : item.exposure}</p>
            </div>

            {/* 折线图与悬停数据 */}
            <div className="h-10 flex-1 min-w-[120px] relative bg-slate-50/30 rounded-lg overflow-hidden border border-transparent group-hover:border-slate-100 transition-colors">
                {/* 悬停数据驻留层 */}
                {hoverPoint && (
                    <div className="absolute top-1 left-2 z-10 flex items-center gap-2 pointer-events-none animate-in fade-in duration-200">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{hoverPoint.record_date.split('-').slice(1).join('/')}</span>
                        <span className="text-[9px] font-black text-indigo-600">{hoverPoint[activeMetric]?.toLocaleString()}</span>
                    </div>
                )}
                
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center opacity-20"><div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
                ) : history.length > 0 ? (
                    <div className="absolute inset-0 pt-3 px-1">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[8px] font-black text-slate-200 uppercase tracking-widest">NO DATA</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const SITE_TABS = [
    { key: 'MLM', label: '🇲🇽 墨西哥',  siteId: 'MLM' },
    { key: 'MLB', label: '🇧🇷 巴西',     siteId: 'MLB' },
    { key: 'MLA', label: '🇦🇷 阿根廷',   siteId: 'MLA' },
    { key: 'MCO', label: '🇨🇴 哥伦比亚', siteId: 'MCO' },
    { key: 'MLU', label: '🇺🇾 乌拉圭',   siteId: 'MLU' }
];

const SITE_BADGES = {
    'MLM': { label: '墨西哥', flag: '🇲🇽', color: 'bg-indigo-50 border-indigo-100 text-indigo-600' },
    'MLB': { label: '巴西',   flag: '🇧🇷', color: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
    'MLA': { label: '阿根廷', flag: '🇦🇷', color: 'bg-amber-50 border-amber-100 text-amber-600' },
    'MCO': { label: '哥伦比亚', flag: '🇨🇴', color: 'bg-rose-50 border-rose-100 text-rose-600' },
    'MLC': { label: '智利',   flag: '🇨🇱', color: 'bg-sky-50 border-sky-100 text-sky-600' },
    'MLU': { label: '乌拉圭', flag: '🇺🇾', color: 'bg-purple-50 border-purple-100 text-purple-600' }
};

const getMetricColor = (val, type = 'rate') => {
    let num = parseFloat(String(val || '0').replace('%', ''));
    if (num === 0) return 'text-slate-800';
    
    if (type === 'rate') {
        // 如果是小数（如 0.071），转换为百分数（7.1）
        if (num > 0 && num < 1) num *= 100;
        if (num >= 10) return 'text-emerald-500';
        if (num < 2) return 'text-rose-500';
    }
    if (type === 'score') {
        if (num > 80) return 'text-emerald-500';
        if (num < 60) return 'text-rose-500';
    }
    return 'text-slate-800';
};

const fmt = (n) => {
    if (!n && n !== 0) return '—';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
};

const SmartRotationCard = ({ site, onRotated }) => {
    const { recommendation, loading, isApplying, applyRotation } = useSmartRotation(site === 'all' ? 'MLM' : site);
    
    // 适配后端返回的 has_suggestion -> suggestion 结构
    const data = recommendation?.has_suggestion ? recommendation.suggestion : null;
    const hasError = recommendation?.error;
    
    if (loading) return (
        <div className="h-[200px] rounded-3xl bg-slate-100/50 border border-slate-100 animate-pulse flex flex-col items-center justify-center p-6 shrink-0">
            <Icon name="zap" className="w-8 h-8 text-slate-200 mb-2" />
            <div className="w-24 h-2 bg-slate-200 rounded-full"></div>
        </div>
    );

    if (!data) return (
        <div className="h-[200px] rounded-3xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center p-6 shrink-0">
            <Icon name="zap-off" className="w-6 h-6 text-slate-200 mb-2" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                {hasError ? '智库连接异常' : '暂无轮替建议'}
            </p>
        </div>
    );

    return (
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-700 p-6 text-white shadow-xl relative overflow-hidden shrink-0 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:animate-pulse"></div>
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <Icon name="zap" className="w-4 h-4 text-amber-300" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">智能轮替建议</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-[8px] font-bold uppercase tracking-tighter">AI Focus</span>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="p-3 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/20 transition-colors">
                        <div className="text-[8px] text-white/60 font-black uppercase mb-1.5 tracking-widest">建议移除 (低效)</div>
                        <div className="text-[11px] font-bold truncate leading-tight">{data.current_item_name}</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors">
                        <div className="text-[8px] text-white/60 font-black uppercase mb-1.5 tracking-widest">建议引入 (高潜)</div>
                        <div className="text-[11px] font-bold truncate leading-tight">{data.new_item_name}</div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-5 px-1">
                    <span className="text-[9px] font-black text-white/60 uppercase">预估收益</span>
                    <span className="text-xl font-black text-amber-300 tracking-tighter">{data.potential_growth || '+18.5%'}</span>
                </div>

                <button 
                    disabled={isApplying}
                    onClick={async () => {
                        const ok = await applyRotation();
                        if (ok) onRotated();
                    }}
                    className="w-full py-3 rounded-xl bg-white text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-amber-300 hover:text-indigo-900 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                    {isApplying ? '正在执行轮替...' : '立即执行轮替'}
                </button>
            </div>
        </div>
    );
};

const ProductDetailPerspective = ({ product }) => {
    if (!product) return (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl m-2 bg-slate-50/50">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                <Icon name="mouse-pointer" className="w-6 h-6 opacity-20" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">选择单品查看透视</p>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col p-6 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl text-white shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300 group">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl group-hover:animate-pulse"></div>
            
            <div className="relative z-10 h-full flex flex-col">
                {/* Product Info Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20 overflow-hidden">
                        {product.image_url ? (
                            <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <Icon name="package" className="w-8 h-8 text-white/20" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/20 text-white font-black">{product.site_id}</span>
                            <h4 className="text-[12px] font-black text-white truncate leading-none">{product.name}</h4>
                        </div>
                        <p className="text-[9px] text-white/60 font-bold tracking-tight cursor-pointer hover:text-amber-300 transition-colors" onClick={() => { const id = product.item_id?.split('-').pop() || ''; navigator.clipboard.writeText(id); }} title="点击复制">ID: {product.item_id?.split('-').pop() || product.item_id} <span className="text-white/30">📋</span></p>
                    </div>
                </div>

                {/* Score Area */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* 能量环：紧凑化 */}
                    <div className="flex items-center justify-center">
                        <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                                <circle cx="48" cy="48" r="42" fill="none" stroke="var(--color-brand-accent)" strokeWidth="6" strokeDasharray={264} strokeDashoffset={264 * (1 - (parseFloat(product.health_score) || 0) / 100)} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-xl font-black text-white tracking-tighter">{product.health_score}</span>
                                <span className="text-[7px] font-black text-white/50 uppercase tracking-widest">Score</span>
                            </div>
                        </div>
                    </div>

                    {/* 得分拆解明细 */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between px-1">
                            <div className="text-[9px] font-black text-white/40 uppercase tracking-widest">算法诊断</div>
                            <div className="text-[8px] font-black text-white/60 uppercase">权重</div>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'Listing 完善度', weight: '40%', score: 85, color: 'bg-white' },
                                { label: '流量转化效率', weight: '30%', score: 72, color: 'bg-emerald-400' },
                                { label: '售后风险管控', weight: '20%', score: 95, color: 'bg-amber-400' },
                                { label: '近 7 日活跃度', weight: '10%', score: 60, color: 'bg-white/30' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex flex-col gap-1.5">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-white/80">{item.label}</span>
                                        <span className="text-white/40 font-black">{item.weight}</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color || item.scoreColor} rounded-full transition-all duration-1000`} style={{ width: `${item.score}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProductPerformanceView = () => {
    const [activeTab, setActiveTab] = useState('new');
    const [activeSite, setActiveSite] = useState('MLM');
    const { activeShop, setActiveShop, shops } = useAppContext();
    const { products: allItems, summary, loading: isLoading, refresh: refreshPerf } = useProductPerformance(activeSite);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    
    // 新增排序与指标切换状态
    const [activeMetric, setActiveMetric] = useState('exposure');
    const [sortDir, setSortDir] = useState('desc'); // desc, asc

    const items = Array.isArray(allItems) ? allItems : [];

    // 排序逻辑封装
    const sortItems = (data) => {
        return [...data].sort((a, b) => {
            const valA = a[activeMetric] || 0;
            const valB = b[activeMetric] || 0;
            return sortDir === 'desc' ? valB - valA : valA - valB;
        });
    };

    const avg = useMemo(() => ({
        exp:    items.length ? items.reduce((s,i) => s+(i.exposure||0), 0) / items.length : 0,
        returns:items.length ? items.reduce((s,i) => s+(i.returns||0), 0) / items.length : 0,
    }), [items]);

    const categorized = useMemo(() => ({
        new:      sortItems(items.filter(d => (d.days_listed || 0) <= 15)),
        hot:      (() => {
                    // 每个站点各取曝光前20，然后合并（站点内按曝光排序）
                    const bySite = {};
                    for (const d of items) {
                      const site = d.site_id || 'OTHER';
                      if (!bySite[site]) bySite[site] = [];
                      bySite[site].push(d);
                    }
                    const result = [];
                    for (const site of Object.keys(bySite)) {
                      const top20 = bySite[site]
                        .sort((a,b) => (b.exposure||0) - (a.exposure||0))
                        .slice(0, 20);
                      result.push(...top20);
                    }
                    return result;
                  })(),
        cart:     [...items].sort((a,b) => (b.cart_rate||0) - (a.cart_rate||0)).slice(0,10),
        risk:     items.filter(d => {
                          let ss = [];
                          try { 
                            ss = d.sub_status ? (d.sub_status.startsWith('[') ? JSON.parse(d.sub_status) : [d.sub_status]) : []; 
                          } catch { ss = d.sub_status ? [d.sub_status] : []; }
                          return (d.claims||0)>0 || (d.returns||0)>avg.returns || ss.includes('bpp_report') || ss.includes('forbidden') || d.status === 'under_review' || ss.includes('suspended_account');
                      }).sort((a,b) => ((b.claims||0)+(b.returns||0)) - ((a.claims||0)+(a.returns||0))),
        inactive: items.filter(d => (d.days_listed||0)>30 && (d.exposure||0)<avg.exp)
                          .sort((a,b) => (b.days_listed||0) - (a.days_listed||0)),
    }), [items, activeMetric, sortDir, avg.returns, avg.exp]);

    const top20Avg = useMemo(() => {
        const hotItems = categorized.hot;
        if (!hotItems.length) return { exposure: 0 };
        return {
            exposure: hotItems.reduce((s, i) => s + (i.exposure || 0), 0) / hotItems.length,
        };
    }, [categorized.hot]);

    const currentTabItems = categorized[activeTab] || [];
    const filtered = currentTabItems.filter(i => i.site_id === activeSite);

    const toggleSort = (metric) => {
        if (activeMetric === metric) {
            setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
        } else {
            setActiveMetric(metric);
            setSortDir('desc');
        }
    };

    useEffect(() => {
        if (filtered.length > 0 && !selectedItem) {
            setSelectedItem(filtered[0]);
        }
    }, [filtered]);

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 p-8">
            
            <div className="flex items-start gap-6 h-full min-h-0">
                
                {/* 左侧：列表区域 (70%) */}
                <div className="flex-[0_0_72%] flex flex-col gap-5 h-full min-w-0">
                    
                    {/* 1. 店铺选择 + 站点切换 */}
                    <div className="flex items-center justify-between px-6 py-4 rounded-[32px] bg-white border border-slate-200 shadow-sm shrink-0">
                        <div className="flex items-center gap-4">
                            {/* 店铺下拉选择 */}
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-black text-slate-800">大姐店</h2>
                                <select
                                    value={activeShop || ''}
                                    onChange={e => setActiveShop(e.target.value)}
                                    className="px-3 py-1.5 rounded-xl text-[11px] font-black bg-indigo-50 border border-indigo-100 text-indigo-600 cursor-pointer hover:bg-indigo-100 transition-colors focus:outline-none"
                                >
                                    {(shops || []).map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="h-4 w-px bg-slate-200"></div>
                            {/* 站点切换按钮 */}
                            <div className="flex items-center gap-1.5">
                                {SITE_TABS.map(site => (
                                    <button
                                        key={site.key}
                                        onClick={() => setActiveSite(site.key)}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${activeSite === site.key ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                    >
                                        {site.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* 在售数量（该站点全部商品） */}
                        <div className="text-right">
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">在售</p>
                            <p className="text-sm font-black text-indigo-600">{allItems.length.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* 2. 商品列表看板 */}
                    <div className="flex-1 flex flex-col rounded-[32px] bg-white border border-slate-200 shadow-sm overflow-hidden min-h-0">
                        
                        {/* Tab Headers */}
                        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 shrink-0">
                            <div className="flex items-center gap-1.5">
                                {TABS.map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${activeTab === tab.key ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <span>{tab.suffix}</span>
                                        <span>{tab.label}</span>
                                        <span className={`px-1.5 py-0.5 rounded-md text-[8px] ${activeTab === tab.key ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            {categorized[tab.key].length}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* List Area */}
                        <div className="flex-1 flex flex-col min-h-0">
                            {/* 标签解释区 */}
                            {TABS.find(t => t.key === activeTab)?.desc && (
                                <div className="px-6 py-3 border-b border-slate-50 bg-indigo-50/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                                    <Icon name="info" className="w-3.5 h-3.5 text-indigo-500" />
                                    <p className="text-[10px] font-bold text-indigo-600/80 tracking-tight">{TABS.find(t => t.key === activeTab).desc}</p>
                                </div>
                            )}

                            {/* Table Head (上新模式: 只有一层表头，可点击排序) */}
                            {activeTab === 'new' ? (
                                <div className="px-6 py-3 grid grid-cols-[50px_140px_100px_1fr] gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 shrink-0">
                                    <div className="w-10">主图</div>
                                    <div>SKU/日期</div>
                                    <div 
                                        onClick={() => toggleSort('exposure')}
                                        className={`text-center cursor-pointer transition-colors hover:text-indigo-500 flex items-center justify-center gap-1 ${activeMetric === 'exposure' ? 'text-indigo-600' : ''}`}
                                    >
                                        曝光 {activeMetric === 'exposure' && (sortDir === 'desc' ? '↓' : '↑')}
                                    </div>
                                    <div className="pl-4">波动趋势 (15日)</div>
                                </div>
                            ) : (
                                <div className="px-6 py-3 grid grid-cols-[50px_130px_70px_1fr_90px] gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 shrink-0">
                                    <div className="w-10">主图</div>
                                    <div>SKU/日期</div>
                                    <div className="text-center">曝光</div>
                                    <div className="pl-4">智能诊断</div>
                                    <div className="text-center">操作</div>
                                </div>
                            )}

                            {/* Table Body */}
                            <div className="flex-1 overflow-y-auto px-0 py-4 custom-scrollbar min-h-0">
                                {isLoading ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-300">
                                        <Icon name="loader" className="w-8 h-8 animate-spin" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">正在深度解析性能数据...</p>
                                    </div>
                                ) : filtered.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-300">
                                        <Icon name="inbox" className="w-12 h-12 opacity-20" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">该分类下暂无数据</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filtered.map((item, idx) => {
                                            if (activeTab === 'new') {
                                                return (
                                                    <NewArrivalItem 
                                                        key={item.item_id || idx}
                                                        item={item}
                                                        isSelected={selectedItem?.item_id === item.item_id}
                                                        onSelect={() => setSelectedItem(item)}
                                                        activeMetric={activeMetric}
                                                    />
                                                );
                                            }
                                            if (activeTab === 'hot') {
                                                return (
                                                    <HotPotentialItem 
                                                        key={item.item_id || idx}
                                                        item={item}
                                                        isSelected={selectedItem?.item_id === item.item_id}
                                                        onSelect={() => setSelectedItem(item)}
                                                        top20Avg={top20Avg}
                                                    />
                                                );
                                            }
                                            const badge = SITE_BADGES[item.site_id] || { flag: '🌐', label: item.site_id, color: 'bg-slate-50 text-slate-400' };
                                            return (
                                                <div 
                                                    key={item.item_id || idx}
                                                    onClick={() => setSelectedItem(item)}
                                                    className={`group px-6 py-3 rounded-2xl border transition-all cursor-pointer grid grid-cols-[50px_130px_70px_1fr_90px] gap-4 items-center ${selectedItem?.item_id === item.item_id ? 'bg-indigo-50/50 border-indigo-200 ring-1 ring-indigo-100 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'}`}
                                                >
                                                    {/* 主图 */}
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden">
                                                        {item.image_url ? (
                                                            <img src={item.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                        ) : (
                                                            <Icon name="image" className="w-4 h-4 text-slate-300" />
                                                        )}
                                                    </div>

                                                    {/* SKU & 日期 */}
                                                    <div className="min-w-0">
                                                        <div className="text-[10px] font-black text-slate-800 truncate leading-none mb-1 uppercase tracking-tight cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => { const id = item.item_id?.split('-').pop() || ''; navigator.clipboard.writeText(id); }} title="点击复制">SKU: {item.item_id?.split('-').pop() || 'N/A'} <span className="text-slate-300 text-[8px]">📋</span></div>
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{item.start_time || '2026-04-15'}</div>
                                                    </div>
                                                    
                                                    {/* 指标展示 */}
                                                    <div className="text-center">
                                                        <p className="text-[12px] font-black text-slate-800 tracking-tighter">{item.exposure >= 1000 ? (item.exposure/1000).toFixed(1)+'K' : item.exposure}</p>
                                                    </div>

                                                    {/* 智能诊断 */}
                                                    <div className="flex flex-col gap-0.5 border-l border-slate-50 pl-4 min-w-0">
                                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tight whitespace-normal leading-tight">
                                                            {item.exposure >= avg.exp ? '亮点: 曝光充足' : '亮点: -'}
                                                        </p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter whitespace-normal leading-tight">
                                                            {item.exposure < avg.exp ? '不足: 流量拉新' : '不足: -'}
                                                        </p>
                                                    </div>

                                                    <div className="text-right">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setIsEditOpen(true); }}
                                                            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-400 text-[9px] font-black uppercase transition-all"
                                                        >
                                                            修改
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 右侧：AI 智库与详情 (30%) */}
                <div className="flex-1 flex flex-col gap-6 h-full min-w-0">
                    <SmartRotationCard site={activeSite} onRotated={refreshPerf} />
                    <ProductDetailPerspective product={selectedItem} />
                </div>

            </div>

            {isEditOpen && (
                <ListingEditModal 
                    listing={selectedItem} 
                    onClose={() => setIsEditOpen(false)} 
                    onSaved={refreshPerf}
                />
            )}
        </div>
    );
};

export default ProductPerformanceView;

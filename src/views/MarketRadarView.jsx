import { useState, useEffect } from 'react';
import Icon from '../components/Icon.jsx';
import DiagnosticModal from './DiagnosticModal.jsx';
import { useMarketRadar, useListingDoctor } from '../hooks/useMarketRadar';
import { useProductPerformance } from '../hooks/useProductPerformance';

const RADAR_CATEGORIES = [
    { key: 'rising', label: '急上升热词', color: 'rose', textColor: 'text-rose-600', dot: 'bg-rose-500', bg: 'bg-rose-50', border: 'border-rose-100', desc: '搜索量 24h 激增 300%+' },
    { key: 'most_wanted', label: '高潜力新词', color: 'amber', textColor: 'text-amber-600', dot: 'bg-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', desc: '全网热搜，转化潜力巨大' },
    { key: 'popular', label: '长期类目词', color: 'indigo', textColor: 'text-indigo-600', dot: 'bg-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100', desc: '流量基数庞大且稳定' }
];

const MarketRadarView = () => {
    const [activeSite, setActiveSite] = useState('MLM');
    const [activePlatform, setActivePlatform] = useState('mercado_libre');
    
    const PLATFORMS = [
        { id: 'mercado_libre', label: '美客多实时热卖', icon: 'zap' },
        { id: 'amazon', label: '亚马逊 Bestsellers', icon: 'activity' },
        { id: '1688', label: '1688 跨境热卖', icon: 'download-cloud' },
        { id: 'aliexpress', label: '速卖通实时趋势', icon: 'package' },
        { id: 'temu', label: 'Temu 全球热榜', icon: 'shopping-cart' }
    ];

    const { items: marketProducts = [], trends = {}, loading: trendsLoading } = useMarketRadar(activeSite, activePlatform);
    const { products: items = [] } = useProductPerformance();

    const safeMarketProducts = Array.isArray(marketProducts) ? marketProducts : [];
    const safeItems = Array.isArray(items) ? items : [];
    const { diagnose: runDoctor, loading: isDiagnosing } = useListingDoctor();
    
    const [diagnosisData, setDiagnosisData] = useState(null);
    const [showDoctor, setShowDoctor] = useState(false);

    // Site Metadata with Colors and Default Metrics
    const SITES_CONFIG = [
        { id: 'MLM', flag: '🇲🇽', label: '墨西哥', heat: 92.5, color: 'blue', border: 'border-blue-500/20', activeBorder: 'border-blue-500', bg: 'bg-blue-500/5', bar: 'bg-blue-500', text: 'text-blue-600', categories: [{ name: '电子', p: '42%', icon: 'cpu' }, { name: '家居', p: '25%', icon: 'home' }, { name: '户外', p: '18%', icon: 'compass' }, { name: '美妆', p: '10%', icon: 'heart' }, { name: '服饰', p: '5%', icon: 'shopping-bag' }] },
        { id: 'MLB', flag: '🇧🇷', label: '巴西', heat: 88.1, color: 'emerald', border: 'border-emerald-500/20', activeBorder: 'border-emerald-500', bg: 'bg-emerald-500/5', bar: 'bg-emerald-500', text: 'text-emerald-600', categories: [{ name: '美妆', p: '38%', icon: 'heart' }, { name: '电配', p: '31%', icon: 'battery-charging' }, { name: '玩具', p: '12%', icon: 'smile' }, { name: '运动', p: '10%', icon: 'award' }, { name: '箱包', p: '9%', icon: 'briefcase' }] },
        { id: 'MLC', flag: '🇨🇱', label: '智利', heat: 74.6, color: 'rose', border: 'border-rose-500/20', activeBorder: 'border-rose-500', bg: 'bg-rose-500/5', bar: 'bg-rose-500', text: 'text-rose-600', categories: [{ name: '服饰', p: '55%', icon: 'shopping-bag' }, { name: '取暖', p: '22%', icon: 'sun' }, { name: '厨电', p: '10%', icon: 'coffee' }, { name: '数码', p: '8%', icon: 'smartphone' }, { name: '母婴', p: '5%', icon: 'baby' }] },
        { id: 'MCO', flag: '🇨🇴', label: '哥伦比亚', heat: 62.3, color: 'amber', border: 'border-amber-500/20', activeBorder: 'border-amber-500', bg: 'bg-amber-500/5', bar: 'bg-amber-500', text: 'text-amber-600', categories: [{ name: '手机', p: '41%', icon: 'smartphone' }, { name: '汽配', p: '19%', icon: 'tool' }, { name: '办公', p: '15%', icon: 'edit-3' }, { name: '家居', p: '15%', icon: 'home' }, { name: '灯饰', p: '10%', icon: 'zap' }] },
        { id: 'MLA', flag: '🇦🇷', label: '阿根廷', heat: 54.8, color: 'cyan', border: 'border-cyan-500/20', activeBorder: 'border-cyan-500', bg: 'bg-cyan-500/5', bar: 'bg-cyan-500', text: 'text-cyan-600', categories: [{ name: '家电', p: '35%', icon: 'monitor' }, { name: '个护', p: '24%', icon: 'user' }, { name: '户外', p: '18%', icon: 'compass' }, { name: '宠物', p: '13%', icon: 'github' }, { name: '饰品', p: '10%', icon: 'star' }] }
    ];

    const currentTrends = trends[activeSite] || {};

    const handleDiagnose = async (marketP) => {
        setShowDoctor(true);
        setDiagnosisData(null);
        const myP = safeItems.find(i => 
            i.name?.toLowerCase().includes(marketP.keyword?.toLowerCase()) || 
            marketP.title?.toLowerCase().includes(i.name?.toLowerCase().split(' ')[0])
        ) || safeItems[0] || { name: '默认商品', price: (marketP.price || 0) * 1.1 };

        try {
            const result = await runDoctor(myP, marketP);
            setDiagnosisData(result);
        } catch (err) {
            console.error(err);
        }
    };

    const copyKeyword = (kw) => {
        navigator.clipboard.writeText(kw);
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-hidden">
            <DiagnosticModal isOpen={showDoctor} onClose={() => setShowDoctor(false)} data={diagnosisData} isDiagnosing={isDiagnosing} />

            {/* 1. Global Context Selector (Target Sites) */}
            <div className="flex items-center gap-4 shrink-0 bg-white p-3 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="px-6 border-r border-slate-100 flex flex-col justify-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">目标市场</p>
                    <p className="text-xs font-black text-slate-900 leading-none">TARGET SITE</p>
                </div>
                <div className="flex gap-2">
                    {SITES_CONFIG.map(site => (
                        <button 
                            key={site.id} 
                            onClick={() => setActiveSite(site.id)}
                            className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300
                                ${activeSite === site.id 
                                    ? `bg-slate-900 text-white shadow-xl shadow-slate-200 -translate-y-0.5` 
                                    : `bg-slate-50 text-slate-500 hover:bg-slate-100`}`}
                        >
                            <span className="text-lg leading-none">{site.flag}</span>
                            <div className="text-left">
                                <p className={`text-[11px] font-black leading-none mb-0.5 ${activeSite === site.id ? 'text-white' : 'text-slate-900'}`}>{site.label}</p>
                                <p className={`text-[8px] font-bold opacity-60 uppercase tracking-widest leading-none ${activeSite === site.id ? 'text-white' : 'text-slate-400'}`}>{site.id}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Intelligence Source Selector (Platforms) */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                            {SITES_CONFIG.find(s => s.id === activeSite)?.label} · 爆品雷达
                        </h3>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Market Intelligent Radar Matrix</p>
                    </div>
                    
                    {/* Platform Selector */}
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl ml-4">
                        {PLATFORMS.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setActivePlatform(p.id)}
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2
                                    ${activePlatform === p.id 
                                        ? 'bg-white text-blue-600 shadow-sm' 
                                        : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Icon name={p.icon} className="w-3.5 h-3.5" />
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">全域实时监控中</span>
                    </div>
                </div>
            </div>

            {/* 3. Site Market Snapshot (Unified horizontal bar style) */}
            <div className="flex shrink-0 min-h-0">
                {SITES_CONFIG.filter(s => s.id === activeSite).map(site => (
                    <div key={site.id} className="flex gap-8 items-center w-full bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="shrink-0 pr-8 border-r border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">站点活跃度指数</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black tracking-tighter text-slate-900 leading-none">{site.heat}</span>
                                <span className={`text-xs font-black uppercase tracking-widest ${site.text}`}>Score</span>
                            </div>
                        </div>
                        <div className="flex-1 grid grid-cols-5 gap-6">
                            {site.categories.map((cat, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <div className={`w-5 h-5 rounded-lg ${site.bg} flex items-center justify-center ${site.text} shrink-0`}>
                                                <Icon name={cat.icon} className="w-3 h-3" />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight truncate">{cat.name}</span>
                                        </div>
                                        <span className={`text-[10px] font-black ${site.text}`}>{cat.p}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${site.bar}`}
                                            style={{ width: cat.p }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. Bottom Viewport Area (Flex-1) */}
            <div className="flex-1 grid grid-cols-3 gap-6 min-h-0 overflow-hidden">
                {/* Left: Intelligence Keywords */}
                <div className="col-span-1 flex flex-col bg-white rounded-[32px] border border-slate-100 shadow-xl min-h-0">
                    <div className="px-6 py-5 border-b border-slate-50 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                                <Icon name="search" className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[13px] font-black text-slate-900">搜索热词快讯</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Live Search Pulse</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar pr-2">
                        {trendsLoading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
                                <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin" />
                                <span className="text-[10px] font-bold text-slate-400">正在同步站点数据...</span>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {RADAR_CATEGORIES.map(cat => (
                                    <div key={cat.key}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${cat.textColor}`}>{cat.label}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {(currentTrends[cat.key] || []).map((w, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => copyKeyword(w.keyword)}
                                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${cat.bg} ${cat.textColor} ${cat.border} hover:scale-105 active:scale-95`}
                                                >
                                                    {w.keyword}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Explosive Product Scanner */}
                <div className="col-span-2 flex flex-col bg-white rounded-[32px] border border-slate-100 shadow-xl min-h-0 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-200">
                                <Icon name="trending-up" className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-[13px] font-black text-slate-900">实时爆品扫描仪</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Market Top Performers</p>
                            </div>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-slate-50 text-slate-400 text-[9px] font-black tracking-widest">
                            {safeMarketProducts.length} REAL ITEMS SCANNED
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {trendsLoading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
                                <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-amber-500 animate-spin" />
                                <span className="text-[10px] font-bold text-slate-400">正在扫描全球爆款...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-5 gap-3">
                                {safeMarketProducts.map((p, i) => (
                                    <div key={i} className="group bg-white rounded-2xl border border-slate-50 p-2 hover:border-amber-400 transition-all hover:shadow-xl hover:-translate-y-1">
                                        <div className="aspect-square rounded-xl overflow-hidden bg-slate-50 relative mb-2">
                                            <img src={p.image || p.thumbnail} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            {p.sales > 500 && (
                                                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[8px] font-black tracking-tighter shadow-lg animate-pulse">HOT</div>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-slate-800 font-black text-[9px] line-clamp-2 min-h-[24px] leading-tight">{p.title}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-amber-600 font-black text-[11px] tracking-tight">${p.price}</span>
                                                <span className="text-[8px] text-slate-400 font-bold px-1 py-0.5 bg-slate-50 rounded">售 {p.sales}+</span>
                                            </div>
                                            <button onClick={() => handleDiagnose(p)} className="w-full mt-1.5 py-1.5 rounded-lg bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all active:scale-95">AI 诊断</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketRadarView;

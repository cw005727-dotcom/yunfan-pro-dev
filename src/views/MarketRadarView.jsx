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
    const { items: marketProducts, trends, loading: trendsLoading, refresh: refreshRadar } = useMarketRadar(activeSite);
    const { products: items } = useProductPerformance();
    const { diagnose: runDoctor, loading: isDiagnosing } = useListingDoctor();
    
    const [rotationSuggestion, setRotationSuggestion] = useState(null);
    const [rotationLoading, setRotationLoading] = useState(false);
    const [diagnosisData, setDiagnosisData] = useState(null);
    const [showDoctor, setShowDoctor] = useState(false);
    const [copiedKeyword, setCopiedKeyword] = useState(null);

    useEffect(() => {
        loadRotationSuggestion();
    }, []);

    const loadRotationSuggestion = () => {
        fetch('/api/smart_rotation')
            .then(r => r.json())
            .then(data => { if (data.has_suggestion) setRotationSuggestion(data.suggestion); })
            .catch(() => {});
    };

    const handleRotate = async () => {
        if (!rotationSuggestion) return;
        setRotationLoading(true);
        try {
            const res = await fetch('/api/apply_rotation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    remove_id: rotationSuggestion.current_item_id,
                    add_id: rotationSuggestion.new_item_id
                })
            });
            const data = await res.json();
            if (data.status === 'success') {
                setRotationSuggestion(null);
                refreshRadar();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setRotationLoading(false);
        }
    };

    const handleDiagnose = async (marketP) => {
        setShowDoctor(true);
        setDiagnosisData(null);
        const myP = items.find(i => 
            i.name.toLowerCase().includes(marketP.keyword.toLowerCase()) || 
            marketP.title.toLowerCase().includes(i.name.toLowerCase().split(' ')[0])
        ) || items[0] || { name: '默认商品', price: marketP.price * 1.1 };

        try {
            const result = await runDoctor(myP, marketP);
            setDiagnosisData(result);
        } catch (err) {
            console.error(err);
        }
    };

    const copyKeyword = (kw) => {
        navigator.clipboard.writeText(kw);
        setCopiedKeyword(kw);
        setTimeout(() => setCopiedKeyword(null), 2000);
    };

    const bubbleSize = (index) => {
        if (index < 2) return 'text-sm font-black px-5 py-2.5';
        if (index < 7) return 'text-[12px] font-bold px-3.5 py-2';
        return 'text-[11px] font-medium px-3 py-1.5';
    };

    const bubbleDelay = (index) => index * 30;

    const currentTrends = trends[activeSite] || {};

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700">
            <DiagnosticModal isOpen={showDoctor} onClose={() => setShowDoctor(false)} data={diagnosisData} isDiagnosing={isDiagnosing} />

            {rotationSuggestion && (
                <div className="relative overflow-hidden rounded-[32px] p-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 shadow-xl shadow-indigo-100 group">
                    <div className="bg-white/95 backdrop-blur-md rounded-[28px] px-8 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                <Icon name="refresh-cw" className={`w-6 h-6 text-indigo-500 ${rotationLoading ? 'animate-spin' : ''}`} />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-600 text-[9px] font-black uppercase tracking-widest">智能建议</span>
                                    <p className="text-sm font-black text-slate-900">核心 Scout 品类轮替提醒</p>
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium">
                                    检测到 {rotationSuggestion.current_item_name} (曝光 {rotationSuggestion.current_exposure}) 表现下滑，建议替换为高潜新品 {rotationSuggestion.new_item_name} (预估潜力 +{Math.round(rotationSuggestion.potential_gain*100)}%)
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={handleRotate} disabled={rotationLoading} className="px-8 py-3.5 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                                {rotationLoading ? '执行中...' : '立即轮替'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">爆品雷达</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Market Intelligent Radar</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Live Updates</span>
                    </div>
                </div>
            </div>

            <div className="solid-card rounded-[24px] border border-slate-200 overflow-hidden bg-white/60 backdrop-blur-sm shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-200">
                            <Icon name="zap" className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900">市场搜索热词</p>
                            <p className="text-[9px] text-slate-400 font-medium">根据全平台搜索量实时排序 · 自动匹配相关类目</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {[
                            { code: 'MLM', label: '墨西哥' },
                            { code: 'MLB', label: '巴西' },
                            { code: 'MLC', label: '智利' },
                            { code: 'MCO', label: '哥伦比亚' }
                        ].map(site => (
                            <button key={site.code} onClick={() => setActiveSite(site.code)} className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all duration-200 ${activeSite === site.code ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}>
                                {site.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="px-6 py-5">
                    {trendsLoading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-violet-500 animate-spin" />
                            <span className="text-slate-400 text-[10px] font-medium">加载市场趋势...</span>
                        </div>
                    ) : (
                        <div>
                            {RADAR_CATEGORIES.map(cat => {
                                const words = currentTrends[cat.key] || [];
                                return (
                                    <div key={cat.key} className="mb-5 last:mb-0">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className={`w-2 h-2 rounded-full ${cat.dot}`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${cat.textColor}`}>{cat.label}</span>
                                            <span className="text-[9px] text-slate-400 font-medium">{cat.desc}</span>
                                            <span className="text-[9px] text-slate-300 font-medium">· {words.length}个词</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2.5 items-center" style={{alignItems: 'center'}}>
                                            {words.map((w, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => copyKeyword(w.keyword)}
                                                    title={`${w.category || ''} · 点击复制`}
                                                    className={`relative rounded-full whitespace-nowrap transition-all duration-300 cursor-pointer group/btn
                                                        ${cat.bg} ${cat.textColor}
                                                        ${bubbleSize(i)}
                                                        ${copiedKeyword === w.keyword ? 'ring-2 ring-offset-1 ring-blue-400 scale-105' : ''}
                                                    `}
                                                    style={{
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                                        animationDelay: `${bubbleDelay(i)}ms`,
                                                    }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)';
                                                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.14)';
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.transform = '';
                                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                                                    }}
                                                >
                                                    <span className="mr-1.5 inline-block transform group-hover/btn:scale-125 transition-transform duration-300">
                                                        {[...(w.category || '')][0]}
                                                    </span>
                                                    <span>{w.keyword}</span>
                                                    <span className={`ml-2 text-[9px] opacity-40 font-medium ${i < 7 ? 'inline' : 'hidden group-hover/btn:inline'}`}>
                                                        {w.category ? w.category.slice(2) : '综合'}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="solid-card rounded-[24px] border border-slate-200 overflow-hidden bg-white/60 backdrop-blur-sm shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200">
                            <Icon name="trending-up" className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900">实时爆品雷达</p>
                            <p className="text-[9px] text-slate-400 font-medium">根据当前趋势词自动检索市场最火商品 · 实时主图</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {trendsLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-amber-500 animate-spin" />
                            <span className="text-slate-400 text-[10px] font-medium">正在扫描市场爆品...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {marketProducts.length > 0 ? marketProducts.slice(0, 12).map((p, i) => (
                                <div key={i} className="group relative flex flex-col bg-white rounded-2xl border border-slate-100 hover:border-amber-200 transition-all hover:shadow-xl hover:-translate-y-1">
                                    <div className="aspect-square w-full rounded-t-2xl overflow-hidden bg-slate-50 relative">
                                        <img src={p.image || p.thumbnail} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[9px] font-black">已售 {p.sales}+</div>
                                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black shadow-lg">{i + 1}</div>
                                    </div>
                                    <div className="p-3 space-y-2">
                                        <div className="min-h-[32px]">
                                            <p className="text-slate-800 font-bold text-[10px] leading-tight line-clamp-2 group-hover:text-amber-600 transition-colors">{p.title}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-amber-600 font-black text-xs">{p.currency === 'MXN' ? '$' : p.currency} {p.price}</span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{p.keyword}</span>
                                        </div>
                                        <button onClick={() => handleDiagnose(p)} className="w-full mt-2 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">AI 诊断对比</button>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full py-12 text-center"><p className="text-slate-400 text-xs font-medium">当前站点暂无爆品扫描结果</p></div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarketRadarView;

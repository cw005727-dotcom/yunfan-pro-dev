import { useState, useEffect } from 'react';
import Icon from '../components/Icon.jsx';
import DiagnosticModal from './DiagnosticModal.jsx';
import { useMarketRadar, useListingDoctor } from '../hooks/useMarketRadar';
import { API_BASE } from '../api/client';

const SITES = [
    { id: 'MLM', flag: '🇲🇽', label: '墨西哥', domain: 'amazon.com.mx' },
    { id: 'MLB', flag: '🇧🇷', label: '巴西', domain: 'amazon.com.br' },
    { id: 'MLC', flag: '🇨🇱', label: '智利', domain: 'amazon.cl' },
    { id: 'MCO', flag: '🇨🇴', label: '哥伦比亚', domain: 'amazon.com.co' },
    { id: 'MLA', flag: '🇦🇷', label: '阿根廷', domain: 'amazon.com.ar' }
];

const PLATFORMS = [
    { id: 'amazon', label: 'AMAZON', color: '#FF9900', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg' },
    { id: '1688', label: '1688', color: '#FF6600', logo: 'https://cbu01.alicdn.com/cms/upload/2016/092/105/2501290_1340156972.png' },
    { id: 'aliexpress', label: 'AE', color: '#E62E04', logo: 'https://ae01.alicdn.com/kf/S8f09d81d4a8e458e807604791552a443Z.png' },
    { id: 'temu', label: 'TEMU', color: '#FF6000', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Temu_logo.svg' }
];

const MarketRadarView = () => {
    const [activeSite, setActiveSite] = useState('MLM');
    const [activePlatform, setActivePlatform] = useState('amazon');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    
    const [selectedItem, setSelectedItem] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    
    const { items: marketProducts = [], loading, refresh, platformReason, platformMessage } = useMarketRadar(activeSite, activePlatform);
    const safeMarketProducts = Array.isArray(marketProducts) ? marketProducts : [];

    const handleCardClick = async (item) => {
        setSelectedItem(item);
        setIsAnalyzing(true);
        setAiResult(null);
        try {
            const res = await fetch(`${API_BASE}/market_radar/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: item.title,
                    price: item.price,
                    site: activeSite
                })
            });
            const data = await res.json();
            setAiResult(data);
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleScan = async () => {
        if (!searchKeyword.trim()) return;
        setIsScanning(true);
        try {
            const res = await fetch(`${API_BASE}/market_radar/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keyword: searchKeyword,
                    platform: activePlatform,
                    site: activeSite
                })
            });
            
            setTimeout(() => {
                refresh(searchKeyword);
                setIsScanning(false);
            }, 3000);
        } catch (error) {
            console.error('Scan failed:', error);
            setIsScanning(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 p-4 md:p-10 overflow-y-auto lg:overflow-hidden relative select-none no-scrollbar">
            <style dangerouslySetInnerHTML={{ __html: `
                body, html { overflow: hidden !important; height: 100% !important; }
                #root { height: 100% !important; overflow: hidden !important; }
                @keyframes scanline {
                    0% { transform: translateY(-100%); opacity: 0; }
                    50% { opacity: 0.5; }
                    100% { transform: translateY(200%); opacity: 0; }
                }
                .radar-scan {
                    position: absolute;
                    top: 0; left: 0; right: 0; height: 100px;
                    background: linear-gradient(to bottom, transparent, rgba(245, 158, 11, 0.1), transparent);
                    animation: scanline 3s infinite linear;
                    pointer-events: none;
                    z-index: 10;
                }
                .glass-premium {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
            `}} />
            {/* Top Control Bar (The Commander) */}
            <div className="flex items-center gap-3 mb-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 shrink-0 z-20">
                {/* 1. Site Selector with Capsule Design */}
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 mr-2">
                    {SITES.map(site => (
                        <button
                            key={site.id}
                            onClick={() => setActiveSite(site.id)}
                            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
                                activeSite === site.id 
                                ? 'bg-white shadow-sm text-slate-900 ring-1 ring-slate-200' 
                                : 'text-slate-500 hover:text-slate-600'
                            }`}
                        >
                            <span className="text-sm">{site.flag}</span>
                            <span className="text-[11px] font-black uppercase tracking-tighter">{site.id}</span>
                        </button>
                    ))}
                </div>

                {/* 2. Platform Selector with Tactical Icons */}
                <div className="flex items-center gap-1.5 mr-4">
                    {PLATFORMS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setActivePlatform(p.id)}
                            className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center border-2 ${
                                activePlatform === p.id 
                                ? 'bg-slate-900 border-slate-900 shadow-lg scale-105' 
                                : 'bg-white border-slate-50 hover:border-slate-200 opacity-60'
                            }`}
                        >
                            <img src={p.logo} alt={p.label} className="w-5 h-5 object-contain" />
                        </button>
                    ))}
                </div>

                {/* 3. AI Deep Scan Input with Smart Suggestions */}
                <div className="flex-1 relative">
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border-2 border-slate-100 focus-within:border-amber-400 focus-within:bg-white transition-all shadow-inner">
                        <Icon name="search" size={16} className="text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="输入类目、产品词或亚马逊链接进行影子扫描..."
                            className="bg-transparent border-none outline-none flex-1 text-[13px] font-bold text-slate-700 placeholder:text-slate-500"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                        />
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={handleScan}
                                disabled={isScanning}
                                className={`h-8 px-6 rounded-xl bg-amber-500 text-white text-[11px] font-black tracking-widest hover:bg-amber-600 transition-all active:scale-95 shadow-lg shadow-amber-200 ${isScanning ? 'animate-pulse' : ''}`}
                            >
                                {isScanning ? 'ANALYZING...' : 'DEEP SCAN'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content: 1x6 Matrix */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden min-h-0 relative">
                {isScanning && <div className="radar-scan" />}
                
                <div className="flex-1 overflow-hidden px-1 flex flex-col min-h-0">
                    <div className="mb-3 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-amber-500 shadow-xl border border-slate-800">
                                    <Icon name="target" size={20} />
                                </div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-50 animate-ping" />
                            </div>
                            <div>
                                <h2 className="text-[14px] font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
                                    探测情报矩阵
                                    <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded-lg text-[11px]">{SITES.find(s=>s.id===activeSite)?.label}</span>
                                </h2>
                                <div className="flex items-center gap-3 mt-0.5">
                                    <span className="text-[11px] text-slate-500 font-black tracking-widest uppercase">Live Shadow Feed</span>
                                    <div className="flex gap-1">
                                        {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-slate-200" />)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            {['智能家居', '夏季服饰', '消费电子'].map(tag => (
                                <button 
                                    key={tag}
                                    onClick={() => setSearchKeyword(tag)}
                                    className="px-3 py-1 bg-white rounded-lg border border-slate-100 text-[11px] font-bold text-slate-500 hover:border-amber-300 hover:text-amber-500 transition-all"
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading || isScanning ? (
                        <div className="overflow-x-auto no-scrollbar flex-1">
                            <div className="grid grid-cols-[repeat(6,minmax(180px,1fr))] grid-rows-3 gap-2 h-full min-w-[1100px] content-start">
                            {[...Array(18)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl p-2 h-full border border-slate-50 shadow-sm flex flex-col gap-2">
                                    <div className="flex-1 bg-slate-50 rounded-xl animate-pulse" />
                                    <div className="h-3 w-3/4 bg-slate-50 rounded animate-pulse" />
                                    <div className="h-4 w-1/2 bg-slate-50 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : safeMarketProducts.length === 0 && platformReason === 'platform_unsupported' ? (
                        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                                <span className="text-3xl">🚫</span>
                            </div>
                            <h3 className="text-[14px] font-black text-slate-700 mb-2">该平台暂不支持数据检索</h3>
                            <p className="text-[11px] text-slate-500 text-center max-w-xs leading-relaxed">{platformMessage}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto no-scrollbar flex-1">
                            <div className="grid grid-cols-[repeat(6,minmax(180px,1fr))] grid-rows-3 gap-2 h-full min-w-[1100px] content-start">
                            {safeMarketProducts.slice(0, 18).map((p, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => handleCardClick(p)}
                                    className={`group bg-white rounded-2xl border p-2 transition-all cursor-pointer hover:shadow-2xl hover:-translate-y-1 relative flex flex-col ${selectedItem === p ? 'border-amber-500 ring-4 ring-amber-50 shadow-amber-100' : 'border-slate-50 shadow-sm hover:border-amber-200'}`}
                                >
                                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white relative mb-2 shrink-0 border border-slate-50 group-hover:border-transparent transition-all">
                                        <img 
                                            src={p.image || p.thumbnail} 
                                            alt={p.title} 
                                            referrerPolicy="no-referrer"
                                            className="w-full h-full object-contain transition-all duration-700 group-hover:scale-110" 
                                        />
                                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-lg bg-slate-900/90 backdrop-blur-md text-[11px] font-black text-white shadow-lg">
                                            {p.currency || 'MXN'}
                                        </div>
                                    </div>
                                    <div className="space-y-1 flex-1 flex flex-col justify-between">
                                        <p className="text-slate-800 font-black text-[11px] line-clamp-1 leading-tight group-hover:text-amber-600 transition-colors uppercase tracking-tighter">
                                            {p.title}
                                        </p>
                                        <div className="flex items-end justify-between pt-1 border-t border-slate-50 mt-auto">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] text-slate-500 font-black uppercase">
                                                    {p.is_js_verified ? 'Est. Monthly Sales' : 'Market Price'}
                                                </span>
                                                <span className="text-slate-900 font-black text-[14px] tracking-tighter tabular-nums leading-none">
                                                    {p.is_js_verified ? `${p.sales} units` : (p.currency === 'MXN' ? '$' : '') + p.price}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                {p.is_js_verified && (
                                                    <span className="text-[11px] text-amber-600 font-black uppercase mb-0.5">Verified</span>
                                                )}
                                                <div className="w-4 h-4 rounded-lg bg-emerald-50 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {p.is_real && (
                                        <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-emerald-500 text-white text-[11px] whitespace-nowrap font-black rounded-lg shadow-lg border-2 border-white uppercase tracking-tighter">LIVE</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                </div>

                {/* AI Analysis Side Panel (Premium Commander View) */}
                <div className="w-full lg:w-[320px] bg-slate-900 rounded-[32px] shadow-2xl transition-all flex flex-col overflow-hidden relative border border-slate-800 shrink-0 h-[500px] lg:h-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
                    
                    <div className="p-5 relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 border border-amber-500/30">
                                    <Icon name="cpu" size={16} />
                                </div>
                                <div>
                                    <h3 className="text-[12px] font-black text-white uppercase tracking-widest whitespace-nowrap">AI 指挥部</h3>
                                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 whitespace-nowrap">Tactical Deep Analysis</p>
                                </div>
                            </div>
                            {selectedItem && (
                                <button onClick={() => setSelectedItem(null)} className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors">
                                    <Icon name="x" size={14} className="text-slate-500" />
                                </button>
                            )}
                        </div>

                        {!selectedItem ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 px-6">
                                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-600 animate-pulse">
                                    <Icon name="mouse-pointer" size={32} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">等待目标指令</h4>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">点击矩阵中的产品，启动跨平台利润探测与市场适应度分析</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col space-y-4 overflow-hidden min-h-0">
                                <div className="flex gap-4 p-3 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-white shadow-2xl p-1 shrink-0">
                                        <img src={selectedItem.image || selectedItem.thumbnail} className="w-full h-full object-contain rounded-lg" />
                                    </div>
                                    <div className="flex flex-col justify-center gap-1.5 overflow-hidden">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-black bg-amber-500 text-slate-900 px-1.5 py-0.5 rounded uppercase tracking-tighter">Target</span>
                                            <span className="text-[11px] font-bold text-slate-500 tabular-nums">ID: {selectedItem.id?.slice(-6)}</span>
                                        </div>
                                        <p className="text-[11px] font-black text-white leading-tight truncate uppercase">{selectedItem.title}</p>
                                    </div>
                                </div>

                                {isAnalyzing ? (
                                    <div className="flex-1 space-y-4 pt-4">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : aiResult ? (
                                    <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-1 custom-scrollbar">
                                        {/* Premium Health Gauge Mockup */}
                                        <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex items-center justify-between relative overflow-hidden group">
                                            <div className="relative z-10">
                                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1 block">市场爆发潜力</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-black text-white tabular-nums">{aiResult.market_fit === 'Critical' ? '98' : '85'}</span>
                                                    <span className="text-[11px] font-bold text-amber-500">%</span>
                                                </div>
                                            </div>
                                            <div className="relative w-16 h-16 flex items-center justify-center">
                                                <svg className="w-full h-full -rotate-90">
                                                    <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-800" />
                                                    <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="176" strokeDashoffset={aiResult.market_fit === 'Critical' ? '10' : '40'} className="text-amber-500 transition-all duration-1000" />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center text-amber-500">
                                                    <Icon name="zap" size={16} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Multi-Platform Benchmarking */}
                                        <div className="space-y-2">
                                            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">跨平台利润探测</h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                {[
                                                    { label: 'Amazon', price: aiResult.prices?.amazon, icon: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg', color: 'slate-800' },
                                                    { label: 'ML Target', price: aiResult.prices?.ml, icon: 'https://http2.mlstatic.com/frontend-assets/ui-navigation/5.18.9/mercadolibre/logo__small@2x.png', color: 'amber-500/20' },
                                                    { label: '1688 Sourcing', price: aiResult.prices?.sourcing_1688, icon: 'https://cbu01.alicdn.com/cms/upload/2016/092/105/2501290_1340156972.png', color: 'emerald-500/20' }
                                                ].map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 rounded-lg bg-white p-1 flex items-center justify-center">
                                                                <img src={item.icon} className="w-full h-full object-contain" />
                                                            </div>
                                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">{item.label}</span>
                                                        </div>
                                                        <span className={`text-[12px] font-black tabular-nums ${idx === 2 ? 'text-emerald-500' : idx === 1 ? 'text-amber-500' : 'text-white'}`}>
                                                            {item.price}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Opportunity Summary */}
                                        <div className="p-4 bg-amber-500 rounded-2xl relative overflow-hidden shadow-xl">
                                            <div className="absolute top-0 right-0 p-1.5 bg-slate-900 text-amber-500 text-[11px] font-black uppercase rounded-bl-xl">Insight</div>
                                            <p className="text-[11px] text-slate-900 font-black leading-relaxed">{aiResult.opportunity}</p>
                                        </div>

                                        {/* Pro/Con Tags */}
                                        <div className="flex flex-nowrap gap-2">
                                            {aiResult.pros.map((p, i) => (
                                                <div key={i} className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[11px] font-black border border-emerald-500/20 uppercase tracking-tighter">✓ {p}</div>
                                            ))}
                                            {aiResult.cons.map((c, i) => (
                                                <div key={i} className="px-2 py-1 bg-red-500/10 text-red-500 rounded-lg text-[11px] font-black border border-red-500/20 uppercase tracking-tighter">✕ {c}</div>
                                            ))}
                                        </div>

                                        {/* Final CTA Section */}
                                        <div className="pt-2">
                                            <div className="flex items-center justify-between mb-3 px-1">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] text-slate-500 font-black uppercase whitespace-nowrap">Net Margin</span>
                                                    <span className="text-xl font-black text-amber-500 tabular-nums">{aiResult.profit_estimate}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[11px] text-slate-500 font-black uppercase block">Retail Rec.</span>
                                                    <span className="text-sm font-black text-white">{aiResult.est_ml_price}</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => window.open(`https://www.google.com/search?q=${selectedItem.title}`, '_blank')}
                                                className="w-full py-4 bg-white text-slate-900 rounded-2xl text-[11px] font-black tracking-[0.2em] hover:bg-amber-500 hover:text-slate-900 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 group"
                                            >
                                                <Icon name="shopping-cart" size={14} className="transition-transform group-hover:scale-125" />
                                                一键全网对标货源
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* System HUD Footer */}
            <div className="mt-4 flex items-center justify-center shrink-0">
                <div className="px-6 py-2 bg-slate-900 rounded-full flex items-center gap-4 shadow-2xl border border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500 animate-pulse" />
                        <span className="text-[11px] text-white font-black tracking-widest uppercase">Node: MX-CORE-01</span>
                    </div>
                    <div className="w-px h-3 bg-slate-800" />
                    <span className="text-[11px] text-slate-500 font-black tracking-widest uppercase">
                        YUNFAN QUANTUM ENGINE v7.1 • ENCRYPTED FEED
                    </span>
                    <div className="w-px h-3 bg-slate-800" />
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 font-mono">{new Date().toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketRadarView;


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
    
    const { items: marketProducts = [], loading, refresh } = useMarketRadar(activeSite, activePlatform);
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
                refresh();
                setIsScanning(false);
            }, 3000);
        } catch (error) {
            console.error('Scan failed:', error);
            setIsScanning(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 p-4 overflow-hidden relative select-none">
            <style dangerouslySetInnerHTML={{ __html: `
                body, html { overflow: hidden !important; height: 100% !important; }
                #root { height: 100% !important; overflow: hidden !important; }
            `}} />
            {/* Top Control Bar (The Commander) */}
            <div className="flex items-center gap-3 mb-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 shrink-0">
                {/* 1. Site Selector with Tooltips */}
                <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
                    {SITES.map(site => (
                        <button
                            key={site.id}
                            title={site.label}
                            onClick={() => setActiveSite(site.id)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                                activeSite === site.id 
                                ? 'bg-amber-500 shadow-lg shadow-amber-200' 
                                : 'bg-slate-50'
                            }`}
                        >
                            <span className="text-lg">{site.flag}</span>
                        </button>
                    ))}
                </div>

                {/* 2. Platform Selector with Colored Logos */}
                <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
                    {PLATFORMS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setActivePlatform(p.id)}
                            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-2 border ${
                                activePlatform === p.id 
                                ? 'bg-slate-900 border-slate-900 shadow-md' 
                                : 'bg-white border-slate-100 hover:border-slate-300'
                            }`}
                        >
                            <img src={p.logo} alt={p.label} className="w-5 h-5 object-contain" />
                            <span className={`text-[9px] font-black tracking-tighter ${activePlatform === p.id ? 'text-white' : 'text-slate-500'}`}>
                                {p.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* 3. AI Deep Scan Input */}
                <div className="flex-1 flex items-center gap-3 bg-slate-50 px-4 py-1.5 rounded-2xl border border-slate-100 focus-within:border-amber-400 transition-all">
                    <Icon name="search" size={14} className="text-slate-400" />
                    <input 
                        type="text" 
                        placeholder={`在 ${SITES.find(s=>s.id===activeSite)?.label} 的 ${activePlatform} 中扫描...`}
                        className="bg-transparent border-none outline-none flex-1 text-[12px] font-medium text-slate-700"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                    />
                    <button 
                        onClick={handleScan}
                        disabled={isScanning}
                        className={`px-5 py-1.5 rounded-xl bg-amber-500 text-white text-[10px] font-black tracking-widest hover:bg-amber-600 transition-all active:scale-95 shadow-lg shadow-amber-100 ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isScanning ? 'SCANNING...' : 'SCAN'}
                    </button>
                </div>
            </div>

            {/* Main Content: 1x6 Matrix */}
            <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
                <div className="flex-1 overflow-hidden px-1 flex flex-col min-h-0">
                    <div className="mb-3 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                                <Icon name="activity" size={16} />
                            </div>
                            <div>
                                <h2 className="text-[12px] font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
                                    {SITES.find(s=>s.id===activeSite)?.label}情报矩阵
                                    <span className="text-amber-500">/ {activePlatform}</span>
                                </h2>
                                <p className="text-[8px] text-slate-400 font-bold tracking-widest uppercase">Intelligent Shadow Feed Active</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                            <div className={`w-1.5 h-1.5 rounded-full ${isScanning ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                            {isScanning ? '正在获取实时情报...' : '节点就绪: MX-01'}
                        </div>
                    </div>

                    {loading || isScanning ? (
                        <div className="grid grid-cols-6 gap-2 flex-1">
                            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18].map(i => (
                                <div key={i} className="bg-white rounded-xl p-2 h-full animate-pulse border border-slate-100">
                                    <div className="w-full h-16 bg-slate-50 rounded-lg mb-2" />
                                    <div className="h-2 w-3/4 bg-slate-50 rounded mb-1" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-6 gap-2 flex-1 overflow-hidden h-full content-start">
                            {safeMarketProducts.slice(0, 18).map((p, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => handleCardClick(p)}
                                    className={`group bg-white rounded-xl border p-1.5 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5 relative flex flex-col ${selectedItem === p ? 'border-amber-500 ring-2 ring-amber-100' : 'border-slate-50'}`}
                                >
                                    <div className="aspect-square rounded-lg overflow-hidden bg-white relative mb-1 shrink-0 border border-slate-50">
                                        <img 
                                            src={p.image || p.thumbnail} 
                                            alt={p.title} 
                                            referrerPolicy="no-referrer"
                                            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" 
                                        />
                                        <div className="absolute top-1 right-1 px-1 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-[6px] font-black text-slate-800 shadow-sm border border-slate-100">
                                            {p.currency || 'MXN'}
                                        </div>
                                    </div>
                                    <div className="space-y-0.5 flex-1 flex flex-col justify-between">
                                        <p className="text-slate-700 font-bold text-[7px] line-clamp-1 leading-tight group-hover:text-amber-600 transition-colors">
                                            {p.title}
                                        </p>
                                        <div className="flex items-center justify-between pt-0.5 border-t border-slate-50 mt-auto">
                                            <span className="text-amber-500 font-black text-[10px] tracking-tighter">
                                                {p.currency === 'MXN' ? '$' : ''}{p.price}
                                            </span>
                                            <div className="w-0.5 h-0.5 rounded-full bg-emerald-500" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* AI Analysis Side Panel (Permanent) */}
                <div className="w-[280px] bg-amber-50/40 rounded-3xl border border-amber-100 shadow-xl transition-all flex flex-col p-4 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">AI 情报分析</h3>
                        </div>
                        {selectedItem && (
                            <button onClick={() => setSelectedItem(null)} className="p-1.5 hover:bg-white/50 rounded-lg transition-colors">
                                <Icon name="x" size={12} className="text-slate-400" />
                            </button>
                        )}
                    </div>

                    {!selectedItem ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 px-4">
                            <div className="w-12 h-12 rounded-full bg-white border border-amber-100 flex items-center justify-center text-amber-300">
                                <Icon name="mouse-pointer" size={20} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">等待选择商品</h4>
                                <p className="text-[8px] text-slate-400 mt-1">点击矩阵卡片启动深度分析</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
                            <div className="flex gap-3">
                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-white shadow-sm border border-slate-100 p-0.5 shrink-0">
                                    <img src={selectedItem.image || selectedItem.thumbnail} className="w-full h-full object-contain rounded-lg" />
                                </div>
                                <div className="flex flex-col justify-center gap-1 overflow-hidden">
                                    <span className="text-[7px] font-black bg-slate-900 text-white px-1 py-0.5 rounded w-fit uppercase tracking-tighter">官方实时价格</span>
                                    <p className="text-[10px] font-bold text-slate-800 leading-tight truncate-2-lines">{selectedItem.title}</p>
                                </div>
                            </div>

                            {isAnalyzing ? (
                                <div className="space-y-3">
                                    <div className="h-16 bg-white/50 rounded-xl animate-pulse" />
                                    <div className="h-16 bg-white/50 rounded-xl animate-pulse" />
                                    <div className="h-20 bg-white/50 rounded-xl animate-pulse" />
                                </div>
                            ) : aiResult ? (
                                <div className="flex flex-col h-full space-y-3">
                                    {/* Multi-Platform Price Benchmarking (Unified to CNY) */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between pl-1">
                                            <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest">全域价格对标</h4>
                                            <span className="text-[7px] font-bold text-amber-600 bg-amber-100 px-1 py-0.5 rounded uppercase">CNY</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-1.5">
                                            <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                                                <div className="flex items-center gap-1.5">
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg" className="w-3.5 h-3.5" />
                                                    <span className="text-[9px] font-bold text-slate-500">Amazon</span>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-800">{aiResult.prices?.amazon || '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-amber-500">
                                                <div className="flex items-center gap-1.5">
                                                    <img src="https://http2.mlstatic.com/frontend-assets/ui-navigation/5.18.9/mercadolibre/logo__small@2x.png" className="w-7 h-3 object-contain" />
                                                    <span className="text-[9px] font-bold text-slate-500">ML 对标</span>
                                                </div>
                                                <span className="text-[10px] font-black text-amber-600">{aiResult.prices?.ml || '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
                                                {aiResult.is_real_sourcing && (
                                                    <div className="absolute top-0 right-0 px-1.5 py-0.5 bg-emerald-500 text-white text-[5px] font-black uppercase tracking-tighter rounded-bl-lg">LIVE</div>
                                                )}
                                                <div className="flex items-center gap-1.5">
                                                    <img src="https://cbu01.alicdn.com/cms/upload/2016/092/105/2501290_1340156972.png" className="w-3.5 h-3.5" />
                                                    <span className="text-[9px] font-bold text-slate-500">1688 采购</span>
                                                </div>
                                                <span className="text-[10px] font-black text-emerald-600">{aiResult.prices?.sourcing_1688 || '-'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-white rounded-xl border border-white shadow-sm relative overflow-hidden shrink-0">
                                        <div className="absolute top-0 right-0 p-1 bg-emerald-500 text-white text-[6px] font-black uppercase rounded-bl-lg">Intel</div>
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <div className={`w-1 h-1 rounded-full ${aiResult.market_fit === 'High' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                            <span className="text-[9px] font-black text-slate-700 uppercase">机会: {aiResult.market_fit}</span>
                                        </div>
                                        <p className="text-[9px] text-slate-600 font-medium leading-normal">{aiResult.opportunity}</p>
                                    </div>

                                    <div className="space-y-2 shrink-0">
                                        <h4 className="text-[8px] font-black text-amber-600/50 uppercase tracking-widest pl-1">卖点与风险</h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {aiResult.pros.slice(0, 2).map((p, idx) => (
                                                <span key={idx} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg text-[8px] font-bold border border-emerald-100/50 truncate max-w-[110px]">✓ {p}</span>
                                            ))}
                                            {aiResult.cons.slice(0, 1).map((c, idx) => (
                                                <span key={idx} className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded-lg text-[8px] font-bold border border-red-100/50 truncate max-w-[110px]">✕ {c}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-3 bg-slate-900 rounded-xl shadow-lg relative overflow-hidden shrink-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">建议售价</span>
                                            <span className="text-[12px] font-black text-white">{aiResult.est_ml_price}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-white/10 pt-1.5 mt-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase">毛利预估</span>
                                            <span className="text-[14px] font-black text-amber-500">{aiResult.profit_estimate}</span>
                                        </div>
                                    </div>

                                    <div className="pt-1 mt-auto">
                                        <button 
                                            onClick={() => window.open(`https://www.google.com/search?q=${selectedItem.title}`, '_blank')}
                                            className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <Icon name="external-link" size={12} />
                                            查看全网货源
                                        </button>
                                        <p className="text-[7px] text-slate-400 text-center mt-2 font-bold uppercase tracking-widest">Yunfan AI Engine</p>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>
            
            {/* System Status Footer */}
            <div className="mt-4 flex items-center justify-center">
                <div className="px-5 py-1.5 bg-slate-900 rounded-full flex items-center gap-2.5 shadow-xl">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] text-slate-400 font-black tracking-[0.2em] uppercase">
                        Global Intel Sync • MX-SCAN-V6.1 • Live
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MarketRadarView;

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
    { id: 'amazon', label: 'AMAZON', icon: 'shopping-bag' },
    { id: '1688', label: '1688', icon: 'box' },
    { id: 'aliexpress', label: 'AE', icon: 'globe' },
    { id: 'temu', label: 'TEMU', icon: 'zap' }
];

const MarketRadarView = () => {
    const [activeSite, setActiveSite] = useState('MLM');
    const [activePlatform, setActivePlatform] = useState('amazon');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    
    const { items: marketProducts = [], loading, refresh } = useMarketRadar(activeSite, activePlatform);
    const safeMarketProducts = Array.isArray(marketProducts) ? marketProducts : [];

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
            
            // In a real scenario, we'd wait for a webhook or poll. 
            // For now, we simulate the scan by refreshing after a delay.
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
        <div className="flex flex-col h-screen bg-slate-50 p-6 overflow-hidden">
            {/* Top Control Bar (The Commander) */}
            <div className="flex items-center gap-4 mb-6 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                {/* 1. Site Selector */}
                <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
                    {SITES.map(site => (
                        <button
                            key={site.id}
                            onClick={() => setActiveSite(site.id)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                activeSite === site.id 
                                ? 'bg-amber-500 scale-110 shadow-lg shadow-amber-200' 
                                : 'bg-slate-50 hover:bg-slate-100'
                            }`}
                        >
                            <span className="text-xl">{site.flag}</span>
                        </button>
                    ))}
                </div>

                {/* 2. Platform Selector */}
                <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
                    {PLATFORMS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setActivePlatform(p.id)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
                                activePlatform === p.id 
                                ? 'bg-slate-900 text-white shadow-lg' 
                                : 'text-slate-400 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Icon name={p.icon} size={14} />
                                {p.label}
                            </div>
                        </button>
                    ))}
                </div>

                {/* 3. AI Deep Scan Input */}
                <div className="flex-1 flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 focus-within:border-amber-400 transition-all">
                    <Icon name="search" size={16} className="text-slate-400" />
                    <input 
                        type="text" 
                        placeholder={`在 ${activeSite} 的 ${activePlatform} 中深度扫描关键词...`}
                        className="bg-transparent border-none outline-none flex-1 text-[13px] font-medium text-slate-700"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                    />
                    <button 
                        onClick={handleScan}
                        disabled={isScanning}
                        className={`px-6 py-2 rounded-xl bg-amber-500 text-white text-[11px] font-black tracking-widest hover:bg-amber-600 transition-all active:scale-95 shadow-lg shadow-amber-100 ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isScanning ? 'SCANNING...' : 'AI SCAN'}
                    </button>
                </div>
            </div>

            {/* Main Content: 1x4 Matrix */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-[14px] font-black text-slate-800 tracking-tight uppercase">
                            {activeSite} Intelligence Feed <span className="text-amber-500">/ {activePlatform}</span>
                        </h2>
                        <p className="text-[9px] text-slate-400 font-bold tracking-widest">REAL-TIME SHADOW COLLECTOR ACTIVE</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                        <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                        {isScanning ? '影子采集节点正在同步数据...' : '同步节点就绪 (Node MX-01)'}
                    </div>
                </div>

                {loading || isScanning ? (
                    <div className="grid grid-cols-4 gap-4">
                        {[1,2,3,4,5,6,7,8].map(i => (
                            <div key={i} className="bg-white rounded-3xl p-4 h-[220px] animate-pulse border border-slate-100">
                                <div className="w-full h-32 bg-slate-50 rounded-2xl mb-4" />
                                <div className="h-3 w-3/4 bg-slate-50 rounded mb-2" />
                                <div className="h-3 w-1/2 bg-slate-50 rounded" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-4 pb-12">
                        {safeMarketProducts.map((p, i) => (
                            <div key={i} className="group bg-white rounded-3xl border border-slate-100 p-3 hover:border-amber-400 transition-all hover:shadow-2xl hover:-translate-y-1 relative">
                                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 relative mb-3">
                                    <img 
                                        src={p.image || p.thumbnail} 
                                        alt={p.title} 
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    />
                                    <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[9px] font-black text-slate-800 shadow-sm border border-slate-100">
                                        {p.currency || 'MXN'}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-slate-800 font-bold text-[11px] line-clamp-2 min-h-[30px] leading-snug group-hover:text-amber-600 transition-colors">
                                        {p.title}
                                    </p>
                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-amber-500 font-black text-[15px] tracking-tight">
                                            {p.currency === 'MXN' ? '$' : ''}{p.price}
                                        </span>
                                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter bg-slate-50 px-2 py-1 rounded-lg">
                                            🔥 Trending
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* System Status Footer */}
            <div className="mt-4 flex items-center justify-center">
                <div className="px-6 py-2 bg-slate-900 rounded-full flex items-center gap-3 shadow-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] text-slate-400 font-black tracking-widest uppercase">
                        Cloud Sync Active • Agent: ML-Pulse-V6 • Latency: 42ms
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MarketRadarView;

import React, { useState } from 'react';
import Icon from '../components/Icon';
import { usePriceCheck } from '../hooks/usePriceCheck';

const SmartPriceCheckView = () => {
    const { queue = [], loading, calculateProfit, deleteItem, refresh } = usePriceCheck();
    const [selectedItem, setSelectedItem] = useState(null);
    const [results, setResults] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [editParams, setEditParams] = useState({
        cost_cny: 0,
        weight_g: 0,
        target_price_local: 0
    });

    const safeQueue = Array.isArray(queue) ? queue : [];

    const handleCheck = async (item) => {
        setSelectedItem(item);
        setResults(null);
        setIsCalculating(true);
        
        const initialParams = {
            cost_cny: item.price_cny || 25,
            weight_g: item.weight_g || 300,
            site: item.target_site || 'MLM',
            target_price_local: 499 // Initial target
        };
        
        setEditParams(initialParams);
        const res = await calculateProfit(initialParams);
        setResults(res);
        setIsCalculating(false);
    };

    const handleRecalculate = async () => {
        if (!selectedItem) return;
        setIsCalculating(true);
        const res = await calculateProfit({
            ...editParams,
            site: selectedItem.target_site || 'MLM'
        });
        setResults(res);
        setIsCalculating(false);
    };

    return (
        <div className="h-full overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-4">
                <div>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none whitespace-nowrap">智能核价中心</h3>
                    <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-2 whitespace-nowrap">AI-Powered Profit Intelligence</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest leading-none">核价引擎就绪</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
                {/* Left: Queue */}
                <div className="flex-1 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">待核价队列 ({safeQueue.length})</h4>
                        <div className="flex items-center gap-4">
                            <button onClick={refresh} className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                <Icon name="refresh-cw" className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                                刷新
                            </button>
                            <button className="text-[11px] font-bold text-slate-500 hover:text-slate-600">清空队列</button>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {safeQueue.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => handleCheck(item)}
                                className={`group p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4
                                    ${selectedItem?.id === item.id ? 'bg-blue-50 border-blue-200 shadow-md' : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm'}`}
                            >
                                <div className="w-16 h-16 rounded-xl bg-slate-50 overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <Icon name="image" className="w-6 h-6 text-slate-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 whitespace-nowrap overflow-hidden">
                                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-black uppercase tracking-widest text-slate-500 shrink-0">{item.source_platform}</span>
                                        <span className="text-[11px] text-slate-500 font-bold truncate">{new Date(item.created_at).toLocaleString()}</span>
                                    </div>
                                    <h5 className="text-[13px] font-bold text-slate-800 truncate leading-tight mb-1">{item.title}</h5>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 text-[11px] font-black text-slate-500">
                                            <span className="text-slate-500">成本:</span>
                                            <span className={item.price_cny ? "text-slate-900" : "text-rose-500"}>
                                                {item.price_cny ? `¥${item.price_cny}` : '未抓取'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[11px] font-black text-slate-500">
                                            <span className="text-slate-500">重量:</span>
                                            <span className={item.weight_g ? "text-slate-900" : "text-amber-500"}>
                                                {item.weight_g ? `${item.weight_g}g` : '预估300g'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                                    className="p-2 text-slate-500 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Icon name="trash-2" className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        {safeQueue.length === 0 && !loading && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 py-20">
                                <Icon name="inbox" className="w-12 h-12 mb-4 opacity-20" />
                                <p className="text-[11px] font-black uppercase tracking-widest">队列为空，请使用插件采集</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Analysis Dashboard */}
                <div className="w-full lg:w-[450px] flex flex-col gap-6 h-full min-h-[500px] lg:min-h-0 shrink-0">
                    <div className={`flex-1 bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden flex flex-col transition-all duration-700 ${!selectedItem ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                        {/* Background Decoration */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8">
                                <div className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-black uppercase tracking-widest">盈利能力预测 (Profit Outlook)</div>
                                {results && (
                                    <div className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${results.margin > 20 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                        {results.margin > 20 ? '极佳' : '风险'}
                                    </div>
                                )}
                            </div>

                            {selectedItem ? (
                                <div className="flex-1 flex flex-col">
                                    <div className="mb-8 p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                                        <p className="text-[11px] font-black text-white/60 uppercase tracking-widest mb-2">核价参数调整 (Adjust Params)</p>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-[11px] text-white/70 mb-1">成本 (CNY)</label>
                                                <input 
                                                    type="number" 
                                                    value={editParams.cost_cny}
                                                    onChange={(e) => setEditParams({...editParams, cost_cny: parseFloat(e.target.value)})}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] font-bold focus:border-blue-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] text-white/70 mb-1">重量 (g)</label>
                                                <input 
                                                    type="number" 
                                                    value={editParams.weight_g}
                                                    onChange={(e) => setEditParams({...editParams, weight_g: parseFloat(e.target.value)})}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] font-bold focus:border-blue-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] text-white/70 mb-1">售价 (Local)</label>
                                                <input 
                                                    type="number" 
                                                    value={editParams.target_price_local}
                                                    onChange={(e) => setEditParams({...editParams, target_price_local: parseFloat(e.target.value)})}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] font-bold focus:border-blue-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <button 
                                            onClick={handleRecalculate}
                                            className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                                        >
                                            重新计算利润 (Recalculate)
                                        </button>
                                    </div>

                                    <div className="mb-10 text-center">
                                        <p className="text-[11px] font-black text-white/60 uppercase tracking-[0.2em] mb-4">预计净利润率</p>
                                        <h2 className="text-8xl font-black italic tracking-tighter tnum leading-none">
                                            {isCalculating ? '--' : (results?.margin || 0)}%
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-10">
                                        <div className="p-5 rounded-3xl bg-white/5 border border-white/5">
                                            <p className="text-[11px] font-black text-white/60 uppercase tracking-widest mb-2">预估实收 (CNY)</p>
                                            <p className="text-2xl font-black italic tnum leading-none text-emerald-400">¥{isCalculating ? '--' : (results?.net_profit_cny || 0)}</p>
                                        </div>
                                        <div className="p-5 rounded-3xl bg-white/5 border border-white/5">
                                            <p className="text-[11px] font-black text-white/60 uppercase tracking-widest mb-2">盈亏平衡价 (Local)</p>
                                            <p className="text-2xl font-black italic tnum leading-none">{isCalculating ? '--' : (results?.break_even_local || 0)}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
                                            <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">平台佣金</span>
                                            <span className="text-[11px] font-black tnum">-${results?.details?.commission_local || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
                                            <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">预扣税金 (VAT/ISR)</span>
                                            <span className="text-[11px] font-black tnum">-${results?.details?.tax_local || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
                                            <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">跨境运费</span>
                                            <span className="text-[11px] font-black tnum">-${results?.details?.shipping_local || 0}</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => { deleteItem(selectedItem.id); setSelectedItem(null); setResults(null); }}
                                        className="w-full py-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-black uppercase tracking-widest transition-all border border-white/10 mt-6"
                                    >
                                        从核价队列移除 (Finished)
                                    </button>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-white/60">
                                    <Icon name="activity" className="w-16 h-16 mb-6" />
                                    <p className="text-[11px] font-black uppercase tracking-widest">选择一个项目开始核价</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartPriceCheckView;



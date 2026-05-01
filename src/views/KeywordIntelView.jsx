import { useAppContext } from '../context/AppContext';
import { useState, useRef } from 'react';
import Icon from '../components/Icon.jsx';
import { useKeywords } from '../hooks/useKeywords';

const KeywordIntelView = (props) => {
    const { activeShop, shopList, showToast } = useAppContext();
    const { trending, gaps, loading, error } = useKeywords('MLM');

    return (
        <div className="h-full overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700">
            {/* Header with Visual Status */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 pb-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
                            <Icon name="search" className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">关键词情报局</h3>
                    </div>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em]">Real-time Semantic Analysis & Traffic Radar</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">情报时效</p>
                        <p className="text-[14px] font-black text-slate-900 uppercase">每 10 分钟自动更新</p>
                    </div>
                    <button className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-500/20 transition-all active:scale-95 shadow-sm">
                        <Icon name="refresh-cw" className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Matrix View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 今日热搜 */}
                <div className="solid-card p-10 rounded-[40px] border-slate-200 space-y-10 bg-white shadow-xl shadow-slate-200/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 transition-transform duration-1000 group-hover:scale-125"></div>
                    
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="text-slate-900 font-black text-2xl tracking-tighter italic uppercase">今日热搜</h4>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Trending Pulse</p>
                        </div>
                        <Icon name="trending-up" className="w-8 h-8 text-emerald-600/20" />
                    </div>

                    <div className="space-y-3 relative z-10">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <Icon name="loader" className="w-8 h-8 animate-spin text-slate-200" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">同步热度数据中...</span>
                            </div>
                        ) : (trending || []).map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 border border-transparent hover:border-emerald-500/20 hover:bg-white transition-all cursor-pointer group/item">
                                <div className="flex items-center gap-4">
                                    <span className="w-6 text-[11px] font-black text-slate-300 group-hover/item:text-emerald-500 transition-colors">#{i+1}</span>
                                    <div>
                                        <span className="text-slate-900 font-black text-[15px] tracking-tight">{item.word}</span>
                                        {item.source && (
                                            <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-200 text-slate-500 text-[8px] font-black uppercase tracking-tighter">
                                                {item.source === 'ML_OFFICIAL' ? 'ML官方数据' : '本地数据'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-emerald-600 font-black font-mono text-[13px]">{item.growth || '--'}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 流量蓝海 */}
                <div className="solid-card p-10 rounded-[40px] border-slate-200 space-y-10 bg-white shadow-xl shadow-slate-200/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 transition-transform duration-1000 group-hover:scale-125"></div>
                    
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="text-slate-900 font-black text-2xl tracking-tighter italic uppercase">流量蓝海</h4>
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Market Gaps Radar</p>
                        </div>
                        <Icon name="zap" className="w-8 h-8 text-amber-600/20" />
                    </div>

                    <div className="space-y-3 relative z-10">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <Icon name="loader" className="w-8 h-8 animate-spin text-slate-200" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">嗅探市场缺口中...</span>
                            </div>
                        ) : (gaps || []).map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 border border-transparent hover:border-amber-500/20 hover:bg-white transition-all cursor-pointer group/item">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                        <Icon name="search" className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-slate-900 font-black text-[15px] tracking-tight">{item.word}</p>
                                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-600 text-[8px] font-black uppercase tracking-tighter">云帆算法</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase mt-0.5 tracking-wider">搜索量: {item.volume || '嗅探中'} · 竞争: {item.competition || '计算中'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-widest">推荐商机</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Analysis Footer */}
            <div className="solid-card p-10 rounded-[40px] bg-white border-slate-200 flex flex-col md:flex-row items-center gap-10">
                <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center shrink-0 shadow-2xl shadow-slate-900/40">
                    <Icon name="sparkles" className="w-10 h-10 text-white animate-pulse" />
                </div>
                <div className="flex-1 space-y-2">
                    <h5 className="text-xl font-black text-slate-900 tracking-tight">AI 关键词战术建议</h5>
                    <p className="text-slate-500 text-[13px] leading-relaxed font-bold">
                        检测到墨西哥站 <span className="text-blue-600">"办公收纳"</span> 类目搜索量持续攀升，但竞争程度尚未饱和。建议在 Version 1.1 的标题优化中优先埋入 <span className="text-emerald-600">"Organizador de Escritorio Minimalista"</span> 等语义词，预计可提升 15% 曝光。
                    </p>
                </div>
                <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-slate-900/10 whitespace-nowrap">
                    导出情报报告
                </button>
            </div>
        </div>
    );
};

export default KeywordIntelView;
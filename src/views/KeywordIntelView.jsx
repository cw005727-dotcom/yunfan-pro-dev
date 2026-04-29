import { useAppContext } from '../context/AppContext';
import { useState, useRef } from 'react';
import Icon from '../components/Icon.jsx';
import { useKeywords } from '../hooks/useKeywords';

const KeywordIntelView = (props) => {
    const { activeShop, shopList, showToast } = useAppContext();
    const { trending, gaps, loading, error } = useKeywords('MLM');

            return (
                <div className="h-full overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight whitespace-nowrap">关键词情报局</h3>
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-1 whitespace-nowrap">Real-time Semantic Analysis</p>
                    </div>
                </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 热搜趋势 */}
                        <div className="solid-card p-10 rounded-[40px] border-slate-200 space-y-8">
                            <div className="flex items-center justify-between">
                                <h4 className="text-slate-900 font-black text-xl uppercase tracking-wider italic">今日热搜</h4>
                                <Icon name="trending-up" className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="flex items-center justify-center py-10"><Icon name="loader" className="w-6 h-6 animate-spin text-slate-500" /></div>
                                ) : (trending || []).map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                        <span className="text-slate-900 font-bold">{item.word}</span>
                                        <span className="text-emerald-600 font-black tnum">{item.growth}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 流量缺口 */}
                        <div className="solid-card p-10 rounded-[40px] border-slate-200 space-y-8">
                            <div className="flex items-center justify-between">
                                <h4 className="text-slate-900 font-black text-xl uppercase tracking-wider italic">流量蓝海</h4>
                                <Icon name="zap" className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="flex items-center justify-center py-10"><Icon name="loader" className="w-6 h-6 animate-spin text-slate-500" /></div>
                                ) : (gaps || []).map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div>
                                            <p className="text-slate-900 font-bold">{item.word}</p>
                                            <p className="text-[11px] text-slate-500 font-black uppercase mt-1">竞争度: {item.competition}</p>
                                        </div>
                                        <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-600 text-[11px] font-black">商机</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );
};

export default KeywordIntelView;
import Icon from '../components/Icon.jsx';

import { useState, useMemo } from 'react';
import { useProductPerformance } from '../hooks/useProductPerformance';

const ProductMaintainView = () => {
    const { products, loading } = useProductPerformance();

    const stats = useMemo(() => {
        if (!products) return { total: 0, online: 0, lowHealth: 0 };
        return {
            total: products.length,
            online: products.filter(p => p.status === 'active').length || products.length,
            lowHealth: products.filter(p => p.health_score < 70).length
        };
    }, [products]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-blue-500 animate-spin"></div>
            <span className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">正在接入 Version 1.1 实时数据中枢...</span>
        </div>
    );

    return (
        <div className="h-full overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 pb-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/20">
                            <Icon name="package" className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">商品主档案</h3>
                    </div>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em]">Global Product Catalog & Health Monitoring</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button className="px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:border-blue-500/20 transition-all shadow-sm">
                        批量导出
                    </button>
                    <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10">
                        新增商品
                    </button>
                </div>
            </div>

            {/* Stats Ribbon (V1.1 Standard) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: '库存 SKU', val: stats.total, color: 'blue', icon: 'database' },
                    { label: '在线售卖', val: stats.online, color: 'emerald', icon: 'check-circle' },
                    { label: '健康预警', val: stats.lowHealth, color: 'rose', icon: 'alert-triangle' },
                    { label: '今日更新', val: '24', color: 'amber', icon: 'refresh-cw' }
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between h-[120px] group hover:border-blue-500/20 transition-all">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
                                <span className="text-[7px] px-1 bg-slate-50 text-slate-300 rounded font-black uppercase tracking-tighter">[ML官方]</span>
                            </div>
                            <Icon name={s.icon} className={`w-4 h-4 text-${s.color}-500 opacity-20 group-hover:opacity-100 transition-opacity`} />
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className={`text-3xl font-black text-slate-900 font-mono`}>{s.val}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Units</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Table Container */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                <div className="px-8 py-6 bg-slate-50/30 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">全量商品矩阵</span>
                        <div className="h-4 w-px bg-slate-200"></div>
                        <span className="text-[11px] text-slate-400 font-bold">已同步 {products?.length} 条记录</span>
                    </div>
                    <div className="flex gap-2">
                        <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                            <Icon name="filter" className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">商品信息 (SKU / ID)</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">站点</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">实时价格</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">健康状态</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {products?.slice(0, 15).map((p, idx) => (
                                <tr key={idx} className="group hover:bg-blue-50/30 transition-all">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-100 shrink-0 group-hover:scale-105 transition-transform">
                                                <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[13px] font-black text-slate-900 line-clamp-1">{p.name}</p>
                                                <p className="text-[10px] text-slate-400 font-black font-mono tracking-widest">{p.item_id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                                            {p.site_id}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[14px] font-black text-slate-900 font-mono tracking-tight">
                                            ${p.price?.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center px-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[9px] font-black uppercase ${p.health_score > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                        Score: {p.health_score}
                                                    </span>
                                                    <span className="text-[7px] px-1 bg-slate-100 text-slate-400 rounded font-black uppercase tracking-tighter">[云帆算法]</span>
                                                </div>
                                            </div>
                                            <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-1000 ${p.health_score > 80 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-amber-500'}`} 
                                                     style={{ width: `${p.health_score}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-100">
                                                <Icon name="edit-3" className="w-4 h-4" />
                                            </button>
                                            <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-100">
                                                <Icon name="external-link" className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 text-center">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">已展示核心主数据列表 · 更多高级操作请使用「数据分析中心」</p>
                </div>
            </div>
        </div>
    );
};

export default ProductMaintainView;

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
        <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-rose-500 animate-spin"></div>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">正在同步商品数据...</span>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">商品维护</h3>
                    <p className="text-slate-400 text-xs font-medium mt-1">商品列表管理与批量操作</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-[11px] text-slate-500 font-bold">已连接实时数据</span>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
                {[
                    { icon: 'package', label: '商品总数', val: stats.total, color: 'indigo' },
                    { icon: 'check-circle', label: '在线', val: stats.online, color: 'emerald' },
                    { icon: 'alert-triangle', label: '需优化', val: stats.lowHealth, color: 'amber' },
                    { icon: 'x-circle', label: '已下架', val: '0', color: 'slate' },
                ].map((k, i) => (
                    <div key={i} className={`rounded-2xl border px-4 py-3 flex items-center gap-3 ${
                        k.color === 'indigo' ? 'bg-indigo-50 border-indigo-100'
                        : k.color === 'emerald' ? 'bg-emerald-50 border-emerald-100'
                        : k.color === 'amber' ? 'bg-amber-50 border-amber-100'
                        : 'bg-slate-50 border-slate-100'
                    }`}>
                        <Icon name={k.icon} className={`w-5 h-5 ${
                            k.color === 'indigo' ? 'text-indigo-400'
                            : k.color === 'emerald' ? 'text-emerald-400'
                            : k.color === 'amber' ? 'text-amber-400'
                            : 'text-slate-400'
                        }`} />
                        <div>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{k.label}</p>
                            <p className={`text-xl font-black ${
                                k.color === 'indigo' ? 'text-indigo-600'
                                : k.color === 'emerald' ? 'text-emerald-600'
                                : k.color === 'amber' ? 'text-amber-600'
                                : 'text-slate-500'
                            }`}>{k.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="solid-card rounded-[24px] border border-slate-200 overflow-hidden bg-white">
                <div className="px-6 py-4 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">商品明细表</p>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">显示最近同步的 {products?.length} 件商品</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">商品信息</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">站点</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">价格</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">状态</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">健康分</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products?.slice(0, 10).map((p, idx) => (
                                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                                            <div>
                                                <p className="text-xs font-bold text-slate-800 line-clamp-1">{p.name}</p>
                                                <p className="text-[9px] text-slate-400 font-mono mt-0.5">{p.item_id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase">{p.site_id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-black text-slate-700">${p.price}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">ACTIVE</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full max-w-[60px] overflow-hidden">
                                                <div className={`h-full rounded-full ${p.health_score > 80 ? 'bg-emerald-400' : 'bg-amber-400'}`} style={{ width: `${p.health_score}%` }}></div>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-600">{p.health_score}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 bg-slate-50/30 text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">已加载前 10 条数据 · 完整操作请前往「商品性能表」</p>
                </div>
            </div>
        </div>
    );
};

export default ProductMaintainView;

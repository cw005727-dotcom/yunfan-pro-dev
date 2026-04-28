import Icon from '../components/Icon.jsx';

const ProductCollectView = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">产品采集</h3>
                    <p className="text-slate-400 text-xs font-medium mt-1">竞品数据抓取与市场调研</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                    <span className="text-[11px] text-slate-500 font-bold">开发中</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { icon: 'search', title: '关键词采集', desc: '输入关键词，抓取美客多全站搜索结果', color: 'amber', stat: 'TOP 100' },
                    { icon: 'trending-up', title: '竞品监控', desc: '监控指定 ASIN 的价格/评分/排名变化', color: 'rose', stat: '24/7' },
                    { icon: 'bar-chart-2', title: '市场分析', desc: '类目市场容量、季节性、竞争度分析', color: 'emerald', stat: 'AI+' },
                ].map((item, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                item.color === 'amber' ? 'bg-amber-50 text-amber-500'
                                : item.color === 'rose' ? 'bg-rose-50 text-rose-500'
                                : 'bg-emerald-50 text-emerald-500'
                            }`}>
                                <Icon name={item.icon} className="w-5 h-5" />
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                item.color === 'amber' ? 'bg-amber-100 text-amber-600'
                                : item.color === 'rose' ? 'bg-rose-100 text-rose-600'
                                : 'bg-emerald-100 text-emerald-600'
                            }`}>{item.stat}</span>
                        </div>
                        <p className="text-[12px] font-black text-slate-800">{item.title}</p>
                        <p className="text-[10px] text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>

            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-10 flex flex-col items-center gap-3">
                <Icon name="download-cloud" className="w-10 h-10 text-slate-300" />
                <p className="text-[12px] text-slate-400 font-black uppercase tracking-widest">数据采集中 · 即将上线</p>
            </div>
        </div>
    );
};

export default ProductCollectView;

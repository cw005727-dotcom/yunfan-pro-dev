import { useAppContext } from '../context/AppContext';
import Icon from '../components/Icon.jsx';

const ActivityCenterView = () => {
    return (
        <div className="h-full overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700 text-slate-900">
            {/* Header with Stats */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                        <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">活动大厅</h3>
                    </div>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em]">Official Campaigns & Growth Incentives</p>
                </div>
                
                <div className="flex gap-10">
                    {[
                        { label: '正在进行', val: '08', color: 'text-blue-600' },
                        { label: '即将开始', val: '03', color: 'text-amber-600' },
                        { label: '累计参与', val: '142', color: 'text-slate-400' }
                    ].map((s, i) => (
                        <div key={i} className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                            <p className={`text-2xl font-black font-mono ${s.color}`}>{s.val}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Campaign Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Section 1: Official Promotions */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <Icon name="award" className="w-4 h-4 text-amber-500" />
                            官方年度大促
                        </h4>
                        <span className="text-[10px] font-bold text-slate-400">查看更多</span>
                    </div>
                    
                    <div className="space-y-4">
                        {[
                            { title: '2024 Hot Sale 墨西哥站', date: '05.23 - 05.31', discount: '最高 50% OFF', status: '报名倒计时', color: 'blue' },
                            { title: 'El Buen Fin 购物节预备', date: '11.15 - 11.18', discount: '全站流量扶持', status: '预热中', color: 'indigo' }
                        ].map((promo, i) => (
                            <div key={i} className="group solid-card p-6 rounded-[32px] bg-white border-slate-100 hover:border-blue-500/20 transition-all cursor-pointer relative overflow-hidden shadow-sm">
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${promo.color === 'blue' ? 'bg-blue-500' : 'bg-indigo-500'}`}></div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="space-y-3">
                                        <h5 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">{promo.title}</h5>
                                        <div className="flex items-center gap-3">
                                            <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-black text-slate-500 uppercase tracking-wider">{promo.date}</span>
                                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider">{promo.discount}</span>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                        promo.status.includes('报名') ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-400 border-slate-100'
                                    }`}>
                                        {promo.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 2: Seller Growth */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <Icon name="zap" className="w-4 h-4 text-blue-500" />
                            成长激励计划
                        </h4>
                        <span className="text-[10px] font-bold text-slate-400">规则说明</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { title: '新卖家"启航"激励', desc: '新店前 3 个月广告费 50% 返还', icon: 'rocket', stat: '进行中' },
                            { title: '极速物流补贴', desc: 'Full 仓发货订单每单补贴 $5 MXN', icon: 'truck', stat: '已生效' },
                            { title: '金牌卖家争夺战', desc: '提升等级即可获得 1对1 专家咨询', icon: 'medal', stat: '即将开启' }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-5 rounded-[24px] border border-slate-100 hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-5 shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-900/10">
                                    <Icon name={item.icon} className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[14px] font-black text-slate-900 truncate">{item.title}</p>
                                    <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">{item.desc}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${item.stat === '进行中' ? 'text-blue-600' : item.stat === '已生效' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {item.stat}
                                    </span>
                                    <Icon name="chevron-right" className="w-3 h-3 text-slate-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Insight Card */}
            <div className="bg-slate-900 rounded-[40px] p-10 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                <div className="relative z-10 space-y-4 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30">
                        <Icon name="info" className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">AI 运营策略</span>
                    </div>
                    <h4 className="text-white text-2xl md:text-3xl font-black tracking-tight leading-tight">
                        发现 3 个与您店铺高度匹配的官方活动，参与预计可提升单店流量 120%
                    </h4>
                    <button className="px-8 py-3.5 bg-white text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95 shadow-xl shadow-white/10">
                        立即一键报名
                    </button>
                </div>
                <div className="relative z-10 flex-1 flex justify-center">
                    <div className="w-48 h-48 rounded-full border-8 border-blue-500/20 flex flex-col items-center justify-center animate-pulse">
                        <span className="text-5xl font-black text-white font-mono">12</span>
                        <span className="text-[11px] font-black text-blue-400 uppercase tracking-widest mt-1">待处理提醒</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityCenterView;

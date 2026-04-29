import { useAppContext } from '../context/AppContext';
import Icon from '../components/Icon.jsx';

const ActivityCenterView = () => (
    <div className="h-full overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700 text-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-8">
            <div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight whitespace-nowrap">活动中心</h3>
                <p className="text-slate-500 text-[11px] font-bold uppercase mt-1 whitespace-nowrap tracking-wider">Official Promotions & Campaigns</p>
            </div>
            <div className="px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 text-[11px] font-black uppercase tracking-widest border border-blue-500/20">3 条新通知</div>
        </div>
        <div className="grid grid-cols-1 gap-6">
            {[
                { title: '2024 Hot Sale 官方大促预备会议', time: '明日 14:00', type: '会议', status: '报名中' },
                { title: '全站点"极速物流"流量补贴计划', time: '长期有效', type: '补贴', status: '已生效' },
                { title: '新卖家"启航"成长激励计划 - 第三期', time: '2024-05-01 截止', type: '激励', status: '进行中' }
            ].map((act, i) => (
                <div key={i} className="solid-card p-8 rounded-[32px] flex items-center justify-between group hover:border-blue-500/20 transition-all cursor-pointer shadow-sm">
                    <div className="flex items-center gap-8">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex flex-col items-center justify-center border border-slate-200 group-hover:border-blue-500/30 transition-all">
                            <Icon name="calendar" className="w-6 h-6 text-slate-500 group-hover:text-blue-600" />
                        </div>
                        <div>
                            <h4 className="text-slate-900 font-bold text-xl group-hover:text-blue-600 transition-colors">{act.title}</h4>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-[11px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1.5"><Icon name="clock" className="w-3 h-3" /> {act.time}</span>
                                <span className="text-[11px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1.5"><Icon name="tag" className="w-3 h-3" /> {act.type}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="px-6 py-2 rounded-xl bg-blue-600/10 text-blue-600 text-[11px] font-black uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-all">{act.status}</span>
                        <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 hover:text-white hover:bg-blue-600 transition-all border border-slate-200">
                            <Icon name="chevron-right" className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default ActivityCenterView;

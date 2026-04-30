import { useState, useEffect } from 'react';
import { API_BASE } from '../api/client';

const NewsView = () => {
    const [articles, setArticles] = useState([]);
    const [activeTab, setActiveTab] = useState('ALL');

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = await fetch(`${API_BASE}/cms/articles`);
                const data = await res.json();
                setArticles(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                setArticles([]);
            }
        };
        fetchArticles();
    }, []);

    const displayArticles = articles.length > 0 ? articles : [
        { title: '美客多墨西哥站佣金调整公告', date: '2024-04-24', category: '政策', desc: '针对美妆及电子类目佣金比例进行微调,建议卖家及时核算成本。', hot: true },
        { title: '拉美电商市场 Q1 增长强劲,电子品类领跑', date: '2024-04-23', category: '市场', desc: '巴西、墨西哥市场需求激增,AI 驱动的选品策略成为胜负手。', hot: false },
        { title: '巴西站点 Full 仓储费率更新通知', date: '2024-04-22', category: '物流', desc: '自下月起将针对长期冗余库存执行阶梯式收费标准。', hot: false },
        { title: 'AI 智能选品工具 2.0 版本正式上线', date: '2024-04-21', category: '工具', desc: '深度整合 MiniMax 语义模型,精准捕捉市场潜在爆单信号。', hot: true },
        { title: '美客多合规性卖家行为准则发布', date: '2024-04-20', category: '合规', desc: '旨在维护健康的生态环境,对违规刷单行为零容忍。', hot: false }
    ];

    return (
        <div className="h-full overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700">
            {/* Header with Visual Filtering */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-10 bg-blue-600 rounded-full"></div>
                        <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">云帆情报流</h3>
                    </div>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em]">Cross-border Intelligence & Global Market News</p>
                </div>

                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                    {['ALL', '政策', '市场', '物流', '合规'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {tab === 'ALL' ? '全部情报' : tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {displayArticles.map((news, i) => (
                    <div key={i} className="group relative bg-white p-8 rounded-[40px] border border-slate-100 hover:border-blue-500/20 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-slate-200/50">
                        {news.hot && (
                            <div className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1 bg-rose-500 rounded-full shadow-lg shadow-rose-200">
                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">紧急</span>
                            </div>
                        )}
                        
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <span className="px-3 py-1 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-slate-900/10">
                                    {news.category || news.site_id || '资讯'}
                                </span>
                                <span className="text-[11px] text-slate-400 font-bold font-mono tracking-widest uppercase">
                                    {news.date || news.created_at?.split(' ')[0]}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight tracking-tight">
                                    {news.title}
                                </h4>
                                <p className="text-[13px] text-slate-500 font-bold leading-relaxed line-clamp-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                    {news.desc || news.summary}
                                </p>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                        <Icon name="user" className="w-3 h-3 text-slate-400" />
                                    </div>
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Yunfan Analytics</span>
                                </div>
                                <div className="flex items-center gap-2 text-blue-600 group-hover:translate-x-2 transition-transform">
                                    <span className="text-[11px] font-black uppercase tracking-widest">查看详情</span>
                                    <Icon name="arrow-right" className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Newsletter Subscription Card */}
            <div className="bg-blue-600 rounded-[50px] p-12 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mb-32 blur-3xl animate-pulse delay-700"></div>
                
                <h4 className="text-white text-3xl md:text-5xl font-black tracking-tighter leading-none relative z-10">
                    不想错过任何爆单机会？
                </h4>
                <p className="text-blue-100 text-sm md:text-lg font-bold max-w-2xl relative z-10">
                    订阅云帆每日情报邮件，我们利用 AI 深度解析美客多全站点动态，为您实时推送政策预警与蓝海机会。
                </p>
                <div className="flex w-full max-w-md gap-2 relative z-10">
                    <input 
                        type="email" 
                        placeholder="输入您的邮箱地址"
                        className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 font-bold focus:outline-none focus:bg-white/20 transition-all"
                    />
                    <button className="px-8 bg-white text-blue-600 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95 shadow-2xl shadow-blue-900/20">
                        立即订阅
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewsView;

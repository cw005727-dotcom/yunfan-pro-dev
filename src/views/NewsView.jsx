import { useState, useEffect } from 'react';
import { API_BASE } from '../api/client';

const NewsView = () => {
    const [articles, setArticles] = useState([]);

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
        { title: '美客多墨西哥站佣金调整公告', date: '2024-04-24', category: '政策', desc: '针对美妆及电子类目佣金比例进行微调,建议卖家及时核算成本。' },
        { title: '拉美电商市场 Q1 增长强劲,电子品类领跑', date: '2024-04-23', category: '市场', desc: '巴西、墨西哥市场需求激增,AI 驱动的选品策略成为胜负手。' },
        { title: '巴西站点 Full 仓储费率更新通知', date: '2024-04-22', category: '物流', desc: '自下月起将针对长期冗余库存执行阶梯式收费标准。' },
        { title: 'AI 智能选品工具 2.0 版本正式上线', date: '2024-04-21', category: '工具', desc: '深度整合 MiniMax 语义模型,精准捕捉市场潜在爆单信号。' },
        { title: '美客多合规性卖家行为准则发布', date: '2024-04-20', category: '合规', desc: '旨在维护健康的生态环境,对违规刷单行为零容忍。' }
    ];

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700 flex flex-col items-stretch">
            <div className="grid grid-cols-1 gap-4">
                {displayArticles.map((news, i) => (
                    <div key={i} className="bg-white p-5 rounded-[20px] border border-slate-100 hover:border-blue-500/30 transition-all cursor-pointer group shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 text-[11px] font-black uppercase tracking-wider">{news.category || news.site_id || '资讯'}</span>
                            <span className="text-[11px] text-slate-500 font-medium">{news.date || news.created_at?.split(' ')[0]}</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1 leading-tight">{news.title}</h4>
                        <p className="text-[11px] text-slate-500 leading-none truncate">{news.desc || news.summary}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NewsView;

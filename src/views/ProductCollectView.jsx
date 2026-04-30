import Icon from '../components/Icon.jsx';

const ProductCollectView = () => {
    const [mode, setMode] = useState('keyword'); // keyword, url, category
    const [isScraping, setIsScraping] = useState(false);
    
    return (
        <div className="h-full overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight whitespace-nowrap">云帆采集器</h3>
                    <p className="text-slate-500 text-[11px] font-bold uppercase mt-1 whitespace-nowrap tracking-wider">Multi-Platform Sourcing Intelligence</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {['keyword', 'url', 'category'].map(m => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase transition-all ${mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {m === 'keyword' ? '关键词' : m === 'url' ? '链接' : '类目'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Input Control */}
            <div className="solid-card p-10 rounded-[40px] border-slate-200 bg-white shadow-xl shadow-slate-200/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110"></div>
                
                <div className="relative z-10 space-y-8">
                    <div className="max-w-3xl">
                        <h4 className="text-slate-900 font-black text-2xl tracking-tight leading-tight">
                            {mode === 'keyword' ? '输入关键词，深度挖掘美客多蓝海商品' : 
                             mode === 'url' ? '粘贴商品链接，一键同步详细参数' : 
                             '选择目标类目，全自动化批量铺货'}
                        </h4>
                        <div className="mt-6 flex gap-3">
                            <div className="flex-1 relative">
                                <input 
                                    type="text" 
                                    placeholder={mode === 'keyword' ? "例如: Audífonos inalámbricos, Ropa de cama..." : "粘贴 Mercado Libre 商品 URL"}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-blue-500 transition-all"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <span className="text-[10px] font-black text-slate-300 uppercase">MLM/MLB/MCO</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsScraping(true)}
                                className="px-10 bg-slate-900 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10"
                            >
                                <Icon name={isScraping ? "loader" : "zap"} className={`w-4 h-4 ${isScraping ? 'animate-spin' : ''}`} />
                                {isScraping ? '采集中...' : '开始采集'}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-10 border-t border-slate-100 pt-8">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">采集参数</p>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-600">自动翻译</span>
                                <span className="px-3 py-1 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-600">清洗品牌</span>
                                <span className="px-3 py-1 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-600">导出 V8</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">引擎状态</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[11px] font-black text-emerald-600 uppercase">Node-Source v2.4 已就绪</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[
                    { label: '今日采集总量', val: '1,284', unit: 'Items', icon: 'package', color: 'blue' },
                    { label: 'AI 自动清洗率', val: '98.2', unit: '%', icon: 'check-circle', color: 'emerald' },
                    { label: '队列等待中', val: '0', unit: 'Tasks', icon: 'clock', color: 'slate' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 flex items-center justify-between group hover:border-slate-200 transition-all shadow-sm">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-black text-slate-900">{stat.val}</span>
                                <span className="text-[11px] font-bold text-slate-400 uppercase">{stat.unit}</span>
                            </div>
                        </div>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-${stat.color}-50 text-${stat.color}-500 group-hover:scale-110`}>
                            <Icon name={stat.icon} className="w-6 h-6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Tasks List */}
            <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">最近采集记录</h5>
                    <button className="text-[11px] font-black text-blue-600 uppercase hover:underline">查看全部日志</button>
                </div>
                <div className="p-4">
                    <div className="space-y-2">
                        {[
                            { target: '墨西哥站: Audífonos', count: '100', status: '完成', time: '10分钟前' },
                            { target: '巴西站: Roupas', count: '254', status: '失败', time: '1小时前' },
                            { target: '哥伦比亚站: Hogar', count: '50', status: '完成', time: '3小时前' }
                        ].map((log, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                        <Icon name="history" className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-bold text-slate-800">{log.target}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">{log.time} · 成功抓取 {log.count} 件</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${log.status === '完成' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {log.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCollectView;

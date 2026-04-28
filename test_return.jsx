const React = require("react");
            return (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700">
                    {/* Summary Cards */}
                    {summary && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
                            {[
                                { label: '总成交额 (GMV)', value: `$${summary.total_gmv.toLocaleString()}`, icon: 'dollar-sign', color: 'text-accent' },
                                { label: '总订单量', value: summary.total_orders, icon: 'shopping-bag', color: 'text-slate-900' },
                                { label: '客单价 (AOV)', value: `$${summary.aov}`, icon: 'trending-up', color: 'text-emerald-500' }
                            ].map(stat => (
                                <div className="glass-effect rounded-[24px] p-6 flex items-center gap-6 border border-white/20 shadow-lg">
                                    <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${stat.color}`}>
                                        <Icon name={stat.icon} className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{stat.label}</p>
                                        <p className={`text-2xl font-black tnum ${stat.color}`}>{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                        <div className="flex-1 max-w-xl flex items-center gap-4 bg-slate-100 border border-slate-200 px-8 py-4 rounded-[32px] focus-within:border-accent/40 transition-all shadow-inner">
                            <Icon name="search" className="w-4 h-4 text-slate-400" />
                            <input className="bg-transparent border-none text-slate-900 text-sm font-medium focus:outline-none flex-1 placeholder:text-slate-400" placeholder="搜索订单、商品或 ID..." />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden lg:flex items-center gap-2 bg-slate-100 border border-slate-200 px-6 py-4 rounded-[24px] text-slate-500 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-200 transition-all">
                                <Icon name="calendar" className="w-4 h-4" />
                                <span>最近 30 天</span>
                            </div>
                            <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-8 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all">筛选</button>
                            <button className="btn-accent text-white px-8 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-accent/20">导出数据</button>
                        </div>
                    </div>

                    <div className="glass-effect rounded-[32px] md:rounded-[40px] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-[800px] md:w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="px-8 py-6 text-[10px] text-slate-400 font-black uppercase tracking-widest">订单 ID / 时间</th>
                                        <th className="px-8 py-6 text-[10px] text-slate-400 font-black uppercase tracking-widest">商品信息</th>
                                        <th className="px-8 py-6 text-[10px] text-slate-400 font-black uppercase tracking-widest">数量</th>
                                        <th className="px-8 py-6 text-[10px] text-slate-400 font-black uppercase tracking-widest">金额</th>
                                        <th className="px-8 py-6 text-[10px] text-slate-400 font-black uppercase tracking-widest">状态</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {orders.map(order => (
                                        <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <p className="text-slate-900 font-bold text-sm tracking-tight">{order.id}</p>
                                                <p className="text-slate-400 text-[10px] mt-1 font-medium">{new Date(order.order_date).toLocaleString()}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-slate-700 font-bold text-sm line-clamp-1 group-hover:text-accent transition-colors">{order.product_name}</p>
                                                <p className="text-slate-400 text-[10px] mt-1 font-black uppercase tracking-widest">{order.site_id}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-slate-900 font-black tnum text-lg">{order.quantity}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-accent font-black tnum text-lg">${(order.amount || 0).toFixed(2)}</p>
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">毛利: ${order.net_profit ? order.net_profit.toFixed(2) : '0.00'}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${order.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    {order.status === 'paid' ? '已支付' : order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            );
        };

        const ShopReputationView = () => {
            const [shops, setShops] = useState([]);
            const [isLoading, setIsLoading] = useState(true);
            const [selectedShop, setSelectedShop] = useState(null);
            const sectionRef = useRef(null);
            const popupRef = useRef(null);

            useEffect(() => {
                if (selectedShop && popupRef.current) {
                    setTimeout(() => {
                        popupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 120);
                }
            }, [selectedShop]);

            useEffect(() => {
                fetch('/api/shop_reputation')
                    .then(res => res.json())
                    .then(data => {
                        // 预处理数据以适配新指标与刻度
                        const enhancedData = data.map(s => ({
                            ...s,
                            reclamos: s.reclamos || "0.0%",
                            despacho: s.despacho || "0.0%",
                            cancel: s.cancel || "0.0%",
                            score: s.score !== undefined ? s.score : (s.status === 'green' ? 92 : s.status === 'yellow' ? 50 : 15)
                        }));
                        setShops(enhancedData);
                        setIsLoading(false);
                        // 数据加载完毕后,平滑滚动到声誉大盘区块
                        setTimeout(() => {
                            sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                    })
                    .catch(err => {
                        console.error(err);
                        setIsLoading(false);
                    });
            }, []);

            const stats = [
                { label: "今日新增投诉", value: "00", icon: "alert-circle", color: "text-slate-500", bg: "bg-slate-500/5" },
                { label: "今日新增违规", value: "00", icon: "shield-alert", color: "text-slate-500", bg: "bg-slate-500/5" },
                { label: "今日站内信", value: "12", icon: "mail", color: "text-purple-400", bg: "bg-purple-500/10" },
            ];

            // 站点 → 国家名+旗帜映射
            const siteLabel = { MCO: '🇲🇽墨西哥', MLB: '🇧🇷巴西', MLM: '🇲🇽墨西哥' };
            const riskItems = [
                { type: 'reclamo', label: '投诉', bg: 'risk-red', textColor: 'text-rose-600', dotColor: 'bg-rose-500', items: [
                    { site: 'MCO', shop: 'Shop 1', delta: 3, time: '10分钟前' },
                    { site: 'MLB', shop: 'Shop 1', delta: 1, time: '30分钟前' },
                    { site: 'MLM', shop: 'CNGUANGZHOUWEN', delta: 1, time: '2小时前' },
                ]},
                { type: 'violacion', label: '违规', bg: 'risk-yellow', textColor: 'text-amber-600', dotColor: 'bg-amber-500', items: [
                    { site: 'MLM', shop: 'Shop 2', delta: 2, time: '15分钟前' },
                    { site: 'MCO', shop: 'Shop 1', delta: 1, time: '1小时前' },
                ]},
                { type: 'cancel', label: '取消', bg: 'risk-purple', textColor: 'text-purple-600', dotColor: 'bg-purple-500', items: [
                    { site: 'MLB', shop: 'Shop 1', delta: 1, time: '45分钟前' },
                    { site: 'MLM', shop: 'CNGUANGZHOUWEN', delta: 1, time: '3小时前' },
                ]},
            ];
            const marqueeList = [...riskItems, ...riskItems];

            if (isLoading) return <div className="flex items-center justify-center h-64 text-slate-500 font-black uppercase tracking-[0.5em] text-xs">Fetching Reputation Data...</div>;

            return (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700">
                    {/* 风险预警透视 - 跑马灯 */}
                    <div className="relative overflow-hidden rounded-[32px] border border-slate-200/60">
                        <div className="flex items-center gap-3 px-8 py-5 bg-slate-50/80 border-b border-slate-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">风险预警透视</p>
                            <div className="flex-1 h-px bg-slate-200"></div>
                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">实时监控中</p>
                        </div>
                        <div className="relative overflow-hidden py-5 bg-white/60">
                            <div className="flex gap-6 marquee-track">
                                <div className="animate-marquee flex items-center gap-6 shrink-0" style={{ willChange: 'transform' }}>
                                    {marqueeList.map((category, ci) =>
                                        category.items.map((item, ii) => (
                                            <div key={`${ci}-${ii}`} className={`risk-capsule flex items-center gap-2.5 px-5 py-3 rounded-full shrink-0 ${category.bg}`}>
                                                <div className={`w-2 h-2 rounded-full ${category.dotColor} shrink-0`}></div>
                                                <span className={`text-[11px] font-black uppercase tracking-wide ${category.textColor}`}>{category.label}</span>
                                                <span className="text-[13px] font-black text-slate-800">{siteLabel[item.site]}</span>
                                                <span className="text-[13px] font-bold text-slate-600">· {item.shop} <span className="text-rose-500">+{item.delta}</span></span>
                                                <span className="text-[9px] text-slate-400 font-medium">{item.time}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ============================================================
                         全店健康概览:6店卡片,识别度优化
                         ============================================================ */}
                    <div className="space-y-4 section-rise">
                        <div className="flex items-center justify-between px-4">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">全店健康概览</h4>
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5 text-[8px] text-emerald-600 font-black uppercase"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> 健康</span>
                                <span className="flex items-center gap-1.5 text-[8px] text-amber-600 font-black uppercase"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div> 预警</span>
                                <span className="flex items-center gap-1.5 text-[8px] text-rose-600 font-black uppercase"><div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div> 危险</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
                            {(() => {
                                const SITE_LIST = [
                                    { code: 'MX', flag: '🇲🇽', name: '墨西哥' },
                                    { code: 'BR', flag: '🇧🇷', name: '巴西' },
                                    { code: 'CO', flag: '🇨🇴', name: '哥伦比亚' },
                                    { code: 'AR', flag: '🇦🇷', name: '阿根廷' },
                                    { code: 'CL', flag: '🇨🇱', name: '智利' },
                                ];
                                const SHOP_ACCOUNTS = ['云帆1店','云帆2店','云帆3店','云帆4店','云帆5店','云帆6店'];
                                return SHOP_ACCOUNTS.map(accName => {
                                    const accShops = shops.filter(s => s.account === accName);
                                    const accMap = {};
                                    accShops.forEach(s => { accMap[s.site] = s; });
                                    const statuses = Object.values(accMap).map(s => s.status);
                                    const overall = statuses.includes('red') ? 'red' : statuses.includes('yellow') ? 'yellow' : 'green';
                                    const statusLabel = overall === 'green' ? '优质' : overall === 'yellow' ? '预警' : '危险';
                                    const hdr = overall === 'green' ? 'bg-emerald-50 border-emerald-100' : overall === 'yellow' ? 'bg-amber-50 border-amber-100' : 'bg-rose-50 border-rose-100';
                                    const badge = overall === 'green' ? 'bg-emerald-100 text-emerald-600' : overall === 'yellow' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600';
                                    const dot = overall === 'green' ? 'bg-emerald-400' : overall === 'yellow' ? 'bg-amber-400' : 'bg-rose-400';
                                    const dotNone = accShops.length === 0 ? 'bg-slate-300' : dot;
                                    return (
                                        <div key={accName} className="rounded-2xl border border-slate-100 overflow-hidden bg-white transition-all cursor-pointer hover:shadow-md">
                                            {/* Shop Name Header */}
                                            <div className={`px-4 pt-4 pb-3 border-b border-slate-100 ${hdr} flex flex-col gap-2`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotNone} glow-pulse`}></div>
                                                        <p className="text-[11px] font-black text-slate-800 leading-tight">{accName}</p>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${badge}`}>{statusLabel}</span>
                                                </div>
                                            </div>
                                            {/* 5 Site Rows */}
                                            <div className="px-4 py-3 flex flex-col gap-2.5">
                                                {SITE_LIST.map(si => {
                                                    const s = accMap[si.code];
                                                    const dotCls = s ? (s.status === 'green' ? 'bg-emerald-400' : s.status === 'yellow' ? 'bg-amber-400' : 'bg-rose-400') : 'bg-slate-300';
                                                    const txtCls = s ? (s.status === 'green' ? 'text-emerald-600' : s.status === 'yellow' ? 'text-amber-600' : 'text-rose-600') : 'text-slate-400';
                                                    const stLabel = s ? (s.status === 'green' ? '健康' : s.status === 'yellow' ? '预警' : '危险') : '待机';
                                                    return (
                                                        <div key={si.code} className="flex items-center gap-3">
                                                            <span className="text-lg shrink-0">{si.flag}</span>
                                                            <span className="text-[10px] font-black text-slate-600 flex-1 shrink-0" style={{minWidth:'2.5rem'}}>{si.name}</span>
                                                            <button
                                                                onClick={() => s && setSelectedShop(s)}
                                                                className={`w-3 h-3 rounded-full shrink-0 transition-all focus:outline-none ${dotCls} hover:scale-125 glow-pulse`}
                                                                title={si.name}
                                                            ></button>
                                                            <span className={`text-[8px] font-black uppercase w-6 text-right shrink-0 ${txtCls}`}>{stLabel}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                    {/* 店铺声誉大盘 */}
                    <div ref={sectionRef} className="solid-card rounded-[32px] border border-slate-200 overflow-hidden scroll-mt-8 section-rise">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">店铺声誉大盘</p>
                            <div className="flex-1 h-px bg-slate-100"></div>
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5 text-[8px] text-emerald-600 font-black uppercase"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> 绿</span>
                                <span className="flex items-center gap-1.5 text-[8px] text-amber-600 font-black uppercase"><div className="w-2 h-2 rounded-full bg-amber-500"></div> 黄</span>
                                <span className="flex items-center gap-1.5 text-[8px] text-rose-600 font-black uppercase"><div className="w-2 h-2 rounded-full bg-rose-500"></div> 红</span>
                            </div>
                        </div>
                        <div className="px-8 py-6 space-y-5">
                            {(() => {
                                const SITE_MAP = {
                                    MX: { flag: '🇲🇽', name: '墨西哥' },
                                    BR: { flag: '🇧🇷', name: '巴西' },
                                    CO: { flag: '🇨🇴', name: '哥伦比亚' },
                                    AR: { flag: '🇦🇷', name: '阿根廷' },
                                    CL: { flag: '🇨🇱', name: '智利' },
                                };
                                return Object.entries(SITE_MAP).map(([code, info]) => {
                                    const siteShops = shops.filter(s => s.site === code);
                                    return (
                                        <div key={code} className="flex items-center gap-6">
                                            <div className="flex items-center gap-2 w-36 shrink-0">
                                                <span className="text-lg">{info.flag}</span>
                                                <span className="text-[13px] font-black text-slate-800">{info.name}</span>
                                            </div>
                                            <div className="flex-1 flex items-center gap-3">
                                                {siteShops.length > 0 ? (
                                                    <div className="flex-1 flex items-stretch gap-1">
                                                        {siteShops.map((s, i) => (
                                                            <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                                                                <button
                                                                    onClick={() => setSelectedShop(selectedShop?.name === s.name ? null : s)}
                                                                    className={`w-full h-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${s.status === 'green' ? 'bg-emerald-500 hover:bg-emerald-400 focus:ring-emerald-400' : s.status === 'yellow' ? 'bg-amber-400 hover:bg-amber-300 focus:ring-amber-400' : 'bg-rose-400 hover:bg-rose-300 focus:ring-rose-400'} ${selectedShop?.name === s.name ? 'ring-2 ring-slate-900 ring-offset-1 scale-y-125' : 'hover:brightness-105'}`}
                                                                ></button>
                                                                <span className={`text-[7px] font-black uppercase leading-none ${s.status === 'green' ? 'text-emerald-600' : s.status === 'yellow' ? 'text-amber-600' : 'text-rose-600'}`} style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'100%'}}>{s.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 font-bold italic">暂无数据</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>

                    {/* 店铺指标弹出卡:6店 × 3指标,动画入场 */}
                    {selectedShop && (
                        <div ref={popupRef} className="metric-pop solid-card rounded-[32px] border border-slate-200 overflow-hidden">
                            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
                                    <p className="text-[13px] font-black text-slate-800 tracking-tight">全店指标一览</p>
                                </div>
                                <button onClick={() => setSelectedShop(null)} className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all">
                                    <Icon name="x" className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="px-8 py-6 grid grid-cols-3 gap-5">
                                {(() => {
                                    const SHOP_ACCOUNTS = ['云帆1店','云帆2店','云帆3店','云帆4店','云帆5店','云帆6店'];
                                    return SHOP_ACCOUNTS.map((accName, ci) => {
                                        const accShops = shops.filter(s => s.account === accName);
                                        const statuses = accShops.map(s => s.status);
                                        const overall = statuses.includes('red') ? 'red' : statuses.includes('yellow') ? 'yellow' : 'green';
                                        const badge = overall === 'green' ? 'bg-emerald-100 text-emerald-600' : overall === 'yellow' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600';
                                        const dotCls = overall === 'green' ? 'bg-emerald-400' : overall === 'yellow' ? 'bg-amber-400' : 'bg-rose-400';
                                        const cardBg = overall === 'green' ? 'bg-emerald-50/70' : overall === 'yellow' ? 'bg-amber-50/70' : 'bg-rose-50/70';
                                        // Aggregate metrics: average across this shop's sites
                                        const avg = (arr) => arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(2) : null;
                                        const reclamos = avg(accShops.map(s => parseFloat(s.reclamos||0)));
                                        const despacho = avg(accShops.map(s => parseFloat(s.despacho||0)));
                                        const cancel = avg(accShops.map(s => parseFloat(s.cancel||0)));
                                        const hasData = accShops.length > 0;
                                        return (
                                            <div key={accName} className={`rounded-2xl border overflow-hidden transition-all cursor-pointer hover:shadow-md card-in ${cardBg}`} style={{animationDelay: `${ci * 60}ms`}}>
                                                {/* Card Header */}
                                                <div className="px-4 py-3 border-b border-white/40 flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full shrink-0 ${dotCls} glow-pulse`}></div>
                                                    <p className="text-[10px] font-black text-slate-700 truncate flex-1">{accName}</p>
                                                    <span className={`px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase shrink-0 ${badge}`}>
                                                        {overall === 'green' ? '优质' : overall === 'yellow' ? '预警' : '危险'}
                                                    </span>
                                                </div>
                                                {/* 3 Metrics */}
                                                <div className="px-4 py-3 grid grid-cols-3 gap-2">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="w-6 h-6 rounded-lg bg-rose-100/80 flex items-center justify-center">
                                                            <Icon name="alert-circle" className="w-3 h-3 text-rose-400" />
                                                        </div>
                                                        <p className="text-[7px] text-slate-400 font-black uppercase tracking-wide">投诉</p>
                                                        <p className="text-sm font-black text-rose-500 tnum metric-num" style={{animationDelay:`${ci*60+80}ms`}}>{hasData ? reclamos+'%' : '-'}</p>
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="w-6 h-6 rounded-lg bg-amber-100/80 flex items-center justify-center">
                                                            <Icon name="truck" className="w-3 h-3 text-amber-400" />
                                                        </div>
                                                        <p className="text-[7px] text-slate-400 font-black uppercase tracking-wide">延误</p>
                                                        <p className="text-sm font-black text-amber-500 tnum metric-num" style={{animationDelay:`${ci*60+140}ms`}}>{hasData ? despacho+'%' : '-'}</p>
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="w-6 h-6 rounded-lg bg-purple-100/80 flex items-center justify-center">
                                                            <Icon name="x-circle" className="w-3 h-3 text-purple-400" />
                                                        </div>
                                                        <p className="text-[7px] text-slate-400 font-black uppercase tracking-wide">取消</p>
                                                        <p className="text-sm font-black text-purple-500 tnum metric-num" style={{animationDelay:`${ci*60+200}ms`}}>{hasData ? cancel+'%' : '-'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            );
        };

const DataAnalysisView = () => {
            const [activeShop, setActiveShop] = useState('云帆1店');
            const [activeRankTab, setActiveRankTab] = useState('impression');
            const [period, setPeriod] = useState('today');
            const [siteStats, setSiteStats] = useState([]);
            const [mockItems, setMockItems] = useState([]);
            const [returnItems, setReturnItems] = useState([]);
            const [complaintItems, setComplaintItems] = useState([]);

            const SHOP_ACCOUNTS = ['云帆1店','云帆2店','云帆3店','云帆4店','云帆5店','云帆6店'];
            const SITE_LIST = [
                { code: 'MX', flag: '🇲🇽', name: '墨西哥' },
                { code: 'BR', flag: '🇧🇷', name: '巴西' },
                { code: 'CO', flag: '🇨🇴', name: '哥伦比亚' },
                { code: 'AR', flag: '🇦🇷', name: '阿根廷' },
                { code: 'CL', flag: '🇨🇱', name: '智利' },
            ];
            const PERIOD_OPTS = [
                { id: 'today', label: '今天' },
                { id: 'week', label: '近7天' },
                { id: 'month', label: '近30天' },
            ];
            const PERIOD_LABELS = { today: '今日', week: '近7日', month: '近30日' };

            // 只在组件首次挂载时生成模拟数据,之后不再变化
            useEffect(() => {
                const generate = () => {
                    const sites = SITE_LIST.map(s => {
                        const base = Math.floor(Math.random() * 5000 + 1000);
                        const cartBase = Math.floor(base * (Math.random() * 0.05 + 0.01));
                        const rate = (cartBase / base * 100).toFixed(2);
                        return { ...s, impressions: base, cartAdds: cartBase, cartRate: rate,
                            impression_up: Math.random() > 0.35,
                            cart_up: Math.random() > 0.35,
                            rate_up: Math.random() > 0.35 };
                    });
                    const items = Array.from({ length: 20 }, (_, i) => ({
                        rank: i + 1,
                        title: i < 10 ? `爆款商品标题-${String(i+1).padStart(3,'0')} 夏季热卖精选款` : `长尾商品-${String(i+1).padStart(3,'0')} 配件工具实用款`,
                        impressions: Math.floor(Math.random() * 5000 + 500),
                        clicks: Math.floor(Math.random() * 750),
                        cartAdds: Math.floor(Math.random() * 150),
                        listedDate: `2024-${String(Math.floor(Math.random()*12)+1).padStart(2,'0')}-${String(Math.floor(Math.random()*28)+1).padStart(2,'0')}`,
                    }));
                    const ret = Array.from({ length: 10 }, (_, i) => ({
                        rank: i + 1,
                        title: `退货商品-${String(i+1).padStart(3,'0')} 质量/描述问题`,
                        returns: Math.floor(Math.random() * 80) + 20,
                        returnRate: (Math.random() * 8 + 1).toFixed(1),
                        listedDate: `2024-${String(Math.floor(Math.random()*12)+1).padStart(2,'0')}-${String(Math.floor(Math.random()*28)+1).padStart(2,'0')}`,
                    }));
                    const comp = Array.from({ length: 5 }, (_, i) => ({
                        rank: i + 1,
                        title: `客诉商品-${String(i+1).padStart(3,'0')} 服务/物流问题`,
                        complaints: Math.floor(Math.random() * 30) + 5,
                        listedDate: `2024-${String(Math.floor(Math.random()*12)+1).padStart(2,'0')}-${String(Math.floor(Math.random()*28)+1).padStart(2,'0')}`,
                    }));
                    setSiteStats(sites);
                    setMockItems(items);
                    setReturnItems(ret);
                    setComplaintItems(comp);
                };
                generate();
            }, [activeShop]);

            const RANK_TABS = [
                { id: 'impression', label: '曝光前10' },
                { id: 'cart', label: '加车前10' },
                { id: 'click', label: '点击前10' },
                { id: 'bottom', label: '曝光后20' },
                { id: 'return', label: '退货前10' },
                { id: 'complaint', label: '客诉前5' },
            ];

            const displayItems = activeRankTab === 'bottom'
                ? [...mockItems].sort((a,b) => a.impressions - b.impressions).slice(0, 20)
                : activeRankTab === 'return'
                    ? returnItems
                    : activeRankTab === 'complaint'
                        ? complaintItems
                        : [...mockItems].sort((a,b) => b.impressions - a.impressions).slice(0, 10);

            if (siteStats.length === 0) return (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                </div>
            );

            return (
                <div className="space-y-6 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-pink-50/20 rounded-[32px] p-6 -mx-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">数据分析</h3>
                            <p className="text-slate-500 text-xs font-medium mt-1">店铺实时表现 · {PERIOD_LABELS[period]}数据</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 bg-slate-100 rounded-2xl p-1">
                                {PERIOD_OPTS.map(p => (
                                    <button key={p.id} onClick={() => setPeriod(p.id)} className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all ${period === p.id ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>{p.label}</button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 glow-pulse"></div>
                                <span className="text-[10px] text-slate-500 font-bold">数据更新于 15:10</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {SHOP_ACCOUNTS.map((shop, idx) => {
                            const isActive = activeShop === shop;
                            return (
                                <button
                                    key={shop}
                                    onClick={() => setActiveShop(shop)}
                                    className={`relative px-5 py-2.5 rounded-2xl text-[14px] font-black transition-all duration-300
                                        ${isActive
                                            ? 'bg-indigo-500/90 backdrop-blur-md border border-indigo-400/60 shadow-xl shadow-indigo-200/50 text-white'
                                            : 'bg-white/30 backdrop-blur-sm border border-white/40 text-slate-600 hover:bg-white/50 hover:border-white/60 hover:shadow-md hover:shadow-slate-200/30'
                                        }`}
                                >
                                    {isActive && <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-indigo-200/40 to-pink-200/40 -z-10 blur-sm"></div>}
                                    <span className="relative">{shop}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-5 gap-4">
                        {siteStats.map(s => {
                            const upColor = s.impression_up ? 'text-emerald-500' : 'text-rose-400';
                            return (
                                <div key={s.code} className={`group relative rounded-2xl border backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${s.impression_up ? 'bg-emerald-50/60 border-emerald-200/60' : 'bg-rose-50/60 border-rose-200/60'}`}>
                                    {/* 顶部站点名 */}
                                    <div className="flex items-center gap-2 px-4 pt-4 pb-2">
                                        <span className="text-base">{s.flag}</span>
                                        <span className="text-[14px] font-black text-slate-700">{s.name}</span>
                                    </div>
                                    {/* 分隔线 */}
                                    <div className={`mx-3 h-px ${s.impression_up ? 'bg-emerald-200/50' : 'bg-rose-200/50'}`}></div>
                                    {/* 指标 */}
                                    <div className="px-4 py-3 space-y-3">
                                        <div className="flex items-baseline justify-between">
                                            <div>
                                                <p className="text-[8px] text-slate-400/80 font-black uppercase tracking-widest">曝光</p>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <p className="text-xl font-black text-slate-800 tnum tracking-tight">{s.impressions.toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-black ${upColor} opacity-80`}>{s.impression_up ? '↑' : '↓'}</span>
                                        </div>
                                        <div className="flex items-baseline justify-between">
                                            <div>
                                                <p className="text-[8px] text-slate-400/80 font-black uppercase tracking-widest">加车</p>
                                                <p className="text-lg font-black text-slate-700 tnum tracking-tight">{s.cartAdds.toLocaleString()}</p>
                                            </div>
                                            <span className={`text-sm font-black ${s.cart_up ? 'text-emerald-500' : 'text-rose-400'} opacity-80`}>{s.cart_up ? '↑' : '↓'}</span>
                                        </div>
                                        <div className="flex items-baseline justify-between border-t border-slate-200/30 pt-2">
                                            <div>
                                                <p className="text-[8px] text-slate-400/80 font-black uppercase tracking-widest">加车率</p>
                                                <p className={`text-base font-black tnum tracking-tight ${s.rate_up ? 'text-emerald-600' : 'text-rose-400'}`}>{s.cartRate}%</p>
                                            </div>
                                            <span className={`text-sm font-black ${s.rate_up ? 'text-emerald-500' : 'text-rose-400'} opacity-80`}>{s.rate_up ? '↑' : '↓'}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="solid-card rounded-[24px] border border-slate-200 overflow-hidden">
                        <div className="px-6 pt-5 pb-0 border-b border-slate-100 flex items-center gap-1">
                            {RANK_TABS.map(tab => {
                                const isActive = activeRankTab === tab.id;
                                const colorMap = {
                                    impression: isActive ? 'bg-indigo-500/20 backdrop-blur-md border border-indigo-300/50 text-indigo-700' : 'bg-white/30 backdrop-blur-sm border border-white/40 text-slate-500 hover:bg-indigo-50/40 hover:border-indigo-200/40',
                                    cart: isActive ? 'bg-emerald-500/20 backdrop-blur-md border border-emerald-300/50 text-emerald-700' : 'bg-white/30 backdrop-blur-sm border border-white/40 text-slate-500 hover:bg-emerald-50/40 hover:border-emerald-200/40',
                                    click: isActive ? 'bg-amber-500/20 backdrop-blur-md border border-amber-300/50 text-amber-700' : 'bg-white/30 backdrop-blur-sm border border-white/40 text-slate-500 hover:bg-amber-50/40 hover:border-amber-200/40',
                                    bottom: isActive ? 'bg-rose-500/20 backdrop-blur-md border border-rose-300/50 text-rose-700' : 'bg-white/30 backdrop-blur-sm border border-white/40 text-slate-500 hover:bg-rose-50/40 hover:border-rose-200/40',
                                    return: isActive ? 'bg-red-500/20 backdrop-blur-md border border-red-300/50 text-red-700' : 'bg-white/30 backdrop-blur-sm border border-white/40 text-slate-500 hover:bg-red-50/40 hover:border-red-200/40',
                                    complaint: isActive ? 'bg-orange-500/20 backdrop-blur-md border border-orange-300/50 text-orange-700' : 'bg-white/30 backdrop-blur-sm border border-white/40 text-slate-500 hover:bg-orange-50/40 hover:border-orange-200/40',
                                };
                                const cls = colorMap[tab.id] || colorMap.impression;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveRankTab(tab.id)}
                                        className={`relative px-4 py-2 rounded-xl text-[11px] font-black transition-all duration-200 mb-px ${cls}`}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="p-5 space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                            {activeRankTab === 'bottom' ? displayItems.map((item, i) => (
                                <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-rose-50/60 border border-rose-100 hover:border-rose-200 hover:shadow-sm transition-all">
                                    <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center text-[10px] font-black shrink-0">{item.rank}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-black text-slate-800 truncate">{item.title}</p>
                                        <p className="text-[9px] text-slate-400 font-bold">上架:{item.listedDate}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[13px] font-black text-rose-500 tnum">{item.impressions.toLocaleString()}</p>
                                        <p className="text-[8px] text-slate-400 font-black uppercase">曝光</p>
                                    </div>
                                </div>
                            )) : activeRankTab === 'return' ? displayItems.map((item, i) => (
                                <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-red-50/60 border border-red-100 hover:border-red-200 hover:shadow-sm transition-all">
                                    <div className="w-8 h-8 rounded-xl bg-red-100 text-red-500 flex items-center justify-center text-[10px] font-black shrink-0">{item.rank}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-black text-slate-800 truncate">{item.title}</p>
                                        <p className="text-[9px] text-slate-400 font-bold">上架:{item.listedDate}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 shrink-0">
                                        <div className="text-right">
                                            <p className="text-[13px] font-black text-red-500 tnum">{item.returns}</p>
                                            <p className="text-[8px] text-slate-400 font-black uppercase">退货量</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[13px] font-black text-orange-500 tnum">{item.returnRate}%</p>
                                            <p className="text-[8px] text-slate-400 font-black uppercase">退货率</p>
                                        </div>
                                    </div>
                                </div>
                            )) : activeRankTab === 'complaint' ? displayItems.map((item, i) => (
                                <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-amber-50/60 border border-amber-100 hover:border-amber-200 hover:shadow-sm transition-all">
                                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-black shrink-0">{item.rank}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-black text-slate-800 truncate">{item.title}</p>
                                        <p className="text-[9px] text-slate-400 font-bold">上架:{item.listedDate}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[13px] font-black text-amber-600 tnum">{item.complaints}</p>
                                        <p className="text-[8px] text-slate-400 font-black uppercase">客诉量</p>
                                    </div>
                                </div>
                            )) : displayItems.map((item, i) => {
                                const medal = i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-slate-400 text-white' : i === 2 ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-500';
                                return (
                                    <div key={i} className={`flex items-center gap-4 px-4 py-3 rounded-xl border hover:shadow-sm transition-all ${i===0?'bg-amber-50 border-amber-200':i===1?'bg-slate-50 border-slate-200':i===2?'bg-orange-50 border-orange-200':'bg-white border-slate-100'}`}>
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 ${medal}`}>{item.rank}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[12px] font-black text-slate-800 truncate">{item.title}</p>
                                            <p className="text-[9px] text-slate-400 font-bold">上架:{item.listedDate}</p>
                                        </div>
                                        <div className="flex items-center gap-6 shrink-0">
                                            <div className="text-right min-w-[70px]">
                                                <p className="text-[8px] text-indigo-400 font-black uppercase tracking-widest mb-0.5">曝光</p>
                                                <p className="text-[16px] font-black text-indigo-600 tnum">{item.impressions >= 1000 ? (item.impressions/1000).toFixed(1)+'k' : item.impressions}</p>
                                            </div>
                                            <div className="text-right min-w-[70px]">
                                                <p className="text-[8px] text-emerald-400 font-black uppercase tracking-widest mb-0.5">加车</p>
                                                <p className="text-[16px] font-black text-emerald-600 tnum">{item.cartAdds >= 1000 ? (item.cartAdds/1000).toFixed(1)+'k' : item.cartAdds}</p>
                                            </div>
                                            <div className="text-right min-w-[70px]">
                                                <p className="text-[8px] text-amber-400 font-black uppercase tracking-widest mb-0.5">点击</p>
                                                <p className="text-[16px] font-black text-amber-600 tnum">{item.clicks >= 1000 ? (item.clicks/1000).toFixed(1)+'k' : item.clicks}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            );
        };

        const OptimizeTitleView = () => {
            const [input, setInput] = useState('');
            const [results, setResults] = useState([]);
            const [isGenerating, setIsGenerating] = useState(false);

            const handleGenerate = async () => {
                if (!input) return;
                setIsGenerating(true);
                try {
                    const response = await fetch('/api/optimize_title', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title: input })
                    });
                    const data = await response.json();
                    setResults(data.suggestions || []);
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsGenerating(false);
                }
            };

            return (
                <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700">
                    <div className="text-center space-y-4">
                        <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">AI 智能标题专家</h3>
                        <p className="text-amber-600 text-xs font-black uppercase tracking-[0.5em]">MiniMax M2.7 Intelligence Engine</p>
                    </div>

                    <div className="solid-card p-3 rounded-[40px] flex items-center gap-3 group border-amber-500/10 focus-within:border-amber-500/30 transition-all shadow-2xl">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="粘贴您的原始标题,由 AI 为您重构..."
                            className="flex-1 bg-transparent border-none px-10 py-6 text-slate-900 font-bold text-lg focus:outline-none placeholder:text-slate-400"
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-12 py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
                        >
                            <Icon name={isGenerating ? "loader" : "sparkles"} className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                            {isGenerating ? '正在分析' : '一键优化'}
                        </button>
                    </div>

                    {results.length > 0 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            <div className="flex items-center gap-3 px-6">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">AI 生成的优化方案</p>
                            </div>
                            {results.map((res, i) => (
                                <div key={i} className="solid-card p-8 rounded-[32px] flex items-center justify-between group hover:border-amber-500/20 transition-all">
                                    <p className="text-slate-900 font-bold text-lg leading-relaxed">{res}</p>
                                    <button className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-amber-600 transition-colors">
                                        <Icon name="copy" className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        };

        const ImageLabView = () => {
            const [prompt, setPrompt] = useState('');
            const [resultUrl, setResultUrl] = useState('');
            const [isGenerating, setIsGenerating] = useState(false);

            const handleGenerate = async () => {
                if (!prompt) return;
                setIsGenerating(true);
                try {
                    const response = await fetch('/api/ai/generate-images', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt })
                    });
                    const data = await response.json();
                    setResultUrl(data.url);
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsGenerating(false);
                }
            };

            return (
                <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700">
                    <div className="text-center space-y-4">
                        <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">视觉图生图实验室</h3>
                        <p className="text-amber-600 text-xs font-black uppercase tracking-[0.5em]">Stable Diffusion & Higgsfield AI Lab</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass-effect p-10 rounded-[40px] border-slate-200 flex flex-col items-center justify-center gap-6 min-h-[400px] border-dashed hover:border-amber-500/20 transition-all cursor-pointer group">
                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors">
                                <Icon name="upload-cloud" className="w-8 h-8" />
                            </div>
                            <p className="text-slate-500 font-bold text-center px-10">点击或拖拽上传原始商品图</p>
                        </div>
                        <div className="glass-effect rounded-[40px] border-slate-200 flex flex-col items-center justify-center overflow-hidden relative min-h-[400px] bg-slate-50">
                            {resultUrl ? (
                                <img src={resultUrl} className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <Icon name={isGenerating ? "loader" : "image"} className={`w-12 h-12 ${isGenerating ? 'text-amber-500 animate-spin' : 'text-slate-200'}`} />
                                    <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs mt-4">
                                        {isGenerating ? 'Generating Vision...' : 'Waiting for prompt...'}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="solid-card p-4 rounded-[32px] border-slate-200 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <input
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="flex-1 bg-transparent border-none px-6 text-slate-900 font-medium focus:outline-none placeholder:text-slate-300"
                                placeholder="描述您想要的视觉风格,如:'在拉美家庭厨房场景中,柔和自然光'..."
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                            >
                                {isGenerating ? '生成中...' : '开始生成'}
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

        const KeywordIntelligenceView = () => {
            const [data, setData] = useState({ trending: [], gaps: [] });

            useEffect(() => {
                fetch('/api/ai/keywords')
                    .then(res => res.json())
                    .then(setData)
                    .catch(console.error);
            }, []);

            return (
                <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700">
                    <div className="text-center space-y-4">
                        <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">关键词情报局</h3>
                        <p className="text-amber-600 text-xs font-black uppercase tracking-[0.5em]">实时市场语义分析</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 热搜趋势 */}
                        <div className="solid-card p-10 rounded-[40px] border-slate-200 space-y-8">
                            <div className="flex items-center justify-between">
                                <h4 className="text-slate-900 font-black text-xl uppercase tracking-wider italic">今日热搜</h4>
                                <Icon name="trending-up" className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="space-y-4">
                                {(data.trending || []).map((item, i) => (
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
                                {(data.gaps || []).map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div>
                                            <p className="text-slate-900 font-bold">{item.word}</p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase mt-1">竞争度: {item.competition}</p>
                                        </div>
                                        <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-600 text-[10px] font-black">商机</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        const BusinessIntroView = () => (
            <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700">
                <div className="space-y-4">
                    <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">云帆跨境:智领拉美</h3>
                    <p className="text-blue-600 text-xs font-black uppercase tracking-[0.5em]">定义拉美电商新纪元</p>
                </div>
                <div className="prose max-w-none space-y-8">
                    <p className="text-slate-600 text-lg leading-relaxed font-medium">
                        云帆跨境 (Yunfan Cross-border) 致力于为中国顶级出海卖家提供一站式、全链路的智能运营解决方案。
                        我们深度整合了 MercadoLibre (美客多) API 生态,并接入先进的生成式 AI 模型,助力卖家在激烈的全球竞争中实现跨越式增长。
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                        <div className="solid-card p-10 rounded-[40px] border-slate-200 space-y-4 shadow-xl">
                            <p className="text-slate-900 font-black text-xl italic uppercase tracking-widest">愿景</p>
                            <p className="text-slate-500 text-sm leading-relaxed">让每一个中国品牌都能轻松出海拉美,在全球舞台绽放光彩。</p>
                        </div>
                        <div className="solid-card p-10 rounded-[40px] border-slate-200 space-y-4 shadow-xl">
                            <p className="text-blue-600 font-black text-xl italic uppercase tracking-widest">核心科技</p>
                            <p className="text-slate-500 text-sm leading-relaxed">基于 MiniMax 等顶尖模型,提供多语种内容优化与智能选品情报。</p>
                        </div>
                    </div>
                </div>
            </div>
        );

        const ActivityCenterView = () => (
            <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700 text-slate-900">
                <div className="flex items-center justify-between border-b border-slate-200 pb-8">
                    <div>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">活动中心</h3>
                        <p className="text-slate-500 text-xs font-medium mt-1">卖家专属福利与官方大促报名通道</p>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">3 条新通知</div>
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
                                    <Icon name="calendar" className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="text-slate-900 font-bold text-xl group-hover:text-blue-600 transition-colors">{act.title}</h4>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1.5"><Icon name="clock" className="w-3 h-3" /> {act.time}</span>
                                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1.5"><Icon name="tag" className="w-3 h-3" /> {act.type}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="px-6 py-2 rounded-xl bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-all">{act.status}</span>
                                <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 transition-all border border-slate-200">
                                    <Icon name="chevron-right" className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );

        const LoginPage = ({ onLogin }) => {
            const [isLogin, setIsLogin] = useState(true);
            const [stats, setStats] = useState({ total_gmv: 0, total_orders: 0 });

            useEffect(() => {
                fetch('/api/stats')
                    .then(res => res.json())
                    .then(data => setStats(data))
                    .catch(err => console.error(err));
            }, []);

            return (
                <div className="min-h-screen flex items-stretch gradient-bg relative overflow-hidden text-slate-900">
                    <div className="hidden lg:flex flex-col justify-center p-32 w-1/2 relative z-10">
                        <div className="space-y-10">
                            <Brand slogan="跨境 AI 协作平台" />
                            <h1 className="text-8xl font-black text-slate-900 tracking-tighter leading-[0.9]">
                                智领<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 italic">拉美出海</span>
                            </h1>
                            <p className="text-slate-600 text-xl max-w-sm font-medium leading-relaxed">
                                基于生成式 AI 的全链路运营引擎,重新定义跨境卖家的增长极限。
                            </p>
                            <div className="flex items-center gap-16 pt-12">
                                <div className="space-y-2">
                                    <p className="text-slate-900 text-5xl font-black italic tnum tracking-tighter leading-none">{stats.total_orders}+</p>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">已集成订单</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-blue-600 text-5xl font-black italic tnum tracking-tighter leading-none">${stats.total_gmv.toLocaleString()}</p>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">累计成交总额</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10 bg-white/40 backdrop-blur-3xl border-l border-slate-200">
                        <div className="w-full max-w-md space-y-8 md:space-y-12">
                            <div className="space-y-6">
                                <div className="md:hidden mb-12">
                                    <Brand />
                                </div>
                                <div className="flex gap-8 border-b border-slate-200 mb-10">
                                    <button onClick={() => setIsLogin(true)} className={`pb-5 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] transition-all ${isLogin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>账号登录</button>
                                    <button onClick={() => setIsLogin(false)} className={`pb-5 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] transition-all ${!isLogin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>立即注册</button>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">{isLogin ? '欢迎登录' : '创建新账号'}</h2>
                            </div>

                            <div className="space-y-6 md:space-y-8">
                                <div className="space-y-2 md:space-y-4">
                                    <label className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] px-4">账号标识</label>
                                    <input className="w-full bg-slate-50 border border-slate-200 rounded-[28px] md:rounded-[32px] px-8 md:px-10 py-5 md:py-6 text-slate-900 font-bold focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-300 text-sm md:text-base shadow-inner" placeholder="用户名或邮箱" />
                                </div>
                                <div className="space-y-2 md:space-y-4">
                                    <label className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] px-4">访问秘钥</label>
                                    <input type="password" className="w-full bg-slate-50 border border-slate-200 rounded-[28px] md:rounded-[32px] px-8 md:px-10 py-5 md:py-6 text-slate-900 font-bold focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-300 text-sm md:text-base shadow-inner" placeholder="••••••••" />
                                </div>
                                <button onClick={onLogin} className="w-full bg-slate-900 text-white py-6 md:py-7 rounded-[28px] md:rounded-[32px] font-black text-[10px] md:text-xs uppercase tracking-[0.4em] hover:bg-blue-600 transition-all shadow-2xl shadow-blue-500/20 active:scale-[0.98]">
                                    {isLogin ? '进入系统' : '创建账号'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        const App = () => {
            const [isLoggedIn, setIsLoggedIn] = useState(false);
            const [topTab, setTopTab] = useState('home');
            const [sidebarItem, setSidebarItem] = useState('news');
            const [showNamingDialog, setShowNamingDialog] = useState(false);
            const [namingInput, setNamingInput] = useState('');
            const [pendingStoreId, setPendingStoreId] = useState(null);
            const [showPreAuthDialog, setShowPreAuthDialog] = useState(false);
            const [preAuthStoreName, setPreAuthStoreName] = useState('');



            // Detect OAuth callback and show naming dialog
            useEffect(() => {
                const params = new URLSearchParams(window.location.search);
                if (params.get('auth') === 'success') {
                    window.history.replaceState({}, '', window.location.pathname);
                    fetch('/api/stores')
                        .then(r => r.json())
                        .then(stores => {
                            const newest = stores.length > 0
                                ? stores.reduce((a, b) => (a.id > b.id ? a : b))
                                : null;
                            if (newest) {
                                setPendingStoreId(newest.id);
                                setNamingInput(newest.nickname || newest.store_name || '');
                                setShowNamingDialog(true);
                            }
                        })
                        .catch(() => {});
                }
            }, []);

            const handlePreAuthAuthorize = () => {
                const name = preAuthStoreName.trim();
                if (!name) return;
                setShowPreAuthDialog(false);
                fetch('/api/generate_auth_url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ store_name: name })
                })
                    .then(r => r.json())
                    .then(d => { if (d.url) window.location.href = d.url; })
                    .catch(() => {});
            };

            const handleNamingSubmit = () => {
                if (!namingInput.trim() || !pendingStoreId) return;
                fetch('/api/update_store_name', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ store_id: pendingStoreId, store_name: namingInput.trim() })
                })
                    .then(r => r.json())
                    .then(() => {
                        setShowNamingDialog(false);
                        setNamingInput('');
                        setPendingStoreId(null);
                        window.location.reload();
                    })
                    .catch(() => {});
            };

            const menuConfig = {
                home: [
                    { id: 'news', label: '最新资讯', icon: 'newspaper' },
                    { id: 'intro', label: '业务介绍', icon: 'info' },
                    { id: 'activity', label: '活动中心', icon: 'star' }
                ],
                data: [
                    { id: 'reputation', label: '店铺声誉', icon: 'shield-check', status: 'pulse' },
                    { id: 'analytics', label: '数据分析', icon: 'bar-chart-2' },
                    { id: 'traffic', label: '订单概览', icon: 'bar-chart-3', count: 50 },
                    { id: 'infringement', label: '违规监控', icon: 'alert-octagon', count: 0 },
                    { id: 'logistics', label: '物流跟踪', icon: 'truck' }
                ],
                ops: [
                    { id: 'auth', label: '前期准备', icon: 'key' },
                    { id: 'collect', label: '产品采集', icon: 'download-cloud' },
                    { id: 'maintain', label: '商品维护', icon: 'settings' },
                    { id: 'service', label: '售后处理', icon: 'headphones' }
                ],
                optimize: [
                    { id: 'title', label: '标题优化', icon: 'type' },
                    { id: 'image', label: '视觉图生图', icon: 'image' },
                    { id: 'keyword', label: '关键词衍生', icon: 'hash' }
                ]
            };

            const moduleClass = `accent-${topTab}`;

            const handleTopTabChange = (tab) => {
                setTopTab(tab);
                const items = menuConfig[tab];
                setSidebarItem(items.length > 0 ? items[0].id : null);
            };

            const handleSidebarItemClick = (itemId) => {
                // 数据中心的4个项目,点击后自动切到数据中心 tab
                const dataItems = ['reputation', 'traffic', 'infringement', 'logistics'];
                if (dataItems.includes(itemId) && topTab !== 'data') setTopTab('data');
                // 运营中心的4个项目,点击后自动切到运营中心 tab
                const opsItems = ['auth', 'collect', 'maintain', 'service'];
                if (opsItems.includes(itemId) && topTab !== 'ops') setTopTab('ops');
                // 优化中心的3个项目,点击后自动切到优化中心 tab
                const optimizeItems = ['title', 'image', 'keyword'];
                if (optimizeItems.includes(itemId) && topTab !== 'optimize') setTopTab('optimize');
                setSidebarItem(itemId);
            };

            if (!isLoggedIn) return <LoginPage onLogin={() => setIsLoggedIn(true)} />;

            return (
                <div className={`h-screen w-full gradient-bg flex flex-col items-center pt-2 md:pt-8 pb-8 md:pb-6 gap-4 md:gap-6 overflow-hidden relative px-4 md:px-12 ${moduleClass}`}>
                    {/* Top Navigation Row (Grid-Locked Unified Bar) */}
                    <div className="w-full max-w-[1600px] z-50 px-2 md:px-4 box-border">
                        <div className="glass-effect rounded-3xl flex md:grid md:grid-cols-[2.2fr_auto_1fr] items-center justify-between pl-6 md:pl-8 pr-6 md:pr-12 py-3 md:py-4 shadow-xl w-full">
                            {/* Left: Brand */}
                            <div className="flex items-center">
                                <Brand />
                            </div>

                            {/* Center: Navigation (Hidden on Mobile) */}
                            <nav className="hidden md:flex items-center gap-2">
                                {[
                                    { id: 'home', label: '首页', icon: 'home' },
                                    { id: 'data', label: '数据中心', icon: 'pie-chart' },
                                    { id: 'ops', label: '运营中心', icon: 'layout' },
                                    { id: 'optimize', label: '优化中心', icon: 'wand-2' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTopTabChange(tab.id)}
                                        className={`px-6 py-2 rounded-full flex items-center gap-2.5 transition-all whitespace-nowrap ${topTab === tab.id ? 'btn-accent text-white scale-105 font-black' : 'text-slate-500 hover:text-slate-800 font-bold'}`}
                                    >
                                        <Icon name={tab.icon} className="w-4 h-4" />
                                        <span className="text-[12px] uppercase tracking-[0.2em]">{tab.label}</span>
                                    </button>
                                ))}
                            </nav>

                            {/* Right: Profile (Compact) */}
                            <div className="hidden md:flex items-center justify-end gap-6 border-l border-slate-200 ml-10 pl-10 h-10">
                                <div className="flex flex-col items-end -space-y-1">
                                    <span className="text-slate-900 font-black text-sm tracking-tight uppercase">数据获取</span>
                                    <span className="text-emerald-500 text-[8px] font-black uppercase tracking-widest">在线 · 专业版</span>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-slate-900 border-2 border-white shadow-xl flex items-center justify-center overflow-hidden">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Yunfan" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full max-w-[1600px] flex-1 flex flex-col md:flex-row gap-4 md:gap-6 overflow-hidden relative px-2 md:px-4">
                        {/* Sidebar Capsule (Hidden on Mobile) */}
                        {menuConfig[topTab].length > 0 && (
                            <aside className="hidden md:flex w-48 glass-effect rounded-[32px] p-3 flex-col z-40 overflow-hidden shadow-xl relative">
                                <div className="flex items-center justify-between mb-6 px-3 pt-3">
                                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.4em]">{topTab}</p>
                                    <div className="flex gap-1">
                                        <div className="w-1 h-1 rounded-full bg-accent/40"></div>
                                        <div className="w-1 h-1 rounded-full bg-accent animate-pulse"></div>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                                    {menuConfig[topTab].map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSidebarItemClick(item.id)}
                                            className={`w-full pl-5 py-3.5 rounded-[20px] flex items-center justify-start gap-3.5 transition-all text-left border relative overflow-hidden group ${sidebarItem === item.id ? 'bg-accent-soft text-slate-900 border-accent/20 shadow-md scale-[1.02] z-10' : 'text-slate-400 hover:bg-white/40 hover:text-slate-700 border-transparent'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center transition-all duration-500 ${sidebarItem === item.id ? 'bg-accent text-white shadow-md shadow-accent/20 rotate-[10deg]' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                                                <Icon name={item.icon} className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col items-start -space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[11px] font-black uppercase tracking-[0.1em] whitespace-nowrap ${sidebarItem === item.id ? 'text-slate-900' : 'text-slate-400'}`} style={{animation: sidebarItem === item.id ? 'none' : 'label-float 3s ease-in-out infinite'}}>{item.label}</span>
                                                    {item.count !== undefined && (
                                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black tnum transition-all ${sidebarItem === item.id ? 'bg-accent text-white' : 'bg-slate-100 text-slate-400 opacity-50 group-hover:opacity-100'}`}>{item.count}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* System Engine Card (Fixed Bottom - Compact) */}
                                <div className="mt-4 pt-4 border-t border-slate-200 px-1 mb-1">
                                    <div className="rounded-xl p-3 space-y-2 bg-slate-50 border border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[7px] text-slate-400 font-black uppercase tracking-widest">引擎状态</span>
                                            <span className="flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                                                <span className="text-[7px] text-emerald-500 font-bold uppercase tracking-widest">运行中</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        )}

                        {/* Mobile Bottom Navigation Bar */}
                        <div className="md:hidden fixed bottom-6 left-6 right-6 z-[100]">
                            <div className="glass-effect rounded-[32px] border border-white/10 shadow-2xl p-2 flex items-center justify-around h-16">
                                {[
                                    { id: 'home', icon: 'home' },
                                    { id: 'data', icon: 'pie-chart' },
                                    { id: 'optimize', icon: 'wand-2' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTopTabChange(tab.id)}
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${topTab === tab.id ? 'bg-accent text-white shadow-lg' : 'text-slate-600'}`}
                                    >
                                        <Icon name={tab.icon} className="w-5 h-5" />
                                    </button>
                                ))}
                                <div className="w-px h-8 bg-white/5"></div>
                                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar max-w-[40%] px-2">
                                    {menuConfig[topTab].map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSidebarItemClick(item.id)}
                                            className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${sidebarItem === item.id ? 'bg-white/10 text-white' : 'text-slate-700'}`}
                                        >
                                            <Icon name={item.icon} className="w-5 h-5" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <main className="flex-1 glass-effect rounded-[40px] md:rounded-[40px] p-6 md:p-14 overflow-y-auto relative z-30 flex flex-col items-stretch text-slate-900">
                            {topTab === 'home' && (
                                <>
                                    {sidebarItem === 'news' && <NewsView />}
                                    {sidebarItem === 'intro' && <BusinessIntroView />}
                                    {sidebarItem === 'activity' && <ActivityCenterView />}
                                    {(sidebarItem === 'news' || sidebarItem === 'intro' || sidebarItem === 'activity') === false && <ActivityCenterView />}
                                </>
                            )}
                            {topTab === 'data' && (
                                <>
                                    {sidebarItem === 'reputation' && <ShopReputationView />}
                                    {sidebarItem === 'traffic' && <OrderOverviewView />}
                                    {sidebarItem === 'infringement' && <div className="flex items-center justify-center h-full text-slate-700 font-black uppercase tracking-[0.5em] text-xs italic">违规监控连接中...</div>}
                                    {sidebarItem === 'logistics' && <div className="flex items-center justify-center h-full text-slate-700 font-black uppercase tracking-[0.5em] text-xs italic">物流跟踪连接中...</div>}
                                    {sidebarItem === 'analytics' && <DataAnalysisView />}
                                    {(sidebarItem === 'news' || sidebarItem === 'intro' || sidebarItem === 'activity' || sidebarItem === 'auth' || sidebarItem === 'collect' || sidebarItem === 'maintain' || sidebarItem === 'service' || sidebarItem === 'title' || sidebarItem === 'image' || sidebarItem === 'keyword') && <ShopReputationView />}
                                </>
                            )}
                            {topTab === 'ops' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700">
                                    <div className="flex items-center justify-between border-b border-slate-200 pb-8">
                                        <div>
                                            <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                                                {sidebarItem === 'auth' ? '前期准备' : sidebarItem === 'collect' ? '产品采集' : sidebarItem === 'maintain' ? '商品维护' : '售后处理'}
                                            </h3>
                                            <p className="text-slate-500 text-xs font-medium mt-1">云帆跨境全链路运营中枢</p>
                                        </div>
                                        <div className="px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">运营中枢</div>
                                    </div>
                                    {sidebarItem === 'auth' && (
                                        <div className="flex gap-4">
                                            <a
                                                href="https://global-selling.mercadolibre.com/authorization?response_type=code&client_id=2853782117476515&redirect_uri=https://ml.chensan.vip&code_challenge=6LjyNjMJazRdn1qCBagDMeg2W3IkOlpAPJwDWyvTxeU&code_challenge_method=S256"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group relative flex items-center gap-4 px-8 py-5 rounded-2xl bg-white/40 backdrop-blur-md border border-white/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-300 max-w-xs flex-1"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">
                                                    <Icon name="key" className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[16px] font-black text-slate-800">店铺授权</p>
                                                    <p className="text-[10px] text-slate-400 font-bold">点击跳转授权中心</p>
                                                </div>
                                            </a>
                                            <a
                                                href="https://www.pdkyc.com/#/register"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group relative flex items-center gap-4 px-8 py-5 rounded-2xl bg-white/40 backdrop-blur-md border border-white/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-300 max-w-xs flex-1"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-200 group-hover:scale-110 transition-transform duration-300">
                                                    <Icon name="warehouse" className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[16px] font-black text-slate-800">仓库注册及授权</p>
                                                    <p className="text-[10px] text-slate-400 font-bold">注册账号必须为汉字，建议自己的名字</p>
                                                </div>
                                            </a>
                                            <a
                                                href="https://us.pingpongx.com/entrance/signup?cb=true&inviteCode=Vf6Jre044"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group relative flex items-center gap-4 px-8 py-5 rounded-2xl bg-white/40 backdrop-blur-md border border-white/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-300 max-w-xs flex-1"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-200 group-hover:scale-110 transition-transform duration-300">
                                                    <Icon name="dollar-sign" className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[16px] font-black text-slate-800">回款注册</p>
                                                    <p className="text-[10px] text-slate-400 font-bold">需身份证正反面，邮箱，人脸识别</p>
                                                </div>
                                            </a>
                                        </div>
                                    )}
                                    {sidebarItem !== 'auth' && (
                                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 opacity-40">
                                            <div className="w-24 h-24 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                                                <Icon name={menuConfig.ops.find(i => i.id === sidebarItem)?.icon || 'layout'} className="w-12 h-12" />
                                            </div>
                                            <div>
                                                <p className="text-slate-900 font-black uppercase tracking-[0.5em] text-sm">功能模块连接中...</p>
                                                <p className="text-slate-500 text-xs mt-2">正在同步美客多后台运营接口</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {topTab === 'optimize' && (
                                <>
                                    {sidebarItem === 'title' && <OptimizeTitleView />}
                                    {sidebarItem === 'image' && <ImageLabView />}
                                    {sidebarItem === 'keyword' && <KeywordIntelligenceView />}
                                </>
                            )}
                        </main>
                    </div>

                    <div className="fixed bottom-8 right-12 hidden md:flex items-center gap-4 text-slate-300 z-50">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Yunfan Cross-border PRO</span>
                        <div className="w-2 h-2 rounded-full bg-accent glow-dot"></div>
                    </div>
                {showPreAuthDialog && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPreAuthDialog(false)}></div>
                    <div className="relative w-[420px] bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                                <Icon name="key" className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-1">绑定新店铺</h3>
                            <p className="text-sm text-slate-400 font-bold">请输入店铺备注，完成后自动跳转授权</p>
                        </div>
                        <div className="space-y-4">
                            <input
                                type="text"
                                className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all placeholder:text-slate-300"
                                placeholder="如：1号店、巴西2号店"
                                value={preAuthStoreName}
                                onChange={e => setPreAuthStoreName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && preAuthStoreName.trim() && handlePreAuthAuthorize()}
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPreAuthDialog(false)}
                                    className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-colors"
                                >取消</button>
                                <button
                                    onClick={handlePreAuthAuthorize}
                                    disabled={!preAuthStoreName.trim()}
                                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                                >去授权 →</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Naming Dialog - shown after successful OAuth */}
            {showNamingDialog && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowNamingDialog(false)}></div>
                    <div className="relative w-[420px] bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">授权成功！</h3>
                            <p className="text-sm text-slate-500">检测到新店铺授权，请为其设置名称</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">店铺名称</label>
                                <input
                                    type="text"
                                    value={namingInput}
                                    onChange={e => setNamingInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && namingInput.trim() && handleNamingSubmit()}
                                    placeholder="例如：云帆1店"
                                    className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowNamingDialog(false)}
                                    className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-500 text-sm font-bold hover:bg-slate-200 transition-all"
                                >
                                    跳过
                                </button>
                                <button
                                    onClick={handleNamingSubmit}
                                    disabled={!namingInput.trim()}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-black hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    确认添加
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
            );

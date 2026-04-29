import React, { useState, useEffect, Suspense, lazy } from 'react';
import Icon from './components/Icon';
import Brand from './components/Brand';
import ErrorBoundary from './components/ErrorBoundary';

// Views - Lazy Loading
const NewsView = lazy(() => import('./views/NewsView'));
const ShopReputationView = lazy(() => import('./views/ShopReputationView'));
const MarketRadarView = lazy(() => import('./views/MarketRadarView'));
const DataOverviewView = lazy(() => import('./views/DataOverviewView'));
const BusinessIntroView = lazy(() => import('./views/BusinessIntroView'));
const ActivityCenterView = lazy(() => import('./views/ActivityCenterView'));
const ProductPerformanceView = lazy(() => import('./views/ProductPerformanceView'));
const LogisticsAlertsView = lazy(() => import('./views/LogisticsAlertsView'));
const AuthPrepareView = lazy(() => import('./views/AuthPrepareView'));
const ProductCollectView = lazy(() => import('./views/ProductCollectView'));
const ProductMaintainView = lazy(() => import('./views/ProductMaintainView'));
const AfterSalesView = lazy(() => import('./views/AfterSalesView'));
const OptimizeTitleView = lazy(() => import('./views/OptimizeTitleView'));
const ImageLabView = lazy(() => import('./views/ImageLabView'));
const KeywordIntelView = lazy(() => import('./views/KeywordIntelView'));
const SmartPriceCheckView = lazy(() => import('./views/SmartPriceCheckView'));

const LoginPage = ({ onLogin }) => {
    return (
        <div className="h-screen flex bg-slate-50 overflow-hidden text-slate-900 font-sans selection:bg-blue-100">
            {/* Sidebar (Fixed Navigation) */}
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
                            <p className="text-slate-900 text-5xl font-black italic tnum tracking-tighter leading-none">5,820+</p>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">已集成订单</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-blue-600 text-5xl font-black italic tnum tracking-tighter leading-none">$12,402,000</p>
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
                            <button className="pb-5 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-blue-600 border-b-2 border-blue-600">账号登录</button>
                            <button className="pb-5 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-600 transition-colors">注册申请</button>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">电子邮箱</label>
                                <input 
                                    type="text" 
                                    placeholder="your@email.com" 
                                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">访问密码</label>
                                <input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={onLogin}
                            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98]"
                        >
                            即刻进入引擎
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MonitoringSidebar = () => {
    const [logs, setLogs] = useState([
        { id: 1, type: 'violation', label: '违规警报', desc: '检测到新增 1 条知识产权投诉', time: '现在', urgent: true },
        { id: 2, type: 'logistics', label: '物流预警', desc: '#ML-0842 超期发货预警', time: '5分前', urgent: true },
        { id: 3, type: 'message', label: '客户消息', desc: 'Carlos: 发货了吗?', time: '12分前', urgent: false },
        { id: 4, type: 'reputation', label: '声誉变化', desc: 'MX站评分波动提醒', time: '1h前', urgent: false },
        { id: 5, type: 'order', label: '订单产生', desc: '#ML-2931 新订单待处理', time: '2h前', urgent: false },
    ]);

    const typeConfig = {
        violation:  { icon: 'alert-circle', color: 'text-red-500', bg: 'bg-red-50' },
        logistics:  { icon: 'truck', color: 'text-amber-500', bg: 'bg-amber-50' },
        message:    { icon: 'message-square', color: 'text-blue-500', bg: 'bg-blue-50' },
        reputation: { icon: 'shield', color: 'text-purple-500', bg: 'bg-purple-50' },
        order:      { icon: 'shopping-bag', color: 'text-emerald-500', bg: 'bg-emerald-50' },
        complaint:  { icon: 'info', color: 'text-rose-500', bg: 'bg-rose-50' }
    };

    return (
        <div className="w-[180px] bg-slate-50 border-r border-slate-200 flex flex-col h-full overflow-hidden shrink-0">
            <div className="h-[50px] border-b border-slate-200 flex items-center px-4 bg-white shrink-0">
                <span className="text-[11px] font-black text-slate-900 tracking-tight">实时监控日志</span>
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 no-scrollbar">
                {logs.map(log => {
                    const cfg = typeConfig[log.type] || typeConfig.order;
                    return (
                        <div key={log.id} className={`h-[42px] px-3 flex flex-col justify-center border transition-all cursor-pointer hover:border-slate-300 ${log.urgent ? 'bg-white border-red-100' : 'bg-white border-slate-100'}`}>
                            <div className="flex items-center justify-between">
                                <span className={`text-[8px] font-black uppercase tracking-wider ${cfg.color}`}>{log.label}</span>
                                <span className="text-[7px] text-slate-400 font-bold">{log.time}</span>
                            </div>
                            <p className="text-[9px] text-slate-700 font-medium leading-tight truncate">{log.desc}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [topTab, setTopTab] = useState('home');
    const [sidebarItem, setSidebarItem] = useState('news');

    const menuConfig = {
        home: [
            { id: 'auth', label: '前期准备', icon: 'key', color: 'text-teal-500', bg: 'bg-teal-500', shadow: 'shadow-teal-500/30' },
            { id: 'news', label: '最新资讯', icon: 'newspaper', color: 'text-blue-500', bg: 'bg-blue-500', shadow: 'shadow-blue-500/30' },
            { id: 'intro', label: '业务介绍', icon: 'info', color: 'text-indigo-500', bg: 'bg-indigo-500', shadow: 'shadow-indigo-500/30' },
            { id: 'activity', label: '活动中心', icon: 'star', color: 'text-amber-500', bg: 'bg-amber-500', shadow: 'shadow-amber-500/30' }
        ],
        data: [
            { id: 'reputation', label: '店铺声誉', icon: 'shield', color: 'text-blue-500', bg: 'bg-blue-500', shadow: 'shadow-blue-500/30' },
            { id: 'infringement', label: '商品性能表', icon: 'bar-chart-2', color: 'text-indigo-500', bg: 'bg-indigo-500', shadow: 'shadow-indigo-500/30', count: 0 },
            { id: 'data-overview', label: '数据大盘', icon: 'pie-chart', color: 'text-blue-500', bg: 'bg-blue-500', shadow: 'shadow-blue-500/30' }
        ],
        ops: [
            { id: 'radar', label: '爆品雷达', icon: 'zap', color: 'text-orange-500', bg: 'bg-orange-500', shadow: 'shadow-orange-500/30' },
            { id: 'price-check', label: '智能核价', icon: 'calculator', color: 'text-emerald-500', bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/30' },
            { id: 'collect', label: '产品采集', icon: 'download-cloud', color: 'text-blue-500', bg: 'bg-blue-500', shadow: 'shadow-blue-500/30' },
            { id: 'maintain', label: '商品维护', icon: 'settings', color: 'text-slate-500', bg: 'bg-slate-500', shadow: 'shadow-slate-500/30' },
            { id: 'service', label: '售后处理', icon: 'headphones', color: 'text-rose-500', bg: 'bg-rose-500', shadow: 'shadow-rose-500/30' },
            { id: 'logistics', label: '物流跟踪', icon: 'truck', color: 'text-cyan-500', bg: 'bg-cyan-500', shadow: 'shadow-cyan-500/30' }
        ],
        optimize: [
            { id: 'title', label: '标题优化', icon: 'type', color: 'text-indigo-600', bg: 'bg-indigo-600', shadow: 'shadow-indigo-600/30' },
            { id: 'image', label: '视觉图生图', icon: 'image', color: 'text-purple-500', bg: 'bg-purple-500', shadow: 'shadow-purple-500/30' },
            { id: 'keyword', label: '关键词衍生', icon: 'hash', color: 'text-amber-600', bg: 'bg-amber-600', shadow: 'shadow-amber-600/30' }
        ]
    };

    // Hash sync logic
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#/', '');
            if (hash) {
                // Find which tab this item belongs to
                for (const [tabId, items] of Object.entries(menuConfig)) {
                    if (items.some(item => item.id === hash)) {
                        setTopTab(tabId);
                        setSidebarItem(hash);
                        break;
                    }
                }
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // Init
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    if (!isLoggedIn) return <LoginPage onLogin={() => setIsLoggedIn(true)} />;

    return (
        <div className="h-screen w-full bg-white flex overflow-hidden text-slate-900 font-sans selection:bg-blue-100">
            
            {/* Column 1: Functional Navigation (Flattened) */}
            <div className="w-[130px] bg-slate-100 border-r border-slate-200 flex flex-col h-full shrink-0 overflow-hidden">
                <div className="h-[50px] flex items-center justify-center border-b border-slate-200 bg-slate-50 shrink-0">
                    <span className="text-xs font-black text-blue-600 tracking-tighter uppercase">云帆 PRO</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-6 no-scrollbar">
                    {[
                        { id: 'home', label: '首页', icon: 'home' },
                        { id: 'data', label: '数据中心', icon: 'pie-chart' },
                        { id: 'ops', label: '运营中心', icon: 'zap' },
                        { id: 'optimize', label: '优化中心', icon: 'wand-2' }
                    ].map(group => (
                        <div key={group.id} className="space-y-2">
                            {/* Group Header */}
                            <div className={`px-2 py-1 flex items-center gap-2 ${topTab === group.id ? 'text-blue-600' : 'text-slate-400'}`}>
                                <Icon name={group.icon} className="w-4 h-4" />
                                <span className="text-[15px] font-black tracking-tight">{group.label}</span>
                            </div>
                            
                            {/* Sub Items */}
                            <div className="space-y-1">
                                {menuConfig[group.id].map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setTopTab(group.id);
                                            setSidebarItem(item.id);
                                            window.location.hash = `#/${item.id}`;
                                        }}
                                        className={`w-full text-left px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${sidebarItem === item.id ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-200/50'}`}
                                    >
                                        ● {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Column 2: Real-time Monitoring */}
            <MonitoringSidebar />

            {/* Column 3: Main View (Sharp Edges, Top Aligned) */}
            <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
                {/* Global Header (Top Aligned) */}
                <div className="h-[50px] border-b border-slate-200 flex items-center px-6 bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${sidebarItem === 'logistics' ? 'bg-cyan-500' : 'bg-blue-500'} animate-pulse`}></div>
                        <h2 className="text-xs font-black text-slate-900 tracking-tight uppercase">
                            指挥空间：{
                                Object.values(menuConfig).flat().find(i => i.id === sidebarItem)?.label || '监控中心'
                            }
                        </h2>
                    </div>
                </div>

                {/* View Content (Sharp, Zero Scroll Body) */}
                <div className="flex-1 overflow-hidden bg-slate-50/30">
                    <ErrorBoundary key={sidebarItem}>
                        <Suspense fallback={
                            <div className="h-full flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
                            </div>
                        }>
                            <div className="h-full overflow-hidden">
                                {sidebarItem === 'news' && <NewsView />}
                                {sidebarItem === 'reputation' && <ShopReputationView />}
                                {sidebarItem === 'radar' && <MarketRadarView />}
                                {sidebarItem === 'data-overview' && <DataOverviewView />}
                                {sidebarItem === 'intro' && <BusinessIntroView />}
                                {sidebarItem === 'activity' && <ActivityCenterView />}
                                {sidebarItem === 'infringement' && <ProductPerformanceView />}
                                {sidebarItem === 'logistics' && <LogisticsAlertsView />}
                                {sidebarItem === 'auth' && <AuthPrepareView />}
                                {sidebarItem === 'collect' && <ProductCollectView />}
                                {sidebarItem === 'maintain' && <ProductMaintainView />}
                                {sidebarItem === 'service' && <AfterSalesView />}
                                {sidebarItem === 'title' && <OptimizeTitleView />}
                                {sidebarItem === 'image' && <ImageLabView />}
                                {sidebarItem === 'keyword' && <KeywordIntelView />}
                                {sidebarItem === 'price-check' && <SmartPriceCheckView />}
                            </div>
                        </Suspense>
                    </ErrorBoundary>
                </div>
            </div>
        </div>
    );
};

export default App;

import React, { useState, useEffect, Suspense, lazy } from 'react';
import Icon from './components/Icon';
import Brand from './components/Brand';

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

// Hooks
import { useStatsOverview } from './hooks/useStatsOverview';

const LoginPage = ({ onLogin }) => {
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
                            <button className="pb-5 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-600">立即注册</button>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">欢迎登录</h2>
                    </div>

                    <div className="space-y-6 md:space-y-8">
                        <div className="space-y-2 md:space-y-4">
                            <label className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] px-4">账号标识</label>
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-[28px] md:rounded-[32px] px-8 md:px-10 py-5 md:py-6 text-slate-900 font-bold focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-300 text-sm md:text-base shadow-inner" placeholder="YUNFAN_PRO_ADMIN" />
                        </div>
                        <div className="space-y-2 md:space-y-4">
                            <label className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] px-4">访问秘钥</label>
                            <input type="password" title="password" className="w-full bg-slate-50 border border-slate-200 rounded-[28px] md:rounded-[32px] px-8 md:px-10 py-5 md:py-6 text-slate-900 font-bold focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-300 text-sm md:text-base shadow-inner" placeholder="••••••••" />
                        </div>
                        <button onClick={onLogin} className="w-full bg-slate-900 text-white py-6 md:py-7 rounded-[28px] md:rounded-[32px] font-black text-[10px] md:text-xs uppercase tracking-[0.4em] hover:bg-blue-600 transition-all shadow-2xl shadow-blue-500/20 active:scale-[0.98]">
                            进入系统
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [topTab, setTopTab] = useState('home');
    const [sidebarItem, setSidebarItem] = useState('news');
    const { stats, isLoading: statsLoading } = useStatsOverview();

    const menuConfig = {
        home: [
            { id: 'news', label: '最新资讯', icon: 'newspaper' },
            { id: 'intro', label: '业务介绍', icon: 'info' },
            { id: 'activity', label: '活动中心', icon: 'star' }
        ],
        data: [
            { id: 'reputation', label: '店铺声誉', icon: 'shield-check', status: 'pulse' },
            { id: 'infringement', label: '商品性能表', icon: 'bar-chart-2', count: 0 },
            { id: 'radar', label: '爆品雷达', icon: 'zap' },
            { id: 'data-overview', label: '数据概览', icon: 'bar-chart-2' },
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
        if (itemId === 'sync_lark') {
            fetch('/api/sync').then(r => r.json()).then(d => alert(d.message || 'Sync triggered')).catch(e => alert(e.message));
            return;
        }
        // Data Center Tab

        const dataItems = ['reputation', 'radar', 'data-overview', 'infringement', 'logistics'];
        if (dataItems.includes(itemId) && topTab !== 'data') setTopTab('data');
        // Ops Center Tab
        const opsItems = ['auth', 'collect', 'maintain', 'service'];
        if (opsItems.includes(itemId) && topTab !== 'ops') setTopTab('ops');
        // Optimize Center Tab
        const optimizeItems = ['title', 'image', 'keyword'];
        if (optimizeItems.includes(itemId) && topTab !== 'optimize') setTopTab('optimize');
        setSidebarItem(itemId);
    };

    if (!isLoggedIn) return <LoginPage onLogin={() => setIsLoggedIn(true)} />;

    return (
        <div className={`h-screen w-full gradient-bg flex flex-col items-center pt-2 md:pt-8 pb-8 md:pb-6 gap-4 md:gap-6 overflow-hidden relative px-4 md:px-12 ${moduleClass}`}>
            
            {/* Top Navigation Bar */}
            <div className="w-full max-w-[1600px] z-50 px-2 md:px-4 box-border">
                <div className="glass-effect rounded-3xl flex md:grid md:grid-cols-[2.2fr_auto_1fr] items-center justify-between pl-6 md:pl-8 pr-6 md:pr-12 py-3 md:py-4 shadow-xl w-full">
                    <div className="flex items-center">
                        <Brand slogan="跨境电商智能工作台" />
                    </div>

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

                    <div className="hidden md:flex items-center justify-end gap-6 border-l border-slate-200 ml-10 pl-10 h-10">
                        <div className="flex flex-col items-end -space-y-1">
                            <span className="text-slate-900 font-black text-sm tracking-tight uppercase">数据获取</span>
                            <span className="text-emerald-500 text-[8px] font-black uppercase tracking-widest">在线 · 专业版</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border-2 border-white shadow-xl flex items-center justify-center overflow-hidden">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Yunfan" alt="avatar" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-[1600px] flex-1 flex flex-col md:flex-row gap-4 md:gap-6 overflow-hidden relative px-2 md:px-4">
                
                {/* Sidebar */}
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

                    <div className="mt-4 pt-4 border-t border-slate-200 px-1 mb-1 space-y-2">
                        <button 
                            onClick={() => handleSidebarItemClick('sync_lark')}
                            className="w-full py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-blue-100"
                        >
                            <Icon name="refresh-cw" className="w-3 h-3" />
                            同步至 Lark Bitable
                        </button>
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

                {/* Content */}
                <main className={`flex-1 glass-effect rounded-[40px] p-6 md:p-12 relative z-10 custom-scrollbar ${sidebarItem === 'reputation' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
                    <Suspense fallback={<div className="h-full flex items-center justify-center"><Icon name="loader" className="w-8 h-8 animate-spin text-slate-300" /></div>}>
                        {sidebarItem === 'news' && <NewsView />}
                        {sidebarItem === 'intro' && <BusinessIntroView />}
                        {sidebarItem === 'activity' && <ActivityCenterView />}
                        {sidebarItem === 'reputation' && <ShopReputationView />}
                        {sidebarItem === 'radar' && <MarketRadarView />}
                        {sidebarItem === 'data-overview' && <DataOverviewView />}
                        {sidebarItem === 'infringement' && <ProductPerformanceView />}
                        {sidebarItem === 'logistics' && <LogisticsAlertsView />}
                        {sidebarItem === 'auth' && <AuthPrepareView />}
                        {sidebarItem === 'collect' && <ProductCollectView />}
                        {sidebarItem === 'maintain' && <ProductMaintainView />}
                        {sidebarItem === 'service' && <AfterSalesView />}

                        {!['news', 'intro', 'activity', 'reputation', 'radar', 'data-overview', 'traffic', 'infringement', 'logistics', 'auth', 'collect', 'maintain', 'service', 'title', 'image', 'keyword'].includes(sidebarItem) && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
                                    <Icon name="construction" className="w-10 h-10" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em]">模块开发中...</p>
                            </div>
                        )}
                        {sidebarItem === 'title' && <OptimizeTitleView />}
                        {sidebarItem === 'image' && <ImageLabView />}
                        {sidebarItem === 'keyword' && <KeywordIntelView />}
                    </Suspense>
                </main>
            </div>
        </div>
    );
};

export default App;

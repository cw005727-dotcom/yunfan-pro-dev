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

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [topTab, setTopTab] = useState('data');
    const [sidebarItem, setSidebarItem] = useState('reputation');
    const [moduleClass, setModuleClass] = useState('theme-data');

    const menuConfig = {
        home: [
            { id: 'news', label: '最新资讯', icon: 'newspaper', color: 'text-blue-500', bg: 'bg-blue-500', shadow: 'shadow-blue-500/30' },
            { id: 'intro', label: '业务介绍', icon: 'info', color: 'text-indigo-500', bg: 'bg-indigo-500', shadow: 'shadow-indigo-500/30' },
            { id: 'activity', label: '活动中心', icon: 'star', color: 'text-amber-500', bg: 'bg-amber-500', shadow: 'shadow-amber-500/30' }
        ],
        data: [
            { id: 'reputation', label: '数据大盘', icon: 'pie-chart', color: 'text-blue-500', bg: 'bg-blue-500', shadow: 'shadow-blue-500/30' },
            { id: 'radar', label: '爆品雷达', icon: 'zap', color: 'text-orange-500', bg: 'bg-orange-500', shadow: 'shadow-orange-500/30' },
            { id: 'data-overview', label: '数据概览', icon: 'bar-chart-2', color: 'text-blue-500', bg: 'bg-blue-500', shadow: 'shadow-blue-500/30' },
            { id: 'infringement', label: '商品性能表', icon: 'bar-chart-2', color: 'text-indigo-500', bg: 'bg-indigo-500', shadow: 'shadow-indigo-500/30', count: 0 }
        ],
        ops: [
            { id: 'collect', label: '产品采集', icon: 'download-cloud', color: 'text-blue-500', bg: 'bg-blue-500', shadow: 'shadow-blue-500/30' },
            { id: 'maintain', label: '商品维护', icon: 'settings', color: 'text-slate-500', bg: 'bg-slate-500', shadow: 'shadow-slate-500/30' },
            { id: 'service', label: '售后处理', icon: 'headphones', color: 'text-rose-500', bg: 'bg-rose-500', shadow: 'shadow-rose-500/30' },
            { id: 'logistics', label: '物流跟踪', icon: 'truck', color: 'text-cyan-500', bg: 'bg-cyan-500', shadow: 'shadow-cyan-500/30' }
        ],
        optimize: [
            { id: 'auth', label: '店铺授权', icon: 'key', color: 'text-teal-500', bg: 'bg-teal-500', shadow: 'shadow-teal-500/30' },
            { id: 'title', label: '标题优化', icon: 'type', color: 'text-indigo-600', bg: 'bg-indigo-600', shadow: 'shadow-indigo-600/30' },
            { id: 'image', label: '视觉图生图', icon: 'image', color: 'text-purple-500', bg: 'bg-purple-500', shadow: 'shadow-purple-500/30' },
            { id: 'keyword', label: '关键词衍生', icon: 'hash', color: 'text-amber-600', bg: 'bg-amber-600', shadow: 'shadow-amber-600/30' }
        ]
    };

    const handleTopTabChange = (tabId) => {
        setTopTab(tabId);
        setSidebarItem(menuConfig[tabId][0].id);
        setModuleClass(`theme-${tabId}`);
    };

    const handleSidebarItemClick = (itemId) => {
        setSidebarItem(itemId);
    };

    if (!isLoggedIn) return <LoginPage onLogin={() => setIsLoggedIn(true)} />;

    return (
        <div className="h-screen w-full bg-[#f8fafc] flex overflow-hidden text-slate-900 font-sans">
            
            {/* Column 1: Matrix Icons (Centers) */}
            <div className="w-[70px] bg-[#020617] flex flex-col items-center py-8 gap-6 shrink-0 z-50">
                <div className="mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <Icon name="command" className="w-6 h-6" />
                    </div>
                </div>

                {[
                    { id: 'home', icon: 'home', label: '首页', color: 'blue' },
                    { id: 'data', icon: 'pie-chart', label: '数据', color: 'indigo' },
                    { id: 'ops', icon: 'layout', label: '运营', color: 'teal' },
                    { id: 'optimize', icon: 'wand-2', label: '优化', color: 'amber' }
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleTopTabChange(item.id)}
                        className={`group relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${topTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
                    >
                        <Icon name={item.icon} className="w-5 h-5" />
                        
                        {/* Tooltip */}
                        <div className="absolute left-full ml-4 px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                            {item.label}中心
                        </div>
                        
                        {/* Active Indicator */}
                        {topTab === item.id && (
                            <div className="absolute -left-4 w-1.5 h-8 bg-blue-500 rounded-r-full shadow-[4px_0_12px_rgba(59,130,246,0.5)]"></div>
                        )}
                    </button>
                ))}

                <div className="mt-auto space-y-4">
                    <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                        <Icon name="bell" className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center overflow-hidden cursor-pointer">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Yunfan" alt="avatar" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>

            {/* Column 2: Sub-menu Items */}
            <div className="w-56 bg-[#0F172A] flex flex-col py-8 px-4 shrink-0 z-40 border-r border-white/5 shadow-2xl">
                <div className="mb-8 px-2">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mb-1">
                        {topTab === 'home' ? 'Home' : topTab === 'data' ? 'Data Intelligence' : topTab === 'ops' ? 'Operations' : 'Optimization'}
                    </p>
                    <div className="h-1 w-8 bg-blue-600 rounded-full"></div>
                </div>

                <div className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar-dark pr-1">
                    {menuConfig[topTab].map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleSidebarItemClick(item.id)}
                            className={`w-full px-4 py-3.5 rounded-2xl flex items-center gap-3.5 transition-all text-left group relative ${sidebarItem === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-black' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 font-bold'}`}
                        >
                            <Icon name={item.icon} className={`w-4.5 h-4.5 transition-transform duration-500 ${sidebarItem === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <span className="text-[13px] whitespace-nowrap">{item.label}</span>
                            
                            {item.count !== undefined && (
                                <span className={`ml-auto px-2 py-0.5 rounded-md text-[9px] font-black ${sidebarItem === item.id ? 'bg-white/20' : 'bg-white/5 text-slate-500'}`}>
                                    {item.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Account Section */}
                <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">当前租户积分</p>
                        <div className="flex items-end justify-between">
                            <span className="text-2xl font-black text-white leading-none">444</span>
                            <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-colors shadow-lg shadow-blue-500/10">
                                充值
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between px-2">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">内核状态</span>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></div>
                            <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Stack: Header + Content */}
            <div className="flex-1 flex flex-col min-w-0">
                
                {/* Header */}
                <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0 z-30">
                    <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                            {topTab === 'home' ? '首页' : topTab === 'data' ? '数据中心' : topTab === 'ops' ? '运营中心' : '优化中心'}
                        </span>
                        <span className="text-slate-300 text-sm">/</span>
                        <h2 className="text-slate-900 text-base font-black tracking-tight">
                            {menuConfig[topTab].find(i => i.id === sidebarItem)?.label || '加载中...'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            <span className="text-[10px] text-slate-500 font-bold">更新于 04/28 21:33</span>
                        </div>
                        <button className="px-4 py-2 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10">
                            <Icon name="refresh-cw" className="w-3.5 h-3.5" />
                            刷新
                        </button>
                        <div className="w-px h-6 bg-slate-200 mx-2"></div>
                        <button className="text-slate-400 hover:text-rose-500 transition-colors">
                            <Icon name="log-out" className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className={`flex-1 overflow-hidden relative custom-scrollbar bg-slate-50 ${['reputation', 'infringement'].includes(sidebarItem) ? 'overflow-hidden' : 'overflow-y-auto'}`}>
                    <div className="h-full p-10">
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
                                    <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center">
                                        <Icon name="construction" className="w-10 h-10" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">模块开发中...</p>
                                </div>
                            )}
                            {sidebarItem === 'title' && <OptimizeTitleView />}
                            {sidebarItem === 'image' && <ImageLabView />}
                            {sidebarItem === 'keyword' && <KeywordIntelView />}
                        </Suspense>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;

import React, { useState, useEffect, Suspense, lazy } from 'react';
import Icon from './components/Icon';
import Brand from './components/Brand';
import ErrorBoundary from './components/ErrorBoundary';
import { useAppContext } from './context/AppContext';

// Lazy Load Views
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
const ProductResearchView = lazy(() => import('./views/ProductResearchView'));
const Toast = lazy(() => import('./components/Toast'));

const LoginPage = ({ onLogin }) => (
    <div className="h-screen w-full bg-[#020617] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-900 border border-white/10 p-12 space-y-8 shadow-2xl">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-none mb-4">
                    <Icon name="command" className="w-10 h-10 text-emerald-500" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase">云帆 PRO</h1>
                <p className="text-slate-500 text-[11px] whitespace-nowrap font-bold uppercase tracking-widest">指挥官 V4.29.33</p>
            </div>
            <div className="space-y-4 pt-4">
                <button 
                    onClick={onLogin}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 group"
                >
                    <Icon name="zap" className="w-5 h-5 group-hover:animate-pulse" />
                    进入作战室
                </button>
            </div>
        </div>
    </div>
);

const TopMonitoringHub = () => {
    const [logs, setLogs] = useState([]);
    const [siteMap] = useState({
        'MLB': '巴西',
        'MLM': '墨西哥',
        'MCO': '哥伦比亚',
        'MLA': '阿根廷',
        'MLC': '智利',
        'MLU': '乌拉圭'
    });

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/monitoring/stream');
            const data = await res.json();
            if (data.events) {
                setLogs(data.events);
            }
        } catch (err) {
            console.error("Failed to fetch logs:", err);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, []);

    const filterLogs = (types) => logs.filter(log => types.includes(log.type));

    const renderCard = (title, filteredLogs, themeColor, borderColor) => (
        <div className={`w-[160px] h-[115px] flex flex-col bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shrink-0 group transition-all hover:bg-slate-800/60 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]`}>
            <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${themeColor.replace('bg-', 'bg-')}`} style={{ boxShadow: `0 0 10px ${borderColor.replace('border-', '').split('/')[0]}` }}></div>
                    <span className="text-white font-black text-[10px] uppercase tracking-[0.1em]">{title}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-white/20"></div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
                {filteredLogs.length > 0 ? filteredLogs.map(log => {
                    const shopName = log.desc.split(' ')[0] || '未知店铺';
                    const siteCode = log.site_id || 'Global';
                    const siteName = siteMap[siteCode] || siteCode;
                    const event = log.label || '动态';
                    
                    return (
                        <div key={log.id} className="space-y-1 group/item">
                            <div className="text-white text-[11px] font-bold leading-tight group-hover/item:text-blue-400 transition-colors truncate">
                                {shopName} {event}
                            </div>
                            <div className="flex items-center justify-between opacity-50">
                                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: borderColor.replace('border-', '').split('/')[0] }}>
                                    {siteName}
                                </span>
                                <span className="text-[9px] text-white font-mono">{log.time}</span>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="h-full flex items-center justify-center">
                        <span className="text-white/10 text-[9px] uppercase tracking-[0.2em] font-black">Syncing...</span>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-[145px] bg-[#0F172A] border-b border-blue-500/20 flex items-center px-10 gap-10 shrink-0 relative overflow-hidden">
            {/* Cinematic Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-purple-600/10 opacity-30"></div>
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full"></div>
            
            {/* Brand Intelligence Area */}
            <div className="flex flex-col gap-1 shrink-0 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                        <Icon name="command" className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-white text-[22px] font-black tracking-tighter uppercase leading-none">云帆跨境</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-[9px] font-black text-blue-400 uppercase tracking-widest">Commander V8.1</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monitoring Grid (Ultra-Precision) */}
            <div className="flex-1 flex items-center justify-start gap-5 overflow-x-auto no-scrollbar py-2 relative z-10">
                {renderCard('订单监控', filterLogs(['order']), 'bg-[#EC4899]', 'border-[#EC4899]/40')}
                {renderCard('物流监控', filterLogs(['logistics']), 'bg-[#10B981]', 'border-[#10B981]/40')}
                {renderCard('声誉监控', filterLogs(['reputation', 'complaint', 'violation']), 'bg-[#EF4444]', 'border-[#EF4444]/40')}
                {renderCard('咨询监控', filterLogs(['message']), 'bg-[#3B82F6]', 'border-[#3B82F6]/40')}
            </div>
        </div>
    );
};

const MonitoringSidebar = ({ mobile, onClose }) => {
    const [logs, setLogs] = useState([]);

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/monitoring/stream');
            const data = await res.json();
            if (data.events) {
                setLogs(data.events);
            }
        } catch (err) {
            console.error("Failed to fetch logs:", err);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, []);

    const typeConfig = {
        complaint:  { theme: 'orange', hex: '#F97316', bg: 'bg-orange-500/10', border: 'border-orange-500/20' }, // 橙色: 投诉
        violation:  { theme: 'red',    hex: '#EF4444', bg: 'bg-red-500/10',    border: 'border-red-500/20' },    // 红色: 违规
        logistics:  { theme: 'khaki',  hex: '#C3B091', bg: 'bg-[#C3B091]/15', border: 'border-[#C3B091]/30' }, // 卡其色: 物流
        message:    { theme: 'blue',   hex: '#3B82F6', bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },   // 蓝色: 咨询
        reputation: { theme: 'purple', hex: '#A855F7', bg: 'bg-purple-500/10', border: 'border-purple-500/20' }, // 紫色: 声誉
        order:      { theme: 'pink',   hex: '#EC4899', bg: 'bg-pink-500/10',   border: 'border-pink-500/20' },   // 粉色: 成交
        radar:      { theme: 'yellow', hex: '#EAB308', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' }  // 黄色: 机会
    };

    return (
        <div className={`${mobile ? 'w-full' : 'w-[220px]'} bg-[#0F172A] border-r border-white/5 flex flex-col h-full overflow-hidden shrink-0 relative`}>
            {/* Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/10 blur-[60px] pointer-events-none"></div>
            
            <div className="h-[64px] border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex flex-col">
                    <span className="text-[13px] font-black text-white tracking-widest uppercase">实时监控</span>
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-tight whitespace-nowrap">Intelligence Stream</span>
                </div>
                {mobile && (
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <Icon name="x" className="w-5 h-5" />
                    </button>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 no-scrollbar z-10">
                {logs.map((log) => {
                    const cfg = typeConfig[log.type] || typeConfig.order;
                    return (
                        <div 
                            key={log.id} 
                            className={`animate-log-eject group relative flex flex-col rounded-2xl backdrop-blur-xl border transition-all duration-300 cursor-pointer overflow-hidden
                                ${cfg.bg} ${cfg.border} hover:bg-white/5 hover:border-white/20 shadow-sm`}
                        >
                            <div className="p-3 space-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: cfg.hex, boxShadow: `0 0 8px ${cfg.hex}` }}></div>
                                        <span className="text-[11px] whitespace-nowrap font-black text-white/90 uppercase tracking-tight">{log.label}</span>
                                    </div>
                                    <span className="text-[11px] whitespace-nowrap text-slate-500 font-mono italic">{log.time}</span>
                                </div>
                                
                                <p className="text-[10px] text-slate-500 font-bold leading-relaxed group-hover:text-white transition-colors">
                                    {log.desc}
                                </p>
                            </div>

                            {/* Option B: Bottom Status Bar for Urgent Logs */}
                            {log.urgent && (
                                <div className="bg-red-500/20 border-t border-red-500/30 px-4 py-1.5 flex items-center justify-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></div>
                                    <span className="text-[11px] whitespace-nowrap font-black text-red-400 uppercase tracking-widest">紧急预警</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="h-12 border-t border-white/5 flex items-center px-6 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[11px] whitespace-nowrap text-slate-500 font-black uppercase tracking-widest">Active Connection</span>
                </div>
            </div>
        </div>
    );
};

const App = () => {
    const { toast, showToast } = useAppContext();
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [topTab, setTopTab] = useState('home');
    const [sidebarItem, setSidebarItem] = useState('news');
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [mobileLogsOpen, setMobileLogsOpen] = useState(false);

    const menuConfig = {
        home: [
            { id: 'auth', label: '前期准备', icon: 'key', color: 'text-slate-600', active: 'bg-slate-500/10 border-slate-500/30' },
            { id: 'news', label: '最新资讯', icon: 'newspaper', color: 'text-blue-500', bg: 'bg-blue-500', shadow: 'shadow-blue-500/30' },
            { id: 'intro', label: '业务介绍', icon: 'info', color: 'text-indigo-500', bg: 'bg-indigo-500', shadow: 'shadow-indigo-500/30' },
            { id: 'activity', label: '活动中心', icon: 'star', color: 'text-amber-500', bg: 'bg-amber-500', shadow: 'shadow-amber-500/30' }
        ],
        data: [
            { id: 'reputation', label: '店铺声誉', icon: 'shield', color: 'text-blue-500', bg: 'bg-blue-500', shadow: 'shadow-blue-500/30' },
            { id: 'radar', label: '爆品雷达', icon: 'zap', color: 'text-orange-500', bg: 'bg-orange-500', shadow: 'shadow-orange-500/30' },
            { id: 'infringement', label: '商品性能表', icon: 'bar-chart-2', color: 'text-indigo-500', bg: 'bg-indigo-500', shadow: 'shadow-indigo-500/30', count: 0 },
            { id: 'data-overview', label: '数据大盘', icon: 'pie-chart', color: 'text-blue-500', bg: 'bg-blue-500', shadow: 'shadow-blue-500/30' },
            { id: 'research', label: '选品研究', icon: 'search', color: 'text-rose-500', bg: 'bg-rose-500', shadow: 'shadow-rose-500/30' }
        ],
        ops: [
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

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#/', '');
            if (hash) {
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
        handleHashChange();
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    if (!isLoggedIn) return <LoginPage onLogin={() => setIsLoggedIn(true)} />;

    return (
        <div className="h-screen w-full bg-[#020617] flex flex-col overflow-hidden text-slate-900 font-sans selection:bg-blue-100">
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="lg:hidden h-[48px] bg-[#0F172A] border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-50">
                <button onClick={() => setMobileNavOpen(true)} className="text-white/60 hover:text-white p-2 transition-colors">
                    <Icon name="menu" className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[12px] font-black text-white tracking-tight uppercase">
                        {Object.values(menuConfig).flat().find(i => i.id === sidebarItem)?.label || '云帆 PRO'}
                    </span>
                </div>
                <button onClick={() => setMobileLogsOpen(true)} className="text-white/60 hover:text-white p-2 relative transition-colors">
                    <Icon name="activity" className="w-5 h-5" />
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse border-2 border-[#0F172A]"></div>
                </button>
            </div>

            <div className="flex-1 flex flex-row overflow-hidden relative">
                {/* Column 1: Functional Navigation (L1 Sidebar) */}
                <div className={`
                    fixed inset-y-0 left-0 z-[60] lg:static lg:z-0
                    w-[240px] lg:w-[150px] bg-[#0F172A] border-r border-white/5 flex flex-col h-full shrink-0 
                    transition-transform duration-300 ease-in-out lg:translate-x-0
                    ${mobileNavOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <div className="absolute left-0 top-0 w-[3px] h-full bg-blue-600 shadow-[2px_0_12px_rgba(37,99,235,0.3)]"></div>
                    <div className="h-[48px] flex items-center justify-between px-6 border-b border-white/5 bg-white/[0.02] shrink-0">
                        <span className="text-[10px] whitespace-nowrap font-black text-white/40 tracking-[0.2em] uppercase">核心功能</span>
                        <button onClick={() => setMobileNavOpen(false)} className="lg:hidden text-white/40 hover:text-white">
                            <Icon name="x" className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-4 pt-4 no-scrollbar">
                        {[
                            { id: 'home', label: '首页', icon: 'home', color: 'text-slate-600', active: 'bg-slate-500', shadow: 'shadow-slate-500/20' },
                            { id: 'data', label: '数据中心', icon: 'pie-chart', color: 'text-blue-400', active: 'bg-blue-600', shadow: 'shadow-blue-500/20' },
                            { id: 'ops', label: '运营中心', icon: 'zap', color: 'text-emerald-500', active: 'bg-blue-600', shadow: 'shadow-blue-500/20' },
                            { id: 'optimize', label: '优化中心', icon: 'wand-2', color: 'text-purple-400', active: 'bg-blue-600', shadow: 'shadow-blue-500/20' }
                        ].map(group => (
                            <div key={group.id} className="space-y-2">
                                {/* Group Header */}
                                <div 
                                    onClick={() => {
                                        setTopTab(group.id);
                                        const firstItem = menuConfig[group.id][0];
                                        if (firstItem) {
                                            setSidebarItem(firstItem.id);
                                            window.location.hash = `#/${firstItem.id}`;
                                            setMobileNavOpen(false);
                                        }
                                    }}
                                    className={`px-3 py-2 flex items-center gap-2 transition-all cursor-pointer rounded-lg ${topTab === group.id ? `bg-blue-600 text-white shadow-lg` : 'opacity-60 hover:opacity-100 hover:bg-white/5'}`}
                                >
                                    <Icon name={group.icon} className={`w-4 h-4 ${topTab === group.id ? 'text-white' : 'text-white/80'}`} />
                                    <span className={`text-[13px] font-black tracking-tight ${topTab === group.id ? 'text-white' : 'text-white/80'}`}>{group.label}</span>
                                </div>
                                
                                {/* Sub Items (Permanently Visible) */}
                                <div className="space-y-1.5 pl-4 mt-1">
                                    {menuConfig[group.id].map(item => {
                                        const isActive = sidebarItem === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    setTopTab(group.id);
                                                    setSidebarItem(item.id);
                                                    window.location.hash = `#/${item.id}`;
                                                    setMobileNavOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 rounded-lg text-[12px] font-black tracking-tight transition-all duration-200 flex items-center justify-between group/btn ${isActive ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)] scale-[1.02]' : 'text-slate-200 hover:text-white hover:bg-white/5'}`}
                                            >
                                                <span>{item.label}</span>
                                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                                            </button>
                                        );
                                    })}
                                </div>

                            </div>
                        ))}
                    </div>
                </div>

                {/* Column 2: Monitoring (Left-Middle Column) */}
                <div className={`
                    fixed inset-y-0 right-0 z-[60] lg:static lg:z-0
                    w-[300px] lg:w-[220px] transition-transform duration-300 ease-in-out bg-[#0F172A] border-r border-white/5
                    ${mobileLogsOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:translate-x-0'}
                `}>
                    <MonitoringSidebar mobile={mobileLogsOpen} onClose={() => setMobileLogsOpen(false)} />
                </div>

                {/* Column 3: Main View Area */}
                <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
                    <div className="hidden lg:flex h-[56px] border-b border-slate-100 items-center px-8 bg-white shrink-0">
                        <div className="flex items-center gap-3 truncate">
                            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0"></div>
                            <h2 className="text-[16px] font-black text-slate-900 tracking-tight uppercase truncate">
                                实时作战看板：{Object.values(menuConfig).flat().find(i => i.id === sidebarItem)?.label || '核心业务'}
                            </h2>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#F8FAFC] overflow-hidden relative">
                        <ErrorBoundary key={sidebarItem}>
                            <Suspense fallback={<div className="h-full flex items-center justify-center"><div className="w-6 h-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div></div>}>
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
                                    {sidebarItem === 'research' && <ProductResearchView />}
                                </div>
                                {toast && <Toast {...toast} onClose={() => showToast(null)} />}
                            </Suspense>
                        </ErrorBoundary>
                    </div>
                </div>

                {/* Backdrop for Mobile Nav */}
                {mobileNavOpen && (
                    <div 
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[55] lg:hidden animate-in fade-in duration-300"
                        onClick={() => setMobileNavOpen(false)}
                    />
                )}

                {/* Backdrop for Mobile Logs */}
                {mobileLogsOpen && (
                    <div 
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[55] lg:hidden animate-in fade-in duration-300"
                        onClick={() => setMobileLogsOpen(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default App;

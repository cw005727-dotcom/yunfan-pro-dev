import React, { useState, useEffect } from 'react'
import NavSidebar from './components/NavSidebar'
import TopMonitoringBar from './components/TopMonitoringBar'
import Icon from './components/Icon'
import { useAppContext } from './context/AppContext'
import LoginView from './views/LoginView'

// 直接 import 所有视图，不用 lazy
import XpAmazonView from './views/XpAmazonView'
import XpHolidayView from './views/XpHolidayView'
import NotificationsView from './views/NotificationsView'
import ShopReputationView from './views/ShopReputationView'
import StoreDataView from './views/StoreDataView'
import ProductPerformanceView from './views/ProductPerformanceView'
import LogisticsAlertsView from './views/LogisticsAlertsView'
import LogisticsIntlView from './views/LogisticsIntlView'
import DataUploadView from './views/DataUploadView'
import TodayTodoView from './views/TodayTodoView'
import XpTikTokShopView from './views/XpTikTokShopView'
import PersonalCenterView from './views/PersonalCenterView'
import AutoCenterView from './views/AutoCenterView'
import NewsView from './views/NewsView'
import BusinessIntroView from './views/BusinessIntroView'
import DataOverviewView from './views/DataOverviewView'
import MarketRadarView from './views/MarketRadarView'
import ProductResearchView from './views/ProductResearchView'
import SmartPriceCheckView from './views/SmartPriceCheckView'
import ProductMaintainView from './views/ProductMaintainView'
import ImageLabView from './views/ImageLabView'
import KeywordIntelView from './views/KeywordIntelView'
import AuthPrepareView from './views/AuthPrepareView'
const viewMap = {
  'xp-amazon-hot':       XpAmazonView,
  'xp-amazon-potential': XpAmazonView,
  'xp-amazon-new':       XpAmazonView,
  'xp-holiday':         XpHolidayView,
  notify:               NotificationsView,
  notifications:        NotificationsView,
  reputation:           ShopReputationView,
  'store-data':         StoreDataView,
  'product-report':     ProductPerformanceView,
  logistics:            LogisticsAlertsView,
  'logistics-cn':       LogisticsAlertsView,
  'logistics-intl':     LogisticsIntlView,
  'data-upload':        DataUploadView,
  'today-todo':         TodayTodoView,
  'xp-tiktok':          XpTikTokShopView,
  personal:             PersonalCenterView,
  'auto-center':        AutoCenterView,
  news:                 NewsView,
  intro:                BusinessIntroView,
  'data-overview':      DataOverviewView,
  radar:                MarketRadarView,
  research:             ProductResearchView,
  'price-check':        SmartPriceCheckView,
  maintain:             ProductMaintainView,
  image:                ImageLabView,
  keyword:              KeywordIntelView,
  auth:                 AuthPrepareView,
  prepare:              AuthPrepareView,
}

const routeLabels = {
  'xp-amazon-hot': '热销爆品', 'xp-amazon-potential': '潜力商品', 'xp-amazon-new': '最近上新',
  notify: '通知中心', notifications: '通知中心',
  reputation: '店铺声誉', 'store-data': '店铺数据', 'product-report': '商品性能表',
  logistics: '物流跟踪', 'auto-center': '自动化中心',
  news: '最新资讯', intro: '业务介绍', activity: '活动中心',
  'data-overview': '数据大盘', radar: '爆品雷达', research: '选品研究',
  'price-check': '智能核价', title: '标题优化', image: '视觉图生图', keyword: '关键词衍生',
  'data-upload': '数据上传', 'today-todo': '待办事项',
  'logistics-cn': '国内物流哨兵', 'logistics-intl': '国际订单链路',
  'xp-tiktok': 'TikTok爆品', personal: '个人中心',
}

export default function App() {
  const { toast, user, setUser } = useAppContext()
  const [sidebarItem, setSidebarItem] = useState('intro')
  const [topTab, setTopTab] = useState('home')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showMain, setShowMain] = useState(false)

  // 登录后淡入主界面
  useEffect(() => {
    if (user) setTimeout(() => setShowMain(true), 50)
    else setShowMain(false)
  }, [user])

  if (!user) {
    return <LoginView onLogin={(res) => setUser({ id: res.user_id, username: res.username, role: res.role })} />
  }

  const View = viewMap[sidebarItem]
  const handleTabChange = (t) => setTopTab(t)
  const handleItemChange = (id) => { setSidebarItem(id); setMobileOpen(false) }
  const label = routeLabels[sidebarItem] || '云帆跨境 Pro'

  return (
    <div className={`h-screen flex flex-col bg-white overflow-hidden transition-all duration-500 ${showMain ? 'opacity-100' : 'opacity-0'}`}
         style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <TopMonitoringBar />
      <div className="flex-1 flex overflow-hidden">
        <NavSidebar
          user={user}
          topTab={topTab}
          sidebarItem={sidebarItem}
          onTabChange={handleTabChange}
          onItemChange={handleItemChange}
          mobile={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
          <div className="h-[48px] flex items-center px-6 border-b border-slate-200 shrink-0 bg-white">
            <button onClick={() => setMobileOpen(true)}
              className="lg:hidden mr-3 p-1 rounded hover:bg-slate-100">
              <Icon name="menu" className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[13px] font-bold text-slate-700">{label}</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {View ? <View key={sidebarItem} defaultMode={sidebarItem === 'xp-amazon-hot' ? 'hot' : sidebarItem === 'xp-amazon-potential' ? 'potential' : 'new'} /> : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">该模块正在开发中...</div>
            )}
          </div>
        </div>
      </div>
      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}
      {toast && <div className="fixed bottom-6 right-6 z-50 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg text-sm">{toast.message}</div>}
    </div>
  )
}

import React, { useState, useEffect, lazy, Suspense, useMemo, useCallback } from 'react'
import NavSidebar from './components/NavSidebar'
import TopMonitoringBar from './components/TopMonitoringBar'
import Icon from './components/Icon'
import { useAppContext } from './context/AppContext'

// React.lazy 替代手动 import
const lazyMap = {
  'xp-amazon-hot':       lazy(() => import('./views/XpAmazonView')),
  'xp-amazon-potential': lazy(() => import('./views/XpAmazonView')),
  'xp-amazon-new':       lazy(() => import('./views/XpAmazonView')),
  'xp-holiday':         lazy(() => import('./views/XpHolidayView')),
  notify:               lazy(() => import('./views/NotificationsView')),
  notifications:        lazy(() => import('./views/NotificationsView')),
  reputation:           lazy(() => import('./views/ShopReputationView')),
  'store-data':         lazy(() => import('./views/StoreDataView')),
  'product-report':     lazy(() => import('./views/ProductPerformanceView')),
  logistics:            lazy(() => import('./views/LogisticsAlertsView')),
  'logistics-cn':       lazy(() => import('./views/LogisticsAlertsView')),
  'logistics-intl':     lazy(() => import('./views/LogisticsIntlView')),
  'data-upload':        lazy(() => import('./views/DataUploadView')),
  'today-todo':         lazy(() => import('./views/TodayTodoView')),
  'xp-tiktok':          lazy(() => import('./views/XpTikTokShopView')),
  personal:             lazy(() => import('./views/PersonalCenterView')),
  'auto-center':        lazy(() => import('./views/AutoCenterView')),
  news:                 lazy(() => import('./views/NewsView')),
  intro:                lazy(() => import('./views/BusinessIntroView')),
  'data-overview':      lazy(() => import('./views/DataOverviewView')),
  radar:                lazy(() => import('./views/MarketRadarView')),
  research:             lazy(() => import('./views/ProductResearchView')),
  'price-check':        lazy(() => import('./views/SmartPriceCheckView')),
  maintain:             lazy(() => import('./views/ProductMaintainView')),
  image:                lazy(() => import('./views/ImageLabView')),
  keyword:              lazy(() => import('./views/KeywordIntelView')),
  auth:                 lazy(() => import('./views/AuthPrepareView')),
  prepare:              lazy(() => import('./views/AuthPrepareView')),
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

function SkeletonView({ title }) {
  return (
    <div className="h-full flex flex-col">
      <div className="h-[48px] border-b border-slate-200 flex items-center px-6 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[13px] font-bold text-slate-700">{title}</span>
        </div>
      </div>
      <div className="flex-1 bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 text-sm">加载中...</div>
      </div>
    </div>
  )
}

export default function App() {
  const { toast } = useAppContext()
  const [sidebarItem, setSidebarItem] = useState('xp-amazon-hot')
  const [topTab, setTopTab] = useState('xuanpin')
  const [mobileOpen, setMobileOpen] = useState(false)
  // 从 navigation.js 里获取导航结构（避免重复定义）
  const [allItems] = useState(() => {
    const map = {}
    const { NAV_GROUPS } = window.__NAV_GROUPS__ || {}
    if (NAV_GROUPS) {
      for (const g of NAV_GROUPS) {
        if (g.items) for (const i of g.items) map[i.id] = g.id
      }
    }
    return map
  })

  useEffect(() => {
    const hash = window.location.hash.replace('#/', '')
    if (hash) {
      const { NAV_GROUPS } = window.__NAV_GROUPS__ || {}
      const allItems = {}
      if (NAV_GROUPS) {
        for (const g of NAV_GROUPS)
          if (g.items) for (const i of g.items) allItems[i.id] = g.id
      }
      if (allItems[hash]) {
        setTopTab(allItems[hash])
        setSidebarItem(hash)
      }
    }
  }, [])

  // 当前页面组件（React.lazy）
  const View = useMemo(() => lazyMap[sidebarItem], [sidebarItem])

  const handleTabChange = useCallback((tabId) => setTopTab(tabId), [])
  const handleItemChange = useCallback((itemId) => {
    setSidebarItem(prev => {
      if (prev === itemId) return prev  // 相同 item 不触发重渲染
      return itemId
    })
    window.location.hash = '#/' + itemId
    setMobileOpen(false)
  }, [])

  const label = routeLabels[sidebarItem] || '云帆跨境 Pro'

  return (
    <div
      className="h-screen flex flex-col bg-white overflow-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Top bar */}
      <TopMonitoringBar />

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <NavSidebar
          topTab={topTab}
          sidebarItem={sidebarItem}
          onTabChange={handleTabChange}
          onItemChange={handleItemChange}
          mobile={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
          {/* Page title bar */}
          <div className="h-[48px] flex items-center px-6 border-b border-slate-200 shrink-0 bg-white">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden mr-3 p-1 rounded hover:bg-slate-100"
            >
              <Icon name="menu" className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[13px] font-bold text-slate-700">{label}</span>
            </div>
          </div>

          {/* View content */}
          <div className="flex-1 overflow-auto">
            <Suspense fallback={<SkeletonView title={label} />}>
              {View ? <View key={sidebarItem} defaultMode={sidebarItem === 'xp-amazon-hot' ? 'hot' : sidebarItem === 'xp-amazon-potential' ? 'potential' : 'new'} /> : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-slate-400 text-sm">该模块正在开发中...</div>
                </div>
              )}
            </Suspense>
          </div>
        </div>
      </div>

      {/* Mobile sidebar backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg text-sm">
          {toast.message}
        </div>
      )}
    </div>
  )
}

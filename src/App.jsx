import React, { useState, useEffect } from 'react'
import NavSidebar from './components/NavSidebar'
import TopMonitoringBar from './components/TopMonitoringBar'
import Icon from './components/Icon'
import { useAppContext } from './context/AppContext'

// Lazy page views
const lazyMap = {
  'xp-amazon-hot':       () => import('./views/XpAmazonView'),
  'xp-amazon-potential': () => import('./views/XpAmazonView'),
  'xp-amazon-new':       () => import('./views/XpAmazonView'),
  'xp-holiday':         () => import('./views/XpHolidayView'),
  notify:               () => import('./views/NotificationsView'),
  notifications:        () => import('./views/NotificationsView'),
  reputation:           () => import('./views/ShopReputationView'),
  'store-data':         () => import('./views/StoreDataView'),
  'product-report':     () => import('./views/ProductPerformanceView'),
  collect:              () => import('./views/ProductCollectView'),
  'listing-opt':        () => import('./views/ListingOptimizeView'),
  'listing-pub':        () => import('./views/ListingPublishView'),
  logistics:            () => import('./views/LogisticsAlertsView'),
  'logistics-cn':       () => import('./views/LogisticsAlertsView'),
  'logistics-intl':     () => import('./views/LogisticsIntlView'),
  'data-upload':        () => import('./views/DataUploadView'),
  'today-todo':         () => import('./views/TodayTodoView'),
  'xp-tiktok':          () => import('./views/XpTikTokShopView'),
  personal:             () => import('./views/PersonalCenterView'),
  'auto-center':        () => import('./views/AutoCenterView'),
  news:                 () => import('./views/NewsView'),
  intro:                () => import('./views/BusinessIntroView'),
  activity:             () => import('./views/ActivityCenterView'),
  'data-overview':      () => import('./views/DataOverviewView'),
  radar:                () => import('./views/MarketRadarView'),
  research:             () => import('./views/ProductResearchView'),
  'price-check':        () => import('./views/SmartPriceCheckView'),
  maintain:             () => import('./views/ProductMaintainView'),
  optimize:             () => import('./views/OptimizeTitleView'),
  image:                () => import('./views/ImageLabView'),
  keyword:              () => import('./views/KeywordIntelView'),
  auth:                 () => import('./views/AuthPrepareView'),
  prepare:              () => import('./views/AuthPrepareView'),
}

const routeLabels = {
  'xp-amazon-hot': '热销爆品', 'xp-amazon-potential': '潜力商品', 'xp-amazon-new': '最近上新',
  notify: '通知中心', notifications: '通知中心',
  reputation: '店铺声誉', 'store-data': '店铺数据', 'product-report': '商品性能表',
  collect: '产品采集', 'listing-opt': '优化', 'listing-pub': '上架',
  logistics: '物流跟踪', 'auto-center': '自动化中心',
  news: '最新资讯', intro: '业务介绍', activity: '活动中心',
  'data-overview': '数据大盘', radar: '爆品雷达', research: '选品研究',
  'price-check': '智能核价', title: '标题优化', image: '视觉图生图', keyword: '关键词衍生',
  optimize: '标题优化', auth: '前期准备', prepare: '前期准备',
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
  const [DynamicView, setDynamicView] = useState(null)

  useEffect(() => {
    const hash = window.location.hash.replace('#/', '')
    if (hash) {
      const allItems = {}
      const NAV_GROUPS = [
        { id: 'prepare', items: [{ id: 'auth' }, { id: 'personal' }] },
        { id: 'notify', items: [{ id: 'notify' }] },
        { id: 'xuanpin', items: [{ id: 'xp-amazon-hot' }, { id: 'xp-amazon-potential' }, { id: 'xp-amazon-new' }] },
        { id: 'data', items: [{ id: 'reputation' }, { id: 'store-data' }, { id: 'product-report' }] },
        { id: 'logistics', items: [{ id: 'logistics-cn' }, { id: 'logistics-intl' }] },
        { id: 'ops', items: [{ id: 'data-upload' }, { id: 'today-todo' }, { id: 'collect' }, { id: 'listing-opt' }, { id: 'listing-pub' }] },
      ]
      for (const g of NAV_GROUPS) {
        if (g.items) for (const i of g.items) allItems[i.id] = g.id
      }
      if (allItems[hash]) {
        setTopTab(allItems[hash])
        setSidebarItem(hash)
      }
    }
  }, [])

  useEffect(() => {
    const loader = lazyMap[sidebarItem]
    if (loader) {
      loader().then(m => {
        const Comp = m.default
        setDynamicView(() => Comp)
      }).catch(() => {
        setDynamicView(() => () => (
          <div className="h-full flex items-center justify-center">
            <div className="text-slate-400 text-sm">该模块正在开发中...</div>
          </div>
        ))
      })
    } else {
      setDynamicView(null)
    }
  }, [sidebarItem])

  const handleTabChange = (tabId) => setTopTab(tabId)
  const handleItemChange = (itemId) => {
    setSidebarItem(itemId)
    window.location.hash = '#/' + itemId
    setMobileOpen(false)
  }

  const label = routeLabels[sidebarItem] || '云帆跨境 Pro'
  const View = DynamicView || (() => <SkeletonView title={label} />)

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
            <View />
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

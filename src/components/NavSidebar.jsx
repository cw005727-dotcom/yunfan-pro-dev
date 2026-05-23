import React, { useState } from 'react'
import Icon from './Icon'

const NAV_GROUPS = [
  { id: 'prepare',  label: '前期准备', icon: 'key',         color: '#7C3AED', light: '#F5F3FF', items: null },
  { id: 'notify',   label: '通知中心', icon: 'bell',        color: '#EC4899', light: '#FDF2F8', items: null },
  { id: 'xuanpin',  label: '选品中心', icon: 'search',      color: '#F59E0B', light: '#FFFBEB', items: [
    { id: 'xp-amazon',  label: '亚马逊选品',  icon: 'globe'        },
    { id: 'xp-meli',   label: '美客多选品',  icon: 'shopping-bag' },
    { id: 'xp-holiday',label: '节假日选品',  icon: 'calendar'     },
    { id: 'xp-tiktok', label: 'TikTok选品',  icon: 'video'        },
  ]},
  { id: 'data',     label: '数据中心', icon: 'pie-chart',   color: '#0EA5E9', light: '#F0F9FF', items: [
    { id: 'reputation',     label: '店铺声誉',   icon: 'shield'      },
    { id: 'store-data',     label: '店铺数据',   icon: 'bar-chart-2' },
    { id: 'product-report', label: '商品性能表', icon: 'package'     },
    { id: 'data-upload',    label: '数据上传',   icon: 'upload-cloud' },
  ]},
  { id: 'optimize', label: '优化中心', icon: 'wand-2',     color: '#10B981', light: '#ECFDF5', items: null },
  { id: 'ops',      label: '运营中心', icon: 'settings',   color: '#6366F1', light: '#EEF2FF', items: [
    { id: 'collect',     label: '采集',  icon: 'download-cloud' },
    { id: 'listing-opt',label: '优化',  icon: 'edit-3'        },
    { id: 'listing-pub',label: '上架',  icon: 'upload'        },
  ]},
  { id: 'logistics',label: '物流中心', icon: 'truck',      color: '#0EA5E9', light: '#F0F9FF', items: [
    { id: 'auto-center',    label: '自动化中心', icon: 'cpu' },
    { id: 'logistics-intl', label: '物流追踪',   icon: 'globe' },
  ]},

  { id: 'personal', label: '个人中心', icon: 'user',       color: '#8B5CF6', light: '#F5F3FF', items: null },
  { id: 'today-todo', label: '今日待办', icon: 'check-square', color: '#059669', light: '#ECFDF5', items: null },
]

const ICON_MAP = {
  key: 'key', bell: 'bell', search: 'search', 'pie-chart': 'pie-chart',
  'bar-chart-2': 'bar-chart-2', package: 'package', wand: 'wand-2',
  settings: 'settings', 'download-cloud': 'download-cloud', 'edit-3': 'edit-3',
  upload: 'upload', truck: 'truck', cpu: 'cpu', globe: 'globe',
  'shopping-bag': 'shopping-bag', calendar: 'calendar', shield: 'shield',
  video: 'video', 'upload-cloud': 'upload-cloud', user: 'user', 'check-square': 'check-square',
}

export default function NavSidebar({ topTab, sidebarItem, onTabChange, onItemChange, mobile, onClose }) {
  const [openGroup, setOpenGroup] = useState(null)

  const navigate = (group, itemId) => {
    onTabChange(group.id)
    onItemChange(itemId)
    window.location.hash = `#/${itemId}`
    if (mobile && onClose) onClose()
  }

  return (
    <div
      className={`
        flex flex-col h-full shrink-0 bg-white border-r border-slate-200/60
        ${mobile ? 'w-full max-w-[248px]' : 'w-[224px]'}
        relative
      `}
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Logo */}
      <div className="h-[52px] flex items-center gap-3 px-5 border-b border-slate-100 shrink-0 relative z-10">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-pink-500 via-amber-500 via-blue-500 via-emerald-500 to-indigo-500" />
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <Icon name="command" className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-[13px] font-black text-slate-900 leading-tight tracking-tight">云帆跨境</div>
          <div className="text-[10px] text-slate-400 font-semibold leading-tight">Pro Platform</div>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 no-scrollbar">
        {NAV_GROUPS.map(group => {
          const isActiveGroup = topTab === group.id
          const hasItems = group.items && group.items.length > 0
          const isGroupEmpty = !hasItems

          const activeItem = isGroupEmpty && sidebarItem === group.id

          return (
            <div key={group.id}>
              <button
                onClick={() => {
                  if (hasItems) {
                    setOpenGroup(openGroup === group.id ? null : group.id)
                  } else {
                    navigate(group, group.id)
                  }
                }}
                className="relative w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group overflow-hidden"
                style={{ background: activeItem ? group.light : 'transparent' }}
                onMouseEnter={e => { if (!activeItem) e.currentTarget.style.background = group.light + '99' }}
                onMouseLeave={e => { if (!activeItem) e.currentTarget.style.background = 'transparent' }}
              >
                {(activeItem || isActiveGroup) && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full transition-all duration-300" style={{ background: group.color }} />
                )}
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: group.light }}>
                  <Icon name={group.icon} size={15} color={group.color} />
                </div>
                <span className="flex-1 text-[13px] font-medium text-slate-700">{group.label}</span>
                {hasItems && (
                  <span className="text-slate-300 group-hover:text-slate-500 transition-colors">
                    <Icon name={openGroup === group.id ? 'chevron-up' : 'chevron-down'} size={14} />
                  </span>
                )}
              </button>

              {/* Sub items */}
              {hasItems && openGroup === group.id && (
                <div className="ml-3 mt-1 space-y-0.5">
                  {group.items.map(item => {
                    const isActive = sidebarItem === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(group, item.id)}
                        className="w-full flex items-center gap-2.5 pl-4 pr-3 py-2 rounded-lg text-left transition-all duration-150"
                        style={{ background: isActive ? '#FFFBEB' : 'transparent' }}
                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F8FAFC' }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                      >
                        {isActive && (
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#F59E0B' }} />
                        )}
                        <Icon name={item.icon} size={13} color={isActive ? '#D97706' : '#94A3B8'} />
                        <span className="text-[12px] font-medium" style={{ color: isActive ? '#D97706' : '#64748B' }}>
                          {item.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

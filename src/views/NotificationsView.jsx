import { useState, useEffect } from 'react'
import Icon from '../components/Icon.jsx'

const SITE_EMOJI = {
  MLM: '🇲🇽', MLB: '🇧🇷', MLA: '🇦🇷', MCO: '🇨🇴', MLC: '🇨🇱', MLU: '🇺🇾'
}

const SITE_NAME = {
  MLM: '墨西哥', MLB: '巴西', MLA: '阿根廷', MCO: '哥伦比亚', MLC: '智利', MLU: '乌拉圭'
}

const TYPE_CONFIG = {
  order:      { label: '新增订单', color: '#3B82F6', light: '#EFF6FF', bg: '#DBEAFE', dot: '🟦' },
  cancelled: { label: '订单取消', color: '#EF4444', light: '#FEF2F2', bg: '#FEE2E2', dot: '🟥' },
  logistics: { label: '物流状态', color: '#8B5CF6', light: '#F5F3FF', bg: '#EDE9FE', dot: '🟣' },
  message:   { label: '站内信',   color: '#10B981', light: '#ECFDF5', bg: '#D1FAE5', dot: '🟢' },
  reputation:{ label: '店铺声誉', color: '#F59E0B', light: '#FFFBEB', bg: '#FEF3C7', dot: '🟡' },
  violation: { label: '投诉违规', color: '#EF4444', light: '#FEF2F2', bg: '#FEE2E2', dot: '🔴' },
}

function NotificationItem({ item, showDot = true }) {
  const emoji = SITE_EMOJI[item.site] || '🌐'
  const siteName = SITE_NAME[item.site] || item.site
  return (
    <div className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition-colors cursor-pointer hover:bg-slate-50 ${item.read ? '' : 'font-bold'}`}>
      <span className="shrink-0" style={{ fontSize: '14px' }}>{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-slate-600 truncate">
          <span className="text-slate-700">{item.nickname}</span>
          <span className="text-slate-400"> · {siteName}</span>
          <span className="text-slate-300 mx-1">·</span>
          <span>{item.title}</span>
        </div>
      </div>
      {showDot && !item.read && (
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
      )}
      <span className="text-[11px] text-slate-400 shrink-0">{item.time}</span>
    </div>
  )
}

function NotificationSection({ type, items }) {
  const cfg = TYPE_CONFIG[type]
  const [expanded, setExpanded] = useState(false)
  if (!items.length) return null
  const latest = items.find(n => !n.read) || items[0]
  const remaining = items.length - 1

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        style={{ background: cfg.light }}
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '14px' }}>{cfg.dot}</span>
          <span className="text-[13px] font-bold text-slate-700">{cfg.label}</span>
          <span className="text-[11px] text-slate-400">{items.length} 条</span>
        </div>
        <div className="flex items-center gap-2">
          {remaining > 0 && (
            <span className="text-[11px] text-slate-400">还有 {remaining} 条</span>
          )}
          <Icon name={expanded ? 'chevron-up' : 'chevron-down'} className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Latest preview */}
      {latest && (
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-white px-1.5 py-0.5 rounded" style={{ background: cfg.color }}>最新</span>
          </div>
          <NotificationItem item={latest} showDot={false} />
        </div>
      )}

      {/* Expanded list */}
      {expanded && remaining > 0 && (
        <div className="divide-y divide-slate-100">
          {items.filter(n => n.id !== latest?.id).map(n => (
            <NotificationItem key={n.id} item={n} />
          ))}
        </div>
      )}
    </div>
  )
}

function RealtimeTab() {
  const [items, setItems] = useState([])

  useEffect(() => {
    fetch('/api/notifications/realtime')
      .then(async r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setItems)
      .catch(() => {})
    // 每5秒自动刷新
    const timer = setInterval(() => {
      fetch('/api/notifications/realtime')
        .then(r => r.json())
        .then(setItems)
        .catch(() => {})
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const getEmoji = (topic) => {
    if (topic.includes('order')) return '📦'
    if (topic.includes('ship')) return '🚚'
    if (topic.includes('question')) return '💬'
    if (topic.includes('claim')) return '⚠️'
    return '📢'
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-300">
        <Icon name="radio" className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-sm font-bold">暂无实时推送</p>
        <p className="text-xs mt-1">等待美客多 webhook 推送...</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.id} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-all">
          <span className="text-lg shrink-0">{getEmoji(item.topic)}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-bold text-slate-800 truncate">{item.content || item.topic}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-slate-400">{item.site || ''}</span>
              {item.order_id && <span className="text-[10px] text-slate-300">#{item.order_id}</span>}
              <span className="text-[10px] text-slate-300">{item.time}</span>
            </div>
          </div>
          {!item.read && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />}
        </div>
      ))}
    </div>
  )
}

export default function NotificationsView() {
  const [tab, setTab] = useState('realtime')
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (tab !== 'history') return
    fetch('/api/notifications')
      .then(async r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => {
        const flat = Object.entries(data).flatMap(([type, list]) =>
          (list || []).map(item => ({ ...item, type }))
        )
        setNotifications(flat)
      })
      .catch(() => {})
  }, [tab])

  const byType = {}
  for (const key of Object.keys(TYPE_CONFIG)) {
    byType[key] = notifications.filter(n => n.type === key)
  }

  const types = Object.keys(TYPE_CONFIG)
  const row1 = types.slice(0, 2)
  const row2 = types.slice(2, 4)
  const row3 = types.slice(4, 6)

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-5 shrink-0">
        <Icon name="bell" className="w-5 h-5 text-slate-600" />
        <h1 className="text-[18px] font-black text-slate-900 tracking-tight">通知中心</h1>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-1 mb-4 shrink-0 bg-slate-100 rounded-xl p-1">
        <button
          onClick={() => setTab('realtime')}
          className={`flex-1 py-2 text-[12px] font-black rounded-lg transition-all ${tab === 'realtime' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Icon name="zap" className="w-3.5 h-3.5 inline mr-1" />
          实时推送
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex-1 py-2 text-[12px] font-black rounded-lg transition-all ${tab === 'history' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Icon name="clock" className="w-3.5 h-3.5 inline mr-1" />
          历史数据
        </button>
      </div>

      {/* 内容 */}
      <div className="flex-1 min-h-0">
        {tab === 'realtime' ? (
          <RealtimeTab />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {row1.map(type => (
                <NotificationSection key={type} type={type} items={byType[type]} />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {row2.map(type => (
                <NotificationSection key={type} type={type} items={byType[type]} />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {row3.map(type => (
                <NotificationSection key={type} type={type} items={byType[type]} />
              ))}
              <div />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
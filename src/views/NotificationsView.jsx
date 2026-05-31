import { useState, useEffect } from 'react'
import Icon from '../components/Icon.jsx'

const TOPIC_MAP = {
  marketplace_orders: 'order', orders_v2: 'order',
  marketplace_shipments: 'logistics', shipments: 'logistics',
  marketplace_claims: 'claim', claims: 'claim',
  marketplace_messages: 'message', messages: 'message',
}

const TYPE_CONFIG = {
  order:      { label: '新增订单', color: '#3B82F6', light: '#EFF6FF', bg: '#DBEAFE', dot: '🟦' },
  logistics: { label: '物流状态', color: '#8B5CF6', light: '#F5F3FF', bg: '#EDE9FE', dot: '🟣' },
  claim:     { label: '索赔/投诉', color: '#EF4444', light: '#FEF2F2', bg: '#FEE2E2', dot: '🔴' },
  message:   { label: '站内信',   color: '#10B981', light: '#ECFDF5', bg: '#D1FAE5', dot: '🟢' },
  other:     { label: '其他通知', color: '#6B7280', light: '#F3F4F6', bg: '#E5E7EB', dot: '⚪' },
}

function NotificationItem({ item }) {
  return (
    <div className="flex items-center gap-2 py-2.5 px-4 rounded-xl transition-colors cursor-pointer hover:bg-slate-50">
      <div className="flex-1 min-w-0">
        <div className="text-[14px] text-slate-700 font-medium truncate">
          <span>{item.content || item.topic}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {item.site && <span className="text-[12px] text-slate-500 font-medium">{item.site}</span>}
          {item.order_id && <span className="text-[12px] text-slate-300">#{item.order_id}</span>}
          <span className="text-[12px] text-slate-400">{item.time}</span>
        </div>
      </div>
      {!item.read && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
    </div>
  )
}

function NotificationSection({ type, items }) {
  const cfg = TYPE_CONFIG[type]
  const [expanded, setExpanded] = useState(false)
  const defaultShow = 3
  const display = expanded ? items : items.slice(0, defaultShow)
  const remaining = items.length - defaultShow

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        style={{ background: cfg.light }}
        onClick={() => setExpanded(v => !v)}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '14px' }}>{cfg.dot}</span>
          <span className="text-[15px] font-black text-slate-800">{cfg.label}</span>
          <span className="text-[13px] text-slate-500 font-bold">{items.length} 条</span>
        </div>
        {!expanded && remaining > 0 && (
          <span className="text-[13px] text-slate-500 font-bold cursor-pointer">还有 {remaining} 条 ↓</span>
        )}
        {expanded && (
          <span className="text-[13px] text-slate-500 font-bold cursor-pointer">收起 ↑</span>
        )}
      </div>
      {!items.length && (
        <div className="px-4 py-8 text-center text-[14px] text-slate-400 font-bold">暂无{cfg.label}</div>
      )}
      {items.length > 0 && (
        <div className="divide-y divide-slate-100">
          {display.map(n => <NotificationItem key={n.id} item={n} />)}
        </div>
      )}
    </div>
  )
}

export default function NotificationsView({ user }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    const fetchData = () => {
      const url = '/api/notifications/realtime?owner=' + encodeURIComponent(user?.username || '')
      fetch(url).then(async r => { if (!r.ok) return; return r.json(); }).then(setItems).catch(() => {})
    }
    fetchData()
    const timer = setInterval(fetchData, 5000)
    return () => clearInterval(timer)
  }, [user])

  const byType = { order: [], logistics: [], claim: [], message: [], other: [] }
  for (const item of items) {
    const type = TOPIC_MAP[item.topic] || 'other'
    if (byType[type]) byType[type].push(item)
  }

  const types = Object.keys(TYPE_CONFIG)
  const rows = [types.slice(0, 2), types.slice(2, 4), types.slice(4)]

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center gap-2 mb-5 shrink-0">
        <Icon name="bell" className="w-5 h-5 text-slate-600" />
        <h1 className="text-[18px] font-black text-slate-900 tracking-tight">通知中心</h1>
        {items.length > 0 && <span className="text-[13px] text-slate-500 font-bold ml-auto">{items.length} 条</span>}
      </div>
      <div className="space-y-4">
        {rows.filter(r => r.length > 0).map((row, ri) => (
          <div key={ri} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {row.map(type => <NotificationSection key={type} type={type} items={byType[type]} />)}
          </div>
        ))}
      </div>
    </div>
  )
}export default function NotificationsView() {
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
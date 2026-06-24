import { useState, useEffect } from 'react'
import Icon from '../components/Icon.jsx'

const TOPIC_MAP = {
  marketplace_orders: '订单', orders_v2: '订单',
  marketplace_shipments: '物流', shipments: '物流',
  marketplace_claims: '索赔', claims: '索赔',
  marketplace_messages: '消息', messages: '消息',
}

const CARDS = [
  { key: '订单', dot: '🟦', label: '新增订单', color: '#3B82F6', light: '#EFF6FF' },
  { key: '物流', dot: '🟣', label: '物流状态', color: '#8B5CF6', light: '#F5F3FF' },
  { key: '索赔', dot: '🔴', label: '索赔/投诉', color: '#EF4444', light: '#FEF2F2' },
  { key: '消息', dot: '🟢', label: '站内信', color: '#10B981', light: '#ECFDF5' },
]

function Card({ cfg, items }) {
  const [expanded, setExpanded] = useState(false)
  const show = expanded ? items : items.slice(0, 3)
  const remain = items.length - 3

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer" style={{ background: cfg.light }} onClick={() => setExpanded(v => !v)}>
        <div className="flex items-center gap-2">
          <span>{cfg.dot}</span>
          <span className="text-[15px] font-black text-slate-800">{cfg.label}</span>
          <span className="text-[13px] text-slate-500 font-bold">{items.length}条</span>
        </div>
        {!expanded && remain > 0 && <span className="text-[13px] text-slate-500 font-bold">还有{remain}条↓</span>}
        {expanded && <span className="text-[13px] text-slate-500 font-bold">收起↑</span>}
      </div>
      {!items.length && <div className="px-4 py-8 text-center text-[14px] text-slate-400 font-bold">暂无{cfg.label}</div>}
      {items.length > 0 && <div className="divide-y divide-slate-100">
        {show.map(n => (
          <div key={n.id} className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50">
            <div className="flex-1 min-w-0">
              <div className="text-[14px] text-slate-700 font-medium truncate">{n.content || n.topic}</div>
              <div className="flex items-center gap-2 mt-0.5">
                {n.site && <span className="text-[12px] text-slate-500 font-medium">{n.site}</span>}
                {n.order_id && <span className="text-[12px] text-slate-300">#{n.order_id}</span>}
                <span className="text-[12px] text-slate-400">{n.time}</span>
              </div>
            </div>
            {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
          </div>
        ))}
      </div>}
    </div>
  )
}

export default function NotificationsView({ user }) {
  const [items, setItems] = useState([])
  useEffect(() => {
    const fn = () => {
      // 所有人按 owner 拉：管理员拿到自己的假通知，其他人拿自己的真实
      const ownerParam = user?.username ? `?owner=${encodeURIComponent(user.username)}` : ''
      fetch('/api/notifications/realtime' + ownerParam)
        .then(r => r.json()).then(setItems).catch(() => {})
    }
    fn()
    const t = setInterval(fn, 5000)
    return () => clearInterval(t)
  }, [user])

  const grouped = {}
  for (const n of items) {
    const k = TOPIC_MAP[n.topic] || '其他'
    if (!grouped[k]) grouped[k] = []
    grouped[k].push(n)
  }

  const rows = [CARDS.slice(0, 2), CARDS.slice(2, 4)]

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center gap-2 mb-5 shrink-0">
        <Icon name="bell" className="w-5 h-5 text-slate-600" />
        <h1 className="text-[18px] font-black text-slate-900 tracking-tight">通知中心</h1>
        {items.length > 0 && <span className="text-[13px] text-slate-500 font-bold ml-auto">{items.length}条</span>}
      </div>
      <div className="space-y-4">
        {rows.map((row, ri) => (
          <div key={ri} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {row.map(cfg => <Card key={cfg.key} cfg={cfg} items={grouped[cfg.key] || []} />)}
          </div>
        ))}
      </div>
    </div>
  )
}

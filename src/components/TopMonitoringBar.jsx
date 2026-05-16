import React, { useState, useEffect } from 'react'
import Icon from './Icon'

const TYPE_STYLES = {
  order:      { icon: 'shopping-cart', color: '#ec4899' },
  logistics:  { icon: 'truck',        color: '#10b981' },
  reputation: { icon: 'shield',       color: '#ef4444' },
  complaint:  { icon: 'alert-circle',  color: '#f97316' },
  violation:  { icon: 'x-circle',     color: '#dc2626' },
  message:    { icon: 'message-circle', color: '#3b82f6' },
  radar:      { icon: 'zap',          color: '#eab308' },
}

const DEFAULT_STYLE = { icon: 'zap', color: '#6b7280' }

function formatTime(date) {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function TopMonitoringBar() {
  const [events, setEvents] = useState([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem('yunfan_alerts')
        if (raw) {
          const d = JSON.parse(raw)
          setEvents(d.events || [])
          setConnected(d.connected !== false)
        }
      } catch (e) {}
    }
    load()
    const interval = setInterval(load, 6000)
    return () => clearInterval(interval)
  }, [])

  const visible = events.slice(0, 6)
  const style = TYPE_STYLES['order'] || DEFAULT_STYLE

  return (
    <div className="h-[52px] bg-white border-b border-slate-200/80 flex items-center px-5 gap-6 shrink-0">
      {/* 实时监控标签 */}
      <div className="flex items-center gap-2">
        <div className="dot-blue dot-pulse" />
        <span className="text-[12px] font-bold text-slate-500 tracking-wide">实时监控</span>
        {connected && (
          <>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] font-semibold text-emerald-500">● {events.length} 条事件</span>
          </>
        )}
      </div>

      {/* 分隔线 */}
      <div className="w-px h-5 bg-slate-200 shrink-0" />

      {/* 事件滚条 */}
      <div className="flex-1 flex items-center gap-4 overflow-hidden min-w-0">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          {visible.length > 0 ? visible.map(ev => {
            const s = TYPE_STYLES[ev.type] || DEFAULT_STYLE
            return (
              <div key={ev.id} className="flex items-center gap-1.5 shrink-0 group cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color, boxShadow: `0 0 6px ${s.color}` }} />
                <Icon name={s.icon} className="w-3.5 h-3.5 shrink-0" style={{ color: s.color }} />
                <span className="text-[11px] font-semibold text-slate-500 group-hover:text-slate-800 whitespace-nowrap transition-colors">{ev.label}</span>
                <span className="text-[10px] font-mono text-slate-300 whitespace-nowrap">{ev.time}</span>
              </div>
            )
          }) : (
            <span className="text-[11px] font-semibold text-slate-300">暂无事件</span>
          )}
        </div>
      </div>

      {/* 右侧标签 */}
      <div className="shrink-0 flex items-center gap-2 text-[11px] text-slate-400">
        <Icon name="zap" size={12} />
        <span>云帆 AI 守卫</span>
      </div>
    </div>
  )
}

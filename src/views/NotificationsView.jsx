import React from 'react'

export default function NotificationsView() {
  return (
    <div className="h-full flex flex-col">
      <div className="h-[52px] border-b border-slate-100 flex items-center px-6 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <h2 className="text-[15px] font-bold text-slate-800">NotificationsView</h2>
        </div>
      </div>
      <div className="flex-1 bg-[#F8FAFC] overflow-auto p-6">
        <div className="text-slate-400 text-sm">功能开发中...</div>
      </div>
    </div>
  )
}

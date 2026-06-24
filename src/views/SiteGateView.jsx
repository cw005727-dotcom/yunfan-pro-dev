import { useState, useEffect } from 'react'
import { Lock, Shield } from 'lucide-react'

const GATE_STORAGE_KEY = 'chensan_vip_gate_ok'

export default function SiteGateView() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password) {
      setError('请输入访问密码')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/site-gate/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (data.ok) {
        // 通过 → localStorage 标记 + 刷新页面（让 App.jsx 重新检查）
        localStorage.setItem(GATE_STORAGE_KEY, 'true')
        window.location.reload()
      } else {
        setError(data.message || '密码错误')
        setLoading(false)
      }
    } catch (e) {
      setError('网络错误，请重试')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #064e3b 100%)',
        transition: 'opacity 0.5s ease-out',
        opacity: mounted ? 1 : 0,
      }}
    >
      {/* 背景装饰 */}
      <div className="absolute top-0 left-0 w-[40%] h-[40%] rounded-full blur-[120px] opacity-20"
        style={{ background: '#10b981' }} />
      <div className="absolute bottom-0 right-0 w-[50%] h-[50%] rounded-full blur-[100px] opacity-10"
        style={{ background: '#34d399' }} />

      {/* 卡片 */}
      <div className="relative z-10 w-full max-w-md mx-4 p-8 rounded-2xl shadow-2xl"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              boxShadow: '0 10px 30px -5px rgba(16,185,129,0.5)',
            }}
          >
            <Shield className="text-white" size={28} strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="text-center text-white text-[22px] font-black tracking-tight mb-1">
          美客多开挂指南
        </h1>
        <p className="text-center text-emerald-200/70 text-[13px] font-medium mb-8">
          受邀访问 · 请输入站点密码
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-emerald-100/80 text-[11px] font-bold uppercase tracking-widest mb-2">
              访问密码
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300/60" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入 5 位数字密码"
                autoFocus
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-white text-[14px] font-medium outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg px-3 py-2 text-[12px] font-medium"
              style={{
                background: 'rgba(239,68,68,0.15)',
                color: '#fca5a5',
                border: '1px solid rgba(239,68,68,0.3)',
              }}
            >
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-white text-[14px] font-black tracking-wide transition-all"
            style={{
              background: loading
                ? 'rgba(16,185,129,0.5)'
                : 'linear-gradient(135deg, #10b981, #059669)',
              boxShadow: loading ? 'none' : '0 8px 20px -5px rgba(16,185,129,0.5)',
              cursor: loading ? 'wait' : 'pointer',
            }}
          >
            {loading ? '验证中...' : '进入'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-[10px] mt-6 font-medium">
          CLOUD INTEL · POWERED BY YUNFAN ENTERPRISE
        </p>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import Icon from '../components/Icon.jsx'
import { apiClient } from '../api/client'

export default function LoginView({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('YUNFAN2026')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // 动画入场效果
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMsg('')

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const payload = mode === 'login' 
        ? { username, password } 
        : { username, password, invite_code: inviteCode }

      const res = await apiClient.post(endpoint, payload)
      
      if (res && res.ok === true) {
        if (mode === 'register') {
          setMode('login')
          setSuccessMsg('注册成功，请登录')
        } else {
          onLogin(res)
        }
      } else {
        setError(res.message || '凭据验证失败')
      }
    } catch (err) {
      setError(err.message || '系统连接异常，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 调试模式：直接跳过登录（上线前删掉此段）
  if (window.location.hash === '#/debug') {
    setTimeout(() => onLogin && onLogin(), 100)
    return <div className="h-screen w-screen flex items-center justify-center text-slate-400">跳过登录...</div>
  }

  return (
    <div className="fixed inset-0 bg-white flex overflow-hidden font-sans select-none">
      
      {/* LEFT SIDE: EMERALD CORE (BRAND SOUL) - Desktop Only */}
      <div className="hidden lg:flex w-[400px] xl:w-[500px] bg-gradient-to-br from-emerald-900 to-slate-950 relative flex-col p-12 justify-between overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/5 rounded-full blur-[100px]" />
        
        {/* Logo Section */}
        <div className={`transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/50 mb-8 group cursor-pointer">
            <span className="text-white text-xl font-black tracking-tighter group-hover:scale-110 transition-transform">YF</span>
          </div>
          
          <h1 className="text-[36px] font-black text-white leading-tight tracking-tight mb-2">
            美客多工作台 PRO
          </h1>
          <p className="text-emerald-400/80 text-[18px] font-semibold tracking-wide">
            P2-1 多租户运营指挥中心
          </p>
        </div>

        {/* Feature Highlights */}
        <div className={`space-y-10 transition-all duration-1000 delay-300 transform ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
          {[
            { 
              title: '多平台选品探测', 
              desc: '告别内卷，拒绝跟卖', 
              icon: 'search' 
            },
            { 
              title: '全链路运营看板', 
              desc: '店铺声誉 · 利润分析 · 为运营而生', 
              icon: 'layout' 
            },
            { 
              title: '物流哨兵监控', 
              desc: '实时追踪发货率，告别延误烦恼', 
              icon: 'shield' 
            }
          ].map((item, i) => (
            <div key={i} className="flex gap-5 group cursor-default">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                <Icon name={item.icon} size={20} />
              </div>
              <div>
                <h3 className="text-white font-bold text-[15px] mb-1">{item.title}</h3>
                <p className="text-white/40 text-[12px] font-medium leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Technical Backing */}
        <div className={`transition-all duration-1000 delay-500 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="w-16 h-[1px] bg-white/20 mb-4" />
          <p className="text-[10px] font-black text-white/30 tracking-[2px] uppercase mb-1">
            Operation-First Architecture
          </p>
          <p className="text-[10px] font-black text-white/20 tracking-[1px] uppercase">
            Security v4.30 · Enterprise Multi-Tenant Ready
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: WHITE PREMIUM (ACTION CORE) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 bg-slate-50/30 relative">
        
        {/* Mobile Header (Visible on small screens) */}
        <div className="lg:hidden absolute top-12 text-center">
          <h1 className="text-2xl font-black text-slate-900">美客多工作台 PRO</h1>
          <p className="text-slate-500 text-xs mt-1">P2-1 多租户运营指挥中心</p>
        </div>

        <div className={`w-full max-w-[420px] transition-all duration-700 transform ${mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          
          <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
            
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-[28px] font-black text-slate-900 tracking-tight">
                {mode === 'login' ? '验证登录' : '账户注册'}
              </h2>
              <p className="text-slate-400 text-[14px] mt-2 font-medium">
                {mode === 'login' 
                  ? '欢迎回来，请验证您的凭据以进入系统' 
                  : '创建您的运营空间，开启高效跨境之旅'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email / Username */}
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-500 ml-1 uppercase tracking-wider">用户名</label>
                <div className="relative group">
                  <div className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                    <Icon name="mail" size={18} />
                  </div>
                  <input 
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-[14px] font-medium outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                    placeholder="用户名"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-500 ml-1 uppercase tracking-wider">认证密码</label>
                <div className="relative group">
                  <div className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                    <Icon name="lock" size={18} />
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 pl-12 pr-12 bg-slate-50/50 border border-slate-200 rounded-2xl text-[14px] font-medium outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-300 hover:text-slate-600 transition-colors"
                  >
                    <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} />
                  </button>
                </div>
              </div>

              {/* Invite Code (Register Mode) */}
              {mode === 'register' && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[12px] font-bold text-slate-500 ml-1 uppercase tracking-wider">注册邀请码</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                      <Icon name="key" size={18} />
                    </div>
                    <input 
                      type="text"
                      required
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-[14px] font-medium outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                      placeholder="系统限定邀请码"
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {successMsg && (
                <div className="bg-emerald-50 text-emerald-600 text-[13px] font-bold p-4 rounded-2xl flex items-center gap-3 border border-emerald-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {successMsg}
                </div>
              )}
              {error && (
                <div className="bg-rose-50 text-rose-500 text-[13px] font-bold p-4 rounded-2xl flex items-center gap-3 border border-rose-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={loading}
                className={`w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[15px] shadow-lg shadow-emerald-900/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Icon name={mode === 'login' ? 'log-in' : 'user-plus'} size={18} />
                    {mode === 'login' ? '授权进入工作台' : '立即创建账户'}
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-center text-[13px] font-semibold">
              <span className="text-slate-400">
                {mode === 'login' ? '没有账户标识？' : '已有账户？'}
              </span>
              <button 
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                {mode === 'login' ? '立即申请加入' : '返回身份验证'}
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-slate-400 text-[11px] font-medium uppercase tracking-widest">
            Cloud Intel · Powered by Yunfan Enterprise
          </p>
        </div>
      </div>
    </div>
  )
}

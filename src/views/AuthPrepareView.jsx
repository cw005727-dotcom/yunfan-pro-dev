import { useState } from 'react'
import Icon from '../components/Icon.jsx'

// 大卡片（店铺授权/云仓授权/回款准备）
function LargeCard({ accent, light, icon, label, desc, tip, ctaLabel, onCta }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 group">
      <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}40)` }} />
      <div className="p-5 flex flex-col" style={{ minHeight: '148px' }}>
        <div className="flex items-start mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: light }}>
            <Icon name={icon} className="w-5 h-5" style={{ color: accent }} />
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <h3 className="text-[14px] font-bold text-slate-900 tracking-tight">{label}</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{desc}</p>
          </div>
        </div>
        {tip && (
          <div className="rounded-xl px-3 py-2.5 mb-4 leading-relaxed" style={{ background: `${accent}12` }}>
            <p className="text-[11px] font-medium" style={{ color: accent }}>{tip}</p>
          </div>
        )}
        <div className="mb-2" />
        <button
          className="w-full py-2 rounded-xl text-[12px] font-bold transition-all duration-200 flex items-center justify-center gap-2"
          style={{ background: light, color: accent }}
          onMouseEnter={e => { e.currentTarget.style.background = accent; e.currentTarget.style.color = 'white' }}
          onMouseLeave={e => { e.currentTarget.style.background = light; e.currentTarget.style.color = accent }}
          onClick={onCta}
        >
          {ctaLabel}
          <Icon name="arrow-right" className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// 小卡片（售前/售中/售后）
function SmallCard({ accent, light, icon, label, desc }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
      <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}40)` }} />
      <div className="p-5 flex flex-col" style={{ minHeight: '148px' }}>
        <div className="flex items-start mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: light }}>
            <Icon name={icon} className="w-5 h-5" style={{ color: accent }} />
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <h3 className="text-[14px] font-bold text-slate-900 tracking-tight mb-1">{label}</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">{desc}</p>
          </div>
        </div>
        <div className="flex-1" />
      </div>
    </div>
  )
}

// 授权弹窗
function AuthModal({ onClose }) {
  const [shopId, setShopId] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConnect = async () => {
    if (!shopId) return
    if (!/^\d+$/.test(shopId)) { setError('店铺名称必须是纯数字（内部编号）'); return }
    setLoading(true)
    setError('')
    try {
      const resp = await fetch('/api/generate_auth_url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': 'YUNFAN_ADMIN_2026' },
        body: JSON.stringify({ shop_id: shopId })
      })
      const data = await resp.json()
      if (data.auth_url) {
        window.open(data.auth_url, '_blank')
        setShowConfirm(false)
        onClose()
      } else {
        setError('生成授权链接失败')
      }
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-500 flex items-center justify-center mb-6">
          <Icon name="key" className="w-6 h-6" />
        </div>
        <h4 className="text-xl font-black text-slate-900 tracking-tight mb-1">店铺授权</h4>
        <p className="text-[12px] text-slate-400 font-medium mb-6">输入店铺备注名称，用于系统内唯一标识</p>
        <div className="mb-6">
          <input
            type="text"
            value={shopId}
            onChange={e => setShopId(e.target.value.replace(/\D/g, ''))}
            placeholder="例如: 1024"
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black tracking-tight focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all"
          />
        </div>
        {error && <p className="text-[12px] text-red-500 font-medium mb-4">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-black text-[13px] transition-all"
          >
            取消
          </button>
          <button
            onClick={handleConnect}
            disabled={!shopId || loading}
            className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-xl font-black text-[13px] shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Icon name="loader" className="w-4 h-4 animate-spin" /> : null}
            确认授权
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AuthPrepareView() {
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <div className="h-full overflow-y-auto p-8" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-[20px] font-black text-slate-900 mb-1.5 tracking-tight">前期准备</h1>
        <p className="text-[13px] text-slate-400 font-medium">配置店铺授权，开启跨境销售第一步</p>
      </div>

      {/* 6张卡片 - 前期准备 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <LargeCard
          accent="#7C3AED"
          light="#F5F3FF"
          icon="key"
          label="店铺授权"
          desc="连接 Mercado Libre 卖家账号，授权 API 访问权限"
          tip="💡 请以数字来为店铺命名（如 1024）"
          ctaLabel="立即授权"
          onCta={() => setShowAuthModal(true)}
        />
        <LargeCard
          accent="#0EA5E9"
          light="#F0F9FF"
          icon="server"
          label="云仓授权"
          desc="绑定云仓服务，实现库存同步与物流对接"
          tip="⚠️ 云仓仅支持中文名称注册，建议使用真实名称，便于后期对接"
          ctaLabel="去配置"
          onCta={() => window.open('https://pdkyc.com', '_blank')}
        />
        <LargeCard
          accent="#10B981"
          light="#ECFDF5"
          icon="credit-card"
          label="回款准备"
          desc="配置回款账户与结算规则，保障资金安全"
          tip="💡 单站点超过 500 美金，每周五自动转账"
          ctaLabel="立即启用"
          onCta={() => window.open('https://us.pingpongx.com/entrance/signup?cb=true&inviteCode=Vf6Jre044', '_blank')}
        />
      </div>

      {/* 销售流程 - 3张卡片 */}
      <div className="mt-10">
        <h2 className="text-[20px] font-black text-slate-900 mb-5 tracking-tight">销售流程</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <SmallCard
            accent="#F59E0B"
            light="#FFFBEB"
            icon="book-open"
            label="售前准备"
            desc="了解跨境电商，熟悉美客多平台，掌握运营风险点"
          />
          <SmallCard
            accent="#6366F1"
            light="#EEF2FF"
            icon="trending-up"
            label="售中技巧"
            desc="选品，采集，上架，优化，订单处理等"
          />
          <SmallCard
            accent="#EF4444"
            light="#FEF2F2"
            icon="headphones"
            label="售后服务"
            desc="处理客户投诉，退换货等"
          />
        </div>
      </div>

      {/* 底部说明 */}
      <div className="mt-8 flex items-center gap-2 text-slate-400">
        <Icon name="info" className="w-4 h-4 shrink-0" />
        <span className="text-[12px] font-medium">授权过程安全加密，不会获取您的账户密码</span>
      </div>

      {/* 授权弹窗 */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}
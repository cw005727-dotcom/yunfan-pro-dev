import { useState } from 'react'
import Icon from '../components/Icon.jsx'

// 设计语言常量
const BRAND_GREEN = '#1EAD6F'
const BRAND_SOFT = '#1EAD6F15'

// V5 增强版大卡片 (紧凑活泼版)
function LargeCard({ accent, light, icon, label, desc, tip, ctaLabel, onCta, stepNumber }) {
  const darkColor = accent === '#10B981' ? '#064E3B' : accent === '#0EA5E9' ? '#0C4A6E' : '#78350F';
  
  return (
    <div 
      className="relative rounded-[28px] border-2 p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group flex flex-col justify-between"
      style={{ 
        backgroundColor: `${accent}08`, 
        borderColor: `${accent}20`,
        minHeight: '220px'
      }}
    >
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: accent }}>
            <Icon name={icon} className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-[17px] font-black tracking-tight leading-none" style={{ color: darkColor }}>{label}</h3>
            <p className="text-[11px] font-bold opacity-50 mt-1" style={{ color: darkColor }}>{desc}</p>
          </div>
        </div>

        {tip && (
          <div className="rounded-xl px-3 py-2.5 bg-white/40 border border-white/60 backdrop-blur-sm">
            <p className="text-[11px] font-bold leading-tight opacity-70" style={{ color: darkColor }}>
              {tip.replace('💡 ', '').replace('⚠️ ', '')}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={onCta}
        className="mt-4 w-full py-3 rounded-2xl text-[12px] font-black transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-sm"
        style={{ background: accent, color: 'white' }}
      >
        <span>{ctaLabel}</span>
        <Icon name="arrow-right" className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
      </button>
    </div>
  )
}

// V5 流程导向小卡片 (活力管道版)
function SmallCard({ accent, light, icon, label, items, index, badge }) {
  const darkColor = accent === '#10B981' ? '#064E3B' : accent === '#3B82F6' ? '#1E3A8A' : '#7F1D1D';
  
  return (
    <div 
      className="relative flex-1 rounded-[28px] border-2 p-6 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] group"
      style={{ 
        backgroundColor: `${accent}05`, 
        borderColor: `${accent}15`,
      }}
    >
       {/* 顶部状态标签 */}
       <div className="absolute top-0 right-6 transform -translate-y-1/2 z-20">
          <div className="px-3.5 py-1.5 rounded-full text-[10px] font-black text-white shadow-md tracking-wider" style={{ background: accent }}>
            {badge}
          </div>
       </div>

       <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-inner" style={{ background: `${accent}15` }}>
            <Icon name={icon} className="w-4.5 h-4.5" style={{ color: accent }} />
          </div>
          <span className="text-[15px] font-black tracking-tight" style={{ color: darkColor }}>{index}. {label}</span>
       </div>

       <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <div 
              key={i} 
              className="px-3 py-1.5 rounded-full border transition-all duration-300 group-hover:bg-white"
              style={{ 
                backgroundColor: `${accent}08`, 
                borderColor: `${accent}15`,
                color: darkColor
              }}
            >
              <span className="text-[10px] font-black opacity-80">{item}</span>
            </div>
          ))}
       </div>
       
       {/* 装饰线条 - 保持在容器内 */}
       <div className="absolute bottom-0 left-6 right-6 h-1 opacity-20 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
    </div>
  )
}

// 授权弹窗 (保持逻辑不变)
function AuthModal({ onClose, handleConnect, shopId, setShopId, loading, error }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-[40px] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Icon name="key" className="w-6 h-6" />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <Icon name="x" className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        <h4 className="text-xl font-black text-slate-900 tracking-tight mb-2">店铺授权</h4>
        <p className="text-[12px] text-slate-400 font-medium mb-6">输入美客多店铺内部数字编号（如 1024）</p>
        
        <div className="space-y-4 mb-6">
          <input
            type="text"
            autoFocus
            value={shopId}
            onChange={e => setShopId(e.target.value.replace(/\D/g, ''))}
            placeholder="例如: 1024"
            className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] text-xl font-black tracking-tight focus:outline-none focus:bg-white focus:border-emerald-500/20 transition-all"
          />
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-500 rounded-lg">
              <Icon name="alert-circle" className="w-3 h-3" />
              <span className="text-[11px] font-bold">{error}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl font-black text-[13px]">返回</button>
          <button
            onClick={handleConnect}
            disabled={!shopId || loading}
            className="flex-[2] py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-black text-[13px] transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Icon name="loader" className="w-4 h-4 animate-spin" /> : <Icon name="zap" className="w-4 h-4 text-emerald-400 fill-emerald-400" />}
            开启授权
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AuthPrepareView_V5() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [shopId, setShopId] = useState('')
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
        setShowAuthModal(false)
        setShopId('')
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
    <div className="h-full bg-white px-8 py-8 scrollbar-hide overflow-hidden">
      {/* 装饰 */}
      <div className="fixed top-0 right-0 w-[300px] h-[300px] bg-emerald-50/20 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2" />

      {/* 标题区 (紧凑) */}
      <div className="max-w-[1200px] mx-auto mb-8">
        <h1 className="text-[26px] font-black text-slate-900 mb-1 tracking-tighter">首页</h1>
        <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest">Setup Engine v5.1 / 跨境自动化引擎</p>
      </div>

      <div className="max-w-[1200px] mx-auto space-y-10">
        {/* 第一阶段：核心配置 */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LargeCard
              stepNumber="01"
              accent="#10B981"
              light="#10B98110"
              icon="key"
              label="店铺授权"
              desc="连接 Mercado Libre API 权限"
              tip="💡 请使用数字编号命名店铺"
              ctaLabel="立即授权"
              onCta={() => setShowAuthModal(true)}
            />
            <LargeCard
              stepNumber="02"
              accent="#0EA5E9"
              light="#0EA5E910"
              icon="server"
              label="云仓授权"
              desc="同步库存与物流对接"
              tip="⚠️ 建议使用云仓注册名称"
              ctaLabel="去配置"
              onCta={() => window.open('https://pdkyc.com', '_blank')}
            />
            <LargeCard
              stepNumber="03"
              accent="#F59E0B"
              light="#F59E0B10"
              icon="credit-card"
              label="回款准备"
              desc="绑定 PingPong 收款账户"
              tip="💡 满 500 美金每周五结算"
              ctaLabel="立即启用"
              onCta={() => window.open('https://us.pingpongx.com/entrance/signup?cb=true&inviteCode=Vf6Jre044', '_blank')}
            />
          </div>
        </section>

        {/* 第二阶段：销售流程 (活力管道版) */}
        <section>
           <h2 className="text-[13px] font-black text-slate-400 uppercase tracking-widest mb-8 px-1">销售流程全景图</h2>
           <div className="flex flex-col lg:flex-row gap-6 items-stretch">
              <SmallCard 
                index="01"
                badge="开始"
                accent="#10B981"
                light="#10B98110"
                icon="book-open"
                label="售前准备"
                items={["市场调研", "采集刊登", "策略制定"]}
              />
              <SmallCard 
                index="02"
                badge="核心"
                accent="#3B82F6"
                light="#3B82F610"
                icon="trending-up"
                label="售中运营"
                items={["智能调价", "订单处理", "库存监控"]}
              />
              <SmallCard 
                index="03"
                badge="完成"
                accent="#EF4444"
                light="#EF444410"
                icon="headphones"
                label="售后保障"
                items={["纠纷响应", "回款核销", "数据分析"]}
              />
           </div>
        </section>
        
        {/* 底部小提示 */}
        <div className="pt-4 flex items-center gap-2 text-slate-300">
          <Icon name="info" className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold tracking-wider uppercase">安全加密环境 • 自动化引擎已就绪</span>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          handleConnect={handleConnect}
          shopId={shopId}
          setShopId={setShopId}
          loading={loading}
          error={error}
        />
      )}
    </div>
  )
}

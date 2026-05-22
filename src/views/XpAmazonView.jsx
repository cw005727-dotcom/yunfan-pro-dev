import React, { useState, useEffect } from 'react'
import Icon from '../components/Icon'

const SITES = [
  { id: 'US', name: '🇺🇸 美国', currencySymbol: '$' },
  { id: 'MX', name: '🇲🇽 墨西哥', currencySymbol: 'MX$' },
  { id: 'BR', name: '🇧🇷 巴西', currencySymbol: 'R$' },
]

const PLACEHOLDER_IMG = 'https://placehold.co/200x200/e2e8f0/a0aec0?text=No+Image'

function RatingStars({ value }) {
  const v = Math.round(Number(value || 0) * 2) / 2
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(d => (
        <svg key={d} className="w-3 h-3" viewBox="0 0 20 20" fill={d <= v ? '#f59e0b' : '#d1d5db'}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-amber-600 font-medium ml-0.5">{Number(value || 0).toFixed(1)}</span>
    </div>
  )
}

function ProductCard({ product, site }) {
  const siteInfo = SITES.find(s => s.id === site)
  const currencySymbol = siteInfo?.currencySymbol || '$'
  const asin = product.asin || ''

  // DB 里的 thumbnail_url 已经是从 MCP 存的，走后端代理
  const rawUrl = product.thumbnail_url || product.thumbnail || ''
  const imgUrl = rawUrl.startsWith('http')
    ? '/api/proxy/image?url=' + encodeURIComponent(rawUrl)
    : PLACEHOLDER_IMG

  const amazonBase = site === 'US' ? 'amazon.com'
    : site === 'MX' ? 'amazon.com.mx'
    : site === 'BR' ? 'amazon.com.br'
    : 'amazon.com'

  const monthly_sales = product.monthly_sales || product.sales || 0
  const listed_days = product.listed_days || 0
  const potential_index = product.potential_index || 0
  const weight = product.weight || 0

  return (
    <a
      href={product.product_url || `https://www.${amazonBase}/dp/${asin}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-rose-300 transition-all duration-200"
    >
      <div className="relative bg-slate-50 aspect-square overflow-hidden">
        <img
          src={imgUrl}
          alt={product.title || ''}
          className="w-full h-full object-contain"
          onError={e => { e.target.src = PLACEHOLDER_IMG }}
        />
        {monthly_sales >= 1000 && (
          <div className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            🔥 {monthly_sales >= 10000 ? (monthly_sales / 1000).toFixed(0) + 'k+' : monthly_sales}
          </div>
        )}
        {listed_days > 0 && listed_days <= 30 && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            🆕 {listed_days}天
          </div>
        )}
        {potential_index > 0 && (
          <div className="absolute bottom-2 right-2 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
            ⭐ {potential_index.toFixed(1)}
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-slate-800/70 text-white text-xs px-1.5 py-0.5 rounded font-mono">
          {asin.slice(0, 8)}
        </div>
      </div>
      <div className="p-2.5 space-y-1.5 flex-1">
        <h3 className="text-xs font-medium text-slate-800 line-clamp-2 leading-snug min-h-[2.5rem]">{product.title || '—'}</h3>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-sm font-bold text-rose-600">{currencySymbol}{Number(product.price || 0).toFixed(2)}</span>
            <div className="text-xs text-slate-400">月销 {monthly_sales.toLocaleString()}</div>
          </div>
          <RatingStars value={product.rating} />
        </div>
        {listed_days > 0 && (
          <div className="text-xs text-slate-400">🕐 上架 {listed_days} 天</div>
        )}
        {weight > 0 && (
          <div className="text-xs text-slate-400">⚖️ {weight}g</div>
        )}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
          <span className="truncate max-w-[55%]">{product.brand || '—'}</span>
          <span>{Number(product.review_count || 0).toLocaleString()} 评</span>
        </div>
      </div>
    </a>
  )
}

const MODE_TABS = [
  { id: 'hot',       label: '🔥 热销爆品',  mode: 'hot',       sort: 'monthly_sales', order: 'desc',  emoji: '🔥' },
  { id: 'potential', label: '⭐ 潜力商品',  mode: 'potential', sort: 'potential_index', order: 'desc', emoji: '⭐' },
  { id: 'new',       label: '🆕 最近上新',  mode: 'new',       sort: 'listed_days', order: 'asc',    emoji: '🆕' },
]

export default function XpAmazonView() {
  const [site, setSite] = useState('US')
  const [activeTab, setActiveTab] = useState('hot')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [view, setView] = useState('grid')
  const [lastUpdate, setLastUpdate] = useState('')
  const [stats, setStats] = useState({})  // 各站点/模式数量

  // 切换站点时，重新加载数据
  useEffect(() => {
    loadStats()
    loadProducts(activeTab, site)
  }, [site])

  // 切换 tab 时重新加载
  useEffect(() => {
    if (site) loadProducts(activeTab, site)
  }, [activeTab])

  async function loadStats() {
    try {
      const res = await fetch('/api/amazon/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (e) {
      console.warn('[Amazon] stats error:', e)
    }
  }

  async function loadProducts(tabId, currentSite) {
    const tab = MODE_TABS.find(t => t.id === tabId)
    if (!tab) return
    setLoading(true)
    setError('')
    setProducts([])
    try {
      const res = await fetch('/api/amazon/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site: currentSite,
          mode: tab.mode,
          sort: tab.sort,
          order: tab.order,
          limit: 500,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.detail || '加载失败')
        return
      }
      const data = await res.json()
      setProducts(data.products || [])
      setLastUpdate(new Date().toLocaleTimeString())
    } catch (err) {
      setError('加载失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const currentTab = MODE_TABS.find(t => t.id === activeTab)
  const siteStats = stats[site] || {}

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* 站点选择 */}
          <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1">
            {SITES.map(s => (
              <button
                key={s.id}
                onClick={() => setSite(s.id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${site === s.id ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* 模式 Tab（三个子分类） */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            {MODE_TABS.map(tab => {
              const cnt = siteStats[tab.mode] || 0
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${activeTab === tab.id ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}
                >
                  {tab.emoji} {tab.label.replace(/^[^\s]+\s/, '')}
                  {cnt > 0 && (
                    <span className={`text-[10px] px-1 rounded ${activeTab === tab.id ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-500'}`}>
                      {cnt >= 1000 ? (cnt / 1000).toFixed(1) + 'k' : cnt}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* 拉取按钮（播种） */}
          <div className="ml-auto flex items-center gap-2">
            {lastUpdate && <span className="text-xs text-slate-400">更新于 {lastUpdate}</span>}
            <button
              onClick={() => loadProducts(activeTab, site)}
              disabled={loading}
              className="px-4 py-1.5 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  加载中
                </>
              ) : '🔄 刷新'}
            </button>
          </div>
        </div>
      </div>

      {/* 结果工具栏 */}
      {products.length > 0 && (
        <div className="flex-shrink-0 flex items-center justify-end gap-2 px-4 py-2 bg-white border-b border-slate-100">
          <span className="text-xs text-slate-500">共 {products.length} 条</span>
          <button
            onClick={() => {
              const siteLower = site.toLowerCase()
              const rows = products.map(p => ({
                '站点': site,
                'ASIN': p.asin || '',
                '商品名称': (p.title || '').replace(/"/g, '""'),
                '价格': p.price || 0,
                '月销量': p.monthly_sales || 0,
                '评分': p.rating || 0,
                '上架天数': p.listed_days || 0,
                '潜力指数': p.potential_index || 0,
                '大类': p.big_category || '',
                '细分类': p.sub_category || '',
                '重量(g)': p.weight || 0,
                'FBA费用': p.fba_fee || 0,
                '卖家国籍': p.seller_country || '',
                '品牌': p.brand || '',
                '亚马逊链接': p.product_url || `https://www.amazon.${siteLower}/dp/${p.asin}`,
              }))
              const headers = Object.keys(rows[0] || {})
              const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${r[h]}"`).join(','))].join('\n')
              const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `amazon_${activeTab}_${siteLower}_${new Date().toISOString().slice(0,10)}.csv`
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="px-2.5 py-1 bg-green-500 text-white rounded-md text-xs font-medium hover:bg-green-600 flex items-center gap-1"
          >
            📥 导出CSV
          </button>
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            {['grid', 'list'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${view === v ? 'bg-white shadow text-rose-600' : 'text-slate-500'}`}
              >
                {v === 'grid' ? '📊 卡片' : '📋 列表'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="mx-4 mt-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 空状态 */}
      {products.length === 0 && !loading && !error && (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400">
          <div className="text-4xl mb-4">🛒</div>
          <p className="font-medium text-slate-600 mb-1">亚马逊中心</p>
          <p className="text-sm">
            {Object.keys(stats).length === 0
              ? '暂无数据，请等待 cron 播种或手动拉取'
              : `当前 ${site} {currentTab?.label.replace(/^[^\s]+\s/, '')} 暂无数据`}
          </p>
        </div>
      )}

      {/* 加载中 */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500">正在加载数据库数据...</p>
          </div>
        </div>
      )}

      {/* 网格视图 */}
      {products.length > 0 && view === 'grid' && !loading && (
        <div className="flex-1 overflow-auto px-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {products.map(product => (
              <ProductCard key={product.asin} product={product} site={site} />
            ))}
          </div>
        </div>
      )}

      {/* 列表视图 */}
      {products.length > 0 && view === 'list' && !loading && (
        <div className="flex-1 overflow-auto px-4 py-4">
          <div className="space-y-2">
            {products.map(product => {
              const siteInfo = SITES.find(s => s.id === site)
              const currencySymbol = siteInfo?.currencySymbol || '$'
              const amazonBase = site === 'US' ? 'amazon.com'
                : site === 'MX' ? 'amazon.com.mx'
                : site === 'BR' ? 'amazon.com.br'
                : 'amazon.com'
              return (
                <a
                  key={product.asin}
                  href={product.product_url || `https://www.${amazonBase}/dp/${product.asin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:shadow hover:border-rose-300 transition-all"
                >
                  <img
                    src={(product.thumbnail_url || '').startsWith('http')
                      ? '/api/proxy/image?url=' + encodeURIComponent(product.thumbnail_url)
                      : PLACEHOLDER_IMG}
                    alt={product.title}
                    className="w-14 h-14 object-contain rounded-lg bg-slate-50 flex-shrink-0"
                    onError={e => { e.target.src = PLACEHOLDER_IMG }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{product.title || '—'}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>{product.brand || '—'}</span>
                      <span>{product.big_category || product.node_name || ''}</span>
                      <span className="font-mono">{product.asin}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-base font-bold text-rose-600">{currencySymbol}{Number(product.price || 0).toFixed(2)}</div>
                    <div className="text-xs text-slate-400">月销 {Number(product.monthly_sales || 0).toLocaleString()}</div>
                    {product.listed_days > 0 && <div className="text-xs text-slate-400">🕐 {product.listed_days}天</div>}
                    {product.potential_index > 0 && (
                      <div className="text-xs text-amber-500">⭐ {product.potential_index.toFixed(1)}</div>
                    )}
                    {product.weight > 0 && <div className="text-xs text-slate-400">⚖️ {product.weight}g</div>}
                    <RatingStars value={product.rating} />
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
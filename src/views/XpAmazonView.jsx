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

function ProductCard({ product, site, productMode }) {
  const siteInfo = SITES.find(s => s.id === site)
  const currencySymbol = siteInfo?.currencySymbol || '$'
  const asin = product.asin || ''
  const rawUrl = product.thumbnail || product.image_url || ''
  // 走后端代理（解决 Amazon CDN 对 datacenter IP 返回 400 的问题）
  // 只有 MCP 返回真实 URL 时才走代理；空值/纯文本（ASIN）直接用占位图
  const imgUrl = rawUrl.startsWith('http')
    ? '/api/proxy/image?url=' + encodeURIComponent(rawUrl)
    : PLACEHOLDER_IMG

  const amazonBase = site === 'US' ? 'amazon.com'
    : site === 'MX' ? 'amazon.com.mx'
    : site === 'BR' ? 'amazon.com.br'
    : 'amazon.com'

  return (
    <a
      href={`https://www.${amazonBase}/dp/${asin}`}
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
        {Number(product.sales || 0) >= 1000 && (
          <div className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            🔥 {Number(product.sales) >= 10000 ? (Number(product.sales) / 1000).toFixed(0) + 'k+' : product.sales}
          </div>
        )}
        {product.listed_days > 0 && product.listed_days <= 30 && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            🆕 {product.listed_days}天
          </div>
        )}
        {(product.potential_index || product.potential_score) > 0 && (
          <div className="absolute bottom-2 right-2 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
            ⭐ {Number(product.potential_index || product.potential_score).toFixed(1)}
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
            <div className="text-xs text-slate-400">月销 {Number(product.sales || 0).toLocaleString()}</div>
          </div>
          <RatingStars value={product.rating} />
        </div>
        {product.listed_days > 0 && (
          <div className="text-xs text-slate-400">🕐 上架 {product.listed_days} 天</div>
        )}
        {product.volume && (
          <div className="text-xs text-slate-400">
            📦 {product.volume} cm³
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
          <span className="truncate max-w-[55%]">{product.brand || '—'}</span>
          <span>{Number(product.reviews || 0).toLocaleString()} 评</span>
        </div>
      </div>
    </a>
  )
}

export default function XpAmazonView() {
  const [site, setSite] = useState('US')
  const [categories, setCategories] = useState([])       // 动态加载的类目树
  const [categoryTree, setCategoryTree] = useState([])   // 完整树结构（含子类）
  const [selectedCat, setSelectedCat] = useState('')     // 当前选中的大类 nodeId
  const [selectedSub, setSelectedSub] = useState('')     // 当前选中的子类 nodeId
  const [mode, setMode] = useState('potential')  // 潜力/新品/爆品三种模式，全部走 product_search（图片正常）
  const [minSales, setMinSales] = useState(0)
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(false)
  const [catLoading, setCatLoading] = useState(false)
  const [error, setError] = useState('')
  const [view, setView] = useState('grid')
  const [lastUpdate, setLastUpdate] = useState('')

  // 切换站点时，重新加载类目树
  useEffect(() => {
    loadCategories(site)
  }, [site])

  async function loadCategories(s) {
    setCatLoading(true)
    setCategories([])
    setCategoryTree([])
    setSelectedCat('')
    setSelectedSub('')
    setProducts([])
    setFiltered([])
    try {
      const res = await fetch(`/api/amazon/categories/${s}`)
      if (res.ok) {
        const tree = await res.json()
        setCategoryTree(tree)
        // 顶层类目作为大类选择
        const tops = tree.map(node => ({
          id: node.nodeId || node.id,
          name: node.类目名称 || node.name || node.id,
          emoji: node.emoji || '📦',
        }))
        setCategories(tops)
      } else {
        console.warn('[Amazon] categories load failed:', res.status)
      }
    } catch (e) {
      console.warn('[Amazon] categories error:', e)
    } finally {
      setCatLoading(false)
    }
  }

  const currentSubcats = React.useMemo(() => {
    if (!selectedCat || !categoryTree.length) return []
    const cat = categoryTree.find(c => (c.nodeId || c.id) === selectedCat)
    return cat?.子类 ? cat.子类.map(s => ({
      id: s.nodeId || s.id,
      name: s.类目名称 || s.name || s.id,
    })) : []
  }, [selectedCat, categoryTree])

  function filterProducts(all) {
    // 爆品/新品/潜力三模式均直接展示后端返回的100条，不做前端二次过滤
    // minSales 仅作为参考展示信息
    setFiltered(all || [])
  }

  // filterProducts driven by products setter

  const handlePull = async () => {
    if (!selectedCat) {
      setError('请先选择一个大类')
      return
    }
    setLoading(true)
    setError(null)
    setFiltered([])
    try {
      // priority: subclass > main category
      const nodeId = selectedSub || selectedCat
      console.log('[Amazon DEBUG] site:', site, 'nodeId:', nodeId, 'mode:', mode, 'selectedSub:', selectedSub, 'selectedCat:', selectedCat)
      const endpointMap = { potential: '/api/amazon/potential', hot: '/api/amazon/hot', new: '/api/amazon/new' }
      const endpoint = endpointMap[mode] || '/api/amazon/potential'
      const reqBody = {
        site,
        node_id: nodeId,
        page: 1,
      }
      // MX/BR/US：传 category 中文名作为 searchName（product_search 用类目名过滤，不是 nodeId）
      const catObj = categories.find(c => c.id === selectedCat)
      if (catObj?.name) {
        reqBody.search = catObj.name
      }
      // 爆品：前端按月销量降序；新品：前端按上架时间升序
      // 后端不做排序，前端拉取后排序
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody),
      })
      console.log('[Amazon DEBUG] response status:', res.status)
      const text = await res.text()
      console.log('[Amazon DEBUG] response body:', text.substring(0, 200))
      const data = JSON.parse(text)
      console.log('[Amazon] site:', site, 'nodeId:', nodeId, 'mode:', mode,
        'products:', data.products?.length, 'errors:', data.errors)
      if (!res.ok) {
        setError(data.detail || data.error || '加载失败')
        return
      }
      if (!data.products || data.products.length === 0) {
        setError('该类目暂无数据，请尝试其他子类或站点')
        return
      }
      // ── 前端排序：爆品按月销降序，新品按上架时间升序 ──
      let sorted = data.products || []
      if (mode === 'hot') {
        // 爆品：月销量越高越前
        sorted = sorted.slice().sort((a, b) => (b.sales || 0) - (a.sales || 0))
      } else if (mode === 'new') {
        // 新品：上架天数越少越前（越新）
        sorted = sorted.slice().sort((a, b) => (a.listed_days || 999) - (b.listed_days || 999))
      }
      // 潜力模式保持 MCP 原排序（sortby_potential_index=True）
      setProducts(sorted)
      filterProducts(sorted)
      setLastUpdate(new Date().toLocaleTimeString())
    } catch (err) {
      setError('加载失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCatChange = (catId) => {
    setSelectedCat(catId)
    setSelectedSub('')
  }

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

          {/* 大类 */}
          <select
            value={selectedCat}
            onChange={e => handleCatChange(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-rose-400 min-w-[140px]"
            disabled={catLoading}
          >
            <option value="">{catLoading ? '加载中...' : '— 选择大类 —'}</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
            ))}
          </select>

          {/* 子类 */}
          {selectedCat && currentSubcats.length > 0 && (
            <select
              value={selectedSub}
              onChange={e => setSelectedSub(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-rose-400 min-w-[160px]"
            >
              <option value="">全部子类</option>
              {currentSubcats.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}
          {selectedCat && currentSubcats.length > 0 && (
            <span className="text-xs text-slate-400">{currentSubcats.length} 个子类</span>
          )}





          {/* 模式切换 */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setMode('hot')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${mode === 'hot' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}
            >
              🔥 爆品
            </button>
            <button
              onClick={() => setMode('potential')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${mode === 'potential' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}
            >
              ⭐ 潜力
            </button>
            <button
              onClick={() => setMode('new')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${mode === 'new' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}
            >
              🆕 新品
            </button>
          </div>

          {/* 拉取按钮 */}
          <div className="ml-auto flex items-center gap-2">
            {lastUpdate && <span className="text-xs text-slate-400">更新于 {lastUpdate}</span>}
            <button
              onClick={handlePull}
              disabled={loading || !selectedCat}
              className="px-4 py-1.5 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  拉取中
                </>
              ) : '🔍 拉取'}
            </button>
          </div>
        </div>

        {/* 加载进度条 */}
        {loading && (
          <div className="mt-2.5 w-full bg-slate-100 rounded-full h-1">
            <div className="bg-rose-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        )}
      </div>

      {/* 结果工具栏 */}
      {filtered.length > 0 && (
        <div className="flex-shrink-0 flex items-center justify-end gap-2 px-4 py-2 bg-white border-b border-slate-100">
          <span className="text-xs text-slate-500">共 {filtered.length} 条</span>
          <button
            onClick={() => {
              const rows = filtered.map(p => ({
                '站点': site,
                'ASIN': p.asin || '',
                '商品名称': (p.title || '').replace(/"/g, '""'),
                '价格': p.price || 0,
                '月销量': p.sales || 0,
                '评分': p.rating || 0,
                '上架天数': p.listed_days || 0,
                '潜力指数': p.potential_index || 0,
                '大类': p.big_category || '',
                '细分类': p.sub_category || '',
                '重量(g)': p.weight || 0,
                'FBA费用': p.fba_fee || 0,
                '卖家国籍': p.seller_country || '',
                '亚马逊链接': `https://www.amazon.${siteLower}/dp/${p.asin}`,
              }))
              const headers = Object.keys(rows[0] || {})
              const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${r[h]}"`).join(','))].join('\n')
              const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `amazon_${mode}_${siteLower}_${new Date().toISOString().slice(0,10)}.csv`
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

      {/* 内容区 */}
      <div className="flex-1 overflow-auto px-4 py-4">
        {filtered.length === 0 && !loading && !error && (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
            <div className="text-4xl mb-4">🛒</div>
            <p className="font-medium text-slate-600 mb-1">亚马逊选品工具</p>
            <p className="text-sm">选择站点和类目，点击「拉取」获取数据</p>
          </div>
        )}

        {loading && (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500">正在从 SORFTime 获取数据...</p>
            </div>
          </div>
        )}

        {filtered.length > 0 && view === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filtered.map(product => (
              <ProductCard key={product.asin} product={product} site={site} productMode={mode} />
            ))}
          </div>
        )}

        {filtered.length > 0 && view === 'list' && (
          <div className="space-y-2">
            {filtered.map(product => {
              const siteInfo = SITES.find(s => s.id === site)
              const currencySymbol = siteInfo?.currencySymbol || '$'
              const amazonBase = site === 'US' ? 'amazon.com'
                : site === 'MX' ? 'amazon.com.mx'
                : site === 'BR' ? 'amazon.com.br'
                : 'amazon.com'
              return (
                <a
                  key={product.asin}
                  href={`https://www.${amazonBase}/dp/${product.asin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:shadow hover:border-rose-300 transition-all"
                >
                  <img
                    src={(product.thumbnail || '').startsWith('http')
                      ? '/api/proxy/image?url=' + encodeURIComponent(product.thumbnail)
                      : PLACEHOLDER_IMG}
                    alt={product.title}
                    className="w-14 h-14 object-contain rounded-lg bg-slate-50 flex-shrink-0"
                    onError={e => { e.target.src = PLACEHOLDER_IMG }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{product.title || '—'}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>{product.brand || '—'}</span>
                      <span>{product.category_name || ''}</span>
                      <span className="font-mono">{product.asin}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-base font-bold text-rose-600">{currencySymbol}{Number(product.price || 0).toFixed(2)}</div>
                    <div className="text-xs text-slate-400">月销 {Number(product.sales || 0).toLocaleString()}</div>
                    {product.listed_days > 0 && <div className="text-xs text-slate-400">🕐 {product.listed_days}天</div>}
                    {product.potential_index > 0 && (
                      <div className="text-xs text-amber-500">⭐ {product.potential_index}</div>
                    )}
                    <RatingStars value={product.rating} />
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
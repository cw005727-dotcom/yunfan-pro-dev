import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import Icon from '../components/Icon'
import * as XLSX from 'xlsx'

const SITES = [
  { id: 'US', name: '🇺🇸 美国站' },
  { id: 'MX', name: '🇲🇽 墨西哥' },
  { id: 'BR', name: '🇧🇷 巴西站' },
]

const MODES = [
  { id: 'hot',       name: '热销爆品', icon: 'flame',       color: '#F43F5E' },
  { id: 'potential', name: '潜力商品', icon: 'trending-up', color: '#F59E0B' },
  { id: 'new',       name: '最近上新', icon: 'sparkles',    color: '#10B981' },
]

const STYLES = `
  @keyframes shimmer {
    0% { transform: translateX(-150%) skewX(-25deg); }
    100% { transform: translateX(150%) skewX(-25deg); }
  }
  @keyframes radar-pulse {
    0% { transform: scale(0.6); opacity: 0; }
    30% { opacity: 0.6; }
    100% { transform: scale(2.8); opacity: 0; }
  }
  @keyframes breath {
    0%, 100% { opacity: 0.4; transform: scale(0.98); }
    50% { opacity: 1; transform: scale(1.02); }
  }
  .animate-breath { animation: breath 2s ease-in-out infinite; }
  .tag-shimmer { position: relative; overflow: hidden; }
  .tag-shimmer::after {
    content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: shimmer 2.5s infinite;
  }
  .radar-ring {
    position: absolute; border: 2px solid #10B981; border-radius: 50%;
    animation: radar-pulse 3s infinite cubic-bezier(0.23, 1, 0.32, 1);
  }
`;

const PLACEHOLDER_IMG = 'https://placehold.co/200x200/f1f5f9/cbd5e1?text=No+Image'

// Amazon 图片 fallback 模板
const AMAZON_IMG_TEMPLATE = (asin) => `https://images-na.ssl-images-amazon.com/images/I/${asin}._AC_UL600_SR600,400_.jpg`

const ProductCard = React.memo(({ item, site }) => {
  const asin = item.asin || ''
  const rawUrl = item.thumbnail_url || item.thumbnail || item.image_url || ''
  const [imgSrc, setImgSrc] = useState(() => rawUrl.startsWith('http') ? rawUrl : '')

  const amazonBase = site === 'US' ? 'amazon.com'
    : site === 'MX' ? 'amazon.com.mx'
    : 'amazon.com.br'

  const handleImgError = useCallback(() => {
    // 逐级 fallback: 原图 → 模板URL → placeholder
    if (imgSrc !== rawUrl) return // 已经 fallback 过了
    const templateUrl = AMAZON_IMG_TEMPLATE(asin)
    if (templateUrl) setImgSrc(templateUrl)
    else setImgSrc(PLACEHOLDER_IMG)
  }, [imgSrc, rawUrl, asin])

  return (
    <div className="group relative bg-white rounded-xl border border-slate-100 hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden">
      <div className="relative pt-[100%] bg-slate-50/50 overflow-hidden cursor-pointer" onClick={() => window.open(`https://www.${amazonBase}/dp/${asin}`, '_blank')}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
            onError={handleImgError}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-200">
            <Icon name="image" size={32} />
          </div>
        )}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
          {Number(item.monthly_sales || 0) >= 1000 && (
            <div className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[9px] font-black flex items-center gap-0.5 shadow-sm tag-shimmer">
              <Icon name="flame" size={8} />
              <span>{item.monthly_sales}</span>
            </div>
          )}
        </div>
      </div>
      <div className="p-2.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-bold text-slate-400 truncate max-w-[70%]">{item.brand || 'No Brand'}</span>
            <div className="flex items-center gap-0.5 text-amber-500">
              <Icon name="star" size={8} className="fill-current" />
              <span className="text-[9px] font-bold">{item.rating || '0.0'}</span>
            </div>
          </div>
          <h3 className="text-[11px] font-bold text-slate-700 leading-tight line-clamp-2 mb-2" title={item.title}>{item.title}</h3>
          <div className="text-[14px] font-black text-rose-500 mb-1">
             {site === 'US' ? '$' : site === 'MX' ? 'MX$' : 'R$'}{item.price || '0.00'}
          </div>
        </div>
        <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 border-t border-slate-50 pt-1.5">
           <span>{item.review_count || 0} 评 {item.weight > 0 ? `· ${item.weight}kg` : ''}</span>
           <span>{item.launch_date ? `上架 ${item.launch_date}` : `天数 ${item.listed_days || 0}`}</span>
        </div>
      </div>
    </div>
  )
})

export default function XpAmazonView_V5({ defaultMode }) {
  const [site, setSite] = useState('US')
  const [topCategories, setTopCategories] = useState([])
  const [updatedAt, setUpdatedAt] = useState(null)  // 一级类目列表
  const [subCategories, setSubCategories] = useState([])    // 子类列表
  const [selectedCat, setSelectedCat] = useState('')
  const [selectedSub, setSelectedSub] = useState('')
  const mode = defaultMode || 'hot'
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [catLoading, setCatLoading] = useState(false)
  const [error, setError] = useState('')
  const [visibleCount, setVisibleCount] = useState(40)
  const abortRef = useRef(null)
  const debounceRef = useRef(null)

  // 加载类目树（站点切换时自动拉）
  useEffect(() => {
    setCatLoading(true)
    setSelectedCat('')
    setSelectedSub('')
    setSubCategories([])
    fetch(`/api/amazon/categories/${site}`)
      .then(r => r.json())
      .then(tree => {
        // 只保存一级类目
        const tops = tree.map(top => ({
          id: top.nodeId || top.id,
          name: top.类目名称 || top.name || top.id,
          emoji: top.emoji || '📦',
          children: (top.子类 || []).map(sub => ({
            id: sub.nodeId || sub.id,
            name: sub.类目名称 || sub.name || sub.id,
            emoji: sub.emoji || '📦',
          }))
        }))
        setTopCategories(tops)
        setCatLoading(false)
      })
      .catch(() => setCatLoading(false))
  }, [site])

  // 选中一级类目时展开子类
  const handleTopCatChange = useCallback((topId) => {
    setSelectedCat(topId)
    setSelectedSub('')
    const top = topCategories.find(c => c.id === topId)
    setSubCategories(top?.children || [])
  }, [topCategories])

  // 选类目：先 seed 拉取写入数据库，再从数据库读取
  const fetchByCategory = useCallback(async (catName, catNodeId) => {
    if (!catName && !catNodeId) return
    console.log('[fetchByCategory] start', catName, catNodeId, site, mode)
    setLoading(true)
    setError('')
    setProducts([])
    try {
      // 第一步：seed 拉取并写入数据库
      console.log('[fetchByCategory] seeding...')
      const seedRes = await fetch('/api/amazon/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site, mode, category_name: catName, pages: 5 }),
      })
      if (!seedRes.ok) {
        const err = await seedRes.json().catch(() => ({ detail: '拉取失败' }))
        setError(err.detail || '拉取失败')
        return
      }
      const seedData = await seedRes.json()
      console.log('[fetchByCategory] seed done:', seedData.products_saved, '条')

      // 第二步：从数据库读取，按类目名筛选
      console.log('[fetchByCategory] loading from db...')
      const listRes = await fetch('/api/amazon/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site, mode, limit: 500, search: catName }),
      })
      if (!listRes.ok) {
        const err = await listRes.json().catch(() => ({ detail: '读取失败' }))
        setError(err.detail || '读取失败')
        return
      }
      const listData = await listRes.json()
      console.log('[fetchByCategory] db data:', listData.total, '条')
      setProducts(listData.products || [])
      setUpdatedAt(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }))
    } catch (err) {
      console.error('[fetchByCategory] error:', err)
      setError('操作失败: ' + err.message)
    } finally {
      setLoading(false)
      console.log('[fetchByCategory] done')
    }
  }, [site, mode])

  // 请求取消 + 防抖（只加载数据库数据，类目选择走 Sorftime 拉取）
  const loadFromDb = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)
    try {
      const body = { site, mode, limit: 500 }
      const res = await fetch('/api/amazon/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.detail || '加载失败')
        return
      }
      const data = await res.json()
      setProducts(data.products || [])
      setUpdatedAt(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }))
    } catch (err) {
      if (err.name !== 'AbortError') setError('加载失败: ' + err.message)
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [site, mode])

  useEffect(() => {
    // 仅在 site/mode 变化时从数据库加载，类目选择走 Sorftime 拉取
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(loadFromDb, 300)
    setVisibleCount(40)
    return () => {
      if (abortRef.current) abortRef.current.abort()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site, mode])

  const scrollRef = useRef(null)
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || visibleCount >= (products.length || 0)) return
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 400) {
      setVisibleCount(prev => Math.min(prev + 40, products.length))
    }
  }, [visibleCount, products.length])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const handleExport = () => {
    if (products.length === 0) return
    const rows = products.map(p => ({
      '站点': site,
      'ASIN': p.asin,
      '标题': p.title,
      '品牌': p.brand,
      '价格': p.price,
      '月销量': p.monthly_sales || 0,
      '评分': p.rating,
      '评论数': p.review_count || 0,
      '上架天数': p.listed_days || 0,
      '潜力指数': p.potential_index || 0,
      '链接': `https://www.amazon.${site.toLowerCase() === 'us' ? 'com' : site.toLowerCase() === 'mx' ? 'com.mx' : 'br'}/dp/${p.asin}`
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Amazon_V5_Data')
    XLSX.writeFile(wb, `Amazon_${site}_${mode}_${new Date().toISOString().slice(0,10)}.xlsx`)
  }

  return (
    <div className="h-full bg-white flex flex-col overflow-hidden font-sans select-none">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      
      <div className="bg-gradient-to-b from-emerald-100/30 to-white border-b border-slate-200 border-t-[3px] border-t-emerald-600 px-5 py-4 shrink-0 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        
        {/* Row 1: 站点 + 模式 + 类目 */}
        <div className="flex items-center gap-3 mb-2 flex-wrap">
           <div className="w-[100px] shrink-0">
              <h1 className="text-[14px] font-black text-emerald-800 tracking-tight">亚马逊实时探测</h1>
           </div>
           
           <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-inner">
             {SITES.map(s => (
               <button key={s.id} onClick={() => setSite(s.id)}
                 className={`px-2.5 py-1 rounded-md text-[11px] font-black transition-all duration-300 ${
                   site === s.id
                     ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md scale-[1.02]'
                     : 'text-slate-500 hover:text-emerald-700 hover:bg-white/50'
                 }`}
               >{s.name}</button>
             ))}
           </div>

           {/* 模式由 tab 切换控制，不重复展示 */}

           {/* 一级类目选择 */}
           <div className="flex-1 min-w-0 max-w-[200px]">
             <select
               value={selectedCat || ''}
               onChange={e => {
                 const val = e.target.value
                 if (!val) {
                   setSelectedCat('')
                   setSelectedSub('')
                   setSubCategories([])
                   return
                 }
                 handleTopCatChange(val)
                 // 选大类后从数据库筛选
                 const catName = topCategories.find(c => c.id === val)?.name || ''
                 fetchByCategory(catName, val)
               }}
               className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
             >
               <option value="">{catLoading ? '加载类目...' : '大类（不限）'}</option>
               {topCategories.map(cat => (
                 <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
               ))}
             </select>
           </div>
           {/* 子类选择 */}
           <div className="min-w-0 max-w-[200px]">
             <select
               value={selectedSub || ''}
               onChange={e => {
                 const val = e.target.value
                 setSelectedSub(val || '')
                 if (val) {
                   const catName = subCategories.find(c => c.id === val)?.name || ''
                   fetchByCategory(catName, val)
                 }
               }}
               disabled={!selectedCat || subCategories.length === 0}
               className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-40 disabled:cursor-not-allowed"
             >
               <option value="">子类（不限）</option>
               {subCategories.map(cat => (
                 <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
               ))}
             </select>
           </div>
        </div>

        {/* Row 2: 状态栏 + 更新信息 + 导出 */}
        <div className="flex items-center gap-4 mt-1">
           <span className="text-[10px] font-black text-emerald-600 shrink-0">
             {products.length > 0 ? `${products.length} 条商品` : loading ? '加载中...' : '就绪'}
           </span>
           {updatedAt && (
             <span className="text-[9px] font-bold text-slate-300">
               更新于 {updatedAt}
             </span>
           )}
           {products.length > 0 && (
             <button onClick={handleExport} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm flex items-center gap-1">
               <Icon name="download" size={10} /> 导出 Excel
             </button>
           )}
           {loading ? (
             <span className="ml-auto text-[10px] font-black text-emerald-500 animate-pulse">正在更新...</span>
           ) : (
             <button onClick={loadFromDb} className="ml-auto px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black transition-all shadow-sm flex items-center gap-1">
               <Icon name="refresh-cw" size={10} /> 更新
             </button>
           )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-slate-50/30 p-4">
        {error && (
          <div className="mb-4 p-3 bg-white border border-rose-100 rounded-xl text-rose-500 text-[11px] font-bold flex items-center gap-2 shadow-sm animate-pulse">
            <Icon name="alert-circle" size={14} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-[300px]">
             <div className="relative w-16 h-16 mb-6">
                <div className="radar-ring" style={{ animationDelay: '0s' }} />
                <div className="radar-ring" style={{ animationDelay: '1s' }} />
                <div className="absolute inset-0 bg-emerald-500 rounded-full flex items-center justify-center z-10 shadow-lg">
                   <Icon name="radar" size={24} className="text-white animate-pulse" />
                </div>
             </div>
             <p className="text-[12px] font-black text-emerald-600 tracking-[0.3em] uppercase animate-breath">深度探测扫描中...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {products.slice(0, visibleCount).map((item) => (
              <ProductCard key={item.asin || item.id} item={item} site={site} />
            ))}
            {visibleCount < products.length && (
              <div className="col-span-full flex justify-center py-6">
                <button
                  onClick={() => setVisibleCount(prev => Math.min(prev + 40, products.length))}
                  className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm"
                >
                  加载更多 ({products.length - visibleCount} 条)
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] opacity-10">
             <Icon name="search" size={48} className="mb-2" />
             <p className="text-[14px] font-black tracking-widest uppercase">Awaiting Signal</p>
          </div>
        )}
      </div>
    </div>
  )
}

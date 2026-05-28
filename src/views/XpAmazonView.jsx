import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import Icon from '../components/Icon'
import * as XLSX from 'xlsx'

const SITES = [
  { id: 'US', name: '🇺🇸 美国站' },
  { id: 'MX', name: '🇲🇽 墨西哥' },
  { id: 'BR', name: '🇧🇷 巴西站' },
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

const ProductCard = React.memo(({ item, site, currency }) => {
  const asin = item.asin || ''
  // Sorftime 返回的字段：主图, 标题, 品牌, 价格, 月销量, 星级, 评论数
  const imgUrl = item.thumbnail_url || item.thumbnail || item.主图 || item.image_url || ''

  const amazonBase = site === 'US' ? 'amazon.com'
    : site === 'MX' ? 'amazon.com.mx'
    : 'amazon.com.br'

  return (
    <div className="group relative bg-white rounded-xl border border-slate-100 hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden">
      <div className="relative pt-[100%] bg-slate-50/50 overflow-hidden cursor-pointer" onClick={() => window.open(`https://www.${amazonBase}/dp/${asin}`, '_blank')}>
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={item.title || item.标题}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
            onError={e => { e.target.src = PLACEHOLDER_IMG }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-200">
            <Icon name="image" size={32} />
          </div>
        )}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
          {Number(item.monthly_sales || item.月销量 || 0) >= 1000 && (
            <div className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[9px] font-black flex items-center gap-0.5 shadow-sm tag-shimmer">
              <Icon name="flame" size={8} />
              <span>{item.monthly_sales || item.月销量}</span>
            </div>
          )}
        </div>
      </div>
      <div className="p-2.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-bold text-slate-400 truncate max-w-[70%]">{item.brand || item.品牌 || 'No Brand'}</span>
            <div className="flex items-center gap-0.5 text-amber-500">
              <Icon name="star" size={8} className="fill-current" />
              <span className="text-[9px] font-bold">{item.rating || item.星级 || '0.0'}</span>
            </div>
          </div>
          <h3 className="text-[11px] font-bold text-slate-700 leading-tight line-clamp-2 mb-2" title={item.title || item.标题}>{item.title || item.标题}</h3>
          <div className="text-[14px] font-black text-rose-500 mb-1">
            {currency}{item.price || item.价格 || '0.00'}
          </div>
        </div>
        <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 border-t border-slate-50 pt-1.5">
           <span>{item.review_count || item.评论数 || 0} 评</span>
           <span>上架 {item.listed_days || item.上架天数 || 0}天</span>
        </div>
      </div>
    </div>
  )
})

export default function XpAmazonView_V5({ defaultMode }) {
  const [site, setSite] = useState('US')
  const [categories, setCategories] = useState([])
  const [categoryTree, setCategoryTree] = useState([])
  const [selectedCat, setSelectedCat] = useState('')
  const [selectedSub, setSelectedSub] = useState('')
  const mode = defaultMode || 'hot'
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [catLoading, setCatLoading] = useState(false)
  const [error, setError] = useState('')
  const [visibleCount, setVisibleCount] = useState(40)
  const scrollRef = useRef(null)

  // 新品模式：直接调 API
  useEffect(() => {
    if (mode === 'new') {
      setLoading(true)
      setProducts([])
      fetch('/api/amazon/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site, page: 1 })
      }).then(r => r.json()).then(d => {
        setProducts(d.products || [])
        setLoading(false)
      }).catch(() => setLoading(false))
    }
  }, [mode, site])

  const [exporting, setExporting] = useState(false)
  const currencyMap = { US: '$', MX: 'MX$', BR: 'R$' }

  // 加载类目树
  useEffect(() => {
    setCatLoading(true)
    setSelectedCat('')
    setSelectedSub('')
    fetch(`/api/amazon/categories/${site}`)
      .then(r => r.json())
      .then(tree => {
        setCategoryTree(tree)
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
        setCategories(tops)
        setCatLoading(false)
      })
      .catch(() => setCatLoading(false))
  }, [site])

  // 选类目后自动拉取 Sorftime 数据
  const handlePull = useCallback(async (nodeId, catName) => {
    if (!nodeId) return
    setLoading(true)
    setError('')
    setProducts([])
    try {
      const endpointMap = { hot: '/api/amazon/hot', new: '/api/amazon/new' }
      const endpoint = endpointMap[mode] || '/api/amazon/hot'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site, node_id: nodeId, search: catName || nodeId, page: 1 }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: '拉取失败' }))
        setError(errData.detail || errData.error || '拉取失败')
        return
      }
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : data.products || [])
    } catch (err) {
      setError('拉取失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [site, mode])

  const handleTopCatChange = (topId) => {
    setSelectedCat(topId)
    setSelectedSub('')
    const top = categories.find(c => c.id === topId)
    // 选一级类目就加载数据
    handlePull(topId, top.name)
  }

  const handleExport = () => {
    if (products.length === 0 || exporting) return
    setExporting(true)
    // 立刻构建导出，完成后保持导出中状态1秒再恢复
    try {
      const rows = products.map(p => ({
        '站点': site,
        'ASIN': p.asin,
        '标题': p.title || p.标题,
        '品牌': p.brand || p.品牌,
        '价格': p.price || p.价格,
        '月销量': p.monthly_sales || p.月销量 || 0,
        '评分': p.rating || p.星级,
        '评论数': p.review_count || p.评论数 || 0,
        '上架天数': p.listed_days || p.上架天数 || 0,
        '链接': `https://www.amazon.${site.toLowerCase() === 'us' ? 'com' : site.toLowerCase() === 'mx' ? 'com.mx' : 'br'}/dp/${p.asin}`
      }))
      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Amazon_V5_Data')
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Amazon_${site}_${mode}_${new Date().toISOString().slice(0,10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('导出失败:', err)
    }
    // 够1.5秒再恢复，不管导出多快
    var t0 = Date.now()
    ;(function check() {
      if (Date.now() - t0 < 1500) setTimeout(check, 100)
      else setExporting(false)
    })()
  }

  // 无限滚动
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handler = () => {
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 400 && visibleCount < products.length) {
        setVisibleCount(prev => Math.min(prev + 40, products.length))
      }
    }
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [visibleCount, products.length])

  return (
    <div className="h-full bg-white flex flex-col overflow-hidden font-sans select-none">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      
      <div className="bg-gradient-to-b from-emerald-100/30 to-white border-b border-slate-200 border-t-[3px] border-t-emerald-600 px-5 py-4 shrink-0 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-2 pr-3 border-r border-slate-200 shrink-0">
              <span className="text-[12px] font-black text-emerald-800 tracking-tight">亚马逊探测</span>
           </div>
           
           <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-inner shrink-0">
             {SITES.map(s => (
               <button key={s.id} onClick={() => setSite(s.id)}
                 className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-all duration-300 ${
                   site === s.id
                     ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md'
                     : 'text-slate-500 hover:text-emerald-700 hover:bg-white/50'
                 }`}
               >{s.name}</button>
             ))}
           </div>

           <div className="min-w-0 max-w-[160px]">
             <select
               value={selectedCat || ''}
               onChange={e => {
                 const val = e.target.value
                 if (!val) { setSelectedCat(''); setSelectedSub(''); setProducts([]); return }
                 handleTopCatChange(val)
               }}
               className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
             >
               <option value="">{catLoading ? '加载中...' : '选择大类'}</option>
               {categories.map(cat => (
                 <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
               ))}
             </select>
             </div>

             <div className="ml-auto flex items-center gap-2 shrink-0">
             {loading ? (
               <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[10px] font-black text-emerald-500 animate-pulse">拉取中...</span>
             ) : (
               <span className="text-[9px] font-bold text-slate-300">Sorftime 实时</span>
             )}
             {products.length > 0 && (
               <button onClick={handleExport} disabled={exporting} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                 <Icon name="download" size={10} /> {exporting ? '导出中...' : '导出'}
               </button>
             )}
           </div>
        </div>

        <div className="flex items-center gap-2 mt-1.5 ml-1">
           <span className="text-[9px] font-bold text-emerald-600">
             {products.length > 0 ? `${products.length} 条商品 · Sorftime 实时` : loading ? '正在拉取...' : '请选择类目'}
           </span>
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
            {products.slice(0, visibleCount).map((item, idx) => (
              <ProductCard key={item.asin || item.产品ASIN码 || idx} item={item} site={site} currency={currencyMap[site]} />
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
          <div className="flex flex-col items-center justify-center h-[300px] opacity-20">
             <Icon name="search" size={48} className="mb-2" />
             <p className="text-[14px] font-black tracking-widest uppercase">选择类目开始探测</p>
          </div>
        )}
      </div>
    </div>
  )
}

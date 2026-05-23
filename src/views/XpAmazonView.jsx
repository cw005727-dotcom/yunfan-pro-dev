import React, { useState, useEffect, useMemo } from 'react'
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
  .animate-breath {
    animation: breath 2s ease-in-out infinite;
  }
  .tag-shimmer {
    position: relative;
    overflow: hidden;
  }
  .tag-shimmer::after {
    content: "";
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: shimmer 2.5s infinite;
  }
  .radar-ring {
    position: absolute;
    border: 2px solid #10B981;
    border-radius: 50%;
    animation: radar-pulse 3s infinite cubic-bezier(0.23, 1, 0.32, 1);
  }
`;

const PLACEHOLDER_IMG = 'https://placehold.co/200x200/f1f5f9/cbd5e1?text=No+Image'

// 使用 React.memo 防止大量卡片无谓重绘
const ProductCard = React.memo(({ item, site }) => {
  const asin = item.asin || ''
  const rawUrl = item.thumbnail_url || item.thumbnail || item.image_url || ''
  
  // 走后端代理（解决 Amazon CDN 限制）
  const imgUrl = useMemo(() => {
    return rawUrl.startsWith('http')
      ? '/api/proxy/image?url=' + encodeURIComponent(rawUrl)
      : PLACEHOLDER_IMG
  }, [rawUrl])

  const amazonBase = site === 'US' ? 'amazon.com'
    : site === 'MX' ? 'amazon.com.mx'
    : 'amazon.com.br'

  return (
    <div className="group relative bg-white rounded-xl border border-slate-100 hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden">
      <div className="relative pt-[100%] bg-slate-50/50 overflow-hidden cursor-pointer" onClick={() => window.open(`https://www.${amazonBase}/dp/${asin}`, '_blank')}>
        <img 
          src={imgUrl} 
          alt={item.title} 
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105" 
          onError={e => { e.target.src = PLACEHOLDER_IMG }} 
        />
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

export default function XpAmazonView_V5() {
  const [site, setSite] = useState('US')
  const [categories, setCategories] = useState([])       
  const [categoryTree, setCategoryTree] = useState([])   
  const [selectedCat, setSelectedCat] = useState('')     
  const [selectedSub, setSelectedSub] = useState('')     
  const [mode, setMode] = useState('hot')  
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [catLoading, setCatLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadFromDb()
  }, [site, mode])

  async function loadFromDb() {
    setLoading(true)
    setError(null)
    setProducts([])
    try {
      const res = await fetch('/api/amazon/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site, mode, limit: 500 }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.detail || '加载失败'); return }
      let sorted = data.products || []
      if (mode === 'hot')    sorted = sorted.sort((a, b) => (b.monthly_sales || 0) - (a.monthly_sales || 0))
      if (mode === 'new')   sorted = sorted.sort((a, b) => (a.listed_days || 999) - (b.listed_days || 999))
      if (mode === 'potential') sorted = sorted.sort((a, b) => (b.potential_index || 0) - (a.potential_index || 0))
      setProducts(sorted)
    } catch (err) {
      setError('加载失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const currentSubcats = useMemo(() => {
    if (!selectedCat || !categoryTree.length) return []
    const cat = categoryTree.find(c => (c.nodeId || c.id) === selectedCat)
    return cat?.子类 ? cat.子类.map(s => ({
      id: s.nodeId || s.id,
      name: s.类目名称 || s.name || s.id,
    })) : []
  }, [selectedCat, categoryTree])

  const handlePull = async () => {
    if (!selectedCat) { setError('请先选择类目'); return }
    setLoading(true); setError(null); setProducts([])
    try {
      const nodeId = selectedSub || selectedCat
      const endpointMap = { hot: '/api/amazon/hot', potential: '/api/amazon/potential', new: '/api/amazon/new' }
      const endpoint = endpointMap[mode] || '/api/amazon/hot'
      
      const reqBody = { site, node_id: nodeId, page: 1 }
      const catObj = categories.find(c => c.id === selectedCat)
      if (catObj?.name) reqBody.search = catObj.name

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody),
      })
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.detail || data.error || '获取失败')
        return
      }
      
      let sorted = data.products || []
      if (mode === 'hot')    sorted = sorted.sort((a, b) => (b.sales || 0) - (a.sales || 0))
      if (mode === 'new')   sorted = sorted.sort((a, b) => (a.listed_days || 999) - (b.listed_days || 999))
      if (mode === 'potential') sorted = sorted.sort((a, b) => (b.potential_index || 0) - (a.potential_index || 0))
      
      setProducts(sorted)
    } catch (err) {
      setError('同步失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (products.length === 0) return
    const rows = products.map(p => ({
      '站点': site,
      'ASIN': p.asin,
      '标题': p.title,
      '品牌': p.brand,
      '价格': p.price,
      '月销量': p.sales,
      '评分': p.rating,
      '评论数': p.reviews,
      '上架天数': p.listed_days,
      '潜力指数': p.potential_index || p.potential_score || 0,
      '链接': `https://www.amazon.${site.toLowerCase() === 'us' ? 'com' : site.toLowerCase() === 'mx' ? 'com.mx' : 'com.br'}/dp/${p.asin}`
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Amazon_V5_Data')
    XLSX.writeFile(wb, `Amazon_${site}_${mode}_${new Date().toISOString().slice(0,10)}.xlsx`)
  }

  return (
    <div className="h-full bg-white flex flex-col overflow-hidden font-sans select-none">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      
      {/* 极简网格对齐控制台 - 强化背景显眼度与对比度 */}
      <div className="bg-gradient-to-b from-emerald-100/30 to-white border-b border-slate-200 border-t-[3px] border-t-emerald-600 px-5 py-4 shrink-0 shadow-sm relative overflow-hidden">
        {/* 背景装饰光晕 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        
        {/* Row 1 */}
        <div className="flex items-center gap-4 mb-2">
           <div className="w-[110px] shrink-0">
              <h1 className="text-[14px] font-black text-emerald-800 tracking-tight">亚马逊实时探测</h1>
           </div>
           
           <div className="flex-1 flex gap-2">
              <div className="flex-1 flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-inner">
                {SITES.map(s => (
                  <button 
                    key={s.id} 
                    onClick={() => setSite(s.id)} 
                    className={`flex-1 py-1 rounded-md text-[11px] font-black transition-all duration-300 ${
                      site === s.id 
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-200 scale-[1.02]' 
                        : 'text-slate-500 hover:text-emerald-700 hover:bg-white/50'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
           </div>

           <div className="w-[220px] shrink-0">
              <div className="flex w-full bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-inner">
                {MODES.map(m => (
                  <button 
                    key={m.id} 
                    onClick={() => setMode(m.id)} 
                    className={`flex-1 py-1 rounded-md text-[11px] font-black transition-all duration-200 flex items-center justify-center gap-1 ${
                      mode === m.id ? 'text-white shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    style={{ 
                      backgroundColor: mode === m.id ? m.color : 'transparent',
                    }}
                  >
                    {m.name.slice(0, 2)}
                  </button>
                ))}
              </div>
           </div>
        </div>

        {/* Row 2: 状态栏 */}
        <div className="flex items-center gap-4 mt-1">
           <span className="text-[10px] font-black text-emerald-600 w-[110px] shrink-0">
             {products.length > 0 ? `${products.length} 条商品` : loading ? '加载中...' : '就绪'}
           </span>
        </div>
      </div>

      {/* 内容展示区 */}
      <div className="flex-1 overflow-y-auto bg-slate-50/30 p-4">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3">
            {products.map((item, idx) => (
              <ProductCard key={idx} item={item} site={site} />
            ))}
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

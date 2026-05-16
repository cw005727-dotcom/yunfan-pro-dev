import React, { useState, useEffect } from 'react'
import Icon from '../components/Icon'

const SITES = [
  { id: 'US', name: '🇺🇸 美国', currencySymbol: '$' },
  { id: 'MX', name: '🇲🇽 墨西哥', currencySymbol: 'MX$' },
]

const CATEGORIES = [
  { id: 'automotive', name: '汽车用品', node_id: 'automotive' },
  { id: 'baby-products', name: '母婴', node_id: 'baby-products' },
  { id: 'beauty', name: '美妆个护', node_id: 'beauty' },
  { id: 'electronics', name: '电子数码', node_id: 'electronics' },
  { id: 'home-garden', name: '家居厨房', node_id: 'home-garden' },
  { id: 'kitchen', name: '餐厨用品', node_id: 'kitchen' },
  { id: 'lawn-garden', name: '园艺花园', node_id: 'lawn-garden' },
  { id: 'pet-supplies', name: '宠物用品', node_id: 'pet-supplies' },
  { id: 'sporting-goods', name: '运动户外', node_id: 'sporting-goods' },
  { id: 'hi', name: '工具五金', node_id: 'hi' },
  { id: 'office-products', name: '办公文具', node_id: 'office-products' },
]

const SUBCATEGORIES = {
  automotive: [
    { id: '15718271', name: '汽车护理' }, { id: '15857511', name: '汽车外观配件' },
    { id: '15857501', name: '汽车内饰配件' }, { id: '15736321', name: '汽车灯光灯泡' },
    { id: '346333011', name: '摩托艇动力运动' }, { id: '15718791', name: '机油与液体' },
    { id: '13591416011', name: '汽车油漆用品' }, { id: '15710351', name: '汽车性能配件' },
    { id: '2258019011', name: '房车配件' }, { id: '15719731', name: '汽车替换零件' },
    { id: '15706941', name: '汽车工具设备' }, { id: '15706571', name: '汽车轮胎轮毂' },
  ],
  'baby-products': [
    { id: '239225011', name: '婴儿活动娱乐' }, { id: '17720255011', name: '婴儿护理产品' },
    { id: '166835011', name: '儿童安全座椅配件' }, { id: '166764011', name: '婴儿尿布用品' },
    { id: '166777011', name: '婴儿喂养用品' }, { id: '166804011', name: '孕产妇用品' },
    { id: '239226011', name: '婴儿礼品' }, { id: '695338011', name: '婴儿房家具床品' },
    { id: '166887011', name: '如厕训练' }, { id: '166863011', name: '婴儿安全产品' },
    { id: '166842011', name: '婴儿推车' }, { id: '17726796011', name: '婴儿出行装备' },
  ],
  beauty: [
    { id: '17242866011', name: '手足指甲护理' }, { id: '11056591', name: '香水与香氛' },
    { id: '120225719011', name: '美妆礼盒套装' }, { id: '11057241', name: '护发产品' },
    { id: '11058281', name: '彩妆' }, { id: '3777891', name: '个护产品' },
    { id: '15144566011', name: '沙龙水疗设备' }, { id: '3778591', name: '剃须脱毛' },
    { id: '11060451', name: '护肤产品' }, { id: '11062741', name: '美妆工具配件' },
  ],
  electronics: [
    { id: '281407', name: '电子配件用品' }, { id: '502394', name: '相机摄影产品' },
    { id: '1077068', name: '车载电子' }, { id: '2811119011', name: '手机配件' },
    { id: '541966', name: '电脑配件' }, { id: '172526', name: 'GPS导航配件' },
    { id: '172541', name: '耳机耳塞' }, { id: '667846011', name: '家庭音响影院' },
    { id: '319574011', name: '船用电子' }, { id: '172574', name: '办公电子设备' },
    { id: '172623', name: '便携音视频' }, { id: '524136', name: '安防监控设备' },
    { id: '16285901', name: '电脑电子服务平台' }, { id: '1266092011', name: '电视视频产品' },
    { id: '7926841011', name: '游戏主机配件' }, { id: '300334', name: '投影仪' },
    { id: '10048700011', name: '可穿戴设备' }, { id: '2642125011', name: '电子书阅读器配件' },
  ],
  'home-garden': [
    { id: '1063236', name: '浴室用品' }, { id: '1063252', name: '床上用品' },
    { id: '10802561', name: '家庭清洁用品' }, { id: '1063306', name: '家具' },
    { id: '3206324011', name: '供暖制冷空气净化' }, { id: '1063278', name: '家居装饰品' },
    { id: '510240', name: '熨烫产品' }, { id: '3206325011', name: '儿童家居店' },
    { id: '284507', name: '厨房餐厅' }, { id: '901590', name: '活动派对用品' },
    { id: '13679381', name: '季节装饰' }, { id: '3610841', name: '家居收纳整理' },
    { id: '510106', name: '吸尘器地面护理' }, { id: '3736081', name: '墙艺装饰' },
  ],
  kitchen: [
    { id: '289668', name: '烘焙用具' }, { id: '289728', name: '酒吧工具酒具' },
    { id: '289742', name: '咖啡茶饮电器' }, { id: '289814', name: '厨房锅具' },
    { id: '13162311', name: '餐饮待客' }, { id: '13217501', name: '玻璃器皿' },
    { id: '979832011', name: '家庭酿酒红酒' }, { id: '1063916', name: '餐桌餐巾' },
    { id: '289754', name: '厨房小工具' }, { id: '289913', name: '厨房小家电' },
    { id: '510136', name: '厨房收纳' }, { id: '13299291', name: '酒具配件' },
  ],
  'lawn-garden': [
    { id: '553632', name: '后院观鸟野生动物' }, { id: '4619352011', name: '农场牧场' },
    { id: '3610851', name: '园艺草坪护理' }, { id: '552808', name: '户外发电机' },
    { id: '553760', name: '户外烹饪' }, { id: '551242', name: '户外电动割草设备' },
    { id: '553788', name: '户外装饰' }, { id: '13638732011', name: '户外冷暖设备' },
    { id: '13400641', name: '户外储物' }, { id: '553824', name: '庭院家具配件' },
    { id: '553844', name: '害虫防治' }, { id: '1272941011', name: '泳池热水浴缸用品' },
    { id: '3043471', name: '除雪工具' },
  ],
  'pet-supplies': [
    { id: '2975221011', name: '宠物鸟用品' }, { id: '2975241011', name: '猫用品' },
    { id: '2975312011', name: '狗用品' }, { id: '2975446011', name: '鱼类水族宠物' },
    { id: '2975481011', name: '马用品' }, { id: '2975504011', name: '爬行动物两栖用品' },
    { id: '2975520011', name: '小动物用品' },
  ],
  'sporting-goods': [
    { id: '3394801', name: '运动户外配件' }, { id: '3407731', name: '健身器材' },
    { id: '3386071', name: '体育粉丝店' }, { id: '706813011', name: '狩猎钓鱼用品' },
    { id: '2358921011', name: '纪念品展示收纳' }, { id: '706814011', name: '户外休闲' },
    { id: '10971181011', name: '运动服饰装备' }, { id: '3422351', name: '运动医学产品' },
  ],
  hi: [
    { id: '120225786011', name: '气动工具' }, { id: '13397451', name: '家用电器' },
    { id: '551240', name: '建筑材料' }, { id: '495266', name: '电气设备' },
    { id: '511228', name: '五金配件' }, { id: '3754161', name: '厨房浴室五金' },
    { id: '495224', name: '照明吊扇' }, { id: '553244', name: '测量布局工具' },
    { id: '228899', name: '油漆墙面处理' }, { id: '13749581', name: '泵与管道设备' },
    { id: '328182011', name: '电动手动工具' }, { id: '3180231', name: '安全防护' },
    { id: '13400631', name: '家居收纳' },
  ],
  'office-products': [
    { id: '12899801', name: '教育用品手工' }, { id: '1068972', name: '邮件用品' },
    { id: '172574', name: '办公电子设备' }, { id: '1069102', name: '办公家具照明' },
    { id: '1068956', name: '办公照明' }, { id: '1069242', name: '办公学习用品' },
    { id: '1069254', name: '展示用品' },
  ],
}

const CAT_NAMES = Object.fromEntries(CATEGORIES.map(c => [c.id, c.name]))
const PLACEHOLDER_IMG = 'https://placehold.co/200x200/e2e8f0/a0aec0?text=No+Image'

function RatingStars({ value }) {
  const v = Math.round(Number(value) * 2) / 2
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(d => (
        <svg key={d} className="w-3 h-3" viewBox="0 0 20 20" fill={d <= v ? '#f59e0b' : '#d1d5db'}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-amber-600 font-medium ml-0.5">{Number(value).toFixed(1)}</span>
    </div>
  )
}

function ProductCard({ product, site, productMode }) {
  const currencySymbol = SITES.find(s => s.id === site)?.currencySymbol || '$'
  const asin = product.asin || ''
  const imgUrl = product.image_url
    ? product.image_url.startsWith('http')
      ? '/api/proxy/image?url=' + encodeURIComponent(product.image_url)
      : product.image_url
    : PLACEHOLDER_IMG

  return (
    <a
      href={`https://www.amazon.com/dp/${asin}`}
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
        {Number(product.sales) >= 1000 && (
          <div className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            🔥 {Number(product.sales) >= 10000 ? (Number(product.sales) / 1000).toFixed(0) + 'k+' : product.sales}
          </div>
        )}
        {product.listed_days > 0 && product.listed_days <= 30 && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            🆕 {product.listed_days}天
          </div>
        )}
        {productMode === 'potential' && product.potential_score > 0 && (
          <div className="absolute bottom-2 right-2 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
            ⭐ {product.potential_score.toFixed(1)}
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-slate-800/70 text-white text-xs px-1.5 py-0.5 rounded font-mono">
          {asin.slice(0, 8)}
        </div>
      </div>
      <div className="p-2.5 space-y-1.5 flex-1">
        <h3 className="text-xs font-medium text-slate-800 line-clamp-2 leading-snug min-h-[2.5rem]">{product.title || '—'}</h3>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-sm font-bold text-rose-600">{currencySymbol}{Number(product.price).toFixed(2)}</span>
            <div className="text-xs text-slate-400">月销 {Number(product.sales).toLocaleString()}</div>
          </div>
          <RatingStars value={product.rating} />
        </div>
        {product.listed_days > 0 && (
          <div className="text-xs text-slate-400">🕐 上架 {product.listed_days} 天</div>
        )}
        {product.weight_g > 0 && (
          <div className="text-xs text-slate-400">
            ⚖️ {product.weight_g >= 1000 ? (product.weight_g / 1000).toFixed(2) + 'kg' : product.weight_g + 'g'}
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
          <span className="truncate max-w-[55%]">{product.brand || '—'}</span>
          <span>{Number(product.reviews).toLocaleString()} 评</span>
        </div>
      </div>
    </a>
  )
}

export default function XpAmazonView() {
  const [site, setSite] = useState('US')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [subcategories, setSubcategories] = useState([])
  const [selectedSubCat, setSelectedSubCat] = useState('')
  const [mode, setMode] = useState('hot')
  const [minSales, setMinSales] = useState(0)
  const [minRating, setMinRating] = useState(0)
  const [maxListedDays, setMaxListedDays] = useState(0)
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [view, setView] = useState('grid')
  const [lastUpdate, setLastUpdate] = useState('')

  const filterProducts = (all) => {
    let result = all
    if (mode === 'potential') {
      if (maxListedDays > 0) result = result.filter(n => (n.listed_days || 0) <= maxListedDays)
    } else {
      if (maxListedDays > 0) result = result.filter(n => (n.listed_days || 0) <= maxListedDays)
      if (minSales > 0) result = result.filter(n => (n.sales || 0) >= minSales)
      if (minRating > 0) result = result.filter(n => (n.rating || 0) >= minRating)
    }
    setFiltered(result)
  }

  useEffect(() => {
    if (products.length > 0) filterProducts(products)
  }, [maxListedDays, minSales, minRating])

  const handlePull = async () => {
    if (!selectedCategory) {
      setError('请先选择一个大类')
      return
    }
    setLoading(true)
    setError(null)
    setFiltered([])
    try {
      const nodeId = selectedSubCat || CATEGORIES.find(c => c.id === selectedCategory)?.node_id || selectedCategory
      const res = await fetch(mode === 'potential' ? '/api/amazon/potential' : '/api/amazon/hot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site,
          node_ids: [nodeId],
          min_sales: minSales,
          min_rating: minRating,
          max_listed_days: maxListedDays,
          new_only: mode === 'potential',
        }),
      })
      const data = await res.json()
      console.log('[Amazon] node_id:', nodeId, 'products:', data.products?.length, 'errors:', data.errors)
      if (data.error) {
        setError(data.error)
        return
      }
      if (!data.products || data.products.length === 0) {
        setError('该类目暂无数据，请尝试其他子类或站点')
        return
      }
      setProducts(data.products || [])
      filterProducts(data.products || [])
      setLastUpdate(new Date().toLocaleTimeString())
    } catch (err) {
      setError('加载失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId)
    setSelectedSubCat('')
    if (catId) setSubcategories(SUBCATEGORIES[catId] || [])
    else setSubcategories([])
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
            value={selectedCategory}
            onChange={e => handleCategoryChange(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-rose-400 min-w-[120px]"
          >
            <option value="">— 选择大类 —</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {/* 子类 */}
          {selectedCategory && (
            <select
              value={selectedSubCat}
              onChange={e => setSelectedSubCat(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-rose-400 min-w-[160px]"
            >
              <option value="">全部子类</option>
              {subcategories.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}
          {selectedCategory && subcategories.length > 0 && (
            <span className="text-xs text-slate-400">{subcategories.length}个子类</span>
          )}
          {/* 月销筛选 */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-500">月销≥</label>
            <input
              type="number"
              value={minSales}
              onChange={e => setMinSales(+e.target.value)}
              className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-rose-400"
              placeholder="0"
            />
          </div>
          {/* 上架天数 */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-500">上架≤</label>
            <select
              value={maxListedDays}
              onChange={e => setMaxListedDays(+e.target.value)}
              className="px-2 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-rose-400"
            >
              <option value={0}>不限</option>
              <option value={30}>30天</option>
              <option value={60}>60天</option>
              <option value={90}>90天</option>
              <option value={180}>180天</option>
              <option value={365}>1年</option>
            </select>
          </div>
          {/* 评分筛选 */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-500">评分≥</label>
            <input
              type="number"
              value={minRating}
              onChange={e => setMinRating(+e.target.value)}
              className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-rose-400"
              placeholder="0"
              step="0.1"
              min="0"
              max="5"
            />
          </div>
          {/* 模式切换 */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setMode('hot')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${mode === 'hot' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}
            >
              🔥 畅销爆品
            </button>
            <button
              onClick={() => setMode('potential')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${mode === 'potential' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}
            >
              ✨ 潜力新品
            </button>
          </div>
          {/* 拉取按钮 */}
          <div className="ml-auto flex items-center gap-2">
            {lastUpdate && <span className="text-xs text-slate-400">更新于 {lastUpdate}</span>}
            <button
              onClick={handlePull}
              disabled={loading}
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
            <p className="text-sm">选择站点和类目，点击「拉取」获取 Top100 数据</p>
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
              const currencySymbol = SITES.find(s => s.id === site)?.currencySymbol || '$'
              return (
                <a
                  key={product.asin}
                  href={`https://www.amazon.com/dp/${product.asin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:shadow hover:border-rose-300 transition-all"
                >
                  <img
                    src={product.image_url && product.image_url.startsWith('http')
                      ? '/api/proxy/image?url=' + encodeURIComponent(product.image_url)
                      : PLACEHOLDER_IMG}
                    alt={product.title}
                    className="w-14 h-14 object-contain rounded-lg bg-slate-50 flex-shrink-0"
                    onError={e => { e.target.src = PLACEHOLDER_IMG }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{product.title || '—'}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>{product.brand || '—'}</span>
                      <span>{CAT_NAMES[product.category_id] || ''}</span>
                      <span className="font-mono">{product.asin}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-base font-bold text-rose-600">{currencySymbol}{Number(product.price).toFixed(2)}</div>
                    <div className="text-xs text-slate-400">月销 {Number(product.sales).toLocaleString()}</div>
                    {product.listed_days > 0 && <div className="text-xs text-slate-400">🕐 {product.listed_days}天</div>}
                    {product.weight_g > 0 && (
                      <div className="text-xs text-slate-400">
                        ⚖️ {product.weight_g >= 1000 ? (product.weight_g / 1000).toFixed(2) + 'kg' : product.weight_g + 'g'}
                      </div>
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

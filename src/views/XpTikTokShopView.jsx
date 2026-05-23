import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Select, Button, Input, Tag, Empty, Spin, Badge, Row, Col, Segmented } from 'antd';
import { apiClient } from '../api/client';
import Icon from '../components/Icon';

const SITES = [
  { id: 'US', name: '🇺🇸 美国站' },
  { id: 'MX', name: '🇲🇽 墨西哥' },
  { id: 'BR', name: '🇧🇷 巴西站' },
];

const MODES = [
  { id: 'sales_7d', name: '7日榜', icon: 'flame', color: '#F43F5E' },
  { id: 'sales_24h', name: '飙升榜', icon: 'sparkles', color: '#10B981' },
  { id: 'gmv', name: 'GMV榜', icon: 'trending-up', color: '#F59E0B' },
];

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

const PLACEHOLDER_IMG = 'https://placehold.co/200x200/f1f5f9/cbd5e1?text=TTS+Item'

const ProductCard = React.memo(({ item, region }) => {
  const currency = region === 'US' ? '$' : region === 'MX' ? 'MX$' : 'R$';
  const title = item.product_name || item.title;
  const price = item.min_price || item.price || 0;
  const sales = item.total_sale_cnt || item.sales || 0;
  const sales7d = item.total_sale_7d_cnt || 0;
  const growth = item.growth_rate_7d || item.sales_growth_7d || (sales > 0 ? sales7d / sales : 0); 
  
  // 提取图片并使用代理
  const rawImg = item.image_url || item.thumbnail || '';
  const displayImg = rawImg ? `/api/proxy/image?url=${encodeURIComponent(rawImg)}` : '';
  
  const imgUrl = useMemo(() => {
    // 优先尝试从 cover_url 字符串解析
    let finalUrl = rawImg;
    if (item.cover_url && typeof item.cover_url === 'string' && item.cover_url.startsWith('[')) {
      try {
        const covers = JSON.parse(item.cover_url);
        if (covers && covers.length > 0 && covers[0].url) {
          finalUrl = covers[0].url;
        }
      } catch (e) {
        console.warn('Failed to parse cover_url:', e);
      }
    }
    
    return finalUrl.startsWith('http')
      ? '/api/proxy/image?url=' + encodeURIComponent(finalUrl)
      : PLACEHOLDER_IMG
  }, [rawImg, item.cover_url])

  return (
    <div className="group relative bg-white rounded-xl border border-slate-100 hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden">
      <div className="relative pt-[100%] bg-slate-50/50 overflow-hidden cursor-pointer" onClick={() => item.product_url && window.open(item.product_url, '_blank')}>
        <img 
          src={imgUrl} 
          alt={title} 
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105" 
          onError={e => { e.target.src = PLACEHOLDER_IMG }} 
        />
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
          {sales >= 1000 && (
            <div className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[9px] font-black flex items-center gap-0.5 shadow-sm tag-shimmer">
              <Icon name="flame" size={8} />
              <span>{sales > 10000 ? (sales/1000).toFixed(1)+'k' : sales}</span>
            </div>
          )}
        </div>
      </div>
      <div className="p-2.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-bold text-slate-400 truncate max-w-[70%]">{item.category_name || 'TikTok Shop'}</span>
            <div className="flex items-center gap-0.5 text-emerald-500">
              <Icon name="trending-up" size={8} />
              <span className="text-[9px] font-bold">HOT</span>
            </div>
          </div>
          <h3 className="text-[11px] font-bold text-slate-700 leading-tight line-clamp-2 mb-2" title={title}>{title}</h3>
          <div className="text-[14px] font-black text-slate-900 mb-1">
             {currency}{price}
          </div>
        </div>
        <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 border-t border-slate-50 pt-1.5">
           <span className="text-emerald-600 flex items-center gap-0.5">
             <Icon name="trending-up" size={8} />
             7D增: {growth > 0 ? '+' : ''}{Math.round(growth * 100)}%
           </span>
           <span>佣金: {item.product_commission_rate ? Math.round(item.product_commission_rate*100)+'%' : '-'}</span>
        </div>
      </div>
    </div>
  )
})

export default function XpTikTokShopView() {
  const [region, setRegion] = useState('US');
  const [sortBy, setSortBy] = useState('sales_7d');
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      // 1. 获取一级类目
      const res = await apiClient.get('/tiktok/trending', { region });
      
      // 增强容错：如果 API 失败或返回 404，使用常用备用类目
      let l1List = Array.isArray(res) ? res : (res.data || []);
      
      if (l1List.length === 0) {
        console.warn('TikTok categories empty, using fallback list');
        l1List = [
          { category_id: "600001", category_name: "居家日用" },
          { category_id: "601450", category_name: "美妆个护" },
          { category_id: "603014", category_name: "女装" },
          { category_id: "600742", category_name: "数码配件" },
          { category_id: "601134", category_name: "运动户外" },
          { category_id: "601303", category_name: "鞋靴箱包" },
          { category_id: "600213", category_name: "家用电器" },
          { category_id: "600452", category_name: "手机数码" },
          { category_id: "600888", category_name: "电脑办公" },
          { category_id: "601555", category_name: "个护家清" }
        ];
      }
      
      const options = l1List.map(c => ({
        label: c.category_name || '未知类目',
        value: `first_${c.category_id}`,
        className: 'font-black text-emerald-700'
      }));

      setCategories(options);
    } catch (e) {
      console.error('Failed to fetch categories:', e);
      // 即使出错也显示常用类目，不让下拉框为空
      setCategories([
        { label: "居家日用", value: "first_600001", className: 'font-black text-emerald-700' },
        { label: "美妆个护", value: "first_601450", className: 'font-black text-emerald-700' },
        { label: "女装", value: "first_603014", className: 'font-black text-emerald-700' },
        { label: "数码配件", value: "first_600742", className: 'font-black text-emerald-700' },
        { label: "运动户外", value: "first_601134", className: 'font-black text-emerald-700' },
        { label: "鞋靴箱包", value: "first_601303", className: 'font-black text-emerald-700' },
        { label: "家用电器", value: "first_600213", className: 'font-black text-emerald-700' },
        { label: "手机数码", value: "first_600452", className: 'font-black text-emerald-700' },
        { label: "电脑办公", value: "first_600888", className: 'font-black text-emerald-700' },
        { label: "个护家清", value: "first_601555", className: 'font-black text-emerald-700' }
      ]);
    }
  }, [region]);

  // 当选择了一级类目，动态拉取二级类目并插入
  const handleCategoryChange = async (val) => {
    setCategory(val);
    if (val && val.startsWith('first_')) {
      const parentId = val.replace('first_', '');
      try {
        const res = await apiClient.get('/tiktok/categories/l2', { parent_id: parentId });
        const l2List = Array.isArray(res) ? res : (res.data || []);
        
        if (l2List.length > 0) {
          const subOptions = l2List.map(c => ({
            label: `  ↳ ${c.category_name}`,
            value: `second_${c.category_id}`,
            className: 'pl-4 text-slate-500'
          }));
          
          // 更新下拉列表，将二级类目插入到对应一级类目后面
          setCategories(prev => {
            const index = prev.findIndex(item => item.value === val);
            const newOptions = [...prev];
            // 过滤掉之前可能存在的二级类目，避免重复
            const filtered = newOptions.filter(item => !item.value.startsWith('second_'));
            filtered.splice(index + 1, 0, ...subOptions);
            return filtered;
          });
        }
      } catch (e) {
        console.error('Failed to fetch L2 categories:', e);
      }
    }
  };


  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProducts([]);
    try {
      const params = {
        region,
        sort_by: sortBy,
        page: 1,
        page_size: 20
      };
      if (category) params.category_id = category;

      const res = await apiClient.get('/tiktok/products', params);
      
      const list = res.list || res.data?.list || (Array.isArray(res) ? res : null);
      
      if (list && Array.isArray(list)) {
        setProducts(list);
      } else {
        setProducts([]);
        if (res.code !== 0 && res.msg) {
          setError(`接口返回异常: ${res.msg}`);
        }
      }
    } catch (e) {
      console.error(e);
      setError("EchoTik API 接入成功但当前无返回数据。请检查 API Key 权限或区域设置。");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [region, sortBy, category]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 【学习亚马逊逻辑】不再通过 useEffect 自动拉取数据，改为手动触发
  // 保持初始状态为空，显示 "Awaiting Signal"

  return (
    <div className="h-full bg-white flex flex-col overflow-hidden font-sans select-none">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      
      {/* 亚马逊同款 V5 极简网格控制台 */}
      <div className="bg-gradient-to-b from-emerald-100/30 to-white border-b border-slate-200 border-t-[3px] border-t-emerald-600 px-5 py-4 shrink-0 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        
        {/* Row 1 */}
        <div className="flex items-center gap-4 mb-2">
           <div className="w-[110px] shrink-0">
              <h1 className="text-[14px] font-black text-emerald-800 tracking-tight">TikTok 实时探测</h1>
           </div>
           
           <div className="flex-1 flex gap-2">
              <div className="flex-1 flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-inner">
                {SITES.map(s => (
                  <button 
                    key={s.id} 
                    onClick={() => setRegion(s.id)} 
                    className={`flex-1 py-1 rounded-md text-[11px] font-black transition-all duration-300 ${
                      region === s.id 
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
                    onClick={() => setSortBy(m.id)} 
                    className={`flex-1 py-1 rounded-md text-[11px] font-black transition-all duration-200 flex items-center justify-center gap-1 ${
                      sortBy === m.id ? 'text-white shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    style={{ 
                      backgroundColor: sortBy === m.id ? m.color : 'transparent',
                    }}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
           </div>
        </div>

        {/* Row 2 */}
        <div className="flex items-center gap-4">
           <div className="w-[110px] shrink-0">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">TTS Intelligence</span>
           </div>

           <div className="flex-1">
              <Select 
                className="w-full h-8" 
                placeholder="🔍 全品类实时排行榜筛选 (由 EchoTik 提供真实类目)" 
                size="middle"
                allowClear
                options={categories}
                onChange={handleCategoryChange}
                value={category}
                style={{ width: '100%' }}
                dropdownStyle={{ fontSize: '11px' }}
              />
           </div>

           <div className="w-[220px] shrink-0 flex gap-1.5">
              <button onClick={fetchData} disabled={loading} className="flex-1 h-7 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-lg text-[11px] font-black flex items-center justify-center gap-1.5 shadow-md shadow-emerald-100 active:scale-95 disabled:opacity-50">
                <Icon name={loading ? 'loader' : 'zap'} size={12} className={loading ? 'animate-spin' : ''} />
                {loading ? '同步中' : '同步探测'}
              </button>
              <button className="h-7 px-3 bg-white border border-slate-200 text-slate-500 rounded-lg text-[11px] font-black flex items-center gap-1 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-30">
                <Icon name="download" size={12} />
                导出
              </button>
           </div>
        </div>
      </div>

      {/* 内容展示区 */}
      <div className="flex-1 overflow-y-auto bg-slate-50/30 p-4">
        {error && (
          <div className="mb-4 p-3 bg-white border border-emerald-100 rounded-xl text-emerald-700 text-[11px] font-bold flex items-center gap-2 shadow-sm">
            <Badge status="processing" color="#10b981" />
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
             <p className="text-[12px] font-black text-emerald-600 tracking-[0.3em] uppercase animate-breath">EchoTik 深度探测中...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3">
            {products.map((item, idx) => (
              <ProductCard key={idx} item={item} region={region} />
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
  );
}

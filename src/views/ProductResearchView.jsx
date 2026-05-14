import { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../api/client';

const CATEGORIES = [
  { id: 'beauty', name: '美妆个护', emoji: '💄' },
  { id: 'kitchen', name: '家居日用', emoji: '🏠' },
  { id: 'electronics', name: '3C配件', emoji: '📱' },
  { id: 'automotive', name: '汽摩配件', emoji: '🚗' },
  { id: 'pet-supplies', name: '宠物用品', emoji: '🐶' },
  { id: 'shoes', name: '时尚配饰', emoji: '👟' },
];

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  favorite: 'bg-pink-100 text-pink-700',
  marked: 'bg-green-100 text-green-700',
  ignore: 'bg-gray-100 text-gray-400',
};

export default function ProductResearchView() {
  const [activeTab, setActiveTab] = useState('all');
  const [activeNode, setActiveNode] = useState('all');
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;
  const [hasMore, setHasMore] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filter, setFilter] = useState({ min_sales: 100, max_price: null });

  const fetchProducts = async (reset = false) => {
    try {
      const params = new URLSearchParams({
        limit: PAGE_SIZE,
        offset: reset ? 0 : page * PAGE_SIZE,
      });
      if (activeNode !== 'all') params.set('node_id', activeNode);
      if (filter.min_sales) params.set('min_sales', filter.min_sales);
      if (filter.max_price) params.set('max_price', filter.max_price);

      const res = await fetch(`${API_BASE}/research/products?${params}`);
      const data = await res.json();
      if (reset) {
        setProducts(data);
        setPage(1);
      } else {
        setProducts(prev => [...prev, ...data]);
        setPage(p => p + 1);
      }
      setHasMore(data.length === PAGE_SIZE);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/research/categories/stats`);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProducts(true);
    fetchStats();
  }, [activeNode, filter]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'all') setActiveNode('all');
    else setActiveNode(tab);
  };

  const markProduct = async (id, action) => {
    await fetch(`${API_BASE}/research/products/${id}/mark?action=${action}`, { method: 'POST' });
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: action } : p));
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(p => p + 1);
      fetchProducts(false);
    }
  };

  // Format number
  const fmt = (n) => {
    if (!n && n !== 0) return '-';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n.toString();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-800">亚马逊选品研究</h1>
          <p className="text-sm text-gray-500 mt-0.5">Amazon MX · 6大品类 · 精准筛选</p>
        </div>
        <div className="flex gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => handleTabClick(c.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === c.id
                  ? 'bg-rose-500 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c.emoji} {c.name}
            </button>
          ))}
          <button
            onClick={() => handleTabClick('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-gray-800 text-white shadow'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Stats sidebar */}
        <div className="w-72 bg-white border-r overflow-y-auto p-4 shrink-0">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">品类分析报告</h2>
          {stats.map(s => (
            <div key={s.node_id} className="mb-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">{s.node_name}</span>
                <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">{s.total} 个</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-gray-400">平均月销</div>
                  <div className="font-bold text-gray-700">{fmt(s.avg_sales)}</div>
                </div>
                <div>
                  <div className="text-gray-400">平均价格</div>
                  <div className="font-bold text-gray-700">${s.avg_price?.toFixed(0) || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-400">平均评分</div>
                  <div className="font-bold text-gray-700">⭐ {s.avg_rating?.toFixed(1) || '-'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main content - waterfall */}
        <div className="flex-1 overflow-y-auto p-6" id="waterfall-container">
          {loading && products.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                {products.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onMark={markProduct}
                    onClick={() => setSelectedProduct(p)}
                    fmt={fmt}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="text-center py-6">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-6 py-2 bg-rose-500 text-white rounded-full font-medium hover:bg-rose-600 disabled:opacity-50"
                  >
                    {loading ? '加载中...' : '加载更多'}
                  </button>
                </div>
              )}
              {!loading && products.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                  暂无数据，请检查筛选条件
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Product detail modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onMark={markProduct}
          fmt={fmt}
        />
      )}
    </div>
  );
}

function ProductCard({ product, onMark, onClick, fmt }) {
  const imgError = useRef(false);
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div
      className="bg-white rounded-xl shadow-sm overflow-hidden break-inside-avoid hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative bg-gray-100 aspect-square">
        {!imgFailed ? (
          <img
            src={product.thumbnail_url}
            alt={product.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Sales badge */}
        <div className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {fmt(product.monthly_sales)}/月
        </div>
        {/* Status */}
        {product.status !== 'pending' && (
          <div className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[product.status] || ''}`}>
            {product.status === 'favorite' ? '❤️' : product.status === 'marked' ? '✅' : '⛔'}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="text-xs text-gray-400 mb-1">{product.brand || '-'}</div>
        <p className="text-sm text-gray-800 line-clamp-2 leading-snug mb-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.title}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-rose-600">${product.price?.toFixed(0) || '-'}</span>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>⭐{product.rating?.toFixed(1) || '-'}</span>
            <span className="text-gray-300">|</span>
            <span>{fmt(product.review_count)} 评价</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          <span>{product.node_name}</span>
          <span>{product.launch_date || '-'}</span>
        </div>
      </div>

      {/* Actions (on hover) */}
      <div className="hidden group-hover:flex border-t bg-gray-50 p-2 gap-1">
        <button onClick={(e) => { e.stopPropagation(); onMark(product.id, 'favorite'); }} className="flex-1 text-xs py-1.5 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100">❤️ 喜欢</button>
        <button onClick={(e) => { e.stopPropagation(); onMark(product.id, 'marked'); }} className="flex-1 text-xs py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">✅ 标记</button>
        <button onClick={(e) => { e.stopPropagation(); onMark(product.id, 'ignore'); }} className="flex-1 text-xs py-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200">⛔ 忽略</button>
      </div>
    </div>
  );
}

function ProductModal({ product, onClose, onMark, fmt }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500">✕</button>
        
        <div className="flex gap-6 p-6">
          {/* Image */}
          <div className="w-64 h-64 bg-gray-100 rounded-xl overflow-hidden shrink-0">
            <img src={product.thumbnail_url} alt={product.title} className="w-full h-full object-cover" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-400 mb-1">{product.brand || '未知品牌'}</div>
            <h2 className="text-lg font-bold text-gray-800 mb-3 leading-snug">{product.title}</h2>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-rose-50 rounded-xl p-3">
                <div className="text-xs text-rose-400">价格</div>
                <div className="text-2xl font-bold text-rose-600">${product.price?.toFixed(2) || '-'}</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-3">
                <div className="text-xs text-amber-400">月销量</div>
                <div className="text-2xl font-bold text-amber-600">{fmt(product.monthly_sales)}</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <div className="text-xs text-blue-400">评论数</div>
                <div className="text-xl font-bold text-blue-600">{fmt(product.review_count)}</div>
              </div>
              <div className="bg-green-50 rounded-xl p-3">
                <div className="text-xs text-green-400">评分</div>
                <div className="text-xl font-bold text-green-600">⭐{product.rating?.toFixed(1) || '-'}</div>
              </div>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <div>类目: {product.node_name}</div>
              <div>类目排名: {product.category_rank || '-'}</div>
              <div>上架日期: {product.launch_date || '-'}</div>
              <div>毛利率: {product.margin_rate ? product.margin_rate.toFixed(1) + '%' : '-'}</div>
              <div>ASIN: <a href={product.product_url} target="_blank" rel="noopener" className="text-rose-500 hover:underline">{product.asin}</a></div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0 border-t">
          <button onClick={() => onMark(product.id, 'favorite')} className="flex-1 py-3 bg-pink-50 text-pink-600 rounded-xl font-medium hover:bg-pink-100">❤️ 喜欢</button>
          <button onClick={() => onMark(product.id, 'marked')} className="flex-1 py-3 bg-green-50 text-green-600 rounded-xl font-medium hover:bg-green-100">✅ 标记待选</button>
          <button onClick={() => onMark(product.id, 'ignore')} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-medium hover:bg-gray-200">⛔ 忽略</button>
        </div>
      </div>
    </div>
  );
}
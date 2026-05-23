import React, { useState, useEffect, useMemo } from 'react'
import { Card, Table, Tag, Button, Input, Select, Space, Tooltip, Badge, Avatar } from 'antd'
import { 
  ShoppingBag, Search, Filter, ArrowUpRight, TrendingUp, 
  BarChart2, Globe, Shield, Zap, RefreshCw, Download
} from 'lucide-react'
import Icon from '../components/Icon'

const API_BASE = '/api/research'

const SITE_MAP = {
  'MX': '🇲🇽 墨西哥',
  'BR': '🇧🇷 巴西',
  'AR': '🇦🇷 阿根廷',
}

const CATEGORIES = [
  '美妆个护', '家居日用', '3C配件', '汽摩配件', '宠物用品', 
  '时尚配饰', '运动户外', '鞋类', '玩具游戏'
]

const PREMIUM_STYLES = `
  .meli-table .ant-table-thead > tr > th {
    background: #f8fafc;
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #94a3b8;
    border-bottom: 1px solid #f1f5f9;
  }
  .meli-table .ant-table-tbody > tr > td {
    padding: 12px 16px !important;
    border-bottom: 1px solid #f8fafc;
  }
  .meli-table .ant-table-tbody > tr:hover > td {
    background: #f8fafc !important;
  }
  .premium-card {
    background: white;
    border: 1px solid rgba(226, 232, 240, 0.6);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
    border-radius: 16px;
  }
  .glass-tag {
    background: rgba(16, 185, 129, 0.05);
    border: 1px solid rgba(16, 185, 129, 0.1);
    color: #059669;
    font-weight: 900;
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 6px;
  }
`

// Cloud Intelligence Meli View
export default function XpMeliView() {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [filters, setFilters] = useState({
    node_name: '',
    min_sales: 0,
    status: ''
  })

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.node_name) params.append('node_id', filters.node_name)
      if (filters.min_sales) params.append('min_sales', filters.min_sales)
      if (filters.status) params.append('status', filters.status)
      params.append('limit', 100)

      const res = await fetch(`${API_BASE}/products?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (e) {
      console.error('Failed to fetch Meli products:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const columns = [
    {
      title: '商品详情 / Product Info',
      dataIndex: 'title',
      key: 'title',
      width: 400,
      render: (text, record) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            <img 
              src={record.thumbnail_url || 'https://placehold.co/100x100/f8fafc/94a3b8?text=No+Image'} 
              alt="" 
              className="w-full h-full object-contain"
              onError={(e) => e.target.src = 'https://placehold.co/100x100/f8fafc/94a3b8?text=Error'}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{record.brand || 'No Brand'}</span>
              <Badge status="processing" color="#10b981" />
            </div>
            <a 
              href={record.product_url} 
              target="_blank" 
              rel="noreferrer"
              className="text-[13px] font-black text-slate-800 leading-tight truncate hover:text-emerald-600 transition-colors"
            >
              {text}
            </a>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1"><Zap size={10} className="text-amber-500" /> ID: {record.asin}</span>
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1"><Globe size={10} className="text-blue-400" /> MX</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '市场表现 / Performance',
      key: 'performance',
      render: (_, record) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400">MONTHLY SALES</span>
            <span className="text-[14px] font-black text-slate-900">{record.monthly_sales.toLocaleString()}</span>
          </div>
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500" 
              style={{ width: `${Math.min(record.monthly_sales / 2000 * 100, 100)}%` }} 
            />
          </div>
          <div className="flex items-center justify-between mt-0.5">
             <div className="flex items-center gap-1">
               <Icon name="star" size={10} className="text-amber-400 fill-current" />
               <span className="text-[10px] font-bold text-slate-600">{record.rating}</span>
             </div>
             <span className="text-[10px] font-bold text-slate-400">{record.review_count} 评论</span>
          </div>
        </div>
      )
    },
    {
      title: '财务核算 / Financials',
      key: 'financials',
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[16px] font-black text-emerald-600">$ {record.price}</span>
            <span className="text-[10px] font-black text-slate-300">MXN</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="glass-tag">毛利率 {Math.round((record.margin_rate || 0.15) * 100)}%</span>
            <span className="text-[10px] font-bold text-slate-400">W: {record.weight_g}g</span>
          </div>
        </div>
      )
    },
    {
      title: '状态 / Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = {
          favorite: { color: 'gold', label: '收藏' },
          marked: { color: 'blue', label: '已标' },
          ignore: { color: 'default', label: '忽略' },
          pending: { color: 'orange', label: '待定' }
        }
        const item = config[status] || config.pending
        return <Tag color={item.color} className="rounded-md border-none font-black text-[10px] px-2 py-0.5 uppercase">{item.label}</Tag>
      }
    },
    {
      title: '操作 / Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            size="small" 
            className="text-slate-400 hover:text-emerald-600"
            icon={<ArrowUpRight size={16} />}
            onClick={() => window.open(record.product_url, '_blank')}
          />
          <Button 
            type="text" 
            size="small" 
            className="text-slate-400 hover:text-amber-500"
            icon={<Icon name="more-horizontal" size={16} />}
          />
        </Space>
      )
    }
  ]

  return (
    <div className="animate-[fadeIn_0.5s_ease-out] space-y-4">
      <style>{PREMIUM_STYLES}</style>
      
      {/* Header Unit */}
      <div className="bg-white border-b border-slate-100 p-6 -mx-6 -mt-6 mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-[18px] font-black text-slate-900 tracking-tight">美客多跨境选品探测</h2>
          </div>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[2px]">Mercado Libre Intelligence Unit</p>
        </div>
        
        <Space size="middle">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">筛选类目</span>
            <Select 
              placeholder="全品类" 
              className="w-32" 
              size="small"
              onChange={(v) => setFilters({...filters, node_name: v})}
              options={CATEGORIES.map(c => ({ label: c, value: c }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">最低销量</span>
            <Select 
              placeholder="全部" 
              className="w-24" 
              size="small"
              onChange={(v) => setFilters({...filters, min_sales: v})}
              options={[
                { label: '500+', value: 500 },
                { label: '1000+', value: 1000 },
                { label: '2000+', value: 2000 }
              ]}
            />
          </div>
          <Button 
            onClick={fetchProducts}
            className="h-10 px-6 bg-emerald-600 text-white rounded-xl flex items-center gap-2 text-[11px] font-black hover:bg-emerald-700 transition-all border-none shadow-lg shadow-emerald-100"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            刷新情报库
          </Button>
        </Space>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="premium-card" bodyStyle={{ padding: '16px' }}>
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">已同步商品</div>
          <div className="text-[20px] font-black text-slate-900">{products.length} <span className="text-xs opacity-40">SKU</span></div>
        </Card>
        <Card className="premium-card" bodyStyle={{ padding: '16px' }}>
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">高转化爆品</div>
          <div className="text-[20px] font-black text-emerald-600">{products.filter(p => p.monthly_sales > 1000).length} <span className="text-xs opacity-40">ITEM</span></div>
        </Card>
        <Card className="premium-card" bodyStyle={{ padding: '16px' }}>
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">平均毛利率</div>
          <div className="text-[20px] font-black text-blue-600">18.4%</div>
        </Card>
        <Card className="premium-card" bodyStyle={{ padding: '16px' }}>
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">类目覆盖率</div>
          <div className="text-[20px] font-black text-amber-500">92%</div>
        </Card>
      </div>

      {/* Main Table */}
      <div className="premium-card overflow-hidden">
        <Table 
          dataSource={products} 
          columns={columns} 
          loading={loading}
          pagination={{ pageSize: 12, size: 'small' }}
          className="meli-table"
          rowKey="id"
        />
      </div>
    </div>
  )
}

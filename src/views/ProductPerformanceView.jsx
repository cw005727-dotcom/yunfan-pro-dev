import { useState, useEffect, useCallback, useRef } from 'react'

// 图标组件
const Icon = ({ name, size = 16 }) => {
  const icons = {
    'arrow-up': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>,
    'arrow-down': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>,
    'activity': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>,
    'users': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    'shopping-cart': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
    'alert-triangle': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    'zap': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/></svg>,
    'check-circle': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>,
    'image': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>,
    'filter': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/></svg>,
  }
  return <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icons[name] || null}</span>
}

// 解析百分比
const parseRate = (val) => {
  if (!val && val !== 0) return 0
  const s = String(val).replace('%', '').replace(',', '.').trim()
  return parseFloat(s) || 0
}

// 问题类型标签样式
const issueStyle = (type) => {
  const map = {
    '⚠️高曝光低转化': { bg: '#fef3c7', color: '#d97706', border: '#f59e0b' },
    '💡低曝光高转化': { bg: '#d1fae5', color: '#059669', border: '#10b981' },
    '📈表现正常': { bg: '#f3f4f6', color: '#6b7280', border: '#9ca3af' },
  }
  return map[type] || map['📈表现正常']
}

export default function ProductPerformanceView({ user }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ '⚠️高曝光低转化': 0, '💡低曝光高转化': 0, '📈表现正常': 0 })
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sort, setSort] = useState('unique_visits')
  const [order, setOrder] = useState('desc')
  const [issueFilter, setIssueFilter] = useState('全部')
  const [siteFilter, setSiteFilter] = useState('全部')
  const [selectedItem, setSelectedItem] = useState(null)
  const pageSize = 24

  // 加载数据
  const abortRef = useRef(null)

  const loadData = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    try {
      const params = new URLSearchParams({ sort, order, page, page_size: pageSize })
      if (issueFilter !== '全部') params.set('issue', issueFilter)
      if (siteFilter !== '全部') params.set('site_id', siteFilter)
      // 所有人按 owner 过滤
      if (user?.username) params.set('owner', user.username)

      const res = await fetch(`/api/performance/list?${params}`, { signal: controller.signal })
      if (controller.signal.aborted) return
      const data = await res.json()
      if (controller.signal.aborted) return

      setItems(data.items || [])
      setStats(data.stats || { '⚠️高曝光低转化': 0, '💡低曝光高转化': 0, '📈表现正常': 0 })
      setTotal(data.total || 0)
      setTotalPages(data.total_pages || 1)
    } catch (err) {
      if (err.name !== 'AbortError') console.error('加载失败:', err)
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [sort, order, page, issueFilter, siteFilter, user])

  useEffect(() => { loadData() }, [loadData])

  // 排序切换
  const handleSort = (field) => {
    if (sort === field) {
      setOrder(order === 'desc' ? 'asc' : 'desc')
    } else {
      setSort(field)
      setOrder('desc')
    }
    setPage(1)
  }

  const SortIcon = ({ field }) => {
    if (sort !== field) return null
    return order === 'desc'
      ? <Icon name="arrow-down" size={14} />
      : <Icon name="arrow-up" size={14} />
  }

  // 数字颜色指示（基于均值）
  const getVisitColor = (v) => {
    const avg = total > 0 ? items.reduce((s, i) => s + (i.unique_visits || 0), 0) / items.length : 1
    if (v > avg * 2) return '#10b981'
    if (v > avg) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>
          📊 商品性能诊断
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: '8px 0 0' }}>
          共 {total} 个商品 · {stats['⚠️高曝光低转化']} 个问题商品待优化
        </p>
      </div>

      {/* AI 诊断面板 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '24px',
        color: 'white'
      }}>
        <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '16px', opacity: 0.9 }}>
          🌟 AI 自动诊断 · 问题商品识别
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { key: '⚠️高曝光低转化', icon: 'alert-triangle', label: '高曝光低转化', color: '#fbbf24' },
            { key: '💡低曝光高转化', icon: 'zap', label: '低曝光高转化', color: '#34d399' },
            { key: '📈表现正常', icon: 'check-circle', label: '表现正常', color: '#a78bfa' },
          ].map(({ key, icon, label, color }) => (
            <div key={key} style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '8px',
              padding: '12px 16px',
              cursor: 'pointer',
              border: issueFilter === key ? `2px solid ${color}` : '2px solid transparent',
              transition: 'all 0.2s'
            }} onClick={() => {
              setIssueFilter(issueFilter === key ? '全部' : key)
              setPage(1)
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Icon name={icon} size={16} />
                <span style={{ fontSize: '13px', opacity: 0.9 }}>{label}</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700' }}>{stats[key] || 0}</div>
              <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>个商品</div>
            </div>
          ))}
        </div>
      </div>

      {/* 工具栏 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        background: 'white', borderRadius: '8px', padding: '12px 16px',
        marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {/* 排序 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>排序：</span>
          {[
            { key: 'unique_visits', label: '访问量' },
            { key: 'visitor_convert_rate', label: '转化率' },
            { key: 'order_count', label: '订单数' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => handleSort(key)} style={{
              padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: sort === key ? '#4f46e5' : '#f3f4f6',
              color: sort === key ? 'white' : '#374151',
              fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px',
              fontWeight: sort === key ? '500' : '400'
            }}>
              {label} <SortIcon field={key} />
            </button>
          ))}
        </div>

        {/* 站点筛选 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>站点：</span>
          {['全部', 'MLB', 'MLM', 'MLA', 'MCO'].map(s => (
            <button key={s} onClick={() => { setSiteFilter(s); setPage(1) }} style={{
              padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: siteFilter === s ? '#4f46e5' : '#f3f4f6',
              color: siteFilter === s ? 'white' : '#374151',
              fontSize: '13px', fontWeight: siteFilter === s ? '500' : '400'
            }}>
              {s === '全部' ? '全部' : s === 'MLB' ? '🇧🇷 巴西' : s === 'MLM' ? '🇲🇽 墨西哥' : s === 'MLA' ? '🇦🇷 阿根廷' : '🇨🇴 哥伦比亚'}
            </button>
          ))}
        </div>
      </div>

      {/* 加载状态 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          加载中...
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          暂无数据 · 请先在「数据上传」上传商品性能报告
        </div>
      ) : (
        <>
          {/* 商品卡片网格 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '16px'
          }}>
            {items.map(item => {
              const iss = issueStyle(item.ai_issue_type || '📈表现正常')
              return (
                <div key={item.item_id} onClick={() => setSelectedItem(item)} style={{
                  background: 'white', borderRadius: '10px', overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)', cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  border: '1px solid #e5e7eb'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'
                }}>
                  {/* 图片 */}
                  <div style={{
                    height: '120px', background: '#f9fafb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    {(item.pictures?.[0] || item.thumbnail) ? (
                      <img
                        src={(Array.isArray(item.pictures) ? item.pictures[0] : null) || item.thumbnail}
                        alt={item.product_name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }}
                        onError={e => {
                          if (e.target.src !== item.thumbnail) {
                            e.target.src = item.thumbnail;
                          }
                          e.target.onerror = null;
                        }}
                      />
                    ) : (
                      <Icon name="image" size={32} />
                    )}
                  </div>

                  {/* 内容 */}
                  <div style={{ padding: '12px' }}>
                    <div style={{
                      fontSize: '13px', fontWeight: '500', color: '#111827',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      marginBottom: '8px'
                    }} title={item.product_name}>
                      {item.product_name || item.item_id}
                    </div>

                    {/* 指标行 */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ flex: 1, textAlign: 'center', padding: '6px 4px', background: '#f9fafb', borderRadius: '6px' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>访问</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: getVisitColor(item.unique_visits || 0) }}>
                          {item.unique_visits || 0}
                        </div>
                      </div>
                      <div style={{ flex: 1, textAlign: 'center', padding: '6px 4px', background: '#f9fafb', borderRadius: '6px' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>转化</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#4f46e5' }}>
                          {parseRate(item.visitor_convert_rate).toFixed(1)}%
                        </div>
                      </div>
                      <div style={{ flex: 1, textAlign: 'center', padding: '6px 4px', background: '#f9fafb', borderRadius: '6px' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>订单</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>
                          {item.order_count || 0}
                        </div>
                      </div>
                    </div>

                    {/* AI 标签 */}
                    <div style={{
                      display: 'inline-block', padding: '4px 10px', borderRadius: '12px',
                      fontSize: '12px', fontWeight: '500',
                      background: iss.bg, color: iss.color,
                      border: `1px solid ${iss.border}`
                    }}>
                      {item.ai_issue_type || '📈表现正常'}
                    </div>

                    <div style={{ marginTop: '8px', fontSize: '11px', color: '#9ca3af' }}>
                      SKU: {item.sku || '-'} · ID: {item.item_id}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
                padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db',
                background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer',
                color: page === 1 ? '#9ca3af' : '#374151'
              }}>上一页</button>
              <span style={{ padding: '8px 16px', color: '#6b7280', fontSize: '14px' }}>
                第 {page} / {totalPages} 页
              </span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{
                padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db',
                background: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                color: page === totalPages ? '#9ca3af' : '#374151'
              }}>下一页</button>
            </div>
          )}
        </>
      )}

      {/* 详情弹窗 */}
      {selectedItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }} onClick={() => setSelectedItem(null)}>
          <div style={{
            background: 'white', borderRadius: '12px', maxWidth: '560px', width: '100%',
            maxHeight: '90vh', overflow: 'auto', padding: '24px'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, flex: 1 }}>{selectedItem.product_name}</h3>
              <button onClick={() => setSelectedItem(null)} style={{
                background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '0 0 0 16px'
              }}>×</button>
            </div>

            {/* 左侧图片 + 右侧数据 */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              {(selectedItem.pictures?.[0] || selectedItem.thumbnail) && (
                <img src={selectedItem.pictures?.[0] || selectedItem.thumbnail} alt="" style={{
                  width: '180px', height: '180px', objectFit: 'contain', borderRadius: '8px', flexShrink: 0
                }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    ['访问量', selectedItem.unique_visits, '次'],
                    ['转化率', parseRate(selectedItem.visitor_convert_rate).toFixed(2), '%'],
                    ['订单数', selectedItem.order_count, '笔'],
                    ['已售', selectedItem.units_sold, '件'],
                    ['买家', selectedItem.unique_buyers, '人'],
                    ['销售额', selectedItem.gross_sales_usd, 'USD'],
                    ['占比', selectedItem.share_percent, ''],
                    ['状态', selectedItem.status, ''],
                  ].map(([label, val, unit]) => (
                    <div key={label} style={{ background: '#f9fafb', borderRadius: '6px', padding: '10px' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{label}</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{val ?? '-'} {unit}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI 诊断结果 */}
            {selectedItem.ai_issue_type && (
              <div style={{
                background: issueStyle(selectedItem.ai_issue_type).bg,
                border: `1px solid ${issueStyle(selectedItem.ai_issue_type).border}`,
                borderRadius: '8px', padding: '16px', marginBottom: '16px'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: issueStyle(selectedItem.ai_issue_type).color }}>
                  {selectedItem.ai_issue_type} · {selectedItem.ai_issue_desc || ''}
                </div>
                <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.6' }}>
                  💡 {selectedItem.ai_suggestion || '暂无优化建议'}
                </div>
              </div>
            )}

            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '12px' }}>
              SKU: {selectedItem.sku || '-'} · Item ID: {selectedItem.item_id}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

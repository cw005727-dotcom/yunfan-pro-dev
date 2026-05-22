import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Row, Col, Select, Spin, Empty, Segmented } from 'antd';
import { ShoppingCart, TrendingUp, Calendar, DollarSign, Wallet, Flame, XCircle } from 'lucide-react';
import { Line as AntLine, Pie } from '@ant-design/plots';

const API = '/api';
const PIE_COLORS = ['#5B8DEF', '#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF9F43', '#6C5CE7', '#00CEC9', '#FD79A8', '#636E72'];

function KPICard({ icon: IconComponent, label, value, sub, color, delay = 0 }) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-4 flex items-center gap-3 shadow-sm"
      style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`, animation: `fadeSlideUp 0.5s ease-out ${delay}ms both`, minHeight: 88 }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>
        <IconComponent size={18} color="white" strokeWidth={2.2} />
      </div>
      <div className="flex flex-col min-w-0">
        <div className="text-white text-2xl font-bold leading-none truncate">{value}</div>
        <div className="text-white text-xs font-medium mt-0.5 opacity-90 leading-tight">{label}</div>
        {sub && <div className="text-white text-xs mt-0.5 opacity-70 leading-tight">{sub}</div>}
      </div>
    </div>
  );
}

function StatCard({ icon: IconComponent, label, value, subValue, color, delay = 0 }) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-4 flex items-center gap-3 shadow-sm"
      style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`, animation: `fadeSlideUp 0.5s ease-out ${delay}ms both`, minHeight: 88 }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>
        <IconComponent size={18} color="white" strokeWidth={2.2} />
      </div>
      <div className="flex flex-col min-w-0">
        <div className="text-white text-2xl font-bold leading-none truncate">{value}</div>
        <div className="text-white text-xs font-medium mt-0.5 opacity-90 leading-tight">{label}</div>
        {subValue && <div className="text-white text-[10px] mt-0.5 opacity-70 leading-tight">{subValue}</div>}
      </div>
    </div>
  );
}

function CancelCard({ cancelPre, cancelPost, color = '#6366f1', delay = 0 }) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-4 flex items-center gap-4 shadow-sm"
      style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`, animation: `fadeSlideUp 0.5s ease-out ${delay}ms both`, minHeight: 88 }}>
      <div className="flex flex-col items-center flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <XCircle size={14} color="white" strokeWidth={2.2} />
          <span className="text-white text-xs opacity-80">发货前取消</span>
        </div>
        <div className="text-2xl font-bold text-white mt-1">{cancelPre}</div>
      </div>
      <div className="w-px h-10 bg-white bg-opacity-20" />
      <div className="flex flex-col items-center flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <XCircle size={14} color="white" strokeWidth={2.2} />
          <span className="text-white text-xs opacity-80">发货后取消</span>
        </div>
        <div className="text-2xl font-bold text-white mt-1">{cancelPost}</div>
      </div>
    </div>
  );
}

function TrendChart({ data, color, yField }) {
  if (!data || data.length === 0) return <Empty description="暂无数据" />;
  return (
    <div style={{ height: 160 }}>
      <AntLine data={data} xField="date" yField={yField} smooth
        point={{ size: 3, shape: 'circle', style: { fill: 'white', stroke: color, lineWidth: 2 } }}
        line={{ style: { lineWidth: 2.5, stroke: color } }}
        xAxis={{ label: { formatter: v => v.slice(5), style: { fill: '#94a3b8', fontSize: 10 } }, tickLine: null }}
        yAxis={{ label: { formatter: v => Math.round(v), style: { fill: '#94a3b8', fontSize: 10 } }, grid: { line: { style: { stroke: '#f1f5f9', lineDash: [4, 4] } } } }}
        tooltip={{ channel: 'y', valueFormatter: v => `${Math.round(v)}` }}
        animation={{ appear: { animation: 'wave-in', duration: 600 } }}
      />
    </div>
  );
}

function DonutChart({ data, label, pieView }) {
  if (!data || data.length === 0) return <Empty description="暂无数据" />;
  const chartData = data.filter(d => (d.value || 0) > 0);
  if (chartData.length === 0) return <Empty description="暂无数据" />;
  const total = chartData.reduce((s, d) => s + Math.abs(d.value || 0), 0);
  return (
    <div style={{ height: 240, width: '100%' }}>
      <Pie data={chartData} angleField="value" colorField="name"
        radius={0.85} innerRadius={0.62}
        forceFit
        legend={{ position: 'right', itemName: { style: { fontSize: 11 } } }}
        label={false} color={PIE_COLORS}
        tooltip={{ items: [(item) => ({ name: item.name, value: '¥' + Number(item.value).toLocaleString() })] }}
        animation={{ appear: { duration: 600 } }}
        statistic={{
          title: { content: '合计', style: { fontSize: 12, color: '#64748b', fontWeight: 500 } },
          content: { content: `${label}${total.toLocaleString()}`, style: { fontSize: 16, fontWeight: 700, color: '#1e293b' } }
        }}
      />
    </div>
  );
}

function fmt(v) {
  if (v == null || v === '') return '-';
  return Number(v).toLocaleString();
}

function marginTag(pct) {
  if (pct == null) return <span className="text-white text-2xl font-bold">-</span>;
  return <span className="text-white text-2xl font-bold">{pct}%</span>;
}

export default function StoreDataView() {
  const [loading, setLoading] = useState(true);
  const [salespersons, setSalespersons] = useState([]);
  const [sites, setSites] = useState([]);
  const [storeNames, setStoreNames] = useState([]);
  const [selectedSalesperson, setSelectedSalesperson] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedStoreName, setSelectedStoreName] = useState(null);
  const [stats, setStats] = useState(null);
  const [daily, setDaily] = useState([]);
  const [storeStats, setStoreStats] = useState([]);
  const [pieView, setPieView] = useState('site');
  const [rankView, setRankView] = useState('profit');

  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7) + '-01';
  const monthlyDaily = daily.filter(d => d.date >= monthStart);
  const ordersTrend = monthlyDaily.map(d => ({ date: d.date.slice(5), '订单量': d.order_count }));
  const profitTrend = monthlyDaily.map(d => ({ date: d.date.slice(5), '利润': Math.round(d.profit_cny) }));

  const sitePieData = useMemo(() => {
    // country -> {profit, salespersons, stores}
    const map = {};
    storeStats.forEach(s => {
      const k = s.site || '未知';
      if (!map[k]) map[k] = { profit: 0, salespersons: new Set(), stores: new Set() };
      map[k].profit += s.profit_cny;
      if (s.salesperson) map[k].salespersons.add(s.salesperson);
      if (s.store_name) map[k].stores.add(s.store_name);
    });
    return Object.entries(map).map(([name, info]) => ({
      name,
      value: Math.round(info.profit * 100) / 100,
      extra1: Array.from(info.stores).join(', ') || '-',
      extra2: Array.from(info.salespersons).join(', ') || '-'
    })).sort((a, b) => b.value - a.value);
  }, [storeStats]);

  const storePieData = useMemo(() => {
    return storeStats.map(s => ({
      name: s.store_name || '未知',
      value: Math.round(Math.abs(s.profit_cny) * 100) / 100,
      extra1: s.site || '-',
      extra2: s.salesperson || '-'
    })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
  }, [storeStats]);

  const salespersonPieData = useMemo(() => {
    const map = {};
    storeStats.forEach(s => {
      const k = s.salesperson || '未知';
      if (!map[k]) map[k] = { profit: 0, stores: new Set(), sites: new Set() };
      map[k].profit += s.profit_cny;
      if (s.store_name) map[k].stores.add(s.store_name);
      if (s.site) map[k].sites.add(s.site);
    });
    return Object.entries(map).map(([name, info]) => ({
      name,
      value: Math.round(info.profit * 100) / 100,
      extra1: Array.from(info.stores).join(', ') || '-',
      extra2: Array.from(info.sites).join(', ') || '-'
    })).sort((a, b) => b.value - a.value);
  }, [storeStats]);

  const currentPieData = useMemo(() => {
    if (pieView === 'site') return sitePieData;
    if (pieView === 'store') return storePieData;
    return salespersonPieData;
  }, [pieView, sitePieData, storePieData, salespersonPieData]);

  // 排行榜数据（按运营分组）
  const salespersonRank = useMemo(() => {
    const map = {};
    storeStats.forEach(s => {
      const k = s.salesperson || '未知';
      if (!map[k]) map[k] = { profit: 0, orders: 0, costs: 0 };
      map[k].profit += s.profit_cny;
      map[k].orders += s.order_count || 0;
      map[k].costs += s.purchase_cost || 0;
    });
    return Object.entries(map).map(([name, info]) => ({
      name,
      profit: Math.round(info.profit * 100) / 100,
      orders: info.orders,
      margin: info.costs > 0 ? Math.round(info.profit / info.costs * 10000) / 100 : 0
    })).sort((a, b) => b.profit - a.profit);
  }, [storeStats]);

  const getRankList = (type) => {
    const sorted = type === 'profit' ? [...salespersonRank].sort((a,b) => b.profit - a.profit)
                : type === 'margin' ? [...salespersonRank].sort((a,b) => b.margin - a.margin)
                : [...salespersonRank].sort((a,b) => b.orders - a.orders);
    return sorted.slice(0, 3);
  };

  const podiumColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
  const podiumEmoji = ['🥇', '🥈', '🥉'];

  useEffect(() => {
    fetch(`${API}/operational/sites`).then(r => r.json()).then(d => setSites(d.sites || []));
    fetch(`${API}/operational/salespersons`).then(r => r.json()).then(d => setSalespersons(d.salespersons || []));
  }, []);

  useEffect(() => {
    const params = {};
    if (selectedSite) params.site = selectedSite;
    if (selectedSalesperson) params.salesperson = selectedSalesperson;
    const qs = new URLSearchParams(params).toString();
    fetch(`${API}/operational/store-names${qs ? '?' + qs : ''}`).then(r => r.json()).then(d => setStoreNames(d.store_names || []));
    setSelectedStoreName(null);
  }, [selectedSite, selectedSalesperson]);

  const fetchData = useCallback(() => {
    const params = {};
    if (selectedSalesperson) params.salesperson = selectedSalesperson;
    if (selectedSite) params.site = selectedSite;
    if (selectedStoreName) params.store_name = selectedStoreName;
    const qs = new URLSearchParams(params).toString();
    Promise.all([
      fetch(`${API}/operational/stats${qs ? '?' + qs : ''}`).then(r => r.json()),
      fetch(`${API}/operational/daily${qs ? '?' + qs : ''}`).then(r => r.json()),
      fetch(`${API}/operational/stores${qs ? '?' + qs : ''}`).then(r => r.json()),
    ]).then(([s, d, st]) => { setStats(s); setDaily(d.daily || []); setStoreStats(st.stores || []); })
      .catch(err => console.error(err)).finally(() => setLoading(false));
  }, [selectedSalesperson, selectedSite, selectedStoreName]);

  useEffect(() => { setLoading(true); fetchData(); }, [fetchData]);

  return (
    <div className="h-full flex flex-col" style={{ background: '#F8FAFC' }}>
      <style>{`@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div className="h-[52px] border-b border-slate-100 flex items-center justify-between px-6 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <h2 className="text-[15px] font-bold text-slate-800">店铺数据中心</h2>
        </div>
        <div className="flex items-center gap-3">
          <Select allowClear placeholder="全部业务员" style={{ width: 130 }} size="small" value={selectedSalesperson}
            onChange={v => setSelectedSalesperson(v || null)} options={salespersons.map(s => ({ label: s, value: s }))} />
          <Select allowClear placeholder="全部站点" style={{ width: 130 }} size="small" value={selectedSite}
            onChange={v => setSelectedSite(v || null)} options={sites.map(s => ({ label: s, value: s }))} />
          <Select allowClear placeholder="全部店铺" style={{ width: 130 }} size="small" value={selectedStoreName}
            onChange={v => setSelectedStoreName(v || null)} options={storeNames.map(s => ({ label: s, value: s }))} />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading && stats && <div style={{position:'absolute',top:14,right:6}}><Spin size="small" /></div>}

        {/* ── 累计 ── */}
        <div className="mb-1 px-1 flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-blue-500" />
          <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">累计</span>
        </div>
        <div className="flex gap-2.5 mb-3">
          <div className="flex-1"><KPICard icon={ShoppingCart} label="总 件 数" value={fmt(stats?.total_orders)} color="#3b82f6" delay={0} /></div>
          <div className="flex-1"><KPICard icon={DollarSign} label="总 GMV" value={`$${fmt(stats?.total_gmv)}`} sub="USD" color="#10b981" delay={60} /></div>
          <div className="flex-1"><KPICard icon={Wallet} label="总 利 润" value={`¥${fmt(stats?.total_profit)}`} sub="CNY" color="#6366f1" delay={120} /></div>
          <div className="flex-1"><StatCard icon={TrendingUp} label="利润率" value={marginTag(stats?.total_margin)} subValue={`采购成本 ¥${fmt(stats?.total_purchase_cost)}`} color="#f59e0b" delay={180} /></div>
          <div className="flex-1"><CancelCard cancelPre={stats?.total_cancel_pre ?? 0} cancelPost={stats?.total_cancel_post ?? 0} color="#f43f5e" delay={240} /></div>
        </div>

        {/* ── 本月 ── */}
        <div className="mb-1 px-1 flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-amber-400" />
          <span className="text-xs font-bold text-amber-600 tracking-widest uppercase">本月</span>
        </div>
        <div className="flex gap-2.5 mb-3">
          <div className="flex-1"><KPICard icon={Calendar} label="本月件数" value={fmt(stats?.monthly_orders)} color="#3b82f6" delay={0} /></div>
          <div className="flex-1"><KPICard icon={DollarSign} label="本月 GMV" value={`$${fmt(stats?.monthly_gmv)}`} sub="USD" color="#10b981" delay={60} /></div>
          <div className="flex-1"><KPICard icon={Wallet} label="本月利润" value={`¥${fmt(stats?.monthly_profit)}`} sub="CNY" color="#6366f1" delay={120} /></div>
          <div className="flex-1"><StatCard icon={TrendingUp} label="利润率" value={marginTag(stats?.monthly_margin)} subValue={`采购成本 ¥${fmt(stats?.monthly_purchase_cost)}`} color="#f59e0b" delay={180} /></div>
          <div className="flex-1"><CancelCard cancelPre={stats?.monthly_cancel_pre ?? 0} cancelPost={stats?.monthly_cancel_post ?? 0} color="#f43f5e" delay={240} /></div>
        </div>

        {/* ── 今日 ── */}
        <div className="mb-1 px-1 flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-rose-400" />
          <span className="text-xs font-bold text-rose-500 tracking-widest uppercase">今日</span>
        </div>
        <div className="flex gap-2.5 mb-4">
          <div className="flex-1"><KPICard icon={Flame} label="今日件数" value={fmt(stats?.today_orders)} color="#3b82f6" delay={0} /></div>
          <div className="flex-1"><KPICard icon={DollarSign} label="今日 GMV" value={`$${fmt(stats?.today_gmv)}`} sub="USD" color="#10b981" delay={60} /></div>
          <div className="flex-1"><KPICard icon={Wallet} label="今日利润" value={`¥${fmt(stats?.today_profit)}`} sub="CNY" color="#6366f1" delay={120} /></div>
          <div className="flex-1"><StatCard icon={TrendingUp} label="利润率" value={marginTag(stats?.today_margin)} subValue={`采购成本 ¥${fmt(stats?.today_purchase_cost)}`} color="#f59e0b" delay={180} /></div>
          <div className="flex-1"><CancelCard cancelPre={stats?.today_cancel_pre ?? 0} cancelPost={stats?.today_cancel_post ?? 0} color="#f43f5e" delay={240} /></div>
        </div>

        {/* ── 图表 ── */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} lg={12}>
            <Card bordered={false} className="shadow-sm rounded-2xl" headStyle={{ borderBottom: 'none', padding: '16px 20px 0' }} bodyStyle={{ padding: '12px 20px 16px',  }} title={<span className="text-sm font-semibold text-slate-700">本月每日订单量走势</span>}>
              <TrendChart data={ordersTrend} color="#5B8DEF" yField="订单量" />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card bordered={false} className="shadow-sm rounded-2xl" headStyle={{ borderBottom: 'none', padding: '16px 20px 0' }} bodyStyle={{ padding: '12px 20px 16px',  }} title={<span className="text-sm font-semibold text-slate-700">本月每日利润走势</span>}>
              <TrendChart data={profitTrend} color="#43e97b" yField="利润" />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} lg={12}>
            <Card bordered={false} className="shadow-sm rounded-2xl"
              headStyle={{ borderBottom: 'none', padding: '16px 20px 0' }} bodyStyle={{ padding: '12px 20px 16px', minHeight: 300 }}
              title={<span className="text-sm font-semibold text-slate-700">利润占比</span>}
              extra={<Segmented size="small" value={pieView} onChange={setPieView}
                options={[{label:'按国家',value:'site'},{label:'按店铺',value:'store'},{label:'按运营',value:'salesperson'}]} />}
            >
              <DonutChart data={currentPieData} pieView={pieView} label="¥" />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card bordered={false} className="shadow-sm rounded-2xl"
              headStyle={{ borderBottom: 'none', padding: '16px 20px 0' }} bodyStyle={{ padding: '12px 20px 16px', minHeight: 300 }}
              title={<span className="text-sm font-semibold text-slate-700">排行榜</span>}
              extra={<Segmented size="small" value={rankView} onChange={setRankView}
                options={[{label:'利润',value:'profit'},{label:'利润率',value:'margin'},{label:'件数',value:'orders'}]} />}
            >
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16, height: 200, padding: '0 20px', animation: 'fadeSlideUp 0.5s ease-out both' }}>
                {(() => {
                  const ranks = getRankList(rankView);
                  const maxV = rankView === 'profit' ? Math.max(...ranks.map(r => r.profit), 1)
                             : rankView === 'margin' ? Math.max(...ranks.map(r => r.margin), 1)
                             : Math.max(...ranks.map(r => r.orders), 1);
                  return ranks.map((r, i) => {
                    const v = rankView === 'profit' ? r.profit : rankView === 'margin' ? r.margin : r.orders;
                    const h = maxV > 0 ? Math.max(Math.round(v / maxV * 140), 40) : 40;
                    const label = rankView === 'profit' ? `¥${v.toLocaleString()}` : rankView === 'margin' ? `${v}%` : `${v}件`;
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: 24, marginBottom: 4 }}>{podiumEmoji[i]}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6, textAlign: 'center' }}>{r.name}</div>
                        <div style={{
                          width: '100%', background: podiumColors[i],
                          borderRadius: '8px 8px 4px 4px', height: h,
                          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 8
                        }}>
                          <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>{label}</span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Row, Col, Select, Spin, Empty, Segmented, Tooltip as AntTooltip } from 'antd';
import { 
  ShoppingCart, TrendingUp, Calendar, DollarSign, 
  Wallet, Flame, XCircle, ArrowUpRight, ChevronRight, RefreshCw, User, Globe, Clock, AlertCircle
} from 'lucide-react';
import { Line as AntLine, Pie } from '@ant-design/plots';

const API = '/api';
const PIE_COLORS = ['#10b981', '#3b82f6', '#6366f1', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#475569'];

const V5_STYLES = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .v5-glass-card {
    background: white;
    border: 1px solid rgba(16, 173, 111, 0.08);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
    transition: all 0.3s ease;
    overflow: hidden;
  }
  .v5-segmented .ant-segmented-item-selected {
    background: #10b981 !important;
    color: white !important;
    font-weight: 900 !important;
  }
  .v5-segmented {
    background: #f1f5f9 !important;
    padding: 2px !important;
    border-radius: 8px !important;
  }
  .v5-filter-label {
    font-size: 8px;
    font-weight: 900;
    color: #94a3b8;
    margin-bottom: 2px;
    text-transform: uppercase;
  }
  /* 强制图表容器不溢出 */
  .chart-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
  }
`;

function KPIBlockMini({ label, value, sub, colorClass, delay = 0 }) {
  return (
    <div 
      className={`rounded-xl p-4 flex flex-col justify-between border shadow-sm ${colorClass}`}
      style={{ animation: `fadeSlideUp 0.5s ease-out ${delay}ms both` }}
    >
      <div className="text-[10px] font-black opacity-60 uppercase tracking-widest leading-none">{label}</div>
      <div className="mt-2">
        <div className="text-[20px] font-black tracking-tight leading-none">{value}</div>
        {sub && <div className="text-[10px] font-bold opacity-40 mt-1 leading-none">{sub}</div>}
      </div>
    </div>
  );
}

function MainProfitCard({ stats, daily, delay = 0 }) {
  const value = Number(stats?.today_profit || 0).toLocaleString();
  const gmv = Number(stats?.today_gmv || 0).toLocaleString();
  
  // 计算昨日利润并对比
  const growth = useMemo(() => {
    if (!daily || daily.length < 2) return '0.00';
    const sorted = [...daily].sort((a,b) => b.date.localeCompare(a.date));
    const today = sorted[0]?.profit_cny || 0;
    const yesterday = sorted[1]?.profit_cny || 0;
    if (yesterday === 0) return today > 0 ? '+100' : '0.00';
    const rate = ((today - yesterday) / Math.abs(yesterday)) * 100;
    return rate.toFixed(2);
  }, [daily]);

  const isPositive = parseFloat(growth) >= 0;

  return (
    <div 
      className="h-full bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-emerald-200/50"
      style={{ animation: `fadeSlideUp 0.5s ease-out ${delay}ms both` }}
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl -mr-24 -mt-24" />
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span className="text-[11px] font-black text-emerald-100/90 tracking-[2px]">REALTIME / 今日净利</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-white text-4xl font-black">¥ {value}</span>
            <AntTooltip title={`昨日全天利润: ¥${daily[daily.length-2]?.profit_cny || 0}`}>
              <div className={`px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-black flex items-center gap-1 cursor-help`}>
                {isPositive ? <ArrowUpRight size={12} strokeWidth={3} /> : <div className="rotate-90"><ArrowUpRight size={12} strokeWidth={3} /></div>}
                {growth}%
              </div>
            </AntTooltip>
          </div>
          <div className="mt-1 text-[10px] font-bold text-emerald-200/60 uppercase tracking-wider">今日日环比 (VS 昨日全天)</div>
        </div>
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center opacity-80">
           <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">今日总成交 (GMV)</span>
           <span className="text-[14px] font-black text-white">$ {gmv}</span>
        </div>
      </div>
    </div>
  );
}

function fmt(v) {
  if (v == null || v === '') return '0';
  return Number(v).toLocaleString();
}

function RankRow({ index, name, value, sub, max }) {
  const percent = Math.min((value / max) * 100, 100);
  // 为前三名设置不同的配色方案
  const rankConfigs = [
    { bg: 'bg-emerald-600', text: 'text-emerald-600', light: 'bg-emerald-50' }, // #1
    { bg: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-50' },       // #2
    { bg: 'bg-amber-500', text: 'text-amber-500', light: 'bg-amber-50' },     // #3
    { bg: 'bg-slate-400', text: 'text-slate-400', light: 'bg-slate-50' },     // #4+
  ];
  const config = rankConfigs[index] || rankConfigs[3];

  return (
    <div className="mb-6 group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-lg ${config.bg} text-white text-[10px] font-black flex items-center justify-center italic shadow-sm`}>
            #{index + 1}
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-black text-slate-800">{name}</span>
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">TOP OPERATOR</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-[15px] font-black ${index < 3 ? config.text : 'text-slate-900'}`}>{sub}</div>
        </div>
      </div>
      <div className={`h-2.5 w-full ${config.light} rounded-full overflow-hidden p-[2px]`}>
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${config.bg}`} 
          style={{ width: `${percent}%` }} 
        />
      </div>
    </div>
  );
}

export default function StoreDataView_V5() {
  const [loading, setLoading] = useState(true);
  const [salespersons, setSalespersons] = useState([]);
  const [sites, setSites] = useState([]);
  const [storeNames, setStoreNames] = useState([]);
  const [selectedSalesperson, setSelectedSalesperson] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedStoreName, setSelectedStoreName] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('今日');
  
  const [stats, setStats] = useState(null);
  const [daily, setDaily] = useState([]);
  const [storeStats, setStoreStats] = useState([]);
  const [pieView, setPieView] = useState('site');
  const [rankView, setRankView] = useState('profit');
  const SITE_NAMES = { MLB: '🇧🇷 巴西', MLM: '🇲🇽 墨西哥', MLA: '🇦🇷 阿根廷', MLC: '🇨🇱 智利', MCO: '🇨🇴 哥伦比亚', MLU: '🇺🇾 乌拉圭' };
  const STATS_MAP = {
    '今日': { profit: 'today_profit', orders: 'today_orders', gmv: 'today_gmv', margin: 'today_margin', label: '今日' },
    '本周': { profit: 'week_profit', orders: 'week_orders', gmv: 'week_gmv', margin: 'week_margin', label: '本周' },
    '本月': { profit: 'monthly_profit', orders: 'monthly_orders', gmv: 'monthly_gmv', margin: 'monthly_margin', label: '本月' },
    '上月': { profit: 'last_month_profit', orders: 'last_month_orders', gmv: 'last_month_gmv', margin: 'last_month_margin', label: '上月' },
    '全年': { profit: 'year_profit', orders: 'year_orders', gmv: 'year_gmv', margin: 'year_margin', label: '全年' },
  };
  const s = STATS_MAP[selectedTimeRange] || STATS_MAP['今日'];
  const stat = (field) => stats ? (stats[s[field]] ?? 0) : 0;

  const fetchData = useCallback(() => {
    const params = {};
    if (selectedSalesperson) params.salesperson = selectedSalesperson;
    if (selectedSite) params.site = selectedSite;
    if (selectedStoreName) params.store_name = selectedStoreName;
    const today = new Date();
    if (selectedTimeRange === '今日') {
      const t = today.toISOString().slice(0,10);
      params.date_from = t; params.date_to = t;
    } else if (selectedTimeRange === '本周') {
      const dayOfWeek = today.getDay() || 7;
      const monday = new Date(today); monday.setDate(today.getDate() - dayOfWeek + 1);
      params.date_from = monday.toISOString().slice(0,10);
      params.date_to = today.toISOString().slice(0,10);
    } else if (selectedTimeRange === '本月') {
      params.date_from = today.toISOString().slice(0,7) + '-01';
      params.date_to = today.toISOString().slice(0,10);
    } else if (selectedTimeRange === '上月') {
      const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayLastMonth = new Date(firstDayThisMonth.getTime() - 86400000);
      const firstDayLastMonth = new Date(lastDayLastMonth.getFullYear(), lastDayLastMonth.getMonth(), 1);
      params.date_from = firstDayLastMonth.toISOString().slice(0,10);
      params.date_to = lastDayLastMonth.toISOString().slice(0,10);
    } else if (selectedTimeRange === '全年') {
      params.date_from = today.getFullYear() + '-01-01';
      params.date_to = today.toISOString().slice(0,10);
    }
    
    const qs = new URLSearchParams(params).toString();
    setLoading(true);
    
    Promise.all([
      fetch(`${API}/operational/stats?${qs}`).then(r => r.json()),
      fetch(`${API}/operational/daily?${qs}`).then(r => r.json()),
      fetch(`${API}/operational/stores?${qs}`).then(r => r.json()),
    ]).then(([s, d, st]) => { 
      setStats(s); 
      setDaily(d.daily || []); 
      setStoreStats(st.stores || []); 
    }).catch(err => console.error(err)).finally(() => setLoading(false));
  }, [selectedSalesperson, selectedSite, selectedStoreName, selectedTimeRange]);

  useEffect(() => {
    fetch(`${API}/operational/sites`).then(r => r.json()).then(d => setSites(d.sites || []));
    fetch(`${API}/operational/salespersons`).then(r => r.json()).then(d => setSalespersons(d.salespersons || []));
    fetchData();
  }, [fetchData]);

  // 趋势图数据：混合双线
  const combinedTrendData = useMemo(() => {
    const data = [];
    (daily || []).forEach(d => {
      data.push({ date: d.date.slice(5), value: Math.round(d.profit_cny), type: '利润 (¥)' });
      // 订单量放大 10 倍以适配坐标轴展示，但显示真实数值
      data.push({ date: d.date.slice(5), value: d.order_count * 50, realValue: d.order_count, type: '订单量 (件)' });
    });
    return data;
  }, [daily]);

  const currentPieData = useMemo(() => {
    const map = {};
    (storeStats || []).forEach(s => {
      const k = pieView === 'site' ? (s.site || '未知') : pieView === 'store' ? (s.store_name || '未知') : (s.salesperson || '未知');
      if (!map[k]) map[k] = { value: 0 };
      map[k].value += Math.round(Math.abs(s.profit_cny));
    });
    return Object.entries(map).map(([name, info]) => ({ name, value: info.value })).sort((a, b) => b.value - a.value);
  }, [pieView, storeStats]);

  const currentRankList = useMemo(() => {
    const map = {};
    (storeStats || []).forEach(s => {
      const name = s.salesperson || '未知';
      if (!map[name]) map[name] = { profit: 0, orders: 0, cost: 0 };
      map[name].profit += s.profit_cny || 0;
      map[name].orders += s.order_count || 0;
      map[name].cost += s.purchase_cost || 0;
    });

    const list = Object.entries(map).map(([name, data]) => ({
       name,
       profit: Math.round(data.profit),
       orders: data.orders,
       margin: data.cost > 0 ? Math.round((data.profit / data.cost) * 100) : 0
    })).sort((a,b) => b[rankView] - a[rankView]);
    
    return list.slice(0, 5);
  }, [rankView, storeStats]);

  return (
    <div className="h-full bg-slate-50 flex flex-col overflow-hidden font-sans select-none">
      <style dangerouslySetInnerHTML={{ __html: V5_STYLES }} />
      
      {/* ── 1. 控制塔 ── */}
      <div className="h-[75px] bg-white border-b border-slate-200 border-t-[3px] border-t-emerald-600 px-6 flex items-center justify-between shrink-0 relative z-50 shadow-sm">
        <div className="flex flex-col">
          <h2 className="text-[18px] font-black text-slate-800 tracking-tight">数据全域驾驶舱 V5</h2>
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-[1.5px]">Aether Analytics System</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col"><div className="v5-filter-label">站点 / SITE</div><Select allowClear placeholder="全部站点" className="w-[110px]" size="small" variant="filled" value={selectedSite} onChange={setSelectedSite} options={sites.map(s => ({ label: SITE_NAMES[s] || s, value: s }))} /></div>
          <div className="flex flex-col"><div className="v5-filter-label">运营 / STAFF</div><Select allowClear placeholder="全部运营" className="w-[110px]" size="small" variant="filled" value={selectedSalesperson} onChange={setSelectedSalesperson} options={salespersons.map(s => ({ label: s, value: s }))} /></div>
          <div className="flex flex-col"><div className="v5-filter-label">维度 / RANGE</div><Segmented size="small" value={selectedTimeRange} onChange={setSelectedTimeRange} className="v5-segmented" options={['今日', '本周', '本月', '上月', '全年']} /></div>
          <button onClick={fetchData} className="h-[36px] px-5 bg-emerald-600 text-white rounded-lg flex items-center gap-2 text-[11px] font-black hover:bg-emerald-700 transition-all active:scale-95"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} />同步实时数据</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 v5-scrollbar-hide">
        {/* KPI 矩阵 */}
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 xl:col-span-4"><MainProfitCard stats={stats} daily={daily} /></div>
          <div className="col-span-12 xl:col-span-5 grid grid-cols-2 gap-4">
             <KPIBlockMini label={`${s.label}净利`} value={`¥${fmt(stat('profit'))}`} sub="CNY" colorClass="bg-emerald-50 border-emerald-100 text-emerald-700" delay={100} />
             <KPIBlockMini label={`${s.label}订单件数`} value={`${fmt(stat('orders'))} 件`} sub="" colorClass="bg-blue-50 border-blue-100 text-blue-700" delay={200} />
             <KPIBlockMini label={`${s.label}总GMV`} value={`$${fmt(stat('gmv'))}`} sub="USD" colorClass="bg-indigo-50 border-indigo-100 text-indigo-700" delay={300} />
             <KPIBlockMini label="平均利润率" value={`${stat('margin') || 0}%`} sub="AVG MARGIN" colorClass="bg-amber-50 border-amber-100 text-amber-700" delay={400} />
          </div>
          <div className="col-span-12 xl:col-span-3">
             <div className="h-full bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                   <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">取消率监控 <AntTooltip title={`计算公式: 本期取消订单 / 本期总订单 (${s.label})`}><AlertCircle size={12} /></AntTooltip></div>
                   <div className="text-[42px] font-black text-rose-600 leading-none mb-1">{stats ? (stats[`${s.label === '今日' ? 'today' : s.label === '本周' ? 'week' : s.label === '本月' ? 'monthly' : s.label === '上月' ? 'last_month' : 'year'}_cancel_rate`] || 0) : 0}%</div>
                </div>
                <div className="pt-4 border-t border-slate-50">
                   <div className="text-[12px] font-bold text-slate-500 flex items-center gap-1">低于类目阈值 <ArrowUpRight size={14} className="text-rose-500" strokeWidth={3} /></div>
                   <div className="mt-1 text-[8px] text-slate-300 font-bold uppercase tracking-widest">Calculated by {s.label}</div>
                </div>
             </div>
          </div>
        </div>

        {/* 订正版走势图 */}
        <div className="v5-glass-card rounded-2xl p-6 h-[300px] flex flex-col">
           <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                 <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">业务增长能效趋势 (利润 vs 订单)</h3>
              </div>
           </div>
           <div className="flex-1 min-h-0 chart-container">
             <AntLine 
                data={combinedTrendData} 
                xField="date" 
                yField="value" 
                colorField="type"
                shapeField="smooth"
                color={['#10b981', '#3b82f6']}
                line={{ style: { lineWidth: 3 } }}
                point={{ size: 4, shape: 'circle' }}
                label={{ 
                  text: (d) => d.type === '利润 (¥)' ? `¥${d.value}` : `${d.realValue}`,
                  style: { fontSize: 10, fontWeight: 900, fill: '#64748b', dy: -12 },
                }}
                legend={{ position: 'top', layout: { justifyContent: 'flex-end' } }}
                tooltip={{ 
                   items: [
                     (d) => ({
                       name: d.type,
                       value: d.type === '利润 (¥)' ? `¥${d.value}` : `${d.realValue}件`,
                     })
                   ]
                }}
                axis={{
                  y: { labelFormatter: (v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v }
                }}
             />
           </div>
        </div>

        {/* 底部双子模块 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
           <div className="v5-glass-card rounded-2xl p-6 flex flex-col h-[360px]">
              <div className="flex items-center justify-between mb-8 shrink-0">
                 <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">利润贡献分布</h3>
                 <Segmented size="small" value={pieView} onChange={setPieView} className="v5-segmented" options={[{ label: '国家', value: 'site' }, { label: '店铺', value: 'store' }, { label: '运营', value: 'salesperson' }]} />
              </div>
              <div className="flex-1 min-h-0 chart-container flex items-center justify-center">
                 <div className="w-full h-full">
                   <Pie 
                    data={currentPieData} 
                    angleField="value" 
                    colorField="name" 
                    radius={0.85} 
                    innerRadius={0.65} 
                    color={PIE_COLORS}
                    padding={[0, 100, 0, 0]}
                    legend={{ 
                      position: 'right', 
                      layout: { justifyContent: 'center' },
                      itemLabel: { style: { fontSize: 11, fontWeight: 700, fill: '#475569' } } 
                    }}
                    label={{ 
                      text: (d) => d.percent > 0.05 ? `${(d.percent * 100).toFixed(0)}%` : '',
                      position: 'inner',
                      style: { fontSize: 10, fontWeight: 900, fill: '#fff', textAlign: 'center' }
                    }}
                    tooltip={{
                      items: [(d) => ({ name: d.name, value: `¥${fmt(d.value)}` })]
                    }}
                    annotations={[
                      {
                        type: 'text',
                        style: {
                          text: '总利润',
                          x: '50%',
                          y: '45%',
                          textAlign: 'center',
                          fontSize: 10,
                          fill: '#94a3b8',
                          fontWeight: 900,
                        },
                      },
                      {
                        type: 'text',
                        style: {
                          text: `¥${fmt(stats?.monthly_profit)}`,
                          x: '50%',
                          y: '55%',
                          textAlign: 'center',
                          fontSize: 16,
                          fontWeight: 900,
                          fill: '#1e293b',
                        },
                      }
                    ]}
                   />
                 </div>
              </div>
           </div>
           
           <div className="v5-glass-card rounded-2xl p-6 flex flex-col h-[360px]">
              <div className="flex items-center justify-between mb-8 shrink-0">
                 <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">排行榜 (TOP 5)</h3>
                 <Segmented size="small" value={rankView} onChange={setRankView} className="v5-segmented" options={[{ label: '利润', value: 'profit' }, { label: '利润率', value: 'margin' }, { label: '件数', value: 'orders' }]} />
              </div>
              <div className="flex-1 overflow-y-auto pr-2 v5-scrollbar-hide">
                {currentRankList.map((r, i) => {
                  const val = rankView === 'profit' ? r.profit : rankView === 'margin' ? r.margin : r.orders;
                  const sub = rankView === 'profit' ? `¥${fmt(r.profit)}` : rankView === 'margin' ? `${r.margin}%` : `${fmt(r.orders)}件`;
                  const max = Math.max(...currentRankList.map(item => item[rankView]), 1);
                  return <RankRow key={i} index={i} name={r.name} value={val} sub={sub} max={max} />;
                })}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

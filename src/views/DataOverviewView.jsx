import { useState, useEffect, useRef, useMemo } from 'react';
import Icon from '../components/Icon.jsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  ArcElement
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  ArcElement
);

const SITE_MAP = {
  'ALL': '全站聚合',
  'MLM': '🇲🇽 墨西哥', 'MLB': '🇧🇷 巴西', 'MLA': '🇦🇷 阿根廷',
  'MCO': '🇨🇴 哥伦比亚', 'MLC': '🇨🇱 智利', 'MLU': '🇺🇾 乌拉圭',
};
const API_BASE = '/api';
const DATE_OPTIONS = [{ label: '近7天', value: 7 }, { label: '近30天', value: 30 }, { label: '近90天', value: 90 }];

function useShops() {
  const [shops, setShops] = useState(['大姐店']);
  useEffect(() => {
    fetch(`${API_BASE}/shops`, { headers: { 'X-Admin-Token': 'YUNFAN_ADMIN_2026' } })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length) setShops(data); })
      .catch(() => {});
  }, []);
  return shops;
}

function useCountUp(target, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [target]);
  return value;
}

// ─── 仪表盘组件 ────────────────────────────────────────────────────────────

const MetricCard = ({ label, value, trend, icon: IconComponent, color, prefix = "" }) => (
  <div className="glass-effect rounded-[24px] p-6 border border-white/20 shadow-lg relative overflow-hidden group">
    <div className={`absolute inset-0 bg-gradient-to-br from-${color}-50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity`} />
    <div className="relative flex justify-between items-start">
      <div>
        <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mb-1.5 whitespace-nowrap">{label}</p>
        <div className="flex items-baseline gap-1 overflow-hidden">
          <span className="text-2xl font-black tnum text-slate-900 truncate">{prefix}{value}</span>
        </div>
        <div className="mt-3">
          <TrendBadge value={trend} />
        </div>
      </div>
      <div className={`w-12 h-12 rounded-2xl bg-${color}-500 flex items-center justify-center shadow-lg shadow-${color}-200 shrink-0`}>
        <IconComponent className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

function TrendBadge({ value }) {
  if (value === undefined || value === null) return null;
  const isUp = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-black px-2 py-0.5 rounded-full whitespace-nowrap ${isUp ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
      <Icon name={isUp ? 'trending-up' : 'trending-down'} className="w-3 h-3" />
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + (d.gmv || 0), 0);
  if (total === 0) return <div className="h-40 flex items-center justify-center text-slate-500 text-[11px] font-bold uppercase">无数据</div>;
  
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          {data.reduce((acc, d, i) => {
            const pct = (d.gmv || 0) / total;
            const offset = acc.offset;
            acc.elements.push(
              <circle
                key={i}
                cx="50" cy="50" r="40"
                fill="none"
                stroke={COLORS[i % COLORS.length]}
                strokeWidth="14"
                strokeDasharray={`${pct * 251.2} 251.2`}
                strokeDashoffset={-offset * 251.2}
                className="transition-all duration-1000"
              />
            );
            acc.offset += pct;
            return acc;
          }, { elements: [], offset: 0 }).elements}
          <circle cx="50" cy="50" r="33" fill="white" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest leading-none">Total</p>
          <p className="text-sm font-black text-slate-900 mt-1">${(total/1000).toFixed(1)}k</p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 w-full px-4">
        {data.map((s, i) => (
          <div key={i} className="flex items-center justify-between gap-2 border-b border-slate-50 pb-1">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="text-[11px] text-slate-500 font-bold truncate uppercase">{SITE_MAP[s.name]?.split(' ')[1] || s.name}</span>
            </div>
            <span className="text-[11px] text-slate-900 font-black tnum">{( (s.gmv/total)*100 ).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 主视图 ──────────────────────────────────────────────────────────────

export default function DataOverviewView() {
  const [dateRange, setDateRange] = useState(30);
  const [filter, setFilter] = useState('ALL');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const shops = useShops();

  const filterOptions = ['ALL', ...shops];

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== 'ALL') params.append('group', filter);
    params.append('days', dateRange);
    params.append('_t', Date.now());
    
    fetch(`${API_BASE}/stats_overview?${params.toString()}`, { 
      headers: { 'X-Admin-Token': 'YUNFAN_ADMIN_2026' } 
    })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [dateRange, filter]);

  const metrics = data?.metrics || {};
  const gmv = metrics.total_gmv || 0;
  const units = metrics.total_units || 0;
  const orders = metrics.total_orders || 0;
  const payout = metrics.actual_payout || 0;

  // Chart Data
  const chartData = useMemo(() => {
    if (!data?.trends) return null;
    return {
      labels: data.trends.map(t => t.date.split('-').slice(1).join('/')),
      datasets: [
        {
          label: '每日成交额 (GMV)',
          data: data.trends.map(t => t.gmv),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 3
        }
      ]
    };
  }, [data?.trends]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
    scales: {
      x: { display: false },
      y: { display: false }
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none whitespace-nowrap">数据大盘</h2>
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-1 whitespace-nowrap">Industrial Logistics Cockpit v4.29.33</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
          <div className="flex bg-slate-100 rounded-xl p-1 shrink-0">
            {filterOptions.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] md:text-[11px] font-black uppercase transition-all whitespace-nowrap ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {SITE_MAP[f] || f}
              </button>
            ))}
          </div>
          <div className="flex bg-slate-100 rounded-xl p-1 shrink-0">
            {DATE_OPTIONS.map(d => (
              <button
                key={d.value}
                onClick={() => setDateRange(d.value)}
                className={`px-3 py-1.5 rounded-lg text-[10px] md:text-[11px] font-black uppercase transition-all whitespace-nowrap ${dateRange === d.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest">AI 数据引擎加载中...</p>
        </div>
      ) : (
        <>
          {/* 1. Metrics Ribbon */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="总成交额 (GMV)" value={gmv.toLocaleString()} trend={metrics.gmv_trend} icon={Icon.DollarSign} color="indigo" prefix="$" />
            <MetricCard label="总订单量 (Orders)" value={orders.toLocaleString()} trend={metrics.orders_trend} icon={Icon.ShoppingCart} color="blue" />
            <MetricCard label="总销量 (Units)" value={units.toLocaleString()} trend={metrics.units_trend} icon={Icon.Box} color="emerald" />
            <MetricCard label="预计实收 (Net)" value={payout.toLocaleString()} trend={null} icon={Icon.Wallet} color="amber" prefix="$" />
          </div>

          {/* 2. Main Intelligence Center */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* GMV Trend Chart */}
            <div className="lg:col-span-2 glass-effect rounded-[32px] p-8 border border-white/20 shadow-lg flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Icon name="activity" className="w-4 h-4 text-indigo-500" />
                    成交额趋势分析
                  </h3>
                  <p className="text-[11px] text-slate-500 font-bold uppercase mt-1">Daily GMV Volatility Engine</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest">AOV / 笔单价</p>
                  <p className="text-lg font-black text-indigo-600 tnum">${metrics.aov}</p>
                </div>
              </div>
              <div className="flex-1 min-h-[240px] relative">
                {chartData && <Line data={chartData} options={chartOptions} />}
              </div>
              <div className="mt-6 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-indigo-500" />
                  <span className="text-[11px] font-black text-slate-500 uppercase">GMV Flow</span>
                </div>
                <p className="text-[11px] text-slate-500 font-bold italic truncate">基于系统实时订单流聚合计算，同步频率：5.0Hz</p>
              </div>
            </div>

            {/* Market Distribution */}
            <div className="glass-effect rounded-[32px] p-8 border border-white/20 shadow-lg">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-8">
                <Icon name="pie-chart" className="w-4 h-4 text-emerald-500" />
                各站 GMV 占比
              </h3>
              <DonutChart data={data?.store_distribution || []} />
            </div>
          </div>

          {/* 3. Product Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-effect rounded-[32px] p-8 border border-white/20 shadow-lg">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-6">
                <Icon name="award" className="w-4 h-4 text-amber-500" />
                成交额排行 (Top GMV)
              </h3>
              <div className="space-y-3">
                {(data?.rankings?.top_gmv || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                      {i + 1}
                    </div>
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-500"><Icon name="image" className="w-4 h-4" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-black text-slate-800 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-500 font-bold uppercase">SKU TARGET</p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <p className="text-sm font-black text-indigo-600 tnum">${item.gmv.toLocaleString()}</p>
                      <p className="text-[11px] text-slate-500 font-bold uppercase">GMV</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-effect rounded-[32px] p-8 border border-white/20 shadow-lg">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-6">
                <Icon name="zap" className="w-4 h-4 text-blue-500" />
                销量排行 (Top Units)
              </h3>
              <div className="space-y-3">
                {(data?.rankings?.top_units || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black ${i === 0 ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                      {i + 1}
                    </div>
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-500"><Icon name="image" className="w-4 h-4" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-black text-slate-800 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-500 font-bold uppercase">UNIT TARGET</p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <p className="text-sm font-black text-blue-600 tnum">{item.units.toLocaleString()}</p>
                      <p className="text-[11px] text-slate-500 font-bold uppercase">PCS</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

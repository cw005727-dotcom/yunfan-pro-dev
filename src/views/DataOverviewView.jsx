import { useState, useEffect, useRef } from 'react';
import Icon from '../components/Icon.jsx';

const SITE_MAP = {
  'ALL': '全站',
  'MLM': '🇲🇽 MX', 'MLB': '🇧🇷 BR', 'MLA': '🇦🇷 AR',
  'MCO': '🇨🇴 CO', 'MLC': '🇨🇱 CL', 'MLU': '🇺🇾 UY',
};
const API_BASE = '/api';
const DATE_OPTIONS = [{ label: '7天', value: 7 }, { label: '30天', value: 30 }, { label: '90天', value: 90 }];

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

// Animated counter hook
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(from + (target - from) * ease);
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return value;
}

// Donut pie chart
function DonutChart({ data, size = 200 }) {
  const total = data.reduce((s, d) => s + (d.gmv || 0), 0);
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <Icon name="pie-chart" className="w-12 h-12 text-slate-200 mb-3" />
        <p className="text-xs text-slate-400 font-medium">暂无数据</p>
      </div>
    );
  }
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  let cumulative = 0;
  const strokes = data.map((d, i) => {
    const pct = (d.gmv || 0) / total;
    const dashArray = `${pct * 251.2} 251.2`;
    const dashOffset = -cumulative * 251.2;
    cumulative += pct;
    return { ...d, dashArray, dashOffset, color: COLORS[i % COLORS.length] };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox="0 0 100 100" className="transform -rotate-90">
        {strokes.map((s, i) => (
          <circle
            key={i}
            cx="50" cy="50" r="40"
            fill="none"
            stroke={s.color}
            strokeWidth="14"
            strokeDasharray={s.dashArray}
            strokeDashoffset={s.dashOffset}
            strokeLinecap="round"
            style={{
              animation: 'dash-in 0.8s ease-out forwards',
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
        <style>{`
          @keyframes dash-in {
            from { opacity: 0; stroke-dasharray: 0 251.2; }
            to { opacity: 1; }
          }
        `}</style>
        <circle cx="50" cy="50" r="33" fill="white" />
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
        {strokes.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-xs text-slate-600 font-medium">{SITE_MAP[s.name] || s.name}</span>
            <span className="text-xs text-slate-400">${(s.gmv || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Trend badge
function TrendBadge({ value }) {
  if (!value) return null;
  const isUp = value >= 0;
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full ${isUp ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
      <Icon name={isUp ? 'trending-up' : 'trending-down'} className="w-3 h-3" />
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

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
    if (filter !== 'ALL') {
      params.append('group', filter);
    }
    params.append('days', dateRange);
    params.append('_t', Date.now());
    const url = `${API_BASE}/stats_overview?${params.toString()}`;
    fetch(url, { headers: { 'X-Admin-Token': 'YUNFAN_ADMIN_2026' } })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [dateRange, filter]);

  const metrics = data?.metrics || {};
  const gmv = useCountUp(metrics.total_gmv || 0);
  const units = useCountUp(metrics.total_units || 0);
  const gmvDisplay = gmv > 0 ? `$${gmv.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00';
  const unitsDisplay = Math.round(units).toLocaleString();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">数据中概览</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">多站点实时数据聚合</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Filter selection */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-2xl p-1">
            {filterOptions.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {SITE_MAP[f] || f}
              </button>
            ))}
          </div>
          {/* Date range */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-2xl p-1">
            {DATE_OPTIONS.map(d => (
              <button
                key={d.value}
                onClick={() => setDateRange(d.value)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${dateRange === d.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Icon name="loader" className="w-8 h-8 animate-spin text-slate-300" />
        </div>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-effect rounded-[24px] p-6 flex items-center gap-6 border border-white/20 shadow-lg shadow-indigo-50 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="relative w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-200">
                <Icon name="dollar-sign" className="w-6 h-6 text-white" />
              </div>
              <div className="relative">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">总成交额 (GMV)</p>
                <p className="text-2xl font-black tnum text-slate-900">{gmvDisplay}</p>
                <TrendBadge value={metrics.gmv_trend} />
              </div>
            </div>

            <div className="glass-effect rounded-[24px] p-6 flex items-center gap-6 border border-white/20 shadow-lg shadow-emerald-50 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="relative w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                <Icon name="shopping-bag" className="w-6 h-6 text-white" />
              </div>
              <div className="relative">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">总销量</p>
                <p className="text-2xl font-black tnum text-slate-900">{unitsDisplay}</p>
                <TrendBadge value={metrics.units_trend} />
              </div>
            </div>

            <div className="glass-effect rounded-[24px] p-6 flex items-center gap-6 border border-white/20 shadow-lg shadow-amber-50 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="relative w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-200">
                <Icon name="wallet" className="w-6 h-6 text-white" />
              </div>
              <div className="relative">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">预估收益</p>
                <p className="text-2xl font-black tnum text-slate-900">${(metrics.actual_payout || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-[9px] text-slate-300 mt-0.5">毛利 = GMV - 平台费 - 税费</p>
              </div>
            </div>
          </div>

          {/* Chart + Rankings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pie chart */}
            <div className="glass-effect rounded-[32px] p-8 flex flex-col items-center justify-center border border-white/20 shadow-lg">
              <h3 className="text-sm font-black text-slate-700 mb-6 uppercase tracking-widest">各站 GMV 占比</h3>
              <DonutChart data={data?.store_distribution || []} size={200} />
            </div>

            {/* Top GMV products */}
            <div className="glass-effect rounded-[32px] p-8 border border-white/20 shadow-lg lg:col-span-2">
              <h3 className="text-sm font-black text-slate-700 mb-4 uppercase tracking-widest flex items-center gap-2">
                <Icon name="trophy" className="w-4 h-4 text-amber-500" />
                GMV TOP 排行
              </h3>
              <div className="space-y-3">
                {(data?.rankings?.top_gmv || []).slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${i === 0 ? 'bg-amber-100 text-amber-600' : i === 1 ? 'bg-slate-100 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
                      {i + 1}
                    </span>
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                      {item.image_url && <img src={item.image_url} className="w-full h-full object-cover" loading="lazy" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-black tnum text-accent">${(item.gmv || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}</p>
                      <p className="text-[9px] text-slate-400 font-medium">GMV</p>
                    </div>
                  </div>
                ))}
                {(!data?.rankings?.top_gmv || data.rankings.top_gmv.length === 0) && (
                  <p className="text-center text-slate-400 text-xs py-8">暂无数据</p>
                )}
              </div>
            </div>
          </div>

          {/* Top Units */}
          <div className="glass-effect rounded-[32px] p-8 border border-white/20 shadow-lg">
            <h3 className="text-sm font-black text-slate-700 mb-4 uppercase tracking-widest flex items-center gap-2">
              <Icon name="zap" className="w-4 h-4 text-indigo-500" />
              销量 TOP 排行
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(data?.rankings?.top_units || []).slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                    {item.image_url && <img src={item.image_url} className="w-full h-full object-cover" loading="lazy" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 line-clamp-2">{item.name}</p>
                    <p className="text-lg font-black tnum text-indigo-500 mt-1">{item.units?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

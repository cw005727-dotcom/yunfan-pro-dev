import { useAppContext } from '../context/AppContext';
import { useState, useEffect, useRef } from 'react';
import Icon from '../components/Icon.jsx';

// ─── 4 Official Categories ──────────────────────────────────────────────────
const CATEGORIES = [
  { id: '1', label: '待处理', icon: 'clock', color: 'border-slate-400', text: 'text-slate-500', bg: 'bg-slate-100' },
  { id: '2', label: '在途中', icon: 'truck', color: 'border-blue-500', text: 'text-blue-600', bg: 'bg-blue-50' },
  { id: '3', label: '已妥投', icon: 'check-circle', color: 'border-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: '4', label: '有异常', icon: 'alert-triangle', color: 'border-red-500', text: 'text-red-600', bg: 'bg-red-50' },
];

const SITE_FLAGS = {
  MLM: '🇲🇽', MLB: '🇧🇷', MLA: '🇦🇷', MCO: '🇨🇴', MLC: '🇨🇱', MLU: '🇺🇾', CBT: '🌐'
};

// ─── Components ─────────────────────────────────────────────────────────────

const CategoryRibbon = ({ stats, active, onChange }) => {
  return (
    <div className="grid grid-cols-4 gap-0 border-b border-slate-200 bg-slate-50">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat.id;
        const count = stats[cat.id === '1' ? 'preparing' : cat.id === '2' ? 'in_transit' : cat.id === '3' ? 'delivered' : 'issues'] || 0;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`flex flex-col items-center justify-center py-5 border-r border-slate-200 transition-all relative overflow-hidden group
              ${isActive ? 'bg-white' : 'hover:bg-slate-100/50'}`}
          >
            {isActive && <div className={`absolute left-0 top-0 w-full h-1 ${cat.bg.replace('50', '500')}`} />}
            <div className="flex items-center gap-3">
              <Icon name={cat.icon} className={`w-5 h-5 ${isActive ? cat.text : 'text-slate-400'}`} />
              <span className={`text-[13px] font-black uppercase tracking-widest ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                {cat.label}
              </span>
            </div>
            <span className={`text-2xl font-mono mt-1 ${isActive ? cat.text : 'text-slate-400'}`}>
              {count.toLocaleString()}
            </span>
          </button>
        );
      })}
    </div>
  );
};

const RiskRadar = ({ orders, selectedId, onSelect }) => {
  return (
    <div className="h-full flex flex-col border-r border-slate-200 bg-slate-50/50">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
          <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">风险监测雷达</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 italic">RISK_RADAR_V8</span>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-2">
        {orders.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <Icon name="shield-check" className="w-8 h-8 text-slate-200 mx-auto" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">当前无异常监测记录</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              onClick={() => onSelect(order)}
              className={`p-4 border border-slate-200 cursor-pointer transition-all relative group
                ${selectedId === order.id ? 'bg-white shadow-lg border-blue-500/30' : 'bg-white hover:border-slate-300'}`}
            >
              {selectedId === order.id && <div className="absolute left-0 top-0 h-full w-1 bg-blue-500" />}
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-600">#{order.id}</span>
                <span className={`text-[9px] px-2 py-0.5 font-black uppercase tracking-tighter
                  ${order.is_overdue ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                  {order.is_overdue ? '发货超期' : order.status_zh}
                </span>
              </div>
              <p className="text-[12px] text-slate-800 font-bold line-clamp-1 mb-2 group-hover:text-slate-900 transition-colors">
                {order.product_name}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500 font-bold">{SITE_FLAGS[order.site_id]} {order.site_id}</span>
                <span className="text-[10px] text-slate-400 font-mono tracking-tighter">LP:{order.tracking_id || 'PENDING'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const FocusTrace = ({ order }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!order) {
      setDetails(null);
      return;
    }
    setLoading(true);
    fetch(`/api/logistics/detail?id=${order.id}`)
      .then(r => r.json())
      .then(data => {
        setDetails(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [order]);

  if (!order) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-6 opacity-30">
        <Icon name="target" className="w-16 h-16 text-slate-300" />
        <div className="space-y-2">
          <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">待命状态</p>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">请从左侧列表选择监测对象</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white relative overflow-hidden">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      {/* Trace Header */}
      <div className="p-6 border-b border-slate-200 shrink-0 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 border border-slate-200 flex items-center justify-center">
            <Icon name="activity" className="w-6 h-6 text-blue-500" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-900 tracking-widest">单据全流程监测</h4>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-slate-400 font-mono">ID: {order.id}</span>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">TRACKING: {order.tracking_id || 'WAITING'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">当前状态</p>
            <p className="text-xs font-black text-blue-600 uppercase tracking-widest">{order.status_zh}</p>
          </div>
          <button className="h-10 px-6 bg-slate-900 border border-slate-900 hover:bg-slate-800 text-[11px] font-black text-white uppercase tracking-widest transition-all">
            同步轨迹
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10 z-10 no-scrollbar">
        {/* Product Quick View */}
        <div className="flex gap-6 p-6 border border-slate-200 bg-slate-50 relative group">
          <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-slate-200" />
          <img src={order.thumbnail} className="w-20 h-20 object-cover border border-slate-200" alt="" />
          <div className="flex-1 space-y-4">
            <p className="text-[14px] font-black text-slate-900 leading-relaxed uppercase tracking-tighter">
              {order.product_name}
            </p>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">店铺 / 站点</p>
                <p className="text-[11px] text-slate-700 font-black">{order.site_id}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">买家 ID</p>
                <p className="text-[11px] text-slate-700 font-mono tracking-tighter">{order.buyer_id}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">成交额</p>
                <p className="text-[11px] text-emerald-600 font-black font-mono">${order.amount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Flow */}
        <div className="relative pl-12 space-y-12 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-2 border-slate-100 border-t-blue-500 animate-spin" />
            </div>
          ) : (
            details?.events?.map((ev, i) => (
              <div key={i} className="relative group">
                {/* Node with Pulse Effect */}
                <div className={`absolute -left-12 top-0.5 w-10 h-10 border flex items-center justify-center transition-all duration-500 z-10
                  ${i === 0 ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-100' : 'bg-white border-slate-200 group-hover:border-slate-400'}`}>
                  {i === 0 && (
                    <div className="absolute inset-0 bg-blue-500 animate-ping opacity-20" />
                  )}
                  <div className={`w-1.5 h-1.5 ${i === 0 ? 'bg-white shadow-[0_0_8px_white]' : 'bg-slate-300'}`} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[12px] font-black tracking-tight uppercase ${i === 0 ? 'text-blue-600' : 'text-slate-800'}`}>
                      {ev.desc}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono italic">{ev.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="map-pin" className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{ev.location || 'TRANSSHIPPED'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const LogisticsTable = ({ orders, onSelect }) => {
  return (
    <div className="flex-1 min-h-0 bg-white border-t border-slate-200 flex flex-col">
      <div className="h-10 border-b border-slate-200 flex items-center px-6 shrink-0 justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">全量数据同步中心</span>
          <div className="h-3 w-[1px] bg-slate-200" />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Showing {orders.length} Results</span>
        </div>
        <div className="flex gap-4">
           <button className="text-[10px] text-slate-400 hover:text-slate-900 font-black uppercase tracking-widest transition-colors flex items-center gap-2">
             <Icon name="download" className="w-3 h-3" /> 导出
           </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white z-20 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">订单 ID</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">商品信息</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">运单号</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">实时状态</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">结算金额</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((o) => (
              <tr 
                key={o.id} 
                onClick={() => onSelect(o)}
                className="hover:bg-slate-50/80 cursor-pointer group transition-colors"
              >
                <td className="px-6 py-4 text-[11px] font-mono text-slate-500 group-hover:text-blue-600 transition-colors">#{o.id}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={o.thumbnail} className="w-8 h-8 object-cover border border-slate-100 group-hover:border-slate-200" alt="" />
                    <span className="text-[11px] font-black text-slate-600 group-hover:text-slate-900 transition-colors truncate max-w-[200px]">{o.product_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[11px] font-mono text-slate-400 tracking-tighter">LP:{o.tracking_id || 'PENDING'}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-1 h-1 rounded-full ${o.category === 3 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : o.category === 4 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`} />
                    <span className={`text-[11px] font-black uppercase tracking-widest ${o.category === 3 ? 'text-emerald-600' : o.category === 4 ? 'text-red-600' : 'text-blue-500'}`}>
                      {o.status_zh}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[11px] font-mono font-black text-slate-500 text-right group-hover:text-emerald-600 transition-colors">${o.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Main View ──────────────────────────────────────────────────────────────

const LogisticsAlertsView = () => {
  const { activeShop, showToast } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [activeCategory, setActiveCategory] = useState('1');
  const [isLoading, setIsLoading] = useState(true);
  const [focusOrder, setFocusOrder] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/logistics/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Stats Error:", err);
    }
  };

  const fetchOrders = async (catId) => {
    setIsLoading(true);
    try {
      const shopPart = activeShop ? `&group=${encodeURIComponent(activeShop)}` : '';
      const res = await fetch(`/api/orders?category=${catId}${shopPart}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setIsLoading(false);
    } catch (err) {
      if (showToast) showToast('加载订单失败', 'error');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchOrders(activeCategory);
    const interval = setInterval(() => {
        fetchStats();
    }, 10000);
    return () => clearInterval(interval);
  }, [activeShop, activeCategory]);

  const riskOrders = orders.filter(o => o.category === 4 || o.is_overdue).slice(0, 10);

  return (
    <div className="h-full flex flex-col bg-white text-slate-900 overflow-hidden font-sans">
      {/* Top Banner Accent */}
      <div className="h-1 w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 opacity-20 shrink-0" />

      {/* Category Ribbon */}
      <CategoryRibbon 
        stats={stats} 
        active={activeCategory} 
        onChange={(id) => {
          setActiveCategory(id);
          setFocusOrder(null);
        }} 
      />

      {/* Main Workspace: 1:2 Split */}
      <div className="flex-1 flex min-h-0">
        {/* Risk Radar (Left 1/3) */}
        <div className="w-[380px] shrink-0 overflow-hidden">
          <RiskRadar 
            orders={riskOrders} 
            selectedId={focusOrder?.id}
            onSelect={setFocusOrder}
          />
        </div>

        {/* Trace Console (Right 2/3) */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 min-h-0 border-b border-slate-200">
            <FocusTrace order={focusOrder} />
          </div>
          
          {/* Data Table (Bottom Expansion) */}
          <div className="h-[320px] shrink-0 flex flex-col">
            <LogisticsTable orders={orders} onSelect={setFocusOrder} />
          </div>
        </div>
      </div>

      {/* Footer / Status Bar */}
      <div className="h-8 border-t border-slate-200 bg-slate-50 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">系统就绪</span>
          </div>
          <span className="text-[9px] text-slate-400 font-mono italic">V8_CORE_KERNEL_ACTIVE</span>
        </div>
        <div className="flex items-center gap-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
           <span>站点时区: MX/GMT-6</span>
           <span>心跳频率: 5.0Hz</span>
        </div>
      </div>
    </div>
  );
};

export default LogisticsAlertsView;

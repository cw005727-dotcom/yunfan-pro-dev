import { useAppContext } from '../context/AppContext';
import { useState, useEffect, useRef } from 'react';
import Icon from '../components/Icon.jsx';

// ─── Status Mapping (Synced with Shop Reputation - High Saturation) ───────
const STATUS_META = {
  1: { label: '待处理', dot: 'bg-slate-500', text: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-300', icon: 'clock', accent: 'bg-slate-500' },
  2: { label: '在途中', dot: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-100/50', border: 'border-blue-200', icon: 'truck', accent: 'bg-blue-500' },
  3: { label: '已妥投', dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-100/50', border: 'border-emerald-200', icon: 'check-circle', accent: 'bg-emerald-500' },
  4: { label: '有异常', dot: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-100/50', border: 'border-rose-200', icon: 'alert-triangle', accent: 'bg-rose-500', pulse: 'relative after:absolute after:inset-0 after:rounded-full after:bg-rose-500 after:animate-ping after:opacity-40' },
};

const SITE_FLAGS = {
  MLM: '🇲🇽 墨西哥', MLB: '🇧🇷 巴西', MLA: '🇦🇷 阿根廷', MCO: '🇨🇴 哥伦比亚', MLC: '🇨🇱 智利', MLU: '🇺🇾 乌拉圭', CBT: '🌐 跨境站'
};

// ─── Components ─────────────────────────────────────────────────────────────

const CategoryRibbon = ({ stats, active, onChange }) => {
  return (
    <div className="flex gap-4 p-5 shrink-0 overflow-x-auto no-scrollbar bg-white border-b border-slate-100">
      {Object.entries(STATUS_META).map(([id, meta]) => {
        const isActive = active === id;
        const countKey = id === '1' ? 'preparing' : id === '2' ? 'in_transit' : id === '3' ? 'delivered' : 'issues';
        const count = stats[countKey] || 0;
        const colorName = meta.text.split('-')[1]; // e.g. blue, emerald, rose
        
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex-1 min-w-[180px] flex items-center gap-5 p-5 rounded-2xl border-2 transition-all relative overflow-hidden group
              ${meta.bg} ${isActive ? `${meta.border} shadow-lg shadow-${colorName}-100` : 'border-transparent opacity-70 hover:opacity-100 hover:border-slate-200'}`}
          >
            {/* Top Accent Bar - Always visible but brighter when active */}
            <div className={`absolute top-0 left-0 w-full h-1.5 ${meta.accent} ${isActive ? 'opacity-100' : 'opacity-40'}`} />
            
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all bg-white shadow-sm
              ${isActive ? 'scale-110' : 'scale-100'}`}>
              <Icon name={meta.icon} className={`w-6 h-6 ${meta.text}`} />
            </div>
            <div className="text-left">
              <p className={`text-[11px] font-black uppercase tracking-[0.1em] ${isActive ? 'text-slate-700' : 'text-slate-500'}`}>
                {meta.label}
              </p>
              <div className="flex items-baseline gap-1">
                <p className={`text-2xl font-black ${meta.text}`}>
                  {count.toLocaleString()}
                </p>
                <span className={`text-[10px] font-bold ${isActive ? 'text-slate-500' : 'text-slate-400'}`}>单</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

const RiskRadar = ({ orders, selectedId, onSelect }) => {
  return (
    <div className="h-full flex flex-col p-4 bg-slate-50/50">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 relative after:absolute after:inset-0 after:rounded-full after:bg-rose-500 after:animate-ping after:opacity-40" />
          <span className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">物流风险监测</span>
        </div>
        <span className="text-[9px] font-mono text-slate-400">RADAR_V8_PRO</span>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
        {orders.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
            <Icon name="shield-check" className="w-8 h-8 text-emerald-500/20 mx-auto" />
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">暂无实时预警</p>
          </div>
        ) : (
          orders.map((order) => {
            const meta = STATUS_META[4]; // Risk cards always look like Exception/Status 4
            return (
              <div
                key={order.id}
                onClick={() => onSelect(order)}
                className={`p-3 rounded-xl border transition-all cursor-pointer relative group
                  ${selectedId === order.id ? 'bg-white shadow-xl ring-2 ring-rose-500/20' : `${meta.bg} ${meta.border} hover:bg-white`}`}
              >
                <div className="flex items-center justify-between mb-2">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">ORDER #{order.id}</span>
                   <div className={`w-1.5 h-1.5 rounded-full ${meta.dot} ${meta.pulse}`}></div>
                </div>
                
                <p className="text-[12px] font-black text-slate-800 line-clamp-2 leading-tight mb-3">
                  {order.product_name}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-400 uppercase">站点信息</span>
                      <span className="text-[10px] font-black text-slate-700">{SITE_FLAGS[order.site_id]?.split(' ')[1] || order.site_id}</span>
                   </div>
                   <div className="flex flex-col text-right">
                      <span className="text-[8px] font-black text-rose-500 uppercase">异常类型</span>
                      <span className="text-[10px] font-black text-rose-600">{order.is_overdue ? '发货已超期' : order.status_zh}</span>
                   </div>
                </div>
              </div>
            );
          })
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
      <div className="h-full flex flex-col items-center justify-center bg-white p-10 text-center opacity-30">
        <Icon name="target" className="w-12 h-12 text-slate-300" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">等待单据指令</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Detail Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white">
             <Icon name="activity" className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
             <h4 className="text-[14px] font-black text-slate-900 uppercase tracking-widest">全链路动态实时监测</h4>
             <div className="flex items-center gap-3">
               <span className="text-[10px] text-slate-400 font-mono tracking-tighter">LP-SERIAL: {order.tracking_id || 'PENDING'}</span>
               <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 rounded-sm uppercase">{order.status_zh}</span>
             </div>
          </div>
        </div>
        <button className="h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-slate-200">
          强制同步
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {/* Metric Cards (Shop Reputation Style) */}
        <div className="grid grid-cols-4 gap-3">
           <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">站点/国家</p>
              <p className="text-[12px] font-black text-slate-800">{SITE_FLAGS[order.site_id]}</p>
           </div>
           <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">成交金额</p>
              <p className="text-[12px] font-black text-emerald-600 font-mono">${order.amount}</p>
           </div>
           <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">买家 ID</p>
              <p className="text-[12px] font-black text-slate-800 font-mono">{order.buyer_id}</p>
           </div>
           <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">物流服务商</p>
              <p className="text-[12px] font-black text-blue-600">CAINIAO GLOBAL</p>
           </div>
        </div>

        {/* Trace Flow */}
        <div className="relative pl-10 space-y-10 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
          {loading ? (
             <div className="py-20 flex justify-center"><div className="w-8 h-8 border-2 border-slate-100 border-t-blue-500 rounded-full animate-spin" /></div>
          ) : (
            details?.events?.map((ev, i) => (
              <div key={i} className="relative group">
                <div className={`absolute -left-10 top-0.5 w-8 h-8 rounded-full border flex items-center justify-center z-10 transition-all
                  ${i === 0 ? 'bg-slate-900 border-slate-900 shadow-xl' : 'bg-white border-slate-200'}`}>
                  {i === 0 && <div className="absolute inset-0 bg-slate-900 rounded-full animate-ping opacity-20" />}
                  <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-slate-300'}`} />
                </div>
                <div className="space-y-1 bg-slate-50/50 p-4 rounded-xl border border-transparent hover:border-slate-100 hover:bg-white transition-all group-hover:shadow-sm">
                   <div className="flex items-center justify-between">
                      <p className={`text-[12px] font-black uppercase tracking-tight ${i === 0 ? 'text-slate-900' : 'text-slate-500'}`}>{ev.desc}</p>
                      <span className="text-[10px] text-slate-400 font-mono italic">{ev.time}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Icon name="map-pin" className="w-3 h-3 text-slate-300" />
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{ev.location}</span>
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
    <div className="flex-1 min-h-0 bg-white border-t border-slate-100 flex flex-col">
      <div className="h-10 border-b border-slate-100 flex items-center px-6 shrink-0 justify-between bg-slate-50/30">
        <div className="flex items-center gap-4">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">全量订单监测池</span>
           <div className="h-3 w-[1px] bg-slate-200" />
           <span className="text-[10px] text-slate-500 font-black uppercase">COUNT: {orders.length}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white/90 backdrop-blur-md z-10">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">核心编号</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">商品详情</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">当前环节</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">金额</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.map((o) => {
              const meta = STATUS_META[o.category] || STATUS_META[1];
              return (
                <tr 
                  key={o.id} 
                  onClick={() => onSelect(o)}
                  className="hover:bg-slate-50/80 cursor-pointer group transition-colors"
                >
                  <td className="px-6 py-4 space-y-1">
                    <p className="text-[11px] font-black text-slate-800 group-hover:text-blue-600 transition-colors">#{o.id}</p>
                    <p className="text-[9px] text-slate-400 font-mono tracking-tighter uppercase">{o.tracking_id || 'WAITING'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={o.thumbnail} className="w-8 h-8 object-cover rounded border border-slate-100" alt="" />
                      <div className="flex flex-col">
                         <span className="text-[11px] font-black text-slate-700 group-hover:text-slate-900 truncate max-w-[200px]">{o.product_name}</span>
                         <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{SITE_FLAGS[o.site_id]}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`mx-auto w-max px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2
                      ${meta.bg} ${meta.border} ${meta.text}`}>
                       <div className={`w-1 h-1 rounded-full ${meta.dot}`} />
                       {o.status_zh}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[12px] font-black text-slate-800 text-right font-mono group-hover:text-emerald-600 transition-colors">${o.amount}</td>
                </tr>
              );
            })}
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
      <div className="flex-1 flex min-h-0 border-t border-slate-100">
        {/* Risk Radar (Left 1/3) */}
        <div className="w-[320px] shrink-0 border-r border-slate-100">
          <RiskRadar 
            orders={riskOrders} 
            selectedId={focusOrder?.id}
            onSelect={setFocusOrder}
          />
        </div>

        {/* Right Side: Trace + Table */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 min-h-0">
            <FocusTrace order={focusOrder} />
          </div>
          
          <div className="h-[300px] shrink-0 flex flex-col">
            <LogisticsTable orders={orders} onSelect={setFocusOrder} />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-8 border-t border-slate-100 bg-white px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">物流监测核心已挂载</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[9px] text-slate-300 font-black uppercase tracking-widest">
           <span>时区: MX/GMT-6</span>
           <span>心跳频率: 5.0Hz</span>
        </div>
      </div>
    </div>
  );
};

export default LogisticsAlertsView;

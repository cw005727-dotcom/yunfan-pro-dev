import { useAppContext } from '../context/AppContext';
import { useState, useEffect, useRef } from 'react';
import Icon from '../components/Icon.jsx';

// ─── 状态映射 (同步店铺声誉 - 高饱和度) ──────────────────────────────────────
const STATUS_META = {
  1: { label: '待处理', dot: 'bg-slate-500', text: 'text-slate-900', bg: 'bg-slate-100', border: 'border-slate-300', icon: 'clock', accent: 'bg-slate-500', radarTitle: '待处理任务库' },
  2: { label: '在途中', dot: 'bg-blue-600', text: 'text-blue-900', bg: 'bg-blue-100/50', border: 'border-blue-300', icon: 'truck', accent: 'bg-blue-600', radarTitle: '在途中监测' },
  3: { label: '已妥投', dot: 'bg-emerald-600', text: 'text-emerald-900', bg: 'bg-emerald-100/50', border: 'border-emerald-300', icon: 'check-circle', accent: 'bg-emerald-600', radarTitle: '已妥投档案' },
  4: { label: '有异常', dot: 'bg-rose-600', text: 'text-rose-900', bg: 'bg-rose-100/50', border: 'border-rose-300', icon: 'alert-triangle', accent: 'bg-rose-600', radarTitle: '物流风险雷达', pulse: 'relative after:absolute after:inset-0 after:rounded-full after:bg-rose-500 after:animate-ping after:opacity-40' },
};

const SHIPPING_STATUS_COLORS = {
  // 待处理
  'ready_to_print': { text: 'text-amber-600', dot: 'bg-amber-500', bg: 'bg-amber-50' },
  'printed': { text: 'text-indigo-600', dot: 'bg-indigo-500', bg: 'bg-indigo-50' },
  'ready_to_ship': { text: 'text-blue-600', dot: 'bg-blue-500', bg: 'bg-blue-50' },
  // 在途中
  'out_for_delivery': { text: 'text-emerald-600', dot: 'bg-emerald-500', bg: 'bg-emerald-50' },
  'pick_up': { text: 'text-purple-600', dot: 'bg-purple-500', bg: 'bg-purple-50' },
  'shipped': { text: 'text-blue-600', dot: 'bg-blue-500', bg: 'bg-blue-50' },
  // 有异常
  'cancelled': { text: 'text-slate-500', dot: 'bg-slate-400', bg: 'bg-slate-50' },
  'returned': { text: 'text-orange-600', dot: 'bg-orange-500', bg: 'bg-orange-50' },
  'not_delivered': { text: 'text-rose-600', dot: 'bg-rose-500', bg: 'bg-rose-50' },
};

const SITE_FLAGS = {
  MLM: '🇲🇽 墨西哥', MLB: '🇧🇷 巴西', MLA: '🇦🇷 阿根廷', MCO: '🇨🇴 哥伦比亚', MLC: '🇨🇱 智利', MLU: '🇺🇾 乌拉圭', CBT: '🌐 跨境站'
};

// ─── 组件 ─────────────────────────────────────────────────────────────

const CategoryRibbon = ({ stats, active, onChange }) => {
  return (
    <div className="flex gap-4 p-5 shrink-0 overflow-x-auto no-scrollbar bg-white border-b border-slate-100">
      {Object.entries(STATUS_META).map(([id, meta]) => {
        const isActive = active === id;
        const countKey = id === '1' ? 'preparing' : id === '2' ? 'in_transit' : id === '3' ? 'delivered' : 'issues';
        const count = stats[countKey] || 0;
        const colorName = meta.text.split('-')[1];
        
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex-1 min-w-[180px] flex items-center gap-5 p-5 rounded-2xl border-2 transition-all relative overflow-hidden group
              ${meta.bg} ${isActive ? `${meta.border} shadow-lg shadow-${colorName}-100` : 'border-transparent opacity-70 hover:opacity-100 hover:border-slate-200'}`}
          >
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

const AdaptiveRadar = ({ orders, selectedId, onSelect, categoryId }) => {
  const meta = STATUS_META[categoryId];
  return (
    <div className="h-full flex flex-col p-4 bg-slate-50/50">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${meta.dot} ${meta.pulse || ''}`} />
          <span className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">{meta.radarTitle}</span>
        </div>
        <span className="text-[9px] font-mono text-slate-400">指挥官 V8 系统</span>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
        {orders.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
            <Icon name="inbox" className="w-8 h-8 text-slate-200 mx-auto" />
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">该分类下暂无单据</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              onClick={() => onSelect(order)}
              className={`p-3 rounded-xl border transition-all cursor-pointer relative group
                ${selectedId === order.id ? `bg-white shadow-xl ring-2 ${meta.border.replace('border-', 'ring-')}/30` : `bg-white border-slate-100 hover:border-slate-300 shadow-sm`}`}
            >
              {selectedId === order.id && <div className={`absolute left-0 top-1/4 h-1/2 w-1 ${meta.dot} rounded-full`} />}
              <div className="flex gap-3">
                <img src={order.thumbnail} className="w-12 h-12 object-cover rounded-lg border border-slate-100 shrink-0" alt="" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">订单编号 #{order.id}</span>
                     <div className={`w-1.5 h-1.5 rounded-full ${meta.dot}`}></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase">站点</span>
                        <span className="text-[10px] font-black text-slate-700">{SITE_FLAGS[order.site_id]?.split(' ')[1] || order.site_id}</span>
                     </div>
                     <div className="flex flex-col text-right">
                        <span className="text-[8px] font-black text-slate-400 uppercase">{categoryId === '1' ? '当前状态' : '当前环节'}</span>
                        <span className={`text-[10px] font-black ${order.is_overdue ? 'text-rose-600' : (SHIPPING_STATUS_COLORS[order.shipping_status]?.text || meta.text)}`}>
                          {order.status_zh}
                        </span>
                     </div>
                  </div>
                  {(categoryId === '1' || order.shipping_status === 'out_for_delivery' || order.shipping_status === 'pick_up') && (
                    <div className={`mt-2 flex items-center justify-between px-1 p-1.5 rounded-lg border ${order.is_overdue ? 'bg-rose-50 border-rose-100' : 'bg-slate-100/50 border-slate-100'}`}>
                      <span className="text-[8px] font-black text-slate-400 uppercase">
                        {categoryId === '1' ? '最晚发货' : (order.shipping_status === 'pick_up' ? '待自提' : '派送中')}
                      </span>
                      <span className={`text-[10px] font-mono font-black ${order.is_overdue ? 'text-rose-600' : 'text-slate-600'}`}>
                        {categoryId === '1' ? (order.expiration_date?.split('T')[0] || '未设置') : '实时追踪中'}
                      </span>
                    </div>
                  )}
                </div>
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
      <div className="h-full flex flex-col items-center justify-center bg-white p-10 text-center opacity-30">
        <Icon name="target" className="w-12 h-12 text-slate-300" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">等待单据指令</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white">
             <Icon name="activity" className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
             <h4 className="text-[14px] font-black text-slate-900 uppercase tracking-widest">全链路动态实时监测</h4>
             <div className="flex items-center gap-3">
               <span className="text-[10px] text-slate-400 font-mono tracking-tighter">运单号: {order.tracking_id || '待生成'}</span>
               <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 rounded-sm uppercase">{order.status_zh}</span>
             </div>
          </div>
        </div>
        <button className="h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-slate-200">
          强制同步
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        <div className="grid grid-cols-4 gap-3">
           <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">国家 / 站点</p>
              <p className="text-[12px] font-black text-slate-800">{SITE_FLAGS[order.site_id]}</p>
           </div>
           <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">成交金额</p>
              <p className="text-[12px] font-black text-emerald-600 font-mono">${order.amount}</p>
           </div>
           <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">买家编号</p>
              <p className="text-[12px] font-black text-slate-800 font-mono">{order.buyer_id}</p>
           </div>
           <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">物流承运商</p>
              <p className="text-[12px] font-black text-blue-600">菜鸟国际</p>
           </div>
        </div>

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
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{ev.location === 'TRANSSHIPPED' ? '中转中' : ev.location}</span>
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

const LogisticsTable = ({ orders, onSelect, activeCategory }) => {
  return (
    <div className="flex-1 min-h-0 bg-white border-t border-slate-100 flex flex-col">
      <div className="h-10 border-b border-slate-100 flex items-center px-6 shrink-0 justify-between bg-slate-50/30">
        <div className="flex items-center gap-4">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">全量订单监测池</span>
           <div className="h-3 w-[1px] bg-slate-200" />
           <span className="text-[10px] text-slate-500 font-black uppercase">总计: {orders.length} 项结果</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar relative">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white/90 backdrop-blur-md z-10">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">核心订单信息</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">商品详情</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">
                {activeCategory === '1' ? '最晚发货期限' : '当前物流环节'}
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">金额</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.map((o) => {
              const meta = STATUS_META[activeCategory] || STATUS_META[1];
              return (
                <tr 
                  key={o.id} 
                  onClick={() => onSelect(o)}
                  className="hover:bg-slate-50/80 cursor-pointer group transition-colors"
                >
                  <td className="px-6 py-4 space-y-1">
                    <p className="text-[11px] font-black text-slate-800 group-hover:text-blue-600 transition-colors">#{o.id}</p>
                    <p className="text-[9px] text-slate-400 font-mono tracking-tighter uppercase">运单: {o.tracking_id || '等待生成'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={o.thumbnail} className="w-12 h-12 object-cover rounded border border-slate-100 group-hover:border-slate-300 transition-all shadow-sm" alt="" />
                      <div className="flex flex-col">
                         <span className="text-[11px] font-black text-slate-800 group-hover:text-blue-600 transition-colors">#{o.id}</span>
                         <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{SITE_FLAGS[o.site_id]}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`mx-auto w-max px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest flex flex-col items-center gap-0.5
                      ${SHIPPING_STATUS_COLORS[o.shipping_status]?.bg || meta.bg} ${SHIPPING_STATUS_COLORS[o.shipping_status]?.text.replace('text-', 'border-').replace('600', '200').replace('500', '200') || meta.border} ${SHIPPING_STATUS_COLORS[o.shipping_status]?.text || meta.text}`}>
                       <div className="flex items-center gap-2">
                         <div className={`w-1 h-1 rounded-full ${SHIPPING_STATUS_COLORS[o.shipping_status]?.dot || meta.dot}`} />
                         {o.status_zh}
                       </div>
                       {(activeCategory === '1' || o.shipping_status === 'out_for_delivery' || o.shipping_status === 'pick_up') && (
                         <span className={`text-[9px] ${o.is_overdue ? 'text-rose-600' : 'text-slate-500'} font-mono border-t border-slate-200/50 mt-0.5 pt-0.5 w-full text-center`}>
                           {activeCategory === '1' ? `截止: ${o.expiration_date?.split('T')[0] || '未设置'}` : (o.shipping_status === 'pick_up' ? '请联系买家自提' : '正在派送中')}
                         </span>
                       )}
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

// ─── 主视图 ──────────────────────────────────────────────────────────────

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
      console.error("数据拉取错误:", err);
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

  return (
    <div className="h-full flex flex-col bg-white text-slate-900 overflow-hidden font-sans relative">
      <CategoryRibbon 
        stats={stats} 
        active={activeCategory} 
        onChange={(id) => {
          setActiveCategory(id);
          setFocusOrder(null);
        }} 
      />

      <div className="flex-1 flex min-h-0 border-t border-slate-100">
        <div className="w-[320px] shrink-0 border-r border-slate-100 relative">
          {isLoading && (
             <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-30 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
             </div>
          )}
          <AdaptiveRadar 
            orders={orders.slice(0, 15)} 
            selectedId={focusOrder?.id}
            onSelect={setFocusOrder}
            categoryId={activeCategory}
          />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 min-h-0">
            <FocusTrace order={focusOrder} />
          </div>
          
          <div className="h-[300px] shrink-0 flex flex-col relative">
            <LogisticsTable orders={orders} onSelect={setFocusOrder} activeCategory={activeCategory} />
          </div>
        </div>
      </div>

      <div className="h-8 border-t border-slate-100 bg-white px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">物流监测核心已挂载</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[9px] text-slate-300 font-black uppercase tracking-widest">
           <span>站点时区: 墨西哥 (GMT-6)</span>
           <span>心跳频率: 5.0 赫兹</span>
        </div>
      </div>
    </div>
  );
};

export default LogisticsAlertsView;

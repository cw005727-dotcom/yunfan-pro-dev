import { useAppContext } from '../context/AppContext';
import { useState, useEffect, useRef } from 'react';
import Icon from '../components/Icon.jsx';

// ─── Status mapping ─────────────────────────────────────────────────────────
const STATUS_MAP = {
  // 物流轨迹状态（优先 tracking_status，其次 shipping_substatus）
  pending:           { label: '待取件',    color: 'bg-slate-400',  textColor: 'text-white', marqueeColor: 'bg-slate-400',  badge: 'bg-slate-100 text-slate-600',  dot: 'bg-slate-400', icon: 'clock' },
  ready_to_ship:     { label: '待取件',    color: 'bg-slate-400',  textColor: 'text-white', marqueeColor: 'bg-slate-400',  badge: 'bg-slate-100 text-slate-600',  dot: 'bg-slate-400', icon: 'package' },
  picked_up:         { label: '已揽收',    color: 'bg-blue-500',   textColor: 'text-white', marqueeColor: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-600',   dot: 'bg-blue-500', icon: 'truck' },
  shipped:           { label: '已发货',    color: 'bg-blue-500',   textColor: 'text-white', marqueeColor: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-600',   dot: 'bg-blue-500', icon: 'truck' },
  in_transit:        { label: '运输中',    color: 'bg-amber-500',  textColor: 'text-white', marqueeColor: 'bg-amber-500',  badge: 'bg-amber-100 text-amber-600', dot: 'bg-amber-500', icon: 'plane' },
  in_local_transit:  { label: '目的国运输', color: 'bg-amber-500', textColor: 'text-white', marqueeColor: 'bg-amber-500', badge: 'bg-amber-100 text-amber-600', dot: 'bg-amber-500', icon: 'truck' },
  at_customs:        { label: '清关中',    color: 'bg-amber-500',  textColor: 'text-white', marqueeColor: 'bg-amber-500',  badge: 'bg-amber-100 text-amber-600', dot: 'bg-amber-500', icon: 'shield' },
  not_delivered:     { label: '未送达',    color: 'bg-red-500',    textColor: 'text-white', marqueeColor: 'bg-red-500',   badge: 'bg-red-100 text-red-600',     dot: 'bg-red-500', icon: 'alert-triangle' },
  delivered:         { label: '已签收',    color: 'bg-emerald-500',textColor: 'text-white', marqueeColor: 'bg-emerald-500',badge: 'bg-emerald-100 text-emerald-600',dot:'bg-emerald-500', icon: 'check-circle' },
  failed:            { label: '异常',      color: 'bg-red-500',    textColor: 'text-white', marqueeColor: 'bg-red-500',   badge: 'bg-red-100 text-red-600',     dot: 'bg-red-500', icon: 'x-circle' },
  exception:         { label: '异常',      color: 'bg-red-500',    textColor: 'text-white', marqueeColor: 'bg-red-500',   badge: 'bg-red-100 text-red-600',     dot: 'bg-red-500', icon: 'x-circle' },
  returned:          { label: '退回',      color: 'bg-purple-500', textColor: 'text-white', marqueeColor: 'bg-purple-500',badge: 'bg-purple-100 text-purple-600',dot:'bg-purple-500', icon: 'rotate-ccw' },
  delayed:           { label: '延误',      color: 'bg-red-500',    textColor: 'text-white', marqueeColor: 'bg-red-500',   badge: 'bg-red-100 text-red-600',     dot: 'bg-red-500', icon: 'alert-circle' },
  pending_recovery:  { label: '待取回',    color: 'bg-red-500',    textColor: 'text-white', marqueeColor: 'bg-red-500',   badge: 'bg-red-100 text-red-600',     dot: 'bg-red-500', icon: 'refresh-cw' },
};

const SITE_FLAGS = {
  MLM: '🇲🇽', MLB: '🇧🇷', MLA: '🇦🇷', MCO: '🇨🇴', MLC: '🇨🇱', MLU: '🇺🇾',
};

const DEFAULT_FLAG = '🌐';

// ─── Logistics Detail Modal ──────────────────────────────────────────────────
const LogisticsDetailModal = ({ order, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!order) return;
    fetch(`/api/logistics/detail?id=${order.id}`)
      .then(r => r.json())
      .then(data => {
        setDetails(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [order]);

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white">
              <Icon name="truck" className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900">物流全链路追踪</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">#{order.tracking_id || 'N/A'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors">
            <Icon name="x" className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Order Brief */}
          <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <img src={order.thumbnail} className="w-16 h-16 rounded-xl object-cover" alt="" />
            <div className="flex-1">
              <p className="text-xs font-black text-slate-800 line-clamp-1">{order.product_name}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-600 rounded-lg font-black">{order.logistic_company || '官方物流'}</span>
                <span className="text-[10px] font-bold text-slate-400">{SITE_FLAGS[order.site_id]} {order.site_id}</span>
              </div>
            </div>
          </div>

          {/* Risk Alert if any */}
          {details?.risk && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
              <Icon name="alert-triangle" className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-red-700">异常风险警示</p>
                <p className="text-[11px] text-red-600/80 font-medium mt-0.5">{details.risk.message}</p>
              </div>
            </div>
          )}

          {/* Timeline */}
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
              {details?.events?.map((ev, i) => (
                <div key={i} className="relative">
                  {/* Point */}
                  <div className={`absolute -left-8 top-1.5 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center shadow-sm z-10 ${i === 0 ? 'bg-blue-500' : 'bg-slate-200'}`}>
                    {i === 0 && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-black ${i === 0 ? 'text-blue-600' : 'text-slate-900'}`}>{ev.desc}</span>
                      <span className="text-[9px] text-slate-400 font-bold">{ev.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">{ev.location}</p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4 text-slate-400 text-xs font-medium">暂无详细轨迹信息</div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
           <button className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[11px] font-black hover:bg-slate-800 transition-colors">导出报告</button>
        </div>
      </div>
    </div>
  );
};

const getStatusConfig = (ts, ss) => {
  // 优先用 shipments API 的 tracking_status，其次 shipping_substatus，最后 shipping_status
  if (ts && STATUS_MAP[ts]) return STATUS_MAP[ts];
  if (ss && STATUS_MAP[ss]) return STATUS_MAP[ss];
  return { label: ts || ss || '-', color: 'bg-slate-400', textColor: 'text-white', marqueeColor: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
};

const getProgressStage = (ts, ss) => {
  // 物流进度节点：0=发货前 1=已发货 2=运输中 3=已签收
  if (ts === 'delivered') return 3;
  if (['in_transit', 'in_local_transit'].includes(ts)) return 2;
  if (['shipped', 'picked_up'].includes(ts)) return 1;
  if (['pending', 'ready_to_ship'].includes(ts)) return 0;
  return 1; // 有 tracking_id 默认视为已发货
};

// 4-node labels
const PROGRESS_LABELS = ['发货', '中转', '目的', '签收'];

// Progress node colors keyed by stage (0-3)
const PROGRESS_NODE_COLORS = [
  'border-slate-300',
  'border-slate-300',
  'border-slate-300',
  'border-slate-300',
];

// ─── Progress Bar Component ──────────────────────────────────────────────────
const ProgressBar = ({ stage }) => {
  return (
    <div className="mt-3">
      {/* Track + nodes */}
      <div className="relative flex items-center">
        {/* Filled track */}
        <div
          className="absolute h-0.5 bg-gradient-to-r from-blue-400 to-emerald-400"
          style={{
            left: '12px',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: `calc(${Math.min(stage / 3, 1) * 100}% - 24px)`,
          }}
        />
        {/* Unfilled track */}
        <div
          className="absolute h-0.5 bg-slate-200"
          style={{
            left: `calc(${Math.min(stage / 3, 1) * 100}% * (100% - 24px) / 100% + 12px)`,
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        />

        {PROGRESS_LABELS.map((label, i) => {
          const isDone = i <= stage;
          const isActive = i === stage;
          return (
            <div key={i} className="flex flex-col items-center z-10" style={{ flex: i === 0 ? '0 0 auto' : i === 3 ? '0 0 auto' : '1 0 0' }}>
              {/* Node circle */}
              <div
                className={`
                  rounded-full border-2 flex items-center justify-center
                  transition-all duration-500
                  ${isDone ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300'}
                  ${isActive ? 'w-4 h-4 shadow-md shadow-blue-200' : 'w-3 h-3'}
                `}
              >
                {isDone && !isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                {isActive && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
              </div>
              {/* Label */}
              <span className={`text-[9px] font-black mt-1.5 uppercase tracking-widest whitespace-nowrap ${isActive ? 'text-blue-600' : isDone ? 'text-slate-600' : 'text-slate-300'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Logistics Card ─────────────────────────────────────────────────────────
const LogisticsCard = ({ order, onClick }) => {
  // 优先级：tracking_status(shipments API) > shipping_substatus > shipping_status
  const ts = order.tracking_status || order.shipping_substatus || order.shipping_status;
  const ss = order.shipping_substatus || order.shipping_status;
  const status = getStatusConfig(order.tracking_status, ss);
  const stage = getProgressStage(order.tracking_status, ss);
  const flag = SITE_FLAGS[order.site_id] || DEFAULT_FLAG;

  // 物流商：优先用 logistic_company（shipments API），回退 logistic_type
  const logisticCompany = order.logistic_company || order.logistic_type || order.logistics_type || '未知';
  // 收件地
  const receiverAddr = order.receiver_city || order.receiver_state
    ? `${order.receiver_city || ''}${order.receiver_state ? ', ' + order.receiver_state : ''}`
    : null;

  const imgUrl = order.thumbnail || `https://picsum.photos/seed/${order.id || 'default'}/200/200`;

  // Risk detection logic
  const isHighRisk = ['failed', 'exception', 'returned', 'delayed', 'not_delivered'].includes(ts) || (ts === 'at_customs');

  return (
    <div 
      onClick={() => onClick(order)}
      className="solid-card rounded-[24px] p-5 border border-slate-200 bg-white hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/80 transition-all duration-300 cursor-pointer group relative"
    >
      {/* Risk Indicator */}
      {isHighRisk && (
        <div className="absolute -top-1 -right-1 z-20 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg animate-bounce">
          <Icon name="alert-triangle" className="w-4 h-4" />
        </div>
      )}

      {/* Image */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-50 mb-4" style={{ height: '140px' }}>
        <img
          src={imgUrl}
          alt={order.product_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.style.background = 'linear-gradient(135deg, #f1f5f9, #e2e8f0)';
          }}
        />
        {/* Status badge overlay */}
        <div className={`absolute top-2.5 right-2.5 ${status.badge} px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm`}>
          {status.label}
        </div>
        {/* Site flag */}
        <div className="absolute bottom-2 left-2.5 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-black shadow-sm">
          {flag}
        </div>
      </div>

      {/* Product name */}
      <p className="text-[12px] font-black text-slate-800 line-clamp-2 leading-tight mb-3">
        {order.product_name || '未知商品'}
      </p>

      {/* Info rows */}
      <div className="space-y-2 mb-1">
        <div className="flex justify-between items-center">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">运单号</span>
          <span className="text-[10px] font-black text-slate-600 font-mono tracking-tight">
            {order.tracking_id ? `#${order.tracking_id}` : '待生成'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">物流商</span>
          <span className="text-[10px] font-black text-slate-600">{logisticCompany}</span>
        </div>
        {receiverAddr && (
          <div className="flex justify-between items-center">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">收件地</span>
            <span className="text-[10px] font-black text-slate-600">{receiverAddr}</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <ProgressBar stage={stage} />
    </div>
  );
};

// ─── Marquee Component ──────────────────────────────────────────────────────
const MarqueeTicker = ({ orders }) => {
  if (!orders || orders.length === 0) return null;
  // Duplicate for seamless loop
  const items = [...orders, ...orders];

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm mb-5">
      <div
        className="flex items-center"
        style={{
          animation: 'marquee 40s linear infinite',
          width: 'max-content',
        }}
      >
        {items.map((order, i) => {
          const status = getStatusConfig(order.tracking_status, order.shipping_substatus || order.shipping_status);
          const flag = SITE_FLAGS[order.site_id] || DEFAULT_FLAG;
          const imgUrl = order.thumbnail || `https://picsum.photos/seed/${order.id || 'default'}/60/60`;
          const updateTime = order.order_date
            ? new Date(order.order_date.replace(' ', 'T')).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
            : '-';

          return (
            <div
              key={`${order.id}-${i}`}
              className="flex items-center gap-3 px-5 py-3 border-r border-slate-100 flex-shrink-0"
              style={{ minWidth: 'max-content' }}
            >
              {/* Mini image */}
              <img
                src={imgUrl}
                alt=""
                className="w-9 h-9 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.style.background = '#f1f5f9';
                }}
              />
              {/* Info */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black">{flag}</span>
                  <span className="text-[10px] font-black text-slate-700 line-clamp-1 max-w-[120px]">
                    {order.product_name || '未知商品'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block px-1.5 py-0.5 rounded-full text-[8px] font-black text-white uppercase ${status.marqueeColor}`}>
                    {status.label}
                  </span>
                  <span className="text-[8px] text-slate-400 font-medium">{updateTime}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main View ──────────────────────────────────────────────────────────────
const LogisticsAlertsView = (props) => {
  const { activeShop, shopList, showToast } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    const url = activeShop ? `/api/orders?group=${encodeURIComponent(activeShop)}` : '/api/orders';
    fetch(url)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.orders || []);
        setOrders(list);
        setIsLoading(false);
      })
      .catch(err => {
        if (showToast) showToast(`加载物流数据失败: ${err.message}`, 'error');
        setIsLoading(false);
      });
  }, [activeShop]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin"></div>
      <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">正在同步物流状态...</span>
    </div>
  );

  // Filter groups: 同时参考 tracking_status（shipments API）和 shipping_status
  const getEffectiveStatus = (o) => o.tracking_status || o.shipping_status;
  const getEffectiveSubstatus = (o) => o.shipping_substatus;

  const filterGroups = {
    all: orders,
    transit: orders.filter(o => {
      const s = getEffectiveStatus(o); const ss = getEffectiveSubstatus(o);
      return ['shipped', 'in_transit', 'in_local_transit', 'at_customs'].includes(s) || ['picked_up', 'in_transit', 'in_local_transit', 'at_customs'].includes(ss);
    }),
    pending: orders.filter(o => {
      const s = getEffectiveStatus(o);
      return ['pending', 'ready_to_ship'].includes(s);
    }),
    delivered: orders.filter(o => {
      const s = getEffectiveStatus(o); const ss = getEffectiveSubstatus(o);
      return s === 'delivered' || ss === 'delivered';
    }),
    exception: orders.filter(o => {
      const s = getEffectiveStatus(o); const ss = getEffectiveSubstatus(o);
      return ['failed', 'exception', 'returned', 'delayed', 'not_delivered', 'pending_recovery'].includes(s) || ['failed', 'exception', 'returned'].includes(ss);
    }),
  };

  const FILTERS = [
    { key: 'all',        label: '全部',   color: 'slate',  icon: '📦' },
    { key: 'transit',    label: '在途',   color: 'blue',   icon: '🚚' },
    { key: 'pending',    label: '待取件', color: 'amber',  icon: '📋' },
    { key: 'delivered',  label: '已签收', color: 'emerald',icon: '✅' },
    { key: 'exception',  label: '异常',   color: 'red',    icon: '⚠️' },
  ];

  const currentOrders = filterGroups[activeFilter] || [];

  // Get latest 5 for marquee (prioritize non-pending, non-delivered)
  const marqueeOrders = [...orders]
    .sort((a, b) => {
      // Prioritize: in-transit > pending > delivered > others
      const getMarqueeStatus = (o) => o.tracking_status || o.shipping_status;
      const priority = (o) => {
        const s = getMarqueeStatus(o);
        if (['shipped', 'in_transit', 'in_local_transit', 'at_customs', 'picked_up'].includes(s)) return 0;
        if (['pending', 'ready_to_ship'].includes(s)) return 1;
        if (['delivered'].includes(s)) return 3;
        if (['failed', 'exception', 'returned', 'delayed', 'not_delivered', 'pending_recovery'].includes(s)) return 2;
        return 4;
      };
      return priority(a) - priority(b);
    })
    .slice(0, 5);

  const getFilterBtnClass = (filter) => {
    const isActive = activeFilter === filter.key;
    const colorMap = {
      slate:   { active: 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200' },
      blue:    { active: 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-200' },
      amber:   { active: 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-200' },
      emerald: { active: 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200' },
      red:     { active: 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-200' },
    };
    const cmap = colorMap[filter.color] || colorMap.slate;
    return isActive
      ? `${cmap.active}`
      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50';
  };

  return (
    <div className="space-y-5 px-6 py-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-[32px] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Operations Command</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter">物流指挥中心 <span className="text-blue-500">PRO</span></h3>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">在途总数</p>
            <p className="text-xl font-black text-slate-900">{filterGroups.transit.length}</p>
          </div>
          <div className="w-[1px] h-10 bg-slate-100 mx-2"></div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">异常告警</p>
            <p className="text-xl font-black text-red-500">{filterGroups.exception.length}</p>
          </div>
        </div>
      </div>

      {/* Marquee Ticker */}
      <MarqueeTicker orders={marqueeOrders} />

      {/* Filter Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map(filter => {
          const cnt = (filterGroups[filter.key] || []).length;
          return (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-[11px] font-black transition-all duration-200 ${getFilterBtnClass(filter)}`}
            >
              {filter.icon}{filter.label}
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-lg text-[10px] ${
                activeFilter === filter.key
                  ? 'bg-white/20 text-white'
                  : cnt > 0
                    ? filter.color === 'red' ? 'bg-red-100 text-red-600'
                    : filter.color === 'amber' ? 'bg-amber-100 text-amber-600'
                    : filter.color === 'emerald' ? 'bg-emerald-100 text-emerald-600'
                    : filter.color === 'blue' ? 'bg-blue-100 text-blue-600'
                    : 'bg-slate-100 text-slate-400'
                    : 'bg-slate-100 text-slate-400'
              }`}>
                {cnt}
              </span>
            </button>
          );
        })}
      </div>

      {/* Card Grid */}
      {currentOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
          <Icon name="package" className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-black text-slate-500 uppercase tracking-widest">暂无相关订单</p>
          <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-widest">当前分类下没有需要处理的包裹</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentOrders.map(order => (
            <LogisticsCard key={order.id} order={order} onClick={setSelectedOrder} />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedOrder && (
        <LogisticsDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}

      {/* Marquee keyframe injection */}
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default LogisticsAlertsView;

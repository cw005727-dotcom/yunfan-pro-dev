// 国际物流状态 - 独立页面
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Row, Col, Select, Spin, Empty, Tooltip as AntTooltip, Tag, Drawer, Button } from 'antd';
import { 
  Truck, Package, Clock, AlertCircle, CheckCircle, Printer, 
  Download, RefreshCw, Box, ShoppingCart, ArrowUpRight, Globe, User, Activity, Search
} from 'lucide-react';

const API = '/api';

const SITE_MAP = {
  'MLM': '🇲🇽 墨西哥',
  'MLB': '🇧🇷 巴西',
  'MLA': '🇦🇷 阿根廷',
  'MLC': '🇨🇱 智利',
  'MCO': '🇨🇴 哥伦比亚',
  'MLU': '🇺🇾 乌拉圭'
};

const PREMIUM_STYLES = `
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes fadeSlideUp { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
  .premium-glass-card { background: white; border: 1px solid rgba(16, 173, 111, 0.08); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02); }
  .premium-scrollbar-hide::-webkit-scrollbar { display: none; }
  .premium-scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
`;

function KPIBlockMini({ label, value, sub, colorClass, delay = 0 }) {
  return (
    <div className={'rounded-xl p-4 flex flex-col justify-between border shadow-sm ' + colorClass}
      style={{ animation: 'fadeSlideUp 0.5s ease-out ' + delay + 'ms both' }}>
      <div className="text-[10px] font-black opacity-90 uppercase tracking-widest leading-none">{label}</div>
      <div className="mt-2">
        <div className="text-[20px] font-black tracking-tight leading-none">{value}</div>
        {sub && <div className="text-[10px] font-bold opacity-60 mt-1 leading-none">{sub}</div>}
      </div>
    </div>
  );
}

function MainIntlCard({ stats }) {
  const delivered = stats?.delivered || 0;
  const todayDelivered = stats?.today_delivered || 0;
  return (
    <div className="h-full bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-emerald-200/50">
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl -mr-24 -mt-24" />
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          <span className="text-[11px] font-black text-emerald-100/90 tracking-[2px]">已签收</span>
        </div>
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-white text-4xl font-black">{delivered}<span className="text-lg opacity-60 ml-1">单</span></span>
            <span className="text-emerald-200 text-[13px] font-bold">已签收订单</span>
          </div>
          <div className="h-px bg-white/10" />
          <div className="flex items-baseline justify-between">
            <span className="text-white text-3xl font-black">{todayDelivered}<span className="text-base opacity-60 ml-1">单</span></span>
            <span className="text-emerald-200 text-[13px] font-bold">今日新增签收</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WarningIntlCard({ stats }) {
  const issues = stats?.issues || 0;
  return (
    <div className="h-full bg-gradient-to-br from-rose-600 to-rose-800 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-rose-200/50">
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl -mr-24 -mt-24" />
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-rose-300 animate-pulse" />
            <span className="text-[11px] font-black text-rose-100/90 tracking-[2px]">异常预警</span>
          </div>
          <div className="text-[42px] font-black text-white leading-none mb-1">{issues}</div>
          <div className="text-[12px] font-bold text-rose-200 mt-1 flex items-center gap-1">物流异常订单 <AlertCircle size={14} /></div>
        </div>
        <div className="pt-4 border-t border-rose-500/30">
          <div className="text-[12px] font-bold text-rose-200 flex items-center gap-1">需重点关注 <ArrowUpRight size={14} strokeWidth={3} /></div>
          <div className="mt-1 text-[8px] text-rose-300/60 font-bold uppercase tracking-widest">物流异常</div>
        </div>
      </div>
    </div>
  );
}

function IntlTimeline({ currentStep }) {
  const [animWidth, setAnimWidth] = React.useState('0px');
  React.useEffect(() => {
    let timer;
    const targetPct = Math.min((currentStep / 4) * 100, 100);
    const targetW = 'calc(' + targetPct + '% - 0px)';
    let growing = true;
    const tick = () => {
      if (growing) { setAnimWidth(targetW); growing = false; timer = setTimeout(tick, 2500); }
      else { setAnimWidth('0px'); growing = true; timer = setTimeout(tick, 400); }
    };
    setAnimWidth('0px');
    timer = setTimeout(tick, 300);
    return () => clearTimeout(timer);
  }, [currentStep]);
  const steps = [
    { key: 'ordered', label: '已下单' },
    { key: 'cleared', label: '已出关' },
    { key: 'transit', label: '运输中' },
    { key: 'arrived', label: '到达目的国' },
    { key: 'signed', label: '已签收' }
  ];
  return (
    <div className="relative flex items-center justify-between px-2 w-full max-w-[400px]">
      <div className="absolute left-5 right-5 top-[9px] h-0 border-t border-dashed border-slate-200" />
      <div className="absolute left-5 top-[8px] h-[2px] bg-emerald-500 rounded-full transition-all duration-1000 ease-out" style={{ width: animWidth }} />
      {steps.map((s, idx) => {
        const isActive = idx <= currentStep;
        return (
          <div key={s.key} className="relative flex flex-col items-center gap-0.5 z-10">
            <div className={(isActive ? 'bg-emerald-500 scale-110 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white border-2 border-slate-300') + ' w-3 h-3 rounded-full transition-all duration-500 ease-out'}>
              {isActive && <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute opacity-40" />}
            </div>
            <span className={(isActive ? 'text-emerald-600' : 'text-slate-400') + ' text-[9px] font-black tracking-tight whitespace-nowrap transition-colors duration-300'}>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function LogisticsIntlView_V5() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeCard, setActiveCard] = useState('delivered');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const getIntlStep = (order) => {
    const status = order.shipping_status || '';
    const sub = order.shipping_substatus || '';
    if (status === 'delivered') return 4;
    if (sub === 'left_customs') return 1;
    if (status === 'shipped' || status === 'in_transit') return 2;
    if (status === 'ready_to_ship' || status === 'pending') return 0;
    return 0;
  };

  const filteredOrders = useMemo(() => {
    if (!orders.length) return [];
    const todayStr = new Date().toISOString().slice(0,10);
    switch (activeCard) {
      case 'delivered': return orders.filter(o => o.shipping_status === 'delivered');
      case 'transit': return orders.filter(o => o.shipping_status === 'shipped' && o.shipping_substatus !== 'left_customs');
      case 'customs': return orders.filter(o => o.shipping_substatus === 'left_customs');
      case 'pending': return orders.filter(o => o.shipping_status === 'ready_to_ship' || o.shipping_status === 'pending');
      case 'today': return orders.filter(o => o.order_date && o.order_date.slice(0,10) === todayStr && o.shipping_status === 'delivered');
      case 'warning': return orders.filter(o => ['not_delivered','cancelled'].includes(o.shipping_status));
      default: return orders;
    }
  }, [orders, activeCard]);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch(API + '/logistics/intl/dashboard').then(r => r.json()),
      fetch(API + '/orders?limit=200').then(r => r.json()),
    ]).then(([s, d]) => {
      setStats(s);
      setOrders(d.orders || []);
    }).catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="h-full bg-slate-50 flex flex-col overflow-hidden font-sans select-none">
      <style dangerouslySetInnerHTML={{ __html: PREMIUM_STYLES }} />
      
      <div className="h-[75px] bg-white border-b border-slate-200 border-t-[3px] border-t-emerald-600 px-6 flex items-center justify-between shrink-0 relative z-50 shadow-sm">
        <div className="flex flex-col">
          <h2 className="text-[18px] font-black text-slate-800 tracking-tight">国际物流监测</h2>
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-[1.5px]">International Logistics</span>
        </div>
        <button onClick={fetchData} className="h-[36px] px-5 bg-emerald-600 text-white rounded-lg flex items-center gap-2 text-[11px] font-black hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-200/50"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} />同步国际物流</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 premium-scrollbar-hide">
        <div className="flex gap-5">
          <div className={'flex-1 min-w-0 cursor-pointer transition-all ' + (activeCard === 'delivered' ? 'ring-2 ring-emerald-400 rounded-2xl' : 'opacity-80 hover:opacity-100')} onClick={() => setActiveCard('delivered')}><MainIntlCard stats={stats} /></div>
          <div className="flex-[2] grid grid-cols-2 gap-4 min-w-0">
             <div className={'rounded-xl p-4 flex flex-col justify-between border shadow-sm cursor-pointer transition-all ' + (activeCard === 'transit' ? 'ring-2 ring-blue-400' : 'opacity-80 hover:opacity-100') + ' bg-blue-50 border-blue-100'} onClick={() => setActiveCard('transit')}>
                <div className="text-[10px] font-black text-blue-700 opacity-90 uppercase tracking-widest leading-none">运输中</div>
                <div className="mt-2">
                  <div className="text-[20px] font-black text-blue-700 tracking-tight leading-none">{stats?.in_transit || 0}<span className="text-[12px] opacity-70 ml-1">单</span></div>
                </div>
             </div>
             <div className={'rounded-xl p-4 flex flex-col justify-between border shadow-sm cursor-pointer transition-all ' + (activeCard === 'customs' ? 'ring-2 ring-indigo-400' : 'opacity-80 hover:opacity-100') + ' bg-indigo-50 border-indigo-100'} onClick={() => setActiveCard('customs')}>
                <div className="text-[10px] font-black text-indigo-700 opacity-90 uppercase tracking-widest leading-none">已出关</div>
                <div className="mt-2">
                  <div className="text-[20px] font-black text-indigo-700 tracking-tight leading-none">{stats?.cleared_customs || 0}<span className="text-[12px] opacity-70 ml-1">单</span></div>
                </div>
             </div>
             <div className={'rounded-xl p-4 flex flex-col justify-between border shadow-sm cursor-pointer transition-all ' + (activeCard === 'pending' ? 'ring-2 ring-purple-400' : 'opacity-80 hover:opacity-100') + ' bg-purple-50 border-purple-100'} onClick={() => setActiveCard('pending')}>
                <div className="text-[10px] font-black text-purple-700 opacity-90 uppercase tracking-widest leading-none">待发货</div>
                <div className="mt-2">
                  <div className="text-[20px] font-black text-purple-700 tracking-tight leading-none">{stats?.pending_ship || 0}<span className="text-[12px] opacity-70 ml-1">单</span></div>
                </div>
             </div>
             <div className={'rounded-xl p-4 flex flex-col justify-between border shadow-sm cursor-pointer transition-all ' + (activeCard === 'today' ? 'ring-2 ring-amber-400' : 'opacity-80 hover:opacity-100') + ' bg-amber-50 border-amber-100'} onClick={() => setActiveCard('today')}>
                <div className="text-[10px] font-black text-amber-700 opacity-90 uppercase tracking-widest leading-none">今日新增签收</div>
                <div className="mt-2">
                  <div className="text-[20px] font-black text-amber-700 tracking-tight leading-none">{stats?.today_delivered || 0}<span className="text-[12px] opacity-70 ml-1">单</span></div>
                </div>
             </div>
          </div>
          <div className={'flex-1 min-w-0 cursor-pointer transition-all ' + (activeCard === 'warning' ? 'ring-2 ring-rose-400 rounded-2xl' : 'opacity-80 hover:opacity-100')} onClick={() => setActiveCard('warning')}>
             <WarningIntlCard stats={stats} />
          </div>
        </div>

        <div className="premium-glass-card rounded-2xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
              <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">国际物流订单</h3>
            </div>
            <div className="px-3 py-1 bg-slate-100 rounded-lg text-[11px] font-black text-slate-500"><ShoppingCart size={14} /> {filteredOrders.length} 单</div>
          </div>
          <div className="overflow-x-auto premium-scrollbar-hide">
            <table className="w-full text-left border-collapse" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{width:'25%'}}>订单详情</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{width:'38%'}}>国际物流链路</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{width:'20%'}}>追踪号</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{width:'17%'}}>物流状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr><td colSpan={4}><Empty className="py-20" description="暂无订单数据" /></td></tr>
                ) : filteredOrders.map((order, i) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => { setCurrentOrder(order); setDrawerVisible(true); }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={order.thumbnail ? ('https://http2.mlstatic.com/D_' + order.thumbnail.split('-O.')[0].split('_').pop() + '-F.jpg') : 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                        <div className="flex flex-col">
                          <span className="text-[12px] font-black text-slate-800">#{order.id}</span>
                          <span className="text-[10px] font-bold text-slate-300">{SITE_MAP[order.site_id] || order.site_id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><IntlTimeline currentStep={getIntlStep(order)} /></td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-mono font-bold text-slate-600 truncate">{order.tracking_id || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold text-slate-500">
                          {order.shipping_status === 'delivered' ? '已签收' : order.shipping_status === 'shipped' ? '运输中' : order.shipping_status === 'ready_to_ship' ? '待发货' : order.shipping_status === 'cancelled' ? '已取消' : order.shipping_status === 'not_delivered' ? '未妥投' : (order.shipping_status || '-')}
                        </span>
                        {order.shipping_substatus && <span className="text-[9px] font-bold text-slate-400">{order.shipping_substatus}</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Drawer title="订单物流详情" placement="right" width={480} onClose={() => setDrawerVisible(false)} open={drawerVisible}>
        {currentOrder && (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div>
                <h4 className="text-[16px] font-black mb-1">{currentOrder.id}</h4>
                <span className="text-[11px] font-bold text-slate-400">{currentOrder.site_id}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b"><span className="font-black text-slate-400">下单时间</span><span className="font-bold">{currentOrder.order_date}</span></div>
              <div className="flex justify-between py-3 border-b"><span className="font-black text-slate-400">物流状态</span><span className="font-bold">{currentOrder.shipping_status}{currentOrder.shipping_substatus ? ' (' + currentOrder.shipping_substatus + ')' : ''}</span></div>
              <div className="flex justify-between py-3 border-b"><span className="font-black text-slate-400">追踪号</span><span className="font-bold text-blue-600">{currentOrder.tracking_id || '-'}</span></div>
              <div className="flex justify-between py-3 border-b"><span className="font-black text-slate-400">物流公司</span><span className="font-bold">{currentOrder.logistic_company || '-'}</span></div>
              <div className="flex justify-between py-3 border-b"><span className="font-black text-slate-400">收货地址</span><span className="font-bold">{currentOrder.receiver_city || '-'}{currentOrder.receiver_state ? ', ' + currentOrder.receiver_state : ''}</span></div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

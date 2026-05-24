import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Row, Col, Select, Spin, Empty, Segmented, Tooltip as AntTooltip, Progress, Tag, Drawer, Button } from 'antd';
import { 
  Truck, Package, Clock, AlertCircle, CheckCircle, Printer, 
  Download, RefreshCw, Filter, MoreHorizontal, Box, 
  ShoppingCart, BarChart2, ChevronRight, ArrowUpRight, Globe, User, Activity, Search
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
  @keyframes pulseSubtle { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
  
  .premium-glass-card {
    background: white;
    border: 1px solid rgba(16, 173, 111, 0.08);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .premium-glass-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(16, 173, 111, 0.06);
    border-color: rgba(16, 173, 111, 0.2);
  }
  .premium-segmented .ant-segmented-item-selected {
    background: #10b981 !important;
    color: white !important;
    font-weight: 900 !important;
  }
  .premium-segmented {
    background: #f1f5f9 !important;
    padding: 2px !important;
    border-radius: 8px !important;
  }
  .premium-filter-label {
    font-size: 8px;
    font-weight: 900;
    color: #94a3b8;
    margin-bottom: 2px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .lifecycle-node {
    position: relative;
    z-index: 10;
  }
  .lifecycle-line {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    height: 2px;
    background: #f1f5f9;
    z-index: 5;
  }
  .lifecycle-line-active {
    background: #10b981;
    transition: width 0.8s ease-in-out;
  }
  .premium-scrollbar-hide::-webkit-scrollbar { display: none; }
`;

function KPIBlockMini({ label, value, sub, colorClass, delay = 0, icon: IconComp }) {
  return (
    <div 
      className={`premium-glass-card rounded-xl p-4 flex flex-col justify-between ${colorClass}`}
      style={{ animation: `slideUp 0.5s ease-out ${delay}ms both` }}
    >
      <div className="flex justify-between items-start">
        <div className="text-[10px] font-black opacity-60 uppercase tracking-widest leading-none">{label}</div>
        {IconComp && <IconComp size={14} className="opacity-40" />}
      </div>
      <div className="mt-3">
        <div className="text-[20px] font-black tracking-tight leading-none">{value}</div>
        {sub && <div className="text-[10px] font-bold opacity-40 mt-1 leading-none">{sub}</div>}
      </div>
    </div>
  );
}

function MainLogisticsCard({ stats, day, title, delay = 0 }) {
  let prefix = 'yesterday';
  if (day === 'daybefore') prefix = 'daybefore';
  if (day === 'thirdday') prefix = 'thirdday';
  const total = stats?.[prefix + '_total'] || 0;
  const h12 = stats?.[prefix + '_h12_shipped'] || 0;
  const h24 = stats?.[prefix + '_h24_shipped'] || 0;
  const over24 = stats?.[prefix + '_over24_unshipped'] || 0;
  const dateLabel = stats?.[prefix + '_date'] || '';

  return (
    <div 
      className="h-full bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-emerald-200/50"
      style={{ animation: 'slideUp 0.5s ease-out 0ms both' }}
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl -mr-24 -mt-24" />
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span className="text-[11px] font-black text-emerald-100/90 tracking-[2px]">{title} / {dateLabel}</span>
          </div>
          <div className="space-y-1">
            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <span className="text-white text-4xl font-black">{total}<span className="text-xl opacity-60 ml-1">单</span></span>
                <span className="text-emerald-200 text-[10px] font-bold tracking-wider">总订单</span>
              </div>
              <div className="flex justify-between text-[13px] font-black">
                <span className="text-emerald-200">12h已发 <span className="text-white">{h12}</span></span>
                <span className="text-emerald-200">24h已发 <span className="text-white">{h24}</span></span>
                <span className="text-emerald-200">未发 <span className="text-white">{over24}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function WarningCard({ stats }) {
  const over48 = stats?.over_48h_warning || 0;
  return (
    <div className="h-full bg-gradient-to-br from-rose-600 to-rose-800 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-rose-200/50">
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl -mr-24 -mt-24" />
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-rose-300 animate-pulse" />
            <span className="text-[11px] font-black text-rose-100/90 tracking-[2px]">红区预警 / OVERDUE</span>
          </div>
          <div className="text-[42px] font-black text-white leading-none mb-1">{over48}</div>
          <div className="text-[12px] font-bold text-rose-200 mt-1 flex items-center gap-1">超过48小时未发货 <AlertCircle size={14} /></div>
        </div>
        <div className="pt-4 border-t border-rose-500/30">
          <div className="text-[12px] font-bold text-rose-200 flex items-center gap-1">需重点关注处理 <ArrowUpRight size={14} strokeWidth={3} /></div>
          <div className="mt-1 text-[8px] text-rose-300/60 font-bold uppercase tracking-widest">超48H未发货预警</div>
        </div>
      </div>
    </div>
  );
}

function LifecycleTimeline({ currentStep }) {
  const [animWidth, setAnimWidth] = React.useState('0px');
  React.useEffect(() => {
    let timer;
    const targetPct = Math.min((currentStep / 4) * 100, 100);
    const targetW = 'calc(' + targetPct + '% - ' + (currentStep >= 4 ? 0 : 0) + 'px)';
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
    { key: 'ordered', label: '平台下单' },
    { key: 'shipped', label: '1688发货' },
    { key: 'labeled', label: '已贴单' },
    { key: 'inbound', label: '已入仓' },
    { key: 'air', label: '已上飞机' }
  ];
  return (
    <div className="relative flex items-center justify-between max-w-[320px] ml-0 px-0">
      <div className="absolute left-5 right-5 top-[9px] h-0 border-t border-dashed border-slate-200" />
      <div className="absolute left-5 top-[8px] h-[2px] bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
        style={{ width: animWidth }} />
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


export default function LogisticsAlertsView_V5() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  
  const [selectedSite, setSelectedSite] = useState(null);
  
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [activeCard, setActiveCard] = useState('yesterday');

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedSite) params.append('site', selectedSite);

    fetch(`${API}/logistics/tracking?${params.toString()}`)
      .then(async r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => {
        const allOrders = [];
        if (data.orders_by_date) {
          Object.keys(data.orders_by_date).sort().reverse().forEach(date => {
            data.orders_by_date[date].forEach(o => {
              allOrders.push({
                order_number: o.order_number,
                order_date: o.order_date,
                site: o.site,
                store_name: o.store_name,
                salesperson: o.salesperson || '',
                status: o.stage_name,
                purchase_order_no: o.logistics_1688_order,
                purchase_tracking: o.logistics_1688_tracking,
                waybill_no: o.logistics_1688_tracking,
                prepare_time: o.warehouse_in_date,
                delivery_time: o.international_tracking ? o.order_date : '',
                amount_usd: 0,
                profit: 0,
                buyer_name: '',
                city: '',
                carrier: '',
                tracking_no: o.international_tracking,
                thumbnail: o.thumbnail || '',
                created_at: o.order_date,
                stage_code: o.stage_code,
                stage_icon: o.stage_icon,
                stage_name: o.stage_name,
                label_status: o.label_status,
                warehouse_in_date: o.warehouse_in_date,
                logistics_1688_tracking: o.logistics_1688_tracking,
                international_tracking: o.international_tracking,
              });
            });
          });
        }
        setStats({
          cloud_labeled: data.cloud_labeled || 0,
          warehouse_received: data.warehouse_received || 0,
          yesterday_date: data.yesterday_date,
          yesterday_total: data.yesterday_total,
          yesterday_h12_shipped: data.yesterday_h12_shipped,
          yesterday_h24_shipped: data.yesterday_h24_shipped,
          yesterday_over24_unshipped: data.yesterday_over24_unshipped,
          daybefore_date: data.daybefore_date,
          daybefore_total: data.daybefore_total,
          daybefore_h12_shipped: data.daybefore_h12_shipped,
          daybefore_h24_shipped: data.daybefore_h24_shipped,
          daybefore_over24_unshipped: data.daybefore_over24_unshipped,
          thirdday_date: data.thirdday_date,
          thirdday_total: data.thirdday_total,
          thirdday_h12_shipped: data.thirdday_h12_shipped,
          thirdday_h24_shipped: data.thirdday_h24_shipped,
          thirdday_over24_unshipped: data.thirdday_over24_unshipped,
          today_total: data.today_total,
          today_purchased: data.purchased_count || data.purchased_count_today || 0,
          today_inbound: allOrders.filter(o => o.stage_code >= 3).length,
          today_labeled: allOrders.filter(o => o.stage_code >= 4).length,
          today_shipped: allOrders.filter(o => o.stage_code >= 5).length,
          today_shipped_rate: allOrders.length > 0 ? Math.round(allOrders.filter(o => o.stage_code >= 5).length / allOrders.length * 100) : 0,
          today_issues: data.over_48h_warning,
          rate_48h: allOrders.length > 0 ? Math.round(allOrders.filter(o => o.stage_code >= 2).length / allOrders.length * 100) : 0,
          stats_24h: data.stats_24h,
          stats_48h: data.stats_48h,
          over_48h_warning: data.over_48h_warning,
        });
        setOrders(allOrders);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedSite]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 国内物流链路步骤：0下单 1平台发货 2已贴单 3已入仓 4已上飞机
  const getStep = (order) => {
    if (order.international_tracking && order.warehouse_in_date) return 4;  // 已入仓 + 国际单号 = 已上飞机
    if (order.warehouse_in_date) return 3;       // 已入仓
    if (order.label_status === '已贴单') return 2;
    if (order.logistics_1688_tracking) return 1;
    return 0;
  };

  const filteredOrders = React.useMemo(() => {
    if (!orders.length) return [];
    switch (activeCard) {
      case 'yesterday': return orders.filter(o => o.order_date && o.order_date.startsWith(stats?.yesterday_date || ''));
      case 'daybefore': return orders.filter(o => o.order_date && o.order_date.startsWith(stats?.daybefore_date || ''));
      case 'thirdday': return orders.filter(o => o.order_date && o.order_date.startsWith(stats?.thirdday_date || ''));
      case 'labeled': return orders.filter(o => o.label_status === '已贴单');
      case 'warehouse': return orders.filter(o => o.warehouse_in_date && o.warehouse_in_date.trim() !== '');
      case 'warning': return orders.filter(o => { try { return (new Date() - new Date(o.order_date.replace(/\//g, '-')))/(1000*60*60) > 48 && !o.logistics_1688_tracking; } catch { return false; } });
      default: return orders;
    }
  }, [orders, activeCard, stats]);

  const getRiskLevel = (order) => {
    if (!order.order_date) return null;
    try {
      const orderDate = new Date(order.order_date.replace(/\//g, '-'));
      const hours = (new Date() - orderDate) / (1000 * 60 * 60);
      if (hours > 72 && getStep(order) < 2) return { level: '72H+', color: 'text-rose-600 bg-rose-50 border-rose-100', text: '极高风险: 72H未入库' };
      if (hours > 48 && getStep(order) < 2) return { level: '48H+', color: 'text-amber-600 bg-amber-50 border-amber-100', text: '高风险: 48H未入库' };
      return null;
    } catch (e) { return null; }
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col overflow-hidden font-sans select-none">
      <style dangerouslySetInnerHTML={{ __html: PREMIUM_STYLES }} />
      
      {/* ── 1. 顶栏指挥部 ── */}
      <div className="h-[75px] bg-white border-b border-slate-200 border-t-[3px] border-t-emerald-600 px-6 flex items-center justify-between shrink-0 relative z-50 shadow-sm">
        <div className="flex flex-col">
          <h2 className="text-[18px] font-black text-slate-800 tracking-tight">物流哨兵监测站</h2>
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-[1.5px]">Logistics Sentinel Unit-01</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col"><div className="premium-filter-label">站点 / SITE</div><Select allowClear placeholder="全部站点" className="w-[140px]" size="small" variant="filled" value={selectedSite} onChange={setSelectedSite} options={Object.keys(SITE_MAP).map(s => ({ label: SITE_MAP[s], value: s }))} /></div>

          <button onClick={fetchData} className="h-[36px] px-5 bg-emerald-600 text-white rounded-lg flex items-center gap-2 text-[11px] font-black hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-200/50"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} />巡检实时链路</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 premium-scrollbar-hide">
        {/* KPI 矩阵 */}
        <div className="grid grid-cols-12 gap-5">
          <div className={'col-span-12 xl:col-span-4 cursor-pointer transition-all ' + (activeCard === 'yesterday' ? 'ring-2 ring-emerald-400 rounded-2xl' : 'opacity-80 hover:opacity-100')} onClick={() => setActiveCard('yesterday')}><MainLogisticsCard stats={stats} day="yesterday" title="昨日物流追踪" /></div>
          <div className="col-span-12 xl:col-span-5 grid grid-cols-2 gap-4">
             <div className={'rounded-xl p-4 flex flex-col justify-between border shadow-sm cursor-pointer transition-all ' + (activeCard === 'daybefore' ? 'ring-2 ring-blue-400' : 'opacity-80 hover:opacity-100') + ' bg-blue-50 border-blue-100'} style={{ animation: 'fadeSlideUp 0.5s ease-out 100ms both' }} onClick={() => setActiveCard('daybefore')}>
                <div className="text-[10px] font-black text-blue-700 opacity-60 uppercase tracking-widest leading-none">前天物流追踪 <span className="text-[9px]">({stats?.daybefore_date || ''})</span></div>
                <div className="mt-2">
                  <div className="text-[20px] font-black text-blue-700 tracking-tight leading-none">{stats?.daybefore_total || 0}<span className="text-[12px] opacity-60 ml-1">单</span></div>
                  <div className="mt-1.5 flex justify-between text-[11px] font-bold">
                    <span className="text-emerald-600">12h已发 {stats?.daybefore_h12_shipped || 0}</span>
                    <span className="text-blue-600">24h已发 {stats?.daybefore_h24_shipped || 0}</span>
                    <span className="text-amber-600">未发 {stats?.daybefore_over24_unshipped || 0}</span>
                  </div>
                </div>
             </div>
             <div className={'rounded-xl p-4 flex flex-col justify-between border shadow-sm cursor-pointer transition-all ' + (activeCard === 'thirdday' ? 'ring-2 ring-violet-400' : 'opacity-80 hover:opacity-100') + ' bg-violet-50 border-violet-100'} style={{ animation: 'fadeSlideUp 0.5s ease-out 200ms both' }} onClick={() => setActiveCard('thirdday')}>
                <div className="text-[10px] font-black text-violet-700 opacity-60 uppercase tracking-widest leading-none">三天前物流追踪 <span className="text-[9px]">({stats?.thirdday_date || ''})</span></div>
                <div className="mt-2">
                  <div className="text-[20px] font-black text-violet-700 tracking-tight leading-none">{stats?.thirdday_total || 0}<span className="text-[12px] opacity-60 ml-1">单</span></div>
                  <div className="mt-1.5 flex justify-between text-[11px] font-bold">
                    <span className="text-emerald-600">12h已发 {stats?.thirdday_h12_shipped || 0}</span>
                    <span className="text-blue-600">24h已发 {stats?.thirdday_h24_shipped || 0}</span>
                    <span className="text-amber-600">未发 {stats?.thirdday_over24_unshipped || 0}</span>
                  </div>
                </div>
             </div>
             <div className={'rounded-xl p-4 flex flex-col justify-between border shadow-sm cursor-pointer transition-all ' + (activeCard === 'labeled' ? 'ring-2 ring-indigo-400' : 'opacity-80 hover:opacity-100') + ' bg-indigo-50 border-indigo-100'} style={{ animation: 'fadeSlideUp 0.5s ease-out 300ms both' }} onClick={() => setActiveCard('labeled')}>
                <div className="text-[10px] font-black text-indigo-700 opacity-60 uppercase tracking-widest leading-none">已贴单</div>
                <div className="mt-2">
                  <div className="text-[20px] font-black text-indigo-700 tracking-tight leading-none">{stats?.cloud_labeled || 0}<span className="text-[12px] opacity-60 ml-1">单</span></div>
                  <div className="mt-1 text-[10px] font-bold text-indigo-500/60 uppercase tracking-wider">已贴单</div>
                </div>
             </div>
             <div className={'rounded-xl p-4 flex flex-col justify-between border shadow-sm cursor-pointer transition-all ' + (activeCard === 'warehouse' ? 'ring-2 ring-amber-400' : 'opacity-80 hover:opacity-100') + ' bg-amber-50 border-amber-100'} style={{ animation: 'fadeSlideUp 0.5s ease-out 400ms both' }} onClick={() => setActiveCard('warehouse')}>
                <div className="text-[10px] font-black text-amber-700 opacity-60 uppercase tracking-widest leading-none">官方仓已接收</div>
                <div className="mt-2">
                  <div className="text-[20px] font-black text-amber-700 tracking-tight leading-none">{stats?.warehouse_received || 0}<span className="text-[12px] opacity-60 ml-1">单</span></div>
                  <div className="mt-1 text-[10px] font-bold text-amber-500/60 uppercase tracking-wider">官方仓</div>
                </div>
             </div>
          </div>
          <div className={'col-span-12 xl:col-span-3 cursor-pointer transition-all ' + (activeCard === 'warning' ? 'ring-2 ring-rose-400 rounded-2xl' : 'opacity-80 hover:opacity-100')} onClick={() => setActiveCard('warning')}>
             <WarningCard stats={stats} />
          </div>
        </div>

        {/* 订单巡检列表 */}
        <div className="premium-glass-card rounded-2xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
              <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">物流详情</h3>
            </div>
            <div className="flex items-center gap-2">
               <div className="px-3 py-1 bg-slate-100 rounded-lg text-[11px] font-black text-slate-500 flex items-center gap-2"><ShoppingCart size={14} />{filteredOrders.length} ACTIVE UNITS</div>
            </div>
          </div>
          
          <div className="overflow-x-auto premium-scrollbar-hide">
            <table className="w-full text-left border-collapse" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap" style={{width:'28%'}}>订单详情</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap" style={{width:'39%'}}>国内物流链路</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap" style={{width:'18%'}}>物流单号</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap" style={{width:'15%'}}>预计到云仓时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr><td colSpan={4}><Empty className="py-20" description="暂无链路数据" /></td></tr>
                ) : filteredOrders.map((order, i) => {
                  const risk = getRiskLevel(order);
                  return (
                    <tr 
                      key={order.id} 
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      onClick={() => { setCurrentOrder(order); setDrawerVisible(true); }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={order.thumbnail || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                               <span className="text-[12px] font-black text-slate-800">#{order.order_number}</span>
                               <span className="text-[10px] font-bold text-slate-300">{SITE_MAP[order.site] || order.site}</span>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 truncate max-w-[120px]">{order.product_short_name || order.product_name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-left">
                        <LifecycleTimeline currentStep={getStep(order)} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-70" onClick={(e) => { e.stopPropagation(); setCurrentOrder(order); setDrawerVisible(true); }}>
                          {order.logistics_1688_tracking ? (
                            <>
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded">运单</span>
                              <span className="text-[11px] font-mono font-bold text-slate-600 truncate max-w-[120px]">{(order.logistics_1688_tracking || '').split(':')[0]}</span>
                            </>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-300">暂无物流单号</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          {order.warehouse_in_date ? (
                            <div className="flex flex-col">
                              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded self-start">已入仓</span>
                              <span className="text-[10px] font-bold text-slate-500 mt-1">{order.warehouse_in_date}</span>
                            </div>
                          ) : order.logistics_1688_tracking ? (
                            <div className="flex flex-col">
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded self-start">运输中</span>
                              <span className="text-[10px] font-bold text-slate-400 mt-1">预计1-3天</span>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-black rounded self-start">待发货</span>
                              <span className="text-[10px] font-bold text-slate-300 mt-1">-</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 侧边透视抽屉 */}
      <Drawer
        title={<div className="flex flex-col"><span className="text-slate-800 font-black">订单全链路诊断</span><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest"></span></div>}
        placement="right"
        width={480}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        className="premium-drawer"
        styles={{ header: { borderBottom: '1px solid #f1f5f9', padding: '24px' }, body: { padding: 0, background: '#f8fafc' } }}
      >
        {currentOrder && (
          <div className="p-6 space-y-6">
             <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <img src={currentOrder.thumbnail} className="w-16 h-16 rounded-2xl object-cover shadow-md" />
                  <div>
                    <h4 className="text-[16px] font-black text-slate-800 mb-1">{currentOrder.order_number}</h4>
                    <div className="flex items-center gap-2">
                       <Tag className="m-0 border-none bg-slate-100 text-slate-600 font-black text-[10px]">{currentOrder.site}</Tag>
                       <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{currentOrder.salesperson}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-0">
                  {/* 竖线展示：下单时间 → 发货时间 → 运输中 → 预计到仓时间 */}
                  {[
                    { label: '下单时间', time: currentOrder.order_date, active: true },
                    { label: '发货时间', time: currentOrder.logistics_1688_tracking ? (currentOrder.order_date || '已发货') : '', active: !!currentOrder.logistics_1688_tracking },
                    { label: '运输中', time: currentOrder.logistics_1688_tracking && !currentOrder.warehouse_in_date ? '运输中' : '', active: !!(currentOrder.logistics_1688_tracking && !currentOrder.warehouse_in_date) },
                    { label: '预计到仓', time: currentOrder.warehouse_in_date ? currentOrder.warehouse_in_date : (currentOrder.logistics_1688_tracking ? '预计1-3天' : ''), active: !!currentOrder.warehouse_in_date },
                  ].map((step, i) => (
                    <div key={i} className="relative flex items-start gap-4 pb-5 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className={'w-3 h-3 rounded-full border-2 z-10 ' + (step.active ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-200')} />
                        {i < 3 && <div className={'w-[1px] h-full absolute top-3 ' + (step.active ? 'bg-emerald-400' : 'bg-slate-100')} />}
                      </div>
                      <div className="flex flex-col pt-[-2px]">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{step.label}</span>
                        {step.time && <span className="text-[13px] font-black text-slate-800">{step.time}</span>}
                      </div>
                    </div>
                  ))}
                </div>
             </div>

             <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h5 className="text-[12px] font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity size={14} className="text-emerald-500" /> 包裹状态</h5>
                <div className="text-[13px] font-black text-slate-800">
                  物流单号: <span className="text-blue-600 font-mono">{(currentOrder.logistics_1688_tracking || '').split(':')[0] || '暂无'}</span>
                </div>
                <div className="mt-4 text-[12px] font-bold text-slate-500">
                  {currentOrder.warehouse_in_date ? (
                    <span>已于 {currentOrder.warehouse_in_date} 到达云仓</span>
                  ) : currentOrder.logistics_1688_tracking ? (
                    <span>包裹运输中，等待云仓接收</span>
                  ) : (
                    <span>等待1688发货</span>
                  )}
                </div>
             </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

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

function MainLogisticsCard({ stats, delay = 0 }) {
  const total = stats?.today_total || 0;
  const purchased = stats?.today_purchased || 0;
  const shipped = stats?.today_shipped || 0;
  const shippedRate = stats?.today_shipped_rate || 0;
  const progress = total > 0 ? Math.round((purchased / total) * 100) : 0;

  return (
    <div 
      className="h-full bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-emerald-200/50"
      style={{ animation: `slideUp 0.5s ease-out ${delay}ms both` }}
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl -mr-24 -mt-24" />
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span className="text-[11px] font-black text-emerald-100/90 tracking-[2px]">LOGISTICS / 物流实况</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-white text-4xl font-black">{total} <span className="text-xl opacity-60">单</span></span>
            <div className="flex flex-col">
              <span className="text-emerald-300 text-[12px] font-black">已发: {shipped} 单</span>
              <span className="text-emerald-300 text-[12px] font-black">发货率: {shippedRate}%</span>
            </div>
          </div>
          <div className="mt-2 text-[10px] font-bold text-emerald-200/60 uppercase tracking-wider">实时采购进度 ({purchased}/{total})</div>
          
          <div className="mt-4 h-2 w-full bg-white/10 rounded-full overflow-hidden p-[1px]">
             <div className="h-full bg-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(52,211,153,0.5)]" style={{ width: `${progress}%` }} />
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center opacity-80">
           <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">当前采购率</span>
           <span className="text-[14px] font-black text-white">{progress}%</span>
        </div>
      </div>
    </div>
  );
}

function LifecycleTimeline({ currentStep }) {
  const steps = [
    { key: 'ordered', label: '下单' },
    { key: 'purchased', label: '采购' },
    { key: 'inbound', label: '入库' },
    { key: 'labeled', label: '贴单' },
    { key: 'shipped', label: '发货' }
  ];

  return (
    <div className="relative flex items-center justify-between px-2 py-4 w-full max-w-[400px]">
      <div className="lifecycle-line w-[calc(100%-40px)] left-5" />
      <div 
        className="lifecycle-line lifecycle-line-active absolute left-5 h-[2px]" 
        style={{ width: `calc(${currentStep * 25}% - ${currentStep === 4 ? 0 : 20}px)` }} 
      />
      {steps.map((s, idx) => (
        <div key={s.key} className="lifecycle-node flex flex-col items-center gap-1">
          <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 border-2 bg-white ${idx <= currentStep ? 'border-emerald-500 scale-125 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'border-slate-200'}`} />
          <span className={`text-[9px] font-black uppercase tracking-tight ${idx <= currentStep ? 'text-emerald-600' : 'text-slate-300'}`}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function LogisticsAlertsView_V5() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedSalesperson, setSelectedSalesperson] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [salespersons, setSalespersons] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedSalesperson) params.append('salesperson', selectedSalesperson);
    if (selectedSite) params.append('site', selectedSite);

    Promise.all([
      fetch(`${API}/operational/logistics-stats?${params.toString()}`).then(async r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
      fetch(`${API}/operational/logistics-list?${params.toString()}`).then(async r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
    ]).then(([s, l]) => {
      setStats(s);
      setOrders(l.orders || []);
    }).catch(err => console.error(err)).finally(() => setLoading(false));
  }, [selectedSalesperson, selectedSite]);

  useEffect(() => {
    fetch(`${API}/operational/salespersons`).then(async r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(d => setSalespersons(d.salespersons || []));
    fetchData();
  }, [fetchData]);

  const getStep = (order) => {
    if (order.delivery_time || order.status === '已发货') return 4;
    if (order.waybill_no || order.status === '已打单') return 3;
    if (order.prepare_time || order.status === '待发货') return 2;
    if (order.purchase_order_no) return 1;
    return 0;
  };

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
          <div className="flex flex-col"><div className="premium-filter-label">运营 / STAFF</div><Select allowClear placeholder="全部运营" className="w-[110px]" size="small" variant="filled" value={selectedSalesperson} onChange={setSelectedSalesperson} options={salespersons.map(s => ({ label: s, value: s }))} /></div>
          <button onClick={fetchData} className="h-[36px] px-5 bg-emerald-600 text-white rounded-lg flex items-center gap-2 text-[11px] font-black hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-200/50"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} />巡检实时链路</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 premium-scrollbar-hide">
        {/* KPI 矩阵 (1+2x2+1) */}
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 xl:col-span-4"><MainLogisticsCard stats={stats} /></div>
          <div className="col-span-12 xl:col-span-5 grid grid-cols-2 gap-4">
              <KPIBlockMini label="48小时发货率" value={`${stats?.rate_48h || 0}%`} sub="48H SHIP RATE" colorClass="bg-blue-50 border-blue-100 text-blue-700" delay={100} icon={Activity} />
              <KPIBlockMini label="今日入库" value={`${stats?.today_inbound || 0} 单`} sub="INBOUND" colorClass="bg-indigo-50 border-indigo-100 text-indigo-700" delay={200} icon={Package} />
              <KPIBlockMini label="今日贴单打印" value={`${stats?.today_labeled || 0} 单`} sub="PRINTED" colorClass="bg-purple-50 border-purple-100 text-purple-700" delay={300} icon={Printer} />
              <KPIBlockMini label="今日异常拦截" value={`${stats?.today_issues || 0} 单`} sub="EXCEPTION" colorClass="bg-amber-50 border-amber-100 text-amber-700" delay={400} icon={AlertCircle} />
          </div>
          <div className="col-span-12 xl:col-span-3">
              <div className="h-full bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">红区预警监控 (48H/72H) <AntTooltip title="下单后超过 48H/72H 仍未入库的订单数量"><AlertCircle size={12} /></AntTooltip></div>
                  <div className="flex items-baseline gap-4 mt-2">
                    <div className="flex flex-col">
                      <span className="text-[32px] font-black text-rose-600 leading-none">{stats?.red_zone_72h || 0}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">72H DEADLINE</span>
                    </div>
                    <div className="w-[1px] h-8 bg-slate-100" />
                    <div className="flex flex-col">
                      <span className="text-[32px] font-black text-amber-500 leading-none">{stats?.red_zone_48h || 0}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">48H WARNING</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="text-[12px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-tighter">拦截状态 <Activity size={14} className="text-rose-500 animate-pulse" /></div>
                  <Tag color="error" className="m-0 text-[10px] font-black border-none bg-rose-100 text-rose-600">CRITICAL</Tag>
                </div>
              </div>
          </div>
        </div>

        {/* 订单巡检列表 */}
        <div className="premium-glass-card rounded-2xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
              <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">全链路实时巡检池</h3>
            </div>
            <div className="flex items-center gap-2">
               <div className="px-3 py-1 bg-slate-100 rounded-lg text-[11px] font-black text-slate-500 flex items-center gap-2"><ShoppingCart size={14} />{orders.length} ACTIVE UNITS</div>
            </div>
          </div>
          
          <div className="overflow-x-auto premium-scrollbar-hide">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">订单详情 / ORDER INFO</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">全链路状态 / LIFECYCLE</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">采购情报 / PROCUREMENT</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">风险监测 / RISK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr><td colSpan={4}><Empty className="py-20" description="暂无链路数据" /></td></tr>
                ) : orders.map((order, i) => {
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
                      <td className="px-6 py-4">
                        <LifecycleTimeline currentStep={getStep(order)} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {order.purchase_order_no ? (
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded uppercase">已采</span>
                              <span className="text-[11px] font-mono font-bold text-slate-600">{order.purchase_order_no}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-black rounded uppercase">待采</span>
                              <span className="text-[10px] font-bold text-slate-300">WAITING...</span>
                            </div>
                          )}
                          <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><User size={10} /> {order.salesperson || '系统自动'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {risk ? (
                          <div className={`px-3 py-1.5 rounded-xl border flex flex-col ${risk.color}`}>
                            <span className="text-[10px] font-black uppercase leading-tight">{risk.level} CRITICAL</span>
                            <span className="text-[9px] font-bold opacity-80">{risk.text}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-emerald-600">
                             <CheckCircle size={14} />
                             <span className="text-[10px] font-black uppercase tracking-tight">链路通畅</span>
                          </div>
                        )}
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
        title={<div className="flex flex-col"><span className="text-slate-800 font-black">订单全链路诊断</span><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Order Diagnosis System</span></div>}
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
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-50">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">下单时间</span>
                    <span className="text-[13px] font-black text-slate-800">{currentOrder.order_date}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-50">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">采购单号</span>
                    <span className="text-[13px] font-black text-emerald-600 font-mono">{currentOrder.purchase_order_no || '未采购'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-50">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">国内运单号</span>
                    <span className="text-[13px] font-black text-blue-600 font-mono">{currentOrder.purchase_tracking || '未同步'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-50">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">平台追踪号</span>
                    <span className="text-[13px] font-black text-slate-800 font-mono">{currentOrder.waybill_no || '待打印'}</span>
                  </div>
                </div>
             </div>

             <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h5 className="text-[12px] font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity size={14} className="text-emerald-500" /> 链路实时反馈</h5>
                <div className="space-y-6 relative pl-4 border-l border-slate-100">
                   {[
                     { time: currentOrder.order_date, text: '平台订单已接收，等待采购确认', icon: ShoppingCart, active: true },
                     currentOrder.purchase_order_no && { time: '系统自动/手动同步', text: `已完成采购，单号: ${currentOrder.purchase_order_no}`, icon: Package, active: true },
                     currentOrder.prepare_time && { time: currentOrder.prepare_time, text: '货件已抵达国内中转仓，扫描入库', icon: Box, active: true },
                     currentOrder.waybill_no && { time: '系统自动生成', text: '打印面单已完成，包裹准备离库', icon: Printer, active: true },
                   ].filter(Boolean).map((log, i) => (
                     <div key={i} className="relative mb-6 last:mb-0">
                        <div className={`absolute -left-[21px] top-0 w-3 h-3 rounded-full border-2 bg-white ${log.active ? 'border-emerald-500' : 'border-slate-200'}`} />
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-tighter mb-1">{log.time}</p>
                        <p className="text-[12px] font-black text-slate-800 leading-tight">{log.text}</p>
                     </div>
                   ))}
                </div>
             </div>
             
             <div className="flex gap-4">
                <Button block size="large" className="rounded-xl border-slate-200 font-black text-[12px] uppercase tracking-widest">联系供应商</Button>
                <Button block type="primary" size="large" className="rounded-xl bg-emerald-600 border-none font-black text-[12px] uppercase tracking-widest shadow-lg shadow-emerald-100">一键催发货</Button>
             </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

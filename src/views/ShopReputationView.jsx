import React, { useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../components/Icon.jsx';
import { useReputation } from '../hooks/useReputation.js';

const SITES_CONFIG = [
  { id: 'MLM', name: '墨西哥', flag: '🇲🇽' },
  { id: 'MLB', name: '巴西', flag: '🇧🇷' },
  { id: 'MLA', name: '阿根廷', flag: '🇦🇷' },
  { id: 'MCO', name: '哥伦比亚', flag: '🇨🇴' },
  { id: 'MLC', name: '智利', flag: '🇨🇱' },
  { id: 'MLU', name: '乌拉圭', flag: '🇺🇾' },
];

const STYLES = `
  @keyframes pulse-red {
    0%, 100% { border-color: #EF4444; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
    50% { border-color: #F87171; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0); }
  }
  .animate-pulse-red {
    animation: pulse-red 2s infinite;
  }
  .glass-tooltip {
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(16, 173, 111, 0.3);
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
  }
`;

function SiteStatusBlock({ siteData, config }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const blockRef = useRef(null);
  
  const handleMouseEnter = () => {
    if (blockRef.current) {
      const rect = blockRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left + rect.width / 2
      });
      setShowTooltip(true);
    }
  };

  if (!siteData) {
    return (
      <div className="flex-1 h-8 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-lg opacity-30 text-[10px] text-slate-400 font-bold">
        {config.flag} {config.name}
      </div>
    );
  }

  const status = String(siteData.status || 'green');
  const isNewbie = status === 'newbie';
  const isWarning = status === 'yellow';
  const isError = status === 'red';
  
  const statusClass = isNewbie
    ? 'bg-slate-100 text-slate-400 border-slate-200 border-[1.5px]'
    : isError 
    ? 'bg-rose-100 text-rose-800 border-rose-500 animate-pulse-red border-[1.5px]' 
    : isWarning 
    ? 'bg-amber-100 text-amber-800 border-amber-300 border'
    : 'bg-emerald-100 text-emerald-800 border-emerald-200 border';

  return (
    <>
      <div 
        ref={blockRef}
        className={`flex-1 h-8 flex items-center justify-center rounded-lg text-[10px] font-black cursor-help transition-all relative ${statusClass}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span>{config.flag} {config.name}</span>
      </div>
      
      {showTooltip && createPortal(
        <div 
          className="fixed z-[9999] w-52 p-3 rounded-xl glass-tooltip animate-in fade-in zoom-in duration-200"
          style={{ 
            top: coords.top - 12,
            left: coords.left,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none'
          }}
        >
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-slate-100 shadow-sm" />
          <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-1 relative z-10">
            <span className="text-base">{config.flag}</span>
            <span className="text-xs font-black text-slate-800">{config.name}站详细指标</span>
          </div>
          <div className="space-y-1.5 relative z-10">
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500 font-bold">投诉率</span>
              <span className={parseFloat(siteData.reclamos || '0') > 1 ? 'text-rose-600 font-black' : 'text-emerald-600 font-black'}>
                {siteData.reclamos || '0.00'}{siteData.reclamos && !String(siteData.reclamos).includes('%') ? '%' : ''}
              </span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500 font-bold">迟发率</span>
              <span className={parseFloat(siteData.despacho || '0') > 15 ? 'text-rose-600 font-black' : 'text-emerald-600 font-black'}>
                {siteData.despacho || '0.00'}{siteData.despacho && !String(siteData.despacho).includes('%') ? '%' : ''}
              </span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500 font-bold">取消率</span>
              <span className={parseFloat(siteData.cancel || '0') > 2 ? 'text-rose-600 font-black' : 'text-emerald-600 font-black'}>
                {siteData.cancel || '0.00'}{siteData.cancel && !String(siteData.cancel).includes('%') ? '%' : ''}
              </span>
            </div>
          </div>
          <div className="mt-2 pt-1 border-t border-slate-50 text-[9px] text-slate-400 font-bold italic relative z-10">
            信誉等级: {siteData.reputation_level || '正常'}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default function ShopReputationView_V5({ user }) {
  const username = user?.username || null;
  const { reputation, dailyAlerts, loading, error, refresh, lastUpdated, syncStatus, syncResult } = useReputation(null, username);

  // 根据同步阶段返回显示文字
  const syncLabel = (() => {
    if (syncStatus === 'syncing') return '同步中...';
    if (syncStatus === 'fetching') return '拉取数据...';
    if (syncStatus === 'done') return '已更新';
    return '刷新数据';
  })();

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const groupedData = useMemo(() => {
    const rawList = reputation || [];
    if (!Array.isArray(rawList)) return [];
    
    const groups = {};
    rawList.forEach(item => {
      if (!item) return;
      const label = item.account || item.group_label || '未命名店铺';
      if (!groups[label]) {
        groups[label] = {
          name: label,
          sites: {},
          totalViolations: 0,
        };
      }
      groups[label].sites[item.site_id] = item;
      groups[label].totalViolations += Number(item.new_violations || 0);
    });
    
    return Object.values(groups).sort((a, b) => b.totalViolations - a.totalViolations);
  }, [reputation]);

  return (
    <div className="h-full bg-white flex flex-col overflow-hidden select-none font-sans">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      
      <div className="bg-gradient-to-b from-emerald-100/30 to-white border-b border-slate-200 border-t-[3px] border-t-emerald-600 px-6 py-4 shrink-0 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-[16px] font-black text-emerald-900 tracking-tight">店铺全域声誉监控矩阵</h1>
            <div className="flex items-center gap-2">
               <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black shadow-sm">
                 {groupedData.filter(g => g.totalViolations === 0).length} 正常
               </span>
               {groupedData.filter(g => g.totalViolations > 0).length > 0 && (
                 <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-sm animate-pulse">
                   {groupedData.filter(g => g.totalViolations > 0).length} 风险
                 </span>
               )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-[10px] font-bold text-slate-400">
                最新更新于：{formatTime(lastUpdated)}
              </span>
            )}
            {syncResult === 'success' && (
              <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                已同步
              </span>
            )}
            {syncResult === 'error' && (
              <span className="text-[10px] font-black text-rose-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                同步失败
              </span>
            )}
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <Icon name="refresh-cw" size={12} className={loading ? 'animate-spin' : ''} />
              {syncLabel}
            </button>
          </div>
        </div>
      </div>

      

      <div className="flex-1 overflow-y-auto px-6 py-4 bg-slate-50/20 scrollbar-hide">
        {error && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[12px] font-bold flex items-center gap-2 shadow-sm">
            <Icon name="alert-circle" size={16} />
            数据获取失败，请尝试刷新。
          </div>
        )}

        <div className="space-y-3">
          {loading && groupedData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] opacity-30">
               <Icon name="loader" size={32} className="animate-spin mb-4" />
               <p className="text-[12px] font-black tracking-widest uppercase">全域同步中...</p>
            </div>
          ) : groupedData.length > 0 ? (
            groupedData.map((shop, idx) => (
              <div key={idx} className="relative flex items-center gap-4 p-3 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all group">
                <div className="w-[140px] shrink-0">
                  <div className="text-[13px] font-black text-slate-800 tracking-tight group-hover:text-emerald-700 transition-colors">{shop.name}</div>
                  <div className="text-[9px] text-slate-300 font-bold truncate">卖家 ID: {shop.sites[Object.keys(shop.sites)[0]]?.user_id || '---'}</div>
                </div>
                
                <div className="flex-1 flex gap-2">
                  {SITES_CONFIG.map(config => (
                    <SiteStatusBlock 
                      key={config.id} 
                      config={config} 
                      siteData={shop.sites[config.id]} 
                    />
                  ))}
                </div>

                <div className="w-[110px] shrink-0 flex justify-end">
                   {shop.totalViolations > 0 ? (
                     <div className="px-3 py-1 bg-rose-50 border border-rose-200 rounded-full text-rose-600 text-[11px] font-black flex items-center gap-1.5 shadow-sm animate-in fade-in slide-in-from-right-4">
                       <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                       {shop.totalViolations} 条累计
                     </div>
                   ) : (
                     <div className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600 text-[11px] font-black">
                       0 违规
                     </div>
                   )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] opacity-10">
               <Icon name="inbox" size={48} className="mb-2" />
               <p className="text-[14px] font-black tracking-widest uppercase">无账号数据</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="px-6 py-2 border-t border-slate-100 text-[10px] text-slate-400 font-bold bg-white">
        ※ 鼠标悬浮站点色块可查看详细指标；红色表示声誉等级预警，请及时处理投诉。
      </div>
    </div>
  );
}

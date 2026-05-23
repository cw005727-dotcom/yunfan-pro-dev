import React, { useState, useEffect } from 'react';
import Icon from './Icon';

const TYPE_CONFIG = {
  order:      { icon: 'shopping-cart', color: '#10b981', label: 'NEW ORDER' },
  logistics:  { icon: 'truck',        color: '#3b82f6', label: 'LOGISTICS' },
  reputation: { icon: 'shield',       color: '#f59e0b', label: 'REPUTATION' },
  complaint:  { icon: 'alert-circle',  color: '#ef4444', label: 'CLAIM' },
  violation:  { icon: 'x-circle',     color: '#ef4444', label: 'POLICY' },
  message:    { icon: 'message-circle', color: '#8b5cf6', label: 'CHAT' },
  radar:      { icon: 'zap',          color: '#f59e0b', label: 'RADAR' },
};

const HEADER_STYLES = `
  @keyframes scrollText {
    0% { transform: translateY(0); }
    15% { transform: translateY(0); }
    20% { transform: translateY(-20px); }
    35% { transform: translateY(-20px); }
    40% { transform: translateY(-40px); }
    55% { transform: translateY(-40px); }
    60% { transform: translateY(-60px); }
    75% { transform: translateY(-60px); }
    80% { transform: translateY(-80px); }
    95% { transform: translateY(-80px); }
    100% { transform: translateY(-100px); }
  }
  @keyframes heartbeat {
    0% { transform: scale(1); opacity: 0.8; }
    14% { transform: scale(1.3); opacity: 1; }
    28% { transform: scale(1); opacity: 0.8; }
    42% { transform: scale(1.3); opacity: 1; }
    70% { transform: scale(1); opacity: 0.8; }
  }
  .sentinel-scroll {
    display: flex;
    flex-direction: column;
    height: 20px;
    overflow: hidden;
  }
  .sentinel-scroll-inner {
    animation: scrollText 18s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  }
  .v5-header-glass {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px) saturate(180%);
    border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  }
`;

function HeartbeatLine() {
  return (
    <div className="flex items-center gap-[2px] h-2">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div 
          key={i} 
          className="w-[2px] bg-emerald-500/40 rounded-full" 
          style={{ 
            height: `${Math.random() * 100}%`,
            animation: `heartbeat 2s infinite ${i * 0.2}s` 
          }} 
        />
      ))}
    </div>
  );
}

export default function TopMonitoringBar({ pageTitle }) {
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false }));
  const [unix, setUnix] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
      setUnix(Math.floor(Date.now() / 1000));
    }, 1000);
    
    const loadAlerts = () => {
      try {
        const raw = localStorage.getItem('yunfan_alerts');
        if (raw) {
          const d = JSON.parse(raw);
          setEvents(d.events || []);
          setConnected(d.connected !== false);
        }
      } catch (e) {}
    };
    loadAlerts();
    const interval = setInterval(loadAlerts, 8000);
    return () => { clearInterval(timer); clearInterval(interval); };
  }, []);

  const visibleEvents = events.slice(0, 5);

  return (
    <div className="h-[64px] v5-header-glass flex items-center px-8 gap-10 shrink-0 relative z-[200]">
      <style dangerouslySetInnerHTML={{ __html: HEADER_STYLES }} />
      
      {/* 1. Context Breadcrumb */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex flex-col">
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[2px] leading-none">Cloud Intel</span>
              <div className="w-1 h-1 rounded-full bg-slate-200" />
           </div>
           <span className="text-[16px] font-black text-slate-900 tracking-tighter mt-1">{pageTitle || 'Command Desk'}</span>
        </div>
      </div>

      {/* 2. Sentinel Command Center - Micro Detail */}
      <div className="flex-1 max-w-[560px] h-[38px] bg-white border border-slate-100 rounded-[12px] px-4 flex items-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        
        <div className="flex items-center gap-3 shrink-0 border-r border-slate-100 pr-4">
          <div className="relative">
            <Icon name="radar" size={15} className="text-emerald-500" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-20" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Monitoring</span>
            <div className="mt-1"><HeartbeatLine /></div>
          </div>
        </div>
        
        <div className="sentinel-scroll flex-1">
          <div className="sentinel-scroll-inner">
            {visibleEvents.length > 0 ? visibleEvents.map((ev, i) => {
              const cfg = TYPE_CONFIG[ev.type] || { icon: 'activity', color: '#94a3b8', label: 'ACTIVITY' };
              return (
                <div key={i} className="h-5 flex items-center gap-3">
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 tracking-tighter shrink-0">{cfg.label}</span>
                  <span className="text-[12px] font-bold text-slate-700 truncate tracking-tight">{ev.label}</span>
                  <span className="text-[10px] font-mono font-medium text-slate-300 ml-auto tabular-nums">{ev.time}</span>
                </div>
              );
            }) : (
              <div className="h-5 flex items-center gap-2 text-slate-400 font-bold text-[11px] tracking-tight">
                <Icon name="loader-2" size={12} className="animate-spin" />
                SYSTEM READY / SCANNING GLOBAL DATA STREAMS...
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0 pl-4 border-l border-slate-100">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter leading-none">Sync Status</span>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'}`} />
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">{connected ? 'Active' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Global System Metrics */}
      <div className="flex items-center gap-8 ml-auto shrink-0">
        <div className="hidden 2xl:flex items-center gap-6 border-r border-slate-200 pr-8">
           <div className="flex flex-col items-end">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Latency</span>
             <span className="text-[12px] font-black text-emerald-600 mt-1 tabular-nums">0.012<span className="text-[9px] opacity-60 ml-0.5">ms</span></span>
           </div>
           <div className="flex flex-col items-end">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Load</span>
             <span className="text-[12px] font-black text-blue-600 mt-1 tabular-nums">4.2<span className="text-[9px] opacity-60 ml-0.5">%</span></span>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right flex flex-col justify-center border-r border-slate-100 pr-4 h-8">
            <span className="text-[15px] font-black text-slate-900 tracking-tighter leading-none tabular-nums">{time}</span>
            <span className="text-[9px] font-bold text-slate-300 uppercase mt-1 tracking-[1.5px] tabular-nums">UNIX: {unix}</span>
          </div>
          <div 
            onClick={() => onNavigate && onNavigate('notify')}
            className="w-10 h-10 rounded-[12px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-white hover:shadow-md transition-all cursor-pointer"
          >
            <Icon name="bell" size={18} />
          </div>
        </div>
      </div>
    </div>
  );
}

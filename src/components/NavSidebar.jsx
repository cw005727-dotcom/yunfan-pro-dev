import React, { memo } from 'react';
import Icon from './Icon';
import { NAV_GROUPS } from '../config/navigation';

const SIDEBAR_STYLES = `
  .nav-group-btn {
    position: relative;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
  }
  .nav-group-btn.active {
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  }
  .nav-group-btn:not(.active) {
    border-color: rgba(0,0,0,0.01);
  }
  .sub-item-dot {
    position: relative;
    z-index: 2;
  }
  .sidebar-scroll::-webkit-scrollbar {
    width: 3px;
  }
  .sidebar-scroll::-webkit-scrollbar-thumb {
    background: #f1f5f9;
    border-radius: 10px;
  }
  .sidebar-scroll:hover::-webkit-scrollbar-thumb {
    background: #e2e8f0;
  }
`;

const NavSidebar = memo(function NavSidebar({ user, topTab, sidebarItem, onTabChange, onItemChange, mobile, onClose }) {
  const navigate = (group, itemId) => {
    onTabChange(group.id);
    onItemChange(itemId);
    window.location.hash = `#/${itemId}`;
    if (mobile && onClose) onClose();
  };

  const handleGroupClick = (group) => {
    const hasItems = group.items && group.items.length > 0;
    if (!hasItems) {
      navigate(group, group.id);
    } else {
      if (!group.items.some(i => i.id === sidebarItem)) {
        navigate(group, group.items[0].id);
      }
    }
  };

  const getRgba = (hex, alpha) => {
    if (!hex) return 'transparent';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div
      className={`
        flex flex-col h-full shrink-0
        ${mobile ? 'w-full max-w-[240px]' : 'w-[210px]'}
        relative z-[100] bg-white border-r border-slate-100 shadow-[10px_0_30px_rgba(0,0,0,0.01)]
      `}
    >
      <style dangerouslySetInnerHTML={{ __html: SIDEBAR_STYLES }} />
      
      {/* 1. Brand Unit - Slimmer */}
      <div className="h-[64px] flex items-center gap-3 px-5 shrink-0 border-b border-slate-50 relative">
        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center bg-emerald-600 shadow-md shadow-emerald-600/20">
          <Icon name="command" className="text-white" size={16} />
        </div>
        <div className="flex flex-col">
          <span className="text-slate-950 text-[16px] font-black tracking-tighter leading-none">云帆跨境</span>
          <span className="text-slate-500 text-[12px] font-black tracking-tight leading-none mt-1">美客多工作台</span>
        </div>
      </div>

      {/* 2. Navigation Control - High Density */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-2.5 sidebar-scroll">
        {NAV_GROUPS.filter(g => !g.adminOnly || user?.role === '管理员').map(group => {
          const hasItems = group.items && group.items.length > 0;
          const isActiveGroup = hasItems 
            ? group.items.some(item => item.id === sidebarItem)
            : topTab === group.id;
          
          const groupColor = group.color || '#10b981';
          const bgStyle = {
            backgroundColor: isActiveGroup ? groupColor : getRgba(groupColor, 0.08)
          };

          const isExternal = group.isExternal;
          const extUrl = group.externalUrl || '/admin';

          return (
            <div key={group.id} className="space-y-1">
              {isExternal ? (
                <a href={extUrl} target="_blank" rel="noopener noreferrer" style={bgStyle}
                  className="nav-group-btn group w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[10px] transition-all duration-300 hover:bg-opacity-15 no-underline"
                >
                  <div className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center shrink-0 bg-white text-slate-400 shadow-sm">
                    <Icon name={group.icon} size={13} />
                  </div>
                  <span className="flex-1 text-[13px] font-black tracking-tight truncate text-slate-800">
                    {group.label}
                  </span>
                  <Icon name="external-link" size={11} className="text-slate-300" />
                </a>
              ) : (
                <button onClick={() => handleGroupClick(group)} style={bgStyle}
                  className={`nav-group-btn group w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[10px] transition-all duration-300 ${isActiveGroup ? 'active' : 'hover:bg-opacity-15'}`}
                >
                  <div className={`w-[26px] h-[26px] rounded-[7px] flex items-center justify-center shrink-0 transition-all duration-300 ${isActiveGroup ? 'bg-white/20 text-white' : 'bg-white text-slate-400 group-hover:text-slate-600 shadow-sm'}`}>
                    <Icon name={group.icon} size={13} />
                  </div>
                  <span className={`flex-1 text-[13px] font-black tracking-tight transition-colors truncate ${isActiveGroup ? 'text-white' : 'text-slate-800 group-hover:text-slate-950'}`}>
                    {group.label}
                  </span>
                  {isActiveGroup && <Icon name="chevron-right" size={12} className="text-white/40" />}
                </button>
              )}
              {hasItems && !isExternal && (
                <div className="mt-0.5 space-y-0.5">
                  {group.items.map(item =>
                    <button key={item.id} onClick={() => navigate(group, item.id)}
                      className={`w-full flex items-center gap-2.5 pl-[36px] pr-2 py-1.5 rounded-lg text-left transition-all ${sidebarItem === item.id ? 'text-slate-950 font-black bg-slate-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'}`}
                    >
                      <div className={`w-1 h-1 rounded-full shrink-0 transition-all ${sidebarItem === item.id ? 'bg-emerald-500 scale-125' : 'bg-slate-300'}`} />
                      <span className="text-[11.5px] font-bold tracking-tight truncate">{item.label}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Footer - Compact */}
      <div className="p-4 border-t border-slate-50 shrink-0">
        <div 
          onClick={() => onItemChange('personal')}
          className={`
            border rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm group cursor-pointer transition-all
            ${sidebarItem === 'personal' 
              ? 'bg-emerald-600 border-emerald-500 shadow-emerald-100' 
              : 'bg-slate-50/50 border-slate-100 hover:bg-slate-100'}
          `}
        >
          <div className={`
            w-7 h-7 rounded-full flex items-center justify-center font-black text-[10px] transition-colors
            ${sidebarItem === 'personal' ? 'bg-white text-emerald-600' : 'bg-white border border-slate-100 text-slate-400'}
          `}>AD</div>
          <div className="flex flex-col overflow-hidden">
            <span className={`text-[10px] font-black truncate transition-colors ${sidebarItem === 'personal' ? 'text-white' : 'text-slate-900'}`}>个人中心</span>
            <span className={`text-[7px] font-bold truncate tracking-widest uppercase mt-0.5 transition-colors ${sidebarItem === 'personal' ? 'text-emerald-100' : 'text-slate-400'}`}>Settings & Account</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default NavSidebar;

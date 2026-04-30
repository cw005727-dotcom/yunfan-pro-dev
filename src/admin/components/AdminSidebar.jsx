import React from 'react';

const AdminSidebar = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'overview', label: '数据概览', icon: '📊' },
    { id: 'cms', label: '内容管理', icon: '📝' },
    { id: 'invitations', label: '邀请码管理', icon: '🔑' },
    { id: 'users', label: '用户管理', icon: '👥' },
    { id: 'settings', label: '系统设置', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700/50 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span>🚀</span>
          <span>云帆跨境 PRO</span>
        </h1>
        <p className="text-[11px] whitespace-nowrap text-slate-600 mt-1">管理后台</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-sky-500/20 to-cyan-500/20 text-sky-400 border border-sky-500/30'
                    : 'text-slate-600 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-white font-bold">
            A
          </div>
          <div>
            <p className="text-sm font-medium text-white">Administrator</p>
            <p className="text-[11px] whitespace-nowrap text-slate-600">超级管理员</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;

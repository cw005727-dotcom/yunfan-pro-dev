import React, { useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import StatsCards from './components/StatsCards';
import InvitationTable from './components/InvitationTable';
import CMSPanel from './components/CMSPanel';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCodes: 0,
    usedCodes: 0,
  });

  const handleGenerateCode = async (newCodes) => {
    try {
      const res = await fetch('/api/admin/invitation-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codes: newCodes }),
      });
      if (res.ok) {
        console.log('Invitation codes created');
      }
    } catch (err) {
      console.error('Failed to create codes:', err);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">数据概览</h2>
              <p className="text-sm text-slate-600 mt-1">系统实时运行状态</p>
            </div>
            <StatsCards stats={stats} />
          </div>
        );
      case 'invitations':
        return <InvitationTable onGenerateCode={handleGenerateCode} />;
      case 'users':
        return (
          <div className="glass-effect rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-white mb-2">用户管理</h3>
            <p className="text-slate-600">功能开发中，敬请期待</p>
          </div>
        );
      case 'cms':
        return <CMSPanel />;
      case 'settings':
        return (
          <div className="glass-effect rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">⚙️</div>
            <h3 className="text-xl font-bold text-white mb-2">系统设置</h3>
            <p className="text-slate-600">功能开发中，敬请期待</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
};

export default AdminPanel;

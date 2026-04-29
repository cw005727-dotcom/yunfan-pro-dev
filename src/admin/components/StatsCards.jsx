import React from 'react';

const StatsCards = ({ stats }) => {
  const defaultStats = [
    { label: '总用户数', value: stats?.totalUsers ?? 0, icon: '👥', color: 'sky' },
    { label: '活跃用户', value: stats?.activeUsers ?? 0, icon: '🟢', color: 'emerald' },
    { label: '邀请码总数', value: stats?.totalCodes ?? 0, icon: '🔑', color: 'amber' },
    { label: '已使用', value: stats?.usedCodes ?? 0, icon: '✅', color: 'green' },
  ];

  const colorMap = {
    sky: 'from-sky-500/20 to-cyan-500/20 border-sky-500/30 text-sky-400',
    emerald: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-400',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {defaultStats.map((stat, index) => (
        <div
          key={index}
          className={`glass-effect rounded-2xl p-6 bg-gradient-to-br ${colorMap[stat.color]} border backdrop-blur-xl`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">{stat.icon}</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
          <p className="text-sm text-slate-500">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;

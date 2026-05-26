import React, { useState, useEffect } from 'react';
import AdminPanel from './AdminPanel';
import LoginView from '../views/LoginView';

export default function AdminApp() {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('yunfan_admin_user');
      if (raw) {
        const u = JSON.parse(raw);
        if (u.role === '管理员') return u;
      }
    } catch {}
    return null;
  });

  const handleLogin = (res) => {
    const u = { id: res.user_id, username: res.username, role: res.role };
    if (u.role !== '管理员') {
      alert('非管理员账号，无权访问管理后台');
      return;
    }
    localStorage.setItem('yunfan_admin_user', JSON.stringify(u));
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('yunfan_admin_user');
    setUser(null);
  };

  if (!user) {
    return <LoginView onLogin={handleLogin} adminMode />;
  }

  return <AdminPanel user={user} onLogout={handleLogout} />;
}

import React, { useState } from 'react';
import { Card, Row, Col, Switch, Button, Input, Tag, Avatar, Badge, Divider } from 'antd';
import { 
  User, Settings, Shield, Bell, CreditCard, LogOut, 
  ChevronRight, Mail, Phone, Globe, Moon, Sun, Monitor
} from 'lucide-react';

const PREMIUM_STYLES = `
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  
  .premium-card {
    background: white;
    border: 1px solid rgba(226, 232, 240, 0.6);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  .settings-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0;
    border-bottom: 1px solid #f8fafc;
  }
  .settings-row:last-child {
    border-bottom: none;
  }
  .section-label {
    font-size: 9px;
    font-weight: 900;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 16px;
    display: block;
  }
`;

export default function PersonalCenterView() {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotify, setEmailNotify] = useState(true);

  return (
    <div className="animate-[fadeIn_0.5s_ease-out] space-y-6">
      <style>{PREMIUM_STYLES}</style>
      
      {/* 1. Profile Header */}
      <div className="premium-card p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
        
        <div className="flex items-center gap-6 relative z-10">
          <Badge dot status="processing" offset={[-4, 44]} color="#10b981">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
               <Avatar size={80} icon={<User size={40} className="text-slate-300" />} />
            </div>
          </Badge>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Yunfan Admin</h2>
              <Tag className="rounded-md border-none bg-emerald-100 text-emerald-600 font-black text-[10px] px-2 py-0.5 uppercase">Professional Plan</Tag>
            </div>
            <p className="text-slate-400 text-sm font-bold flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Mail size={14} /> admin@yunfan.pro</span>
              <span className="flex items-center gap-1.5"><Phone size={14} /> +86 138 **** 8888</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Button className="h-10 px-6 rounded-xl border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-600 transition-all">编辑个人资料</Button>
          <Button className="h-10 w-10 flex items-center justify-center rounded-xl border-slate-200 text-slate-400 hover:text-rose-500 transition-all"><LogOut size={18} /></Button>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* 2. System Settings */}
        <Col xs={24} lg={16}>
          <div className="premium-card p-8">
            <span className="section-label">系统首选项 / System Preferences</span>
            <div className="space-y-2">
              <div className="settings-row">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    {darkMode ? <Moon size={18} /> : <Sun size={18} />}
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-800">深色模式 / Dark Appearance</div>
                    <div className="text-xs text-slate-400 font-bold">自适应环境亮度或手动切换</div>
                  </div>
                </div>
                <Switch checked={darkMode} onChange={setDarkMode} className={darkMode ? 'bg-emerald-500' : 'bg-slate-200'} />
              </div>

              <div className="settings-row">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Globe size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-800">界面语言 / UI Language</div>
                    <div className="text-xs text-slate-400 font-bold">选择您首选的操作语言</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800">简体中文</span>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
              </div>

              <div className="settings-row">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Bell size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-800">通知推送 / Notifications</div>
                    <div className="text-xs text-slate-400 font-bold">在异常发生时通过邮件提醒我</div>
                  </div>
                </div>
                <Switch checked={emailNotify} onChange={setEmailNotify} className={emailNotify ? 'bg-emerald-500' : 'bg-slate-200'} />
              </div>
            </div>

            <Divider className="my-8 border-slate-50" />

            <span className="section-label">安全控制 / Security & Privacy</span>
            <div className="space-y-2">
               <div className="settings-row">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Shield size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-800">多因素身份验证 (MFA)</div>
                    <div className="text-xs text-slate-400 font-bold">提升账户安全性</div>
                  </div>
                </div>
                <Tag className="rounded-md border-none bg-slate-100 text-slate-400 font-black text-[10px] px-2 py-0.5">未启用</Tag>
              </div>
            </div>
          </div>
        </Col>

        {/* 3. Subscription & Usage */}
        <Col xs={24} lg={8}>
          <div className="space-y-6">
            <div className="premium-card p-8 bg-slate-900 text-white relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <CreditCard size={80} />
              </div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-6 block">当前计划 / Current Plan</span>
              <div className="mb-8">
                <h3 className="text-2xl font-black mb-1">PRO Professional</h3>
                <p className="text-slate-500 text-xs font-bold">有效期至: 2026年12月31日</p>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
                    <span className="text-slate-400">API 调用额度 / 75%</span>
                    <span className="text-emerald-500">22,500 / 30,000</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-3/4 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
                    <span className="text-slate-400">存储容量 / 12%</span>
                    <span className="text-white">1.2GB / 10GB</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-white/40 w-[12%]" />
                  </div>
                </div>
              </div>
              <Button block type="primary" className="mt-8 h-12 rounded-xl bg-emerald-600 border-none font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/40">升级当前计划</Button>
            </div>

            <div className="premium-card p-8">
              <span className="section-label">支持与帮助 / Support</span>
              <div className="space-y-4">
                <div className="flex items-center justify-between group cursor-pointer">
                  <span className="text-sm font-black text-slate-600 group-hover:text-slate-900 transition-colors">帮助文档中心</span>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
                <div className="flex items-center justify-between group cursor-pointer">
                  <span className="text-sm font-black text-slate-600 group-hover:text-slate-900 transition-colors">版本更新日志</span>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
                <div className="flex items-center justify-between group cursor-pointer">
                  <span className="text-sm font-black text-slate-600 group-hover:text-slate-900 transition-colors">联系技术支持</span>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

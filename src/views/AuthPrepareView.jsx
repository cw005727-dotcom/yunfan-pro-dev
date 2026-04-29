import Icon from '../components/Icon.jsx';

import { useState } from 'react';
import { API_BASE } from '../api/client';

const AuthPrepareView = () => {
    const [loading, setLoading] = useState(false);

    const handleConnect = async () => {
        setLoading(true);
        try {
            const resp = await fetch(`${API_BASE}/generate_auth_url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Admin-Token': 'YUNFAN_ADMIN_2026' }
            });
            const data = await resp.json();
            if (data.auth_url) {
                window.open(data.auth_url, '_blank');
            }
        } catch (err) {
            console.error('Failed to generate auth URL', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto p-10 space-y-10 animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight whitespace-nowrap">前期准备</h3>
                    <p className="text-slate-500 text-[11px] font-bold uppercase mt-1 whitespace-nowrap tracking-wider">MercadoLibre 授权与店铺连接</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-[11px] text-slate-500 font-bold">在线配置</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
                {[
                    { icon: 'key', title: 'MercadoLibre 授权', desc: 'OAuth 2.0 授权流程，一键接入 MLB/MLM/MCO/MLA/MLC/MLU', color: 'indigo' },
                    { icon: 'link', title: '店铺绑定', desc: '绑定现有店铺，授权后自动同步商品与订单数据', color: 'violet' },
                    { icon: 'user-check', title: '子账号管理', desc: '管理团队成员权限，安全可控', color: 'purple' },
                    { icon: 'shield', title: '安全设置', desc: 'Webhook 回调配置，API 密钥管理', color: 'fuchsia' },
                ].map((item, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                            item.color === 'indigo' ? 'bg-indigo-50 text-indigo-500'
                            : item.color === 'violet' ? 'bg-violet-50 text-violet-500'
                            : item.color === 'purple' ? 'bg-purple-50 text-purple-500'
                            : 'bg-fuchsia-50 text-fuchsia-500'
                        }`}>
                            <Icon name={item.icon} className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[13px] font-black text-slate-800">{item.title}</p>
                            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-12 flex flex-col items-center text-center gap-6 shadow-sm">
                <div className="w-16 h-16 rounded-[24px] bg-blue-50 flex items-center justify-center text-blue-600">
                    <Icon name="key" className="w-8 h-8" />
                </div>
                <div className="max-w-md space-y-2">
                    <h4 className="text-xl font-black text-slate-900 tracking-tight">连接您的 MercadoLibre 店铺</h4>
                    <p className="text-[12px] text-slate-500 font-bold leading-relaxed">
                        点击下方按钮将跳转至美客多官方授权页面。授权完成后，系统将自动同步近 30 天的订单及全量商品数据。
                    </p>
                </div>
                <button 
                    onClick={handleConnect}
                    disabled={loading}
                    className="px-10 py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-slate-200 active:scale-[0.98] flex items-center gap-2"
                >
                    {loading ? <Icon name="loader" className="w-4 h-4 animate-spin" /> : <Icon name="external-link" className="w-4 h-4" />}
                    {loading ? '正在准备授权...' : '立即连接店铺'}
                </button>
                <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">SSL 加密传输</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">官方 API 对接</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPrepareView;
repareView;
reView;

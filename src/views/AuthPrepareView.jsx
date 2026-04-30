import Icon from '../components/Icon.jsx';
import { useState } from 'react';
import { API_BASE } from '../api/client';

const AuthPrepareView = () => {
    const [loading, setLoading] = useState(false);
    const [shopId, setShopId] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    const handleConnect = async () => {
        if (!/^\d+$/.test(shopId)) {
            alert('店铺名称必须是纯数字（内部编号）');
            return;
        }
        setLoading(true);
        try {
            const resp = await fetch(`${API_BASE}/generate_auth_url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Admin-Token': 'YUNFAN_ADMIN_2026' },
                body: JSON.stringify({ shop_id: shopId })
            });
            const data = await resp.json();
            if (data.auth_url) {
                window.open(data.auth_url, '_blank');
                setShowConfirm(false);
            }
        } catch (err) {
            console.error('Failed to generate auth URL', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight whitespace-nowrap">前期准备</h3>
                    <p className="text-slate-500 text-[11px] font-bold uppercase mt-1 whitespace-nowrap tracking-wider">MercadoLibre 授权与店铺连接</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-[11px] text-slate-500 font-bold">在线配置</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

            <div className="rounded-[32px] border border-slate-200 bg-white p-8 md:p-12 flex flex-col items-center text-center gap-6 shadow-sm">
                <div className="w-16 h-16 rounded-[24px] bg-blue-50 flex items-center justify-center text-blue-600">
                    <Icon name="link" className="w-8 h-8" />
                </div>
                <div className="max-w-md space-y-4">
                    <h4 className="text-xl font-black text-slate-900 tracking-tight">连接新店铺</h4>
                    <div className="space-y-2">
                        <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest text-left">店铺内部编号 (仅限数字)</p>
                        <input 
                            type="text" 
                            value={shopId}
                            onChange={(e) => setShopId(e.target.value.replace(/\D/g, ''))}
                            placeholder="例如: 1024"
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black tracking-tight focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <p className="text-[12px] text-slate-400 font-bold leading-relaxed">
                        授权完成后，系统将自动同步该店铺近 30 天的订单及全量商品数据。
                    </p>
                </div>

                <button 
                    onClick={() => shopId && setShowConfirm(true)}
                    disabled={!shopId || loading}
                    className="px-10 py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-slate-200 active:scale-[0.98] flex items-center gap-2"
                >
                    {loading ? <Icon name="loader" className="w-4 h-4 animate-spin" /> : <Icon name="external-link" className="w-4 h-4" />}
                    立即连接店铺
                </button>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)}></div>
                    <div className="relative bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-6">
                            <Icon name="alert-triangle" className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 tracking-tight mb-2">确认店铺名称</h4>
                        <p className="text-[13px] text-slate-500 font-bold leading-relaxed mb-8">
                            您设置的店铺编号为 <span className="text-slate-900 underline underline-offset-4 decoration-2 decoration-amber-500">{shopId}</span>。授权后不可更改，是否继续？
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-black text-[13px] transition-all"
                            >
                                返回修改
                            </button>
                            <button 
                                onClick={handleConnect}
                                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-[13px] shadow-lg shadow-slate-200 transition-all"
                            >
                                确认授权
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthPrepareView;
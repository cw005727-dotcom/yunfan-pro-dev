import { useAppContext } from '../context/AppContext';
import { useState } from 'react';
import Brand from '../components/Brand.jsx';
import Icon from '../components/Icon.jsx';

const LoginPage = ({ onLogin }) => {
    const [loading, setLoading] = useState(false);
    const [accountId, setAccountId] = useState('');
    const [accessKey, setAccessKey] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!accountId || !accessKey) return;
        setLoading(true);
        // Simulate auth check - in reality would verify with backend
        await new Promise(r => setTimeout(r, 800));
        setLoading(false);
        onLogin(accountId);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center">
                    <Brand slogan="跨境 AI 协作平台" />
                </div>
                <div className="solid-card rounded-[28px] p-8 space-y-5">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">账号标识 (Account ID)</label>
                            <input 
                                type="text"
                                value={accountId}
                                onChange={e => setAccountId(e.target.value)}
                                placeholder="请输入账号 ID"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">访问秘钥 (Access Key)</label>
                            <input 
                                type="password"
                                value={accessKey}
                                onChange={e => setAccessKey(e.target.value)}
                                placeholder="请输入 16 位秘钥"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                            />
                        </div>
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || !accountId || !accessKey}
                                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-black text-base transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Icon name="loader" className="w-4 h-4 animate-spin" />
                                        校验中...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="arrow-right" className="w-4 h-4" />
                                        进入系统
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

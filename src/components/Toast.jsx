import { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose }) => {
    useEffect(() => {
        if (!message) return;
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [message, onClose]);

    if (!message) return null;

    const styles = {
        info: 'bg-slate-900 text-white',
        success: 'bg-emerald-600 text-white',
        warning: 'bg-amber-500 text-white',
        error: 'bg-rose-600 text-white',
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className={`px-5 py-3 rounded-2xl shadow-xl text-[13px] font-bold flex items-center gap-3 ${styles[type] || styles.info}`}>
                {type === 'success' && <span>✅</span>}
                {type === 'warning' && <span>⚠️</span>}
                {type === 'error' && <span>❌</span>}
                {message}
            </div>
        </div>
    );
};

export default Toast;

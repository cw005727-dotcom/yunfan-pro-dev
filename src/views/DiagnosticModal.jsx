import { useAppContext } from '../context/AppContext';
import Icon from '../components/Icon.jsx';

const DiagnosticModal = ({ isOpen, onClose, data, isDiagnosing }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Icon name="activity" className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">AI 爆品对比诊断</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">MiniMax M2.7 Intelligence Engine</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all">
                        <Icon name="x" className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                    {isDiagnosing ? (
                        <div className="py-20 flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-2 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">AI 正在深度扫描市场数据...</p>
                        </div>
                    ) : data ? (
                        <>
                            <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <Icon name="activity" className="w-4 h-4 text-indigo-500" />
                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">核心诊断</span>
                                </div>
                                <p className="text-slate-900 font-bold text-base leading-relaxed">{data.diagnosis}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">竞品优势</p>
                                    {data.strengths?.map((s, i) => (
                                        <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="w-5 h-5 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                                                <Icon name="check" className="w-3 h-3 text-emerald-500" />
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-700">{s}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">优化建议</p>
                                    {data.suggestions?.map((s, i) => (
                                        <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="w-5 h-5 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                                                <Icon name="lightbulb" className="w-3 h-3 text-amber-500" />
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-700">{s}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-10">
                                    <Icon name="languages" className="w-24 h-24" />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">优化后的西语标题 (建议直接替换)</p>
                                <p className="text-xl font-bold leading-relaxed mb-6 relative z-10">{data.new_title}</p>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(data.new_title);
                                        alert('标题已复制');
                                    }}
                                    className="w-full py-4 rounded-2xl bg-white text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-slate-50 flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <Icon name="copy" className="w-4 h-4" />
                                    复制标题
                                </button>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default DiagnosticModal;
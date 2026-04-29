import { useAppContext } from '../context/AppContext';
import { useState } from 'react';
import Icon from '../components/Icon.jsx';

const PROMPT_PLANS = {
    A: {
        label: 'A · SEO导向',
        color: 'from-blue-500 to-indigo-500',
        bg: 'bg-blue-50 border-blue-100',
        textColor: 'text-blue-600',
        dot: 'bg-blue-500',
        desc: 'SEO友好 · 热搜关键词 · 核心卖点',
        prompt: '请基于输入的标题或关键词，生成5个SEO友好的MercadoLibre西语标题。每个标题不超过220字符，包含1-2个热搜关键词，突出产品核心卖点。'
    },
    B: {
        label: 'B · 转化导向',
        color: 'from-amber-500 to-orange-500',
        bg: 'bg-amber-50 border-amber-100',
        textColor: 'text-amber-600',
        dot: 'bg-amber-500',
        desc: '高点击率 · 关键词前置 · 禁止大写',
        prompt: '请生成5个高点击率的MercadoLibre标题，结构为「品牌+产品词+型号+核心卖点」，前20字符必须包含最高搜索量关键词，禁止大写和促销词，西班牙语。'
    },
    C: {
        label: 'C · 混合',
        color: 'from-violet-500 to-purple-500',
        bg: 'bg-violet-50 border-violet-100',
        textColor: 'text-violet-600',
        dot: 'bg-violet-500',
        desc: '综合最优 · 字数合规 · 西班牙语',
        prompt: '请生成5个标题，要求：①不超过220字符②包含热搜关键词③首20字符为最强搜索词④禁止大写/促销语/无关堆词⑤西班牙语。'
    }
};

const OptimizeTitleView = () => {
    const { showToast } = useAppContext();
    const [input, setInput] = useState('');
    const [activePlan, setActivePlan] = useState('C');
    const [customPrompt, setCustomPrompt] = useState('');
    const [results, setResults] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copiedIdx, setCopiedIdx] = useState(null);

    const handleGenerate = async () => {
        if (!input.trim()) return;
        setIsGenerating(true);
        try {
            const res = await fetch('/api/optimize_title', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: input,
                    plan: activePlan,
                    prompt: activePlan === 'D' ? customPrompt : PROMPT_PLANS[activePlan].prompt
                })
            });
            const data = await res.json();
            setResults(data.suggestions || []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const copyResult = (text, idx) => {
        navigator.clipboard.writeText(text);
        setCopiedIdx(idx);
        showToast('已复制', 'success');
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    const copyAll = () => {
        const text = results.map((r, i) => `${i + 1}. ${r}`).join('\n');
        navigator.clipboard.writeText(text);
        showToast('全部已复制', 'success');
    };

    return (
        <div className="h-full overflow-y-auto p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-[26px] font-black text-slate-800 tracking-tight">标题优化</h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">AI 生成 · MercadoLibre 西语标题</p>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-[11px] text-slate-500 font-bold">实时生成</span>
                </div>
            </div>

            {/* Input */}
            <div className="solid-card rounded-[24px] p-5 border border-slate-200 shadow-sm">
                <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="粘贴原标题或输入产品关键词..."
                    rows={3}
                    maxLength={500}
                    className="w-full bg-transparent border-none resize-none text-[13px] font-medium text-slate-700 placeholder:text-slate-500 focus:outline-none leading-relaxed"
                />
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[11px] text-slate-500 font-medium">{input.length}/500</span>
                    {input.trim() && (
                        <button
                            onClick={() => setInput('')}
                            className="text-[11px] text-slate-500 hover:text-slate-600 font-medium transition-colors"
                        >
                            清空
                        </button>
                    )}
                </div>
            </div>

            {/* Plan Selection */}
            <div className="space-y-2.5">
                <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest px-1">选择指令方案</p>
                <div className="grid grid-cols-4 gap-2">
                    {Object.entries({ ...PROMPT_PLANS, D: { label: 'D · 自定义', color: 'from-slate-500 to-slate-600', bg: 'bg-slate-50', textColor: 'text-slate-500', dot: 'bg-slate-400', desc: '自由填写指令', prompt: '' } }).map(([key, plan]) => {
                        const isActive = activePlan === key;
                        const isCustom = key === 'D';
                        const c = {
                            A: { from: 'from-blue-500', to: 'to-blue-600', dot: 'bg-blue-500', border: 'border-blue-400', bg: 'bg-blue-50/70', label: 'text-blue-600' },
                            B: { from: 'from-amber-500', to: 'to-amber-600', dot: 'bg-amber-500', border: 'border-amber-400', bg: 'bg-amber-50/70', label: 'text-amber-600' },
                            C: { from: 'from-violet-500', to: 'to-violet-600', dot: 'bg-violet-500', border: 'border-violet-400', bg: 'bg-violet-50/70', label: 'text-violet-600' },
                            D: { from: 'from-emerald-500', to: 'to-emerald-600', dot: 'bg-emerald-500', border: 'border-emerald-400', bg: 'bg-emerald-50/70', label: 'text-emerald-600' },
                        }[key];
                        return (
                            <div
                                key={key}
                                onClick={() => setActivePlan(key)}
                                className={`relative rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden flex flex-col items-center justify-center gap-1.5 py-3 px-2
                                    ${isActive ? `${c.border} ${c.bg} backdrop-blur-md shadow-lg` : 'border-slate-100/60 bg-white/40 hover:border-slate-200'}
                                `}
                            >
                                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${c.from} ${c.to}`} />
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/5 pointer-events-none" />
                                <div className={`relative flex flex-col items-center gap-1.5 w-full px-1`}>
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[12px] ${isActive ? `bg-gradient-to-br ${c.from} ${c.to} text-white shadow-md` : 'bg-slate-100 text-slate-500'}`}>
                                        {key}
                                    </div>
                                    <p className={`text-[11px] font-black ${isActive ? c.label : 'text-slate-500'}`}>{plan.label}</p>
                                    {isActive && <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />}
                                    {!isCustom && (
                                        <p className={`text-[11px] leading-relaxed text-center truncate ${isActive ? 'text-slate-500' : 'text-slate-500'}`}>{plan.prompt}</p>
                                    )}
                                    {isCustom && (
                                        <textarea
                                            value={customPrompt}
                                            onChange={e => { e.stopPropagation(); setCustomPrompt(e.target.value); }}
                                            onClick={e => e.stopPropagation()}
                                            placeholder="填写指令..."
                                            rows={2}
                                            className="w-full bg-white/60 border border-slate-200 rounded-xl px-2 py-1 text-[11px] text-slate-600 placeholder:text-slate-500 resize-none focus:outline-none"
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !input.trim()}
                    className="flex-1 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl py-4 font-black text-[12px] flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    <Icon name={isGenerating ? 'loader' : 'sparkles'} className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    {isGenerating ? '生成中...' : '生成标题'}
                </button>
                {results.length > 0 && (
                    <button
                        onClick={copyAll}
                        className="bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-2xl px-6 py-4 font-black text-[12px] flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Icon name="copy" className="w-4 h-4" />
                        复制全部
                    </button>
                )}
            </div>

            {/* Results */}
            {results.length > 0 && (
                <div className="space-y-2.5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 px-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                        <span className="text-[11px] text-slate-500 font-black uppercase tracking-widest">
                            生成结果 · {results.length}条
                        </span>
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg ml-auto ${PROMPT_PLANS[activePlan].bg} ${PROMPT_PLANS[activePlan].textColor}`}>
                            {PROMPT_PLANS[activePlan].label}
                        </span>
                    </div>
                    {results.map((title, idx) => (
                        <div key={idx} className="solid-card rounded-2xl p-4 border border-slate-100 hover:border-slate-200 transition-all group flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5 ${idx === 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'}`}>
                                {idx === 0 ? '✅' : idx + 1}
                            </div>
                            <p className="flex-1 text-[12px] font-medium text-slate-700 leading-relaxed">{title}</p>
                            <button
                                onClick={() => copyResult(title, idx)}
                                className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-600 transition-all shrink-0"
                            >
                                <Icon name={copiedIdx === idx ? 'check' : 'copy'} className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isGenerating && results.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    <Icon name="sparkles" className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-[11px] font-medium">输入标题，选择方案，即可生成优化标题</p>
                </div>
            )}
        </div>
    );
};

export default OptimizeTitleView;
w;
itleView;

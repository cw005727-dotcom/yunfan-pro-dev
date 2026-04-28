import { useState, useEffect } from 'react';
import Icon from '../components/Icon.jsx';

const SITE_EMOJI = { MLM: '🇲🇽', MLB: '🇧🇷', MLA: '🇦🇷', MCO: '🇨🇴', MLC: '🇨🇱', MLU: '🇺🇾' };
const SITE_NAME = { MLM: '墨西哥', MLB: '巴西', MLA: '阿根廷', MCO: '哥伦比亚', MLC: '智利', MLU: '乌拉圭' };
const CANCEL_REASON = {
    mediations: 'Disputa abierta · Reclamo del comprador',
    buyer_cancel_express: 'Cancelación solicitada por el comprador',
    shipment_not_delivered: 'Envío no entregado',
    undispatched_order: 'Pedido no enviado',
    buyer: 'Cancelación solicitada por el comprador',
};

const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    if (hours < 48) return '昨天';
    return `${d.getMonth()+1}.${d.getDate()}`;
};

const translateCache = {};
const doTranslate = async (text, from = 'auto', to = 'zh-CN') => {
    const key = `${from}|${to}|${text}`;
    if (translateCache[key]) return translateCache[key];
    try {
        const r = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, from, to })
        });
        const d = await r.json();
        console.log('[translate]', text.substring(0, 30), '->', d.translated);
        translateCache[key] = d.translated || '';
        return translateCache[key];
    } catch (e) {
        console.error('[translate error]', e);
        return '';
    }
};

const MsgBubble = ({ msg, siteId }) => {
    const [showZh, setShowZh] = useState(false);
    const [zh, setZh] = useState('');
    const isBuyer = msg.role === 'buyer';
    const isAi = msg.role === 'ai';
    const isSeller = msg.role === 'seller';

    useEffect(() => {
        if (isBuyer || isAi) {
            doTranslate(msg.content, 'auto', 'zh-CN').then(r => setZh(r)).catch(() => setZh(''));
        } else if (isSeller) {
            doTranslate(msg.content, 'auto', 'es').then(r => setZh(r)).catch(() => setZh(''));
        }
    }, [msg.content, msg.role, isBuyer, isAi, isSeller]);

    const bubbleClass = isSeller
        ? 'bg-slate-900 text-white rounded-tr-none'
        : isAi
        ? 'bg-emerald-50 text-emerald-700 italic border border-emerald-200 rounded-tl-none'
        : 'bg-rose-50 text-slate-700 border border-rose-100 rounded-tl-none';

    const roleLabel = isSeller ? '客服回复' : isAi ? '✨ AI建议' : '🛒 买家';

    return (
        <div className={`flex ${isSeller ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[82%] p-4 rounded-2xl text-[12px] leading-relaxed ${bubbleClass}`}>
                <span className="text-[9px] font-black opacity-40 uppercase mb-1 block">{roleLabel}</span>

                {/* Original text */}
                <p>{msg.content}</p>

                {/* Translation — auto-show for buyer/ai */}
                {(isBuyer || isAi) && (
                    <p className="mt-1.5 pt-1.5 border-t border-current/10 text-[11px] text-indigo-600">
                        💬 {zh || '翻译中...'}
                    </p>
                )}

                {/* For seller: show translated version */}
                {isSeller && zh && (
                    <p className="mt-1.5 pt-1.5 border-t border-white/10 text-[10px] text-slate-400 italic">
                        → 发送: {zh}
                    </p>
                )}

                <p className={`text-[8px] mt-1.5 opacity-50 ${isSeller ? 'text-right' : 'text-left'}`}>
                    {msg.created_at}
                </p>
            </div>
        </div>
    );
};

const AiBar = ({ aiText, aiLoading, aiZh, onAdopt }) => {
    if (!aiText) return null;
    return (
        <div className="px-5 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-indigo-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-200">
                <Icon name="sparkles" className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mb-0.5">AI 高情商回复（西班牙语）</p>
                {aiLoading ? (
                    <p className="text-[11px] text-indigo-400 italic">✨ 翻译中...</p>
                ) : (
                    <>
                        <p className="text-[11px] font-medium text-indigo-700 truncate">{aiText}</p>
                        {aiZh && (
                            <p className="text-[10px] text-indigo-400 mt-0.5 italic">💬 {aiZh}</p>
                        )}
                    </>
                )}
            </div>
            {!aiLoading && aiText && aiText !== '✨ 正在生成高情商回复...' && (
                <button
                    onClick={() => onAdopt(aiText)}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black hover:bg-indigo-700 transition-all shrink-0"
                >
                    采用
                </button>
            )}
        </div>
    );
};

const DisputesView = () => {
    const [disputes, setDisputes] = useState([]);
    const [active, setActive] = useState(null);
    const [messages, setMessages] = useState([]);
    const [aiText, setAiText] = useState('');
    const [aiZh, setAiZh] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [inputText, setInputText] = useState('');

    useEffect(() => { loadList(); }, []);

    useEffect(() => {
        if (active) { setMessages([]); setAiText(''); setAiZh(''); loadChat(active.id); }
    }, [active]);

    const loadList = async () => {
        try {
            const r = await fetch('/api/customer_service/list');
            const d = await r.json();
            if (Array.isArray(d)) setDisputes(d);
        } catch (e) { console.error(e); }
    };

    const loadChat = async (orderId) => {
        try {
            const r = await fetch(`/api/customer_service/chat?id=${orderId}`);
            const d = await r.json();
            if (Array.isArray(d)) setMessages(d);
        } catch (e) { console.error(e); }
    };

    const fetchAi = async (content, orderId) => {
        setAiText('✨ 正在生成高情商回复...');
        setAiZh('');
        setAiLoading(true);
        try {
            const r = await fetch('/api/customer_service/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, order_id: orderId })
            });
            const d = await r.json();
            const en = d.suggestion || '暂时无法生成建议';
            setAiText(en);
            if (en && !en.startsWith('✨')) {
                const lang = active?.site_id === 'MLB' ? 'pt' : 'es';
                const zh = await doTranslate(en, lang, 'zh-CN');
                setAiZh(zh);
            }
        } catch {
            setAiText('暂时无法生成建议');
        } finally {
            setAiLoading(false);
        }
    };

    // User clicks "adopt AI" → fill input with Chinese version (translate AI's Spanish to Chinese)
    const adoptAi = async (spanishText) => {
        const zh = await doTranslate(spanishText, active?.site_id === 'MLB' ? 'pt' : 'es', 'zh-CN');
        setInputText(zh);
    };

    // User sends a Chinese reply → translate to Spanish and add to chat
    const sendMsg = async () => {
        if (!inputText.trim() || !active) return;
        const zhContent = inputText.trim();
        const lang = active.site_id === 'MLB' ? 'pt' : 'es';
        const esContent = await doTranslate(zhContent, 'zh-CN', lang);
        const newMsg = {
            role: 'seller',
            content: zhContent,
            _sent: esContent || zhContent,
            created_at: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
        };
        setMessages(m => [...m, newMsg]);
        setInputText('');
    };

    const reason = active
        ? (CANCEL_REASON[active.cancel_code] || CANCEL_REASON[active.cancel_detail_group] || '')
        : '';
    const siteFlag = SITE_EMOJI[active?.site_id] || '🌐';

    return (
        <div className="h-full flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-8 duration-700">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">售后纠纷</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                        {disputes.length} 个纠纷订单 · 双向翻译 · AI 高情商回复
                    </p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${disputes.length > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        {disputes.length > 0 ? `${disputes.length} Disputas` : 'Sin disputas'}
                    </span>
                </div>
            </div>

            {/* Main */}
            <div className="flex-1 flex gap-5 overflow-hidden min-h-0">

                {/* Left: Dispute List */}
                <div className="w-80 flex flex-col gap-2.5 overflow-y-auto no-scrollbar pr-1">
                    {disputes.length === 0 && (
                        <div className="text-center py-12 text-slate-400 text-sm">暂无纠纷订单</div>
                    )}
                    {disputes.map(d => {
                        const r = CANCEL_REASON[d.cancel_code] || CANCEL_REASON[d.cancel_detail_group] || '';
                        const shortR = r.length > 26 ? r.substring(0, 26) + '...' : r;
                        return (
                            <button
                                key={d.id}
                                onClick={() => setActive(d)}
                                className={`p-4 rounded-2xl border text-left transition-all flex gap-3 ${
                                    active?.id === d.id
                                    ? 'bg-slate-900 border-slate-900 shadow-xl shadow-slate-200'
                                    : 'bg-white border-slate-200 hover:border-rose-300 hover:bg-rose-50/30'
                                }`}
                            >
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shadow-inner shrink-0 bg-slate-100">
                                    {SITE_EMOJI[d.site_id] || '🌐'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className={`text-[11px] font-black truncate pr-2 ${active?.id === d.id ? 'text-white' : 'text-slate-800'}`}>
                                            {d.product_name?.substring(0, 28) || '未知商品'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${active?.id === d.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            {d.site_id}
                                        </span>
                                        <span className={`text-[9px] font-black ${active?.id === d.id ? 'text-slate-300' : 'text-slate-400'}`}>
                                            ${d.amount}
                                        </span>
                                    </div>
                                    <p className={`text-[9px] leading-snug ${active?.id === d.id ? 'text-rose-300' : 'text-rose-500'}`}>
                                        {d.status === 'cancelled' ? '🔴 ' : ''}{shortR}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    <span className={`text-[9px] ${active?.id === d.id ? 'text-slate-400' : 'text-slate-400'}`}>
                                        {formatDate(d.order_date)}
                                    </span>
                                    <span className={`text-[8px] ${active?.id === d.id ? 'text-slate-500' : 'text-slate-300'}`}>
                                        #{d.id.substring(d.id.length - 6)}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Right: Dispute Detail */}
                <div className="flex-1 flex flex-col rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">

                    {/* Detail Header */}
                    {active && (
                        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xl">{siteFlag}</span>
                                        <span className="text-[13px] font-black text-slate-800">{active.site_id} · {SITE_NAME[active.site_id]}</span>
                                        <span className="text-[10px] font-bold text-slate-400">#{active.id.substring(active.id.length - 8)}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium">{active.product_name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[18px] font-black text-slate-800">${active.amount}</p>
                                    <p className="text-[9px] text-slate-400">{active.status}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {reason && (
                                    <span className="px-3 py-1 bg-rose-50 border border-rose-200 rounded-full text-[10px] font-bold text-rose-600">
                                        ⚠️ {reason}
                                    </span>
                                )}
                                {active.mediations_count > 0 && (
                                    <span className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[10px] font-bold text-amber-600">
                                        🛡 {active.mediations_count} 次调解
                                    </span>
                                )}
                                <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-medium text-slate-500">
                                    🏪 {active.store_name || active.nickname}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Chat Messages */}
                    <div className="flex-1 p-5 overflow-y-auto space-y-3 no-scrollbar">
                        {!active && (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                                ← 选择一个纠纷订单查看详情
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <MsgBubble key={i} msg={msg} siteId={active?.site_id} />
                        ))}
                    </div>

                    {/* AI Suggestion Bar */}
                    {active && (
                        <AiBar
                            aiText={aiText}
                            aiZh={aiZh}
                            aiLoading={aiLoading}
                            onAdopt={adoptAi}
                        />
                    )}

                    {/* Input */}
                    <div className="p-5 pt-3 bg-white">
                        <div className="flex gap-2">
                            <input
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMsg()}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-[12px] font-medium focus:outline-none focus:border-indigo-400 transition-all"
                                placeholder="输入中文回复，系统自动翻译发送..."
                                disabled={!active}
                            />
                            <button
                                onClick={sendMsg}
                                disabled={!active}
                                className="px-5 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-black text-[11px]"
                            >
                                发送
                            </button>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1.5 ml-1">
                            💡 输入中文后点击发送，系统自动翻译为西班牙语/葡萄牙语发送给买家
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DisputesView;

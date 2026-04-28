import { useState, useEffect } from 'react';
import Icon from '../components/Icon.jsx';

const MOCK_MESSAGES = [
    { id: 1, site: 'MLM', buyer: 'Juan Perez', lastMsg: '¿Está disponible?', time: '10:25', unread: true, item_id: 'CBT3902008522' },
    { id: 2, site: 'MLB', buyer: 'Ricardo Silva', lastMsg: 'Obrigado pelo envio!', time: '昨天', unread: false, item_id: 'CBT3902008523' },
    { id: 3, site: 'MCO', buyer: 'Elena Gomez', lastMsg: 'Mi paquete no llega', time: '2小时前', unread: true, item_id: 'CBT3902008524' }
];

const AfterSalesView = () => {
    const [chatList, setChatList] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadChatList();
        const timer = setInterval(loadChatList, 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (activeChat) {
            loadChatHistory(activeChat.id);
        }
    }, [activeChat]);

    const loadChatList = async () => {
        try {
            const res = await fetch('/api/customer_service/list');
            const data = await res.json();
            if (Array.isArray(data)) {
                setChatList(data);
                if (data.length > 0 && !activeChat) setActiveChat(data[0]);
            }
        } catch (e) { console.error(e); }
    };

    const loadChatHistory = async (id) => {
        try {
            const res = await fetch(`/api/customer_service/chat?id=${id}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setMessages(data);
                // Trigger AI suggestion for the last message if it's from buyer
                const lastMsg = data[data.length - 1];
                if (lastMsg && lastMsg.role === 'buyer') {
                    fetchAiSuggestion(lastMsg.content, activeChat.item_id);
                }
            }
        } catch (e) { console.error(e); }
    };

    const fetchAiSuggestion = async (content, item_id) => {
        setAiSuggestion('AI 正在思考...');
        try {
            const res = await fetch('/api/customer_service/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, item_id })
            });
            const data = await res.json();
            setAiSuggestion(data.suggestion);
        } catch (e) { setAiSuggestion('暂时无法获取建议'); }
    };

    const handleSend = () => {
        if (!inputText.trim()) return;
        const newMsg = { role: 'seller', content: inputText, created_at: '现在' };
        setMessages([...messages, newMsg]);
        setInputText('');
        // In a real app, we would POST to /api/customer_service/reply here
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">客服中心</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">AI 售后助理 · 多语言自动翻译</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Real-time Chat</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
                
                {/* Left: Chat List */}
                <div className="w-80 flex flex-col gap-3 overflow-y-auto no-scrollbar pr-1">
                    {chatList.map(chat => (
                        <button 
                            key={chat.id}
                            onClick={() => setActiveChat(chat)}
                            className={`p-4 rounded-3xl border transition-all text-left flex gap-3 ${activeChat?.id === chat.id ? 'bg-slate-900 border-slate-900 shadow-xl' : 'bg-white border-slate-200 hover:border-slate-400'}`}
                        >
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl shadow-inner shrink-0 relative">
                                {chat.site_id === 'MLM' ? '🇲🇽' : chat.site_id === 'MLB' ? '🇧🇷' : '🇨🇴'}
                                {chat.status === 'unread' && <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white"></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <p className={`text-[12px] font-black truncate ${activeChat?.id === chat.id ? 'text-white' : 'text-slate-800'}`}>{chat.buyer_name}</p>
                                    <span className="text-[9px] text-slate-400">{chat.updated_at.split(' ')[1].substring(0,5)}</span>
                                </div>
                                <p className={`text-[10px] truncate ${activeChat?.id === chat.id ? 'text-slate-400' : 'text-slate-500'}`}>{chat.last_message}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Right: Chat Window */}
                <div className="flex-1 flex flex-col rounded-[32px] border border-slate-200 bg-white shadow-sm overflow-hidden">
                    {/* Chat Header */}
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                                <Icon name="user" className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[13px] font-black text-slate-800">{activeChat?.buyer_name || '选择会话'}</p>
                                <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">在线沟通中</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 font-medium">咨询商品</p>
                                <p className="text-[10px] font-black text-blue-600">{activeChat?.item_id}</p>
                            </div>
                            <button className="p-2 hover:bg-slate-200 rounded-lg transition-all text-slate-400"><Icon name="more-vertical" className="w-5 h-5" /></button>
                        </div>
                    </div>

                    {/* Message Flow */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-4 no-scrollbar">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'seller' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-2xl text-[12px] leading-relaxed ${
                                    msg.role === 'seller' ? 'bg-slate-900 text-white rounded-tr-none' 
                                    : msg.role === 'ai' ? 'bg-emerald-50 text-emerald-700 italic border border-emerald-100'
                                    : 'bg-slate-100 text-slate-700 rounded-tl-none'
                                }`}>
                                    {msg.content}
                                    {msg.translated_content && (
                                        <p className="mt-2 pt-2 border-t border-slate-200/30 opacity-70 italic text-[11px]">
                                            [中文翻译]: {msg.translated_content}
                                        </p>
                                    )}
                                    <p className={`text-[8px] mt-1 opacity-50 ${msg.role === 'seller' ? 'text-right' : 'text-left'}`}>{msg.created_at}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* AI Assistant Suggestion */}
                    <div className="px-6 py-3 bg-indigo-50/50 border-t border-indigo-100 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-200">
                            <Icon name="sparkles" className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mb-0.5">AI 建议回复</p>
                            <p className="text-[11px] text-indigo-700 font-medium italic truncate">{aiSuggestion}</p>
                        </div>
                        <button 
                            onClick={() => setInputText(aiSuggestion)}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black hover:bg-indigo-700 transition-all"
                        >
                            采用回复
                        </button>
                    </div>

                    {/* Input Area */}
                    <div className="p-6 pt-2 bg-white">
                        <div className="relative">
                            <input 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-[12px] font-medium focus:outline-none focus:border-slate-400 transition-all pr-12"
                                placeholder="输入消息内容..."
                            />
                            <button 
                                onClick={handleSend}
                                className="absolute right-3 top-2.5 p-2 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all"
                            >
                                <Icon name="send" className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AfterSalesView;

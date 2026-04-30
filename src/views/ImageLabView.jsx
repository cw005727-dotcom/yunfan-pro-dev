import { useState } from 'react';
import Icon from '../components/Icon.jsx';

const IMAGE_TYPES = [
    {
        key: 'main',
        label: '主图',
        desc: '商品全貌 · 纯色背景',
        color: 'bg-slate-800',
        textColor: 'text-white',
        defaultPrompt: '高清商品主图，纯白背景，4K画质，突出商品全貌，设计精美，构图专业，吸引点击，地道西班牙语标注'
    },
    {
        key: 'scene',
        label: '场景图',
        desc: '实际使用情境',
        color: 'bg-amber-500',
        textColor: 'text-white',
        defaultPrompt: '真实生活场景图，展示人物使用商品的感受，凸显商品价值与使用体验，4K高清，氛围自然，西班牙语标注'
    },
    {
        key: 'feature',
        label: '功能图',
        desc: '核心功能展示',
        color: 'bg-blue-500',
        textColor: 'text-white',
        defaultPrompt: '展示商品核心功能，清晰说明产品用途与优势，4K高清，构图专业，西班牙语标注'
    },
    {
        key: 'detail',
        label: '细节图',
        desc: '材质/工艺特写',
        color: 'bg-violet-500',
        textColor: 'text-white',
        defaultPrompt: '材质/工艺特写，近景微距摄影，展示做工精细与品质感，光影层次分明，4K高清，西班牙语标注'
    },
    {
        key: 'guide',
        label: '购买指令图',
        desc: 'SKU+价格导购',
        color: 'bg-emerald-500',
        textColor: 'text-white',
        defaultPrompt: '包含SKU、品名、价格核心信息的导购图，清晰醒目，引导购买决策，西班牙语，设计精美'
    },
];

const ImageLabView = () => {
    // referenceImage: { name, base64 }  — base64 is the data URI passed to MiniMax
    const [referenceImage, setReferenceImage] = useState(null);
    const [cards, setCards] = useState(
        IMAGE_TYPES.map(t => ({ key: t.key, prompt: t.defaultPrompt, url: '', status: 'idle', error: '' }))
    );
    const [globalGenerating, setGlobalGenerating] = useState(false);

    const updateCard = (key, field, value) => {
        setCards(prev => prev.map(c => c.key === key ? { ...c, [field]: value } : c));
    };

    const generateOne = async (key, prompt, refBase64) => {
        const idx = cards.findIndex(c => c.key === key);
        if (cards[idx].status === 'generating') return;

        updateCard(key, 'status', 'generating');
        updateCard(key, 'url', '');
        updateCard(key, 'error', '');

        try {
            const res = await fetch('/api/ai/generate-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    reference_url: refBase64 || ''
                })
            });
            const data = await res.json();
            if (data.error) {
                updateCard(key, 'error', data.error);
                updateCard(key, 'status', 'idle');
            } else {
                updateCard(key, 'url', data.url || '');
                updateCard(key, 'status', 'done');
            }
        } catch (e) {
            updateCard(key, 'error', e.message);
            updateCard(key, 'status', 'idle');
        }
    };

    const generateAll = async () => {
        setGlobalGenerating(true);
        for (const card of cards) {
            if (!card.prompt.trim()) continue;
            await generateOne(card.key, card.prompt, referenceImage?.base64 || '');
        }
        setGlobalGenerating(false);
    };

    const downloadOne = (url, label) => {
        if (!url) return;
        const a = document.createElement('a');
        a.href = url;
        a.download = `${label}-${Date.now()}.jpg`;
        a.target = '_blank';
        a.click();
    };

    const downloadAll = () => {
        cards.forEach(c => {
            const type = IMAGE_TYPES.find(t => t.key === c.key);
            if (c.url) downloadOne(c.url, type?.label);
        });
    };

    const isAllDone = cards.length > 0 && cards.every(c => c.status === 'done');
    const isAnyGenerating = cards.some(c => c.status === 'generating');

    return (
        <div className="h-full overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700">
            {/* Header with Visual Status */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 pb-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/20">
                            <Icon name="image" className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">视觉图生图</h3>
                    </div>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em]">High-Fidelity Visual Product Intelligence</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">引擎状态</p>
                        <p className="text-[14px] font-black text-emerald-600 uppercase">MiniMax AI 已连接</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-emerald-500 shadow-sm animate-pulse">
                        <Icon name="zap" className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Reference Image Upload (V1.1 Elite Style) */}
            <div
                className="bg-white rounded-[40px] border-4 border-dashed border-slate-100 p-10 text-center hover:border-blue-500/20 transition-all cursor-pointer group relative overflow-hidden"
                onClick={() => document.getElementById('ref-image-input').click()}
            >
                <input
                    id="ref-image-input"
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={e => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = ev => {
                            setReferenceImage({ name: file.name, base64: ev.target.result });
                        };
                        reader.readAsDataURL(file);
                    }}
                />
                {referenceImage ? (
                    <div className="flex items-center gap-6 max-w-2xl mx-auto">
                        <div className="relative">
                            <img src={referenceImage.base64} alt="参考图" className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-2xl" />
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                <Icon name="check" className="w-3 h-3 text-white" />
                            </div>
                        </div>
                        <div className="flex-1 text-left">
                            <h5 className="text-[16px] font-black text-slate-900 uppercase tracking-tight">{referenceImage.name}</h5>
                            <p className="text-[11px] text-emerald-600 font-black uppercase mt-1 tracking-widest">✅ 风格特征已提取 · 将应用于全量生成</p>
                        </div>
                        <button
                            onClick={e => { e.stopPropagation(); setReferenceImage(null); }}
                            className="w-12 h-12 rounded-2xl bg-slate-50 hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all border border-slate-100"
                        >
                            <Icon name="trash-2" className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-sm">
                            <Icon name="upload-cloud" className="w-10 h-10 text-slate-300" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">上传商品原图</h4>
                            <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em]">作为生成时的构图与风格参考 (JPG/PNG)</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Cards Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {IMAGE_TYPES.map((type, idx) => {
                    const card = cards.find(c => c.key === type.key) || { prompt: '', url: '', status: 'idle', error: '' };
                    const isDone = card.status === 'done';
                    const isGen = card.status === 'generating';

                    return (
                        <div key={type.key} className="bg-white rounded-[40px] border border-slate-100 p-6 flex flex-col gap-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                            {/* Card Header */}
                            <div className="flex items-center justify-between">
                                <div className={`px-3 py-1 rounded-xl ${type.color} ${type.textColor} text-[10px] font-black uppercase tracking-widest`}>
                                    {type.label}
                                </div>
                                <span className="text-[12px] font-black text-slate-200 group-hover:text-slate-900 transition-colors italic">0{idx + 1}</span>
                            </div>

                            {/* Preview Area */}
                            <div className="aspect-[3/4] rounded-[32px] overflow-hidden bg-slate-50 border border-slate-50 relative flex items-center justify-center">
                                {card.url ? (
                                    <>
                                        <img src={card.url} alt={type.label} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => downloadOne(card.url, type.label)}
                                                className="w-12 h-12 rounded-2xl bg-white text-slate-900 flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
                                            >
                                                <Icon name="download" className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </>
                                ) : isGen ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin"></div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AI 计算中...</span>
                                    </div>
                                ) : (
                                    <Icon name="image" className="w-12 h-12 text-slate-200" />
                                )}
                            </div>

                            {/* Prompt Input */}
                            <div className="space-y-4">
                                <textarea
                                    value={card.prompt}
                                    onChange={e => updateCard(type.key, 'prompt', e.target.value)}
                                    placeholder="输入 AI 绘图指令..."
                                    rows={3}
                                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-4 py-3 text-[11px] font-bold text-slate-600 focus:outline-none focus:bg-white focus:border-blue-500/20 transition-all resize-none leading-relaxed"
                                />
                                <button
                                    onClick={() => generateOne(type.key, card.prompt, referenceImage?.base64 || '')}
                                    disabled={isGen || !card.prompt.trim()}
                                    className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 disabled:opacity-20 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
                                >
                                    <Icon name={isGen ? 'loader' : 'sparkles'} className={`w-3.5 h-3.5 ${isGen ? 'animate-spin' : ''}`} />
                                    {isGen ? '正在生成' : '立即生成'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Global Actions */}
            <div className="flex flex-col md:flex-row items-center gap-6 pt-6">
                <button
                    onClick={generateAll}
                    disabled={globalGenerating || isAnyGenerating}
                    className="w-full md:flex-1 py-6 bg-blue-600 text-white rounded-[32px] font-black text-[14px] uppercase tracking-[0.3em] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 active:scale-95 flex items-center justify-center gap-3"
                >
                    <Icon name={globalGenerating ? 'loader' : 'zap'} className={`w-5 h-5 ${globalGenerating ? 'animate-spin' : ''}`} />
                    {globalGenerating ? '全矩阵生成中...' : '启动全链路图生图矩阵'}
                </button>
                {isAllDone && (
                    <button
                        onClick={downloadAll}
                        className="w-full md:w-auto px-10 py-6 bg-white text-slate-900 border border-slate-200 rounded-[32px] font-black text-[14px] uppercase tracking-widest hover:border-slate-400 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Icon name="download" className="w-5 h-5" />
                        批量导出
                    </button>
                )}
            </div>
        </div>
    );
};

export default ImageLabView;

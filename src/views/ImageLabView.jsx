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
        <div className="h-full overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight whitespace-nowrap">视觉图生图</h3>
                    <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-1 whitespace-nowrap">Visual Product Intelligence</p>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-[11px] text-slate-500 font-medium">MiniMax 图生图 3:4</span>
                </div>
            </div>

            {/* Reference Image Upload */}
            <div
                className="solid-card rounded-2xl border-2 border-dashed border-slate-200 p-5 text-center hover:border-slate-300 transition-all cursor-pointer group"
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
                    <div className="flex items-center gap-4">
                        <img src={referenceImage.base64} alt="参考图" className="w-16 h-16 rounded-2xl object-cover border border-slate-100" />
                        <div className="flex-1 text-left">
                            <p className="text-[12px] font-black text-slate-700">{referenceImage.name}</p>
                            <p className="text-[11px] text-emerald-500 font-medium mt-0.5">✅ 参考图已就绪，将用于生成</p>
                        </div>
                        <button
                            onClick={e => { e.stopPropagation(); setReferenceImage(null); }}
                            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-50 flex items-center justify-center text-slate-500 hover:text-red-400 transition-all"
                        >
                            <Icon name="x" className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3 group-hover:bg-slate-100 transition-colors">
                            <Icon name="upload-cloud" className="w-7 h-7 text-slate-500 group-hover:text-slate-500" />
                        </div>
                        <p className="text-[12px] font-black text-slate-500">上传商品原图作为风格参考</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-1">点击选择 · JPG/PNG · 仅本地处理，不上传</p>
                    </>
                )}
            </div>

            {/* Cards */}
            <div className="space-y-2.5">
                <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest px-1">生成结果 · 5张图</p>
                {IMAGE_TYPES.map((type, idx) => {
                    const card = cards.find(c => c.key === type.key) || { prompt: '', url: '', status: 'idle', error: '' };
                    const isDone = card.status === 'done';
                    const isGen = card.status === 'generating';

                    return (
                        <div key={type.key} className="solid-card rounded-2xl p-4 border border-slate-100 flex items-start gap-4">

                            {/* Left: index + label */}
                            <div className={`w-12 h-12 rounded-2xl ${type.color} ${type.textColor} flex flex-col items-center justify-center shrink-0`}>
                                <span className="text-[11px] font-black opacity-70">0{idx + 1}</span>
                                <span className="text-[11px] font-black leading-tight text-center">{type.label}</span>
                            </div>

                            {/* Center */}
                            <div className="flex-1 min-w-0 space-y-3">
                                {/* Prompt textarea */}
                                <textarea
                                    value={card.prompt}
                                    onChange={e => updateCard(type.key, 'prompt', e.target.value)}
                                    placeholder={`输入 ${type.label} 指令...`}
                                    rows={2}
                                    maxLength={300}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[11px] font-medium text-slate-600 placeholder:text-slate-500 focus:outline-none focus:border-slate-300 resize-none leading-relaxed"
                                />

                                {/* Preview */}
                                <div className="rounded-xl overflow-hidden bg-slate-50 h-36 flex items-center justify-center relative">
                                    {card.url ? (
                                        <>
                                            <img src={card.url} alt={type.label} className="w-full h-full object-contain" />
                                            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                                                <button
                                                    onClick={() => downloadOne(card.url, type.label)}
                                                    className="bg-white/90 backdrop-blur text-slate-700 rounded-xl px-3 py-1.5 text-[11px] font-black flex items-center gap-1.5"
                                                >
                                                    <Icon name="download" className="w-3.5 h-3.5" />
                                                    下载
                                                </button>
                                            </div>
                                        </>
                                    ) : isGen ? (
                                        <div className="h-full flex items-center justify-center gap-3">
                                            <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-slate-500 animate-spin"></div>
                                            <span className="text-[11px] text-slate-500 font-medium">生成中 ({referenceImage ? '含参考图' : '无参考'})...</span>
                                        </div>
                                    ) : card.error ? (
                                        <div className="px-4 text-center">
                                            <p className="text-[11px] text-red-400 font-medium">❌ {card.error}</p>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center gap-1.5">
                                            <Icon name="image" className="w-7 h-7 text-slate-500" />
                                            <span className="text-[11px] text-slate-500 font-medium">{type.desc}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: generate button */}
                            <div className="shrink-0 flex flex-col items-end gap-2">
                                <button
                                    onClick={() => generateOne(type.key, card.prompt, referenceImage?.base64 || '')}
                                    disabled={isGen || !card.prompt.trim()}
                                    className="bg-slate-800 hover:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2.5 font-black text-[11px] flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
                                >
                                    <Icon name={isGen ? 'loader' : 'sparkles'} className={`w-3.5 h-3.5 ${isGen ? 'animate-spin' : ''}`} />
                                    {isGen ? '生成中' : '生成'}
                                </button>
                                {isDone && (
                                    <button
                                        onClick={() => downloadOne(card.url, type.label)}
                                        className="text-[11px] text-slate-500 hover:text-slate-600 font-medium flex items-center gap-1 transition-colors"
                                    >
                                        <Icon name="download" className="w-3.5 h-3.5" />
                                        下载
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
                <button
                    onClick={generateAll}
                    disabled={globalGenerating || isAnyGenerating}
                    className="flex-1 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl py-4 font-black text-[12px] flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    <Icon name={globalGenerating ? 'loader' : 'sparkles'} className={`w-4 h-4 ${globalGenerating ? 'animate-spin' : ''}`} />
                    {globalGenerating ? '生成中...' : '全部生成（5张）'}
                </button>
                {isAllDone && (
                    <button
                        onClick={downloadAll}
                        className="bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-2xl px-6 py-4 font-black text-[12px] flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Icon name="download" className="w-4 h-4" />
                        下载全部
                    </button>
                )}
            </div>
        </div>
    );
};

export default ImageLabView;

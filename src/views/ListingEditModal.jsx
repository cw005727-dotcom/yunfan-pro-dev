import { useState, useEffect } from 'react';
import Icon from '../components/Icon.jsx';
import { useAppContext } from '../context/AppContext';

const ListingEditModal = ({ isOpen, onClose, item }) => {
    const { showToast } = useAppContext();
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    useEffect(() => {
        if (item) {
            setTitle(item.name || '');
            setImageUrl(item.image_url || '');
            // Description might need a separate fetch if not in the item object
            fetchDescription(item.item_id);
        }
    }, [item]);

    const fetchDescription = async (itemId) => {
        try {
            const res = await fetch(`https://api.mercadolibre.com/items/${itemId}/description`);
            if (res.ok) {
                const data = await res.json();
                setDescription(data.plain_text || '');
            }
        } catch (e) { console.error(e); }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/item/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    item_id: item.item_id,
                    title: title !== item.name ? title : undefined,
                    pictures: imageUrl !== item.image_url ? [imageUrl] : undefined,
                    description: description
                })
            });
            const data = await res.json();
            if (data.status === 'success') {
                showToast('更新成功！美客多后台已同步', 'success');
                onClose();
            } else {
                showToast('更新失败: ' + data.message, 'error');
            }
        } catch (e) {
            showToast('请求失败', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900">修改商品详情</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.item_id} · {item.site_id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <Icon name="x" className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-6 border-b border-slate-50">
                    {[
                        { key: 'basic', label: '基础信息' },
                        { key: 'desc', label: '详情描述' }
                    ].map(t => (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            className={`px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 ${
                                activeTab === t.key ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {activeTab === 'basic' ? (
                        <>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">商品标题 (Max 60)</label>
                                <textarea
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 p-4 text-[13px] font-medium text-slate-700 focus:border-slate-400 focus:outline-none transition-all"
                                    rows={2}
                                />
                                <p className="text-[10px] text-right text-slate-300">{title.length}/60</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">主图链接</label>
                                <div className="flex gap-4">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <textarea
                                        value={imageUrl}
                                        onChange={e => setImageUrl(e.target.value)}
                                        className="flex-1 rounded-2xl border border-slate-200 p-4 text-[11px] font-mono text-slate-500 focus:border-slate-400 focus:outline-none transition-all"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-2 h-full flex flex-col">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">详情描述 (Plain Text)</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="flex-1 w-full rounded-2xl border border-slate-200 p-4 text-[12px] font-medium text-slate-600 focus:border-slate-400 focus:outline-none transition-all resize-none min-h-[300px]"
                                placeholder="输入商品详细描述..."
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-3 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving && <Icon name="loader" className="w-4 h-4 animate-spin" />}
                        {isSaving ? '正在保存...' : '提交修改'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ListingEditModal;

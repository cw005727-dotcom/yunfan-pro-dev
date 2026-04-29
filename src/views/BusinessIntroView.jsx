import { useAppContext } from '../context/AppContext';
import Icon from '../components/Icon.jsx';

const BusinessIntroView = () => (
    <div className="h-full overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-12 animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700">
        <div className="space-y-4">
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">云帆跨境:智领拉美</h3>
            <p className="text-blue-600 text-[11px] font-black uppercase tracking-[0.5em]">Defining Latin American Commerce</p>
        </div>
        <div className="prose max-w-none space-y-8">
            <p className="text-slate-600 text-lg leading-relaxed font-medium">
                云帆跨境 (Yunfan Cross-border) 致力于为中国顶级出海卖家提供一站式、全链路的智能运营解决方案。
                我们深度整合了 MercadoLibre (美客多) API 生态,并接入先进的生成式 AI 模型,助力卖家在激烈的全球竞争中实现跨越式增长。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                <div className="solid-card p-10 rounded-[40px] border-slate-200 space-y-4 shadow-xl">
                    <p className="text-slate-900 font-black text-xl italic uppercase tracking-widest">愿景</p>
                    <p className="text-slate-500 text-sm leading-relaxed">让每一个中国品牌都能轻松出海拉美,在全球舞台绽放光彩。</p>
                </div>
                <div className="solid-card p-10 rounded-[40px] border-slate-200 space-y-4 shadow-xl">
                    <p className="text-blue-600 font-black text-xl italic uppercase tracking-widest">核心科技</p>
                    <p className="text-slate-500 text-sm leading-relaxed">基于 MiniMax 等顶尖模型,提供多语种内容优化与智能选品情报。</p>
                </div>
            </div>
        </div>
    </div>
);

export default BusinessIntroView;

import Icon from './Icon';

const Brand = ({ slogan = "跨境电商智能工作台" }) => (
    <div className="flex items-center gap-4">
        <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Icon name="send" className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col -space-y-1 text-left">
            <span className="text-slate-900 font-black tracking-tighter text-2xl whitespace-nowrap">云帆跨境</span>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">{slogan}</span>
        </div>
    </div>
);

export default Brand;

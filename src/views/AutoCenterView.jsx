import { useAppContext } from '../context/AppContext';
import { useState, useRef } from 'react';
import Icon from '../components/Icon.jsx';

const TABS = [
  { id: 'title',  label: '标题优化', icon: 'type'      },
  { id: 'image',  label: '图片生成', icon: 'image'     },
  { id: 'video',  label: '视频生成', icon: 'video'     },
  { id: 'detail', label: '详情生成', icon: 'file-text' },
];

const TAB_STYLE = {
  title:  { gradient: 'from-violet-500 to-purple-500' },
  image:  { gradient: 'from-blue-500 to-indigo-500'  },
  video:  { gradient: 'from-red-500 to-pink-500'     },
  detail: { gradient: 'from-emerald-500 to-teal-500' },
};

const LANGUAGES = [
  { value: 'Spanish',    label: '西' },
  { value: 'Portuguese', label: '葡' },
  { value: 'English',    label: '英' },
];

const IMAGE_TYPES_OPT = [
  { value: 'main',      label: '主图'    },
  { value: 'detail',   label: '细节'    },
  { value: 'feature',  label: '卖点'    },
  { value: 'scene',    label: '场景'    },
  { value: 'packaging', label: '包装'   },
];

const STEPS = [
  '正在发送请求...', '已发送请求', '已收到响应', 'AI 生成中...', '正在等待结果...',
];

const MAX_REF_IMAGES = 3;

// ── 类目及其详细指令 ─────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'fashion', label: '服装',
    icon: '👕',
    instructions: {
      main: '模特上身正面站立，平光均匀，纯白背景，版型挺括',
      detail: '面料纹理微距，缝线做工，领口 / 袖口特写',
      feature: '功能性展示：防水 / 透气 / 弹性拉伸动图',
      scene: '街拍 / 通勤 / 约会场景，自然光线，氛围感',
      packaging: '折叠整齐，透明袋 / 吊牌可见',
    },
  },
  {
    id: 'beauty', label: '美妆',
    icon: '🧴',
    instructions: {
      main: '瓶身 / 管体居中，白底，光影质感，色彩准确无偏色',
      detail: '泵头 / 刷头特写，质地挤出效果，水润感 / 粉质感',
      feature: '使用前后对比，上脸 / 上手涂抹效果',
      scene: '浴室 / 梳妆台布置，ins 风，高级感',
      packaging: '含外盒 + 内瓶，礼盒感，Logo 清晰',
    },
  },
  {
    id: 'baby', label: '母婴',
    icon: '👶',
    instructions: {
      main: '温暖柔和色调，圆润无尖锐，安全感',
      detail: '面料亲肤特写，食品级材质标注，无 BPA 标识',
      feature: '功能演示：防漏 / 防摔 / 可拆卸',
      scene: '宝宝使用 / 妈妈手持，居家温馨，光线柔和',
      packaging: '环保包装，配件全展示',
    },
  },
  {
    id: '3c', label: '3C',
    icon: '📱',
    instructions: {
      main: '深色 / 渐变背景，科技感光影，产品 45° 角，光效点缀',
      detail: '接口 / 屏幕 / 按键特写，极简构图，金属质感',
      feature: '功能示意：防水 / 快充 / 折叠 / 插口标注',
      scene: '桌面布置 / 手持使用，ins 科技风',
      packaging: '盒装整齐，数据线 / 说明书等配件全展示',
    },
  },
  {
    id: 'home', label: '家居',
    icon: '🏠',
    instructions: {
      main: '室内环境光，暖色调，单品居中展示',
      detail: '材质纹理特写（木纹 / 布艺 / 陶瓷釉面）',
      feature: '尺寸参照 / 功能展示：可折叠 / 可水洗 / 储物',
      scene: '客厅 / 卧室 / 书房布置，生活氛围感',
      packaging: '简洁包装，安装配件展示',
    },
  },
  {
    id: 'sports', label: '运动户外',
    icon: '👟',
    instructions: {
      main: '强光 / 侧光，动感，纯色背景，产品悬空感',
      detail: '鞋底纹理 / 面料科技 / 反光标特写',
      feature: '功能演示：防水 / 防滑 / 减震',
      scene: '户外实景：跑步 / 登山 / 露营，自然光',
      packaging: '鞋盒 + 鞋，吊牌可见',
    },
  },
  {
    id: 'jewelry', label: '珠宝',
    icon: '💍',
    instructions: {
      main: '纯黑 / 纯白背景，强光打亮，金属反光质感',
      detail: '宝石 / 刻面 / 链扣微距，超景深，闪耀感',
      feature: '模特佩戴特写：耳垂 / 手腕 / 锁骨',
      scene: '礼盒 / 宴会 / 日常佩戴氛围',
      packaging: '首饰盒 + 内衬，丝绒质感高级感',
    },
  },
  {
    id: 'pet', label: '宠物',
    icon: '🐾',
    instructions: {
      main: '明亮柔和，宠物友好氛围，温和色调',
      detail: '材质安全特写，耐咬 / 防水面料纹理',
      feature: '宠物使用演示 / 尺寸对比',
      scene: '宠物在家中 / 户外使用，温馨活泼',
      packaging: '环保包装，配件 + 说明',
    },
  },
  {
    id: 'furniture', label: '家具',
    icon: '🪑',
    instructions: {
      main: '室内陈列，45° 视角，光影柔和，体积感',
      detail: '接缝 / 五金件 / 布料纹理特写',
      feature: '功能展示：折叠 / 储物 / 变形',
      scene: '客厅 / 卧室搭配布置，生活化',
      packaging: '平板包装，安装件分类展示',
    },
  },
  {
    id: 'kitchen', label: '厨具',
    icon: '🍳',
    instructions: {
      main: '明亮通透，白底 / 木桌，产品整洁排列',
      detail: '材质特写：不粘涂层 / 陶瓷釉面 / 不锈钢拉丝',
      feature: '使用场景：烹饪 / 摆盘 / 盛菜',
      scene: '厨房环境 / 餐桌布置，烟火气',
      packaging: '彩盒包装，配件刀叉勺全展示',
    },
  },
];

function GlassCard({ children, className = '' }) {
  return (
    <div className={`glass-effect rounded-xl p-2.5 border border-white/20 bg-white/70 backdrop-blur-xl shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function RefImageRow({ referenceImages, fileInputRefs, onUpload, onDrop, onRemove }) {
  const slots = Array.from({ length: MAX_REF_IMAGES }, (_, i) => referenceImages[i] || null);
  return (
    <div className="flex items-center gap-1.5">
      {slots.map((ref, slotIdx) => (
        <div
          key={slotIdx}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) onUpload(f, slotIdx); }}
          onDragOver={e => e.preventDefault()}
          onClick={() => !ref && fileInputRefs.current[slotIdx]?.click()}
          className={`relative w-10 h-10 rounded-lg border-2 border-dashed transition-all cursor-pointer overflow-hidden shrink-0 ${
            ref ? 'border-blue-300 bg-white' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          {ref ? (
            <>
              <img src={ref.url} alt="" className="w-full h-full object-cover" />
              {ref.uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <button
                onClick={e => { e.stopPropagation(); onRemove(slotIdx); }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-black/60 text-white rounded-full flex items-center justify-center text-[8px] leading-none hover:bg-red-500"
              >×</button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <Icon name="plus" className="w-3 h-3 text-slate-300" />
            </div>
          )}
          <input
            ref={el => fileInputRefs.current[slotIdx] = el}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files[0]; if (f) onUpload(f, slotIdx); e.target.value = ''; }}
          />
        </div>
      ))}
      <div className="flex-1 min-w-0">
        <p className="text-[9px] text-slate-400 font-medium">参考图 <span className="text-slate-300">（1~3张）</span></p>
        {referenceImages.filter(Boolean).length > 0 && (
          <p className="text-[9px] text-blue-500 font-bold">{referenceImages.filter(Boolean).length} 张</p>
        )}
      </div>
    </div>
  );
}

function StepProgress({ currentStep }) {
  return (
    <div className="space-y-0.5">
      {STEPS.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={i} className="flex items-center gap-1.5">
            <div className="flex flex-col items-center w-2.5">
              {i > 0 && <div className={`w-px h-1 ${done ? 'bg-violet-400' : 'bg-slate-200'}`} />}
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all ${
                done ? 'bg-emerald-400' : active ? 'bg-violet-500 animate-pulse' : 'bg-slate-200'
              }`} />
              {i < STEPS.length - 1 && <div className={`w-px h-1 ${done ? 'bg-violet-400' : 'bg-slate-200'}`} />}
            </div>
            <span className={`text-[9px] font-medium ${done ? 'text-emerald-500' : active ? 'text-violet-600 font-bold' : 'text-slate-300'}`}>
              {done && '✓ '}{step}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── 指令展示面板 ─────────────────────────────────────────────────────────
function InstructionPanel({ category }) {
  if (!category) return (
    <div className="text-[9px] text-slate-400 text-center py-2">点击左上方类目查看详细指令</div>
  );
  return (
    <div className="space-y-1.5">
      {[
        { type: 'main', label: '主图', color: 'bg-violet-100 text-violet-600' },
        { type: 'detail', label: '细节', color: 'bg-blue-100 text-blue-600' },
        { type: 'feature', label: '卖点', color: 'bg-rose-100 text-rose-600' },
        { type: 'scene', label: '场景', color: 'bg-amber-100 text-amber-600' },
        { type: 'packaging', label: '包装', color: 'bg-emerald-100 text-emerald-600' },
      ].map(({ type, label, color }) => (
        <div key={type} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100/60">
          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${color}`}>{label}</span>
          <span className="text-[10px] text-slate-600 leading-relaxed">{category.instructions[type]}</span>
        </div>
      ))}
    </div>
  );
}

export default function AutoCenterView() {
  const { showToast } = useAppContext();
  const [activeTab, setActiveTab] = useState('title');
  const [loading, setLoading]    = useState(false);
  const [result, setResult]      = useState(null);
  const [error, setError]        = useState('');
  const [currentStep, setCurrentStep] = useState(-1);
  const [copiedIdx, setCopiedIdx]     = useState(null);

  // 共享
  const [productName, setProductName]           = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [titleCount, setTitleCount]             = useState(3);

  // 图片 tab
  const [imageDesc, setImageDesc]             = useState('');
  const [selectedCats, setSelectedCats]        = useState([]);
  const [imageTypes, setImageTypes]            = useState(['main', 'detail', 'feature', 'scene', 'packaging']);
  const [referenceImages, setReferenceImages]  = useState([]);
  const [uploadingCount, setUploadingCount]    = useState(0);
  const fileInputRefs = useRef([]);

  // 视频 tab
  const [videoDesc, setVideoDesc]         = useState('');
  const [videoDuration, setVideoDuration] = useState(5);

  // 详情 tab
  const [detailDesc, setDetailDesc]  = useState('');
  const [detailLang, setDetailLang]  = useState('Spanish');

  const ts = TAB_STYLE[activeTab];

  const toggleCat = (id) => {
    setSelectedCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const selectedCatObj = selectedCats.length === 1
    ? CATEGORIES.find(c => c.id === selectedCats[0])
    : null;

  const handleRefImageUpload = async (file, slotIndex) => {
    if (!file.type.startsWith('image/')) { showToast('请上传图片文件', 'error'); return; }
    if (file.size > 10 * 1024 * 1024) { showToast('图片不能超过 10MB', 'error'); return; }
    const localPreview = URL.createObjectURL(file);
    const updated = [...referenceImages];
    updated[slotIndex] = { url: localPreview, uploading: true };
    setReferenceImages(updated);
    setUploadingCount(c => c + 1);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || '上传失败');
      const final = [...referenceImages];
      final[slotIndex] = { url: data.url, uploading: false };
      setReferenceImages(final);
    } catch (e) {
      const fail = [...referenceImages];
      fail[slotIndex] = null;
      setReferenceImages(fail);
      showToast('上传失败: ' + e.message, 'error');
    } finally {
      setUploadingCount(c => c - 1);
    }
  };

  const toggleImageType = (type) => {
    setImageTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const downloadAllImages = async () => {
    const images = result?.result_data?.images || [];
    if (!images.length) { showToast('没有可下载的图片', 'error'); return; }
    for (let i = 0; i < images.length; i++) {
      try {
        const res = await fetch(images[i].url);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${images[i].type || 'img'}_${i + 1}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (i < images.length - 1) await new Promise(r => setTimeout(r, 300));
      } catch { showToast(`第 ${i+1} 张下载失败`, 'error'); }
    }
  };

  const handleRun = async () => {
    if (!['image', 'video', 'detail'].includes(activeTab) && !productName.trim()) {
      showToast('请输入产品名称', 'error'); return;
    }
    if (activeTab === 'image' && !imageDesc.trim()) {
      showToast('请输入图片描述', 'error'); return;
    }
    setLoading(true); setResult(null); setError(''); setCurrentStep(0);
    let stepInterval;
    try {
      stepInterval = setInterval(() => setCurrentStep(p => Math.min(p + 1, STEPS.length - 1)), 1200);
      const body = { workflow_type: activeTab, custom_instructions: customInstructions };
      if (productName.trim()) body.product_name = productName;
      if (activeTab === 'title') body.title_count = titleCount;
      else if (activeTab === 'image') {
        body.image_description = imageDesc;
        body.image_style = 'product photography';
        body.image_types = imageTypes;
        if (selectedCats.length) body.category = selectedCats.join(',');
        const refs = referenceImages.filter(r => r && !r.uploading && r.url?.startsWith('/')).map(r => ({ url: r.url, file_type: 'image' }));
        if (refs.length) body.reference_images = refs;
      } else if (activeTab === 'video') {
        body.video_description = videoDesc;
        body.video_duration = videoDuration;
      } else if (activeTab === 'detail') {
        body.product_description = detailDesc;
        body.detail_language = detailLang;
      }
      const res = await fetch('/api/auto/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || '调用失败');
      clearInterval(stepInterval);
      setCurrentStep(STEPS.length);
      setTimeout(() => { setResult(data); setLoading(false); setCurrentStep(-1); showToast('执行成功', 'success'); }, 400);
    } catch (e) {
      clearInterval(stepInterval);
      setError(e.message); setLoading(false); setCurrentStep(-1);
      showToast(e.message, 'error');
    }
  };

  const copyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const imgResults = result?.result_data?.images?.length
    ? result.result_data.images
    : (result?.result_data?.image_urls || []);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50">

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0 bg-white border-b border-slate-100/60">
        <div>
          <h3 className="text-sm font-black text-slate-900 tracking-tight">自动化中心</h3>
          <p className="text-[9px] text-slate-400 font-medium mt-0.5">Coze · 美客多4合1</p>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200/60">
          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-bold text-emerald-600">Coze 云端</span>
        </div>
      </div>

      {/* Tab 标签条 */}
      <div className="flex gap-1 px-4 py-2 shrink-0 bg-white border-b border-slate-100/60 overflow-x-auto no-scrollbar">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setResult(null); setError(''); setCurrentStep(-1); }}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                isActive
                  ? `bg-gradient-to-r ${TAB_STYLE[tab.id].gradient} text-white shadow-sm`
                  : 'text-slate-400 hover:bg-slate-100'
              }`}
            >
              <Icon name={tab.icon} className="w-3 h-3" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 主内容 */}
      <div className="flex-1 overflow-y-auto px-4 py-2.5 space-y-2">

        {/* 产品名称 + 指令（非图片 tab） */}
        {activeTab !== 'image' && (
          <GlassCard>
            <textarea
              value={productName}
              onChange={e => setProductName(e.target.value)}
              placeholder="输入产品名称或原始标题..."
              rows={2}
              className="w-full bg-transparent text-[12px] font-medium text-slate-700 resize-none focus:outline-none placeholder:text-slate-300 leading-relaxed"
            />
            <div className="border-t border-dashed border-slate-100 mt-1.5 pt-1.5">
              <textarea
                value={customInstructions}
                onChange={e => setCustomInstructions(e.target.value)}
                placeholder="自定义指令（可选，影响 Coze 生成结果）..."
                rows={1}
                className="w-full bg-transparent text-[11px] text-slate-500 resize-none focus:outline-none placeholder:text-slate-300 leading-relaxed"
              />
            </div>
          </GlassCard>
        )}

        {/* 标题专属 */}
        {activeTab === 'title' && (
          <GlassCard className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 3, 5].map(n => (
                <button key={n} onClick={() => setTitleCount(n)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    titleCount === n ? 'bg-violet-500 text-white' : 'text-slate-400 hover:bg-slate-100'
                  }`}>{n}条</button>
              ))}
            </div>
            <span className="text-[10px] text-slate-400 ml-auto">生成数量</span>
          </GlassCard>
        )}

        {/* 图片专属 */}
        {activeTab === 'image' && (
          <>
            {/* 类目选择 */}
            <GlassCard>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">选择类目（可多选）</p>
              <div className="flex flex-wrap gap-1">
                {CATEGORIES.map(cat => {
                  const sel = selectedCats.includes(cat.id);
                  return (
                    <button key={cat.id} onClick={() => toggleCat(cat.id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        sel ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}>
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
              {/* 指令展示 */}
              {selectedCats.length > 0 && (
                <div className="mt-2 pt-2 border-t border-dashed border-slate-100">
                  {selectedCats.length === 1 ? (
                    <div>
                      <div className="flex items-center gap-1 mb-1.5">
                        <span className="text-[9px] font-bold text-slate-500">{selectedCatObj.icon} {selectedCatObj.label} 详细指令</span>
                      </div>
                      <InstructionPanel category={selectedCatObj} />
                    </div>
                  ) : (
                    <p className="text-[9px] text-slate-400 text-center py-1">已选 {selectedCats.length} 个类目，生成时自动适配</p>
                  )}
                </div>
              )}
            </GlassCard>

            {/* 参考图 */}
            <GlassCard>
              <RefImageRow
                referenceImages={referenceImages}
                fileInputRefs={fileInputRefs}
                onUpload={handleRefImageUpload}
                onDrop={(e, i) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleRefImageUpload(f, i); }}
                onRemove={i => { const u = [...referenceImages]; u[i] = null; setReferenceImages(u); }}
              />
            </GlassCard>

            {/* 图片描述 + 设置 */}
            <GlassCard className="space-y-2">
              <textarea
                value={imageDesc}
                onChange={e => setImageDesc(e.target.value)}
                placeholder="详细描述要生成的图片内容..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-2 text-[12px] resize-none focus:outline-none focus:border-blue-300 placeholder:text-slate-300 leading-relaxed"
              />
              <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-wrap">
                  {IMAGE_TYPES_OPT.map(opt => {
                    const sel = imageTypes.includes(opt.value);
                    return (
                      <button key={opt.value} onClick={() => toggleImageType(opt.value)}
                        className={`px-2 py-1 rounded-lg text-[9px] font-bold transition-all ${
                          sel ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </GlassCard>

            {/* 自定义指令（图片 tab） */}
            <GlassCard>
              <textarea
                value={customInstructions}
                onChange={e => setCustomInstructions(e.target.value)}
                placeholder="自定义指令（可选）..."
                rows={1}
                className="w-full bg-transparent text-[11px] text-slate-500 resize-none focus:outline-none placeholder:text-slate-300 leading-relaxed"
              />
            </GlassCard>
          </>
        )}

        {/* 视频专属 */}
        {activeTab === 'video' && (
          <GlassCard className="space-y-2">
            <textarea
              value={videoDesc}
              onChange={e => setVideoDesc(e.target.value)}
              placeholder="详细描述视频内容..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-2 text-[12px] resize-none focus:outline-none focus:border-red-300 placeholder:text-slate-300 leading-relaxed"
            />
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-500">视频时长</span>
                <span className="text-[10px] font-black text-slate-700">{videoDuration}秒</span>
              </div>
              <input type="range" min={5} max={30} step={5} value={videoDuration}
                onChange={e => setVideoDuration(Number(e.target.value))}
                className="w-full accent-red-500 h-1.5" />
            </div>
          </GlassCard>
        )}

        {/* 详情专属 */}
        {activeTab === 'detail' && (
          <GlassCard className="space-y-2">
            <textarea
              value={detailDesc}
              onChange={e => setDetailDesc(e.target.value)}
              placeholder="输入产品描述文本..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-2 text-[12px] resize-none focus:outline-none focus:border-emerald-300 placeholder:text-slate-300 leading-relaxed"
            />
            <div className="flex gap-1">
              {LANGUAGES.map(lang => (
                <button key={lang.value} onClick={() => setDetailLang(lang.value)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                    detailLang === lang.value ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>{lang.label}</button>
              ))}
            </div>
          </GlassCard>
        )}

        {/* 错误 */}
        {error && (
          <GlassCard className="border-red-200/50 bg-red-50/50">
            <p className="text-[11px] text-red-500 font-medium">❌ {error}</p>
          </GlassCard>
        )}

        {/* 结果 */}
        {result && (
          <div className="space-y-2">

            {activeTab === 'title' && result?.result_data && (
              <GlassCard className="space-y-1.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">生成结果</p>
                {(result.result_data.optimized_titles || []).map((title, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-slate-50/80 rounded-xl border border-slate-100/60">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-slate-700 leading-snug">{title}</p>
                    </div>
                    {copiedIdx === i
                      ? <span className="text-[9px] font-bold text-emerald-500 self-center shrink-0">已复制</span>
                      : <button onClick={() => copyText(title, i)} className="p-1 text-slate-400 hover:text-violet-600 self-center shrink-0">
                          <Icon name="Copy" className="w-3 h-3" />
                        </button>
                    }
                  </div>
                ))}
                {result.result_data.keywords?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {result.result_data.keywords.map((kw, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.5 bg-violet-50 text-violet-500 rounded-lg font-bold">{kw}</span>
                    ))}
                  </div>
                )}
              </GlassCard>
            )}

            {activeTab === 'image' && imgResults.length > 0 && (
              <GlassCard className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    生成结果 · {imgResults.length}张
                  </p>
                  {imgResults.length > 0 && (
                    <button onClick={downloadAllImages}
                      className="flex items-center gap-1 px-2.5 py-1 bg-blue-500 text-white text-[9px] font-bold rounded-xl hover:bg-blue-600 transition-colors">
                      <Icon name="Download" className="w-3 h-3" />
                      打包下载
                    </button>
                  )}
                </div>

                {imgResults.length > 0
                  ? imgResults.map((img, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-md uppercase">{img.label || img.type}</span>
                          <button onClick={() => copyText(img.url, `img${i}`)} className="ml-auto p-1 text-slate-300 hover:text-slate-500">
                            <Icon name="Copy" className="w-2.5 h-2.5" />
                          </button>
                          <a href={img.url} download target="_blank" rel="noreferrer" className="p-1 text-slate-300 hover:text-slate-500">
                            <Icon name="Download" className="w-2.5 h-2.5" />
                          </a>
                        </div>
                        <img src={img.url} alt={img.label}
                          className="w-full rounded-xl object-contain bg-slate-50 border border-slate-100/60" />
                        {img.prompt_used && (
                          <p className="text-[8px] text-slate-400 italic leading-relaxed">{img.prompt_used}</p>
                        )}
                      </div>
                    ))
                  : imgResults.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="w-full rounded-xl object-cover aspect-square bg-slate-50 border border-slate-100/60" />
                        <button onClick={() => copyText(url, i)}
                          className="absolute top-1.5 right-1.5 bg-black/40 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <Icon name="Copy" className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                }
              </GlassCard>
            )}

            {activeTab === 'video' && result?.result_data?.video_url && (
              <GlassCard className="space-y-1.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">生成结果</p>
                <video src={result.result_data.video_url} controls className="w-full rounded-xl" />
                <div className="flex gap-2 pt-0.5">
                  <button onClick={() => copyText(result.result_data.video_url, 'v')}
                    className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-violet-600 font-medium">
                    <Icon name="Copy" className="w-3 h-3" /> 复制链接
                  </button>
                  <a href={result.result_data.video_url} download
                    className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600 font-medium">
                    <Icon name="Download" className="w-3 h-3" /> 下载视频
                  </a>
                </div>
              </GlassCard>
            )}

            {activeTab === 'detail' && result?.result_data?.product_detail && (
              <GlassCard className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">商品详情</p>
                  <button onClick={() => copyText(result.result_data.product_detail, 'd')}
                    className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-violet-600 font-medium">
                    <Icon name="Copy" className="w-3 h-3" /> 复制HTML
                  </button>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 text-[10px] text-slate-600 max-h-40 overflow-y-auto border border-slate-100/60 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: result.result_data.product_detail }} />
              </GlassCard>
            )}

            <p className="text-[8px] text-slate-300 text-center">run_id: {result.run_id}</p>
          </div>
        )}

        {!loading && !result && !error && (
          <div className="flex flex-col items-center justify-center py-8 text-slate-300">
            <Icon name="cpu" className="w-8 h-8 mb-1.5 opacity-30" />
            <p className="text-[11px] font-medium">填写信息，执行获取结果</p>
          </div>
        )}
      </div>

      {/* 底部执行按钮 */}
      <div className="shrink-0 px-4 py-2.5 bg-white border-t border-slate-100/60">

        {loading && (
          <div className="glass-effect rounded-xl border border-violet-200/40 bg-violet-50/60 backdrop-blur-xl px-3 py-2 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-ping" />
              <span className="text-[10px] font-bold text-violet-600">{STEPS[currentStep]}</span>
            </div>
            <StepProgress currentStep={currentStep} />
          </div>
        )}

        <button
          onClick={handleRun}
          disabled={loading || uploadingCount > 0}
          className={`w-full flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-[13px] text-white transition-all active:scale-[0.98] shadow-lg bg-gradient-to-r ${ts.gradient} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <><div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" /> 执行中...</>
          ) : uploadingCount > 0 ? (
            <><div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" /> 上传参考图...</>
          ) : (
            <><Icon name="zap" className="w-4 h-4" /> 执行 {TABS.find(t => t.id === activeTab)?.label}</>
          )}
        </button>
      </div>
    </div>
  );
}

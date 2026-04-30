import React, { useState, useEffect } from 'react';

const API_BASE = '/api';

const CMSPanel = () => {
  const [activeTab, setActiveTab] = useState('banners');
  const [banners, setBanners] = useState([]);
  const [articles, setArticles] = useState([]);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadBanners();
    loadArticles();
    loadSettings();
  }, []);

  const showMsg = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 2000);
  };

  const loadBanners = async () => {
    const res = await fetch(`${API_BASE}/cms/banners`);
    const data = await res.json();
    setBanners(data.banners || []);
  };

  const loadArticles = async () => {
    const res = await fetch(`${API_BASE}/cms/articles`);
    const data = await res.json();
    setArticles(data.articles || []);
  };

  const loadSettings = async () => {
    const res = await fetch(`${API_BASE}/cms/settings`);
    const data = await res.json();
    setSettings(data.settings || []);
  };

  // Banner 增删改
  const createBanner = async () => {
    const title = prompt('Banner 标题：');
    if (!title) return;
    const image_url = prompt('图片 URL：');
    if (!image_url) return;
    const link_url = prompt('链接 URL（可选）：') || '';
    await fetch(`${API_BASE}/cms/banners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, image_url, link_url, sort_order: 0, is_active: true }),
    });
    showMsg('Banner 创建成功');
    loadBanners();
  };

  const deleteBanner = async (id) => {
    if (!confirm('确认删除？')) return;
    await fetch(`${API_BASE}/cms/banners/${id}`, { method: 'DELETE' });
    showMsg('已删除');
    loadBanners();
  };

  const toggleBanner = async (id, is_active) => {
    await fetch(`${API_BASE}/cms/banners/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !is_active }),
    });
    loadBanners();
  };

  // Article 增删改
  const createArticle = async () => {
    const title = prompt('文章标题：');
    if (!title) return;
    const content = prompt('文章内容：');
    if (!content) return;
    const category = prompt('分类（notice/article/help）：') || 'notice';
    await fetch(`${API_BASE}/cms/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, category, is_published: false, sort_order: 0 }),
    });
    showMsg('文章创建成功');
    loadArticles();
  };

  const deleteArticle = async (id) => {
    if (!confirm('确认删除？')) return;
    await fetch(`${API_BASE}/cms/articles/${id}`, { method: 'DELETE' });
    showMsg('已删除');
    loadArticles();
  };

  const toggleArticle = async (id, is_published) => {
    await fetch(`${API_BASE}/cms/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !is_published }),
    });
    loadArticles();
  };

  // Setting 增删改
  const createSetting = async () => {
    const key = prompt('配置 key（英文）：');
    if (!key) return;
    const value = prompt('配置值：');
    if (!value) return;
    const description = prompt('描述（可选）：') || '';
    await fetch(`${API_BASE}/cms/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value, description }),
    });
    showMsg('配置项创建成功');
    loadSettings();
  };

  const updateSetting = async (key, currentValue) => {
    const value = prompt(`修改配置 [${key}]：`, currentValue);
    if (value === null) return;
    await fetch(`${API_BASE}/cms/settings/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
    showMsg('已更新');
    loadSettings();
  };

  const deleteSetting = async (key) => {
    if (!confirm(`确认删除配置项 [${key}]？`)) return;
    await fetch(`${API_BASE}/cms/settings/${key}`, { method: 'DELETE' });
    showMsg('已删除');
    loadSettings();
  };

  const subTabs = [
    { id: 'banners', label: '轮播图', count: banners.length },
    { id: 'articles', label: '文章', count: articles.length },
    { id: 'settings', label: '设置', count: settings.length },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">内容管理</h2>
          <p className="text-sm text-slate-600 mt-1">管理轮播图、文章、系统配置</p>
        </div>
        {msg && <span className="text-green-400 text-sm">{msg}</span>}
      </div>

      {/* 子标签 */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-slate-600 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* ---------- Banners ---------- */}
      {activeTab === 'banners' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={createBanner} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium">
              + 新增 Banner
            </button>
          </div>
          {banners.length === 0 ? (
            <div className="text-center py-12 text-slate-600">暂无 Banner，点击上方按钮添加</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map((b) => (
                <div key={b.id} className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50">
                  <img src={b.image_url} alt={b.title} className="w-full h-32 object-cover" onError={(e) => e.target.style.display='none'} />
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm">{b.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${b.is_active ? 'bg-green-500/20 text-green-400' : 'bg-slate-600/50 text-slate-500'}`}>
                        {b.is_active ? '启用' : '禁用'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => toggleBanner(b.id, b.is_active)} className="text-xs text-sky-400 hover:text-sky-300">
                        {b.is_active ? '禁用' : '启用'}
                      </button>
                      <button onClick={() => deleteBanner(b.id)} className="text-xs text-red-400 hover:text-red-300">删除</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------- Articles ---------- */}
      {activeTab === 'articles' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={createArticle} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium">
              + 新增文章
            </button>
          </div>
          {articles.length === 0 ? (
            <div className="text-center py-12 text-slate-600">暂无文章，点击上方按钮添加</div>
          ) : (
            <div className="space-y-3">
              {articles.map((a) => (
                <div key={a.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">{a.title}</span>
                        <span className="text-xs text-slate-500">[{a.category}]</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${a.is_published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {a.is_published ? '已发布' : '草稿'}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs line-clamp-2">{a.content}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => toggleArticle(a.id, a.is_published)} className="text-xs text-sky-400 hover:text-sky-300">
                        {a.is_published ? '取消发布' : '发布'}
                      </button>
                      <button onClick={() => deleteArticle(a.id)} className="text-xs text-red-400 hover:text-red-300">删除</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------- Settings ---------- */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={createSetting} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium">
              + 新增配置
            </button>
          </div>
          {settings.length === 0 ? (
            <div className="text-center py-12 text-slate-600">暂无配置项，点击上方按钮添加</div>
          ) : (
            <div className="space-y-2">
              {settings.map((s) => (
                <div key={s.key} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sky-400 font-mono text-sm">{s.key}</span>
                      {s.description && <span className="text-slate-600 text-xs">— {s.description}</span>}
                    </div>
                    <p className="text-white text-sm font-mono">{s.value}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => updateSetting(s.key, s.value)} className="text-xs text-sky-400 hover:text-sky-300">编辑</button>
                    <button onClick={() => deleteSetting(s.key)} className="text-xs text-red-400 hover:text-red-300">删除</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CMSPanel;

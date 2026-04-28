import React, { useState, useEffect } from 'react';

const InvitationTable = ({ onGenerateCode }) => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [codeType, setCodeType] = useState('trial');
  const [codeCount, setCodeCount] = useState(1);

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const res = await fetch('/api/admin/invitation-codes');
      if (res.ok) {
        const data = await res.json();
        setCodes(data.codes || []);
      }
    } catch (err) {
      console.error('Failed to fetch codes:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleBatchGenerate = () => {
    const batch = [];
    for (let i = 0; i < codeCount; i++) {
      batch.push({
        code: generateCode(),
        type: codeType,
        status: 'unused',
        createdAt: new Date().toISOString(),
      });
    }
    onGenerateCode(batch);
    setShowModal(false);
    setCodeCount(1);
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert('邀请码已复制: ' + code);
  };

  const statusBadge = (status) => {
    const map = {
      unused: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      used: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      expired: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs border ${map[status] || map.unused}`}>
        {status === 'unused' ? '未使用' : status === 'used' ? '已使用' : '已过期'}
      </span>
    );
  };

  const typeBadge = (type) => {
    const map = {
      trial: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      permanent: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs border ${map[type] || map.trial}`}>
        {type === 'trial' ? '试用' : '永久'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">邀请码管理</h2>
          <p className="text-sm text-slate-400 mt-1">管理用户的访问权限</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="glow-button px-6 py-3 rounded-xl font-medium text-white transition-all duration-200 flex items-center gap-2"
        >
          <span>➕</span> 生成邀请码
        </button>
      </div>

      {/* Table */}
      <div className="glass-effect rounded-2xl overflow-hidden backdrop-blur-xl">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">邀请码</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">类型</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">状态</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">创建时间</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                  加载中...
                </td>
              </tr>
            ) : codes.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                  暂无邀请码，点击上方按钮生成
                </td>
              </tr>
            ) : (
              codes.map((item, index) => (
                <tr key={index} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <code className="bg-slate-800 px-3 py-1 rounded text-sky-400 font-mono">{item.code}</code>
                  </td>
                  <td className="px-6 py-4">{typeBadge(item.type)}</td>
                  <td className="px-6 py-4">{statusBadge(item.status)}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString('zh-CN') : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => copyToClipboard(item.code)}
                      className="text-sky-400 hover:text-sky-300 text-sm transition-colors"
                    >
                      复制
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-effect rounded-2xl p-8 w-full max-w-md backdrop-blur-xl border border-slate-700/50">
            <h3 className="text-xl font-bold text-white mb-6">生成邀请码</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">码类型</label>
                <select
                  value={codeType}
                  onChange={(e) => setCodeType(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="trial">试用</option>
                  <option value="permanent">永久</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">生成数量</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={codeCount}
                  onChange={(e) => setCodeCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleBatchGenerate}
                className="flex-1 glow-button px-4 py-3 rounded-xl text-white font-medium"
              >
                生成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitationTable;

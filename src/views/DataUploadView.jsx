import React, { useState, useCallback, useEffect } from 'react';
import { Upload, message, Spin, Badge, Modal } from 'antd';
import { Package, TrendingUp, Truck, Link2, ShoppingCart } from 'lucide-react';

const API = '/api';

// 过滤物流公司名称
const CARRIER_NAMES = ['CainiaoExpress', 'Cainiao', "J&T Express", 'YTO', 'ZTO', 'STO', 'Yunda', 'SF Express', 'JD Express', 'Flash Express', '4PX', '云途', '燕文', '递四方'];
const stripCarrier = (str) => {
  if (!str) return '';
  let s = str;
  CARRIER_NAMES.forEach(c => { s = s.replace(c, '').trim(); });
  return s || '-';
};

function UploadCard({ icon: Icon, title, accept, endpoint, onUpload }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback(async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const r = await fetch(`${API}${endpoint}`, { method: 'POST', body: formData });
      const d = await r.json();
      if (!r.ok) { message.error(d.detail || '上传失败'); return; }
      onUpload(d);
      message.success(`导入成功：${d.imported} 条`);
    } catch (e) {
      message.error('上传失败：' + e.message);
    } finally {
      setUploading(false);
    }
    return false;
  }, [endpoint, onUpload]);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
        {uploading ? <Spin size="small" /> : <Icon size={24} className="text-emerald-600" />}
      </div>
      <div className="text-[14px] font-black text-slate-700">{title}</div>
      <Upload accept={accept || '.xlsx,.xls'} showUploadList={false} beforeUpload={handleUpload} className="w-full" style={{ display: 'block' }}>
        <button className="w-full h-[36px] bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-black rounded-lg transition-colors">
          {uploading ? '上传中…' : '选择文件'}
        </button>
      </Upload>
    </div>
  );
}

function ChangeCard({ title, icon: Icon, colorClass, changes }) {
  const iconBg = colorClass === 'emerald' ? 'bg-emerald-50' : 'bg-blue-50';
  const iconText = colorClass === 'emerald' ? 'text-emerald-600' : 'text-blue-600';

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col" style={{ minHeight: 320 }}>
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={20} className={iconText} />
        </div>
        <div className="text-[14px] font-black text-slate-700">{title}</div>
        {changes.length > 0 && (
          <Badge count={changes.length} style={{ backgroundColor: '#ef4444', fontSize: 10 }} />
        )}
      </div>
      <div className="overflow-y-auto flex-1">
        {changes.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <span className="text-[12px] text-slate-300">暂无变化</span>
          </div>
        ) : (
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="text-left pb-2 font-bold w-12">图</th>
                <th className="text-left pb-2 font-bold">店铺</th>
                <th className="text-left pb-2 font-bold">订单号</th>
                <th className="text-right pb-2 font-bold">变化前</th>
                <th className="text-right pb-2 font-bold">变化后</th>
                <th className="text-right pb-2 font-bold">日期</th>
              </tr>
            </thead>
            <tbody>
              {changes.slice(0, 50).map((c, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0">
                  <td className="py-2">
                    {c.thumbnail ? (
                      <img src={c.thumbnail} alt="" className="w-10 h-10 rounded object-cover shrink-0" onError={e => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center shrink-0">
                        <span className="text-slate-300 text-[10px]">无</span>
                      </div>
                    )}
                  </td>
                  <td className="py-2 text-slate-500 font-mono text-[11px] break-all">{(c.store_name || '-').replace('美客多 ', '').replace('美客多', '')}</td>
                  <td className="py-2 text-slate-500 font-mono text-[10px] break-all">{c.order_number}</td>
                  <td className="py-2 text-right text-slate-400">{c.change_type === 'logistics' ? stripCarrier(c.old_value) : c.old_value}</td>
                  <td className="py-2 text-right text-emerald-600 font-bold">{c.change_type === 'logistics' ? stripCarrier(c.new_value) : c.new_value}</td>
                  <td className="py-2 text-right text-slate-300 text-[10px]">{c.created_at ? c.created_at.slice(0, 10) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function DataUploadView() {
  const [profitChanges, setProfitChanges] = useState([]);
  const [logisticsChanges, setLogisticsChanges] = useState([]);
  const [siteModalOpen, setSiteModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingEndpoint, setPendingEndpoint] = useState('');

  // 页面加载时从数据库恢复历史变化
  useEffect(() => {
    fetch(`${API}/changes?change_type=profit&limit=100`)
      .then(r => r.json())
      .then(data => setProfitChanges(Array.isArray(data) ? data : []))
      .catch(() => {});
    fetch(`${API}/changes?change_type=logistics&limit=100`)
      .then(r => r.json())
      .then(data => setLogisticsChanges(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const handleOrdersUpload = useCallback(() => {
    // 上传后刷新变化数据
    fetch(`${API}/changes?change_type=profit&limit=100`)
      .then(r => r.json())
      .then(data => setProfitChanges(Array.isArray(data) ? data : []))
      .catch(() => {});
    fetch(`${API}/changes?change_type=logistics&limit=100`)
      .then(r => r.json())
      .then(data => setLogisticsChanges(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  return (
    <div className="h-full bg-slate-50 p-6 overflow-y-auto font-sans">
      {/* 上传卡片区 */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <UploadCard
          icon={ShoppingCart}
          title="订单数据上传"
          accept=".xlsx,.xls"
          endpoint="/upload/orders"
          onUpload={handleOrdersUpload}
        />
        <UploadCard
          icon={Link2}
          title="链接数据上传"
          accept=".xlsx,.xls"
          endpoint="/upload/links"
          onUpload={(file) => {
            setPendingFile(file);
            setPendingEndpoint('/upload/links');
            setSiteModalOpen(true);
          }}
        />
        <UploadCard
          icon={Package}
          title="业务数据上传"
          accept=".xlsx,.xls"
          endpoint="/upload/business"
          onUpload={() => message.info('功能开发中')}
        />
        <UploadCard
          icon={Truck}
          title="物流数据上传"
          accept=".xlsx,.xls"
          endpoint="/upload/logistics"
          onUpload={() => message.info('功能开发中')}
        />
      </div>


      {/* 站点选择弹窗 */}
      <Modal
        title="选择数据站点"
        open={siteModalOpen}
        onCancel={() => { setSiteModalOpen(false); setPendingFile(null); }}
        footer={null}
        width={360}
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '13px' }}>
            请选择这个文件对应哪个站点的数据
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { site: 'MLB', label: '🇧🇷 巴西', color: '#009c3b' },
              { site: 'MLM', label: '🇲🇽 墨西哥', color: '#006847' },
              { site: 'MLA', label: '🇦🇷 阿根廷', color: '#74acdf' },
              { site: 'MCO', label: '🇨🇴 哥伦比亚', color: '#ffcd00' },
            ].map(({ site, label, color }) => (
              <button
                key={site}
                onClick={async () => {
                  setSiteModalOpen(false);
                  if (!pendingFile) return;
                  const formData = new FormData();
                  formData.append('file', pendingFile);
                  formData.append('site_id', site);
                  setSiteUploading(true);
                  try {
                    const url = pendingEndpoint + '?site_id=' + site;
                    const res = await fetch(url, { method: 'POST', body: formData });
                    const data = await res.json();
                    message.success(data.message || '上传成功');
                    if (pendingEndpoint === '/upload/links') {
                      message.info('图片正在后台拉取，请稍后刷新页面查看');
                    }
                  } catch (err) {
                    message.error('上传失败: ' + err.message);
                  } finally {
                    setSiteUploading(false);
                    setPendingFile(null);
                  }
                }}
                style={{
                  padding: '16px 24px', borderRadius: '10px', border: `2px solid ${color}`,
                  background: 'white', cursor: 'pointer', fontSize: '16px', fontWeight: '600',
                  color: color, transition: 'all 0.2s'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Modal>
      {/* 变化卡片区 */}
      <div className="grid grid-cols-2 gap-4">
        <ChangeCard
          title="利润变化"
          icon={TrendingUp}
          colorClass="emerald"
          changes={profitChanges}
        />
        <ChangeCard
          title="物流变化"
          icon={Truck}
          colorClass="blue"
          changes={logisticsChanges}
        />
      </div>
    </div>
  );
}
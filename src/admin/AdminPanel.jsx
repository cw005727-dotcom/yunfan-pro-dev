import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Row, Col, Select, Spin, Empty, Segmented, Table, Tag, Button, Drawer, Input, InputNumber, Form, message } from 'antd';
import Icon from '../components/Icon';
import { apiClient } from '../api/client';

// --- V5 设计常量 ---
const BRAND_GREEN = '#1EAD6F';
const ADMIN_DARK = '#064E3B';

export default function AdminPanel({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'invite'
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const showToast = (msg, type = 'success') => {
    messageApi[type]?.(msg) || messageApi.info(msg);
  };

  // 1. 数据总览
  const [stats, setStats] = useState(null);
  
  // 2. 用户管理
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [userDetail, setUserDetail] = useState(null);

  // 3. 邀请码管理
  const [invites, setInvites] = useState([]);

  // 加载数据总览
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/admin/dashboard?admin=${user.username}`);
      if (res) setStats(res);
    } finally {
      setLoading(false);
    }
  }, [user.username]);

  // 加载用户列表
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/admin/users?admin=${user.username}`);
      if (res && res.users) setUsers(res.users);
    } finally {
      setLoading(false);
    }
  }, [user.username]);

  // 加载用户详情
  const fetchUserDetail = async (id) => {
    try {
      const res = await apiClient.get(`/admin/users/detail?admin=${user.username}&user_id=${id}`);
      if (res) {
        setUserDetail(res);
        setDrawerVisible(true);
      }
    } catch (err) {
      showToast('获取详情失败', 'error');
    }
  };

  // 禁用/解禁用户
  const handleToggleBan = async (u) => {
    const action = u.status === 'banned' ? 'unban' : 'ban';
    try {
      await apiClient.post(`/admin/users/${action}?admin=${user.username}&user_id=${u.id}`);
      showToast(`用户已${action === 'ban' ? '禁用' : '解禁'}`);
      fetchUsers();
    } catch (err) {
      showToast('操作失败', 'error');
    }
  };

  // 加载邀请码列表
  const fetchInvites = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/admin/invite/list?admin=${user.username}`);
      if (res && res.codes) setInvites(res.codes);
    } finally {
      setLoading(false);
    }
  }, [user.username]);

  // 生成邀请码
  const handleGenerateInvite = async (values) => {
    try {
      await apiClient.post(`/admin/invite/generate?admin=${user.username}`, values);
      showToast('邀请码生成成功');
      fetchInvites();
    } catch (err) {
      showToast('生成失败', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') fetchDashboard();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'invite') fetchInvites();
  }, [activeTab, fetchDashboard, fetchUsers, fetchInvites]);

  return (
    <div className="p-6 h-full flex flex-col gap-6 overflow-auto bg-slate-50/50">
      
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
            <Icon name="command" className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-[24px] font-black text-slate-900 tracking-tighter leading-none">ADMIN CONTROL / 管理后台</h1>
            <p className="text-[12px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
              Operator: {user.username} · Role: {user.role}
            </p>
          </div>
        </div>

        <Segmented
          options={[
            { label: '数据总览', value: 'overview', icon: <Icon name="pie-chart" size={14} className="inline mr-1" /> },
            { label: '用户管理', value: 'users', icon: <Icon name="users" size={14} className="inline mr-1" /> },
            { label: '邀请码', value: 'invite', icon: <Icon name="key" size={14} className="inline mr-1" /> },
          ]}
          value={activeTab}
          onChange={setActiveTab}
          className="p-1 bg-slate-100 rounded-xl font-bold"
        />
      </div>

      {loading && !stats && !users.length && !invites.length ? (
        <div className="flex-1 flex items-center justify-center">
          <Spin size="large" tip="探测信号中..." />
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-6">
          
          {/* 1. 数据总览视图 */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <Row gutter={[24, 24]}>
                {[
                  { label: '总用户数', val: stats.total_users, icon: 'users', color: BRAND_GREEN },
                  { label: '管理员', val: stats.admin_count, icon: 'shield', color: '#8b5cf6' },
                  { label: '总店铺数', val: stats.total_stores, icon: 'layout-grid', color: '#f97316' },
                  { label: '总订单数', val: stats.total_orders, icon: 'shopping-cart', color: '#3b82f6' },
                ].map((s, i) => (
                  <Col span={6} key={i}>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all">
                      <div className="absolute top-0 right-0 w-1 h-full" style={{ backgroundColor: s.color }} />
                      <div className="text-slate-400 text-[11px] font-black uppercase tracking-wider mb-2">{s.label}</div>
                      <div className="text-[32px] font-black text-slate-900 leading-none">{s.val.toLocaleString()}</div>
                      <div className="absolute right-4 bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Icon name={s.icon} size={48} />
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
              
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                    <Icon name="bar-chart-2" className="text-emerald-600" size={32} />
                  </div>
                  <h3 className="text-slate-900 font-black">趋势图表已就绪</h3>
                  <p className="text-slate-400 text-xs mt-1 tracking-tight">V5 图表引擎正在解析历史信号 (7-DAY MOMENTUM)</p>
                </div>
              </div>
            </div>
          )}

          {/* 2. 用户管理视图 */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
              <Table
                dataSource={users}
                loading={loading}
                rowKey="id"
                pagination={{ pageSize: 10, showSizeChanger: false }}
                columns={[
                  { title: 'ID', dataIndex: 'id', key: 'id', width: 60, render: v => <span className="font-mono text-slate-400">#{v}</span> },
                  { title: '用户名', dataIndex: 'username', key: 'username', render: v => <span className="font-black text-slate-800">{v}</span> },
                  { title: '角色', dataIndex: 'role', key: 'role', render: v => <Tag color={v === '管理员' ? 'purple' : 'blue'} className="rounded-md font-bold border-none px-2">{v}</Tag> },
                  { title: '状态', dataIndex: 'status', key: 'status', render: v => <Tag color={v === 'active' ? 'success' : 'error'} className="rounded-md font-bold border-none px-2">{v === 'active' ? '正常' : '已禁用'}</Tag> },
                  { title: '店铺', dataIndex: 'store_count', key: 'store_count', render: v => <span className="font-bold text-slate-600">{v}个店铺</span> },
                  { title: '注册时间', dataIndex: 'created_at', key: 'created_at', render: v => <span className="text-slate-400 text-[11px] font-medium">{new Date(v).toLocaleString()}</span> },
                  {
                    title: '操作',
                    key: 'action',
                    width: 200,
                    render: (_, record) => (
                      <div className="flex gap-2">
                        <Button type="primary" size="small" className="bg-emerald-600 border-none rounded-lg font-bold text-[11px] h-7" onClick={() => fetchUserDetail(record.id)}>查看详情</Button>
                        <Button danger size="small" className="rounded-lg font-bold text-[11px] h-7" onClick={() => handleToggleBan(record)}>
                          {record.status === 'active' ? '禁用' : '解禁'}
                        </Button>
                      </div>
                    )
                  }
                ]}
              />
            </div>
          )}

          {/* 3. 邀请码管理视图 */}
          {activeTab === 'invite' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="bg-white p-6 rounded-2xl border border-emerald-200 border-dashed bg-emerald-50/20">
                <Form layout="inline" onFinish={handleGenerateInvite} initialValues={{ role: '店主', max_uses: 5 }}>
                  <Form.Item name="role" label={<span className="font-bold text-slate-600">分配角色</span>}>
                    <Select className="w-32 rounded-lg" options={[{ label: '店主', value: '店主' }, { label: '管理员', value: '管理员' }]} />
                  </Form.Item>
                  <Form.Item name="max_uses" label={<span className="font-bold text-slate-600">可用次数</span>}>
                    <InputNumber min={1} max={999} className="rounded-lg" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" className="bg-emerald-600 border-none h-10 px-8 rounded-xl font-black shadow-lg shadow-emerald-200">批量生成指令码</Button>
                  </Form.Item>
                </Form>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <Table
                  dataSource={invites}
                  loading={loading}
                  rowKey="code"
                  columns={[
                    { title: '验证码', dataIndex: 'code', key: 'code', render: v => <span className="font-mono font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 tracking-wider">{v}</span> },
                    { title: '预设角色', dataIndex: 'role', key: 'role', render: v => <Tag className="rounded-md font-bold border-none px-2">{v}</Tag> },
                    { title: '额度', key: 'usage', render: (_, r) => <span className="font-bold text-slate-600">{r.used_count} / {r.max_uses}</span> },
                    { title: '状态', dataIndex: 'status', key: 'status', render: v => <Tag color={v === 'active' ? 'success' : 'default'} className="rounded-md font-bold border-none px-2">{v === 'active' ? '可用' : '已失效'}</Tag> },
                    { title: '生成时间', dataIndex: 'created_at', key: 'created_at', render: v => <span className="text-slate-400 text-[11px] font-medium">{new Date(v).toLocaleString()}</span> },
                  ]}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 用户详情抽屉 */}
      <Drawer
        title={<div className="font-black text-slate-900 tracking-tight">USER INTEL / 用户深度详情</div>}
        placement="right"
        width={480}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        className="v5-admin-drawer"
      >
        {userDetail && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-white shadow-sm">
                <span className="text-[24px] font-black text-emerald-600">{userDetail.user.username[0].toUpperCase()}</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 leading-none">{userDetail.user.username}</h3>
                <div className="flex gap-2 mt-2">
                  <Tag color="emerald" className="m-0 rounded-md font-bold border-none">{userDetail.user.role}</Tag>
                  <Tag color={userDetail.user.status === 'active' ? 'green' : 'red'} className="m-0 rounded-md font-bold border-none">{userDetail.user.status}</Tag>
                </div>
              </div>
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">STORES</div>
                  <div className="text-2xl font-black text-slate-900">{userDetail.store_count}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">ORDERS</div>
                  <div className="text-2xl font-black text-slate-900">{userDetail.order_count}</div>
                </div>
              </Col>
            </Row>

            <div>
              <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                关联店铺列表
              </h4>
              <div className="space-y-3">
                {userDetail.stores.length ? userDetail.stores.map(s => (
                  <div key={s.id} className="p-4 bg-white border border-slate-100 rounded-xl hover:border-emerald-200 transition-all flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{s.nickname}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{s.site_id} · {s.group_label || '未分组'}</div>
                    </div>
                    <Tag className="rounded-md font-bold border-none">{s.status}</Tag>
                  </div>
                )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无关联店铺" />}
              </div>
            </div>
            
            <div className="pt-8 border-t border-slate-100">
              <div className="text-slate-400 text-[10px] font-bold">最后登录: {userDetail.user.last_login || '从未登录'}</div>
              <div className="text-slate-400 text-[10px] font-bold mt-1">注册时间: {new Date(userDetail.user.created_at).toLocaleString()}</div>
            </div>
          </div>
        )}
      </Drawer>

      <style>{`
        .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #64748b !important;
          font-weight: 900 !important;
          font-size: 11px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f8fafc !important;
        }
        .ant-table-tbody > tr:hover > td {
          background: #f0fdf4 !important;
        }
        .ant-drawer-header {
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 24px !important;
        }
        .ant-drawer-body {
          padding: 24px !important;
        }
        .v5-admin-drawer .ant-drawer-content {
          border-radius: 24px 0 0 24px !important;
        }
      `}</style>
    </div>
  );
}

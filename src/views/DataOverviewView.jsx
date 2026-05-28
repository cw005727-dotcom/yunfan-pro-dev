import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { DollarSign, ShoppingCart, Box, Wallet } from 'lucide-react';
import { Card, Row, Col, Statistic, Select, Spin, Tag, Typography, Space, Empty, DatePicker } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
const { RangePicker } = DatePicker;
import { Line as AntLine, Pie } from '@ant-design/charts';
import Icon from '../components/Icon.jsx';

const { Text, Title } = Typography;

// key = 数据库 actual 值，value = "🇺🇾 国名"（给 DonutChart 显示用）
const SITE_MAP = {
  'ALL':  '全站聚合',
  'MX':   '🇲🇽 墨西哥',
  'BR':   '🇧🇷 巴西',
  'AR':   '🇦🇷 阿根廷',
  'CO':   '🇨🇴 哥伦比亚',
  'CL':   '🇨🇱 智利',
};
const API_BASE = '/api';


function useShops() {
  const [shops, setShops] = useState(['大姐店']);
  useEffect(() => {
    fetch(`${API_BASE}/shops`, { headers: { 'X-Admin-Token': import.meta.env.VITE_ADMIN_TOKEN || 'YUNFAN_ADMIN_2026' } })
      .then(async r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => { if (Array.isArray(data) && data.length) setShops(data); })
      .catch(() => {});
  }, []);
  return shops;
}

// ─── 趋势标签 ──────────────────────────────────────────────────────────────
function TrendBadge({ value }) {
  if (value === undefined || value === null) return null;
  const isUp = value >= 0;
  return (
    <Tag color={isUp ? 'green' : 'red'} style={{ fontSize: 11, fontWeight: 600 }}>
      {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(value).toFixed(1)}%
    </Tag>
  );
}

// ─── 饼图（Ant Design Charts Pie） ────────────────────────────────────────
function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + (d.gmv || 0), 0);
  if (total === 0) return <Empty description="无数据" style={{ marginTop: 40 }} />;

  const chartData = data.map(d => ({
    site: SITE_MAP[d.name]?.split(' ')[1] || d.name,
    gmv_pct: Number(((d.gmv || 0) / total * 100).toFixed(1)),
  }));

  const config = {
    data: chartData,
    angleField: 'gmv_pct',
    colorField: 'site',
    radius: 0.7,
    innerRadius: 0.55,
    label: {
      text: 'site',
      position: 'outside',
      fontSize: 11,
    },
    tooltip: {
      title: 'site',
      items: [{ channel: 'y', valueFormatter: v => `${v}%` }],
    },
    legend: { position: 'bottom' },
    style: { textAlign: 'center' },
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <Pie {...config} />
      <div style={{ marginTop: -40, fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>
        ${(total / 1000).toFixed(1)}k
      </div>
      <Text type="secondary" style={{ fontSize: 11 }}>Total</Text>
    </div>
  );
}

// ─── GMV 趋势图（Ant Design Charts Line） ─────────────────────────────────
function GMVTrendChart({ data }) {
  if (!data?.trends || data.trends.length === 0) return <Empty description="暂无趋势数据" style={{ marginTop: 40 }} />;

  const chartData = data.trends.map(t => ({
    date: t.date,
    gmv: t.gmv || 0,
  }));

  const config = {
    data: chartData,
    xField: 'date',
    yField: 'gmv',
    shapeField: 'smooth',
    point: false,
    tooltip: { channel: 'y', valueFormatter: v => `$${v.toLocaleString()}` },
    axis: {
      x: { label: false, line: false, tick: false },
      y: { label: false, line: false, tick: false },
    },
    style: { lineWidth: 3 },
  };

  return <AntLine {...config} />;
}

// ─── 主视图 ──────────────────────────────────────────────────────────────

export default function DataOverviewView() {
  const [customRange, setCustomRange] = useState(null); // [start, end] 自定义
  const [forceVer] = useState(Date.now()); // 强制刷新hash
  const [filter, setFilter] = useState('ALL');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const shops = useShops();

  const filterOptions = ['ALL', ...shops];

  function fetchOperationalStats(params) {
  const p = new URLSearchParams();
  if (params.site && params.site !== 'ALL') p.append('site', params.site);
  if (params.date_from) p.append('date_from', params.date_from);
  if (params.date_to) p.append('date_to', params.date_to);
  return fetch(`${API_BASE}/operational/stats?${p.toString()}`).then(r => r.json());
}

function fetchOperationalDaily(params) {
  const p = new URLSearchParams();
  if (params.site && params.site !== 'ALL') p.append('site', params.site);
  if (params.date_from) p.append('date_from', params.date_from);
  if (params.date_to) p.append('date_to', params.date_to);
  return fetch(`${API_BASE}/operational/daily?${p.toString()}`).then(r => r.json());
}

function buildDataFromOperational(stats, daily) {
  const totalOrders = stats.total_orders || 0;
  const totalGmv = stats.total_gmv || 0;
  const totalProfit = stats.total_profit || 0;
  return {
    metrics: {
      total_gmv: totalGmv,
      total_units: totalOrders,
      total_orders: totalOrders,
      actual_payout: totalProfit,
      gmv_trend: 0,
      orders_trend: 0,
      units_trend: 0,
      aov: totalOrders > 0 ? (totalGmv / totalOrders).toFixed(2) : 0,
    },
    trends: (daily.daily || []).map(d => ({
      date: d.date,
      gmv: d.gmv_usd || 0,
    })),
    store_distribution: [],
    rankings: { top_gmv: [] },
  };
}

  function getDateRange(custom) {
    if (custom && custom.length === 2 && custom[0] && custom[1]) {
      const fmt = (d) => {
        if (typeof d?.format === 'function') return d.format('YYYY-MM-DD');
        if (typeof d === 'string') return d;
        if (d instanceof Date) return d.toISOString().slice(0, 10);
        return d;
      };
      return { date_from: fmt(custom[0]), date_to: fmt(custom[1]) };
    }
    return {};
  }
  const handleRangeChange = (dates) => {
    if (!dates || !dates[0] || !dates[1]) {
      setCustomRange(null);
      return;
    }
    setCustomRange(dates);
  };

  // 数据刷新：依赖 customRange
  const refreshKey = JSON.stringify([customRange, filter]);

  useEffect(() => {
    setLoading(true);
    const { date_from, date_to } = getDateRange(customRange);
    const opts = { site: filter, date_from, date_to };
    Promise.all([
      fetchOperationalStats(opts),
      fetchOperationalDaily(opts),
    ])
      .then(([stats, daily]) => {
        setData(buildDataFromOperational(stats, daily));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // 自动刷新：每60秒
  const abortPollRef = useRef(null);
  const fetchPoll = useCallback(() => {
    if (abortPollRef.current) abortPollRef.current.abort();
    const ctrl = new AbortController();
    abortPollRef.current = ctrl;
    const { date_from, date_to } = getDateRange(customRange);
    const opts = { site: filter, date_from, date_to };
    Promise.all([
      fetchOperationalStats(opts),
      fetchOperationalDaily(opts),
    ])
      .then(([stats, daily]) => {
        if (!ctrl.signal.aborted) setData(buildDataFromOperational(stats, daily));
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  useEffect(() => {
    fetchPoll();
    const timer = setInterval(fetchPoll, 60000);
    return () => {
      clearInterval(timer);
      if (abortPollRef.current) abortPollRef.current.abort();
    };
  }, [fetchPoll]);

  const metrics = data?.metrics || {};
  const gmv = metrics.total_gmv || 0;
  const units = metrics.total_units || 0;
  const orders = metrics.total_orders || 0;
  const payout = metrics.actual_payout || 0;

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
            📊 数据大盘
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Industrial Logistics Cockpit v4.29.33
          </Text>
        </Col>
        <Col>
          <Space>
            <Select
              value={filter}
              onChange={setFilter}
              style={{ width: 140 }}
              options={filterOptions.map(f => ({
                value: f,
                label: SITE_MAP[f] || f,
              }))}
            />
            <DatePicker
              value={customRange?.[0] || null}
              onChange={(d) => handleRangeChange(d ? [d, customRange?.[1] || null] : null)}
              placeholder="开始"
              size="small"
              style={{ width: 130 }}
            />
            <DatePicker
              value={customRange?.[1] || null}
              onChange={(d) => handleRangeChange(customRange?.[0] ? [customRange[0], d] : null)}
              placeholder="结束"
              size="small"
              style={{ width: 130 }}
            />
          </Space>
        </Col>
      </Row>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 100 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">AI 数据引擎加载中...</Text>
          </div>
        </div>
      ) : (
        <>
          {/* 1. Metrics Ribbon */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic
                  title={<Space><DollarSign size={14} />总成交额 (GMV)</Space>}
                  value={gmv}
                  prefix="$"
                  precision={0}
                  valueStyle={{ fontWeight: 700, fontSize: 28 }}
                  suffix={<TrendBadge value={metrics.gmv_trend} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic
                  title={<Space><ShoppingCart size={14} />总订单量 (Orders)</Space>}
                  value={orders}
                  precision={0}
                  valueStyle={{ fontWeight: 700, fontSize: 28 }}
                  suffix={<TrendBadge value={metrics.orders_trend} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic
                  title={<Space><Box size={14} />总销量 (Units)</Space>}
                  value={units}
                  precision={0}
                  valueStyle={{ fontWeight: 700, fontSize: 28 }}
                  suffix={<TrendBadge value={metrics.units_trend} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic
                  title={<Space><Wallet size={14} />预计实收 (Net)</Space>}
                  value={payout}
                  prefix="$"
                  precision={0}
                  valueStyle={{ fontWeight: 700, fontSize: 28 }}
                />
              </Card>
            </Col>
          </Row>

          {/* 2. Main Intelligence Center */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={16}>
              <Card
                title={
                  <Space>
                    <Icon name="activity" />
                    <span>成交额趋势分析</span>
                    <Tag color="purple">[云帆算法聚合]</Tag>
                  </Space>
                }
                extra={<Text style={{ fontSize: 12 }}>AOV: ${metrics.aov}</Text>}
              >
                <GMVTrendChart data={data} />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card
                title={
                  <Space>
                    <Icon name="pie-chart" />
                    <span>各站 GMV 占比</span>
                  </Space>
                }
              >
                <DonutChart data={data?.store_distribution || []} />
              </Card>
            </Col>
          </Row>

          {/* 3. Product Leaderboard */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <Icon name="award" />
                    <span>成交额排行 (Top GMV)</span>
                  </Space>
                }
              >
                {(data?.rankings?.top_gmv || []).length === 0 ? (
                  <Empty description="暂无排行数据" />
                ) : (
                  (data?.rankings?.top_gmv || []).map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '8px 0',
                        borderBottom: i < data.rankings.top_gmv.length - 1 ? '1px solid #f0f0f0' : 'none',
                      }}
                    >
                      <Tag color={i === 0 ? 'gold' : 'default'} style={{ minWidth: 24, textAlign: 'center' }}>
                        {i + 1}
                      </Tag>
                      <img
                        src={item.image_url || 'https://via.placeholder.com/40'}
                        alt=""
                        style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', background: '#f5f5f5' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text strong ellipsis style={{ display: 'block', fontSize: 13 }}>
                          {item.name}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          SKU TARGET
                        </Text>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Text strong style={{ color: '#6366f1', fontSize: 14, fontWeight: 700 }}>
                          ${item.gmv?.toLocaleString()}
                        </Text>
                        <div>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            GMV
                          </Text>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <Icon name="zap" />
                    <span>销量排行 (Top Units)</span>
                  </Space>
                }
              >
                {(data?.rankings?.top_units || []).length === 0 ? (
                  <Empty description="暂无排行数据" />
                ) : (
                  (data?.rankings?.top_units || []).map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '8px 0',
                        borderBottom: i < data.rankings.top_units.length - 1 ? '1px solid #f0f0f0' : 'none',
                      }}
                    >
                      <Tag color={i === 0 ? 'blue' : 'default'} style={{ minWidth: 24, textAlign: 'center' }}>
                        {i + 1}
                      </Tag>
                      <img
                        src={item.image_url || 'https://via.placeholder.com/40'}
                        alt=""
                        style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', background: '#f5f5f5' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text strong ellipsis style={{ display: 'block', fontSize: 13 }}>
                          {item.name}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          UNIT TARGET
                        </Text>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Text strong style={{ color: '#1677ff', fontSize: 14, fontWeight: 700 }}>
                          {item.units?.toLocaleString()}
                        </Text>
                        <div>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            PCS
                          </Text>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}

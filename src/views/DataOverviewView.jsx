import { useState, useEffect, useRef, useMemo } from 'react';
import { DollarSign, ShoppingCart, Box, Wallet } from 'lucide-react';
import { Card, Row, Col, Statistic, Select, Segmented, Spin, Tag, Typography, Space, Empty } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { Line as AntLine, Pie } from '@ant-design/charts';
import Icon from '../components/Icon.jsx';

const { Text, Title } = Typography;

const SITE_MAP = {
  'ALL': '全站聚合',
  'MLM': '🇲🇽 墨西哥', 'MLB': '🇧🇷 巴西', 'MLA': '🇦🇷 阿根廷',
  'MCO': '🇨🇴 哥伦比亚', 'MLC': '🇨🇱 智利', 'MLU': '🇺🇾 乌拉圭',
};
const API_BASE = '/api';
const DATE_OPTIONS = [
  { label: '近7天', value: 7 },
  { label: '近30天', value: 30 },
  { label: '近90天', value: 90 },
];

function useShops() {
  const [shops, setShops] = useState(['大姐店']);
  useEffect(() => {
    fetch(`${API_BASE}/shops`, { headers: { 'X-Admin-Token': 'YUNFAN_ADMIN_2026' } })
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
  const [dateRange, setDateRange] = useState(30);
  const [filter, setFilter] = useState('ALL');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const shops = useShops();

  const filterOptions = ['ALL', ...shops];

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== 'ALL') params.append('group', filter);
    params.append('days', dateRange);
    params.append('_t', Date.now());
    
    fetch(`${API_BASE}/stats_overview?${params.toString()}`, { 
      headers: { 'X-Admin-Token': 'YUNFAN_ADMIN_2026' } 
    })
      .then(async r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [dateRange, filter]);

  // 自动刷新：每30秒
  useEffect(() => {
    const timer = setInterval(() => {
      const params = new URLSearchParams();
      if (filter !== 'ALL') params.append('group', filter);
      params.append('days', dateRange);
      params.append('_t', Date.now());
      fetch(`${API_BASE}/stats_overview?${params.toString()}`, {
        headers: { 'X-Admin-Token': 'YUNFAN_ADMIN_2026' }
      })
        .then(async r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then(d => setData(d))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(timer);
  }, [dateRange, filter]);

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
            <Segmented
              value={dateRange}
              onChange={setDateRange}
              options={DATE_OPTIONS.map(d => ({
                label: d.label,
                value: d.value,
              }))}
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

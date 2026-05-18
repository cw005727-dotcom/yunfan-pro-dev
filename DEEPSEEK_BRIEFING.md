# 云帆跨境 PRO - DeepSeek-TUI 上下文包

> 生成时间：2026-05-18
> 用途：给 DeepSeek-TUI 读，快速了解项目全貌

---

## 1. 项目是什么

**云帆跨境 PRO** — 一个 Mercadolibre（美客多）跨境电商数据管理系统。
帮运营人员管理多店铺、多站点的订单、库存、声誉、亚马逊选品数据。

### 技术栈
- **后端**：Python FastAPI + SQLite
- **前端**：React + Vite + Tailwind CSS
- **端口**：8506（后端）、5173（前端）
- **数据库**：`~/yunfan-pro-dev/mercadolibre.db`

---

## 2. 项目目录结构

```
~/yunfan-pro-dev/
├── fastapi_server/
│   ├── main.py              # FastAPI 入口
│   ├── config.py            # 配置（端口、token路径等）
│   ├── db.py                # SQLite 连接
│   └── routes/              # API 路由
│       ├── orders.py        # 订单 API
│       ├── stores.py        # 店铺 API
│       ├── reputation.py    # 声誉 API
│       ├── amazon.py        # 亚马逊选品（SORFTime MCP）
│       ├── logistics.py     # 物流 API
│       ├── stats.py         # 统计 API
│       ├── sync.py          # 同步 API
│       ├── webhooks.py      # ML Webhook 接收
│       ├── ai.py            # AI 功能（标题优化/翻译/图片生成）
│       ├── cms.py           # CMS 内容管理
│       └── ...
├── scripts/
│   ├── sync/                # 同步脚本
│   │   ├── sync_ml_cbt_orders.py   # CBT 订单两阶段穿透同步
│   │   ├── sync_ml_items.py         # ML 商品同步
│   │   ├── sync_reputation.py       # 声誉同步
│   │   ├── sync_visits.py           # 访客量同步
│   │   ├── sync_logistics.py        # 物流同步
│   │   └── sync_product_performance.py
│   ├── cron/
│   │   ├── refresh_token_cron.py     # 每4小时刷新 ML token
│   │   └── webhook_health_check.py
│   └── workers/
├── src/
│   ├── views/               # React 页面组件（19个）
│   │   ├── DataOverviewView.jsx       # 数据总览
│   │   ├── ShopReputationView.jsx     # 店铺声誉
│   │   ├── MarketRadarView.jsx       # 市场雷达
│   │   ├── KeywordIntelView.jsx       # 关键词情报
│   │   ├── ProductPerformanceView.jsx # 产品表现
│   │   ├── ProductMaintainView.jsx    # 产品维护
│   │   ├── NotificationsView.jsx      # 通知中心
│   │   ├── AutoCenterView.jsx         # 自动化运营
│   │   └── ...（共19个页面）
│   ├── api/
│   │   └── client.js        # 前端 API 客户端
│   └── hooks/               # React Hooks
├── mercadolibre.db          # SQLite 主数据库
└── AGENTS.md                # AI 协作规则

```

---

## 3. 数据库核心表

| 表名 | 数据量 | 用途 |
|------|--------|------|
| `stores` | 5 | 店铺（site/name/reputation/alert_date） |
| `orders_v2` | ~147 | 订单（order_id/buyer/amount/status/shipping） |
| `product_metrics` | 12,526 | ML 商品（item_id/price/sales/exposure） |
| `product_metrics_history` | ~1,274 | 历史趋势 |
| `hot_keywords` | 200 | 热搜词 |
| `market_trends` | 327 | 市场趋势 |
| `monitoring_logs` | 实时 | 监控日志 |

---

## 4. 核心 API 接口

### 后端路由（fastapi_server/routes/）

| 路由模块 | 端点数 | 用途 |
|---------|-------|------|
| `orders.py` | ~10 | 订单查询、统计、列表 |
| `stores.py` | ~8 | 店铺 CRUD、声誉 |
| `reputation.py` | ~5 | 声誉数据注入 |
| `amazon.py` | ~10 | 亚马逊选品（SORFTime MCP） |
| `logistics.py` | ~3 | 物流轨迹 |
| `stats.py` | ~5 | 全局统计 |
| `sync.py` | ~6 | 手动触发同步 |
| `webhook.py` | ~2 | 接收 ML 订单通知 |
| `ai.py` | 5 | AI 标题优化/翻译/图片生成（待实现） |
| `cms.py` | ~6 | CMS 内容管理 |
| `product_data.py` | ~8 | 产品数据查询 |

### 前端调用示例

```
GET /api/stats/overview          # 全局数据总览
GET /api/shop_reputation         # 店铺声誉列表
GET /api/orders/list?seller_id=xxx&site=MLM  # 订单列表
GET /api/amazon/category_report?site=MLB&category=computers  # 亚马逊类目榜
POST /api/sync/trigger           # 触发同步任务
```

---

## 5. 外部 API 集成

### MercadoLibre API
- **OAuth**：App ID `2853782117476515`，callback `https://chensan.vip/api/meli-auth`
- **Token**：access_token（6小时过期）+ refresh_token（180天）
- **核心接口**：
  - `/marketplace/orders/search` — 搜索分组订单
  - `/marketplace/orders/{id}` — 订单详情（穿透）
  - `/marketplace/shipments/{id}` — 物流信息
- **Webhook**：`POST /api/ml/webhook/relay` 接收订单通知

### SORFTime MCP（亚马逊选品）
- **Key**：`znfbzeq3wwfgahdzzeznmfhxtzljqt09`
- **工具**：
  - `category_report` — 类目 Bestsellers Top100（支持 MX/BR/US 等）
  - `product_search` — 搜索 + 潜力排序（MX/BR）
  - `potential_product` — 潜力产品（仅 US/GB/DE）
  - `product_detail` — 单品详情
  - `product_trend` — 月销量趋势

### CBT（全球卖）API
- 两阶段穿透：search 找子订单 → marketplace/orders/{id} 拿详情
- 字段：group_id / shipment_id / sub_order_id / order_items / amount

---

## 6. 核心业务逻辑

### 订单同步流程
```
ML Webhook → webhook.py → orders_v2 表
           ↘ monitoring_logs 实时日志

CBT search → 拿子订单ID → marketplace/orders/{id} → 写入 orders_v2
```

### 亚马逊选品流程
```
前端选择站点+类目 → amazon.py → SORFTime MCP → 返回数据 → 前端展示
```

### 声誉监控流程
```
stores 表（店铺） + orders_v2（订单） → reputation.py → 声誉数据
                                             ↓
                                    monitoring_logs（实时告警）
```

---

## 7. 当前状态（2026-05-18）

### 已完成 ✅
- FastAPI 全部核心路由
- ML OAuth + Token 自动刷新
- ML Webhook 订单实时接收
- CBT 两阶段订单穿透同步
- 亚马逊选品（SORFTime MCP）
- 前端 19 个页面 UI
- 店铺声誉矩阵 + 跑马灯告警
- 物流轨迹真实化

### 待完成 / 有问题 ⏳
| 问题 | 位置 |
|------|------|
| `ai.py` 5个端点未实现（标题优化/翻译/AI聊天） | fastapi_server/routes/ai.py |
| 部分空壳页面（ImageLab/OptimizingTitle/ProductCollect 等） | src/views/ |
| 亚马逊数据写入飞书（Bitable）脚本待完善 | scripts/sync/ |

---

## 8. 开发规则（必读）

### Git 安全
- 每次 `git add . && git commit -m "wip"` 再操作 git
- **禁止** `git checkout HEAD -- <file>`（会覆盖本地修改）
- pull 前先 commit

### 审批规则
- **任何涉及数据库写入、文件修改、部署的操作，必须先汇报给用户，等确认后再执行**
- 查询、读文件不需要汇报

### 端口规范
- 后端：8506
- 前端：5173
- 数据库：SQLite 文件 `mercadolibre.db`

---

## 9. 常用命令

```bash
# 启动后端
cd ~/yunfan-pro-dev && python -m uvicorn fastapi_server.main:app --port 8506 --host 0.0.0.0

# 启动前端
cd ~/yunfan-pro-dev && npm run dev

# 跑同步脚本
cd ~/yunfan-pro-dev && python scripts/sync/sync_ml_cbt_orders.py

# 查看数据库
sqlite3 ~/yunfan-pro-dev/mercadolibre.db ".tables"
```

---

## 10. DeepSeek-TUI 使用建议

- **适合任务**：代码重构、Bug 修复、功能实现、代码审查
- **Plan 模式**：先浏览代码结构，不改文件
- **YOLO 模式**：需要批量修改时用（但小心确认）
- **Skills**：`/skills` 查看可用技能包
- **注意**：所有涉及数据库写入的操作先说清楚方案，等确认后再执行

---
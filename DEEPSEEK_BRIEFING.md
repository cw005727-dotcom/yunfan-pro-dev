# 云帆跨境 PRO - DeepSeek-TUI 完整上下文包

> 生成时间：2026-05-18
> 用途：给 DeepSeek-TUI 阅读，快速理解项目全貌并开始工作

---

## 一、项目概述

**云帆跨境 PRO** — 美客多（Mercado Libre）跨境电商多店铺管理系统。

帮运营人员：
- 管理多个国家站点的店铺声誉
- 监控订单、物流、投诉
- 亚马逊选品数据（SORFTime MCP）
- 自动化生成商品标题、图片、视频

### 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Python FastAPI |
| 前端 | React + Vite + Tailwind CSS |
| 数据库 | SQLite（`mercadolibre.db`） |
| 后端端口 | 8506 |
| 前端端口 | 5173 |
| 工作目录 | `~/yunfan-pro-dev` → `/Users/chensan/Library/CloudStorage/OneDrive-个人/Mac 资料/YunfanV2` |

---

## 二、项目目录结构

```
~/yunfan-pro-dev/
├── fastapi_server/
│   ├── main.py              # FastAPI 入口，注册所有路由
│   ├── config.py             # 全局配置（端口/token路径/API key等）
│   ├── db.py                 # SQLite 连接管理
│   └── routes/
│       ├── orders.py         # 订单列表/详情/统计
│       ├── stores.py         # 店铺CRUD/声誉/ML OAuth回调
│       ├── reputation.py     # 声誉数据注入（外部数据→stores表）
│       ├── orders_v2_sync.py # 订单同步（已废弃，逻辑合并到webhook.py）
│       ├── amazon.py         # ★ 亚马逊选品（SORFTime MCP驱动）★ 核心
│       ├── logistics.py       # 物流轨迹
│       ├── stats.py          # 全局统计
│       ├── sync.py           # 手动同步触发API
│       ├── webhook.py        # ★ 接收ML订单Webhook，写入orders_v2 ★ 核心
│       ├── ai.py             # AI功能（标题优化/翻译/图片生成/聊天）
│       ├── auto_center.py    # 自动化工作流（图片生成代理/火山引擎）
│       ├── cms.py            # CMS内容管理（banner/article）
│       ├── product_data.py   # 产品数据查询
│       ├── notifications.py  # 通知系统
│       ├── smart_rotation.py # 智能轮转
│       ├── price_check.py    # 价格检查
│       ├── market_radar.py  # 市场雷达（爆品展示）
│       ├── product_research.py # 产品调研
│       ├── holidays.py      # 节假日API
│       ├── customer_service.py # 客服建议（待实现）
│       ├── admin.py          # 管理后台
│       ├── auth.py           # 认证
│       └── upload.py         # 文件上传
├── scripts/
│   ├── sync/                # ★ 同步脚本核心目录 ★
│   │   ├── sync_ml_cbt_orders.py      # ★ CBT两阶段订单穿透 ★ 核心
│   │   ├── sync_ml_items.py           # ML商品同步
│   │   ├── sync_ml_shipments.py        # ML物流同步
│   │   ├── sync_reputation.py          # 声誉数据同步（global/seller_reputation）
│   │   ├── sync_visits.py               # 访客量同步（visits/items接口）
│   │   ├── sync_logistics.py           # 物流轨迹同步
│   │   ├── sync_product_performance.py # 产品实时数据（曝光+评分）
│   │   └── sync_all_platform_data.py    # 全平台汇总同步
│   ├── cron/
│   │   ├── refresh_token_cron.py        # ★ 每4小时刷新ML token ★ 核心
│   │   ├── webhook_health_check.py      # Webhook健康检查
│   │   └── bwg_stock_daemon.py         # 库存监控
│   ├── workers/
│   │   └── monitor_worker.py            # 实时监控（声誉异常→monitoring_logs）
│   └── utils/
│       └── token_manager.py            # Token加解密工具
├── src/
│   ├── views/               # React页面组件（19个）
│   │   ├── DataOverviewView.jsx        # 数据总览
│   │   ├── ShopReputationView.jsx      # 店铺声誉矩阵+跑马灯
│   │   ├── MarketRadarView.jsx         # 市场雷达（爆品网格）
│   │   ├── KeywordIntelView.jsx        # 关键词情报
│   │   ├── ProductPerformanceView.jsx # 产品表现（新品/爆款/已售）
│   │   ├── ProductMaintainView.jsx    # 产品维护
│   │   ├── NotificationsView.jsx       # 通知中心
│   │   ├── AutoCenterView.jsx         # ★ 自动化中心（AI工作流）★
│   │   ├── LogisticsAlertsView.jsx     # 物流预警
│   │   ├── OptimizeTitleView.jsx      # 标题优化（空壳）
│   │   ├── ProductCollectView.jsx     # 产品采集（空壳）
│   │   ├── ImageLabView.jsx           # 图片实验室（空壳）
│   │   └── ...
│   ├── api/
│   │   └── client.js        # 前端统一API客户端
│   └── hooks/              # React Hooks
├── mercadolibre.db          # SQLite主数据库
├── ml_tokens.enc           # 加密的ML token文件
├── .ml_token_key           # token加密密钥
└── requirements.txt

```

---

## 三、数据库核心表

| 表名 | 数据量 | 用途 |
|------|--------|------|
| `stores` | 5 | 店铺（site_id/user_id/reputation/alert_date） |
| `orders_v2` | ~147 | 订单（order_id/buyer/amount/status/shipping_id） |
| `product_metrics` | 12,526 | ML商品（item_id/price/sales/exposure/site_id） |
| `product_metrics_history` | ~1,274 | 历史趋势 |
| `hot_keywords` | 200 | 热搜词 |
| `market_trends` | 327 | 市场趋势 |
| `monitoring_logs` | 实时 | 监控日志（跑马灯数据源） |
| `banners` / `cms_articles` | 少量 | CMS内容 |

---

## 四、核心业务流程详解

### 4.1 美客多 API 授权体系

**授权流程（OAuth 2.0）：**

```
用户访问 → /api/meli-auth/authorize
         → 跳转 ML 授权页
         → 用户同意 → 回调 /api/meli-auth/callback
         → 拿到 authorization_code
         → 换 token（/oauth/token）
         → 存加密token到 ml_tokens.enc
```

**凭证：**
- App ID：`2853782117476515`
- Client Secret：`0pxmJU6zBiOJ4LyNokerwH4I835ykX3F`
- 回调地址：`https://chensan.vip/api/meli-auth`
- access_token：有效期 6 小时
- refresh_token：有效期 180 天

**Token 自动刷新：**
- `refresh_token_cron.py` 每 4 小时运行一次
- `scripts/utils/token_manager.py` 提供 `load_tokens()` 和 `get_valid_token()`

**使用 token 的地方：**
1. `scripts/sync/sync_reputation.py` — 调用 `/global/users/seller_reputation`
2. `scripts/sync/sync_ml_items.py` — 调用 `/marketplace/items`
3. `scripts/sync/sync_ml_shipments.py` — 调用 `/marketplace/shipments/{id}`
4. `scripts/sync/sync_product_performance.py` — 调用 `/visits/items` + `/marketplace/items/{id}/purchase_experience`
5. `fastapi_server/routes/webhook.py` — 验证 webhook 签名

---

### 4.2 订单同步流程（两种来源）

**来源 A：Webhook 实时接收（新增订单）**
```
ML 下单 → POST /api/ml/webhook/relay
        → webhook.py 解析 payload
        → 写入 orders_v2
        → 写 monitoring_logs
```
- Webhook URL：`https://chensan.vip/api/tongzhi`（旧）、`/api/ml/webhook/relay`（新）
- 前端轮询 `/api/monitoring/stream` 实时显示

**来源 B：CBT 拉取（历史+增量）**
```
sync_ml_cbt_orders.py
  → /marketplace/orders/search?seller_id=3164139599  ← 只返回 group_id/shipment_id/sub_order_id
  → 对每个子订单：
      → /marketplace/orders/{sub_order_id}  ← 两阶段穿透，拿完整订单
      → 写入 orders_v2（已有则跳过）
  → 总订单数 /ml/full_sync_data.json 记录
```
- 关键：不能直接用 `/orders/{id}` 会 403，必须先 search 再穿透
- 已有订单通过 order_id 查重，直接跳过

---

### 4.3 声誉同步流程

```
sync_reputation.py
  → GET /global/users/seller_reputation
  → 遍历每个站点的 reputation
  → 提取：complaints_rate / delayed_rate / cancellations_rate / total_transactions
  → UPDATE stores 表（按 site_id 定位）
  → 同步到 stores 表 reputation_level / status / alert_date 字段
```

**注意：** `monitor_worker.py` 会扫描 stores 表，生成告警写入 `monitoring_logs`（跑马灯）

---

### 4.4 亚马逊选品流程（SORFTime MCP）

**API 信息：**
- Key：`znfbzeq3wwfgahdzzeznmfhxtzljqt09`
- 地址：`https://mcp.sorftime.com`
- 协议：JSON-RPC 2.0，streaming 响应

**核心工具（amazon.py）：**

| 工具名 | 功能 | 支持站点 |
|--------|------|---------|
| `category_report` | 类目 Bestsellers Top100 | US/GB/DE/FR/IN/CA/JP/ES/IT/MX/BR/AE/AU/SA |
| `product_search` | 搜索 + 潜力排序 | MX/BR（用 `sortby_potential_index=True`） |
| `potential_product` | 潜力产品 | **仅 US/GB/DE**（BR/MX 报错） |
| `product_detail` | 单品详情 + 主图 | US ✅ |
| `product_trend` | 月销量趋势 | US ✅ |
| `product_variations` | 子体分析 | US ✅ |

**选品流程（前端触发）：**
```
前端选择站点（MLB/MLM）+ 类目
→ amazon.py /api/amazon/category_report
→ SORFTime MCP category_report（返回 Top100）
→ 写入本地 amazon_radar_{site}.json
→ 前端 MarketRadarView 展示
```

**参数注意：**
- 站点参数用 `amzSite`（不是 `site`）
- 巴西类目用数字 nodeId（如 "19778004011"）
- 墨西哥/巴西用 `searchName` 绕过 nodeId 限制
- `category_name_search` 和 `category_trend` 所有站点均报错，勿用

---

### 4.5 访客量/曝光同步

```
sync_visits.py
  → 遍历 product_metrics 表 top 100 商品（按销量+曝光排序）
  → GET /visits/items?ids={item_id}
  → 更新 exposure 字段
  → API 限速：每请求间隔 0.5 秒
```

**同步 product_performance.py（更实时）：**
```
→ GET /visits/items?ids={item_id}     （曝光）
→ GET /marketplace/items/{id}/purchase_experience （评分）
→ 更新 exposure + health_score
```

---

## 五、自动化中心（Auto Center）

**路由：** `fastapi_server/routes/auto_center.py`

**已实现：**
- 图片生成（调用火山引擎 Seedream 4.0）
  - `POST /api/auto/run`
  - workflow_type="image"
  - 必传：`image_description`
  - 可传：`reference_images`（图生图）、`category`（自动匹配 prompt）
  - 返回：图片 URL 列表（通过 `/api/auto/proxy-image` 代理解决 403）

**待实现（ai.py）：**
- 标题优化（`POST /api/ai/analyze`）
- 翻译（`POST /translate`）
- AI 聊天助手（`POST /chat_assistant`）
- 关键词情报（`GET /api/ai/keywords`）

---

## 六、已知问题 / 待完成

| 问题 | 位置 | 说明 |
|------|------|------|
| ai.py 5个端点 | fastapi_server/routes/ai.py | 注释写了但实际未完整实现 |
| 空壳页面 | src/views/ | ImageLab/OptimizingTitle/ProductCollect 等 |
| 巴西/墨西哥访客量 | product_metrics | 同步脚本缺失，需补 |
| 亚马逊数据→飞书 | scripts/sync/ | 选品数据写 Bitable 待完善 |

---

## 七、Git 安全规则（必须遵守）

```bash
# 每次开始工作前
git add . && git commit -m "wip: [功能名]"

# 操作 git 前必查
git status --short

# 永远禁止
git checkout HEAD -- <file>
git reset --hard

# pull 前先 commit
```

---

## 八、常用命令

```bash
# 启动后端
cd ~/yunfan-pro-dev && python -m uvicorn fastapi_server.main:app --port 8506 --host 0.0.0.0

# 启动前端
cd ~/yunfan-pro-dev && npm run dev

# 跑同步脚本
python ~/yunfan-pro-dev/scripts/sync/sync_ml_cbt_orders.py
python ~/yunfan-pro-dev/scripts/sync/sync_reputation.py

# 查看数据库
sqlite3 ~/yunfan-pro-dev/mercadolibre.db ".tables"
sqlite3 ~/yunfan-pro-dev/mercadolibre.db "SELECT * FROM stores LIMIT 5;"
```

---

## 九、DeepSeek-TUI 使用建议

- **Plan 模式**：先浏览代码结构，不做修改
- **YOLO 模式**：需要批量修改时用（但涉及数据库写入必须先汇报）
- 涉及 `mercadolibre.db` 写入的操作：**先说方案，等确认再执行**
- 所有改动写进 `CHANGELOG.md` 并 `git commit`

---

## 十、快速问答（DeepSeek 可能问的）

**Q: 美客多 API 怎么授权？**
A: OAuth 2.0，App ID `2853782117476515`，callback `https://chensan.vip/api/meli-auth`，token 存 `ml_tokens.enc`

**Q: 订单数据从哪来？**
A: 两个来源：Webhook 实时接收 + CBT API 定期拉取

**Q: 亚马逊数据怎么拉？**
A: SORFTime MCP，Key `znfbzeq3wwfgahdzzeznmfhxtzljqt09`，调用 `category_report` / `product_search`

**Q: 为什么有些页面是空的？**
A: 功能开发中，ImageLab/OptimizingTitle/ProductCollect 等页面 UI 有框架但数据层未接入

---
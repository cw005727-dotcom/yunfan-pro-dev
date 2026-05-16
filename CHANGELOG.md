
## v4.32.1 (2026-05-16)
### Webhook 全链路修复（6 个 bug）

#### order_date 双转换 +24h bug ✅
- **根因**：`enrich_marketplace_order` 调 `to_beijing(+12h)` 转成 bare datetime，`handle_orders` 又调 `to_beijing(+12h)` → +24h
- **修复**：
  - `to_beijing()` 改为 idempotent（bare datetime 检测后直接返回不转换）
  - 新增 `is_bare_datetime()` 函数，handle_orders 据此判断跳过 to_beijing
  - 删除临时修复的 `_bj_now` 兜底逻辑
- **结果**：order_date 正确为 `2026-05-03T06:43:28`（UTC-4 18:43 → Beijing 06:43）

#### amount 存为 0 ✅
- **根因**：cursor bind 传 Python float，表字段是 INTEGER
- **修复**：`float(data.get('amount') or 0)`

#### paid_amount 存为 TEXT ⚠️
- **根因**：orders_v2 表 paid_amount 列是 TEXT（历史设计）
- **状态**：SQLite 不支持 ALTER COLUMN，需重建表；代码加 float() 转换，数据正确

#### marketplace_orders_on_site 跳过 enrich ✅
- **根因**：外层 `if topic == 'marketplace_orders':` 导致 `marketplace_orders_on_site` 掉入 unhandled
- **修复**：`if topic in ('marketplace_orders', 'marketplace_orders_on_site'):`

#### site_id 被 API null 覆盖 ✅
- **修复**：`data['site_id'] = od.get('site_id') or data.get('site_id')`

#### site 变量未赋值 500 ✅
- **根因**：删除 _bj_now 块时误删了 `site = SITE_NAMES.get(...)`
- **修复**：恢复该行

### App ID 统一
- Mac 本地所有文件：`4507485641678982` → `2853782117476515`
- push GitHub ✅（commit `6e3d6ec`）

### 发现
- **两个数据库**：webhook 写入 `/home/admin/data/mercadolibre.db`，非项目目录下的 db
- **ML API 时区**：MLM = UTC-4，`to_beijing()` 对带 offset 时间 +12h 是正确的

## v4.31.1 (2026-05-03)
### Webhook 422 Fix
- **root cause**: ML webhook 全部返回 422 → FastAPI Pydantic 验证失败（字段类型不匹配）
- **fix**: 改用 `body: dict = Body(...)` 接收原始 payload，绕过 Pydantic 模型验证
- **ML 确认**: github.com/go-loco/restful + IPs (35.186/35.245/18.215/18.213) 均为 ML 官方 webhook 发送方

## v4.30.1 (2026-05-01 11:50)
### OAuth + Token Auto-Refresh
- **Auth URL fixed**: changed from `http://localhost:8506` to `https://chensan.vip/api/meli-auth`
- **stores.py GET route**: added `@router.get("/meli-auth")` to fix browser OAuth callback 405
- **get_valid_token()**: auto-refresh wrapper, renews token 30min before expiry via refresh_token
- **All sync scripts**: migrated to `get_valid_token()` instead of `load_tokens()["access_token"]`
- **DATA_WRITE_RULES.md**: written to project manual, covers OAuth spec + Token refresh + stores schema

### ML API Restored
- **API fully working**: `/marketplace/orders/search` returns 153 orders, `/marketplace/orders/{id}` works
- **Historical orders**: can be bulk-pulled via API (Feature AI working on it)
- **Webhook**: relay confirmed working, ML pushes new orders to DB in real-time

---

## v4.29.0033 (2026-04-29 00:33)

### 市场雷达视图重构 (Market Radar Overhaul)
- **Viewport-First 布局**：实现单屏视口锁定，禁用全局滚动，内部区域独立滚动，提升监控效率。
- **5-Site 实时矩阵**：重构 MX, BR, CL, CO, AR 五大站点热力卡片，采用站点专属配色，实时展示 Top 3 类目热度。
- **高密度爆品网格**：部署 1x5 高密度商品网格，移除占位边距，大幅提升一屏信息承载量。

### 数据真实性飞跃 (Data Reality Fixes)
- **主图脱虚向实**：彻底移除 `picsum.photos` 占位逻辑，通过 Search API 实时抓取并映射真实美客多商品主图。
- **HD 原图加载**：强制转换 `-I` 缩略图为 `-O` (Original) 高清原图，并实现 HTTP -> HTTPS 强制升维，确保跨域安全与视觉清晰度。
- **三级冗余兜底**：实现“Trends -> Search -> High-Res Placeholder”三级下发逻辑，确保爆品扫描仪在任何网络环境下“永不空白”。

## v4.28.2051 (2026-04-28 20:51)
### 单屏数字化看板 (Single-page Dashboard)
- **全局布局重构**：通过 `overflow-hidden` 与 `flex-1` 强制实现单屏全显，彻底消除网页全局滚动，打造“监控大屏”感。
- **易读性全面优化**：大幅提升卡片内指标数值（14px）与标签（9px）字号，加深文字颜色（slate-600），解决小屏幕识别难点。
- **品牌视觉微调**：为“投诉率”与“官方信用”标签注入品牌靛蓝色（Indigo），实现重点指标的视觉锚定。

### 本地化与交互细节 (L10n & Interaction)
- **全面汉化**：实时守卫日志状态（严重警告/实时警告）、动作（定位站点）及站点标识（墨西哥站/巴西站等）全部转换为中文。
- **表头对齐**：店铺分组表头调整为“国旗+中文站名”，与全局视觉规范对齐。
- **指标逻辑修正**：修正 0.00% 投诉率错误显红的问题，确保零风险指标保持中性黑色。

## v4.28.2 (2026-04-28 19:45)
### 架构与职责调整
- **角色互换**：UI & Function AI 正式接管 `src/` 前端代码；Data Side (用户) 接管 `api_server.py` 及同步脚本。
- **契约固化**：发布 `DATA_CONTRACT.md v1.1.0`，明确数据映射标准。

### 店铺声誉指挥中心 (Reputation Command Center)
- **矩阵选择器**：将 6x6 矩阵点作为全局店铺选择器，取代传统下拉框。
- **实时守卫日志**：侧边栏实时滚动显示监控预警。
- **状态逻辑修正**：支持 `suspended` 状态检测及红/黄/绿指标动态变色。

## v4.26-17 (2026-04-26 17:11)
### 店铺声誉视图调整
- 店铺声誉大盘图表移至跑马灯正下方（原本在底部）
- 今日预警KPI卡片（今日投诉/违规/信）已移除
- 全店健康概览保留在图表下方

### 新增视图（运营中心）
- AuthPrepareView / ProductCollectView / ProductMaintainView / AfterSalesView 占位页

### 路由修复
- infringement (商品性能表) 已接入渲染
- logistics / auth / collect / maintain / service 均已接入


## 2026-04-29 - 访客数据填充 + clicks/carts 列永久移除
- sync_visits.py 完成：12521品访客数据入库（MLB/MLA/MCO/MLU/MLM/MLM_R/CBT 7站点）
  - 真实曝光：MLB 13891访/1878品 | MLA 914访/100品 | MLM 310万访/27品
  - product_metrics.exposure 已填充完毕，无 null 值
- ML Global Selling API 确认无 clicks/carts 端点，前端永久移除
- ProductPerformanceView.jsx 移除 clicks/carts 列及相关逻辑（智能诊断/排序/top20Avg）
- 潜在爆款 hot 定义：从"曝光+点击+加车三维度前20"改为"仅曝光前20"

## v4.32.1 (2026-05-16)
### Webhook URL 路由修复（重要！）

**问题现象**：
- ML 后台配置的 webhook URL：`https://chensan.vip/api/tongzhi`
- ML 发出的 webhook 每次都 404，服务器日志显示 `[Webhook Relay] topic=orders_v2` 但无数据
- 误以为是 enrich 代码问题，实际是 URL 路径完全对不上

**根本原因**：
- ML 后台配的 URL 是 `/api/tongzhi`
- 服务器 webhook 路由的 prefix 是 `/api/ml/webhook`，实际路径是 `/api/ml/webhook/relay`
- ML 发到 `/api/tongzhi` → nginx → uvicorn 8506/8507 → 路由匹配失败 → 404
- 8506 上没有 `/api/tongzhi` 路由，8507 上注册的是 `/api/ml/webhook/tongzhi`，两者都不是 ML 发的路径

**修复内容**：
1. `webhook.py` router prefix 从 `/api/ml/webhook` 改为 `/api`
2. 新增 `@router.post("/tongzhi")` 路由，复用 `relay()` 处理逻辑
3. 迁移后 `/api/relay` → 404（路径变了），需同步更新所有内部调用处
4. 服务器重启让新路由生效

**验证结果**：
```
POST https://chensan.vip/api/tongzhi  → ✅ 200 OK
POST https://chensan.vip/api/meli-auth → ✅ 400 (正常，等待code)
```

**ML Webhook 订阅配置**（截图确认）：
- topic: `marketplace_orders` + `marketplace_orders_on_site`（MLM/MLC/MLB/MCO 全勾）
- 回调 URL: `https://chensan.vip/api/tongzhi`
- ML 实际发送的 topic 是 `orders_v2`（payload 自带完整数据，不走 enrich）

**Webhook 处理流程**：
```
ML 服务器
  ↓ POST https://chensan.vip/api/tongzhi
nginx (SSL 终止，/api/ → 127.0.0.1:8507)
  ↓
uvicorn 8507 → /api/tongzhi 路由
  ↓
relay() → topic 分流
  ├── orders_v2 / orders → handle_orders() → orders_v2 表
  ├── marketplace_orders → enrich_marketplace_order() → /marketplace/orders/{id} API 补数据
  ├── shipments → handle_shipments() → 更新已有订单物流字段
  ├── questions → handle_questions() → customer_messages 表
  └── marketplace_claims → handle_claims() → monitoring_logs 播报
```

**enrich_marketplace_order() 修复**：
- 原来：从 stores 表查 `access_token`（stores 表无数据 → always fail）
- 现在：从 `token_manager.load_tokens()` 加载 token（与 auth 中间件一致）
- enrich 成功日志示例：`got order details: site=None amount=15.48 paid=76.78 status=paid`

**自动刷新 token**：
- 服务器 cron：每整点执行 `refresh_token_cron.py`
- 新 App ID: `4507485641678982`（2026-05-15 切换）
- 刷新失败原因：旧 App 签发的 refresh_token 无法用于新 App 授权（`invalid_grant`）

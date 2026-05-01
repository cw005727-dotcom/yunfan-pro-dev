# 云帆跨境 PRO — 开发项目进度分工表

> 最后更新：2026-05-01

---

## 一、项目架构

```
前端：React + Vite (localhost:5173 dev / chensan.vip prod)
     → Vite Proxy → FastAPI (localhost:8506 / 47.76.179.242:8506 prod)
     → Mercado Libre API / SQLite 数据库 (mercadolibre.db)
```

**生产环境已上线：47.76.179.242:8506 ✅**（OpenCLAW 2026-05-01 部署）

---

## 九、UI页面 vs 数据接口对齐总表（2026-05-01 更新）

### ✅ UI 有，数据接口也有，完整对接

| 页面 | 前端调用 | 后端端点 | 状态 |
|---|---|---|---|
| 关键词情报局 KeywordIntelView | `useKeywords` → `/keyword_intelligence` | `GET /ai/keywords` | ✅ |
| 售后客服 AfterSalesView | `/translate` `/customer_service/list` `/suggest` | 3个端点 | ✅ |
| 图片实验室 ImageLabView | `/api/ai/generate-images` | `POST /ai/generate-images` | ✅ |
| 资讯新闻 NewsView | `/cms/articles` | `GET /cms/articles` | ✅ |
| 数据大盘 DataOverviewView | `useStatsOverview` → `/stats_overview` `/shops` | 2个端点 | ✅ |
| 物流提醒 LogisticsAlertsView | `/logistics/detail` `/stats` `/orders` | 3个端点 | ✅ |
| 市场雷达 MarketRadarView | `/market_radar/analyze` `/search` | 2个端点 | ✅ |
| 竞品分析 ProductPerformanceView | `/competitor_prices` `/product_history` | 2个端点 | ✅ |
| 智能价格 SmartPriceCheckView | `/price_check/list` `/calculate` | 2个端点 | ✅ |
| 标题优化 OptimizeTitleView | `/optimize_title` | `POST /optimize_title` | ✅ |
| 授权准备 AuthPrepareView | `/generate_auth_url` | `POST /generate_auth_url` | ✅ |
| 店铺声誉 ShopReputationView | `useReputation` → `/shop_reputation` `/stats` | 2个端点 | ✅ |
| 智能轮播 SmartRotationView | `useSmartRotation` → `/smart_rotation` `/apply_rotation` | 2个端点 | ✅ |

### ⚠️ 有 UI，但接口有缺口

| 页面 | 前端现状 | 问题 | 负责AI |
|---|---|---|---|
| ProductMaintainView（商品主档案） | V1.1重构了UI，但无数据源API | 缺 `/api/products` 类似端点 | 数据AI |
| ActivityCenterView（运营活动） | 有UI，是静态还是接CMS？ | 需确认数据来源 | 功能AI |
| LoginView（登录） | 有UI，未接 auth.py | 需接 `/login` `/register` | 功能AI |
| ProductCollectView（商品采集） | 手动按钮，无API | 需爬虫后端接口 | 数据AI |

### ❌ 缺口最大的（无数据源）

| 页面 | 现状 | 负责AI |
|---|---|---|
| ProductMaintainView（商品主档案） | V1.1 UI完成，无数据接口 | 数据AI |
| ProductCollectView（商品采集） | 采集按钮无API | 数据AI |

---

## 十、当前缺口 — 任务分派

### 🔴 高优先级（数据AI — OpenCLAW）

| 任务 | 缺口 | 说明 |
|---|---|---|
| ProductMaintainView 数据接口 | 需新建 `/api/products` 或类似端点 | 商品主档案的数据源 |
| ProductCollectView 后端 | 需爬虫接口 `/api/collect` | 采集功能 |

### 🔴 高优先级（功能AI — Accio）

| 任务 | 缺口 | 说明 |
|---|---|---|
| LoginView | 需接 auth.py 的 `/login` `/register` | 注册登录页 |
| ActivityCenterView | 确认是静态还是需接CMS数据 | 运营活动内容 |

### 🟡 中优先级

| 任务 | 负责AI | 说明 |
|---|---|---|
| ListingEditModal `/item/update` 确认 | 数据AI | 后端已实现，确认前端调用正常 |
| DiagnosticModal 诊断弹窗 | 功能AI | 可后续接 diagnostic 端点 |

---

## 十一、分工表（2026-05-01 更新）

### 已完成

| 任务 | 状态 | 完成者 |
|---|---|---|
| P1-1 ai.py 5端点 | ✅ | Accio |
| P1-2 customer_service.py 2端点 | ✅ | OpenCLAW |
| P1-① 新订单 → monitoring_logs | ✅ | 架构AI |
| P1-④ 取消/退款 → monitoring_logs | ✅ | 架构AI |
| P2-1 多租户后端（users/invite_codes/store_auths/auth.py） | ✅ | 架构AI |
| 远程 FastAPI 上线（47.76.179.242:8506） | ✅ | OpenCLAW |
| 远程 SQLite 时区 bug 修复 | ✅ | OpenCLAW |
| webhook monitoring_logs amount 字段 | ✅ | 架构AI |

### 待完成

| 任务 | 负责AI | 状态 |
|---|---|---|
| ProductMaintainView 数据接口 | 数据AI | 待开始 |
| ProductCollectView 后端爬虫 | 数据AI | 待开始 |
| LoginView 接 auth.py | 功能AI | 待开始 |
| ActivityCenterView CMS接入 | 功能AI | 待开始 |
| P2-9~12 官网/公众号同步+数据看板 | 数据AI | 待开始 |
| Deploy1~5 国内服务器部署 | 架构AI | 待开始 |

---

## 十二、数据库表状态

| 表名 | 数据量 | 用途 | 状态 |
|---|---|---|---|
| orders_v2 | 147条+ | 订单主表 | ⚠️ 数据偏少 |
| product_metrics | 12,526条 | 商品指标 | ✅ 充足 |
| product_metrics_history | 1,274条 | 商品历史 | ✅ 可用 |
| stores | 5条 | 店铺授权 | ✅ 可用 |
| hot_keywords | 200条 | 热词 | ✅ 可用 |
| market_trends | 327条 | 市场趋势 | ✅ 可用 |
| users | 9条 | 多租户账号 | ✅ 可用 |
| invite_codes | 新表 | 邀请码 | ✅ 可用 |
| store_auths | 新表 | 店铺授权 | ✅ 可用 |
| customer_messages | 3条 | 客服消息 | ⚠️ 数据少 |
| chat_history | 2条 | AI对话历史 | ⚠️ 数据少 |
| monitoring_logs | 2条 | 监控日志 | ⚠️ 数据少 |
| ml_notifications | 新表 | ML通知队列 | ✅ 可用 |
| banners | 1条 | CMS轮播图 | ✅ 可用 |
| cms_articles | 2条 | CMS文章 | ✅ 可用 |
| price_check_queue | 4条 | 价格检查 | ⚠️ 数据少 |

---

## 十三、生产环境信息

| 项目 | 值 |
|---|---|
| 生产API | https://chensan.vip/api |
| 生产后端 | 47.76.179.242:8506 |
| 数据库 | mercadolibre.db (SQLite) |
| 部署时间 | 2026-05-01 |
| 部署者 | OpenCLAW |
| 远程用户 | admin |
| 远程Python | 3.9 |
| uvicorn启动命令 | `python3 -m uvicorn fastapi_server.main:app --host 0.0.0.0 --port 8506` |
| PM2 | 远程未配置（直接python3进程） |

---

## 十四、Git 提交规范

| 类型 | 说明 |
|---|---|
| `feat:` | 新功能 |
| `fix:` | Bug修复 |
| `docs:` | 文档更新 |
| `chore:` | 杂项（依赖/db/配置） |
| `refactor:` | 重构 |

---

> 最后更新：2026-05-01

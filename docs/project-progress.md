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

## 二、功能模块总览

| # | 模块 | 前端 | 后端 | 数据库 | 状态 | 优先级 |
|---|---|---|---|---|---|---|
| 1 | 数据概览 | DataOverviewView | stats.py | orders_v2/stores | ⚠️ 有数据但不确定是否完整 | P0 |
| 2 | 订单管理 | OrdersView | orders.py | orders_v2 | ⚠️ 数据量少（147条） | P0 |
| 3 | 商品管理 | ProductMaintainView / ListingEditModal | products.py | product_metrics | ✅ 有数据（12526条） | P0 |
| 4 | 店铺声誉 | ShopReputationView | reputation.py | stores/shop_alerts | ✅ 有数据 | P0 |
| 5 | 物流跟踪 | LogisticsAlertsView | logistics.py | orders_v2 | ⚠️ 有数据但页面未接入 | P0 |
| 6 | 市场雷达 | MarketRadarView | market_radar.py | hot_keywords/market_trends | ✅ 有数据 | P0 |
| 7 | 智能价格 | SmartPriceCheckView | price_check.py | price_check_queue | ⚠️ TODO端点 | P1 |
| 8 | AI 分析 | AI相关View | ai.py | ai_analysis_logs | ❌ TODO端点未实现 | P1 |
| 9 | 客服系统 | AfterSalesView | customer_service.py | customer_messages | ❌ TODO端点未实现 | P1 |
| 10 | 数据监控 | MonitoringView | monitoring.py | monitoring_logs | ❌ TODO端点未实现 | P1 |
| 11 | 数据同步 | Sync相关 | sync.py | orders_v2/product_metrics | ⚠️ 硬编码路径需修复 | P0 |
| 12 | CMS 多租户 | Admin后台 | cms.py + 新路由 | users/invite_codes/store_auths | ❌ 未开始 | P2 |
| 13 | 文章/活动 | NewsView/ActivityCenterView | cms.py | articles/banners | ⚠️ 页面有UI无数据 | P2 |
| 14 | 官网同步 | NewsView | 新路由 | articles | ❌ 未开始 | P2 |
| 15 | 公众号同步 | NewsView | 新路由 | articles | ❌ 未开始 | P2 |
| 16 | 管理员看板 | Admin后台 | 新路由 | orders_v2/stores | ❌ 未开始 | P2 |
| 17 | 用户注册/登录 | LoginView | auth.py (新) | users/invite_codes | ❌ 未开始 | P2 |

---

## 三、前端页面清单

| 页面文件 | 引用API/Hooks | 状态 | 说明 |
|---|---|---|---|
| DataOverviewView | useStatsOverview | ⚠️ Hook存在但未使用 | 需接入API |
| ActivityCenterView | 无 | ❌ 空壳 | 需接入CMS |
| AfterSalesView | 无 | ❌ 空壳 | 需接入客服API |
| AuthPrepareView | API_BASE | ✅ 已有 | 店铺授权前置页 |
| BusinessIntroView | 无 | ❌ 空壳 | 需补充内容 |
| DiagnosticModal | 无 | ⚠️ 组件 | 嵌入用 |
| ImageLabView | 无 | ❌ 空壳 | AI图片实验室 |
| KeywordIntelView | useKeywords | ✅ 正常 | 关键词分析 |
| ListingEditModal | 无 | ⚠️ 组件 | 嵌入用，需接入API |
| LogisticsAlertsView | 无 | ❌ 空壳 | 需接入物流API |
| LoginView | 无 | ❌ 空壳 | 注册登录页待做 |
| MarketRadarView | useMarketRadar | ✅ 正常 | 市场雷达 |
| NewsView | API_BASE | ⚠️ 有UI | 需接入CMS+同步 |
| OptimizingTitleView | 无 | ❌ 空壳 | 需接入AI |
| ProductCollectView | 无 | ❌ 空壳 | 待开发 |
| ProductMaintainView | useProductPerformance | ✅ 正常 | 商品维护 |
| ProductPerformanceView | useProductPerformance/useSmartRotation | ✅ 正常 | 商品绩效 |
| ShopReputationView | useReputation | ✅ 正常 | 店铺声誉 |
| SmartPriceCheckView | usePriceCheck | ⚠️ 后端TODO | 价格检查 |

**页面总数：19个 | ✅可用：7个 | ⚠️需修复：4个 | ❌空壳：8个**

---

## 四、后端API端点清单

### 4.1 已实现并可用的端点

| 路由文件 | 端点 | 方法 | 状态 |
|---|---|---|---|
| stats.py | /api/stats | GET | ✅ |
| stats.py | /api/stats_overview | GET | ✅ |
| stats.py | /api/conversion_stats | GET | ✅ |
| orders.py | /api/orders | GET | ✅ |
| products.py | /api/optimize_title | POST | ✅ |
| products.py | /api/listing_doctor | POST | ✅ |
| products.py | /api/item/update | POST | ✅ |
| product_data.py | /api/product_metrics | GET | ✅ |
| product_data.py | /api/product_performance | GET | ✅ |
| product_data.py | /api/product_history | GET | ✅ |
| product_data.py | /api/product_top | GET | ✅ |
| reputation.py | /api/shop_reputation | GET | ✅ |
| logistics.py | /api/logistics/stats | GET | ✅ |
| logistics.py | /api/logistics/detail | GET | ✅ |
| market_radar.py | /api/market_radar | GET | ✅ |
| market_radar.py | /api/market_radar/analyze | POST | ✅ |
| market_radar.py | /api/market_radar/search | POST | ✅ |
| smart_rotation.py | /api/smart_rotation/list | GET | ✅ |
| smart_rotation.py | /api/apply_rotation | POST | ✅ |
| price_check.py | /api/price_check/list | GET | ✅ |
| price_check.py | /api/price_check/add | POST | ✅ |
| price_check.py | /api/price_check/delete | POST | ✅ |
| price_check.py | /api/price_check/calculate | POST | ✅ |
| price_check.py | /api/trends | GET | ✅ |
| price_check.py | /api/competitor_prices | GET | ✅ |
| stores.py | /api/meli-auth | POST | ✅ |
| stores.py | /api/stores | GET | ✅ |
| stores.py | /api/shops | GET | ✅ |
| stores.py | /api/generate_auth_url | POST | ✅ |
| sync.py | /api/sync | POST | ⚠️ 硬编码路径 |
| sync.py | /api/global_sync | POST | ⚠️ 硬编码路径 |
| sync.py | /api/sync/orders | POST | ⚠️ 硬编码路径 |
| sync.py | /api/sync/status | GET | ⚠️ 硬编码路径 |
| holidays.py | /api/holidays | GET | ✅ |
| webhook.py | /api/ml/webhook/relay | POST | ✅ |
| admin.py | /api/admin/stats | GET | ✅ |
| admin.py | /api/admin/logs | GET | ✅ |
| admin.py | /api/admin/invitation_codes | GET | ✅ |
| admin.py | /api/admin/generate_code | POST | ✅ |
| admin.py | /api/deploy | POST | ✅ |
| admin.py | /api/cms/articles | CRUD | ✅ |
| cms.py | /api/cms/banners | GET/POST | ✅ |
| cms.py | /api/cms/articles | GET/POST | ✅ |
| cms.py | /api/cms/settings | CRUD | ✅ |
| monitoring.py | /api/health | GET | ✅ |
| monitoring.py | /api/monitoring_logs | GET | ⚠️ TODO |
| monitoring.py | /api/monitoring/stream | GET | ⚠️ TODO（阻塞Vite） |

### 4.2 未实现（TODO）的端点

| 路由文件 | 端点 | 方法 | 问题 |
|---|---|---|---|
| ai.py | /api/ai/analyze | POST | TODO未实现 |
| ai.py | /api/ai/keywords | GET | TODO未实现 |
| ai.py | /api/ai/generate-images | POST | TODO未实现 |
| ai.py | /api/translate | POST | TODO未实现 |
| ai.py | /api/chat_assistant | POST | TODO未实现 |
| customer_service.py | /api/customer_service/list | GET | TODO未实现 |
| customer_service.py | /api/customer_service/suggest | POST | TODO未实现 |

**API端点总数：约50个 | ✅可用：约43个 | ⚠️需修复：8个 | ❌未实现：6个**

---

## 五、数据库表状态

| 表名 | 数据量 | 用途 | 状态 |
|---|---|---|---|
| orders_v2 | 147 | 订单主表 | ⚠️ 数据不足 |
| product_metrics | 12,526 | 商品指标 | ✅ 充足 |
| product_metrics_history | 1,274 | 商品历史 | ✅ 可用 |
| stores | 5 | 店铺授权 | ✅ 可用 |
| hot_keywords | 200 | 热词 | ✅ 可用 |
| market_trends | 327 | 市场趋势 | ✅ 可用 |
| shop_alerts | 2 | 预警 | ⚠️ 数据少 |
| users | 9 | 用户账号 | ✅ 可用 |
| chat_history | 2 | AI对话历史 | ⚠️ 数据少 |
| monitoring_logs | 2 | 监控日志 | ⚠️ 数据少 |
| customer_messages | 3 | 客服消息 | ⚠️ 数据少 |
| price_check_queue | 4 | 价格检查 | ⚠️ 数据少 |
| banners | 1 | CMS轮播图 | ✅ 已建 |
| cms_articles | 2 | CMS文章 | ✅ 已建 |
| articles | 0 | CMS文章(v2) | ❌ 空 |
| settings | 0 | CMS系统配置 | ❌ 空 |
| ai_analysis_logs | 0 | AI分析日志 | ❌ 空 |
| top_products | 0 | 热门商品 | ❌ 空 |
| ml_notifications | 0 | ML通知 | ❌ 空 |
| cms_images | 0 | CMS图片 | ❌ 空 |
| conversion_stats | 1 | 转化统计 | ⚠️ 数据少 |
| product_infringements | 1 | 侵权记录 | ⚠️ 数据少 |

---

## 六、待办任务分批

### 第一批：修复阻塞问题（P0）

| # | 任务 | 影响 |
|---|---|---|
| 1 | 修复 sync.py 硬编码路径（`/Users/chensan/.accio/accounts/` → 相对路径） | 部署后同步功能完全失效 |
| 2 | 修复/禁用 monitoring/stream 端点（阻止 Vite proxy 报错） | 每次访问都报错，影响开发体验 |
| 3 | 确认 orders_v2 数据量（147条是否足够测试） | 功能验证需要 |

### 第二批：填满空壳页面（P1）

| # | 任务 | 前端页面 | 需要后端 |
|---|---|---|---|
| 1 | 物流预警接入 | LogisticsAlertsView | logistics.py ✅ |
| 2 | 活动中心接入 | ActivityCenterView | cms.py banners ✅ |
| 3 | 最新资讯接入 | NewsView | cms.py articles ✅ |
| 4 | 售后客服接入 | AfterSalesView | customer_service.py ❌需实现 |
| 5 | AI 图片实验室接入 | ImageLabView | ai.py ❌需实现 |
| 6 | 标题优化接入 | OptimizingTitleView | ai.py ❌需实现 |

### 第三批：实现 TODO 端点（P1）

| # | 任务 | 文件 |
|---|---|---|
| 1 | 实现 AI 分析相关 5 个端点 | ai.py |
| 2 | 实现客服建议 2 个端点 | customer_service.py |
| 3 | 实现监控日志 2 个端点 | monitoring.py |

### 第四批：CMS 多租户系统（P2）

| # | 任务 | 说明 |
|---|---|---|
| 1 | 设计 users 表（角色：管理员/店主/运营/加盟） | 新表 |
| 2 | 设计 invite_codes 表（归属绑定+角色） | 新表 |
| 3 | 设计 store_auths 表 | 新表 |
| 4 | 实现注册/登录 API | 新路由 auth.py |
| 5 | 实现邀请码生成/使用 API | 新路由 admin_users.py |
| 6 | 实现用户管理 API | 新路由 admin_users.py |
| 7 | 前端登录/注册页 | LoginView |
| 8 | 前端 Admin 用户管理后台 | CMSPanel 扩展 |
| 9 | 前端文章管理 | CMSPanel 扩展 |
| 10 | 前端活动管理 | CMSPanel 扩展 |

### 第五批：数据同步（P2）

| # | 任务 | 说明 |
|---|---|---|
| 1 | Mercado Libre 官方动态抓取 | RSS/API |
| 2 | 美客多公众号内容抓取 | 爬虫方案 |
| 3 | 管理员数据看板（全平台汇总） | 新路由+新页面 |

### 第六批：部署上线

| # | 任务 | 说明 |
|---|---|---|
| 1 | 购买国内服务器（阿里云/腾讯云） | 待定 |
| 2 | 配置 Nginx + SSL | 域名绑定 |
| 3 | 数据库迁移 | 主库部署 |
| 4 | PM2 进程管理 | 开机自启 |
| 5 | DNS 指向新服务器 | 废弃香港机器 |

---

## 七、分工建议（AI协作）

| AI | 负责模块 |
|---|---|
| 架构AI（当前） | 技术架构 + DevOps + Bug修复 + QA |
| 功能AI | 前端 views/ + components/ |
| 数据AI | 后端 routes/ + 前端 hooks/ + api/ |

---

## 八、当前状态

```
数据准备：❌ 不足（订单147条太少，商品数据充足）
功能可用：⚠️ 部分（核心功能有数据，但页面空壳多）
访问稳定：⚠️ monitoring/stream 阻塞Vite，需修复
多租户/CMS：❌ 未开始
注册登录：❌ 未开始
部署上线：❌ 服务器未购买
```

---

*如需修改此文档，请告知具体变更内容。*

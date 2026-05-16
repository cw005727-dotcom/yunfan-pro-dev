# 云帆跨境 PRO - 项目统一协作手册 (PROJECT_CONTEXT.md)

> 最后更新：2026-04-30 夜
> 更新说明：清理过时内容，统一各日期记录，以今日状态为准

---

## 一、协作 AI 通讯录

| AI | 代号 | 协作平台 | 负责范围 |
|---|---|---|---|
| 架构AI | Hermes（我） | Telegram | 技术架构 + DevOps + Bug医生 + QA |
| 数据AI | OpenCLAW | Telegram | 后端 API + 数据库 + src/hooks/ |
| 功能AI | Accio | 微信 + Mac | 前端 src/views/ + src/components/ |

**任务分配方式：**
- 架构AI → 数据AI：通过 Telegram 直接分配任务
- 架构AI → 功能AI：通过用户转发给 Accio
- 所有 AI 任务完成后必须汇报给架构AI核实

---

## 二、工作目录（唯一事实来源）

**唯一合法物理操作路径：** `/Users/chensan/yunfan-pro-dev/`

```
代码仓库：/Users/chensan/yunfan-pro-dev/     ← 所有AI必须在这里操作
```

---

## 三、部署架构

### 当前状态
- **本地开发**：Vite (5173) + FastAPI (8506)
- **生产环境**：待部署（国内服务器未购买）
- **域名**：chensan.vip（当前解析到阿里云香港，待迁移）

### 服务器待购
- 用户决定购买国内节点机器（阿里云/腾讯云）
- 开发流程：本地改 → git push → 服务器 pull → pm2 restart
- 不再使用 Vercel

### 部署信息（待更新）
- IP：待定（国内机器）
- 用户：admin
- SSH：待定
- Web目录：/home/admin/yunfan-pro-dev/
- 数据库：/home/admin/yunfan-pro-dev/mercadolibre.db

---

## 四、当前运行服务

| 服务 | 地址 | 状态 |
|---|---|---|
| FastAPI 后端 | localhost:8506 | ✅ 运行中 |
| Vite 前端 | localhost:5173 | ✅ 运行中 |
| Admin 后台 | localhost:5173/admin.html | ✅ 可用 |
| 数据库 | /Users/chensan/yunfan-pro-dev/mercadolibre.db | ✅ |

---

## 五、AI 协作分工

### 架构AI职责
1. **技术架构**：数据库设计、API规范、技术方案选型
2. **服务器/DevOps**：服务器购买、域名解析、Nginx配置、pm2部署
3. **Bug医生**：白屏问题、API报错、数据库问题、网络问题
4. **QA验证**：新功能上线前验证、数据一致性、接口稳定性
5. **不碰**：src/views/、src/components/ 的UI代码

### 功能AI职责（Accio）
- src/views/ 下的页面组件
- src/components/ 下的可复用组件
- 前端UI交互和样式

### 数据AI职责（OpenCLAW）
- fastapi_server/routes/ 下的后端路由
- src/hooks/ 下的数据逻辑层
- src/api/ 下的API客户端
- 数据库操作

---

## 六、Git 回滚机制

**快照节点：**
- `461c16a` — CMS基础功能完成，snapshot before 多AI并行开发

**回滚命令：**
```bash
git checkout 461c16a  # 回滚到快照点
git checkout main      # 回到最新
```

**每次重大操作前必须先 commit 快照**

---

## 七、API 端口规范

| 端口 | 用途 | 说明 |
|---|---|---|
| 8506 | FastAPI 主端口 | 当前开发使用 |
| 8507 | FastAPI 备用 | 未启用 |
| 5173 | Vite Dev Server | 前端开发 |

**Vite Proxy：** 自动注入 `X-Admin-Token: YUNFAN_ADMIN_2026`，前端无需手动带 Token

---

## 八、ML 凭证

- **App ID**: `4507485641678982`
- **Client Secret**: `fuRVTdNiMfXiLLXjoBaDHXcJRWasypPZ`
- **Webhook URL**: `https://chensan.vip/api/tongzhi`
- **access_token**: 约6小时过期（自动刷新正常）
- **refresh_token**: 有效期180天（整点 cron 自动刷新）
- **OAuth 回调 URL**: `https://chensan.vip/api/meli-auth`

---

## 九、当前项目进度

### 已完成 ✅

| 模块 | 完成时间 | 说明 |
|---|---|---|
| FastAPI 重构 | 2026-04-30 | 15个路由模块，26个端点全部验证通过 |
| 前端 JS 崩溃修复 | 2026-04-30 | 店铺声誉/数据大盘/爆品雷达全部正常 |
| CMS 内容管理 | 2026-04-30 | CRUD API + Admin界面（banners/articles/settings） |
| monitoring 阻塞修复 | 2026-04-30 | monitoring_logs 和 monitoring/stream 已实现，Vite不再报错 |

### 进行中 🔄

| 模块 | 说明 |
|---|---|
| P0 阻塞修复 | sync.py 硬编码路径待修 |

### 待完成 ⏳

| 模块 | 优先级 | 说明 |
|---|---|---|
| sync.py 硬编码路径修复 | P0 | `/Users/chensan/.accio/` 需改为相对路径 |
| 填满空壳页面 | P1 | 物流预警/活动中心/资讯/售后客服等8个页面 |
| TODO端点实现 | P1 | ai.py 5个 + customer_service.py 2个 |
| CMS多租户系统 | P2 | 邀请码+用户角色+归属链+店铺授权 |
| 注册登录 | P2 | LoginView + auth.py |
| 文章/活动管理 | P2 | 前台内容接入 |
| 官网/公众号同步 | P2 | ML官方动态+美客多公众号抓取 |
| 管理员数据看板 | P2 | 全平台汇总视图 |
| 部署国内服务器 | P2 | 购买+配置+迁移 |

---

## 十、前端页面状态（19个）

| 状态 | 数量 | 页面 |
|---|---|---|
| ✅ 可用 | 7个 | KeywordIntelView, MarketRadarView, ProductMaintainView, ProductPerformanceView, ShopReputationView, AuthPrepareView, SmartPriceCheckView |
| ⚠️ 需修复 | 4个 | DataOverviewView(useStatsOverview未接入), NewsView(有UI无数据), ListingEditModal, DiagnosticModal |
| ❌ 空壳 | 8个 | ActivityCenterView, AfterSalesView, BusinessIntroView, ImageLabView, LogisticsAlertsView, LoginView, OptimizingTitleView, ProductCollectView |

---

## 十一、后端 API 状态（约50个端点）

| 状态 | 数量 | 说明 |
|---|---|---|
| ✅ 可用 | ~43个 | stats/orders/products/reputation/logistics/market_radar/smart_rotation/price_check/stores/sync/holidays/webhook/admin/cms 等 |
| ⚠️ 需修复 | 8个 | sync.py 硬编码路径（4端点），monitoring/stream 刚修复 |
| ❌ 未实现 | 6个 | ai.py 5个（analyze/keywords/generate-images/translate/chat_assistant），customer_service.py 2个（list/suggest） |

---

## 十二、数据库状态

| 表名 | 数据量 | 状态 |
|---|---|---|
| product_metrics | 12,526 | ✅ 充足 |
| product_metrics_history | 1,274 | ✅ 可用 |
| orders_v2 | 147 | ⚠️ 数据量偏少 |
| stores | 5 | ✅ 可用 |
| hot_keywords | 200 | ✅ 可用 |
| market_trends | 327 | ✅ 可用 |
| banners | 1 | ✅ CMS |
| cms_articles | 2 | ✅ CMS |
| articles / settings / top_products 等 | 0 | ❌ 空 |

---

## 十三、多 AI 任务分配（2026-04-30 夜）

| AI | 任务 | 状态 |
|---|---|---|
| 架构AI（我） | 修 sync.py 硬编码路径 | ⏳ 待执行 |
| 数据AI（OpenCLAW） | 实现 ai.py 5个端点 + customer_service.py 2个端点 | 📋 待分配 |
| 功能AI（Accio） | 填8个空壳页面（物流预警/活动中心/资讯/售后客服等） | 📋 待分配 |

---

## 十四、过时内容归档

以下内容已过时，仅保留供参考：

- ~~Vercel 部署方案~~（不再使用）
- ~~阿里云香港服务器 47.76.179.242~~（决定购买国内机器）
- ~~旧 Accio 路径 /Users/chensan/.accio/accounts/...~~（已迁移）
- ~~Vite 迁移说明~~（已完成）
- ~~旧数据库路径映射~~（已更新）

---

*本文档是项目的唯一事实来源。每次重大变更后必须更新。*

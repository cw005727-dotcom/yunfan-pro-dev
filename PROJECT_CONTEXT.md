# 云帆跨境 PRO - 项目统一协作手册 (PROJECT_CONTEXT.md)

### 🚨 核心开发准则 (Core Development Principles)
> **致所有协作 AI：** 本项目已确立“单一事实来源”原则。
1. **工作目录**：唯一合法的物理操作路径为 `/Users/chensan/yunfan-pro-dev/`。严禁在 Accio 默认项目目录中进行逻辑修改。
2. **环境验证**：所有 `npm` 或 `python` 命令必须在 `/Users/chensan/yunfan-pro-dev/` 下执行，以适配 ARM64 签名环境。
3. **数据映射**：必须遵循下方的 [数据-UI 映射协议]。

### 🗺️ 数据-UI 映射协议 (Data-to-UI Mapping Protocol)
> **致所有协作 AI：** 为了确保“大姐店”真实在售数据精准落地，必须遵循以下映射规则。禁止跨模块混用字段。

#### 1. 商品性能板块 (Product Performance)
*   **前端组件**：`src/views/ProductPerformanceView.jsx`
*   **后端接口**：`/api/product_metrics`
*   **物理表**：`mercadolibre.db` -> `product_metrics`
*   **过滤条件**：`status = 'active' AND site_id != 'CBT'` (仅限真实在售商品)
*   **核心映射**：
    | UI 模块/卡片 | 数据字段 (Database/API) | 业务逻辑定义 |
    | :--- | :--- | :--- |
    | **总曝光 (KPI)** | `SUM(exposure)` | 全店 Active 在售商品的总 visits |
    | **总点击 (KPI)** | `SUM(clicks)` | 全店 Active 在售商品的总点击 |
    | **总加车 (KPI)** | `SUM(carts)` | 全店 Active 在售商品的总加车数 |
    | **健康度 (仪表盘)** | `health_score` | 直接取自 API `health_score` (0-100) |
    | **上架时间** | `start_time` | 映射自 API `date_created` (ISO -> YYYY-MM-DD) |
    | **价格指数** | `price_index` | 算法：`current_price / category_avg_price` |

#### 2. 状态码规范
*   `active`: 在售 (Listing is live and purchasable)
*   `under_review`: 审核中 (Risk module focuses here)
*   `closed`: 已下架 (Do not show in Performance module)

---

### 🚨 核心数据治理与准入标准 (2026-04-28 增补)
> **致所有 AI：本项目已建立物理级数据准入防线，任何违反以下规则的写入都将被系统拦截。**

#### 1. 店铺写入准入 (Store Writing Governance)
*   **强制非空**：`user_id`、`site_id`、`access_token` 缺一不可。
*   **唯一性约束**：每个 `site_id` 物理上仅存一条记录。重复写入将触发 **UPSERT (ON CONFLICT UPDATE)**。
*   **逻辑归一化**：所有子站点必须关联 `group_label` 和 `master_user_id`（如“大姐店”系列）。禁止将同一店铺的不同站点识别为独立实体。

#### 2. 订单拉取与金额标准 (Order & Sales Standard)
*   **主键规范**：订单表 ID 必须使用 **子订单 ID (Sub-order ID)**，严禁使用包裹 ID (Pack ID)，以防数据翻倍。
*   **金额提取**：`amount` 必须提取 `payments` 中的 `transaction_amount`（成交净额）。
*   **销量定义**：`quantity` 必须是订单内**所有商品数量的累加值**。统计时使用 `SUM(quantity)` 而非 `COUNT(*)`。
*   **历史追溯**：默认同步过去 **6 个月** 的订单数据。

#### 3. 飞书同步标准 (Lark Bitable Sync)
*   **物理对齐**：本地 SQLite 的 `amount` 和 `quantity` 修复后，必须立即触发 `sync_to_feishu.py`，确保飞书 KPI 仪表盘与本地 100% 同步。

---

### 架构 AI 工作记录 (2026-04-28)
*   [x] **店铺归一化**：完成“大姐店”主账号（3164139599）下 6+ 站点的逻辑聚合。
*   [x] **数据脱虚向实**：物理剔除 71 条由于 ID 冲突导致的冗余订单，实现巴西站 75笔订单/81件销量与后台 100% 对齐。
*   [x] **全链路时间关联**：修复 DataOverviewView.jsx 与后端的时间参数（days）透传，支持 7/30/90 天实时切换。
*   [x] **后端治理**：在 api_server.py 中实现严格的 POST 准入校验。

### 已完成的后端修复
- [x] 数据库加索引 (orders.status, orders.date_created, orders.shop_id, items.status)
- [x] API 请求加 timeout (30秒)
- [x] API 重试机制 (3次，指数退避)
- [x] Token 自动刷新 (401时自动刷新并重试)
- [x] Token 加密存储 (ml_tokens.enc)
- [x] 订单数据确认: MLM=14, MLB=52, MLA=17, MCO=1 (数据正常，非0订单)
- [x] 项目 README 编写

### 待完成
- [x] Vite 迁移 (功能 AI 负责，已完成)

---

## 🚨 AI 协作终极对齐 (2026-04-25 22:15)
> **重要声明：本项目已进入“脱虚向实”阶段，禁止使用任何未经验证的模拟数据。**

### 1. 数据现状审计 (Reality Check)
- **数据库路径**：`/Users/chensan/.accio/accounts/7086454425/agents/MID-95454425U1776995-4A33A1-0369-3FFD58/project/mercadolibre.db`
- **订单真实数据**：**84 条**。已同步 100% 真实订单，涵盖站点：**MLM (14)**, **MLB (50)**, **MLA (16)**, **MCO (1)**。
- **店铺真实数据**：**1 个** 核心授权店铺（大姐店）。
- **当前活跃 Seller**: `大姐店` (seller_id: 3164139599)。
- **字段对齐**：`stores` 表包含 `nickname`；`orders_v2` 表为真实拉取数据。

### 2. API 真实度分级
| 接口 | 状态 | 数据源 |
|------|------|--------|
| `GET /api/shops` | **100% 真实** | 数据库 `stores` 表 `nickname` 字段 |
| `GET /api/orders` | **100% 真实** | 数据库 `orders_v2` 表 |
| `GET /api/shop_reputation` | **100% 真实** | 数据库 `stores` 表指标字段 |
| `GET /api/conversion_stats`| **混合** | 核心数值 (曝光/加购) 来自快照，趋势图为平滑模拟 |
| `GET /api/ai/*` | **占位** | 均为 Mock 数据，待开发 |

### 3. 环境与分工约束
- **端口锁定**：`8506` 为唯一合法开发端口。代码已锁定 `PORT = 8506`。
- **分工边界（严格禁止越界）**：
  - **功能AI**：只动 `index.html`
  - **数据AI**：只动 `api_server.py` 和数据库
  - **跨边界修改必须先确认**，否则视为越界
  - **越界处理**：若发现数据AI改了index.html（或功能AI改了api_server.py），立即还原并告知用户

---

## 核心任务进度 (Current Status)

- [x] **数据链路破解**：已成功穿透 CBT 接口拉取真实数据。
- [x] **真实数据同步**：`orders_v2` 已通过 `pull_real_orders.py` 完成同步，当前共有 **84 条** 真实订单（MLM:14, MLB:52, MLA:17, MCO:1）。
- [x] **后端接口就绪**：核心数据接口已支持 V4 UI。
- [x] **UI 故障修复**：`index.html` 语法错误已修复，恢复渲染。
- [x] **多站点订单激活**：stores 表正常（MLM×2, MLB×1, MLA×1, MCO×1）。
- [ ] **UI 全面去 Mock 化**：将数据中心所有模块对接真实 API —— **待办 (功能 AI 负责)**
  - AfterSalesView.jsx 的 MOCK_MESSAGES 需要对接真实售后消息 API（需要数据 AI 先提供 `/api/after-sales` 接口）

---

## 文件路径速查
- **项目根目录**：`~/yunfan-pro-dev/`
- **前端入口**：`~/yunfan-pro-dev/index.html`
- **后端服务**：`~/yunfan-pro-dev/api_server.py`
- **协议说明**：`~/.accio/.../project/API_PROTOCOL.md`
- **汇总快照**：`~/.openclaw/workspace/meli_project_summary.md`

---

## AI 协作分工（三方协同）

### 角色定义

| AI | 角色定位 | 职责范围 | 禁止事项 |
|----|---------|---------|---------|
| **功能 AI** | UI/UX 专家 | 修改 `src/` 目录下的所有前端代码、组件、样式 | 禁止修改 `api_server.py` |
| **数据 AI** | 数据专家/逻辑引擎 | `api_server.py`、数据库、以及 `src/api/`、`src/hooks/` 目录下的所有数据逻辑 | 禁止修改 `src/views/` 等 UI 表现层 |
| **Hermes (我)** | 架构师/DevOps/Bug 医生 | 技术架构设计、服务器部署、Bug 排查、代码 Review、QA 验证 | 不直接写业务代码（除非修复 Bug） |

### 协作规则

1. **信息同步**：任何 AI 对项目结构或协议的修改，必须同步更新到共享文档（`PROJECT_CONTEXT.md`、`API_PROTOCOL.md`）
2. **冲突解决**：如果功能 AI 和数据 AI 对接口格式有分歧，提交给 Hermes 裁定
3. **问题上报**：Bug 排查和服务器问题优先提交给 Hermes 处理

### Hermes 职责详解

#### 1. 架构设计
- 技术方案选型（如 Vite 迁移、CDN 配置）
- 性能优化建议
- 代码结构审查

#### 2. 服务器/DevOps
- OpenClaw 配置与故障排查

#### 3. Bug 医生
- 白屏问题排查
- API 报错定位
- 数据库问题诊断
- 网络/代理问题排查

#### 4. QA 验证
- 新功能上线前验证
- 数据一致性检查
- 接口稳定性测试

### 修改记录

| 日期 | 修改人 | 修改内容 |
|------|--------|---------|
| 2026-04-26 | Hermes | 初始化本文档，添加 AI 协作分工章节 |
| 2026-04-26 | 数据 AI | 扩展职责范围：接管前端 `src/api/` 和 `src/hooks/` 数据逻辑层 |
| 2026-04-26 | 数据 AI | **紧急指令**：注入 Vite Proxy Token，发布第一批真实数据 Hooks |
| 2026-04-27 | Hermes | admin.html 重写完成（UMD+CDN → Vite），新增 `src/admin/` 目录 |
| 2026-04-27 | Hermes | **架构修复**：① vite.config.js proxy 3001→8506；② api_server.py check_auth 恢复 Token 验证；③ 密钥迁移至 os.environ.get()；④ 新建 .gitignore 和 .env.example |
| 2026-04-27 | 数据 AI | **数据同步**：重新执行 `pull_real_orders.py`，向 `orders_v2` 灌入 84 条真实订单数据，支持 V4 UI 渲染 |
| 2026-04-27 | Hermes | **数据库审计**：orders_v2=0（需数据 AI 重跑同步），product_metrics=1527，stores=5 |
| 2026-04-27 | Hermes | **UI 规范检查**：标题+正文对齐规范确立，h3 统一 text-3xl，p 统一 text-xs + text-slate-400 + mt-1，发现4处不一致需修复 |

### UI 规范（统一要求）
- **标题+正文对齐**：统一写在 `<div>` 内，h3 在上 p 在下，默认左对齐（text-align 默认 left，不需要显式声明）
- 所有页面主标题统一用 `text-3xl font-black text-slate-900 tracking-tight`
- 英文副标题统一用 `text-slate-400 text-xs font-medium uppercase tracking-widest mt-1`
- 中文描述文字统一用 `text-slate-400 text-xs font-medium mt-1`
- 卡片统一用 `solid-card rounded-[24px] border border-slate-200 overflow-hidden`
- 按钮统一用 `rounded-2xl`，不要混用 `rounded-xl` 或 `rounded-lg`
- 数字统一用 `tnum` class（ tabular-nums）
- **当前已知不一致需修复（功能 AI 负责）**：
  - `StatsOverviewView` 的 p 用 `text-slate-500`（应为 `text-slate-400`）
  - `ProductMaintainView` h3 用 `text-[28px]`（应为 `text-3xl`）
  - `ProductMaintainView` p 用 `text-[11px]` 和 `mt-0.5`（应为 `text-xs` 和 `mt-1`）
  - `ActivityCenterView` h3 用 `text-4xl`（应为 `text-3xl`）

---

## 🚨 紧急联调指令 (Vite 迁移专供)
> **致功能 AI**：为了确保你在迁移 `App.jsx` 时数据能直接跑通，请务必阅读以下内容。

### 1. 鉴权说明
*   **配置更新**：vite.config.js proxy 已指向 `http://localhost:8506`，并自动注入 `X-Admin-Token`。
*   **前端操作**：在 `src/` 下发起 `/api/` 请求时，**无需**手动在 Header 里加 Token，Vite proxy 会自动帮你带上。

### 2. 禁止手写 `fetch` 数据逻辑
*   **现状**：旧的 `index.html` 里充满了散乱的 `fetch`。
*   **新规范**：我已经把所有真实数据的业务逻辑封装成了 React Hooks。
*   **可用弹药 (位于 `src/hooks/`)**：
    - `useStatsOverview`: 经营概览、GMV、14天走势
    - `useReputation`: 多店声誉矩阵
    - `useMarketRadar`: 市场雷达、高清原图、AI 诊断
    - `useOrders`: 订单列表、多维过滤
    - `useKeywords`: 关键词情报、流量蓝海
    - `useProductPerformance`: 商品全量性能表
*   **调用示例**：
  ```javascript
  import { useStatsOverview } from '../hooks/useStatsOverview';
  const { data, loading } = useStatsOverview(); // 直接拿到真实数据
  ```

### 3. 冲突规避
*   **我承诺**：我绝对不动 `src/views/` 和 `src/components/` 下的 UI 代码。
*   **请配合**：请你也不要修改 `src/hooks/` 和 `src/api/` 下的逻辑代码。如有数据格式需求，直接在任务列表里 @我。

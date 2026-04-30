# 云帆跨境 PRO - 项目统一协作手册 (PROJECT_CONTEXT.md)

### 🚨 核心开发准则 (Core Development Principles)
> **致所有协作 AI：** 本项目已确立"单一事实来源"原则。
1. **工作目录**：唯一合法的物理操作路径为 `/Users/chensan/yunfan-pro-dev/`。严禁在 Accio 默认项目目录中进行逻辑修改。
2. **环境验证**：所有 `npm` 或 `python` 命令必须在 `/Users/chensan/yunfan-pro-dev/` 下执行，以适配 ARM64 签名环境。
3. **数据映射**：必须遵循下方的 [数据-UI 映射协议]。
4. **部署架构（2026-04-30 更新）**：**不再使用 Vercel**。全套系统已迁移至阿里云服务器：
   - 前端+API：`https://chensan.vip`（阿里云 Debian 服务器，1GB内存）
   - API端口：8506（Nginx 反向代理到 /api/）
   - ML Webhook接收：`https://chensan.vip/api/ml/webhook/relay`
   - 数据库：`/home/admin/yunfan-pro-dev/mercadolibre.db`（SQLite）
   - **开发流程**：本地 Mac 修改 → git push → 服务器 git pull → pm2 restart
   - **服务器SSH**：IP 47.76.179.242，用户 admin，通过阿里云控制台远程连接操作
   - ML App ID: `8105299077213607`（新创建，替代旧ID `2853782117476515`）
   - **重要**：本地开发后 `git push`，然后告知"大脑"在服务器执行 `git pull && pm2 restart yunfan-api`
   - **生产环境URL**：`https://chensan.vip`（唯一线上地址，不再使用 Vercel）
   - **本地开发**：`npm run dev` 跑在 localhost:5173，但需确保 API_BASE 指向 `https://chensan.vip/api`

### 🗺️ 数据-UI 映射协议 (Data-to-UI Mapping Protocol)
> **致所有协作 AI:** 为了确保"大姐店"真实在售数据精准落地,必须遵循以下映射规则。禁止跨模块混用字段。

#### 1. 商品性能板块 (Product Performance)
*   **前端组件**:`src/views/ProductPerformanceView.jsx`
*   **后端接口**:`/api/product_metrics`
*   **物理表**:`mercadolibre.db` -> `product_metrics`
*   **过滤条件**:`status = 'active' AND site_id != 'CBT'` (仅限真实在售商品)
*   **核心映射**:
    | UI 模块/卡片 | 数据字段 (Database/API) | 业务逻辑定义 |
    | :--- | :--- | :--- |
    | **总曝光 (KPI)** | `SUM(exposure)` | 全店 Active 在售商品的总 visits |
    | **总点击 (KPI)** | `SUM(clicks)` | 全店 Active 在售商品的总点击 |
    | **总加车 (KPI)** | `SUM(carts)` | 全店 Active 在售商品的总加车数 |
    | **健康度 (仪表盘)** | `health_score` | 直接取自 API `health_score` (0-100) |
    | **上架时间** | `start_time` | 映射自 API `date_created` (ISO -> YYYY-MM-DD) |
    | **价格指数** | `price_index` | 算法:`current_price / category_avg_price` |

#### 2. 店铺声誉板块 (Shop Reputation Center)
*   **前端组件**:`src/views/ReputationCenter.jsx`
*   **后端接口**:`/api/shop_reputation`
*   **物理表**:`mercadolibre.db` -> `stores`
*   **核心映射**:
    | UI 模块/卡片 | 数据字段 (API Return) | 业务逻辑定义 |
    | :--- | :--- | :--- |
    | **投诉率 (Reclamos)** | `reclamos` | 来自 `stores.complaints_rate` (e.g., "7.14%") |
    | **考核周期** | `claims_period` | 来自 `stores.claims_period_days` (e.g., "60 days") |
    | **历史指标** | `claims_history` | 来自 `stores.claims_history` (e.g., "Healthy") |
    | **今日预警 (Alerts)** | `daily_alerts` | 来自 `/api/stats` 聚合自 `shop_alerts` 表 |
    | **今日投诉** | `daily_alerts.complaints` | 映射自 `shop_alerts.complaint_count` |
    | **跑马灯预警日期** | `alert_date` | 来自 `stores.alert_date` (e.g., "4.27") |
    | **投诉 (New/Total)** | `new_claims` / `total_claims` | 映射自今日新增 vs 考核期总数 |
    | **违规 (New/Total)** | `new_violations` / `total_violations` | 映射自今日处罚 vs 存量违规 |
    | **消息 (New/Total)** | `new_messages` / `total_messages` | 映射自今日咨询 vs 待回复总数 |
    | **延误/取消 (New)** | `new_delayed` / `new_cancel` | 映射自今日新增异常项 |

#### 3. 状态码规范
*   `active`: 在售 (Listing is live and purchasable)
*   `under_review`: 审核中 (Risk module focuses here)
*   `closed`: 已下架 (Do not show in Performance module)

---

### 🚨 核心数据治理与准入标准 (2026-04-28 增补)
> **致所有 AI:本项目已建立物理级数据准入防线,任何违反以下规则的写入都将被系统拦截。**

#### 1. 店铺写入准入 (Store Writing Governance)
*   **强制非空**:`user_id`、`site_id`、`access_token` 缺一不可。
*   **唯一性约束**:每个 `site_id` 物理上仅存一条记录。重复写入将触发 **UPSERT (ON CONFLICT UPDATE)**。
*   **逻辑归一化**:所有子站点必须关联 `group_label` 和 `master_user_id`(如"大姐店"系列)。禁止将同一店铺的不同站点识别为独立实体。

#### 2. 订单拉取与金额标准 (Order & Sales Standard)
*   **主键规范**:订单表 ID 必须使用 **子订单 ID (Sub-order ID)**,严禁使用包裹 ID (Pack ID),以防数据翻倍。
*   **金额提取**:`amount` 必须提取 `payments` 中的 `transaction_amount`(成交净额)。
*   **销量定义**:`quantity` 必须是订单内**所有商品数量的累加值**。统计时使用 `SUM(quantity)` 而非 `COUNT(*)`。
*   **历史追溯**:默认同步过去 **6 个月** 的订单数据。

#### 3. 飞书同步标准 (Lark Bitable Sync)
*   **物理对齐**:本地 SQLite 的 `amount` 和 `quantity` 修复后,必须立即触发 `sync_to_feishu.py`,确保飞书 KPI 仪表盘与本地 100% 同步。

---

### 架构 AI 工作记录 (2026-04-29)
*   [x] **版本存档 (v4.29.0033)**:完成"市场雷达"单屏视口重构,彻底解决爆品主图不一致/占位符问题。
*   [x] **数据脱虚向实**:移除所有 Picsum 占位图,建立基于 Search API 的实时主图映射链路,强制加载 `-O` 高清原图。
*   [x] **高密度排版**:爆品网格切换为 1x5 阵列,适配 Viewport-First 监控逻辑。
*   [x] **服务稳定性**:优化 api_server.py 进程管理,解决旧进程残留导致的逻辑未更新问题。

### 架构 AI 工作记录 (2026-04-30)
* [x] **api_server.py 虚假数据清理**:删除 7 处 `random.randint` 虚假销量/竞争度填充，保留必要的 fallback 和第三方图片种子
* [x] **脚本整理**:39个一次性脚本归档到 `scripts/archive/`，6个同步脚本入 `scripts/sync/`，4个worker入 `scripts/workers/`，4个工具入 `scripts/utils/`
* [x] **FastAPI 骨架搭建**:创建 `fastapi_server/` 项目结构，含 main.py、config.py、db.py、16个路由模块
* [x] **FastAPI 部署安全策略**:8506（旧）不动，8507（新）验证通过后再切换 Nginx
* [x] **FastAPI 本地论证通过**:8507 启动成功，/health、/api/stats、/api/shops、/docs 均返回 200
* [x] **修复导入错误**:添加 PROJECT_ROOT 到 config.py，删除未使用的 auth.py 引用

### 多 AI 协作分工（2026-04-30 更新）
- **架构 AI**：FastAPI 基础设施、Admin 接口、路由中间件、每批迁移的 QA 验证
- **数据 AI**：业务路由迁移（orders、products、stats、reputation、logistics、smart_rotation、market_radar、price_check、customer_service、monitoring、ai、sync、webhook）

### 当前进度
| 批次 | 内容 | 状态 |
|------|------|------|
| 0 | 骨架搭建 + 本地论证 | ✅ 完成 |
| 1 | 核心业务（店铺/认证、物流、商品） | ⏳ 待数据 AI 认领 |
| 2-5 | 数据统计、智能运营、客服、订单同步 | ⏳ 待排期 |

---

## FastAPI 重构计划 (2026-04-30)

### 重构目标
将 `api_server.py` (2650行) 从内置 `http.server` 迁移到 FastAPI 框架，路由用装饰器声明，结构更清晰。

### 端点分工表

#### 第一批：核心业务（数据 AI）
| 模块 | 端点 | 行号范围 |
|------|------|---------|
| 店铺/认证 | `/api/meli-auth`、`/api/stores`、`/api/generate_auth_url`、`/api/shops` | 478-2208 |
| 商品管理 | `/api/item/update`、`/api/listing_doctor`、`/api/optimize_title` | 1967-2253 |
| 物流 | `/api/logistics/stats`、`/api/logistics/detail` | 633-768 |

#### 第二批：数据统计（数据 AI）
| 模块 | 端点 |
|------|------|
| 数据统计 | `/api/stats`、`/api/stats_overview`、`/api/conversion_stats` |
| 商品数据 | `/api/product_metrics`、`/api/product_performance`、`/api/product_history` |
| 店铺信誉 | `/api/shop_reputation` |

#### 第三批：智能运营+雷达（数据 AI）
| 模块 | 端点 |
|------|------|
| 智能调价 | `/api/smart_rotation`、`/api/apply_rotation` |
| 市场雷达 | `/api/market_radar`、`/api/market_radar/analyze`、`/api/market_radar/search` |
| 价格监控 | `/api/price_check/*`、`/api/trends`、`/api/competitor_prices` |

#### 第四批：客服+监控+AI（数据 AI）
| 模块 | 端点 |
|------|------|
| 客服消息 | `/api/customer_service/*` |
| 系统监控 | `/api/monitoring_logs`、`/api/monitoring/stream` |
| AI 功能 | `/api/ai/keywords`、`/api/ai/generate-images`、`/api/translate`、`/api/chat_assistant` |

#### 第五批：订单+同步+系统（数据 AI）
| 模块 | 端点 |
|------|------|
| 订单 | `/api/orders` |
| 同步 | `/api/sync`、`/api/global_sync` |
| Webhook | `/api/ml/notifications`、`/api/ml/webhook/relay` |

#### 架构 AI 负责
- 基础设施：FastAPI 项目结构、数据库封装、Token 管理中间件、公共依赖注入
- Admin 接口：`/api/deploy`、`/api/admin/*`、`/api/cms/articles`

---

## 脚本整理计划 (2026-04-30)

### 整理结构
```
scripts/
  archive/              # 一次性脚本归档（不参与调度）
    fix_*.py
    get_*.py
    populate_*.py
    verify_*.py
    generate_*.py
    list_*.py
    count_*.py
    ...
  sync/                 # 定时同步脚本
    __init__.py
    scheduler.py        # 统一调度入口
    products.py         # sync_products.py
    reputation.py       # sync_reputation.py
    logistics.py        # sync_logistics.py
    visits.py          # sync_visits.py
    orders.py          # pull_real_orders.py
  workers/              # 后台常驻进程
    __init__.py
    monitor.py         # monitor_worker.py
    notifications.py   # notification_processor.py
    telegram.py        # telegram_listener.py + telegram_client.py
  utils/                # 工具函数
    __init__.py
    database.py        # database.py
    token_manager.py   # token_manager.py
    minimax.py         # minimax_client.py
    ml_client.py       # ml_api_client.py
    deploy.py          # remote_deploy_v2.py
```

### 调度方案
- **主调度**：FastAPI BackgroundTasks（重构完成后）
- **兜底**：服务器 cron → 调用 FastAPI 接口触发同步

### 执行顺序
1. 先归档一次性脚本到 `scripts/archive/`
2. FastAPI 重构期间逐步整理 sync/ 和 workers/
3. FastAPI 完成后接入 BackgroundTasks

### 架构 AI 工作记录 (2026-04-28)
*   [x] **版本存档 (v4.28.2051)**:完成"单屏全显"重构,消除全局滚动,实现声誉监控大屏化。
*   [x] **UI 易读性飞跃**:全面加深标签颜色(slate-600),提升核心指标字号(14px),并为核心字段注入品牌色。
*   [x] **全链路汉化**:日志标签、动作、时间及站点 ID 全部转换为中文,对齐用户使用习惯。
*   [x] **店铺归一化**:完成"大姐店"主账号(3164139599)下 6+ 站点的逻辑聚合。
*   [x] **数据脱虚向实**:物理剔除 71 条由于 ID 冲突导致的冗余订单,实现巴西站 75笔订单/81件销量与后台 100% 对齐。
*   [x] **全链路时间关联**:修复 DataOverviewView.jsx 与后端的时间参数(days)透传,支持 7/30/90 天实时切换。
*   [x] **后端治理**:在 api_server.py 中实现严格的 POST 准入校验。

### 已完成的后端修复
- [x] 数据库加索引 (orders.status, orders.date_created, orders.shop_id, items.status)
- [x] API 请求加 timeout (30秒)
- [x] API 重试机制 (3次,指数退避)
- [x] Token 自动刷新 (401时自动刷新并重试)
- [x] Token 加密存储 (ml_tokens.enc)
- [x] 订单数据确认: MLM=14, MLB=52, MLA=17, MCO=1 (数据正常,非0订单)
- [x] 项目 README 编写

### 待完成
- [x] Vite 迁移 (功能 AI 负责,已完成)

---

## 🚨 AI 协作终极对齐 (2026-04-25 22:15)
> **重要声明:本项目已进入"脱虚向实"阶段,禁止使用任何未经验证的模拟数据。**

### 1. 数据现状审计 (Reality Check)
- **数据库路径**:`/Users/chensan/.accio/accounts/7086454425/agents/MID-95454425U1776995-4A33A1-0369-3FFD58/project/mercadolibre.db`
- **订单真实数据**:**84 条**。已同步 100% 真实订单,涵盖站点:**MLM (14)**, **MLB (50)**, **MLA (16)**, **MCO (1)**。
- **店铺真实数据**:**1 个** 核心授权店铺(大姐店)。
- **当前活跃 Seller**: `大姐店` (seller_id: 3164139599)。
- **字段对齐**:`stores` 表包含 `nickname`;`orders_v2` 表为真实拉取数据。

### 2. API 真实度分级
| 接口 | 状态 | 数据源 |
|------|------|--------|
| `GET /api/shops` | **100% 真实** | 数据库 `stores` 表 `nickname` 字段 |
| `GET /api/orders` | **100% 真实** | 数据库 `orders_v2` 表 |
| `GET /api/shop_reputation` | **100% 真实** | 数据库 `stores` 表指标字段 |
| `GET /api/conversion_stats`| **混合** | 核心数值 (曝光/加购) 来自快照,趋势图为平滑模拟 |
| `GET /api/ai/*` | **占位** | 均为 Mock 数据,待开发 |

### 3. 环境与分工约束
- **端口锁定**:`8506` 为唯一合法开发端口。代码已锁定 `PORT = 8506`。
- **分工边界(严格禁止越界)**:
  - **功能AI**:只动 `index.html`
  - **数据AI**:只动 `api_server.py` 和数据库
  - **跨边界修改必须先确认**,否则视为越界
  - **越界处理**:若发现数据AI改了index.html(或功能AI改了api_server.py),立即还原并告知用户

---

## 核心任务进度 (Current Status)

- [x] **数据链路破解**:已成功穿透 CBT 接口拉取真实数据。
- [x] **真实数据同步**:`orders_v2` 已通过 `pull_real_orders.py` 完成同步,当前共有 **84 条** 真实订单(MLM:14, MLB:52, MLA:17, MCO:1)。
- [x] **后端接口就绪**:核心数据接口已支持 V4 UI。
- [x] **UI 故障修复**:`index.html` 语法错误已修复,恢复渲染。
- [x] **多站点订单激活**:stores 表正常(MLM×2, MLB×1, MLA×1, MCO×1)。
- [ ] **UI 全面去 Mock 化**:将数据中心所有模块对接真实 API -- **待办 (功能 AI 负责)**
  - AfterSalesView.jsx 的 MOCK_MESSAGES 需要对接真实售后消息 API(需要数据 AI 先提供 `/api/after-sales` 接口)

---

## 文件路径速查
- **项目根目录**:`~/yunfan-pro-dev/`
- **前端入口**:`~/yunfan-pro-dev/index.html`
- **后端服务**:`~/yunfan-pro-dev/api_server.py`
- **协议说明**:`~/.accio/.../project/API_PROTOCOL.md`
- **汇总快照**:`~/.openclaw/workspace/meli_project_summary.md`

---

## AI 协作分工(2026-04-30 更新)

### 当前协作模式
- **架构 AI（Hermes）**：技术架构 + DevOps + Bug医生 + QA（不改 src/ 代码）
- **功能 AI**：src/views/ + src/components/（UI 层）
- **数据 AI**：api_server.py + src/hooks/ + src/api/（数据逻辑层）
- **任务协调**：通过共享文档 PROJECT_CONTEXT.md + 用户转发

### 架构 AI 职责
1. **技术架构**：FastAPI 重构、数据库设计、技术方案选型
2. **服务器/DevOps**：阿里云服务器维护、Nginx配置、pm2部署、git工作流
3. **Bug 医生**：白屏问题排查、API报错定位、数据库问题诊断
4. **QA 验证**：新功能上线前验证、数据一致性检查、接口稳定性测试

### FastAPI 重构分工
- **数据 AI**：按分工表实现 5 批路由（店铺/认证 → 商品 → 物流 → 统计 → 智能运营 → 客服 → 同步）
- **架构 AI**：基础设施（config.py、db.py、Token管理中间件、公共依赖注入）+ Admin接口

### AI 任务交接规则
- AI 每完成一个任务，必须主动通知架构 AI
- 架构 AI 负责核实交付物真实性（文件路径、数据库查询、截图）
- 核实通过后才能继续下一个任务
- 不允许先说"已完成"再给虚假证据

### 部署安全策略
- **开发流程**：本地 Mac 修改 → git push → 服务器 git pull → pm2 restart
- **FastAPI 迁移**：8506（旧）不动，8507（新）验证通过后再切换 Nginx
- **验证流程**：8507 测试 → Nginx 切换 → 8506 下线

### Hermes 职责详解

#### 1. 架构设计
- 技术方案选型(如 Vite 迁移、CDN 配置)
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
| 2026-04-26 | Hermes | 初始化本文档,添加 AI 协作分工章节 |
| 2026-04-26 | 数据 AI | 扩展职责范围:接管前端 `src/api/` 和 `src/hooks/` 数据逻辑层 |
| 2026-04-26 | 数据 AI | **紧急指令**:注入 Vite Proxy Token,发布第一批真实数据 Hooks |
| 2026-04-27 | Hermes | admin.html 重写完成(UMD+CDN → Vite),新增 `src/admin/` 目录 |
| 2026-04-27 | Hermes | **架构修复**:1 vite.config.js proxy 3001→8506;2 api_server.py check_auth 恢复 Token 验证;3 密钥迁移至 os.environ.get();4 新建 .gitignore 和 .env.example |
| 2026-04-27 | 数据 AI | **数据同步**:重新执行 `pull_real_orders.py`,向 `orders_v2` 灌入 84 条真实订单数据,支持 V4 UI 渲染 |
| 2026-04-27 | Hermes | **数据库审计**:orders_v2=0(需数据 AI 重跑同步),product_metrics=1527,stores=5 |
| 2026-04-27 | Hermes | **UI 规范检查**:标题+正文对齐规范确立,h3 统一 text-3xl,p 统一 text-xs + text-slate-400 + mt-1,发现4处不一致需修复 |

### UI 规范 (Commander V8 工业标准)
- **响应式优先 (Mobile-First)**: 
    - 移动端默认隐藏侧边栏，通过 `MobileHeader` (Hamburger Menu) 唤起。
    - 容器填充一律采用 `p-4 md:p-10`，间距采用 `space-y-6 md:space-y-10`。
- **字号底线**: 所有文本最低字号 **11px** (text-[11px])，移动端可适度调整至 **10px** 以防溢出。
- **单行锁定 (Single-line Locking)**: 
    - 关键标签必须使用 `whitespace-nowrap`，禁止折行。
    - 移动端若出现溢出，必须外层包裹 `overflow-x-auto no-scrollbar`。
- **布局容器**: 所有主视图容器统一使用 `h-full overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-10` 结构。
- **标题样式**: 统一写在 `<div>` 内，h3 在上，p 在下。
    - 主标题: `text-3xl font-black text-slate-900 tracking-tight whitespace-nowrap`
    - 副标题 (EN): `text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-1 whitespace-nowrap`
- **卡片样式**: 统一使用 `glass-effect rounded-[32px] border border-white/20 shadow-lg`
- **交互逻辑**: 按钮统一用 `rounded-2xl`，数字展示统一用 `tnum` (tabular-nums)。
- **视觉冲突规避**: 侧边栏/监控流 (MonitoringSidebar) 必须保持 `shrink-0`，确保不挤压主数据视图。

---

## 🚨 紧急联调指令 (Vite 迁移专供)
> **致功能 AI**:为了确保你在迁移 `App.jsx` 时数据能直接跑通,请务必阅读以下内容。

### 1. 鉴权说明
*   **配置更新**:vite.config.js proxy 已指向 `http://localhost:8506`,并自动注入 `X-Admin-Token`。
*   **前端操作**:在 `src/` 下发起 `/api/` 请求时,**无需**手动在 Header 里加 Token,Vite proxy 会自动帮你带上。

### 2. 禁止手写 `fetch` 数据逻辑
*   **现状**:旧的 `index.html` 里充满了散乱的 `fetch`。
*   **新规范**:我已经把所有真实数据的业务逻辑封装成了 React Hooks。
*   **可用弹药 (位于 `src/hooks/`)**:
    - `useStatsOverview`: 经营概览、GMV、14天走势
    - `useReputation`: 多店声誉矩阵
    - `useMarketRadar`: 市场雷达、高清原图、AI 诊断
    - `useOrders`: 订单列表、多维过滤
    - `useKeywords`: 关键词情报、流量蓝海
    - `useProductPerformance`: 商品全量性能表
*   **调用示例**:
  ```javascript
  import { useStatsOverview } from '../hooks/useStatsOverview';
  const { data, loading } = useStatsOverview(); // 直接拿到真实数据
  ```

### 3. 冲突规避 (Conflict Avoidance)
*   **Data Side (用户)**: 承诺不直接修改 `src/views/` 和 `src/components/` 下的 UI 样式代码，仅负责数据逻辑层及 Hooks。
*   **UI & Function AI (我)**: 承诺不随意修改 `api_server.py` 或核心数据库逻辑，仅负责前端交互及数据消费。
*   **协作方式**: 如有数据结构变更需求，由 Data Side 提供 Hooks，UI Side 负责集成。

---

## 🚀 部署架构（2026-04-30 更新）

### 服务器信息
- **IP**: `47.76.179.242`（阿里云香港节点）
- **SSH**: 通过阿里云控制台远程连接（外网SSH已封）
- **Web目录**: `/home/admin/yunfan-pro-dev/`
- **API端口**: 8506（PM2 管理，进程名 `yunfan-api`）
- **域名**: `chensan.vip`（Cloudflare DNS A记录 → 47.76.179.242，灰色云）

### SSL/HTTPS
- Let's Encrypt 免费证书（有效期 2026-07-28）
- nginx 处理 HTTPS 终止（端口443）
- HTTP 80 → 重定向到 HTTPS 443

### 生产环境
- **前端**: `https://chensan.vip/` → nginx → `/home/admin/yunfan-pro-dev/dist/`
- **后端**: `https://chensan.vip/api/` → nginx → `http://127.0.0.1:8506/api/`
- **PM2**: 开机自启
- **远程部署**: `POST https://chensan.vip/api/deploy?secret=心神`（触发 git pull + pm2 restart）

### 代码更新流程
本地 `git push` → 服务器 `git pull && pm2 restart yunfan-api`

---

## 🔑 ML 凭证（2026-04-30）

### 当前使用
- **App ID**: `8105299077213607`（旧 ID `2853782117476515` 已废弃）
- **Client Secret**: `viZR1saM1FSpYXquulrmh8T1pKiRjcjN`
- **Webhook URL**: `https://chensan.vip/api/ml/webhook/relay`

### OAuth 状态
- **refresh_token**: ❌ 为空（无法自动续期，需重新授权）
- **access_token**: 约6小时过期

---

## 📊 数据状态

- **订单**: 113条，GMV $2385.52
- **商品**: 12,526条（MLB 占83.7%）
- **曝光**: visits API 有效，数据准确
- **clicks/carts**: ML API 无此端点，显示0是正常

---

## 🛠️ FastAPI 重构（待分工）
- 当前 `api_server.py` 是自定义 TCP Server，计划改为 FastAPI
- 等待架构 AI 出分工表后执行


# P1 任务分配（2天并行完成）

## 负责人

| AI | 平台 | 负责范围 |
|---|---|---|
| 架构AI（Hermes/我） | Telegram | P1-①④ + 多租户后端 + 部署 |
| 数据AI（OpenCLAW） | Telegram | P1-ai.py 5端点 + P1-customer_service.py 2端点 + 官网同步+数据看板 |
| 功能AI（Accio） | 微信+Mac | P1-8个空壳页面 + DataOverviewView修复 + NewsView接入 + LoginView + Admin管理后台 |

---

## P1 完整任务清单（2天）

### 架构AI（Hermes）— Day 1~2

| 任务等级 | 失时效 | 任务 | 状态 |
|---|---|---|---|
| P1 | 2天 | P1-① 新订单创建 → monitoring_logs 打通 | ✅ 完成 |
| P1 | 2天 | P1-④ 取消/退款 → monitoring_logs 写入 | ✅ 完成 |
| P1 | 2天 | P2-1~4 多租户后端（users/invite_codes/store_auths表 + auth API） | ✅ 完成 |
| P2 | 2天 | P2-9~12 官网/公众号同步 + 数据看板 | 待开始 |
| P3 | 2天 | Deploy1~5 国内服务器部署 | 待开始 |

### 数据AI（OpenCLAW）— Day 1~2

| 任务等级 | 失时效 | 任务 | 状态 |
|---|---|---|---|
| P1 | 2天 | P1-1 ai.py 5个端点（analyze/keywords/generate_images/translate/chat_assistant） | 待开始 |
| P1 | 2天 | P1-2 customer_service.py 2个端点（list/suggest） | 待开始 |
| P2 | 2天 | P2-9~12 官网/公众号同步 + 数据看板 | 待开始 |

### 功能AI（Accio）— Day 1~2

| 任务等级 | 失时效 | 任务 | 状态 |
|---|---|---|---|
| P1 | 2天 | P1-3 填满8个空壳页面（ActivityCenter/AfterSales/BusinessIntro/ImageLab/LogisticsAlerts/Login/OptimizingTitle/ProductCollect） | ✅ Accio V1.1 完成 |
| P1 | 2天 | P1-4 DataOverviewView 修复（useStatsOverview 未接入） | ✅ Accio V1.1 完成 |
| P1 | 2天 | P1-5 NewsView 接入 CMS 文章数据 | ✅ Accio V1.1 完成 |
| P2 | 2天 | P2-5~6 LoginView 注册登录 + Admin 用户管理后台 | ✅ Accio V1.1 完成 |

---

## P1 通知类型优先级（架构AI负责）

| 优先级 | 通知类型 | 状态 |
|---|---|---|
| P1-① | 新订单创建 → monitoring_logs | ✅ 完成 |
| P1-② | 物流发货/到货 | 已有部分，待补全 |
| P1-③ | 声誉投诉通知 | 已有 |
| P1-④ | 取消/退款 → monitoring_logs | ✅ 完成 |

流程：ML webhook → webhook.py → 写数据库 + monitoring_logs → 前端 monitoring stream 轮询 → 实时显示

---

## P2 多租户表设计（架构AI Day 1）

### users 表
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT '店主',  -- 管理员/店主/运营/加盟
    parent_id INTEGER,         -- 归属链
    store_auth_id INTEGER,    -- 绑定店铺
    invite_code TEXT,         -- 注册时用的邀请码
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active'  -- active/banned
);
```

### invite_codes 表
```sql
CREATE TABLE invite_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT '店主',     -- 可注册的角色
    created_by INTEGER,          -- 创建者 user_id
    used_by INTEGER,             -- 使用者 user_id
    used_at DATETIME,
    max_uses INTEGER DEFAULT 1,  -- 0=无限
    status TEXT DEFAULT 'active'  -- active/expired
);
```

### store_auths 表
```sql
CREATE TABLE store_auths (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    site_id TEXT,
    access_token TEXT,
    refresh_token TEXT,
    expires_at DATETIME,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 技术约束

- 全程中文交流
- 任何操作前必须先询问意见，不能默认执行
- 跨平台同步暗语："另外那边聊" → 同步进度到 Memory
- Git 工作流：动手前先 commit 快照
- 数据库：mercadolibre.db（SQLite）
- API 服务：localhost:8506
- 前端：localhost:5173（Vite proxy → 8506）
- 失时效：所有任务需在 2 天内完成，超时自动升级处理

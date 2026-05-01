# 数据写入规范（店铺数据）

## 核心原则
数据库是唯一真相来源（Single Source of Truth）。任何写入操作必须遵守本规范。

---

## 一、OAuth 授权规范

### 授权 URL（永久固定）
```
https://global-selling.mercadolibre.com/authorization?response_type=code&client_id=8105299077213607&redirect_uri=https://chensan.vip/api/meli-auth
```
> ⚠️ 不可改 `response_type` 和 `client_id`，只能改 `redirect_uri`

### redirect_uri 三层一致性要求
| 配置位置 | 必须填 |
|---------|--------|
| ML 后台 Callbacks URL | `https://chensan.vip/api/meli-auth` |
| 授权 URL 参数 `redirect_uri` | `https://chensan.vip/api/meli-auth` |
| stores.py `ML_REDIRECT_URI` | `https://chensan.vip/api/meli-auth` |

### 授权流程
1. 打开授权 URL → 浏览器跳转到 `chensan.vip/api/meli-auth?code=xxx`
2. 服务器收到 `GET /api/meli-auth?code=xxx` 请求
3. 用 code 换 token，写入 `ml_tokens.enc`
4. **code 只能用一次**，过期需重新授权

### 常见错误
| 现象 | 原因 |
|------|------|
| 405 Method Not Allowed | 服务器旧代码只有 POST，新增 GET 后修复 |
| invalid_grant | code 已用过或过期，重新授权即可 |
| 授权后跳转不到 | redirect_uri 不一致（区分 http/https） |

---

## 二、Token 自动刷新规则

### 存储结构
- 加密文件：`~/yunfan-pro-dev/ml_tokens.enc`（XOR+base64）
- Key 文件：`~/.ml_token_key`
- 数据库：`stores.access_token` / `stores.refresh_token`

### 刷新阈值
- token 有效期：6 小时
- **提前 30 分钟**自动刷新（剩余 < 1800 秒时）
- refresh_token 有效期：180 天

### 刷新流程
```
get_valid_token()
  ├─ load_tokens() 读取 ml_tokens.enc
  ├─ is_token_expired(tokens)?
  │   ├─ NO  → 直接返回 access_token
  │   └─ YES → refresh_access_token(refresh_token)
  │           ├─ POST https://api.mercadolibre.com/oauth/token
  │           │    grant_type=refresh_token
  │           │    client_id=8105299077213607
  │           │    client_secret=viZR1saM1FSpYXquulrmh8T1pKiRjcjN
  │           │    refresh_token=TG-69f421b7a...
  │           ├─ save_tokens(new_tokens) 写 ml_tokens.enc + stores 表
  │           └─ 返回新 access_token
```

### 调用规范（强制）
**所有同步脚本** 必须统一调用：
```python
from token_manager import get_valid_token

def sync_orders():
    token = get_valid_token()  # 每次同步前获取，保证不过期
    headers = {'Authorization': f'Bearer {token}'}
    # ... 调API
```

**禁止**直接用 `load_tokens()["access_token"]`，必须通过 `get_valid_token()` 获取。

### 失效处理
- refresh_token 过期（180天）→ 需要重新手动授权
- ML 后台撤销 App 权限 → 需要重新授权

---

## 三、stores 表约束

| 字段 | 约束 | 说明 |
|------|------|------|
| `site_id` | NOT NULL + UNIQUE | 同一站点只能有一条记录 |
| `access_token` | NOT NULL | ML OAuth token，必须有值才能写入 |
| `seller_id` | NOT NULL | ML seller ID，必须有值才能写入 |
| `nickname` | NOT NULL | ML 店铺昵称，必须有值才能写入 |
| `group_label` | 可选 | 同组店铺的逻辑名称（目前用店铺名） |
| `parent_store_id` | 可选 | 同组主店铺ID |

### INSERT 前检查清单
```
✅ access_token 不为空
✅ seller_id 不为空
✅ nickname 不为空
✅ site_id 不重复（UNIQUE 约束）
```

### 禁止写入的情况
- `access_token` 为空 → ❌ 拒绝
- `seller_id` 为空 → ❌ 拒绝
- `nickname` 为空 → ❌ 拒绝
- 同 `site_id` 重复插入 → ❌ UNIQUE 约束报错

### 正确流程
1. 先从 ML API 获取 `seller_id`、`nickname`、`site_id`、`access_token`
2. 校验全部非空
3. INSERT（建议用 `INSERT OR REPLACE` 防重复）
4. 如果 `site_id` 已存在且需要更新，用 `INSERT OR REPLACE`（会自动覆盖）

---

## 四、分组逻辑（group_label）

### 什么时候填 group_label
- 同一物理店铺的多个站点（如大姐店-BR/AR/CO/MX）
- 通过 `access_token` 前缀或 `master_user_id` 判断是否同组

### 判断标准
- Token 前缀相同（`APP_USR-...` 前17位相同）→ 同一 group
- `master_user_id` 相同 → 同一 group

### group_label 命名
- 用店铺主名称（如"大姐店"）
- 不要带站点后缀（-BR/-AR/-MX 等）

---

## 五、ML API 关键发现（2026-04-29 实测）

### CBT 用户层级结构

| 角色 | site_id | 说明 |
|------|---------|------|
| Merchant（父级） | CBT | 全局用户，拥有 token，管理子用户 |
| Seller（子级） | MLM/MLB/MCO/MLA/MLC/MLU | 各站点独立用户 |

**查询方式**：`GET /marketplace/users/{merchant_id}`
返回结构：
```json
{
  "user_id": 3164139599,
  "site_id": "CBT",
  "marketplaces": [
    {"site_id": "MLM", "user_id": 3164142227, "logistic_type": "remote"},
    {"site_id": "MCO", "user_id": 3164142229, "logistic_type": "remote"},
    {"site_id": "MLB", "user_id": 3164144051, "logistic_type": "remote"},
    ...
  ]
}
```

### 各站点 seller_id（2026-04-29 实测）
| 站点 | user_id | 该站点商品数 |
|------|---------|-------------|
| MLM | 3164142227 | 少量 |
| **MCO** | 3164142229 | **7个** |
| MLA | 3164144057 | 少量 |
| **MLB** | 3164144051 | **10,508个** |
| MLC | 3164141055 | 少量 |
| MLU | 3186965280 | 少量 |

### 商品数据端点（重要！之前一直用错）
| 端点 | 状态 | 说明 |
|------|------|------|
| `GET /items/{id}` | ❌ 403 | 旧端点，CBT无权访问 |
| `GET /marketplace/items/{id}` | ✅ 正常 | **正确端点**，返回完整字段 |

`/marketplace/items/{id}` 返回字段：
- `price`, `thumbnail`, `pictures`（多图）, `sold_quantity`, `available_quantity`
- `title`, `status`, `category_id`, `domain_id`, `seller_id`

### 商品列表端点
| 端点 | 能力 |
|------|------|
| `/marketplace/users/{seller_id}/items/search` | 按站点用户搜商品 |
| `/marketplace/users/{seller_id}/items/search?search_type=scan` | 超1000条分页（返回 scroll_id）|
| `/marketplace/users/{seller_id}/items/search?status=active` | 只查激活状态 |
| `/marketplace/items/{id}/marketplace_items` | 获取商品跨站点映射关系 |

### 其他有用的 CBT 可用 API
| API | 端点 | 能力 |
|-----|------|------|
| 品类预测 | `/marketplace/domain_discovery/search?q=...` | 英文描述→推荐分类 |
| 商品访客量 | `/visits/items?ids=...` | 获取商品历史访问量 |
| 商品评价 | `/reviews/item/{item_id}` | 获取商品评论和评分 |
| 产品搜索 | `/marketplace/products/search?q=...` | 搜CBT目录商品 |
| 竞争分析 | `/marketplace/benchmarks/items/{id}/details` | 赢得黄金购物车所需价格 |

### Notification Webhooks（已有 webhook 端点）
- `marketplace_orders` → ✅ 已接（orders_v2 webhook）
- `marketplace_items` → 商品上下架/变价通知
- `marketplace_questions` → 新提问/回复通知
- `price_suggestion` → 降价建议通知
- `marketplace_shipments` → 发货状态变更
- `marketplace_claims` → 纠纷通知

### 全站畅销榜（仍无法实现）
- `/sites/{site}/search` → 403（CBT无权限）
- 需要 MLS 账号或更高权限

---

## 六、已有数据结构（2026-04-28）

```
id=52  大姐店-BR  MLB     group_label="大姐店"  parent=52  master_user_id=3164144051
id=53  大姐店-AR  MLA     group_label="大姐店"  parent=52  master_user_id=3164144057
id=54  大姐店-CO  MCO     group_label="大姐店"  parent=52  master_user_id=3164142229
id=55  大姐店-MX  MLM     group_label=null      parent=55  master_user_id=3164139599
```

> 注意：id=55 MX 是独立站（不同 master_user_id），group_label=null，parent_store_id=55

---

## 七、清理垃圾数据

如果发现 `seller_id=null` 或 `access_token=null` 的记录，立即删除：

```python
cursor.execute("DELETE FROM stores WHERE seller_id IS NULL OR access_token IS NULL")
```

---

## 八、OAuth + Token 相关文件路径

| 文件 | 用途 |
|------|------|
| `~/yunfan-pro-dev/ml_tokens.enc` | 加密 token 存储 |
| `~/.ml_token_key` | 加密 key |
| `~/yunfan-pro-dev/fastapi_server/routes/stores.py` | OAuth 回调路由 |
| `~/yunfan-pro-dev/scripts/utils/token_manager.py` | token 读写+刷新核心 |
| `~/yunfan-pro-dev/scripts/sync/sync_all_platform_data.py` | 已接入 `get_valid_token()` |

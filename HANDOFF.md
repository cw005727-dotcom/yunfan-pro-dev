# 功能AI交接文档（数据AI → 功能AI）

## 当前状态总览

### ✅ 已完成
1. **商品数据同步** — 12,521品入库（MLB/MLA/MCO/MLU/MLM_R），真实标题/价格/图片
2. **访客数据填充** — product_metrics.exposure 已写入（MLB 1878品有访客，MLM 27品310万访）
3. **前端 clicks/carts 列已删除** — ML API 无此数据，永久移除

---

## 当前数据库真实数据

### product_metrics 表（有数据的字段）
| 字段 | 说明 | 数据量 |
|------|------|--------|
| item_id | 商品ID | 12,521 |
| name | 真实标题（葡/西语） | 100% |
| price | 真实价格 | 100% |
| image_url | 真实图片 | 100% |
| status | 在售状态 | 100% |
| sales | 真实销量 | ~50% |
| exposure | 真实访客数 | 2,088品有数据，其余0 |
| site_id | 站点 | 100% |
| start_time | 上架日期 | 部分 |
| last_updated | 最后更新 | 100% |

### 无数据的字段（永久为空）
- `clicks` — ML API 无此端点
- `carts` — ML API 无此端点
- `cart_rate` — 同上

---

## 下一步：物流追踪真实化

### 数据来源
- **API**: `GET /marketplace/shipments/{id}?x-format-new=true`
- **必要header**: `Authorization: Bearer {token}`, `x-format-new: true`
- **返回**: tracking_number / status / receiver_address / logistic_type / estimated_delivery

### 目标效果（OrderOverviewView）
把订单列表里的物流状态换成真实API数据：
- 物流公司名称（ DHL/FMEX/三星 等）
- 轨迹节点（shipped/in_transit/delivered）
- 收件人城市/州

### 工作内容

#### 1. 写一个同步脚本 `sync_logistics.py`
```python
# 需求：
# - 读 orders_v2 表中 tracking_id 不为空的订单
# - 调 /marketplace/shipments/{tracking_id}?x-format-new=true
# - 写入 orders_v2 的 logistics_company / tracking_status / receiver_city / receiver_state 字段
# - 限速：200ms/request 防429
# - 批量：50条一批，skip已成功的
```

#### 2. 前端 OrderOverviewView 改动
```jsx
// 改动点：
// - logistics_status 显示：改为从 orders_v2 读 logistics_company + tracking_status
// - 收件人地址：显示 receiver_city, receiver_state
// - 去掉所有写死的 fake logistics 数据
// - 状态点颜色：shipped=蓝 / in_transit=黄 / delivered=绿 / returned=红
```

#### 3. API handler 改动（api_server.py）
```python
# /api/orders 已有字段：
# - shipping_status ✅（已有）
# - shipping_substatus ✅（已有）
# 新增返回字段：
# - logistic_type（物流公司名）
# - tracking_status（轨迹状态）
# - receiver_city / receiver_state（收件人地址，可选）
```

### 已知限制
- shipments API 需要逐单查（无法批量），订单量大时耗时长
- 建议先跑一次所有有 tracking_id 的订单（当前约50条有真实tracking）
- 收件人完整地址字段较大，是否写入DB可讨论

### API测试命令
```bash
TOKEN=$(cat ~/.openclaw/workspace/cloud-sail/data/ml_token.json | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
# 用一条真实tracking_id测试：
curl -H "Authorization: Bearer $TOKEN" \
     -H "x-format-new: true" \
     "https://api.mercadolibre.com/marketplace/shipments/{tracking_id}"
```

---

## 优先级说明

| 优先级 | 功能 | 原因 |
|--------|------|------|
| P0 | sync_logistics.py | 数据真实化的基础 |
| P0 | 订单列表显示物流公司+轨迹 | 用户最关心的功能 |
| P1 | 收件人地址字段 | 可选，字段较大 |

---

## 共享文件
- `~/yunfan-pro-dev/mercadolibre.db` — 唯一数据库
- `~/yunfan-pro-dev/api_server.py` — 后端
- `~/yunfan-pro-dev/FEASIBILITY_REPORT.md` — 完整数据能力清单

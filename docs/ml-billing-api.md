# ML Billing Reports API — 待回款/已回款查询

> 2026-05-31 整理，来源：https://global-selling.mercadolibre.com/devsite/api-docs

## 文档站访问

```
https://global-selling.mercadolibre.com/devsite/api-docs
```

需要 CBT 账号登录。用 Hermes 时需传入该站的 cookie。

## API 接口

```
GET /billing/integration/group/ML/order/details
```

### 鉴权

- `Authorization: Bearer {access_token}` 或 `?access_token={token}`
- `seller_id` **必须传市场用户 ID**（子卖家），不能传全局用户（3164139599）
- 市场用户 ID 从子订单的 `seller.id` 获取（例：3164142227, 3164144057）
- 如果 seller_id 传错（传了全局用户），返回 403 PolicyAgent 错误

### 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `seller_id` | 是 | 市场用户 ID（子卖家） |
| `order_ids` | 二选一 | 子订单 ID，逗号分隔 |
| `pack_id` | 二选一 | Pack ID |
| `offset` | 否 | 分页起始位置 |
| `limit` | 否 | 每页条数（默认150） |
| `sort_by` | 否 | 排序字段：ID（默认）或 DATE |
| `order_by` | 否 | 排序方向：ASC（默认）或 DESC |

### 返回结构

```json
{
  "offset": 0,
  "limit": 150,
  "total": 1,
  "last_id": 0,
  "results": [
    {
      "order_id": 2000015473410608,
      "payment_info": [
        {
          "payment_id": 149631634656,
          "date_approved": "2026-03-09T22:49:51",
          "date_created": "2026-03-09T22:49:51",
          "money_release_date": "2026-03-31T01:40:36",
          "money_release_days": 28,
          "money_release_status": "released",
          "payer_id": 3255299889,
          "payment_method_id": "account_money",
          "payment_type_id": "account_money",
          "status": "approved",
          "status_details": null,
          "base_amount": 6.01,
          "base_amount_usd": 0.34,
          "tax_details": []
        }
      ],
      "sale_fee": null,
      "details": [...]
    }
  ],
  "errors": []
}
```

### 关键字段说明

| 字段 | 说明 |
|------|------|
| `money_release_status` | **"released"** = 已回款，其他值待确认（可能为 "pending" 等） |
| `money_release_date` | 资金释放日期 |
| `money_release_days` | 释放所需天数 |
| `base_amount` | 本地货币金额 |
| `base_amount_usd` | **美元金额（CBT 专属）** |
| `status` | 支付状态：approved |
| `tax_details` | 税费扣缴明细 |

### 注意

1. **新订单可能查不到**：近期订单返回 `total: 0`，billing 数据还没生成
2. **没有全量列表接口**：必须传具体 order_ids 或 pack_id
3. **需要先拉订单列表**：通过 `/marketplace/orders/search` 获取已付款订单后才能查
4. **packs不能直接查**：pack 订单（pack_id 以 20000 开头）不能单独查详情，会 404

## 工作流

```
1.  /marketplace/orders/search?seller_id={全局用户}&order.status=paid&limit=50
    → 获取已付款的 pack 列表

2.  遍历每个 pack，获取子订单的 seller.id（市场用户ID）
    
3.  /billing/integration/group/ML/order/details?order_ids={子订单ID}&seller_id={市场用户ID}
    或 /billing/integration/group/ML/order/details?pack_id={packID}&seller_id={市场用户ID}
    → 获取 money_release_status

4.  汇总：
    - money_release_status = "released" → 已回款
    - total = 0（查不到） → 暂不统计（可能还在处理中）
    - 其他值 → 待回款（pending）
```

## 实测记录

- 2026-03-09 订单一笔（MLM站点，$6.01）：
  - `money_release_status`: "released"
  - `money_release_date`: 2026-03-31
  - `money_release_days`: 28
- 2026-05 近期订单：返回 total=0（billing 数据未生成）
- 使用 seller_id=3164139599（全局用户）→ 403 PolicyAgent
- 使用 seller_id=3164142227（市场用户）→ ✅ 正常返回

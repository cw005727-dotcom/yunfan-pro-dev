# Shopify Admin REST API 参考手册

> 版本：2025-01 | 基于 shopify.dev 官方文档

## 基础信息

### Base URL
```
https://{shop}.myshopify.com/admin/api/2025-01/{resource}.json
```

### 认证
```
Header: X-Shopify-Access-Token: {access_token}
```

### Python 请求模板
```python
import requests

def shopify_request(shop, token, method, endpoint, data=None):
    url = f"https://{shop}.myshopify.com/admin/api/2025-01/{endpoint}"
    headers = {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json"
    }
    if method == "GET":
        r = requests.get(url, headers=headers)
    elif method == "POST":
        r = requests.post(url, json=data, headers=headers)
    elif method == "PUT":
        r = requests.put(url, json=data, headers=headers)
    elif method == "DELETE":
        r = requests.delete(url, headers=headers)
    return r.json()
```

---

## 产品管理 (Products)

### 产品 CRUD

| 方法 | Endpoint | 说明 |
|------|----------|------|
| GET | `/products.json` | 列表（支持limit/page/updated_at_min等筛选） |
| GET | `/products/{product_id}.json` | 单个 |
| POST | `/products.json` | 创建 |
| PUT | `/products/{product_id}.json` | 更新 |
| DELETE | `/products/{product_id}.json` | 删除 |

### 筛选参数
```
?limit=250&status=active
&vendor=Nike&product_type=Pants
&created_at_min=2025-01-01T00:00:00Z
&updated_at_min=2025-01-01T00:00:00Z
&published_status=published
```

### 创建产品（完整示例）
```json
POST /admin/api/2025-01/products.json
{
  "product": {
    "title": "Wireless Bluetooth Earbuds Pro",
    "body_html": "<strong>Premium sound quality with active noise cancellation.</strong>",
    "vendor": "TechBrand",
    "product_type": "Electronics",
    "status": "active",
    "tags": "wireless,earbuds,bluetooth",
    "variants": [
      {
        "option1": "Black",
        "price": "29.99",
        "sku": "WBE-BLK-001",
        "inventory_management": "shopify",
        "inventory_quantity": 100
      },
      {
        "option1": "White",
        "price": "29.99",
        "sku": "WBE-WHT-001",
        "inventory_management": "shopify",
        "inventory_quantity": 80
      }
    ],
    "options": [
      {
        "name": "Color",
        "values": ["Black", "White"]
      }
    ],
    "images": [
      {
        "src": "https://example.com/earbuds-black.jpg"
      }
    ]
  }
}
```

### 产品变体 (Variants)

| 方法 | Endpoint |
|------|----------|
| GET | `/variants/{variant_id}.json` |
| POST | `/products/{product_id}/variants.json` |
| PUT | `/variants/{variant_id}.json` |
| DELETE | `/products/{product_id}/variants/{variant_id}.json` |

### 产品图片 (Images)

| 方法 | Endpoint |
|------|----------|
| GET | `/products/{product_id}/images.json` |
| POST | `/products/{product_id}/images.json` |
| PUT | `/products/{product_id}/images/{image_id}.json` |
| DELETE | `/products/{product_id}/images/{image_id}.json` |

```json
POST /products/123/images.json
{
  "image": {
    "src": "https://example.com/image.jpg",
    "position": 1
  }
}
```

---

## 订单管理 (Orders)

### 订单 CRUD

| 方法 | Endpoint | 说明 |
|------|----------|------|
| GET | `/orders.json` | 列表 |
| GET | `/orders/{order_id}.json` | 单个 |
| POST | `/orders/{order_id}/cancel.json` | 取消 |
| POST | `/orders/{order_id}/close.json` | 关闭 |

### 筛选参数
```
?status=open
&financial_status=paid
&fulfillment_status=unshipped
&created_at_min=2025-01-01T00:00:00Z
&updated_at_min=2025-01-01T00:00:00Z
&customer_id=987654321
```

### 订单响应结构
```json
{
  "order": {
    "id": 1234567890,
    "email": "customer@example.com",
    "created_at": "2025-01-15T10:30:00Z",
    "total_price": "59.99",
    "financial_status": "paid",
    "fulfillment_status": null,
    "customer": {
      "id": 987654321,
      "first_name": "John",
      "last_name": "Doe"
    },
    "line_items": [
      {
        "id": 111111111,
        "variant_id": 222222222,
        "product_id": 123456789,
        "title": "Wireless Earbuds",
        "variant_title": "Black",
        "price": "29.99",
        "quantity": 2,
        "sku": "WBE-BLK-001"
      }
    ],
    "shipping_address": {
      "first_name": "John",
      "address1": "123 Main St",
      "city": "New York",
      "province": "NY",
      "country": "US",
      "zip": "10001"
    }
  }
}
```

### 物流履约 (Fulfillment)

| 方法 | Endpoint |
|------|----------|
| GET | `/orders/{order_id}/fulfillments.json` |
| POST | `/orders/{order_id}/fulfillments.json` |
| PUT | `/orders/{order_id}/fulfillments/{fulfillment_id}.json` |

```json
POST /orders/1234567890/fulfillments.json
{
  "fulfillment": {
    "location_id": 999999999,
    "tracking_number": "YB1234567890",
    "tracking_company": "YunExpress",
    "line_items": [
      {"id": 111111111, "quantity": 1}
    ],
    "notify_customer": true
  }
}
```

### 退款 (Refund)
```json
POST /orders/1234567890/refunds.json
{
  "refund": {
    "note": "Customer returned item",
    "refund_line_items": [
      {"line_item_id": 111111111, "quantity": 1, "restock_type": "return"}
    ],
    "transactions": [
      {"parent_id": 555555555, "amount": "29.99", "kind": "refund"}
    ]
  }
}
```

---

## 库存管理

### 库存级别 (Inventory Level)

| 方法 | Endpoint |
|------|----------|
| GET | `/inventory_levels.json?inventory_item_ids=123,456&location_ids=789` |
| POST | `/inventory_levels/adjust.json` |
| POST | `/inventory_levels.json` |

```json
POST /inventory_levels/adjust.json
{
  "inventory_item_id": 123456789,
  "location_id": 999999999,
  "available_adjustment": -5
}
```

### 位置 (Location)
```json
GET /locations.json
{
  "locations": [
    {"id": 999999999, "name": "Main Warehouse", "country": "US"}
  ]
}
```

---

## 客户管理 (Customers)

| 方法 | Endpoint |
|------|----------|
| GET | `/customers.json` |
| GET | `/customers/{customer_id}.json` |
| POST | `/customers.json` |
| PUT | `/customers/{customer_id}.json` |

### 筛选
```
?limit=250&created_at_min=2025-01-01T00:00:00Z
&updated_at_min=2025-01-01T00:00:00Z
```

```json
POST /customers.json
{
  "customer": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "verified_email": true,
    "addresses": [
      {
        "address1": "123 Main St",
        "city": "New York",
        "province": "NY",
        "country": "US",
        "zip": "10001"
      }
    ]
  }
}
```

---

## 收藏 (Collection)

```json
POST /collections.json
{
  "collection": {
    "title": "Summer Collection",
    "handle": "summer-collection",
    "body_html": "<p>Our summer products</p>",
    "published": true,
    "collects": [
      {"product_id": 123456789},
      {"product_id": 987654321}
    ]
  }
}
```

---

## Webhook

### 创建 Webhook
```json
POST /webhooks.json
{
  "webhook": {
    "topic": "orders/create",
    "address": "https://your-server.com/webhook/orders",
    "format": "json"
  }
}
```

### 关键 Topics
- `orders/create` / `orders/update` / `orders/paid` / `orders/cancelled`
- `orders/fulfilled` / `orders/refunded`
- `products/create` / `products/update` / `products/delete`
- `customers/create` / `customers/update`
- `inventory_levels/update`
- `fulfillments/create`

### Webhook 验证 (Python)
```python
import hmac, hashlib

def verify_shopify_webhook(data, hmac_header, secret):
    digest = hmac.new(secret.encode(), data, hashlib.sha256).digest()
    computed = hashlib.b64encode(digest).decode()
    return hmac.compare_digest(computed, hmac_header)
```

---

## 速率限制

| 方案 | 桶容量 | 恢复速度 |
|------|--------|---------|
| Basic | 40请求/桶 | +1请求/秒 |
| Advanced | 80请求/桶 | +2请求/秒 |
| Plus | 100请求/桶 | +5请求/秒 |

响应头：`X-Shopify-Shop-Api-Call-Limit: 40/80`
返回429时看：`Retry-After: 5`（秒）

---

## Metafield (元字段)

```json
POST /metafields.json
{
  "metafield": {
    "namespace": "custom",
    "key": "origin_country",
    "value": "China",
    "value_type": "string",
    "owner_resource": "product",
    "owner_id": 123456789
  }
}
```

---

## 折扣码 (Discount Code)

```json
POST /price_rules.json
{
  "price_rule": {
    "title": "Summer Sale 20%",
    "value_type": "percentage",
    "value": "-20.0",
    "target_type": "line_item",
    "allocation_method": "across",
    "starts_at": "2025-06-01T00:00:00Z"
  }
}

POST /price_rules/123456789/discount_codes.json
{
  "discount_code": {"code": "SUMMER20"}
}
```

---

## 店铺信息 (Shop)

```json
GET /shop.json
{
  "shop": {
    "name": "My Store",
    "domain": "my-store.myshopify.com",
    "country": "US",
    "currency": "USD",
    "customer_email": "support@my-store.com"
  }
}
```

---

## 常用操作速查

### 批量上架产品
```python
# 逐个创建（速率限制内）
for product_data in products_batch:
    r = requests.post(url, json={"product": product_data}, headers=headers)
    if r.status_code == 201:
        print(f"Created: {r.json()['product']['id']}")
    time.sleep(0.5)  # 避免触发限流
```

### 获取所有产品
```python
products = []
page = 1
while True:
    r = requests.get(f"{url}/products.json?limit=250&page={page}", headers=headers)
    data = r.json()['products']
    products.extend(data)
    if len(data) < 250:
        break
    page += 1
    time.sleep(0.5)
```

### 更新库存
```python
# 先查location_id
locs = requests.get(f"{url}/locations.json", headers=headers).json()
location_id = locs['locations'][0]['id']

# 调整库存
requests.post(f"{url}/inventory_levels/adjust.json",
    json={"inventory_item_id": inv_id, "location_id": location_id, "available_adjustment": -1},
    headers=headers)
```

### 订单处理流程
```
1. GET /orders.json?status=open → 新订单
2. 通知1688供应商代发
3. 供应商给追踪号
4. POST /orders/{id}/fulfillments.json → 上传追踪号
5. 客户收到包裹
```

---

## 文档版本
- Shopify Admin REST API: 2025-01
- 最后更新：2025-01-15

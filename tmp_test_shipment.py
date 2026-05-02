#!/usr/bin/env python3
"""测试 shipments API 返回的完整字段"""
import sys, os, json, base64, requests

sys.path.insert(0, '/Users/chensan/yunfan-pro-dev/scripts/sync')
from token_manager import load_tokens

tokens = load_tokens()
token = tokens.get('access_token', '')
h = {'Authorization': f'Bearer {token}', 'x-format-new': 'true'}

# 取一条有 tracking_id 的订单
import sqlite3
conn = sqlite3.connect('/Users/chensan/yunfan-pro-dev/mercadolibre.db')
c = conn.cursor()
row = c.execute("SELECT id, tracking_id FROM orders_v2 WHERE tracking_id IS NOT NULL AND tracking_id != '' LIMIT 1").fetchone()
conn.close()

if not row:
    print("没有带 tracking_id 的订单")
    sys.exit(0)

order_id, tracking = row
print(f"测试订单: {order_id}, tracking: {tracking}")

# 拿 shipment_id
r = requests.get(f'https://api.mercadolibre.com/marketplace/orders/{order_id}', headers=h, timeout=15)
if r.status_code != 200:
    print(f"orders API 失败: {r.status_code} {r.text[:100]}")
    sys.exit(1)

order_data = r.json()
ship_id = order_data.get('shipping', {}).get('id')
print(f"shipment_id: {ship_id}")

if not ship_id:
    print("无 shipment_id")
    sys.exit(0)

# 拿完整 shipments 数据
r2 = requests.get(f'https://api.mercadolibre.com/marketplace/shipments/{ship_id}', headers=h, timeout=15)
print(f"\nshipments API 状态: {r2.status_code}")
if r2.status_code != 200:
    print(r2.text[:200])
    sys.exit(1)

data = r2.json()
print("\n=== shipments API 完整字段 ===")
for k, v in sorted(data.items()):
    print(f"  {k}: {str(v)[:100]}")

# 看看 destination / shipping_address
addr = data.get('destination', {}).get('shipping_address', {})
print("\n=== shipping_address 字段 ===")
for k, v in sorted(addr.items()):
    print(f"  {k}: {str(v)[:80]}")

print("\n=== lead_time / estimated_delivery_time ===")
lead = data.get('lead_time', {})
est = lead.get('estimated_delivery_time', {})
print(f"  estimated_delivery_time: {est}")

print("\n=== tracking_method ===")
print(f"  tracking_method: {data.get('tracking_method')}")
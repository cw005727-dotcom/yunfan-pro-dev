#!/usr/bin/env python3
import os, sqlite3, json, time, requests

db = '/home/admin/yunfan-pro-dev/mercadolibre.db'
conn = sqlite3.connect(db)
cur = conn.cursor()

# 查所有 stores 的 token
cur.execute('SELECT site_id, user_id, access_token, refresh_token FROM stores')
rows = cur.fetchall()
print(f'Stores 里共 {len(rows)} 个账号:')
for r in rows:
    at = r[2] or ''
    rt = r[3] or ''
    uid_from_token = at.split('-')[-1] if at else '?'
    print(f'  {r[0]} (user_id={r[1]}, token_uid={uid_from_token}): AT={at[:30]}...')

# 用 MLB 的 token（user_id=3164144051）
cur.execute('SELECT access_token, refresh_token FROM stores WHERE user_id=3164144051')
row = cur.fetchone()
conn.close()
if not row:
    print('没有 MLB (3164144051) 的 token')
    exit()

access_token = row[0]
refresh_token = row[1]
print(f'\nMLB token: {access_token[:40]}...')

# 查今日巴西订单
seller = 3164144051
start = '2026-05-01T12:00:00.000-04:00'
end = '2026-05-02T15:59:59.000-04:00'

url = 'https://api.mercadolibre.com/marketplace/orders/search'
params = {
    'seller': seller,
    'order.date_created.from': start,
    'order.date_created.to': end,
    'limit': 50
}
headers = {'Authorization': f'Bearer {access_token}'}
r = requests.get(url, headers=headers, params=params, timeout=20)
print(f'API 状态: {r.status_code}')

if r.status_code == 401:
    print('Token 失效，尝试刷新...')
    refresh_url = 'https://api.mercadolibre.com/oauth/token'
    data = {
        'grant_type': 'refresh_token',
        'client_id': '8105299077213607',
        'client_secret': '',  # 稍后从环境变量或文件读
        'refresh_token': refresh_token
    }
    r2 = requests.post(refresh_url, data=data, timeout=15)
    print(f'Refresh: {r2.status_code} {r2.text[:300]}')
elif r.status_code == 200:
    data = r.json()
    results = data.get('results', [])
    print(f'今日巴西订单: {len(results)} 笔')
    for o in results:
        buyer = (o.get('buyer') or {})
        print(f'  订单 {o["id"]} | {o["date_created"]} | {o["status"]} | 金额 {o.get("total_amount","?")} | 买家 {buyer.get("nickname","?")}')
        for item in o.get('order_items', []):
            it = item.get('item', {})
            print(f'    商品: {it.get("id","?")} x{item.get("quantity",1)} | {it.get("title","?")[:50]}')
else:
    print(r.text[:300])
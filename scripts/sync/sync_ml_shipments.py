"""物流状态轮询脚本"""
import sys, os, requests, sqlite3, json
from datetime import datetime, timezone, timedelta

# 加载 token（直接读加密文件）
key_file = os.path.expanduser('~/.ml_token_key')
key = open(key_file).read().strip()

from cryptography.fernet import Fernet
fernet = Fernet(key.encode())
tokens_file = '/home/admin/yunfan-pro-dev/ml_tokens.enc'
tokens = json.loads(fernet.decrypt(open(tokens_file).read()))
at = tokens['access_token']
rt = tokens.get('refresh_token')

# refresh 过期 token
import time
if rt:
    try:
        refreshed = requests.post('https://api.mercadolibre.com/oauth/token', data={
            'grant_type': 'refresh_token',
            'client_id': '8105299077213607',
            'refresh_token': rt
        }, timeout=10).json()
        if refreshed.get('access_token'):
            at = refreshed['access_token']
            # 保存新 token
            tokens['access_token'] = at
            if refreshed.get('refresh_token'):
                tokens['refresh_token'] = refreshed['refresh_token']
            open(tokens_file, 'wb').write(fernet.encrypt(json.dumps(tokens).encode()))
            print('Token 已刷新')
    except Exception as e:
        print(f'Refresh 失败: {e}')

h = {'Authorization': f'Bearer {at}'}
DB = '/home/admin/yunfan-pro-dev/mercadolibre.db'

conn = sqlite3.connect(DB)
c = conn.cursor()

# 找出已发货但缺物流信息的订单
c.execute("""
SELECT id FROM orders_v2
WHERE id NOT LIKE '999%' AND id NOT LIKE 'TEST%'
AND (shipping_status IS NULL OR tracking_id IS NULL)
LIMIT 20
""")
pending = [r[0] for r in c.fetchall()]
print(f'待查物流: {len(pending)} 单')

updated = 0
for oid in pending:
    r = requests.get(f'https://api.mercadolibre.com/marketplace/orders/{oid}', headers=h, timeout=10)
    if r.status_code != 200:
        continue

    d = r.json()
    shipment = d.get('shipment', {})
    shipment_id = shipment.get('id') if isinstance(shipment, dict) else None

    if not shipment_id:
        continue

    r2 = requests.get(f'https://api.mercadolibre.com/marketplace/shipments/{shipment_id}', headers=h, timeout=10)
    if r2.status_code != 200:
        print(f'  {oid} shipment {shipment_id} 状态:{r2.status_code}')
        continue

    sd = r2.json()
    logistic_type = sd.get('logistic_type', '')
    tracking_id = sd.get('tracking_id', '') or sd.get('tracking_number', '')
    shipping_status = sd.get('status', '')

    c.execute("""UPDATE orders_v2 SET
        shipping_status = ?,
        tracking_id = ?,
        logistic_type = ?
    WHERE id = ?""",
        (shipping_status, tracking_id, logistic_type, oid))
    updated += 1
    print(f'  ✅ {oid} | {shipping_status} | {tracking_id} | {logistic_type}')

conn.commit()
print(f'\n更新了 {updated} 条')
conn.close()
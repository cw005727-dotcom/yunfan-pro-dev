#!/usr/bin/env python3
"""修复 orders_v2 的 logistic_type 字段 - 用 logistic.type 填充"""
import requests, json, base64, sqlite3

def d(enc, key):
    kb = key.encode()
    db = base64.b64decode(enc.encode())
    return ''.join(chr(db[i] ^ kb[i % len(kb)]) for i in range(len(db)))

key = open('.ml_token_key').read().strip()
tok = json.loads(d(open('ml_tokens.enc').read(), key))
h = {'Authorization': 'Bearer ' + tok['access_token'], 'x-format-new': 'true'}

import socket
DATA_DIR = '/home/admin/data' if socket.gethostname() == 'iZj6chblbqrz1cmahnevj3Z' else os.path.dirname(os.path.abspath(__file__))
conn = sqlite3.connect(os.path.join(DATA_DIR, 'mercadolibre.db'))
c = conn.cursor()

c.execute("SELECT id FROM orders_v2 WHERE logistic_type IS NULL OR logistic_type='' LIMIT 30")
pending = [r[0] for r in c.fetchall()]
print(f'待补 logistic_type: {len(pending)} 条')

updated = 0
for oid in pending:
    r = requests.get('https://api.mercadolibre.com/marketplace/orders/' + oid, headers=h, timeout=10)
    if r.status_code != 200:
        continue
    d = r.json()
    ship_data = d.get('shipping', {})
    sid = ship_data.get('id') if isinstance(ship_data, dict) else None
    if not sid:
        continue
    r2 = requests.get('https://api.mercadolibre.com/marketplace/shipments/' + str(sid), headers=h, timeout=10)
    if r2.status_code != 200:
        continue
    sd = r2.json()
    lo = sd.get('logistic', {})
    lt = lo.get('type', '') if isinstance(lo, dict) else ''
    ti = sd.get('tracking_id', '') or sd.get('tracking_number', '')
    ss = sd.get('status', '')
    c.execute("UPDATE orders_v2 SET shipping_status=?, tracking_id=?, logistic_type=? WHERE id=?",
        (ss, ti, lt, oid))
    updated += 1
    print(f'  {oid}: {ss} | {ti} | {lt}')

conn.commit()
print(f'\n更新了 {updated} 条')
conn.close()
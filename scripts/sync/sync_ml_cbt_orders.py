#!/usr/bin/env python3
"""
CBT 全球卖订单同步脚本 - 轻量版（防止 SIGKILL）
- 每次最多处理 30 个订单（足够增量更新）
- 所有 API 加 timeout，总运行不超过 60 秒
- 已有订单直接跳过
- order_date 统一存北京时间
"""
import requests, sqlite3, json, base64, os, signal, sys
from datetime import datetime, timezone, timedelta

DATA_DIR = '/home/admin/data'
PROJECT_ROOT = '/home/admin/yunfan-pro-dev'
# 确保 logs 目录存在（cron 重定向不会失败）
os.makedirs(os.path.join(PROJECT_ROOT, 'logs'), exist_ok=True)
TOKEN_FILE = os.path.join(DATA_DIR, 'ml_tokens.enc')
KEY_FILE = os.path.join(DATA_DIR, '.ml_token_key')
import socket
DATA_DIR = '/home/admin/data' if socket.gethostname() == 'iZj6chblbqrz1cmahnevj3Z' else PROJECT_ROOT
DB = os.path.join(DATA_DIR, 'mercadolibre.db')
MAX_ORDERS = 30  # 每次最多处理30个新订单
MAX_RUNTIME = 55  # 55秒强制退出

SITE_NAMES = {'MLB': '巴西', 'MLM': '墨西哥', 'MLA': '阿根廷', 'MCO': '哥伦比亚', 'MLC': '智利', 'MLU': '乌拉圭'}

def timeout_handler(signum, frame):
    print(f'[{datetime.now().strftime("%H:%M:%S")}] 超时 {MAX_RUNTIME}s，强制退出')
    sys.exit(0)

signal.signal(signal.SIGALRM, timeout_handler)
signal.alarm(MAX_RUNTIME)

def simple_decrypt(enc_data, key):
    key_bytes = key.encode()
    data_bytes = base64.b64decode(enc_data.encode())
    result = bytearray()
    for i in range(len(data_bytes)):
        result.append(data_bytes[i] ^ key_bytes[i % len(key_bytes)])
    return result.decode()

def load_tokens():
    key = open(KEY_FILE).read().strip()
    tokens = json.loads(simple_decrypt(open(TOKEN_FILE).read(), key))
    created_at = tokens.get('created_at', 0)
    expires_in = tokens.get('expires_in', 21600)
    import time
    if time.time() - created_at > expires_in - 3600:
        refreshed = requests.post('https://api.mercadolibre.com/oauth/token', data={
            'grant_type': 'refresh_token',
            'client_id': '8105299077213607',
            'refresh_token': tokens.get('refresh_token', '')
        }, timeout=10).json()
        if refreshed.get('access_token'):
            tokens['access_token'] = refreshed['access_token']
            tokens['created_at'] = time.time()
            key = open(KEY_FILE).read().strip()
            enc = simple_crypt(json.dumps(tokens), key)
            open(TOKEN_FILE, 'w').write(enc)
    return tokens

def simple_crypt(data, key):
    key_bytes = key.encode()
    data_bytes = data.encode()
    result = bytearray()
    for i in range(len(data_bytes)):
        result.append(data_bytes[i] ^ key_bytes[i % len(key_bytes)])
    return base64.b64encode(result).decode()

tokens = load_tokens()
at = tokens['access_token']
h = {'Authorization': f'Bearer {at}', 'x-format-new': 'true'}

def to_beijing(ts_str):
    if not ts_str:
        return ''
    try:
        dt = datetime.fromisoformat(ts_str.replace('Z', '+00:00'))
        bj = dt + timedelta(hours=12)
        return bj.strftime('%Y-%m-%dT%H:%M:%S')
    except:
        return ts_str[:19]

def write_monitor(conn, site_id, order_id, amount, status):
    msg = f'📦 新订单：{SITE_NAMES.get(site_id, site_id)} {order_id} 成交 ${amount:.2f}'
    details = json.dumps({'order_id': order_id, 'status': status, 'amount': amount, 'source': 'sync'}, ensure_ascii=False)
    c = conn.cursor()
    c.execute("SELECT 1 FROM monitoring_logs WHERE message LIKE ?", (f'%{order_id}%',))
    if not c.fetchone():
        c.execute("INSERT INTO monitoring_logs(level, store_id, site_id, message, details) VALUES('info', 3164139599, ?, ?, ?)",
                  (site_id, msg, details))

def sync():
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    new = 0
    processed = 0
    offset = 0
    LIMIT = 50

    while True:
        # 分页遍历所有订单，不再只看前30条
        url = f'https://api.mercadolibre.com/marketplace/orders/search?seller_id=3164139599&limit={LIMIT}&offset={offset}&sort=date_desc'
        try:
            r1 = requests.get(url, headers=h, timeout=10)
            data = r1.json()
            groups = data.get('results', [])
        except Exception as e:
            print(f'搜索失败: {e}')
            break

        if not groups:
            break

        for g in groups:
            for sub in g.get('orders', []):
                sid = str(sub['id'])
                processed += 1

                # 已有则跳过
                c.execute('SELECT id FROM orders_v2 WHERE id=?', (sid,))
                if c.fetchone():
                    continue

                try:
                    r2 = requests.get(f'https://api.mercadolibre.com/marketplace/orders/{sid}', headers=h, timeout=8)
                    if r2.status_code != 200:
                        continue
                except:
                    continue

                d = r2.json()
                items = d.get('order_items', [])
                site = items[0]['item']['id'][:3] if items and items[0].get('item', {}).get('id') else ''
                raw_date = d.get('date_created', '')
                amount = round(sum(i.get('quantity',1)*i.get('unit_price',0) for i in items), 2)
                status = d.get('status', '')
                product = items[0].get('item', {}).get('title', '') if items else ''
                seller_sku = items[0].get('item', {}).get('seller_sku', '') if items else ''
                thumbnail = items[0]['item']['id'] if items and items[0].get('item', {}).get('id') else ''
                qty = items[0].get('quantity', 1) if items else 1

                # 物流
                ship = {'shipping_status': '', 'tracking_id': '', 'logistic_type': '', 'shipping_substatus': ''}
                ship_id = d.get('shipping', {}).get('id')
                if ship_id:
                    try:
                        rs = requests.get(f'https://api.mercadolibre.com/marketplace/shipments/{ship_id}', headers=h, timeout=5)
                        if rs.status_code == 200:
                            sd = rs.json()
                            ship = {
                                'shipping_status': sd.get('status', ''),
                                'tracking_id': sd.get('tracking_number', '') or sd.get('tracking_id', ''),
                                'logistic_type': sd.get('logistic_type', ''),
                                'shipping_substatus': sd.get('substatus', ''),
                            }
                    except:
                        pass

                order_date_bj = to_beijing(raw_date)

                c.execute('''INSERT INTO orders_v2(id,user_id,site_id,order_date,product_name,quantity,amount,status,seller_sku,thumbnail,shipping_status,tracking_id,logistic_type,shipping_substatus)
VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
                          (sid, 1, site, order_date_bj, product, qty, amount, status, seller_sku, thumbnail,
                           ship['shipping_status'], ship['tracking_id'], ship['logistic_type'], ship['shipping_substatus']))
                write_monitor(conn, site, sid, amount, status)
                new += 1
                print(f'+ {sid} | {site} | {order_date_bj[:10]} | ${amount}')

        offset += LIMIT
        # 无更多结果则退出
        if len(groups) < LIMIT:
            break

    conn.commit()
    print(f'完成。处理 {processed} 个订单，新增 {new} 条')
    conn.close()

if __name__ == '__main__':
    print(f'[{datetime.now().strftime("%H:%M:%S")}] sync_ml_cbt_orders 启动（全量分页同步，{MAX_RUNTIME}s 超时）')
    sync()
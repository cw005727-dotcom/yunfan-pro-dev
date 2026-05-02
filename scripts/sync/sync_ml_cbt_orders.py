"""
CBT 全球卖订单同步脚本 v4
- 两步穿透：search 找子订单ID → marketplace/orders/{id} 拿详情
- 增量写入：已存在的跳过
- 同时写 monitoring_logs 供前端监控播报
- order_date 统一存北京时间
- 物流数据：加 x-format-new: true，从 shipping.id 穿透查 /marketplace/shipments/{id}
"""
import requests, sqlite3, json, base64, os
from datetime import datetime, timezone, timedelta

PROJECT_ROOT = '/home/admin/yunfan-pro-dev'
TOKEN_FILE = os.path.join(PROJECT_ROOT, 'ml_tokens.enc')
KEY_FILE = os.path.join(PROJECT_ROOT, '.ml_token_key')
DB = os.path.join(PROJECT_ROOT, 'mercadolibre.db')

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
    # 检查是否快过期
    created_at = tokens.get('created_at', 0)
    expires_in = tokens.get('expires_in', 21600)
    import time
    if time.time() - created_at > expires_in - 3600:
        # refresh
        refreshed = requests.post('https://api.mercadolibre.com/oauth/token', data={
            'grant_type': 'refresh_token',
            'client_id': '8105299077213607',
            'refresh_token': tokens.get('refresh_token', '')
        }, timeout=10).json()
        if refreshed.get('access_token'):
            tokens['access_token'] = refreshed['access_token']
            tokens['created_at'] = time.time()
            if refreshed.get('refresh_token'):
                tokens['refresh_token'] = refreshed['refresh_token']
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

SITE_NAMES = {'MLB': '巴西', 'MLM': '墨西哥', 'MLA': '阿根廷', 'MCO': '哥伦比亚', 'MLC': '智利', 'MLU': '乌拉圭'}

def to_beijing(ts_str):
    if not ts_str:
        return ''
    try:
        dt = datetime.fromisoformat(ts_str.replace('Z', '+00:00'))
        bj = dt + timedelta(hours=12)
        return bj.strftime('%Y-%m-%dT%H:%M:%S')
    except:
        return ts_str[:19]

def write_monitor(c, site_id, order_id, amount, status):
    msg = f'📦 新订单：{SITE_NAMES.get(site_id, site_id)} {order_id} 成交 ${amount:.2f}'
    details = json.dumps({'order_id': order_id, 'status': status, 'amount': amount, 'source': 'sync'}, ensure_ascii=False)
    c.execute("SELECT 1 FROM monitoring_logs WHERE message LIKE ?", (f'%{order_id}%',))
    if not c.fetchone():
        c.execute("""INSERT INTO monitoring_logs(level, store_id, site_id, message, details)
VALUES('info', 3164139599, ?, ?, ?)""",
                  (site_id, msg, details))

def get_shipment(order_json):
    sid = order_json.get('shipping', {}).get('id')
    if not sid:
        return {}
    r = requests.get(f'https://api.mercadolibre.com/marketplace/shipments/{sid}', headers=h, timeout=10)
    if r.status_code != 200:
        return {}
    sd = r.json()
    return {
        'tracking_id': sd.get('tracking_number') or sd.get('tracking_id', ''),
        'logistic_type': sd.get('logistic_type', ''),
        'shipping_status': sd.get('status', ''),
        'shipping_substatus': sd.get('substatus', ''),
    }

def sync(limit=50):
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    new = 0

    for offset in range(0, 200, limit):
        url = f'https://api.mercadolibre.com/marketplace/orders/search?seller_id=3164139599&limit={limit}&offset={offset}&sort=date_desc'
        r1 = requests.get(url, headers=h, timeout=30)
        groups = r1.json().get('results', [])
        if not groups:
            break

        for g in groups:
            for sub in g.get('orders', []):
                sid = str(sub['id'])
                r2 = requests.get(f'https://api.mercadolibre.com/marketplace/orders/{sid}', headers=h, timeout=10)
                if r2.status_code != 200:
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

                ship = get_shipment(d)
                order_date_bj = to_beijing(raw_date)

                c.execute('SELECT id FROM orders_v2 WHERE id=?', (sid,))
                if c.fetchone():
                    continue

                c.execute('''INSERT INTO orders_v2(id,user_id,site_id,order_date,product_name,quantity,amount,status,seller_sku,thumbnail,shipping_status,tracking_id,logistic_type,shipping_substatus)
VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
                          (sid, 1, site, order_date_bj, product, qty, amount, status, seller_sku, thumbnail,
                           ship.get('shipping_status', ''), ship.get('tracking_id', ''), ship.get('logistic_type', ''), ship.get('shipping_substatus', '')))
                write_monitor(c, site, sid, amount, status)
                new += 1
                print(f'+ {sid} | {site} | {order_date_bj[:10]} | ${amount} | {ship.get("shipping_status","")} | {ship.get("tracking_id","")}')

        conn.commit()
        print(f'offset {offset}: +{new} new')

    print(f'完成。新增: {new} 条')
    conn.close()

if __name__ == '__main__':
    sync()
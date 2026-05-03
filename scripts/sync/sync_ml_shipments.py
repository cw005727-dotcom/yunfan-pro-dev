#!/usr/bin/env python3
"""
sync_ml_shipments.py — 同步物流基础字段到 orders_v2

从 /marketplace/orders/{id} 拿 shipping.id，再调 /marketplace/shipments/{id}
更新 orders_v2 的：shipping_status / tracking_id / logistic_type / logistic_company
                   / tracking_status / receiver_city / receiver_state / estimated_delivery_date

限速 200ms/请求，每批30条

cron: */15 * * * *
"""
import os, sys, json, base64, time, sqlite3, requests, socket

def decrypt(enc, key):
    kb = key.encode()
    db = base64.b64decode(enc.encode())
    return ''.join(chr(db[i] ^ kb[i % len(kb)]) for i in range(len(db)))

DATA_DIR = '/home/admin/data' if socket.gethostname() == 'iZj6chblbqrz1cmahnevj3Z' else os.path.dirname(os.path.abspath(__file__))

KEY_FILE = os.path.join(DATA_DIR, '.ml_token_key')
ENC_FILE = os.path.join(DATA_DIR, 'ml_tokens.enc')
DB_FILE  = os.path.join(DATA_DIR, 'mercadolibre.db')

def load_token():
    key = open(KEY_FILE).read().strip()
    tok = json.loads(decrypt(open(ENC_FILE).read(), key))
    return tok['access_token']

def parse_shipment(sd):
    """从 shipments API 响应提取所有物流字段"""
    addr = sd.get('destination', {}).get('shipping_address', {})
    city = addr.get('city', {})
    # pay_before = 最晚发货时间（shipping_option.estimated_delivery_time.pay_before）
    lead = sd.get('lead_time', {})
    est  = lead.get('estimated_delivery_time', {})
    pay_before = est.get('pay_before', '') if isinstance(est, dict) else ''

    city_name = city.get('name', '') if isinstance(city, dict) else ''
    state_name = state.get('name', '') if isinstance(state, dict) else ''

    return {
        'logistic_type':          logistic.get('type', '') if isinstance(logistic, dict) else '',
        'logistic_company':       sd.get('tracking_method', '') or '',
        'tracking_id':            sd.get('tracking_number', '') or sd.get('tracking_id', '') or '',
        'shipping_status':        sd.get('status', '') or '',
        'shipping_substatus':     sd.get('substatus', '') or '',
        'tracking_status':        sd.get('status', '') or '',
        'receiver_city':          city_name,
        'receiver_state':          state_name,
        'estimated_delivery_date': est.get('date', '') or '',
        'last_ship_date':         pay_before,
    }

def sync_batch(cursor, orders, token):
    """处理一批订单，写入所有物流字段"""
    updated = 0
    skipped = 0
    errors  = 0

    for order in orders:
        oid = order['id']
        # 跳过已有数据的订单（避免重复请求 API）
        if order.get('logistic_company') and order.get('tracking_status'):
            skipped += 1
            continue

        # Step 1: 拿 shipment_id
        r1 = requests.get(
            f'https://api.mercadolibre.com/marketplace/orders/{oid}',
            headers={'Authorization': f'Bearer {token}', 'x-format-new': 'true'},
            timeout=15
        )
        if r1.status_code == 429:
            print(f'    ⚠️  429，等10秒...')
            time.sleep(10)
            continue
        if r1.status_code != 200:
            errors += 1
            print(f'    ❌ orders API {r1.status_code}: {oid}')
            continue

        ship_id = r1.json().get('shipping', {}).get('id')
        if not ship_id:
            skipped += 1
            continue

        # Step 2: 拿 shipment 详情
        r2 = requests.get(
            f'https://api.mercadolibre.com/marketplace/shipments/{ship_id}',
            headers={'Authorization': f'Bearer {token}', 'x-format-new': 'true'},
            timeout=15
        )
        if r2.status_code == 429:
            print(f'    ⚠️  429，等10秒...')
            time.sleep(10)
            continue
        if r2.status_code != 200:
            errors += 1
            print(f'    ❌ shipments API {r2.status_code}: {oid}')
            continue

        p = parse_shipment(r2.json())

        cursor.execute("""
            UPDATE orders_v2 SET
                logistic_type           = ?,
                logistic_company        = ?,
                tracking_id             = COALESCE(NULLIF(?, ''), tracking_id),
                shipping_status         = ?,
                shipping_substatus     = COALESCE(NULLIF(?, ''), shipping_substatus),
                tracking_status         = ?,
                receiver_city           = ?,
                receiver_state          = ?,
                estimated_delivery_date = ?,
                last_ship_date          = ?
            WHERE id = ?
        """, (
            p['logistic_type'],
            p['logistic_company'],
            p['tracking_id'],
            p['shipping_status'],
            p['shipping_substatus'],
            p['tracking_status'],
            p['receiver_city'],
            p['receiver_state'],
            p['estimated_delivery_date'],
            p['last_ship_date'],
            oid
        ))
        updated += 1
        print(f'  ✅ {oid} | {p["logistic_company"]} | {p["shipping_status"]} | {p["receiver_city"]}')

        time.sleep(0.2)

    return updated, skipped, errors


def main():
    print(f"\n{'='*60}")
    print(f"🚚 物流基础字段同步")
    print(f"   时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    token = load_token()

    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # 找出需要同步的订单（有 tracking_id 但缺 logistic_company）
    c.execute("""
        SELECT id, tracking_id, logistic_company, tracking_status
        FROM orders_v2
        WHERE tracking_id IS NOT NULL AND tracking_id != ''
          AND (logistic_company IS NULL OR logistic_company = '')
        ORDER BY order_date DESC
        LIMIT 100
    """)
    orders = [dict(r) for r in c.fetchall()]
    total = len(orders)
    print(f"📦 待同步: {total} 条\n")

    if total == 0:
        print("✅ 无需同步，退出")
        conn.close()
        return

    BATCH = 30
    total_updated = 0
    total_skipped = 0
    total_errors  = 0

    for i in range(0, total, BATCH):
        batch = orders[i:i+BATCH]
        print(f"📤 批次 {i//BATCH+1}/{(total+BATCH-1)//BATCH} ({len(batch)} 条)...")
        u, s, e = sync_batch(c, batch, token)
        total_updated += u
        total_skipped += s
        total_errors  += e
        conn.commit()

    print(f"\n{'='*60}")
    print(f"📊 完成: ✅{total_updated} ⏭️{total_skipped} ❌{total_errors}")
    print(f"{'='*60}\n")
    conn.close()


if __name__ == '__main__':
    main()
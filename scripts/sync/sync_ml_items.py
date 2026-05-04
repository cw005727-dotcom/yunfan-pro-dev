#!/usr/bin/env python3
"""
同步各站点在售商品数据到 product_metrics
从 orders_v2 提取 item_id，调用 /marketplace/items/{id} + /visits/items
写入: name/start_time/price/status/thumbnail/exposure/logistic_type/currency/site_id
"""
import sys, time
sys.path.insert(0, '/home/admin/yunfan-pro-dev/scripts')
from utils.token_manager import load_tokens
import requests, sqlite3
from datetime import datetime, timezone, timedelta

DB_FILE = '/home/admin/data/mercadolibre.db'
BJ_TZ = timezone(timedelta(hours=8))

def now_bj():
    return datetime.now(BJ_TZ)

def parse_item(d, item_id):
    """从 items API 提取需要字段"""
    pics = d.get('pictures', []) or []
    thumb = d.get('thumbnail', '') or ''
    if pics and not thumb:
        thumb = pics[0].get('url', '') if isinstance(pics[0], dict) else str(pics[0])

    shipping = d.get('shipping', {}) or {}
    log_type = shipping.get('logistic_type', '') or ''

    price = d.get('price')
    currency = d.get('currency_id', '')

    date_str = d.get('date_created', '')
    start_time = ''
    if date_str:
        try:
            dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            start_time = dt.astimezone(BJ_TZ).strftime('%Y-%m-%d %H:%M:%S')
        except:
            pass

    return {
        'item_id':    item_id,
        'name':       d.get('title', '') or '',
        'price':      price,
        'currency':   currency,
        'status':     d.get('status', '') or '',
        'sub_status': str(d.get('sub_status', []) or []),
        'thumbnail':  thumb,
        'start_time': start_time,
        'logistic_type': log_type,
        'site_id':    d.get('site_id', '') or '',
        'sales':      d.get('sold_quantity', 0) or 0,
    }

def fetch_exposure(item_id, headers):
    """拉曝光量"""
    try:
        r = requests.get(
            'https://api.mercadolibre.com/visits/items?ids=' + item_id,
            headers=headers, timeout=6
        )
        if r.status_code == 200:
            return r.json().get(item_id, 0)
    except:
        pass
    return 0

def upsert_metrics(cur, data, now_str):
    """UPSERT into product_metrics"""
    cur.execute("""
        INSERT INTO product_metrics
          (item_id, name, price, currency, status, sub_status, thumbnail,
           start_time, logistic_type, site_id, sales, exposure, last_updated)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(item_id) DO UPDATE SET
          name = excluded.name,
          price = excluded.price,
          currency = excluded.currency,
          status = excluded.status,
          sub_status = excluded.sub_status,
          thumbnail = excluded.thumbnail,
          start_time = excluded.start_time,
          logistic_type = excluded.logistic_type,
          sales = excluded.sales,
          exposure = excluded.exposure,
          last_updated = excluded.last_updated
    """, (
        data['item_id'], data['name'], data['price'], data['currency'],
        data['status'], data['sub_status'], data['thumbnail'],
        data['start_time'], data['logistic_type'], data['site_id'],
        data['sales'], data['exposure'], now_str
    ))

def main():
    token = load_tokens().get('access_token')
    if not token:
        print('no token')
        return
    h = {'Authorization': f'Bearer {token}', 'x-format-new': 'true'}
    visit_h = {'Authorization': f'Bearer {token}'}

    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()

    now_str = now_bj().strftime('%Y-%m-%d %H:%M:%S')
    sites = ['MLB', 'MLM', 'MCO', 'MLA', 'MLC', 'MLU']
    total = 0

    for site in sites:
        cur.execute("""
            SELECT DISTINCT thumbnail FROM orders_v2
            WHERE site_id = ? AND thumbnail IS NOT NULL AND thumbnail != ''
        """, (site,))
        items = [r[0] for r in cur.fetchall()]
        if not items:
            print(f'[{site}] no items')
            continue

        print(f'[{site}] syncing {len(items)} items...')
        done = 0

        for item_id in items:
            try:
                r = requests.get(
                    f'https://api.mercadolibre.com/marketplace/items/{item_id}',
                    headers=h, timeout=8
                )
                if r.status_code == 429:
                    time.sleep(3)
                    r = requests.get(
                        f'https://api.mercadolibre.com/marketplace/items/{item_id}',
                        headers=h, timeout=8
                    )
                if r.status_code != 200:
                    print(f'  x {item_id}: {r.status_code}')
                    time.sleep(0.3)
                    continue

                d = r.json()
                parsed = parse_item(d, item_id)
                parsed['exposure'] = fetch_exposure(item_id, visit_h)

                upsert_metrics(cur, parsed, now_str)
                conn.commit()
                done += 1

                name_short = parsed['name'][:20] if parsed['name'] else ''
                print(f'  ok {item_id} | {name_short} | exp:{parsed["exposure"]}')

                time.sleep(0.5)

            except Exception as e:
                print(f'  err {item_id}: {e}')
                time.sleep(0.3)
                continue

        print(f'[{site}] done {done}/{len(items)}')
        total += done

    print(f'total: {total} items')
    conn.close()

if __name__ == '__main__':
    main()
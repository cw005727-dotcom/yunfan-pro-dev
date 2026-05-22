#!/usr/bin/env python3
"""
Mac本地同步脚本 - 从 /marketplace/users/{seller_id}/items/search 拉全量商品
写入: item_id(SKU) / name / image_url(主图) / start_time(上架时间) / status / exposure / sales / seller_sku
"""
import sys
import time
import sqlite3
import requests
import urllib3
from datetime import datetime, timezone, timedelta

urllib3.disable_warnings()

# ── Mac 本地配置 ──────────────────────────────────────────
DB_FILE = '/Users/chensan/Library/CloudStorage/OneDrive-个人/Mac 资料/YunfanV2/mercadolibre.db'
LOG_FILE = '/Users/chensan/Library/CloudStorage/OneDrive-个人/Mac 资料/YunfanV2/logs/sync_ml_items.log'
# ─────────────────────────────────────────────────────────

# 站点配置：(site_id, seller_id, 站点名)
SITES = [
    ('MLM', 3164142227, '墨西哥'),
    ('MLB', 3164144051, '巴西'),
    ('MCO', 3164142229, '哥伦比亚'),
    ('MLA', 3164144057, '阿根廷'),
    ('MLU', 3186965280, '乌拉圭'),
    ('MLC', 3164141055, '智利'),
]

BJ_TZ = timezone(timedelta(hours=8))
RATE_LIMIT = 2.0   # 每请求间隔（秒），Mac 住宅 IP 限流宽松
MAX_RETRIES = 5


def log(msg):
    ts = datetime.now(BJ_TZ).strftime('%Y-%m-%d %H:%M:%S')
    line = f'[{ts}] {msg}'
    print(line)
    with open(LOG_FILE, 'a') as f:
        f.write(line + '\n')


def now_bj():
    return datetime.now(BJ_TZ).strftime('%Y-%m-%d %H:%M:%S')


# ── Session (Mac SSL 兼容) ─────────────────────────────────
SESSION = requests.Session()
SESSION.verify = False
SESSION.headers.update({'User-Agent': 'Mozilla/5.0'})

def get_token():
    sys.path.insert(0, '/Users/chensan/Library/CloudStorage/OneDrive-个人/Mac 资料/YunfanV2/scripts')
    from utils.token_manager import load_tokens
    return load_tokens().get('access_token', '')


def safe_get(url, params=None, timeout=20):
    """带自动重试的 GET，遇到429自动等10秒再试"""
    for attempt in range(MAX_RETRIES):
        try:
            r = SESSION.get(url, params=params, headers={
                'Authorization': f'Bearer {TOKEN}'
            }, timeout=timeout)
            if r.status_code == 429:
                retry_after = int(r.headers.get('Retry-After', 10))
                print(f'  [RATELIMIT] attempt {attempt+1}/{MAX_RETRIES}, wait {retry_after}s...')
                time.sleep(retry_after)
                continue
            return r
        except requests.exceptions.Timeout:
            print(f'  [TIMEOUT] attempt {attempt+1}/{MAX_RETRIES}: {url}')
            time.sleep(3)
        except Exception as e:
            print(f'  [ERR] {url}: {e}')
            return type('R', (), {'status_code': 0, 'json': lambda: {}})()
    return type('R', (), {'status_code': 0, 'json': lambda: {}})()


def fetch_item_ids(seller_id, site_id):
    """拉全量商品ID"""
    all_ids = []
    offset = 0
    limit = 100
    log(f'[{site_id}] 正在获取商品列表 (seller={seller_id})...')

    while True:
        r = safe_get(
            f'https://api.mercadolibre.com/marketplace/users/{seller_id}/items/search',
            params={'site_id': site_id, 'limit': limit, 'offset': offset},
            timeout=30
        )
        if r.status_code == 429:
            log(f'[{site_id}] list 429, sleep 8s...')
            time.sleep(8)
            continue
        if r.status_code != 200:
            log(f'[{site_id}] list HTTP {r.status_code} offset={offset}')
            break

        ids = r.json().get('results', [])
        all_ids.extend(ids)
        offset += limit

        if len(ids) < limit:
            break
        time.sleep(RATE_LIMIT)

    log(f'[{site_id}] 共 {len(all_ids)} 个商品ID')
    return all_ids


def fetch_item(item_id):
    """拉单个商品详情 + 曝光量"""
    time.sleep(RATE_LIMIT)  # 每次拉详情前等够间隔
    
    # 1. 商品详情
    r = safe_get(f'https://api.mercadolibre.com/marketplace/items/{item_id}', timeout=15)
    if r.status_code != 200:
        return None

    d = r.json()

    # 2. 曝光量（可选，不阻塞主流程）
    exposure = 0
    vr = safe_get(f'https://api.mercadolibre.com/visits/items?ids={item_id}', timeout=8)
    if vr.status_code == 200:
        exposure = vr.json().get(item_id, 0)

    # 3. 解析字段
    pics = d.get('pictures', []) or []
    thumb = d.get('thumbnail', '') or ''
    if not thumb and pics:
        p = pics[0]
        thumb = p.get('url', '') if isinstance(p, dict) else str(p)

    date_str = d.get('date_created', '')
    start_ts = 0
    if date_str:
        try:
            dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            start_ts = int(dt.timestamp())
        except:
            pass

    # 4. SKU (seller_custom_field / SELLER_SKU)
    seller_sku = ''
    attrs = d.get('attributes', []) or []
    for attr in attrs:
        if attr.get('id') == 'SELLER_SKU':
            seller_sku = str(attr.get('value_name', ''))
            break

    return {
        'item_id':      item_id,
        'name':         d.get('title', '') or '',
        'status':       d.get('status', '') or '',
        'image_url':    thumb,
        'start_time':   start_ts,
        'sales':        d.get('sold_quantity', 0) or 0,
        'price':        d.get('price'),
        'currency':     d.get('currency_id', ''),
        'site_id':      d.get('site_id', '') or '',
        'exposure':     exposure,
        'seller_sku':    seller_sku,
    }


def upsert_metrics(cur, data, now_str):
    cur.execute("""
        INSERT INTO product_metrics
          (item_id, name, status, image_url, start_time, sales, price, currency, site_id, exposure, seller_sku, last_updated)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(item_id) DO UPDATE SET
          name = excluded.name,
          status = excluded.status,
          image_url = excluded.image_url,
          start_time = excluded.start_time,
          sales = excluded.sales,
          price = excluded.price,
          currency = excluded.currency,
          exposure = excluded.exposure,
          seller_sku = excluded.seller_sku,
          last_updated = excluded.last_updated
    """, (
        data['item_id'], data['name'], data['status'], data['image_url'],
        data['start_time'], data['sales'], data['price'], data['currency'],
        data['site_id'], data['exposure'], data['seller_sku'], now_str
    ))


def main():
    global TOKEN
    TOKEN = get_token()
    if not TOKEN:
        log('[FATAL] 未找到 access_token')
        return

    log(f'[START] 开始同步商品，token: {TOKEN[:20]}...')
    now_str = now_bj()
    total_all = 0

    # 确保日志目录存在
    import os
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()

    # 确保 seller_sku 列存在
    try:
        cur.execute("ALTER TABLE product_metrics ADD COLUMN seller_sku TEXT")
        conn.commit()
        log('[DB] added seller_sku column')
    except Exception:
        pass

    for site_id, seller_id, site_name in SITES:
        log(f'\n=== [{site_id}] {site_name} ===')
        item_ids = fetch_item_ids(seller_id, site_id)
        if not item_ids:
            log(f'[{site_id}] 无商品')
            continue

        done = 0
        failed = 0
        for i, item_id in enumerate(item_ids):
            detail = fetch_item(item_id)
            if detail is None:
                failed += 1
                time.sleep(2)
                continue

            upsert_metrics(cur, detail, now_str)
            conn.commit()
            done += 1

            if done % 50 == 0:
                log(f'  [{site_id}] 已处理 {done}/{len(item_ids)}，失败 {failed}')

            time.sleep(RATE_LIMIT)

        log(f'[{site_id}] 完成 {done}/{len(item_ids)}（失败 {failed}）')
        total_all += done

    # 汇总
    cur.execute("SELECT site_id, COUNT(*), SUM(exposure), SUM(sales) FROM product_metrics GROUP BY site_id ORDER BY site_id")
    log('\n=== 同步结果 ===')
    for row in cur.fetchall():
        log(f'  {row[0]}: {row[1]}品, {row[2] or 0}曝光, {row[3] or 0}销量')

    conn.close()
    log(f'\n[END] 总计: {total_all} 个商品同步完成')


if __name__ == '__main__':
    main()
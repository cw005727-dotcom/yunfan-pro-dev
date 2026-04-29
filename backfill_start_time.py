#!/usr/bin/env python3
"""
回填 product_metrics.start_time（并发优化版）
数据源: /marketplace/items/{id} 的 date_created 字段
覆盖: 所有 start_time IS NULL OR start_time = 0 的品
"""
import requests, sqlite3, time, json, sys
from datetime import datetime
from token_manager import load_tokens

def parse_ml_date(dc):
    """解析 ML API 返回的 date_created，兼容 Z / +00:00 / .53ms 等格式"""
    if not dc:
        return None
    dc = dc.replace('+00:00', 'Z').replace('+0000', 'Z')
    if '.' in dc:
        main, rest = dc.split('.', 1)
        if 'Z' in rest:
            ms = rest.replace('Z', '').ljust(3, '0')[:3]
            dc = main + '.' + ms + 'Z'
    try:
        return datetime.fromisoformat(dc.replace('Z', '+00:00'))
    except:
        return None
from concurrent.futures import ThreadPoolExecutor, as_completed

BATCH_REPORT = 200
MAX_WORKERS = 10  # 并发数
REQUEST_PAUSE = 0.15  # 每请求间隔（秒）

def fetch_date_created(args):
    item_id, site_id = args
    token = load_tokens()['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    url = f'https://api.mercadolibre.com/marketplace/items/{item_id}'
    try:
        r = requests.get(url, headers=headers, timeout=15)
        if r.status_code == 200:
            d = r.json()
            dc = d.get('date_created')
            dt = parse_ml_date(dc)
            if dt:
                return item_id, int(dt.timestamp() * 1000), dc
        return item_id, None, f'status={r.status_code}'
    except Exception as e:
        return item_id, None, str(e)

def main():
    conn = sqlite3.connect('mercadolibre.db')
    c = conn.cursor()

    # 确保 start_time 列存在
    c.execute("PRAGMA table_info(product_metrics)")
    cols = [row[1] for row in c.fetchall()]
    if 'start_time' not in cols:
        c.execute("ALTER TABLE product_metrics ADD COLUMN start_time INTEGER DEFAULT 0")
        conn.commit()
        print("新增 start_time 列")

    c.execute("""
        SELECT item_id, site_id 
        FROM product_metrics 
        WHERE start_time IS NULL OR start_time = 0
        ORDER BY site_id
    """)
    items = c.fetchall()
    print(f"待回填: {len(items)}条 (并发{MAX_WORKERS})")
    print(f"预计: {len(items) * REQUEST_PAUSE / MAX_WORKERS:.0f}秒")

    updated = 0
    failed = []
    start = time.time()

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = {pool.submit(fetch_date_created, item): item for item in items}
        for future in as_completed(futures):
            item_id, ts, info = future.result()
            if ts:
                c.execute(
                    "UPDATE product_metrics SET start_time = ? WHERE item_id = ?",
                    (ts, item_id)
                )
                updated += 1
            else:
                failed.append((item_id, info))

            if updated % 500 == 0:
                conn.commit()
                elapsed = time.time() - start
                rate = updated / elapsed
                remaining = (len(items) - updated) / rate if rate > 0 else 0
                print(f"  {updated}/{len(items)} (剩{remaining:.0f}秒, {len(failed)}失败)")

    conn.commit()

    elapsed = time.time() - start
    c.execute("""
        SELECT site_id, COUNT(*) 
        FROM product_metrics 
        WHERE start_time IS NOT NULL AND start_time > 0
        GROUP BY site_id
    """)
    print(f"\n回填完成 ({elapsed:.0f}秒):")
    for r in c.fetchall():
        print(f"  {r[0]}: {r[1]}条有start_time")
    print(f"成功: {updated}条 | 失败: {len(failed)}条")
    if failed[:10]:
        print("失败样本:")
        for item_id, info in failed[:10]:
            print(f"  {item_id}: {info}")

    conn.close()

if __name__ == '__main__':
    main()

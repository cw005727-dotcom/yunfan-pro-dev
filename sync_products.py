#!/usr/bin/env python3
"""
同步大姐店所有站点的真实在售商品（内存安全版）
策略：5并发 + 每200条提交 + 及时释放
"""

import re
import requests
import sqlite3
import time
import gc
from datetime import datetime
from token_manager import load_tokens
from concurrent.futures import ThreadPoolExecutor, as_completed

DB_PATH = "/Users/chensan/yunfan-pro-dev/mercadolibre.db"

SITES = {
    "MCO": 3164142229,
    "MLA": 3164144057,
    "MLB": 3164144051,
    "MLM": 3164142227,
    "MLU": 3186965280,
}

TOKEN = None
MAX_WORKERS = 5      # 并发降为5，省内存
BATCH_COMMIT = 200   # 每200条提交一次，避免SQLite事务过大

def get_token():
    global TOKEN
    if TOKEN is None:
        TOKEN = load_tokens()['access_token']
    return TOKEN

def fetch_item(item_id):
    """拉单个商品详情"""
    try:
        token = get_token()
        headers = {"Authorization": f"Bearer {token}"}
        r = requests.get(
            f"https://api.mercadolibre.com/marketplace/items/{item_id}",
            headers=headers, timeout=20
        )
        if r.status_code in (200, 206):
            return item_id, r.json()
    except Exception:
        pass
    return item_id, None

def get_items_list(seller_id, site_id):
    """获取 seller 所有商品 item_id"""
    url = f"https://api.mercadolibre.com/marketplace/users/{seller_id}/items/search"
    all_ids = []
    page_count = 0

    while True:
        token = get_token()
        headers = {"Authorization": f"Bearer {token}"}
        if page_count == 0:
            params = {"search_type": "scan", "limit": 100}
        else:
            params = {"search_type": "scan", "scroll_id": scroll_id, "limit": 100}

        resp = requests.get(url, headers=headers, params=params, timeout=30)
        if resp.status_code != 200:
            break

        data = resp.json()
        ids = data.get("results", [])
        all_ids.extend(ids)
        page_count += 1

        total = data.get("paging", {}).get("total", "?")
        print(f"  [{site_id}] 第{page_count}页: +{len(ids)}, 累计{len(all_ids)}/{total}")

        scroll_id = data.get("scroll_id")
        if not scroll_id:
            break
        if page_count > 500:
            break
        time.sleep(0.5)

    return all_ids

def save_batch(items, site_id):
    """批量写入 product_metrics"""
    if not items:
        return 0
    conn = sqlite3.connect(DB_PATH, timeout=30)
    cursor = conn.cursor()
    now = int(time.time())
    saved = 0

    for item_id, detail in items:
        if not detail:
            continue
        title = detail.get("title", "")[:500]
        price = detail.get("price", 0) or 0
        pictures = detail.get("pictures", [])
        image_url = pictures[0].get("url", "") if pictures else detail.get("thumbnail", "")
        status = detail.get("status", "")
        sold_qty = detail.get("sold_quantity", 0) or 0
        category_id = detail.get("category_id", "")

        # date_created → start_time (毫秒时间戳)
        date_created = detail.get("date_created", "") or ""
        start_ts = 0
        if date_created:
            try:
                # Normalize: "2026-03-29T06:06:43.52+00:00" → "2026-03-29T06:06:43.520000+00:00"
                dc = re.sub(r'\.(\d{1,5})(\+\d{2}:\d{2})',
                    lambda m: '.' + m.group(1).ljust(6,'0') + m.group(2),
                    date_created)
                dc = dc.replace('Z', '+00:00')
                dt = datetime.fromisoformat(dc)
                start_ts = int(dt.timestamp() * 1000)
            except Exception:
                pass

        cursor.execute("""
            INSERT OR REPLACE INTO product_metrics
            (item_id, name, price, image_url, site_id, status, sales, last_updated,
             exposure, clicks, carts, cart_rate, returns, claims, health_score,
             price_index, category_avg_rate, logistic_type, is_core, start_time,
             currency, sub_status, trend_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0.0, 0, 0, 0, 0.0, 0.0, '', 0, ?, '', ?, 0.0)
        """, (item_id, title, price, image_url, site_id, status, sold_qty, now, start_ts, category_id))
        saved += 1

    conn.commit()
    conn.close()
    return saved

def sync_site(site_id, seller_id):
    """同步单个站点"""
    print(f"\n[{site_id}] seller_id={seller_id}")

    item_ids = get_items_list(seller_id, site_id)
    if not item_ids:
        print(f"  → 无商品")
        return 0

    print(f"  ✓ 共 {len(item_ids)} 个商品，5并发拉详情...")

    saved = 0
    batch = []

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(fetch_item, i): i for i in item_ids}

        for future in as_completed(futures):
            item_id, detail = future.result()
            if detail:
                batch.append((item_id, detail))

            # 每 BATCH_COMMIT 条写一次
            if len(batch) >= BATCH_COMMIT:
                saved += save_batch(batch, site_id)
                print(f"  进度: {saved}/{len(item_ids)}")
                batch = []
                gc.collect()  # 及时释放内存

        # 剩余的
        if batch:
            saved += save_batch(batch, site_id)

    print(f"  ✅ {site_id}: {saved} 个商品")
    gc.collect()
    return saved

def main():
    print("=" * 50)
    print("大姐店商品同步（内存安全版）")
    print("=" * 50)

    total = 0
    for site_id, seller_id in SITES.items():
        total += sync_site(site_id, seller_id)
        time.sleep(2)  # 站点间稍作喘息

    print(f"\n总计: {total} 个商品")

    # 汇总
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT site_id, COUNT(*) FROM product_metrics GROUP BY site_id ORDER BY site_id")
    for r in c.fetchall():
        print(f"  {r[0]}: {r[1]}")
    conn.close()

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""补全 product_metrics.start_time 字段"""
import sqlite3, requests, time
from token_manager import load_tokens

BATCH = 50
RATE_MS = 200

conn = sqlite3.connect('mercadolibre.db')
c = conn.cursor()

# 只取没有 start_time 的商品
c.execute("SELECT item_id, site_id FROM product_metrics WHERE start_time IS NULL OR start_time = 0")
all_items = [(r[0], r[1]) for r in c.fetchall()]
print(f"需要补全 start_time 的商品: {len(all_items)} 条")

token = load_tokens()['access_token']
print(f"Token: {token[:35]}...")

updated = 0
errors = 0
total = len(all_items)

print(f"\n开始批量拉取 (分批 {BATCH})...")

for i in range(0, total, BATCH):
    batch = all_items[i:i+BATCH]
    batch_errors = 0

    for item_id, site_id in batch:
        url = f"https://api.mercadolibre.com/items/{item_id}"
        for attempt in range(3):
            try:
                r = requests.get(url, headers={"Authorization": f"Bearer {token}"}, timeout=10)
                if r.status_code == 200:
                    data = r.json()
                    start_time = data.get('start_time') or data.get('date_created')
                    if start_time:
                        c.execute("UPDATE product_metrics SET start_time = ? WHERE item_id = ?", (start_time, item_id))
                        updated += 1
                    break
                elif r.status_code == 404:
                    # 商品不存在，标记为 0
                    break
                elif r.status_code == 429:
                    time.sleep(10)
                    continue
                else:
                    break
            except (requests.exceptions.SSLError, requests.exceptions.ConnectionError):
                if attempt < 2:
                    time.sleep(5)
                    continue
                batch_errors += 1
                break

    done = min(i + BATCH, total)
    print(f"  进度 {done}/{total} | 已更新 {updated} | 错误 {batch_errors}")
    time.sleep(RATE_MS / 1000)

conn.commit()

# 验证
c.execute("SELECT count(*) FROM product_metrics WHERE start_time IS NOT NULL AND start_time != 0")
print(f"\n✅ 有 start_time 的商品: {c.fetchone()[0]} 条")

c.execute("SELECT count(*) FROM product_metrics WHERE start_time IS NULL OR start_time = 0")
print(f"❌ 仍无 start_time: {c.fetchone()[0]} 条")

conn.close()
print("完成!")

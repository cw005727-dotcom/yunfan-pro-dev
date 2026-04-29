#!/usr/bin/env python3
"""修复 product_metrics_history: 清理脏数据 + 写入今日访客快照"""
import sqlite3, requests, time
from datetime import datetime, timedelta
from token_manager import load_tokens

BATCH = 200
RATE_MS = 150
today = "2026-04-29"

conn = sqlite3.connect('mercadolibre.db')
c = conn.cursor()

# ── Step 1: 清理 4/27 脏数据 ─────────────────────────────────────
c.execute("DELETE FROM product_metrics_history WHERE record_date = '2026-04-27' AND exposure > 5000")
before = c.rowcount
print(f"删除4/27脏数据(exposure>5000): {before}条")
conn.commit()

# ── Step 2: 删除今天旧记录（幂等） ──────────────────────────────
c.execute("DELETE FROM product_metrics_history WHERE record_date = ?", (today,))
print(f"清除4/29旧记录: {c.rowcount}条")
conn.commit()

# ── Step 3: 获取 token ─────────────────────────────────────────
token = load_tokens()['access_token']
print(f"Token: {token[:35]}...")

# ── Step 4: 获取所有需要写历史的 item_id ────────────────────────
# 只取 product_metrics_history 里已有的商品（91个CBT商品有历史）
c.execute("SELECT DISTINCT h.item_id, pm.site_id FROM product_metrics_history h JOIN product_metrics pm ON h.item_id = pm.item_id")
items = [(r[0], r[1]) for r in c.fetchall()]
print(f"有历史的商品: {len(items)}个")

# 也查一下新品（15天内上架的）是否有历史
cutoff = (datetime.now() - timedelta(days=15)).strftime('%Y-%m-%d')
c.execute("""
    SELECT pm.item_id, pm.site_id FROM product_metrics pm 
    WHERE pm.start_time >= ? 
    AND pm.item_id NOT IN (SELECT DISTINCT item_id FROM product_metrics_history)
""", (cutoff,))
new_items = [(r[0], r[1]) for r in c.fetchall()]
print(f"无历史的新品: {len(new_items)}个（需新增）")

all_items = items + new_items

# ── Step 5: 批量拉取今日访客 ────────────────────────────────────
results = {}  # item_id -> exposure
total = len(all_items)
print(f"\n拉取今日访客 (共{total}个，分批{BATCH})...")

for i in range(0, total, BATCH):
    batch = all_items[i:i+BATCH]
    # API 用原始 item_id（不带site前缀）
    ids_str = ','.join([r[0] for r in batch])
    url = f"https://api.mercadolibre.com/visits/items?ids={ids_str}"

    for attempt in range(3):
        try:
            resp = requests.get(url, headers={"Authorization": f"Bearer {token}"}, timeout=20)
            if resp.status_code == 429:
                print(f"  ⚠️ 429，等10秒...")
                time.sleep(10)
                continue
            if resp.status_code != 200:
                print(f"  ⚠️ HTTP {resp.status_code}: {resp.text[:60]}")
                break
            data = resp.json()
            for k, v in data.items():
                results[k] = v
            break
        except (requests.exceptions.SSLError, requests.exceptions.ConnectionError) as e:
            if attempt < 2:
                time.sleep(5)
                continue
            print(f"  ❌ 连接失败: {str(e)[:50]}")
            break

    done = min(i + BATCH, total)
    print(f"  进度 {done}/{total}，已获取 {len(results)} 条")
    time.sleep(RATE_MS / 1000)

print(f"\n获取完成: {len(results)} 条")

# ── Step 6: 写入 product_metrics_history ───────────────────────
inserted = 0
for item_id, exposure in results.items():
    try:
        c.execute("""
            INSERT INTO product_metrics_history (item_id, site_id, record_date, exposure, clicks, carts, sales, price)
            SELECT ?, site_id, ?, ?, 0, 0, 0, price
            FROM product_metrics WHERE item_id = ?
        """, (item_id, today, exposure, item_id))
        inserted += c.rowcount
    except Exception as e:
        pass

conn.commit()
print(f"写入今日快照: {inserted} 条")

# ── Step 7: 验证 ────────────────────────────────────────────────
c.execute("SELECT record_date, count(*) FROM product_metrics_history GROUP BY record_date ORDER BY record_date DESC")
print("\nhistory 日期分布:")
for r in c.fetchall():
    print(f"  {r[0]}: {r[1]}条")

# 新品验证
c.execute("""
    SELECT h.item_id, h.record_date, h.exposure 
    FROM product_metrics_history h
    JOIN product_metrics pm ON h.item_id = pm.item_id
    WHERE pm.start_time >= ?
    ORDER BY h.item_id, h.record_date DESC
    LIMIT 15
""", (cutoff,))
print(f"\n新品history记录(最近15天):")
for r in c.fetchall():
    print(f"  {r[0]} | {r[1]} | exp={r[2]}")

# 检查4/27是否还有脏数据
c.execute("SELECT count(*) FROM product_metrics_history WHERE record_date='2026-04-27' AND exposure > 5000")
print(f"\n4/27脏数据残留: {c.fetchone()[0]}条")

conn.close()
print("\n✅ 完成!")

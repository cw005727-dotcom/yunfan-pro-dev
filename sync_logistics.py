#!/usr/bin/env python3
"""
sync_logistics.py — 同步物流真实数据到 orders_v2

读取 orders_v2 中有 tracking_id 的订单，逐条调 /marketplace/shipments/{id}?x-format-new=true
写入 orders_v2 的 logistic_company / tracking_status / receiver_city / receiver_state 字段
限速 200ms/request，50条一批

用法: python3 sync_logistics.py [--dry-run]
"""
import sys
import os
import json
import time
import sqlite3
import requests
import argparse
from datetime import datetime

# 加载 token 管理器获取 access_token
sys.path.insert(0, os.path.dirname(__file__))
from token_manager import load_tokens

DB_PATH = os.path.join(os.path.dirname(__file__), "mercadolibre.db")
ML_ORDERS_URL = "https://api.mercadolibre.com/marketplace/orders"
ML_SHIPMENT_URL = "https://api.mercadolibre.com/marketplace/shipments"
RATE_LIMIT_MS = 200  # 每请求间隔 200ms
BATCH_SIZE = 50

# 需要添加到 orders_v2 的字段（ALTER TABLE 用）
NEW_COLUMNS = [
    ("logistic_company", "TEXT"),
    ("tracking_status",  "TEXT"),
    ("receiver_city",    "TEXT"),
    ("receiver_state",  "TEXT"),
]

def get_access_token():
    tokens = load_tokens()
    if not tokens:
        raise RuntimeError("无法加载 ML access_token，请先完成 OAuth 登录")
    return tokens.get("access_token")

def ensure_columns(conn):
    """确保 orders_v2 有新增字段，不存在则 ALTER TABLE 添加"""
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(orders_v2)")
    existing = {row[1] for row in cursor.fetchall()}
    for col_name, col_type in NEW_COLUMNS:
        if col_name not in existing:
            print(f"  ➕ 添加字段: {col_name} {col_type}")
            cursor.execute(f"ALTER TABLE orders_v2 ADD COLUMN {col_name} {col_type}")
    conn.commit()

def fetch_shipment(order_id, token, retry=3):
    """调 orders API 拿到 shipping.id，再用它查 shipments API，返回物流数据字典"""
    for attempt in range(retry):
        try:
            # Step 1: 拿 shipment_id from order
            order_url = f"{ML_ORDERS_URL}/{order_id}"
            order_resp = requests.get(order_url, headers={"Authorization": f"Bearer {token}"}, timeout=20)
            if order_resp.status_code == 429:
                print(f"    ⚠️  Order 429，等10秒...")
                time.sleep(10)
                continue
            if order_resp.status_code != 200:
                print(f"    ⚠️  Order API {order_resp.status_code}: {order_resp.text[:80]}")
                return None

            order_data = order_resp.json()
            shipment_id = order_data.get("shipping", {}).get("id")
            if not shipment_id:
                return None

            # Step 2: 拿 shipment 详情
            shipment_url = f"{ML_SHIPMENT_URL}/{shipment_id}"
            shipment_resp = requests.get(shipment_url, headers={
                "Authorization": f"Bearer {token}",
                "x-format-new": "true",
                "User-Agent": "yunfan-pro-dev/1.0",
            }, timeout=20)
            if shipment_resp.status_code == 429:
                print(f"    ⚠️  Shipment 429，等10秒...")
                time.sleep(10)
                continue
            if shipment_resp.status_code != 200:
                print(f"    ⚠️  Shipment API {shipment_resp.status_code}: {shipment_resp.text[:80]}")
                return None

            return shipment_resp.json()
        except (requests.exceptions.SSLError, requests.exceptions.ConnectionError) as e:
            if attempt < retry - 1:
                print(f"    ⚠️  连接异常，等5秒重试 ({attempt+1}/{retry}): {str(e)[:60]}")
                time.sleep(5)
                continue
            print(f"    ❌ 连接失败最终: {str(e)[:80]}")
            return None
    return None

def parse_shipment(data):
    """从 shipments API 响应提取物流数据"""
    if not data:
        return {}
    dest = data.get("destination", {})
    addr = dest.get("shipping_address", {})
    return {
        "logistic_company": data.get("tracking_method") or "",
        "tracking_status":  data.get("status") or "",
        "receiver_city":    (addr.get("city") or {}).get("name", "") if isinstance(addr.get("city"), dict) else "",
        "receiver_state":   (addr.get("state") or {}).get("name", "") if isinstance(addr.get("state"), dict) else "",
    }

def sync_batch(cursor, orders, token, dry_run=False):
    """处理一批订单，写入数据库"""
    updated = 0
    skipped = 0
    errors = 0

    for order in orders:
        tracking_id = order.get("tracking_id", "").strip()
        order_id = order.get("id", "?")
        if not tracking_id:
            skipped += 1
            continue

        # 跳过已有数据的订单（避免重复请求）
        if order.get("logistic_company") and order.get("tracking_status"):
            skipped += 1
            continue

        shipment = fetch_shipment(order_id, token)
        parsed = parse_shipment(shipment)

        if dry_run:
            print(f"  [dry-run] {order_id} tracking={tracking_id} → {parsed}")
        else:
            cols = ["logistic_company", "tracking_status", "receiver_city", "receiver_state"]
            vals = [parsed.get(c, "") or "" for c in cols]
            set_clause = ", ".join(f"{c}=?" for c in cols)
            sql = f"UPDATE orders_v2 SET {set_clause} WHERE id=?"
            try:
                cursor.execute(sql, vals + [order_id])
                updated += 1
                print(f"  ✅ {order_id} → logistic={parsed.get('logistic_company','?')} status={parsed.get('tracking_status','?')}")
            except Exception as e:
                errors += 1
                print(f"  ❌ {order_id} 更新失败: {e}")

        # 限速
        time.sleep(RATE_LIMIT_MS / 1000)

    return updated, skipped, errors

def main():
    parser = argparse.ArgumentParser(description="同步物流真实数据到 orders_v2")
    parser.add_argument("--dry-run", action="store_true", help="仅打印，不写入数据库")
    parser.add_argument("--limit", type=int, default=0, help="最多处理 N 条（0=全部）")
    args = parser.parse_args()

    print(f"\n{'='*60}")
    print(f"🚚 物流数据同步脚本")
    print(f"   时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   模式: {'DRY-RUN (不写入DB)' if args.dry_run else 'LIVE (写入DB)'}")
    print(f"{'='*60}\n")

    # 获取 token
    try:
        token = get_access_token()
        print(f"✅ Token 获取成功: {token[:20]}...")
    except Exception as e:
        print(f"❌ Token 获取失败: {e}")
        sys.exit(1)

    # 连接数据库
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # 确保字段存在
    if not args.dry_run:
        print("📋 检查/添加数据库字段...")
        ensure_columns(conn)
        print()

    # 读取有 tracking_id 的订单
    cursor.execute("""
        SELECT id, tracking_id, logistic_company, tracking_status
        FROM orders_v2
        WHERE tracking_id IS NOT NULL AND tracking_id != ''
        ORDER BY order_date DESC
    """)
    all_orders = [dict(r) for r in cursor.fetchall()]

    if args.limit > 0:
        all_orders = all_orders[:args.limit]

    total = len(all_orders)
    print(f"📦 找到 {total} 条有 tracking_id 的订单\n")

    if total == 0:
        print("无需同步，退出。")
        conn.close()
        return

    # 分批处理
    total_updated = 0
    total_skipped = 0
    total_errors = 0
    total_batches = (total + BATCH_SIZE - 1) // BATCH_SIZE

    for i in range(0, total, BATCH_SIZE):
        batch = all_orders[i:i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        print(f"\n📤 批次 {batch_num}/{total_batches} ({len(batch)} 条)...")
        u, s, e = sync_batch(cursor, batch, token, dry_run=args.dry_run)
        total_updated += u
        total_skipped += s
        total_errors += e
        conn.commit()

    print(f"\n{'='*60}")
    print(f"📊 同步完成:")
    print(f"   ✅ 更新: {total_updated}")
    print(f"   ⏭️  跳过: {total_skipped}")
    print(f"   ❌ 失败: {total_errors}")
    print(f"{'='*60}\n")

    conn.close()

if __name__ == "__main__":
    main()

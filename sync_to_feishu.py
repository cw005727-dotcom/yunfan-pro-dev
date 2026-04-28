import sqlite3
import json
import subprocess
import time

APP_TOKEN = "I8OlbQZMwaVh08sdFvIcrcW3nbc"
TABLE_ID = "tblcYUBPsHH96puy"

def get_orders():
    conn = sqlite3.connect('mercadolibre.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, user_id, site_id, order_date, product_name, quantity, amount, platform_fee, tax, net_profit, last_ship_date, status FROM orders_v2")
    rows = cursor.fetchall()
    conn.close()
    return rows

def sync_to_lark(rows):
    records = []
    for row in rows:
        # Map row to Bitable fields
        # Note: Bitable DateTime expects timestamp in milliseconds
        try:
            order_date_ms = int(time.mktime(time.strptime(row[3], "%Y-%m-%d %H:%M:%S"))) * 1000 if row[3] else None
        except:
            order_date_ms = None
            
        try:
            last_ship_date_ms = int(time.mktime(time.strptime(row[10], "%Y-%m-%d"))) * 1000 if row[10] else None
        except:
            last_ship_date_ms = None

        fields = {
            "订单ID": str(row[0]),
            "用户ID": row[1],
            "站点": row[2],
            "下单时间": order_date_ms,
            "商品名称": row[4],
            "数量": row[5],
            "订单金额": row[6],
            "平台费用": row[7],
            "税费": row[8],
            "净利润": row[9],
            "最迟发货时间": last_ship_date_ms,
            "状态": row[11]
        }
        records.append({"fields": fields})

    # Batch create in chunks of 100
    for i in range(0, len(records), 100):
        batch = records[i:i+100]
        data = json.dumps({"records": batch})
        cmd = [
            "lark-cli", "api", "POST", 
            f"/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/records/batch_create",
            "--data", data
        ]
        print(f"Syncing batch {i//100 + 1}...")
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error syncing batch: {result.stderr}")
        else:
            print(f"Batch {i//100 + 1} synced successfully.")

if __name__ == "__main__":
    orders = get_orders()
    print(f"Found {len(orders)} orders. Starting sync...")
    sync_to_lark(orders)

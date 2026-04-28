import json
import sqlite3
import os

# 使用相对路径以确保环境通用
DB_PATH = "mercadolibre.db"
JSON_PATH = "reputation_3164139599.json"

def recover():
    if not os.path.exists(JSON_PATH):
        print(f"Error: {JSON_PATH} not found in current directory")
        return

    with open(JSON_PATH, 'r') as f:
        data = json.load(f)

    matrix = data.get('reputation_matrix', {}).get('seller_reputation', [])
    if not matrix:
        print("Error: No reputation_matrix found in JSON")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 确保字段存在
    try:
        cursor.execute("ALTER TABLE stores ADD COLUMN cancellations_rate TEXT")
    except:
        pass

    updates = 0
    for rep in matrix:
        uid = rep.get('user_id')
        site = rep.get('site_id')
        status = rep.get('seller_reputation', {})
        level = status.get('level_id', 'unknown')
        metrics = status.get('metrics', {})
        
        claims = f"{metrics.get('claims', {}).get('rate', 0) * 100:.2f}%"
        delayed = f"{metrics.get('delayed_handling_time', {}).get('rate', 0) * 100:.2f}%"
        cancel = f"{metrics.get('cancellations', {}).get('rate', 0) * 100:.2f}%"

        # 更新数据库
        cursor.execute("""
            UPDATE stores 
            SET reputation_level = ?, complaints_rate = ?, delayed_rate = ?, cancellations_rate = ?
            WHERE user_id = ?
        """, (level, claims, delayed, cancel, uid))
        
        if cursor.rowcount > 0:
            print(f"✅ Recovered UID {uid} ({site}): Level={level}, Claims={claims}")
            updates += 1
        else:
            print(f"⚠️ UID {uid} ({site}) not found in stores table, skipping.")

    conn.commit()
    conn.close()
    print(f"\nFinished. Total stores updated: {updates}")

if __name__ == "__main__":
    recover()

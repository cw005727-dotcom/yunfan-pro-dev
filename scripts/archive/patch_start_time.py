import json
import sqlite3
import os

DB_PATH = "/Users/chensan/.accio/accounts/7086454425/agents/MID-95454425U1776995-4A33A1-0369-3FFD58/project/mercadolibre.db"
JSON_PATH = "/Users/chensan/.accio/accounts/7086454425/agents/MID-95454425U1776995-4A33A1-0369-3FFD58/project/cbt_full_extract_1777104481.json"

def patch_start_time():
    try:
        with open(JSON_PATH, 'r') as f:
            data = json.load(f)
        
        updates = []
        # Questions contain marketplace_item_id and date_created
        if 'questions' in data and 'questions' in data['questions']:
            for q in data['questions']['questions']:
                item_id = q.get('marketplace_item_id')
                start_time = q.get('date_created')
                if item_id and start_time:
                    # Format: 2026-03-29T02:13:31.756-04:00 -> 2026-03-29 02:13:31
                    clean_time = start_time.replace('T', ' ').split('.')[0]
                    updates.append((clean_time, item_id))
        
        if not updates:
            print("No updates found in JSON.")
            return

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        print(f"Patching {len(updates)} items with start_time...")
        cursor.executemany("UPDATE product_metrics SET start_time = ? WHERE item_id = ?", updates)
        conn.commit()
        print(f"Successfully patched {cursor.rowcount} records.")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    patch_start_time()

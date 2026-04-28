import requests
import sqlite3
import time
import os
from token_manager import load_tokens

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mercadolibre.db")

def update_thumbnails():
    tokens = load_tokens()
    if not tokens or not tokens.get('access_token'):
        print("Error: No access token found.")
        return
    
    access_token = tokens['access_token']
    headers = {'Authorization': f'Bearer {access_token}'}
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 获取没有图片的订单
    cursor.execute("SELECT id FROM orders_v2 WHERE thumbnail = '' OR thumbnail IS NULL")
    rows = cursor.fetchall()
    print(f"Found {len(rows)} orders without thumbnails.")
    
    count = 0
    for (order_id,) in rows:
        try:
            # 第一步：获取订单详情，拿到 item_id
            order_url = f"https://api.mercadolibre.com/marketplace/orders/{order_id}"
            order_res = requests.get(order_url, headers=headers, timeout=10).json()
            
            order_items = order_res.get('order_items', [])
            if not order_items: continue
            
            item_id = order_items[0].get('item', {}).get('id')
            if not item_id: continue
            
            # 第二步：获取商品详情，拿到 thumbnail
            item_url = f"https://api.mercadolibre.com/marketplace/items/{item_id}"
            item_res = requests.get(item_url, headers=headers, timeout=10).json()
            
            thumb = item_res.get('thumbnail', '')
            if thumb:
                thumb = thumb.replace('http://', 'https://')
                cursor.execute("UPDATE orders_v2 SET thumbnail = ? WHERE id = ?", (thumb, order_id))
                count += 1
                if count % 5 == 0:
                    conn.commit()
                    print(f"  Updated {count} thumbnails (Latest: {item_id})...")
            
            time.sleep(0.1)
        except Exception as e:
            print(f"  Error updating {order_id}: {e}")
            
    conn.commit()
    conn.close()
    print(f"Finished. Total updated: {count}")

if __name__ == "__main__":
    update_thumbnails()

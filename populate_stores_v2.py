import requests
import sqlite3
import os
from token_manager import load_tokens

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mercadolibre.db")

def sync_stores():
    tokens = load_tokens()
    if not tokens or not tokens.get('access_token'):
        print("Error: No tokens found.")
        return
        
    access_token = tokens['access_token']
    headers = {'Authorization': f'Bearer {access_token}'}
    
    url = "https://api.mercadolibre.com/global/users/seller_reputation"
    try:
        res = requests.get(url, headers=headers).json()
        # Root master
        master_id = res.get('user_id')
        seller_list = res.get('seller_reputation', [])
    except Exception as e:
        print(f"API Error: {e}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("Clearing stores table for fresh sync...")
    cursor.execute("DELETE FROM stores")
    
    # Add Master account too
    process_store({"user_id": master_id, "site_id": "CBT"}, cursor, headers, access_token)
    
    for sub in seller_list:
        if isinstance(sub, dict):
            process_store(sub, cursor, headers, access_token)
            
    conn.commit()
    conn.close()
    print("Store sync complete.")

def process_store(item, cursor, headers, access_token):
    sid = item.get('user_id')
    site = item.get('site_id')
    if not sid or not site: return
    
    # Fetch detailed info for nickname
    try:
        user_res = requests.get(f"https://api.mercadolibre.com/users/{sid}", headers=headers).json()
        nickname = user_res.get('nickname', 'Unknown')
    except:
        nickname = f"Sub_{sid}"
        
    group_label = nickname
    master_uid = sid
    is_dajie = "3164139599" in str(access_token) or "大姐" in nickname or nickname in ["PELUCHEYTERNURA", "CNGUIZHOUFENGMENGKEJIYO", "CNGUIZHOUFENGMENGKEJIYOCOR", "CNGUIZHOUFENGMENGKEJIYOARR", "CNGUIZHOUFENGMENGKEJIYOMEX"]
    
    if is_dajie:
        group_label = "大姐店"
        master_uid = 3164139599
            
    print(f"Syncing Store: {nickname} ({sid}) -> Site: {site}, Group: {group_label}")
    
    cursor.execute("""
        INSERT OR REPLACE INTO stores (user_id, site_id, nickname, store_name, access_token, group_label, master_user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (sid, site, nickname, nickname, access_token, group_label, master_uid))

if __name__ == "__main__":
    sync_stores()

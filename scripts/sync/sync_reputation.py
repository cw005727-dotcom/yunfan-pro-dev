import requests
import sqlite3
import os
import json
from token_manager import load_tokens

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mercadolibre.db")

def format_rate(rate):
    if rate is None: return "0.00%"
    if isinstance(rate, (int, float)): return f"{rate * 100:.2f}%"
    return str(rate)

def sync_reputation():
    tokens = load_tokens()
    if not tokens: return
    headers = {'Authorization': f'Bearer {tokens["access_token"]}'}
    
    res = requests.get("https://api.mercadolibre.com/global/users/seller_reputation", headers=headers).json()
    seller_list = res.get('seller_reputation', [])
    print(f"Found {len(seller_list)} sellers in global response")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    for item in seller_list:
        site_id = item.get('site_id')
        user_id = item.get('user_id')
        rep = item.get('seller_reputation', {})
        if not site_id or not rep: continue
        
        level = rep.get('level_id', 'unknown')
        metrics = rep.get('metrics', {})
        
        complaints_rate = format_rate(metrics.get('claims', {}).get('rate'))
        delayed_rate = format_rate(metrics.get('delayed_handling_time', {}).get('rate'))
        cancellations_rate = format_rate(metrics.get('cancellations', {}).get('rate'))
        
        claims_v = metrics.get('claims', {}).get('value', 0)
        delayed_v = metrics.get('delayed_handling_time', {}).get('value', 0)
        cancel_v = metrics.get('cancellations', {}).get('value', 0)
        total_v = rep.get('transactions', {}).get('total', 0)
        
        # Mapping
        target_site = site_id
        if target_site == 'MLM': target_site = 'CBT'
        
        print(f"Syncing {site_id} (mapped to {target_site}) -> Level: {level}")
        
        cursor.execute("""
            UPDATE stores SET 
                reputation_level = ?, 
                complaints_rate = ?, claims_value = ?,
                delayed_rate = ?, delayed_value = ?,
                cancellations_rate = ?, cancel_value = ?,
                total_transactions = ?,
                last_updated = CURRENT_TIMESTAMP
            WHERE user_id = ? OR site_id = ?
        """, (level, complaints_rate, claims_v, delayed_rate, delayed_v, cancellations_rate, cancel_v, total_v, int(user_id), target_site))
        
        if cursor.rowcount == 0:
            print(f"Warning: No store found for site_id {target_site}")

    conn.commit()
    conn.close()
    print("Done")

if __name__ == "__main__":
    sync_reputation()

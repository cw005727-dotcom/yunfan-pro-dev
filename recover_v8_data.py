
import sys
import os
# Use the simpler token manager to avoid cryptography library issues on Mac
sys.path.insert(0, '/Users/chensan/yunfan-pro-dev/scripts/utils')
import requests
import json
import sqlite3
import time
from datetime import datetime, timedelta
from token_manager import get_valid_token

DB_PATH = "/Users/chensan/yunfan-pro-dev/mercadolibre.db"
ML_API = "https://api.mercadolibre.com"

def fetch_order_details(order_id, access_token):
    url = f"{ML_API}/marketplace/orders/{order_id}"
    headers = {'Authorization': f'Bearer {access_token}'}
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code == 200:
            return resp.json()
    except:
        pass
    return None

def recover():
    try:
        token = get_valid_token()
    except Exception as e:
        print(f"Error getting token: {e}")
        return

    headers = {'Authorization': f'Bearer {token}'}
    
    # Discovery phase: find all sub-seller IDs
    print("Discovering sub-seller IDs via reputation API...")
    url_rep = f"{ML_API}/global/users/seller_reputation"
    resp_rep = requests.get(url_rep, headers=headers)
    if resp_rep.status_code != 200:
        print(f"Discovery failed: {resp_rep.status_code}")
        return
        
    rep_data = resp_rep.json().get('seller_reputation', [])
    seller_ids = []
    for r in rep_data:
        seller_ids.append((str(r['user_id']), r['site_id']))
    
    if not seller_ids:
        print("No seller IDs found. Using 'me'.")
        seller_ids = [('me', 'CBT')]

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # c.execute("DELETE FROM orders_v2")

    restored_total = 0
    
    for sid, site_id in seller_ids:
        print(f"Syncing orders for Site: {site_id}, Seller ID: {sid}...")
        offset = 0
        limit = 50
        
        while True:
            # Search for last 30 days
            since = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%dT%H:%M:%S') + '-04:00'
            url = f"{ML_API}/marketplace/orders/search"
            params = {
                'seller.id' if sid != 'me' else 'seller': sid,
                'order_date_from': since,
                'limit': limit,
                'offset': offset
            }
            
            resp = requests.get(url, params=params, headers=headers)
            if resp.status_code != 200:
                print(f"Search failed for {sid}: {resp.status_code}")
                break

            search_res = resp.json()
            results = search_res.get('results', [])
            if not results:
                break
                
            for res in results:
                if 'orders' in res:
                    for sub in res['orders']:
                        sub_id = sub['id']
                        print(f"  Penetrating sub-order {sub_id}...")
                        detail = fetch_order_details(sub_id, token)
                        if detail:
                            write_to_db(c, detail)
                            restored_total += 1
                            if restored_total % 10 == 0:
                                conn.commit()
                                print(f"  -- Committed {restored_total} orders --")
                else:
                    write_to_db(c, res)
                    restored_total += 1
                    if restored_total % 10 == 0:
                        conn.commit()
                        print(f"  -- Committed {restored_total} orders --")
            
            paging = search_res.get('paging', {})
            if offset + limit >= paging.get('total', 0):
                break
            offset += limit

    conn.commit()
    conn.close()
    print(f"Successfully restored {restored_total} orders in total.")

def write_to_db(c, order):
    order_id = str(order['id'])
    user_id = str(order.get('buyer', {}).get('id', ''))
    site_id = order.get('site_id', 'MLM')
    order_date = order.get('date_created', '')[:19]
    status = order.get('status', '')
    shipping_status = order.get('shipping', {}).get('status', '')
    amount = float(order.get('total_amount', 0))
    
    items = order.get('order_items', [])
    first_item = items[0] if items else {}
    product_name = first_item.get('item', {}).get('title', 'N/A')
    quantity = sum(i.get('quantity', 1) for i in items)

    c.execute("""
        INSERT OR REPLACE INTO orders_v2 
        (id, user_id, site_id, order_date, product_name, quantity, amount, status, shipping_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (order_id, user_id, site_id, order_date, product_name, quantity, amount, status, shipping_status))

if __name__ == "__main__":
    recover()

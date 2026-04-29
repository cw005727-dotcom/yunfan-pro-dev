import sqlite3
import requests
import json

def get_listing_counts():
    conn = sqlite3.connect('/Users/chensan/yunfan-pro-dev/mercadolibre.db')
    cursor = conn.cursor()
    cursor.execute("SELECT user_id, site_id, access_token, nickname FROM stores WHERE group_label = '大姐店'")
    stores = cursor.fetchall()
    
    results = []
    for user_id, site_id, token, nickname in stores:
        headers = {
            "Authorization": f"Bearer {token}"
        }
        # Get active listings
        url_active = f"https://api.mercadolibre.com/users/{user_id}/items/search?status=active"
        resp_active = requests.get(url_active, headers=headers)
        active_count = 0
        if resp_active.status_code == 200:
            active_count = resp_active.json().get('paging', {}).get('total', 0)
        
        # Get inactive/total listings
        url_total = f"https://api.mercadolibre.com/users/{user_id}/items/search"
        resp_total = requests.get(url_total, headers=headers)
        total_count = 0
        if resp_total.status_code == 200:
            total_count = resp_total.json().get('paging', {}).get('total', 0)
            
        results.append({
            "nickname": nickname,
            "site_id": site_id,
            "user_id": user_id,
            "active_count": active_count,
            "total_count": total_count
        })
    
    conn.close()
    return results

if __name__ == "__main__":
    counts = get_listing_counts()
    print(json.dumps(counts, indent=2))

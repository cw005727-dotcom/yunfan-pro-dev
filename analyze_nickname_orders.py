from ml_api_client import MercadoLibreClient
import requests
import json
from datetime import datetime

CLIENT_ID = "4704295209384526"
CLIENT_SECRET = "wkHjcxmX5Pn8VZISfvkwj5rZBUcngAJN"
REDIRECT_URI = "https://www.baidu.com"

client = MercadoLibreClient(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

def analyze_nickname_orders(month_str="2026-02"):
    headers = client._get_headers()
    
    # Get mapping for naming
    rep_res = requests.get("https://api.mercadolibre.com/global/users/seller_reputation", headers=headers).json()
    seller_to_site = {}
    for site in rep_res.get('seller_reputation', []):
        seller_to_site[str(site['user_id'])] = site['site_id']

    date_from = f"{month_str}-01T00:00:00.000-00:00"
    date_to = f"{month_str}-28T23:59:59.000-00:00"

    print(f"Fetching orders by Nickname for {month_str}...")
    url = "https://api.mercadolibre.com/marketplace/orders/search"
    all_orders = []
    offset = 0
    limit = 50
    
    while True:
        params = {
            "seller.nickname": "CNGUANGZHOUWENMUXIASHAN",
            "order.date_created.from": date_from,
            "order.date_created.to": date_to,
            "offset": offset,
            "limit": limit
        }
        res = requests.get(url, headers=headers, params=params).json()
        results = res.get('results', [])
        if not results:
            break
        all_orders.extend(results)
        offset += limit
        if len(all_orders) >= res.get('paging', {}).get('total', 0):
            break

    print(f"Total orders fetched by nickname: {len(all_orders)}")
    
    status_dist = {}
    for o in all_orders:
        status = o.get('status', 'Unknown')
        status_dist[status] = status_dist.get(status, 0) + 1
    
    print("\nOrder Status Distribution:")
    for status, count in status_dist.items():
        print(f"{status}: {count}")

    return all_orders, distribution, rep_res

if __name__ == "__main__":
    analyze_nickname_orders()

from ml_api_client import MercadoLibreClient
import requests
import json

CLIENT_ID = "4704295209384526"
CLIENT_SECRET = "wkHjcxmX5Pn8VZISfvkwj5rZBUcngAJN"
REDIRECT_URI = "https://www.baidu.com"
MY_ID = 2588663725

client = MercadoLibreClient(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

def find_my_orders():
    headers = client._get_headers()
    url = "https://api.mercadolibre.com/marketplace/orders/search"
    params = {
        "order.date_created.from": "2026-02-01T00:00:00.000-00:00",
        "order.date_created.to": "2026-02-28T23:59:59.000-00:00",
        "limit": 50
    }
    response = requests.get(url, headers=headers, params=params)
    data = response.json()
    results = data.get('results', [])
    
    my_orders = []
    other_sellers = set()
    
    for o in results:
        # Check all nested orders
        for sub_o in o.get('orders', []):
            sid = sub_o.get('seller', {}).get('id')
            if sid == MY_ID:
                my_orders.append(sub_o)
            else:
                other_sellers.add(sid)
                
    print(f"Total orders scanned: {len(results)}")
    print(f"My orders found: {len(my_orders)}")
    print(f"Other seller IDs found: {list(other_sellers)[:5]}")

if __name__ == "__main__":
    find_my_orders()

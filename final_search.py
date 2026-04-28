from ml_api_client import MercadoLibreClient
import requests
import json

CLIENT_ID = "4704295209384526"
CLIENT_SECRET = "wkHjcxmX5Pn8VZISfvkwj5rZBUcngAJN"
REDIRECT_URI = "https://www.baidu.com"
SELLER_ID = "2588663725"

client = MercadoLibreClient(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

def final_search():
    headers = client._get_headers()
    
    # 1. Search by Nickname
    print("Searching by Nickname...")
    url = "https://api.mercadolibre.com/marketplace/orders/search"
    params = {"seller.nickname": "CNGUANGZHOUWENMUXIASHAN"}
    res = requests.get(url, headers=headers, params=params).json()
    print(f"By Nickname: {res.get('paging', {}).get('total')}")

    # 2. Search for any orders for the user ID in the last 6 months
    print("\nSearching by Seller ID (last 6 months)...")
    params_long = {
        "seller.id": SELLER_ID,
        "order.date_created.from": "2025-10-01T00:00:00.000-00:00",
        "order.date_created.to": "2026-04-24T23:59:59.000-00:00"
    }
    res_long = requests.get(url, headers=headers, params=params_long).json()
    print(f"By Seller ID (Long Range): {res_long.get('paging', {}).get('total')}")

    # 3. Global Reputation
    print("\nChecking Global Reputation...")
    url_rep = "https://api.mercadolibre.com/global/users/seller_reputation"
    res_rep = requests.get(url_rep, headers=headers).json()
    print(f"Global Reputation: {json.dumps(res_rep, indent=2)}")

if __name__ == "__main__":
    final_search()

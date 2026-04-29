from ml_api_client import MercadoLibreClient
import requests
import json

CLIENT_ID = "4704295209384526"
CLIENT_SECRET = "wkHjcxmX5Pn8VZISfvkwj5rZBUcngAJN"
REDIRECT_URI = "https://www.baidu.com"

client = MercadoLibreClient(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

def verify_mapping():
    headers = client._get_headers()
    url = "https://api.mercadolibre.com/global/users/seller_reputation"
    res = requests.get(url, headers=headers).json()
    
    print("Official Mapping from API:")
    # It's a dict with 'seller_reputation' list
    for site in res.get('seller_reputation', []):
        print(f"Site: {site['site_id']}, User ID: {site['user_id']}")
    
    # Also check a few orders to see amount fields
    url_orders = "https://api.mercadolibre.com/marketplace/orders/search"
    # Try MLM (Mexico) which had 126 orders
    params = {"seller.id": "2593809284", "limit": 2}
    orders_res = requests.get(url_orders, headers=headers, params=params).json()
    if orders_res.get('results'):
        print("\nFull First Order Object:")
        print(json.dumps(orders_res['results'][0], indent=2))

if __name__ == "__main__":
    verify_mapping()

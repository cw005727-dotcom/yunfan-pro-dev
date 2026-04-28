from ml_api_client import MercadoLibreClient
import requests
import json

CLIENT_ID = "4704295209384526"
CLIENT_SECRET = "wkHjcxmX5Pn8VZISfvkwj5rZBUcngAJN"
REDIRECT_URI = "https://www.baidu.com"
SELLER_ID = "2588663725"

client = MercadoLibreClient(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

def check_user_sites():
    url = f"https://api.mercadolibre.com/users/{SELLER_ID}"
    response = requests.get(url, headers=client._get_headers())
    user_data = response.json()
    return user_data.get('site_id'), user_data.get('seller_reputation', {}).get('metrics', {})

def search_orders_by_site(site_id):
    url = "https://api.mercadolibre.com/marketplace/orders/search"
    params = {
        "seller.id": SELLER_ID,
        "site": site_id
    }
    response = requests.get(url, headers=client._get_headers(), params=params)
    return response.json()

if __name__ == "__main__":
    site, metrics = check_user_sites()
    print(f"Primary Site: {site}")
    print(f"Reputation Metrics: {json.dumps(metrics, indent=2)}")
    
    # Try common CBT marketplaces
    for s in ['MLM', 'MLB', 'MLC', 'MCO']:
        res = search_orders_by_site(s)
        total = res.get('paging', {}).get('total', 0)
        print(f"Orders in {s}: {total}")

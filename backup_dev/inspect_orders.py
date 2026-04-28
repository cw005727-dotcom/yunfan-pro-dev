from ml_api_client import MercadoLibreClient
import requests
import json

CLIENT_ID = "4704295209384526"
CLIENT_SECRET = "wkHjcxmX5Pn8VZISfvkwj5rZBUcngAJN"
REDIRECT_URI = "https://www.baidu.com"

client = MercadoLibreClient(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

def inspect_orders():
    headers = client._get_headers()
    url = "https://api.mercadolibre.com/marketplace/orders/search"
    # Fetch orders from February 2026
    params = {
        "order.date_created.from": "2026-02-01T00:00:00.000-00:00",
        "order.date_created.to": "2026-02-28T23:59:59.000-00:00",
        "limit": 5
    }
    response = requests.get(url, headers=headers, params=params)
    data = response.json()
    
    print(f"Total found for Feb 2026: {data.get('paging', {}).get('total')}")
    print("\nSample Order Data (First 2):")
    results = data.get('results', [])
    for order in results[:2]:
        print(json.dumps(order, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    inspect_orders()

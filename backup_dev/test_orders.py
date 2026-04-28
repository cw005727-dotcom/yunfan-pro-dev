from ml_api_client import MercadoLibreClient
import requests
import json

CLIENT_ID = "4704295209384526"
CLIENT_SECRET = "wkHjcxmX5Pn8VZISfvkwj5rZBUcngAJN"
REDIRECT_URI = "https://www.baidu.com"
SELLER_ID = "2588663725"

client = MercadoLibreClient(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

def try_global_orders():
    # Try the global orders search endpoint
    url = "https://api.mercadolibre.com/global/orders/search"
    params = {
        "seller.id": SELLER_ID,
        "order.date_created.from": "2026-02-01T00:00:00.000-00:00",
        "order.date_created.to": "2026-02-28T23:59:59.000-00:00"
    }
    response = requests.get(url, headers=client._get_headers(), params=params)
    return response.json()

def try_marketplace_orders_all():
    # Try marketplace orders search without status filter for Feb
    url = "https://api.mercadolibre.com/marketplace/orders/search"
    params = {
        "seller.id": SELLER_ID,
        "order.date_created.from": "2026-02-01T00:00:00.000-00:00",
        "order.date_created.to": "2026-02-28T23:59:59.000-00:00"
    }
    response = requests.get(url, headers=client._get_headers(), params=params)
    return response.json()

if __name__ == "__main__":
    print("Testing /global/orders/search for February:")
    res_global = try_global_orders()
    print(json.dumps(res_global, indent=2))
    
    print("\nTesting /marketplace/orders/search for February:")
    res_market = try_marketplace_orders_all()
    print(json.dumps(res_market, indent=2))

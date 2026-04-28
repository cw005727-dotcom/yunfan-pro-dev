from ml_api_client import MercadoLibreClient
import requests
import json

CLIENT_ID = "4704295209384526"
CLIENT_SECRET = "wkHjcxmX5Pn8VZISfvkwj5rZBUcngAJN"
REDIRECT_URI = "https://www.baidu.com"
SELLER_ID = "2588663725"
ITEM_ID = "CBT3365505286"

client = MercadoLibreClient(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

def get_item_details(item_id):
    url = f"https://api.mercadolibre.com/items/{item_id}"
    response = requests.get(url, headers=client._get_headers())
    return response.json()

def get_item_visits(item_id):
    # Try the visits window endpoint
    url = f"https://api.mercadolibre.com/items/{item_id}/visits/time_window"
    params = {"last": 30, "unit": "day"}
    response = requests.get(url, headers=client._get_headers(), params=params)
    return response.json()

if __name__ == "__main__":
    print(f"Details for {ITEM_ID}:")
    print(json.dumps(get_item_details(ITEM_ID), indent=2))
    print(f"\nVisits for {ITEM_ID}:")
    print(json.dumps(get_item_visits(ITEM_ID), indent=2))

from ml_api_client import MercadoLibreClient
import requests
import json

CLIENT_ID = "4704295209384526"
CLIENT_SECRET = "wkHjcxmX5Pn8VZISfvkwj5rZBUcngAJN"
REDIRECT_URI = "https://www.baidu.com"
SELLER_ID = "2588663725"

client = MercadoLibreClient(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

def list_items():
    url = f"https://api.mercadolibre.com/users/{SELLER_ID}/items/search"
    response = requests.get(url, headers=client._get_headers())
    return response.json()

if __name__ == "__main__":
    items = list_items()
    print(json.dumps(items, indent=2))

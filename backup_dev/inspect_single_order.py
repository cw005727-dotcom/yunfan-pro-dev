from ml_api_client import MercadoLibreClient
import requests
import json

CLIENT_ID = "4704295209384526"
CLIENT_SECRET = "wkHjcxmX5Pn8VZISfvkwj5rZBUcngAJN"
REDIRECT_URI = "https://www.baidu.com"

client = MercadoLibreClient(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

def inspect_one_order(order_id):
    headers = client._get_headers()
    # Try global orders endpoint
    url = f"https://api.mercadolibre.com/global/orders/{order_id}"
    res = requests.get(url, headers=headers).json()
    print(json.dumps(res, indent=2))

if __name__ == "__main__":
    # Pack ID: 2000011083917763
    inspect_one_order("2000011083917763")

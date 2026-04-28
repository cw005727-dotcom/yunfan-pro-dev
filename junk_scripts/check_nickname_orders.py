from ml_api_client import MercadoLibreClient
import requests
import json

CLIENT_ID = "4704295209384526"
CLIENT_SECRET = "wkHjcxmX5Pn8VZISfvkwj5rZBUcngAJN"
REDIRECT_URI = "https://www.baidu.com"

client = MercadoLibreClient(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

def check_nickname_search():
    headers = client._get_headers()
    url = "https://api.mercadolibre.com/marketplace/orders/search"
    params = {"seller.nickname": "CNGUANGZHOUWENMUXIASHAN", "limit": 1}
    res = requests.get(url, headers=headers, params=params).json()
    print(json.dumps(res['results'][0], indent=2))

if __name__ == "__main__":
    check_nickname_search()

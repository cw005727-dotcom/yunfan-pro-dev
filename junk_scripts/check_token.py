from ml_api_client import MercadoLibreClient
import requests
import json

CLIENT_ID = "4704295209384526"
CLIENT_SECRET = "wkHjcxmX5Pn8VZISfvkwj5rZBUcngAJN"
REDIRECT_URI = "https://www.baidu.com"

client = MercadoLibreClient(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

def check_token_info():
    headers = client._get_headers()
    # Mercado Libre doesn't have a direct /token_info endpoint that's easy to find,
    # but we can check the response headers of any request.
    response = requests.get("https://api.mercadolibre.com/users/me", headers=headers)
    print("User Info Response Headers:")
    # print(response.headers)
    print(f"X-Auth-Scopes: {response.headers.get('X-Auth-Scopes')}")
    print(f"User Data: {json.dumps(response.json(), indent=2)}")

if __name__ == "__main__":
    check_token_info()

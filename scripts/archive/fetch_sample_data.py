from ml_api_client import MercadoLibreClient
import json

CLIENT_ID = "4704295209384526"
CLIENT_SECRET = "wkHjcxmX5Pn8VZISfvkwj5rZBUcngAJN"
REDIRECT_URI = "https://www.baidu.com"

client = MercadoLibreClient(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

# Get Seller Info
print("Fetching Seller Info...")
headers = client._get_headers()
import requests
response = requests.get("https://api.mercadolibre.com/users/me", headers=headers)
user_info = response.json()
print(f"Seller ID: {user_info.get('id')}")
print(f"Nickname: {user_info.get('nickname')}")
print(f"Country: {user_info.get('country_id')}")

# Try to fetch orders
seller_id = user_info.get('id')
if seller_id:
    print("\nFetching Sample Orders (last 5)...")
    orders = client.fetch_orders(seller_id, limit=5)
    print(json.dumps(orders, indent=2, ensure_ascii=False))

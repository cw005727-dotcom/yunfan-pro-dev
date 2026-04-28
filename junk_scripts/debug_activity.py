from ml_api_client import MercadoLibreClient
import requests
import json

CLIENT_ID = "4704295209384526"
CLIENT_SECRET = "wkHjcxmX5Pn8VZISfvkwj5rZBUcngAJN"
REDIRECT_URI = "https://www.baidu.com"
SELLER_ID = "2588663725"

client = MercadoLibreClient(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

def debug_february():
    headers = client._get_headers()
    
    # 1. Orders for Feb 2026 (Trying different status)
    print("Checking for any orders in Feb 2026...")
    url = "https://api.mercadolibre.com/marketplace/orders/search"
    params = {
        "seller.id": SELLER_ID,
        "order.date_created.from": "2026-02-01T00:00:00.000-00:00",
        "order.date_created.to": "2026-02-28T23:59:59.000-00:00"
    }
    res = requests.get(url, headers=headers, params=params).json()
    print(f"Total Orders found: {res.get('paging', {}).get('total')}")

    # 2. Payouts
    print("\nChecking Payouts...")
    url_payouts = "https://api.mercadolibre.com/marketplace/payouts/search"
    res_payouts = requests.get(url_payouts, headers=headers, params={"seller_id": SELLER_ID}).json()
    print(f"Payouts response: {json.dumps(res_payouts, indent=2)}")

    # 3. Questions
    print("\nChecking Questions...")
    url_q = f"https://api.mercadolibre.com/questions/search"
    res_q = requests.get(url_q, headers=headers, params={"seller_id": SELLER_ID}).json()
    print(f"Total Questions: {res_q.get('paging', {}).get('total')}")

if __name__ == "__main__":
    debug_february()

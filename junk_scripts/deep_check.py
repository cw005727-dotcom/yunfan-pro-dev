from ml_api_client import MercadoLibreClient
import requests
import json

CLIENT_ID = "4704295209384526"
CLIENT_SECRET = "wkHjcxmX5Pn8VZISfvkwj5rZBUcngAJN"
REDIRECT_URI = "https://www.baidu.com"
SELLER_ID = "2588663725"

client = MercadoLibreClient(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

def deep_check():
    headers = client._get_headers()
    
    # 1. Try search orders with no seller.id filter (might default to self)
    print("Searching orders (no seller.id filter)...")
    url = "https://api.mercadolibre.com/marketplace/orders/search"
    res = requests.get(url, headers=headers).json()
    print(f"Total: {res.get('paging', {}).get('total')}")

    # 2. Check visits for multiple items
    print("\nChecking visits for first 5 items in Feb 2026...")
    items_res = requests.get(f"https://api.mercadolibre.com/users/{SELLER_ID}/items/search", headers=headers).json()
    item_ids = items_res.get('results', [])[:5]
    for iid in item_ids:
        v_url = f"https://api.mercadolibre.com/items/{iid}/visits/time_window"
        v_params = {"date_from": "2026-02-01T00:00:00Z", "date_to": "2026-02-28T23:59:59Z"}
        v_res = requests.get(v_url, headers=headers, params=v_params).json()
        print(f"Item {iid} visits: {v_res.get('total_visits')}")

    # 3. Check for any "payouts" with a different approach
    print("\nChecking for any payout records...")
    # Try different site versions if possible, or just search without status
    url_payouts = "https://api.mercadolibre.com/marketplace/payouts/search"
    res_payouts = requests.get(url_payouts, headers=headers, params={"seller_id": SELLER_ID}).json()
    print(f"Payouts response summary: {res_payouts.get('error', 'Success')}")

if __name__ == "__main__":
    deep_check()

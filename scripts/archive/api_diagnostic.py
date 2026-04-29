import requests
import json
import os
from token_manager import load_tokens

def check_api_status():
    tokens = load_tokens()
    if not tokens or not tokens.get('access_token'):
        print("❌ Error: No access token found.")
        return
    
    access_token = tokens['access_token']
    headers = {
        'Authorization': f'Bearer {access_token}',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
    
    endpoints = [
        ("User Me", "https://api.mercadolibre.com/users/me"),
        ("Orders (MLB)", "https://api.mercadolibre.com/marketplace/orders/search?seller=3164139599"),
        ("Item Detail", "https://api.mercadolibre.com/items/MLB4611129129"),
        ("Marketplace Item", "https://api.mercadolibre.com/marketplace/items/MLB4611129129"),
        ("Seller Reputation", "https://api.mercadolibre.com/users/3164139599/seller_reputation"),
        ("Reputation Matrix", "https://api.mercadolibre.com/users/3164139599/reputation_matrix")
    ]
    
    print("--- Mercado Libre API Diagnostic ---")
    for name, url in endpoints:
        try:
            res = requests.get(url, headers=headers, timeout=10)
            print(f"[{name}] Status: {res.status_code}")
            if res.status_code != 200:
                print(f"  Response: {res.text[:100]}...")
        except Exception as e:
            print(f"[{name}] Exception: {e}")

if __name__ == "__main__":
    check_api_status()

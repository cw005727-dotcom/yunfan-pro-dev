import sqlite3
import requests
import json
from token_manager import load_tokens

DB_PATH = "/Users/chensan/yunfan-pro-dev/mercadolibre.db"

def get_real_counts():
    tokens = load_tokens()
    if not tokens:
        print("Error: No tokens found.")
        return None
        
    access_token = tokens.get("access_token")
    
    # Dajie Shop sub-account user IDs
    stores = {
        "MLM": "3164142227",
        "MCO": "3164142229",
        "MLA": "3164144057",
        "MLB": "3164144051"
    }
    
    results = {}
    
    for site, uid in stores.items():
        # ML API for search items
        url = f"https://api.mercadolibre.com/users/{uid}/items/search?status=active"
        headers = {"Authorization": f"Bearer {access_token}"}
        
        try:
            resp = requests.get(url, headers=headers, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                total = data.get('paging', {}).get('total', 0)
                results[site] = total
            else:
                results[site] = f"Error {resp.status_code}: {resp.text[:50]}"
        except Exception as e:
            results[site] = f"Exception: {str(e)}"
            
    return results

if __name__ == "__main__":
    counts = get_real_counts()
    if counts:
        print(json.dumps(counts, indent=2, ensure_ascii=False))

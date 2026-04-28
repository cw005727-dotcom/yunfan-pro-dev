import requests
import json
from token_manager import load_tokens

def get_active_item_marketplaces():
    tokens = load_tokens()
    token = tokens.get("access_token")
    user_id = "3164139599"
    headers = {"Authorization": f"Bearer {token}"}
    
    # Search for active items
    url = f"https://api.mercadolibre.com/users/{user_id}/items/search?status=active"
    resp = requests.get(url, headers=headers)
    
    if resp.status_code == 200:
        ids = resp.json().get('results', [])[:10]
        ids_str = ",".join(ids)
        url_details = f"https://api.mercadolibre.com/items?ids={ids_str}"
        resp_details = requests.get(url_details, headers=headers)
        return resp_details.json()
    else:
        return f"Error: {resp.status_code} - {resp.text}"

if __name__ == "__main__":
    data = get_active_item_marketplaces()
    print(json.dumps(data, indent=2))

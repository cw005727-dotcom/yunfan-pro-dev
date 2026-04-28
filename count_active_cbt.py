import requests
import json
from token_manager import load_tokens

def count_active_cbt():
    tokens = load_tokens()
    token = tokens.get("access_token")
    user_id = "3164139599"
    headers = {"Authorization": f"Bearer {token}"}
    
    # Search for active items
    url = f"https://api.mercadolibre.com/users/{user_id}/items/search?status=active"
    resp = requests.get(url, headers=headers)
    
    if resp.status_code == 200:
        return resp.json().get('paging', {}).get('total', 0)
    else:
        return f"Error: {resp.status_code} - {resp.text}"

if __name__ == "__main__":
    count = count_active_cbt()
    print(count)

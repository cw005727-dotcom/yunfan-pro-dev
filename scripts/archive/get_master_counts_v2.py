import requests
import json
from token_manager import load_tokens

def get_master_counts():
    tokens = load_tokens()
    token = tokens.get("access_token")
    user_id = "3164139599"
    headers = {"Authorization": f"Bearer {token}"}
    
    # Try searching for items of the master account
    url = f"https://api.mercadolibre.com/users/{user_id}/items/search"
    resp = requests.get(url, headers=headers)
    
    if resp.status_code == 200:
        return resp.json()
    else:
        return f"Error: {resp.status_code} - {resp.text}"

if __name__ == "__main__":
    data = get_master_counts()
    print(json.dumps(data, indent=2))

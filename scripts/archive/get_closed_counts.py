import requests
import json
from token_manager import load_tokens

def get_closed_counts():
    tokens = load_tokens()
    token = tokens.get("access_token")
    user_id = "3164139599"
    headers = {"Authorization": f"Bearer {token}"}
    
    # Search for closed/inactive items
    # statuses can be: active, closed, inactive, under_review
    url = f"https://api.mercadolibre.com/users/{user_id}/items/search?status=closed"
    resp = requests.get(url, headers=headers)
    
    if resp.status_code == 200:
        return resp.json()
    else:
        return f"Error: {resp.status_code} - {resp.text}"

if __name__ == "__main__":
    data = get_closed_counts()
    print(json.dumps(data, indent=2))

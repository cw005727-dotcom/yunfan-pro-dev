import requests
import json
from token_manager import load_tokens

def get_item_details(item_ids):
    tokens = load_tokens()
    token = tokens.get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    
    # ML multiget items
    ids_str = ",".join(item_ids)
    url = f"https://api.mercadolibre.com/items?ids={ids_str}"
    resp = requests.get(url, headers=headers)
    
    if resp.status_code == 200:
        return resp.json()
    else:
        return f"Error: {resp.status_code} - {resp.text}"

if __name__ == "__main__":
    # Sample first 5 items from the previous search results
    sample_ids = [
        "CBT3099624211",
        "CBT3099976787",
        "CBT3785225974",
        "CBT3199554595",
        "CBT3199517487"
    ]
    data = get_item_details(sample_ids)
    print(json.dumps(data, indent=2))

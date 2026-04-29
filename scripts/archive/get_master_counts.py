import requests
import json

def get_master_counts():
    token = "APP_USR-2853782117476515-042721-865415a0a526ab96fe4f54a49c603c12-3164139599"
    user_id = "3164139599"
    headers = {"Authorization": f"Bearer {token}"}
    
    url = f"https://api.mercadolibre.com/users/{user_id}/items/search"
    resp = requests.get(url, headers=headers)
    
    if resp.status_code == 200:
        return resp.json().get('paging', {}).get('total', 0)
    else:
        return f"Error: {resp.status_code} - {resp.text}"

if __name__ == "__main__":
    count = get_master_counts()
    print(count)

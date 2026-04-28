import requests
from token_manager import save_tokens, load_tokens

# Valid credentials found in previous steps
CLIENT_ID = "2853782117476515"
CLIENT_SECRET = "0pxmJU6zBiOJ4LyNokerwH4I835ykX3F"
REFRESH_TOKEN = "TG-69eed0530f13d00001beb7e6-3164139599"

def refresh_and_update():
    print("Refreshing token...")
    url = "https://api.mercadolibre.com/oauth/token"
    payload = {
        "grant_type": "refresh_token",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "refresh_token": REFRESH_TOKEN
    }
    resp = requests.post(url, data=payload)
    if resp.status_code == 200:
        new_tokens = resp.json()
        save_tokens(new_tokens)
        print("Token refreshed and saved successfully.")
    else:
        print(f"Failed to refresh: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    refresh_and_update()

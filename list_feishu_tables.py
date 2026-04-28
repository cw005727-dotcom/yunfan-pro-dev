import requests
import json

APP_TOKEN = "I8OlbQZMwaVh08sdFvIcrcW3nbc"
APP_ID = "cli_a961df038bf91bef"
APP_SECRET = "ZscQxQ8XnK7oYp98M7iUebN5c6i7mN7B"

def get_tenant_access_token():
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    payload = json.dumps({
        "app_id": APP_ID,
        "app_secret": APP_SECRET
    })
    headers = {'Content-Type': 'application/json'}
    response = requests.request("POST", url, headers=headers, data=payload)
    return response.json().get("tenant_access_token")

def list_tables(token):
    url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{APP_TOKEN}/tables"
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.request("GET", url, headers=headers)
    return response.json()

token = get_tenant_access_token()
print(json.dumps(list_tables(token), indent=2, ensure_ascii=False))

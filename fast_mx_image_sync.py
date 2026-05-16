import os
import requests
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

APP_ID = "cli_a961df038bf91bef"
APP_SECRET = "z0GNqwraH2qEjSXMvvQERkb5KPl4nTe6"
APP_TOKEN = "XBeUbvVA9aK8AGs4tSncGYlenHe"
TABLE_ID = "tblSL9vwZ7kVMaSB"

def get_tenant_access_token():
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    payload = {"app_id": APP_ID, "app_secret": APP_SECRET}
    resp = requests.post(url, json=payload)
    return resp.json().get("tenant_access_token")

def get_all_records(token):
    records = []
    page_token = ""
    while True:
        url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/records?page_size=100&page_token={page_token}"
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(url, headers=headers)
        data = resp.json().get("data", {})
        records.extend(data.get("items", []))
        if not data.get("has_more"):
            break
        page_token = data.get("page_token")
    return records

def upload_image(token, image_url, file_name):
    try:
        img_data = requests.get(image_url, timeout=15).content
        url = "https://open.feishu.cn/open-apis/drive/v1/medias/upload_all"
        headers = {"Authorization": f"Bearer {token}"}
        files = {"file": (file_name, img_data)}
        data = {
            "file_name": file_name,
            "parent_type": "bitable_file",
            "parent_node": APP_TOKEN,
            "size": len(img_data)
        }
        resp = requests.post(url, headers=headers, data=data, files=files)
        res_json = resp.json()
        if res_json.get("code") == 0:
            return res_json.get("data", {}).get("file_token")
    except:
        pass
    return None

def process_record(token, record_id, image_url):
    file_token = upload_image(token, image_url, f"{record_id}.webp")
    if file_token:
        return record_id, file_token
    return record_id, None

def fast_sync():
    token = get_tenant_access_token()
    if not token: return

    # 1. Load local map
    url_to_img = {}
    files = ["beauty_3c_data.json", "auto_fashion_data.json", "pets_home_data.json"]
    for f in files:
        path = os.path.join("/Users/chensan/yunfan-pro-dev/", f)
        if os.path.exists(path):
            with open(path, 'r') as jf:
                data = json.load(jf)
                for item in data:
                    url = item.get("url") or item.get("URL") or item.get("product_url")
                    img = item.get("image_url") or item.get("imgUrl") or item.get("image")
                    if url and img:
                        url_to_img[url] = img

    print(f"Loaded {len(url_to_img)} image mappings from local files.")

    # 2. Get records from Bitable
    print("Fetching records from Bitable...")
    all_records = get_all_records(token)
    print(f"Found {len(all_records)} records in Bitable.")

    # 3. Filter records needing update
    to_process = []
    for rec in all_records:
        fields = rec.get("fields", {})
        if not fields.get("主图"):
            source_url = fields.get("来源链接")
            if source_url in url_to_img:
                to_process.append((rec.get("record_id"), url_to_img[source_url]))

    print(f"Found {len(to_process)} records to update.")

    # 4. Parallel Process
    updated_tokens = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(process_record, token, rid, img): rid for rid, img in to_process}
        for future in as_completed(futures):
            rid, ftoken = future.result()
            if ftoken:
                updated_tokens.append({"record_id": rid, "fields": {"主图": [{"file_token": ftoken}]}})
                print(f"Uploaded image for {rid}")

    # 5. Batch Update
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    for i in range(0, len(updated_tokens), 500):
        batch = updated_tokens[i:i+500]
        url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/records/batch_update"
        resp = requests.post(url, headers=headers, json={"records": batch})
        print(f"Batch update {i//500 + 1}: {resp.status_code}")

if __name__ == "__main__":
    fast_sync()

import json
import requests
import time
import os

APP_ID = "cli_a961df038bf91bef"
APP_SECRET = "z0GNqwraH2qEjSXMvvQERkb5KPl4nTe6"
APP_TOKEN = "XBeUbvVA9aK8AGs4tSncGYlenHe"
TABLE_ID = "tbljKKsIybgdDrvc"

CATEGORY_MAP = {
    "Beleza e Cuidado Pessoal": "美妆个护",
    "Eletrônicos, Áudio e Vídeo": "3C配件",
    "Acessórios para Veículos": "汽摩配件",
    "Calçados, Roupas e Bolsas": "时尚配饰",
    "Animais": "宠物用品",
    "Casa, Móveis e Decoração": "家居日用"
}

def get_tenant_access_token():
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    payload = {"app_id": APP_ID, "app_secret": APP_SECRET}
    resp = requests.post(url, json=payload)
    return resp.json().get("tenant_access_token")

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

def sync_br_data(records_data):
    token = get_tenant_access_token()
    if not token:
        print("Failed to get token")
        return

    processed_records = []
    for item in records_data:
        raw_cat = item.get("category")
        category = CATEGORY_MAP.get(raw_cat, raw_cat)
        
        # Parse Price
        price_raw = item.get("price") or item.get("priceBRL") or item.get("price_brl") or 0
        try:
            price = float(str(price_raw).replace("R$", "").replace(",", ".").replace(" ", "").strip())
        except:
            price = 0

        # Image Upload
        img_url = item.get("image_url") or item.get("imgUrl")
        file_token = None
        if img_url:
            print(f"Uploading image for: {item.get('title')[:30]}...")
            file_token = upload_image(token, img_url, "product_img.webp")

        fields = {
            "商品标题": item.get("title"),
            "类目": category,
            "目标站点": "BR",
            "原价": price,
            "原币种": "BRL",
            "重量(g)": 150, # Default estimate
            "销量排名": int(item.get("rank") or 0),
            "来源链接": item.get("url") or item.get("product_url")
        }
        if file_token:
            fields["主图"] = [{"file_token": file_token}]
            
        processed_records.append({"fields": fields})

    # Sync in batches
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    for i in range(0, len(processed_records), 50):
        batch = processed_records[i:i+50]
        url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/records/batch_create"
        resp = requests.post(url, headers=headers, json={"records": batch})
        print(f"Syncing BR Batch {i//50 + 1}: {resp.status_code}")

def sync_br_data_from_local():
    token = get_tenant_access_token()
    if not token: return

    paths = [
        '/Users/chensan/yunfan-pro-dev/beauty_3c_data.json',
        '/Users/chensan/yunfan-pro-dev/auto_fashion_data.json',
        '/Users/chensan/yunfan-pro-dev/pets_home_data.json'
    ]
    
    all_items = []
    for path in paths:
        if os.path.exists(path):
            with open(path, 'r') as f:
                data = json.load(f)
                all_items.extend(data)
    
    print(f"Total BR items to sync: {len(all_items)}")
    
    processed_records = []
    for item in all_items:
        raw_cat = item.get("category")
        category = CATEGORY_MAP.get(raw_cat, raw_cat)
        
        # 兼容处理价格键名 (将误记的 mxn 纠正为 brl)
        price_val = item.get("price_brl") or item.get("priceBRL") or item.get("price_mxn") or item.get("price") or 0
        try:
            if isinstance(price_val, str):
                price = float(price_val.replace("R$", "").replace(",", ".").replace(" ", "").strip())
            else:
                price = float(price_val)
        except:
            price = 0

        img_url = item.get("image_url") or item.get("imgUrl") or item.get("image")
        file_token = None
        if img_url:
            file_token = upload_image(token, img_url, "br_prod.webp")

        fields = {
            "商品标题": item.get("title"),
            "类目": category,
            "目标站点": "BR",
            "原价": price,
            "原币种": "BRL",
            "重量(g)": 150,
            "销量排名": int(item.get("sales_rank") or item.get("rank") or 0),
            "来源链接": item.get("url") or item.get("product_url")
        }
        if file_token:
            fields["主图"] = [{"file_token": file_token}]
            
        processed_records.append({"fields": fields})

    # 分批上传
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    for i in range(0, len(processed_records), 50):
        batch = processed_records[i:i+50]
        url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/records/batch_create"
        requests.post(url, headers=headers, json={"records": batch})
        print(f"Synced BR Batch {i//50 + 1}")

if __name__ == "__main__":
    sync_br_data_from_local()

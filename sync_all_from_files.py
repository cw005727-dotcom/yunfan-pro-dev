import json
import requests
import os

APP_TOKEN = "XBeUbvVA9aK8AGs4tSncGYlenHe"
TABLE_ID = "tblSL9vwZ7kVMaSB"
APP_ID = "cli_a961df038bf91bef"
APP_SECRET = "z0GNqwraH2qEjSXMvvQERkb5KPl4nTe6"

CATEGORY_MAP = {
    "Belleza y Cuidado Personal": "美妆个护",
    "Beauty & Personal Care": "美妆个护",
    "Electrónica, Audio y Video": "3C配件",
    "3C/Electronics": "3C配件",
    "Accesorios para Vehículos": "汽摩配件",
    "Auto & Motorcycle Accessories": "汽摩配件",
    "Ropa, Bolsas y Calzado": "时尚配饰",
    "Fashion Accessories": "时尚配饰",
    "Animales y Mascotas": "宠物用品",
    "Pet Supplies": "宠物用品",
    "Hogar, Muebles y Jardín": "家居日用",
    "Home & Daily Use": "家居日用",
    "Home & Kitchen": "家居日用"
}

def get_tenant_access_token():
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    payload = {"app_id": APP_ID, "app_secret": APP_SECRET}
    resp = requests.post(url, json=payload)
    return resp.json().get("tenant_access_token")

def sync_records(records_data):
    token = get_tenant_access_token()
    if not token:
        print("Failed to get token")
        return

    records = []
    for item in records_data:
        raw_cat = item.get("category") or item.get("Category")
        category = CATEGORY_MAP.get(raw_cat, raw_cat)
        
        weight_str = str(item.get("estimated_weight") or item.get("Estimated Weight") or item.get("weight") or "150g")
        try:
            weight = float(weight_str.replace("g", "").replace("G", "").replace(" MXN", "").strip())
        except:
            weight = 150
        
        if weight > 500: continue

        price_val = item.get("price_mxn") or item.get("Price (MXN)") or item.get("price") or 0
        try:
            price = float(str(price_val).replace("MXN", "").replace("$", "").replace(",", "").strip())
        except:
            price = 0

        fields = {
            "商品标题": item.get("title") or item.get("Title"),
            "类目": category,
            "目标站点": "MX",
            "原价": price,
            "原币种": "MXN",
            "重量(g)": weight,
            "销量排名": int(item.get("sales_rank") or item.get("Sales Rank") or item.get("rank") or 0),
            "来源链接": item.get("url") or item.get("URL")
        }
        records.append({"fields": fields})

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    for i in range(0, len(records), 500):
        batch = records[i:i+500]
        url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/records/batch_create"
        resp = requests.post(url, headers=headers, json={"records": batch})
        print(f"Syncing batch {i//500 + 1}: {resp.status_code}")
        res_json = resp.json()
        if res_json.get("code") != 0:
            print(f"Error: {res_json.get('msg')}")
        else:
            created_count = len(res_json.get("data", {}).get("records", []))
            print(f"Successfully created {created_count} records.")

if __name__ == "__main__":
    all_data = []
    files = ["beauty_3c_data.json", "auto_fashion_data.json", "pets_home_data.json"]
    for f in files:
        path = os.path.join("/Users/chensan/yunfan-pro-dev/", f)
        if os.path.exists(path):
            with open(path, 'r') as jf:
                try:
                    all_data.extend(json.load(jf))
                except Exception as e:
                    print(f"Error loading {f}: {e}")
    
    if all_data:
        print(f"Total products to sync: {len(all_data)}")
        sync_records(all_data)
    else:
        print("No data found in files.")

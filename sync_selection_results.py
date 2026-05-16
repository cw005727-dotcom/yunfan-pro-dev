import json
import subprocess
import time

APP_TOKEN = "LYJqbiLDDabMuQsk678coSU6nR7"
TABLE_ID = "tblLKE2Jz930AP0y"

# Consistently mapping category names to the user's requested Chinese names
CATEGORY_MAP = {
    "Beauty & Personal Care": "美妆个护",
    "3C/Electronics": "3C配件",
    "Auto & Motorcycle Accessories": "汽摩配件",
    "Fashion Accessories": "时尚配饰",
    "Pet Supplies": "宠物用品",
    "Home & Daily Use": "家居日用"
}

def sync_records(data):
    records = []
    for item in data:
        # Determine category
        raw_cat = item.get("category") or item.get("Category")
        category = CATEGORY_MAP.get(raw_cat, raw_cat)
        
        # Parse weight (remove 'g')
        weight_str = str(item.get("estimated_weight") or item.get("Estimated Weight") or "0")
        weight = float(weight_str.replace("g", "").strip())
        
        # Skip if weight > 500g
        if weight > 500:
            continue

        fields = {
            "商品标题": item.get("title") or item.get("Title"),
            "类目": category,
            "目标站点": "MX",
            "来源平台": "Mercado Libre",
            "原价": float(item.get("price_mxn") or item.get("Price (MXN)") or item.get("price") or 0),
            "原币种": "MXN",
            "重量(g)": weight,
            "销量排名": int(item.get("sales_rank") or item.get("Sales Rank") or item.get("rank") or 0),
            "来源链接": item.get("url") or item.get("URL")
        }
        records.append({"fields": fields})

    # Batch create in chunks of 50
    for i in range(0, len(records), 50):
        batch = records[i:i+50]
        payload = json.dumps({"records": batch})
        cmd = [
            "lark-cli", "api", "POST",
            f"/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/records/batch_create",
            "--data", payload,
            "--as", "bot"
        ]
        print(f"Syncing batch {i//50 + 1}...")
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error: {result.stderr}")
        else:
            print(f"Success: {result.stdout[:100]}...")

if __name__ == "__main__":
    # In a real scenario, we'd read from the sub-agent result files.
    # Here I'll provide a placeholder or load from a specific file if saved.
    # Since I don't have the files yet, I'll provide the script structure.
    pass

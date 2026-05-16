import requests
import json
import re
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

# 配置信息
APP_ID = "cli_a961df038bf91bef"
APP_SECRET = "z0GNqwraH2qEjSXMvvQERkb5KPl4nTe6"
APP_TOKEN = "XBeUbvVA9aK8AGs4tSncGYlenHe"
TABLE_ID = "tblSL9vwZ7kVMaSB"

def get_tenant_access_token():
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    payload = {"app_id": APP_ID, "app_secret": APP_SECRET}
    resp = requests.post(url, json=payload)
    return resp.json().get("tenant_access_token")

def extract_ml_id(url):
    # 提取类似 MLM123456 或 MLM-123456 的 ID
    match = re.search(r'(MLM-?\d+|MLU-?\d+)', url)
    if match:
        return match.group(1).replace("-", "")
    return None

def get_ml_item_images(ml_ids):
    results = {}
    for i in range(0, len(ml_ids), 20):
        ids_chunk = ml_ids[i:i+20]
        # 使用美客多前端图片代理接口 (不需要 Token)
        # 格式: https://http2.mlstatic.com/D_NQ_NP_616004117-F.jpg (这种是推测，可能不对)
        # 最稳妥：使用 api.mercadolibre.com/items 接口，但必须加上授权或通过其他非屏蔽区域
        # 既然 403，我们尝试使用搜索接口批量获取图片
        url = f"https://api.mercadolibre.com/items?ids={','.join(ids_chunk)}"
        try:
            # 尝试通过本地 curl 获取内容再解析
            import subprocess
            cmd = f'curl -s "{url}"'
            output = subprocess.check_output(cmd, shell=True).decode('utf-8')
            data = json.loads(output)
            for item in data:
                if isinstance(item, dict) and item.get('code') == 200:
                    body = item.get('body', {})
                    img_url = body.get('secure_thumbnail') or body.get('thumbnail')
                    if body.get('pictures'):
                        img_url = body['pictures'][0].get('secure_url') or body['pictures'][0].get('url')
                    results[body.get('id')] = img_url
                    print(f"Fetched image for {body.get('id')}")
        except Exception as e:
            print(f"Curl Error: {e}")
    return results

def upload_to_feishu_drive(token, image_url, record_id):
    try:
        img_data = requests.get(image_url, timeout=10).content
        url = "https://open.feishu.cn/open-apis/drive/v1/medias/upload_all"
        headers = {"Authorization": f"Bearer {token}"}
        file_name = f"{record_id}.webp"
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

def run_sync():
    token = get_tenant_access_token()
    # 读取之前保存的缺失主图列表
    with open('/Users/chensan/yunfan-pro-dev/mx_missing_images.json', 'r') as f:
        missing_list = json.load(f)

    # 1. 映射 RecordID 到 ML_ID
    rid_to_mlid = {}
    mlid_to_rid = {}
    for item in missing_list:
        ml_id = extract_ml_id(item['url'])
        if ml_id:
            rid_to_mlid[item['id']] = ml_id
            mlid_to_rid[ml_id] = item['id']

    print(f"Mapped {len(rid_to_mlid)} IDs for API query.")

    # 2. 调用美客多 API 获取图片链接
    ml_ids = list(mlid_to_rid.keys())
    ml_id_to_img = get_ml_item_images(ml_ids)
    print(f"Successfully fetched {len(ml_id_to_img)} image URLs from ML API.")

    # 3. 上传图片并准备更新数据
    final_updates = []
    
    def process_one(ml_id, img_url):
        record_id = mlid_to_rid[ml_id]
        file_token = upload_to_feishu_drive(token, img_url, record_id)
        if file_token:
            return {"record_id": record_id, "fields": {"主图": [{"file_token": file_token}]}}
        return None

    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(process_one, mid, iurl) for mid, iurl in ml_id_to_img.items()]
        for future in as_completed(futures):
            res = future.result()
            if res:
                final_updates.append(res)
                if len(final_updates) % 10 == 0:
                    print(f"Processed {len(final_updates)} images...")

    # 4. 批量更新多维表格
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    for i in range(0, len(final_updates), 500):
        batch = final_updates[i:i+500]
        url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/records/batch_update"
        requests.post(url, headers=headers, json={"records": batch})
        print(f"Batch update {i//500 + 1} completed.")

if __name__ == "__main__":
    run_sync()

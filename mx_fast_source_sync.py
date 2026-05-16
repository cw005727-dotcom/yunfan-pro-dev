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

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
    "Accept-Language": "es-MX,es;q=0.9",
    "Cookie": "x-hng=lang=zh-CN&domain=www.mercadolibre.com.mx; _d2id=616ec803-fecb-41fc-aae7-716f5182055c; _hjSessionUser_720735=eyJpZCI6ImE3MjdiYjQ3LWIxYzYtNTZlMS05NGQxLTI2NjQ3NTcyYjYxOCIsImNyZWF0ZWQiOjE3NzU3MDUzODExOTcsImV4aXN0aW5nIjp0cnVlfQ==; g_state={\"i_l\":0,\"i_ll\":1775705568902,\"i_b\":\"s1Inf4ACtkuUOyTgxALtfqOH5AHwfgG3Yd1Z+TUxPzQ\",\"i_e\":{\"enable_itp_optimization\":0}}; orguserid=7HZ077tZTTtH4; orguseridp=3286244639; orgnickp=JQ20260323020739; cookiesPreferencesNotLogged=%7B%22categories%22%3A%7B%22advertising%22%3Atrue%2C%22functionality%22%3Atrue%2C%22performance%22%3Atrue%2C%22traceability%22%3Atrue%7D%7D; _fbp=fb.2.1775706446202.144664889927901608; _tt_enable_cookie=1; _ttp=01KNR5M6M2HMWP225FMD05538V_.tt.2; _pin_unauth=dWlkPU1qRXpaV000TURRdE56VTBOaTAwWW1Nd0xXRmpaRFV0TURGak9EazJOelUwTnpJdw; cookiesPreferencesLoggedFallback=%7B%22userId%22%3A3286244639%2C%22categories%22%3A%7B%22advertising%22%3Atrue%2C%22functionality%22%3Atrue%2C%22performance%22%3Atrue%2C%22traceability%22%3Atrue%7D%7D; modal-configuration={\"cbt_modal\":{\"view_cnt\":2,\"close_cnt\":0,\"view_time\":1776417948,\"close_time\":0}}; ttcsid_CCH2LGJC77U7LPPFS3H0=1776417947246::QyMIgLG-2G8L6OKkEBa0.6.1776418005075.1; ttcsid=1776417947248::lnBKyrUoAkyxOo-hmevd.6.1776418005075.0::1.52766.57216::43887.4.652.80::71528.23.2601; _ga=GA1.3.86242527.1776847820; _hjSessionUser_783944=eyJpZCI6IjYyODk1NDZiLWZlNjgtNTkzZC1hNmNmLTkzNzNkNmViNDZiYSIsImNyZWF0ZWQiOjE3NzY4NDc4MzYyMDIsImV4aXN0aW5nIjp0cnVlfQ==; main_domain=; main_attributes=; categories=; backend_dejavu_info=j%3A%7B%7D; ml_cart-quantity=0; QSI_HistorySession=https%3A%2F%2Fwww.mercadolibre.com.mx%2F30-minute-teeth-whitening-strips-brighten-teeth%2Fp%2FMLM2062744779%3Fspm%3D4e67c6a7.2429d199.0.0.310676cfYiCq67~1778551544901; _mldataSessionId=72c85050-cb58-43c8-9e3f-ae4c1928673a; LAST_SEARCH=joyeria%20internacional; cookiesPreferencesLogged=%7B%22userId%22%3A3286244639%2C%22categories%22%3A%7B%22advertising%22%3Atrue%2C%22functionality%22%3Atrue%2C%22performance%22%3Atrue%2C%22traceability%22%3Atrue%7D%7D; _gcl_au=1.1.842137637.1775706446.1034276380.1778551186.1778563156; hide-cookie-banner=3286244639-COOKIE_PREFERENCES_ALREADY_SET; last_query=protector%20bucal%20deportivo%20para%20adultos%20ninos%20proteccion%20denta; category=MLM1276; _snoopy=eyJmaW5nZXJwcmludCI6IkJWQmFFaDNvU1pJMWdnaFhOa0dyUktJYmZTcjJXSlVkb3BkeHR6K1pwWnNDMjJNWWhVNFhYekRtbGlJUkp2NHgvQWtPQ0ZJUU9GNkpMSUNDMmk3TGFiODhiY3ZOSXR2eXovVkdrRHNOSnc4U01UZGkyME9HVk80TmUydm51c0l4UDBmbnZYamtrYUNkUFltUWxPS1d4SHZRbGFZODJkM2JJY3FKUmFZQUkva2VmaEs3UnRVPSIsImtleSI6IkNraElwSkFGU3lnWXZBMHBlQW4vVXZoMnB5ZFJDWkpCNVhqUmVtSEk5ZWRIa095T3BuL0cvcEFza3JZRk9DaFF4eEdiTThoaUdERnVFZUltazNkb0RPOEk2dkp5eTB5MiJ9; _hjSession_720735=eyJpZCI6ImEwZTg3ZWZmLWJkY2YtNGYxYy05ZmU1LTZlNzE2NTdkZjE2MCIsImMiOjE3Nzg1NjM5Mzg0NTMsInMiOjAsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjowLCJzcCI6MX0="
}

def get_tenant_access_token():
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    payload = {"app_id": APP_ID, "app_secret": APP_SECRET}
    resp = requests.post(url, json=payload)
    return resp.json().get("tenant_access_token")

def extract_og_image(url):
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        if resp.status_code == 200:
            # 尝试多种正则匹配方式
            match = re.search(r'property="og:image"\s+content="([^"]+)"', resp.text)
            if not match:
                match = re.search(r'content="([^"]+)"\s+property="og:image"', resp.text)
            if not match:
                match = re.search(r'meta\s+name="twitter:image"\s+content="([^"]+)"', resp.text)
            
            if match:
                img_url = match.group(1)
                print(f"Found image: {img_url[:50]}...")
                return img_url
            else:
                print(f"Regex failed for {url[:50]}")
        else:
            print(f"Status {resp.status_code} for {url[:50]}")
    except Exception as e:
        print(f"Fetch Error: {e}")
    return None

def upload_to_feishu_drive(token, image_url, record_id):
    try:
        img_resp = requests.get(image_url, timeout=10)
        if img_resp.status_code != 200:
            print(f"Image download failed: {img_resp.status_code}")
            return None
        img_data = img_resp.content
        
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
            token = res_json.get("data", {}).get("file_token")
            print(f"Upload success: {token[:15]}...")
            return token
        else:
            print(f"Upload API error: {res_json.get('msg')}")
    except Exception as e:
        print(f"Upload exception: {e}")
    return None

def run_sync():
    token = get_tenant_access_token()
    if not token: return

    # 读取缺失主图列表
    with open('/Users/chensan/yunfan-pro-dev/mx_missing_images.json', 'r') as f:
        missing_list = json.load(f)

    print(f"Starting fast sync for {len(missing_list)} records...")
    
    final_updates = []
    
    def process_one(record):
        img_url = extract_og_image(record['url'])
        if img_url and 'logo_homecom_v2.png' not in img_url:
            file_token = upload_to_feishu_drive(token, img_url, record['id'])
            if file_token:
                return {"record_id": record['id'], "fields": {"主图": [{"file_token": file_token}]}}
        return None

    # 并发抓取和上传 (限制 5 个线程，保持低负载)
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(process_one, r) for r in missing_list]
        for future in as_completed(futures):
            res = future.result()
            if res:
                final_updates.append(res)
                if len(final_updates) % 5 == 0:
                    print(f"Synced {len(final_updates)} images so far...")

    # 批量更新飞书
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    for i in range(0, len(final_updates), 500):
        batch = final_updates[i:i+500]
        url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/records/batch_update"
        requests.post(url, headers=headers, json={"records": batch})
        print(f"Batch update completed: {len(batch)} records.")

if __name__ == "__main__":
    run_sync()

import os
import requests
import json
import time

APP_ID = "cli_a961df038bf91bef"
APP_SECRET = "z0GNqwraH2qEjSXMvvQERkb5KPl4nTe6"
APP_TOKEN = "XBeUbvVA9aK8AGs4tSncGYlenHe"
TABLE_ID = "tblSL9vwZ7kVMaSB"

def get_tenant_access_token():
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    payload = {"app_id": APP_ID, "app_secret": APP_SECRET}
    resp = requests.post(url, json=payload)
    return resp.json().get("tenant_access_token")

def upload_image(token, image_url, file_name):
    # Download image
    try:
        img_data = requests.get(image_url, timeout=10).content
    except Exception as e:
        print(f"Failed to download {image_url}: {e}")
        return None

    # Upload to Lark
    url = "https://open.feishu.cn/open-apis/drive/v1/medias/upload_all"
    headers = {"Authorization": f"Bearer {token}"}
    files = {
        "file": (file_name, img_data),
    }
    data = {
        "file_name": file_name,
        "parent_type": "bitable_file",
        "parent_node": APP_TOKEN,
        "size": len(img_data)
    }
    try:
        resp = requests.post(url, headers=headers, data=data, files=files)
        res_json = resp.json()
        if res_json.get("code") == 0:
            return res_json.get("data", {}).get("file_token")
        else:
            print(f"Upload failed: {res_json}")
    except Exception as e:
        print(f"Upload exception: {e}")
    return None

def update_record(token, record_id, file_token):
    url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/records/{record_id}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {
        "fields": {
            "主图": [{"file_token": file_token}]
        }
    }
    try:
        resp = requests.put(url, headers=headers, json=payload)
        return resp.json().get("code") == 0
    except Exception as e:
        print(f"Update failed: {e}")
    return False

if __name__ == "__main__":
    image_data = [
        {"id": "recvjnfi6fvhNt", "image_url": "https://http2.mlstatic.com/D_NQ_NP_685479-CBT47514645773_092021-O-juego-de-peluqueria-corte-de-cabello-profesional-tijera-con.webp"},
        {"id": "recvjnfi6fESQM", "image_url": "https://http2.mlstatic.com/D_NQ_NP_645551-MLA96770999254_112025-O.webp"},
        {"id": "recvjnfi6fBUil", "image_url": "https://http2.mlstatic.com/D_NQ_NP_983677-CBT72883459164_112023-O.webp"},
        {"id": "recvjnfi6fv27W", "image_url": "https://http2.mlstatic.com/D_NQ_NP_717491-MLM84281376546_052025-O-playera-camiseta-manga-hentai-porn-hub-waifu-envio-gratis.webp"},
        {"id": "recvjnfi6fUbae", "image_url": "https://http2.mlstatic.com/D_NQ_NP_750148-MLM104319453179_012026-O.webp"},
        {"id": "recvjnfi6f56rc", "image_url": "https://http2.mlstatic.com/D_NQ_NP_814186-CBT109427599292_042026-O-cortina-de-ducha-impermeable-180x180-cm-con-ganchos.webp"},
        {"id": "recvjnfpLUlu2S", "image_url": "https://http2.mlstatic.com/D_NQ_NP_685479-CBT47514645773_092021-O-juego-de-peluqueria-corte-de-cabello-profesional-tijera-con.webp"},
        {"id": "recvjnfpLUBlhP", "image_url": "https://http2.mlstatic.com/D_NQ_NP_645551-MLA96770999254_112025-O.webp"},
        {"id": "recvjnfpLUDp6n", "image_url": "https://http2.mlstatic.com/D_NQ_NP_983677-CBT72883459164_112023-O.webp"},
        {"id": "recvjnfpLUGznt", "image_url": "https://http2.mlstatic.com/D_NQ_NP_717491-MLM84281376546_052025-O-playera-camiseta-manga-hentai-porn-hub-waifu-envio-gratis.webp"},
        {"id": "recvjnfpLUrRjB", "image_url": "https://http2.mlstatic.com/D_NQ_NP_750148-MLM104319453179_012026-O.webp"},
        {"id": "recvjnfpLUCiZ0", "image_url": "https://http2.mlstatic.com/D_NQ_NP_814186-CBT109427599292_042026-O-cortina-de-ducha-impermeable-180x180-cm-con-ganchos.webp"},
        {"id": "recvjnftmK0f8a", "image_url": "https://http2.mlstatic.com/D_NQ_NP_685479-CBT47514645773_092021-O-juego-de-peluqueria-corte-de-cabello-profesional-tijera-con.webp"},
        {"id": "recvjnftmKtZ6Y", "image_url": "https://http2.mlstatic.com/D_NQ_NP_645551-MLA96770999254_112025-O.webp"},
        {"id": "recvjnftmKHQY5", "image_url": "https://http2.mlstatic.com/D_NQ_NP_983677-CBT72883459164_112023-O.webp"},
        {"id": "recvjnftmKEZ3s", "image_url": "https://http2.mlstatic.com/D_NQ_NP_717491-MLM84281376546_052025-O-playera-camiseta-manga-hentai-porn-hub-waifu-envio-gratis.webp"},
        {"id": "recvjnftmKWt1C", "image_url": "https://http2.mlstatic.com/D_NQ_NP_750148-MLM104319453179_012026-O.webp"},
        {"id": "recvjnftmKlLw5", "image_url": "https://http2.mlstatic.com/D_NQ_NP_814186-CBT109427599292_042026-O-cortina-de-ducha-impermeable-180x180-cm-con-ganchos.webp"},
        {"id": "recvjnfyaX6oDk", "image_url": "https://http2.mlstatic.com/D_NQ_NP_685479-CBT47514645773_092021-O-juego-de-peluqueria-corte-de-cabello-profesional-tijera-con.webp"},
        {"id": "recvjnfyaX4R1Y", "image_url": "https://http2.mlstatic.com/D_NQ_NP_645551-MLA96770999254_112025-O.webp"},
        {"id": "recvjnfyaX73wQ", "image_url": "https://http2.mlstatic.com/D_NQ_NP_983677-CBT72883459164_112023-O.webp"},
        {"id": "recvjnfyaXE28W", "image_url": "https://http2.mlstatic.com/D_NQ_NP_717491-MLM84281376546_052025-O-playera-camiseta-manga-hentai-porn-hub-waifu-envio-gratis.webp"},
        {"id": "recvjnfyaXY65Q", "image_url": "https://http2.mlstatic.com/D_NQ_NP_750148-MLM104319453179_012026-O.webp"},
        {"id": "recvjnfyaXYjXF", "image_url": "https://http2.mlstatic.com/D_NQ_NP_814186-CBT109427599292_042026-O-cortina-de-ducha-impermeable-180x180-cm-con-ganchos.webp"},
        {"id": "recvjng3hMlt7C", "image_url": "https://http2.mlstatic.com/D_NQ_NP_685479-CBT47514645773_092021-O-juego-de-peluqueria-corte-de-cabello-profesional-tijera-con.webp"},
        {"id": "recvjng3hML0lZ", "image_url": "https://http2.mlstatic.com/D_NQ_NP_645551-MLA96770999254_112025-O.webp"},
        {"id": "recvjng3hMGH3s", "image_url": "https://http2.mlstatic.com/D_NQ_NP_983677-CBT72883459164_112023-O.webp"},
        {"id": "recvjng3hMo95u", "image_url": "https://http2.mlstatic.com/D_NQ_NP_717491-MLM84281376546_052025-O-playera-camiseta-manga-hentai-porn-hub-waifu-envio-gratis.webp"},
        {"id": "recvjng3hMtFh2", "image_url": "https://http2.mlstatic.com/D_NQ_NP_750148-MLM104319453179_012026-O.webp"},
        {"id": "recvjng3hMm5iO", "image_url": "https://http2.mlstatic.com/D_NQ_NP_814186-CBT109427599292_042026-O-cortina-de-ducha-impermeable-180x180-cm-con-ganchos.webp"},
        {"id": "recvjng8hLgK1r", "image_url": "https://http2.mlstatic.com/D_NQ_NP_685479-CBT47514645773_092021-O-juego-de-peluqueria-corte-de-cabello-profesional-tijera-con.webp"},
        {"id": "recvjng8hLE2Lz", "image_url": "https://http2.mlstatic.com/D_NQ_NP_645551-MLA96770999254_112025-O.webp"},
        {"id": "recvjng8hLr7pB", "image_url": "https://http2.mlstatic.com/D_NQ_NP_983677-CBT72883459164_112023-O.webp"},
        {"id": "recvjng8hLu6P1", "image_url": "https://http2.mlstatic.com/D_NQ_NP_717491-MLM84281376546_052025-O-playera-camiseta-manga-hentai-porn-hub-waifu-envio-gratis.webp"},
        {"id": "recvjng8hLeLNo", "image_url": "https://http2.mlstatic.com/D_NQ_NP_750148-MLM104319453179_012026-O.webp"},
        {"id": "recvjng8hLC6wG", "image_url": "https://http2.mlstatic.com/D_NQ_NP_814186-CBT109427599292_042026-O-cortina-de-ducha-impermeable-180x180-cm-con-ganchos.webp"},
        {"id": "recvjngdiK58aO", "image_url": "https://http2.mlstatic.com/D_NQ_NP_685479-CBT47514645773_092021-O-juego-de-peluqueria-corte-de-cabello-profesional-tijera-con.webp"},
        {"id": "recvjngdiKqK6L", "image_url": "https://http2.mlstatic.com/D_NQ_NP_645551-MLA96770999254_112025-O.webp"},
        {"id": "recvjngdiKd2En", "image_url": "https://http2.mlstatic.com/D_NQ_NP_983677-CBT72883459164_112023-O.webp"},
        {"id": "recvjngdiKWXq2", "image_url": "https://http2.mlstatic.com/D_NQ_NP_717491-MLM84281376546_052025-O-playera-camiseta-manga-hentai-porn-hub-waifu-envio-gratis.webp"}
    ]

    token = get_tenant_access_token()
    if not token:
        print("Failed to get token")
        exit(1)

    for item in image_data:
        record_id = item["id"]
        img_url = item["image_url"]
        file_name = f"{record_id}.webp"
        
        print(f"Processing {record_id}...")
        file_token = upload_image(token, img_url, file_name)
        if file_token:
            success = update_record(token, record_id, file_token)
            if success:
                print(f"Successfully updated {record_id}")
            else:
                print(f"Failed to update record {record_id}")
        else:
            print(f"Failed to upload image for {record_id}")
        
        time.sleep(1)  # Avoid rate limit

from ml_api_client import MercadoLibreClient
import json
import sqlite3
import os

# 配置
CLIENT_ID = "4704295209384526"
CLIENT_SECRET = "wkHjcxmX5Pn8VZISfvkwj5rZBUcngAJN"
REDIRECT_URI = "https://ml.chensan.vip/auth/callback"
DB_PATH = "mercadolibre.db"

def populate_stores():
    if not os.path.exists("ml_tokens.json"):
        print("ml_tokens.json not found.")
        return

    with open("ml_tokens.json", "r") as f:
        tokens = json.load(f)
    
    access_token = tokens.get("access_token")
    if not access_token:
        print("No access token found.")
        return

    client = MercadoLibreClient(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
    client.access_token = access_token
    
    # 获取卖家 ID
    try:
        user_data = client.get_user_info(access_token)
        seller_id = user_data.get("id")
        nickname = user_data.get("nickname")
        print(f"Found seller: {nickname} (ID: {seller_id})")
        
        # 获取声誉数据
        reputation = client.fetch_reputation(access_token, seller_id)
        
        # 存入数据库
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # 插入或更新
        cursor.execute("""
            INSERT OR REPLACE INTO stores (id, nickname, site_id, reputation_level, transactions_total)
            VALUES (?, ?, ?, ?, ?)
        """, (
            seller_id, 
            nickname, 
            user_data.get("site_id", "MLM"), 
            reputation.get("level_id", "5_green"),
            reputation.get("transactions", {}).get("total", 0)
        ))
        
        conn.commit()
        conn.close()
        print("Stores table updated.")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    populate_stores()

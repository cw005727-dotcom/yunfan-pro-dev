import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))

import requests
import sqlite3
import time
from datetime import datetime
from token_manager import load_tokens

DB_PATH = "mercadolibre.db"
SITES = ["MLM", "MLB", "MCO", "MLA", "MLU", "MLC"]

def fetch_and_save_trends():
    tokens = load_tokens()
    if not tokens or "access_token" not in tokens:
        print("Error: No valid access token found.")
        return

    access_token = tokens["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 清理旧数据 (可选，或者保留历史进行趋势分析)
    # cursor.execute("DELETE FROM market_trends")
    
    total_count = 0
    for site in SITES:
        print(f"Fetching trends for {site}...")
        url = f"https://api.mercadolibre.com/trends/{site}"
        try:
            resp = requests.get(url, headers=headers, timeout=10)
            if resp.status_code == 200:
                trends = resp.json()
                # 记录排位，rank 越小（越靠前）热度越高
                for index, item in enumerate(trends):
                    keyword = item.get("keyword")
                    link = item.get("url")
                    rank = index + 1
                    
                    cursor.execute("""
                        INSERT OR REPLACE INTO market_trends (site_id, keyword, rank, url, last_updated)
                        VALUES (?, ?, ?, ?, ?)
                    """, (site, keyword, rank, link, datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
                    total_count += 1
                print(f"Successfully saved {len(trends)} keywords for {site}")
            elif resp.status_code == 429:
                print(f"Rate limited for {site}, skipping...")
            else:
                print(f"Failed to fetch {site}: {resp.status_code} - {resp.text}")
        except Exception as e:
            print(f"Error fetching {site}: {e}")
            
        time.sleep(1) # 礼貌性延迟
        
    conn.commit()
    conn.close()
    print(f"Total {total_count} keywords synced.")

if __name__ == "__main__":
    fetch_and_save_trends()

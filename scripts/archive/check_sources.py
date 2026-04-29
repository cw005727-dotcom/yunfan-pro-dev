#!/usr/bin/env python3
import requests, sqlite3, time
from token_manager import load_tokens

DB_PATH = "/Users/chensan/yunfan-pro-dev/mercadolibre.db"
token = load_tokens()["access_token"]
headers = {"Authorization": "Bearer " + token}

# 测试各数据源
print("=== 数据源测试 ===")

# 1. visits API
r1 = requests.get("https://api.mercadolibre.com/visits/items?ids=MLB4613789077", headers=headers, timeout=10)
d1 = r1.json()
print("1. visits API: " + str(d1.get("MLB4613789077", "N/A") + " views"))
print("   Full response: " + str(d1)[:200])
print("2. orders API:" + str(r2.status_code if r2.status_code != 200 else "ok"))
"
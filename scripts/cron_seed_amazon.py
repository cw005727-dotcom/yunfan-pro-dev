#!/usr/bin/env python3
"""每周一、四定时拉取亚马逊数据（所有站点×热销+新品）"""
import sys, os, json, time, urllib.request, ssl
sys.path.insert(0, '/home/ubuntu/yunfan-pro-dev')
os.chdir('/home/ubuntu/yunfan-pro-dev')

from fastapi_server.routes.amazon import _ensure_amazon_table, _normalize_for_db, MCP_KEY, MCP_URL
import sqlite3
from fastapi_server.config import DB_PATH

# 配置
MODE = "new"  # 只拉新品（热销数据变化慢，不每次重拉）
PAGES = 3     # 每个类目拉3页

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def mcp_call(tool, args):
    payload = json.dumps({"jsonrpc": "2.0", "method": "tools/call", "params": {"name": tool, "arguments": args}, "id": 1}).encode()
    req = urllib.request.Request(MCP_URL + "?key=" + MCP_KEY, data=payload,
        headers={"Content-Type": "application/json", "Accept": "application/json, text/event-stream", "User-Agent": "Mozilla/5.0"}, method="POST")
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    with opener.open(req, timeout=30) as resp:
        raw = resp.read().decode()
        for line in raw.split("\n"):
            if line.startswith("data: "):
                return json.loads(json.loads(line[6:])["result"]["content"][0]["text"])
    return []

_ensure_amazon_table()

sites_cats = {
    "US": ["phone", "beauty", "clothing", "home", "electronics", "toys", "sports", "automotive", "grocery", "pet supplies", "office", "garden", "baby"],
    "MX": ["electronica", "belleza", "ropa", "hogar", "juguetes"],
    "BR": ["eletronicos", "beleza", "roupas", "casa", "brinquedos"],
}

total_all = 0
for site, cats in sites_cats.items():
    all_p = []
    for cat in cats:
        for page in range(1, PAGES + 1):
            try:
                items = mcp_call("product_search", {"amzSite": site, "searchName": cat, "page": page})
                if not items or not isinstance(items, list):
                    break
                for p in items:
                    n = _normalize_for_db(p, site)
                    n["site"] = site
                    n["mode"] = MODE
                    n["category_node_id"] = ""
                    all_p.append(n)
                time.sleep(0.2)
            except:
                break
    conn = sqlite3.connect(str(DB_PATH))
    conn.execute("DELETE FROM amazon_products WHERE site=? AND mode=?", [site, MODE])
    inserted = 0
    for p in all_p:
        conn.execute("""INSERT OR IGNORE INTO amazon_products (asin, title, price, weight, monthly_sales, monthly_revenue, brand, review_count, rating, seller_country, node_id, node_name, big_category, sub_category, listed_days, launch_date, fba_fee, fulfillment, thumbnail_url, product_url, potential_index, status, fetched_at, category_node_id, site, mode) VALUES (:asin,:title,:price,:weight,:monthly_sales,:monthly_revenue,:brand,:review_count,:rating,:seller_country,:node_id,:node_name,:big_category,:sub_category,:listed_days,:launch_date,:fba_fee,:fulfillment,:thumbnail_url,:product_url,:potential_index,'pending',datetime('now','+8 hours'),:category_node_id,:site,:mode)""", p)
        inserted += 1
    conn.commit()
    conn.close()
    print(f"[{site}/{MODE}] 写入 {inserted} 条")
    total_all += inserted

print(f"总计更新 {total_all} 条")

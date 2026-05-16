#!/usr/bin/env python3
"""
亚马逊墨西哥选品拉取脚本 - 精准拉版本
拉取6大品类Top100产品 → 过滤 → 入库
"""

import subprocess
import json
import time
import sqlite3
from datetime import datetime

# ===================== 配置 =====================
DB_PATH = "/Users/chensan/yunfan-pro-dev/mercadolibre.db"
API_KEY = "znfbzeq3wwfgahdzzeznmfhxtzljqt09"
MCP_URL = "https://mcp.sorftime.com?key=" + API_KEY

# 6大品类（top-level nodeId）
CATEGORIES = [
    {"node_id": "beauty", "name": "美妆个护"},
    {"node_id": "kitchen", "name": "家居日用"},
    {"node_id": "electronics", "name": "3C配件"},
    {"node_id": "automotive", "name": "汽摩配件"},
    {"node_id": "pet-supplies", "name": "宠物用品"},
    {"node_id": "shoes", "name": "时尚配饰"},
]

# 筛选标准（第一版）
SALES_MIN = 100
MAX_REVIEWS = 500
MAX_LAUNCH_DAYS = 180  # 6个月

# ===================== 工具函数 =====================

def mcp_call(tool: str, args: dict) -> dict:
    """调用 Sorftime MCP"""
    payload = json.dumps({
        'jsonrpc': '2.0',
        'method': 'tools/call',
        'params': {'name': tool, 'arguments': args},
        'id': 1
    })
    result = subprocess.run(
        ['curl', '-s', MCP_URL, '-X', 'POST',
         '-H', 'Content-Type: application/json', '-d', payload],
        capture_output=True, text=True, timeout=60
    )
    for line in result.stdout.split('\n'):
        if line.startswith('data: '):
            return json.loads(line[6:])['result']['content'][0]['text']
    return '{"error": "no response"}'


def get_category_report(node_id: str) -> list:
    """拉取类目Top100产品"""
    r = mcp_call('category_report', {'amzSite': 'MX', 'nodeId': node_id})
    try:
        data = json.loads(r)
        if isinstance(data, dict) and 'Top100产品' in data:
            return data['Top100产品']
    except:
        pass
    return []


def get_thumbnail_url(asin: str) -> str:
    """生成亚马逊产品主图URL"""
    return f"https://images-na.ssl-images-amazon.com/images/I/{asin}._AC_US200_.jpg"


# ===================== 数据库 =====================

def init_db():
    """确保表存在"""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS product_research (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asin TEXT UNIQUE NOT NULL,
            title TEXT,
            price REAL,
            weight_g REAL,
            weight_actual_g REAL,
            monthly_sales INTEGER,
            monthly_revenue REAL,
            brand TEXT,
            category_rank TEXT,
            review_count INTEGER,
            rating REAL,
            seller_type TEXT,
            first_category TEXT,
            node_id TEXT,
            node_name TEXT,
            launch_date TEXT,
            launch_days INTEGER,
            margin_rate REAL,
            gross_profit REAL,
            thumbnail_url TEXT,
            product_url TEXT,
            status TEXT DEFAULT 'pending',
            marked_at TEXT,
            notes TEXT,
            created_at TEXT DEFAULT (datetime('now', '+8 hours')),
            updated_at TEXT DEFAULT (datetime('now', '+8 hours'))
        )
    """)
    conn.commit()
    return conn


def upsert_product(conn, p: dict, cat: dict):
    """写入产品"""
    cur = conn.cursor()
    
    # 毛利率（category_report自带）
    margin_rate = p.get('毛利率') or p.get('margin_rate')
    
    cur.execute("""
        INSERT INTO product_research 
        (asin, title, price, weight_g, weight_actual_g, monthly_sales, monthly_revenue,
         brand, category_rank, review_count, rating, seller_type,
         node_id, node_name, launch_date, launch_days,
         margin_rate, thumbnail_url, product_url, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(asin) DO UPDATE SET
            title=excluded.title, price=excluded.price,
            monthly_sales=excluded.monthly_sales,
            updated_at=datetime('now', '+8 hours')
    """, (
        p.get('ASIN'), p.get('标题'), p.get('价格'),
        None, None,  # weight 后续补
        int(p.get('月销量', 0) or 0),
        float(p.get('月销额', 0) or 0),
        p.get('品牌'),
        p.get('所处类目排名'),
        int(p.get('评论数', 0) or 0),
        float(p.get('星级', 0) or 0),
        'unknown',  # seller_type 后续补
        cat['node_id'],
        cat['name'],
        p.get('上架日期'),
        int(p.get('上架天数', 0) or 0),
        margin_rate,
        get_thumbnail_url(p.get('ASIN', '')),
        f"https://www.amazon.com.mx/dp/{p.get('ASIN', '')}",
        'pending',
    ))
    conn.commit()


# ===================== 主流程 =====================

def pull_category(conn, cat: dict) -> tuple:
    """拉取单个品类"""
    print(f"\n{'='*50}")
    print(f"📦 拉取: {cat['name']} ({cat['node_id']})")
    
    products = get_category_report(cat['node_id'])
    print(f"   获取 {len(products)} 条Top100产品")
    
    if not products:
        return 0, 0
    
    success = 0
    skipped = 0
    
    for i, p in enumerate(products):
        asin = p.get('ASIN', '')
        if not asin:
            continue
        
        sales = int(p.get('月销量', 0) or 0)
        if sales < SALES_MIN:
            skipped += 1
            continue
        
        reviews = int(p.get('评论数', 0) or 0)
        if reviews > MAX_REVIEWS:
            skipped += 1
            continue
        
        launch_days = int(p.get('上架天数', 0) or 0)
        if launch_days > MAX_LAUNCH_DAYS:
            skipped += 1
            continue
        
        upsert_product(conn, p, cat)
        success += 1
        
        if (i+1) % 20 == 0:
            print(f"   进度: {i+1}/{len(products)}")
        
        time.sleep(0.12)
    
    print(f"   ✅ 写入 {success} 条 (过滤 {skipped} 条)")
    return success, skipped


def main():
    print(f"🚀 亚马逊墨西哥选品拉取 - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"📊 筛选: 月销>={SALES_MIN} 评论<={MAX_REVIEWS} 上架<={MAX_LAUNCH_DAYS}天")
    
    conn = init_db()
    total_success = 0
    total_skipped = 0
    
    for cat in CATEGORIES:
        s, sk = pull_category(conn, cat)
        total_success += s
        total_skipped += sk
        time.sleep(0.5)
    
    print(f"\n✅ 完成! 符合条件: {total_success} 条, 过滤掉: {total_skipped} 条")
    
    # 统计
    cur = conn.cursor()
    cur.execute("SELECT node_name, COUNT(*) FROM product_research GROUP BY node_name ORDER BY COUNT(*) DESC")
    print("\n各品类数量:")
    for row in cur.fetchall():
        print(f"  {row[0]}: {row[1]} 条")
    
    total = conn.execute("SELECT COUNT(*) FROM product_research").fetchone()[0]
    print(f"\n总计: {total} 条产品已入库")
    conn.close()


if __name__ == '__main__':
    main()
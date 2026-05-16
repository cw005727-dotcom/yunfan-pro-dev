#!/usr/bin/env python3
"""
亚马逊墨西哥选品拉取脚本 - 轻小件扩展版 v2
扩大类目 + 放宽条件 + 双重过滤（体积+重量）确保轻小件
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

# 扩展品类列表（轻小件为主）
CATEGORIES = [
    # 美容个护（轻小件为主）
    {"node_id": "beauty", "name": "美妆个护"},
    # 家居日用（轻小件）
    {"node_id": "kitchen", "name": "家居日用"},
    {"node_id": "home-improvement", "name": "家居五金"},
    {"node_id": "garden", "name": "园艺用品"},
    # 3C配件（轻小件重点）
    {"node_id": "electronics", "name": "3C配件"},
    {"node_id": "mobile-electronics", "name": "手机配件"},
    {"node_id": "computer-accessories", "name": "电脑配件"},
    # 饰品配件
    {"node_id": "jewelry", "name": "珠宝首饰"},
    {"node_id": "fashion", "name": "时尚配饰"},
    # 运动户外（轻小件）
    {"node_id": "sports", "name": "运动户外"},
    {"node_id": "outdoor-recreation", "name": "户外休闲"},
    # 宠物（轻小件）
    {"node_id": "pet-supplies", "name": "宠物用品"},
    {"node_id": "pet-toys", "name": "宠物玩具"},
    # 鞋服（轻小件配件）
    {"node_id": "shoes", "name": "鞋类"},
    {"node_id": "apparel", "name": "服装"},
    # 母婴玩具（轻小件）
    {"node_id": "baby-products", "name": "母婴用品"},
    {"node_id": "toys", "name": "玩具游戏"},
    {"node_id": "party-supplies", "name": "节庆派对"},
    # 办公文具（轻小件）
    {"node_id": "office-products", "name": "办公文具"},
    {"node_id": "arts-crafts", "name": "艺术手工"},
    # 汽车摩托车（小件配件）
    {"node_id": "automotive", "name": "汽摩配件"},
]

# 轻小件双重过滤条件
MAX_VOLUME_CM3 = 4000      # 体积<4000cm³（约等于20×10×20cm）
MAX_WEIGHT_G = 500         # 重量<500g
SALES_MIN = 30             # 月销量≥30

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


def parse_dimensions(dim_str: str) -> tuple:
    """解析外包装尺寸字符串，返回(长,宽,高,体积cm3)
    格式如: "18.7*8.7*4.7" 或 "11.05*8.51*4.57"
    返回 (length, width, height, volume_cm3)，解析失败返回 None
    """
    if not dim_str or dim_str == '':
        return None
    try:
        parts = dim_str.split('*')
        if len(parts) != 3:
            return None
        l = float(parts[0].strip())
        w = float(parts[1].strip())
        h = float(parts[2].strip())
        volume = l * w * h
        return (l, w, h, volume)
    except:
        return None


def is_lightweight(dim_str: str) -> tuple:
    """判断是否轻小件，返回 (是否通过, 体积cm3, 估算重量g)
    估算重量逻辑：根据体积估算，密度取0.6g/cm³（日常货物平均密度）
    """
    parsed = parse_dimensions(dim_str)
    if parsed is None:
        return (False, None, None)  # 无法解析，标记为疑似大件
    
    l, w, h, volume = parsed
    
    # 体积过滤
    if volume >= MAX_VOLUME_CM3:
        return (False, volume, None)
    
    # 重量估算：体积 × 密度（日常货物密度约0.5-0.7g/cm³，取0.6）
    est_weight = volume * 0.6
    
    # 重量过滤
    if est_weight >= MAX_WEIGHT_G:
        return (False, volume, est_weight)
    
    return (True, volume, est_weight)


def get_category_report(node_id: str) -> list:
    """拉取类目Top100产品"""
    r = mcp_call('category_report', {'amzSite': 'MX', 'nodeId': node_id})
    try:
        data = json.loads(r)
        if isinstance(data, dict) and 'Top100产品' in data:
            return data['Top100产品']
        elif isinstance(data, dict) and 'top_products' in data:
            return data['top_products']
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
            dimensions TEXT,
            volume_cm3 REAL,
            est_weight_g REAL,
            status TEXT DEFAULT 'pending',
            marked_at TEXT,
            notes TEXT,
            created_at TEXT DEFAULT (datetime('now', '+8 hours')),
            updated_at TEXT DEFAULT (datetime('now', '+8 hours'))
        )
    """)
    conn.commit()
    return conn


def upsert_product(conn, p: dict, cat: dict, volume: float, est_weight: float):
    """写入产品"""
    cur = conn.cursor()
    
    margin_rate = p.get('毛利率') or p.get('margin_rate')
    
    cur.execute("""
        INSERT INTO product_research 
        (asin, title, price, weight_g, weight_actual_g, monthly_sales, monthly_revenue,
         brand, category_rank, review_count, rating, seller_type,
         node_id, node_name, launch_date, launch_days,
         margin_rate, thumbnail_url, product_url, dimensions, volume_cm3, est_weight_g, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(asin) DO UPDATE SET
            title=excluded.title, price=excluded.price,
            monthly_sales=excluded.monthly_sales,
            volume_cm3=excluded.volume_cm3,
            est_weight_g=excluded.est_weight_g,
            updated_at=datetime('now', '+8 hours')
    """, (
        p.get('ASIN'), p.get('标题'), p.get('价格'),
        est_weight, None,  # weight_g估算值, weight_actual_g实物重量(暂无)
        int(p.get('月销量', 0) or 0),
        float(p.get('月销额', 0) or 0),
        p.get('品牌'),
        p.get('所处类目排名'),
        int(p.get('评论数', 0) or 0),
        float(p.get('星级', 0) or 0),
        'unknown',
        cat['node_id'],
        cat['name'],
        p.get('上架日期'),
        int(p.get('上架天数', 0) or 0),
        margin_rate,
        get_thumbnail_url(p.get('ASIN', '')),
        f"https://www.amazon.com.mx/dp/{p.get('ASIN', '')}",
        p.get('外包装尺寸', ''),
        volume,
        est_weight,
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
    skipped_vol = 0    # 体积过大
    skipped_sales = 0 # 月销不足
    skipped_dim = 0   # 尺寸解析失败(保守过滤)
    
    for i, p in enumerate(products):
        asin = p.get('ASIN', '')
        if not asin:
            continue
        
        # 月销过滤
        sales = int(p.get('月销量', 0) or 0)
        if sales < SALES_MIN:
            skipped_sales += 1
            continue
        
        # 尺寸体积重量过滤
        dim_str = p.get('外包装尺寸', '')
        passed, volume, est_weight = is_lightweight(dim_str)
        
        if not passed:
            if volume is not None:
                skipped_vol += 1
            else:
                skipped_dim += 1
            continue
        
        upsert_product(conn, p, cat, volume, est_weight)
        success += 1
        
        if (i+1) % 20 == 0:
            print(f"   进度: {i+1}/{len(products)}")
        
        time.sleep(0.12)
    
    print(f"   ✅ 写入 {success} 条 (体积过滤{skipped_vol} / 尺寸异常{skipped_dim} / 月销不足{skipped_sales})")
    return success, skipped_vol + skipped_dim + skipped_sales


def main():
    print(f"🚀 亚马逊墨西哥选品拉取 v2 - 轻小件扩展版")
    print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"📊 筛选: 月销≥{SALES_MIN} | 体积<{MAX_VOLUME_CM3}cm³ | 估算重量<{MAX_WEIGHT_G}g")
    print(f"📂 类目数: {len(CATEGORIES)} 个")
    
    conn = init_db()
    total_success = 0
    total_skipped = 0
    
    for cat in CATEGORIES:
        s, sk = pull_category(conn, cat)
        total_success += s
        total_skipped += sk
        time.sleep(0.5)
    
    print(f"\n✅ 完成! 符合轻小件条件: {total_success} 条, 过滤掉: {total_skipped} 条")
    
    # 统计
    cur = conn.cursor()
    cur.execute("SELECT node_name, COUNT(*) FROM product_research GROUP BY node_name ORDER BY COUNT(*) DESC")
    print("\n各品类数量:")
    for row in cur.fetchall():
        print(f"  {row[0]}: {row[1]} 条")
    
    total = conn.execute("SELECT COUNT(*) FROM product_research").fetchone()[0]
    print(f"\n📦 数据库总计: {total} 条产品")
    
    # 体积分布
    print("\n体积分布:")
    rows = conn.execute("""
        SELECT 
            CASE 
                WHEN volume_cm3 < 500 THEN '<500cm³'
                WHEN volume_cm3 < 1000 THEN '500-1000cm³'
                WHEN volume_cm3 < 2000 THEN '1000-2000cm³'
                WHEN volume_cm3 < 3000 THEN '2000-3000cm³'
                ELSE '>3000cm³'
            END as bucket,
            COUNT(*) as cnt
        FROM product_research WHERE volume_cm3 IS NOT NULL
        GROUP BY bucket ORDER BY bucket
    """).fetchall()
    for r in rows:
        print(f"  {r[0]}: {r[1]} 条")
    
    conn.close()


if __name__ == '__main__':
    main()

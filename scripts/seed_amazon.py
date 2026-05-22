"""
亚马逊全类目播种脚本
每种模式（hot/potential/new）× 每站点（US/MX/BR）× 每个一级类目，拉取500条并存库
用法: python scripts/seed_amazon.py [--sites US,MX,BR] [--modes hot,potential,new]
"""
import sys, os, json, sqlite3, time, argparse
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi_server.routes.amazon import mcp_call, _load_category_tree

DB = '/Users/chensan/Library/CloudStorage/OneDrive-个人/Mac 资料/YunfanV2/mercadolibre.db'

CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS amazon_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asin TEXT UNIQUE NOT NULL,
    site TEXT NOT NULL,
    mode TEXT NOT NULL,
    title TEXT,
    price REAL,
    weight REAL,
    monthly_sales INTEGER DEFAULT 0,
    monthly_revenue REAL DEFAULT 0,
    brand TEXT,
    review_count INTEGER DEFAULT 0,
    rating REAL DEFAULT 0,
    seller_country TEXT,
    node_id TEXT,
    node_name TEXT,
    big_category TEXT,
    sub_category TEXT,
    listed_days INTEGER DEFAULT 0,
    launch_date TEXT,
    fba_fee REAL DEFAULT 0,
    fulfillment TEXT DEFAULT 'FBM',
    thumbnail_url TEXT,
    product_url TEXT,
    potential_index REAL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    fetched_at TEXT DEFAULT (datetime('now', '+8 hours')),
    CONSTRAINT uq_amazon_asin_site_mode UNIQUE(asin, site, mode)
);
CREATE INDEX IF NOT EXISTS idx_ap_site_mode ON amazon_products(site, mode);
CREATE INDEX IF NOT EXISTS idx_ap_fetched ON amazon_products(fetched_at);
"""

def ensure_table():
    conn = sqlite3.connect(DB)
    conn.executescript(CREATE_TABLE)
    conn.commit()
    print("[DB] amazon_products 表就绪")

def normalize_product(p, site):
    """将 MCP 返回的商品字段规范化为字典"""
    asin = p.get('asin') or p.get('ASIN') or p.get('产品ASIN码') or p.get('父级ASIN码') or ''
    site_lower = {'US': 'com', 'MX': 'com.mx', 'BR': 'com.br'}.get(site, 'com')
    thumbnail = p.get('thumbnail') or p.get('image_url') or p.get('主图') or ''
    title = p.get('title') or p.get('标题') or p.get('产品名称') or ''
    price_raw = p.get('price') or p.get('价格') or 0
    try: price = float(price_raw)
    except: price = 0
    sales_raw = p.get('sales') or p.get('月销量') or p.get('monthly_sales') or 0
    if not sales_raw:
        sales_raw = p.get('销量') or 0
    try: monthly_sales = int(float(sales_raw))
    except: monthly_sales = 0
    revenue_raw = p.get('revenue') or p.get('月销售额') or p.get('monthly_revenue') or 0
    try: monthly_revenue = float(revenue_raw)
    except: monthly_revenue = 0
    brand = p.get('brand') or p.get('品牌') or ''
    reviews_raw = p.get('reviews') or p.get('review_count') or p.get('评论数') or 0
    try: review_count = int(float(reviews_raw))
    except: review_count = 0
    rating_raw = p.get('rating') or p.get('评分') or p.get('星级') or 0
    try: rating = float(rating_raw)
    except: rating = 0
    seller_country = p.get('seller_country') or p.get('卖家国籍') or ''
    node_id = p.get('node_id') or p.get('nodeId') or ''
    node_name = p.get('node_name') or p.get('类目名称') or ''
    big_cat = p.get('big_category') or p.get('所属大类') or p.get('产品分类') or ''
    sub_cat = p.get('sub_category') or p.get('所属细分类目') or ''
    listed_raw = p.get('listed_days') or p.get('上架天数') or 0
    try: listed_days = int(float(listed_raw))
    except: listed_days = 0
    launch_date = p.get('launch_date') or p.get('上架日期') or p.get('上架时间') or ''
    # 如果上架天数为空但有上架日期，则计算天数
    if not listed_days and launch_date:
        try:
            from datetime import datetime
            launch_dt = datetime.strptime(launch_date, "%Y-%m-%d")
            listed_days = (datetime.now() - launch_dt).days
        except:
            pass
    fba_fee_raw = p.get('fba_fee') or p.get('FBA费用') or 0
    try: fba_fee = float(fba_fee_raw)
    except: fba_fee = 0
    fulfillment = p.get('fulfillment') or 'FBM'
    weight_raw = p.get('weight') or 0
    try: weight = float(weight_raw)
    except: weight = 0
    potential_index = float(p.get('potential_index') or p.get('产品潜力指数') or 0)
    return {
        'asin': asin,
        'site': site,
        'title': title[:500] if title else '',
        'price': price,
        'weight': weight,
        'monthly_sales': monthly_sales,
        'monthly_revenue': monthly_revenue,
        'brand': brand[:100] if brand else '',
        'review_count': review_count,
        'rating': rating,
        'seller_country': seller_country,
        'node_id': node_id,
        'node_name': node_name,
        'big_category': big_cat,
        'sub_category': sub_cat,
        'listed_days': listed_days,
        'launch_date': launch_date,
        'fba_fee': fba_fee,
        'fulfillment': fulfillment,
        'thumbnail_url': thumbnail,
        'product_url': f'https://www.amazon.{site_lower}/dp/{asin}',
        'potential_index': potential_index,
    }

def pull_page(tool, site, node_id, page, mode):
    """单次 MCP 调用，返回商品列表
    - category_report (hot): 使用 nodeId 字段
    - product_search (potential/new): 使用 searchName 字段
    """
    args = {'amzSite': site, 'page': page}
    if mode == 'hot':
        # category_report uses nodeId
        if node_id:
            args['nodeId'] = node_id
    else:
        # product_search uses searchName
        if node_id:
            args['searchName'] = node_id
        if mode == 'potential':
            args['sortby_potential_index'] = True
    try:
        raw = mcp_call(tool, args)
        data = json.loads(raw) if isinstance(raw, str) else raw
        if isinstance(data, dict) and 'error' in data:
            return [], data['error']
        # category_report wraps result in {"Top100产品": [...]}
        if isinstance(data, dict) and 'Top100产品' in data:
            data = data['Top100产品']
        if not isinstance(data, list):
            return [], 'invalid data type'
        return data, None
    except Exception as e:
        return [], str(e)

UPSERT = """
INSERT INTO amazon_products (
    asin, site, mode, title, price, weight, monthly_sales, monthly_revenue,
    brand, review_count, rating, seller_country, node_id, node_name,
    big_category, sub_category, listed_days, launch_date, fba_fee,
    fulfillment, thumbnail_url, product_url, potential_index, status, fetched_at
) VALUES (
    :asin, :site, :mode, :title, :price, :weight, :monthly_sales, :monthly_revenue,
    :brand, :review_count, :rating, :seller_country, :node_id, :node_name,
    :big_category, :sub_category, :listed_days, :launch_date, :fba_fee,
    :fulfillment, :thumbnail_url, :product_url, :potential_index, 'pending', datetime('now', '+8 hours')
)
ON CONFLICT(asin, site, mode) DO UPDATE SET
    title=excluded.title, price=excluded.price, weight=excluded.weight,
    monthly_sales=excluded.monthly_sales, monthly_revenue=excluded.monthly_revenue,
    brand=excluded.brand, review_count=excluded.review_count, rating=excluded.rating,
    seller_country=excluded.seller_country, node_id=excluded.node_id,
    node_name=excluded.node_name, big_category=excluded.big_category,
    sub_category=excluded.sub_category, listed_days=excluded.listed_days,
    launch_date=excluded.launch_date, fba_fee=excluded.fba_fee,
    fulfillment=excluded.fulfillment, thumbnail_url=excluded.thumbnail_url,
    product_url=excluded.product_url, potential_index=excluded.potential_index,
    fetched_at=datetime('now', '+8 hours')
"""

def upsert_products(products, site, mode, conn):
    """批量写入数据库"""
    cur = conn.cursor()
    for p in products:
        p['site'] = site
        p['mode'] = mode
        cur.execute(UPSERT, p)
    conn.commit()

def seed_site_mode(site, mode, node_id, tool, page_limit=25):
    """
    单站×单模式：每个类目拉500条（25页×20条），存库
    node_id: category nodeId (for category_report) or None (for product_search)
    page_limit: 最多拉几页（默认25页=500条）
    category_report 不支持分页，每 nodeId 固定返回约100条
    """
    conn = sqlite3.connect(DB)
    total_saved = 0
    for page in range(1, page_limit + 1):
        items, err = pull_page(tool, site, node_id, page, mode)
        if err:
            print(f'  [page {page}] 错误: {err}')
            break
        if not items:
            print(f'  [page {page}] 空数据，停止')
            break
        products = [normalize_product(p, site) for p in items]
        upsert_products(products, site, mode, conn)
        saved = len(products)
        total_saved += saved
        print(f'  [page {page}] 写入 {saved} 条 (累计 {total_saved})')
        if len(items) < 20:
            print(f'  [page {page}] 返回不足20条，数据源耗尽')
            break
        time.sleep(0.3)
    conn.close()
    return total_saved

def run():
    parser = argparse.ArgumentParser()
    parser.add_argument('--sites', default='US,MX,BR')
    parser.add_argument('--modes', default='hot,potential,new')
    parser.add_argument('--pages', type=int, default=25)
    args = parser.parse_args()

    sites = [s.strip() for s in args.sites.split(',')]
    modes = [m.strip() for m in args.modes.split(',')]
    page_limit = args.pages

    ensure_table()
    print(f'站点: {sites} | 模式: {modes} | 每类目 {page_limit} 页')

    for site in sites:
        print(f'\n=== 加载 {site} 类目树 ===')
        try:
            tree = _load_category_tree(site)
        except Exception as e:
            print(f'类目树加载失败: {e}')
            continue
        if not tree:
            print(f'类目树为空，跳过')
            continue
        print(f'找到 {len(tree)} 个一级类目')

        for mode in modes:
            tool = {'hot': 'category_report', 'potential': 'product_search', 'new': 'product_search'}[mode]
            total_site = 0
            for node in tree:
                top_id = node.get('nodeId', '')
                top_name = node.get('类目名称', '')
                if not top_id:
                    continue
                # category_report uses nodeId; product_search uses searchName
                node_or_name = top_id if mode == 'hot' else top_name
                print(f'\n[{site}][{mode}] 类目: {top_name} ({top_id})')
                count = seed_site_mode(site, mode, node_or_name, tool, page_limit)
                total_site += count
                print(f'  → 写入 {count} 条')
                time.sleep(1)
            print(f'\n[{site}][{mode}] 小计: {total_site} 条')

if __name__ == '__main__':
    run()
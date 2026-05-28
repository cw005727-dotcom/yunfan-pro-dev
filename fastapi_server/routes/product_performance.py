"""商品性能查询 API（含AI诊断）"""
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
import sqlite3, json
from ..config import DB_PATH

# 自动建表（服务器首次启动时创建）
conn = sqlite3.connect(str(DB_PATH))
conn.execute("""
    CREATE TABLE IF NOT EXISTS product_performance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id TEXT UNIQUE,
        sku TEXT,
        product_name TEXT,
        status TEXT,
        variation TEXT,
        unique_visits INTEGER DEFAULT 0,
        order_count INTEGER DEFAULT 0,
        unique_buyers INTEGER DEFAULT 0,
        units_sold INTEGER DEFAULT 0,
        gross_sales_usd REAL DEFAULT 0,
        share_percent TEXT,
        visitor_convert_rate TEXT,
        visitor_buy_convert_rate TEXT,
        thumbnail TEXT,
        pictures TEXT,
        pictures_count INTEGER DEFAULT 0,
        ai_issue_type TEXT,
        ai_issue_desc TEXT,
        ai_suggestion TEXT,
        source_file TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        site_id TEXT DEFAULT 'MLB'
    )
""")
conn.execute("CREATE INDEX IF NOT EXISTS idx_pp_item_id ON product_performance(item_id)")
conn.execute("CREATE INDEX IF NOT EXISTS idx_pp_status ON product_performance(status)")
conn.commit()
conn.close()

router = APIRouter(prefix="/api", tags=["商品性能"])

def parse_rate(val):
    """解析百分比字符串为浮点数"""
    if not val:
        return 0.0
    s = str(val).replace('%', '').replace(',', '.').strip()
    try:
        return float(s)
    except:
        return 0.0

def ai_diagnose(items, all_items=None):
    """AI诊断：识别问题商品。
    新规则（2026-05-23）：基于全量数据计算均值，而非仅当前页。
    - 高曝光低转化：访问量>=均值，转化率<均值
    - 低曝光高转化：访问量<均值，转化率>=均值
    - 表现正常：访问量>=均值且转化率>=均值，或其他情况
    """
    if not items:
        return items

    # 用全量数据计算均值（如果传入了全量数据的话）
    pool = all_items or items
    visits = [p.get('unique_visits') or 0 for p in pool]
    rates = [parse_rate(p.get('visitor_convert_rate', '')) for p in pool]

    avg_visit = sum(visits) / len(visits) if visits else 1
    avg_rate = sum(rates) / len(rates) if rates else 0.01

    for p in items:
        v = p.get('unique_visits') or 0
        r = parse_rate(p.get('visitor_convert_rate', ''))

        if v >= avg_visit and r < avg_rate:
            issue_type = '⚠️高曝光低转化'
            issue_desc = f'访问量{v}(>=均值{avg_visit:.0f})但转化率{round(r,2)}%低于均值{round(avg_rate,2)}%'
            suggestion = '建议检查：主图是否吸引、价格是否有竞争力、标题关键词是否准确'
        elif v < avg_visit and r >= avg_rate:
            issue_type = '💡低曝光高转化'
            issue_desc = f'访客仅{v}(<均值{avg_visit:.0f})但转化率高达{r}%，品有潜力但曝光不足'
            suggestion = '建议：优化搜索关键词、增加广告投放、考虑提升排名'
        elif v >= avg_visit and r >= avg_rate:
            issue_type = '📈表现正常'
            issue_desc = '表现正常'
            suggestion = '继续保持，关注访客趋势变化'
        else:
            issue_type = '📈表现正常'
            issue_desc = '表现正常'
            suggestion = '继续保持，关注访客趋势变化'

        p['ai_issue_type'] = issue_type
        p['ai_issue_desc'] = issue_desc
        p['ai_suggestion'] = suggestion

    return items

@router.get("/product_performance")
async def get_product_performance(
    sort: str = Query("unique_visits", description="排序字段: unique_visits/visitor_convert_rate/order_count"),
    order: str = Query("desc", description="排序方向: asc/desc"),
    status: str = Query(None, description="筛选状态: 激活/未激活/全部"),
    issue: str = Query(None, description="筛选问题: ⚠️高曝光低转化/💡低曝光高转化/🛒零订单/全部"),
    page: int = Query(1),
    page_size: int = Query(50)
):
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # 构建WHERE
    where = "1=1"
    if status and status != '全部':
        where += f" AND status='{status}'"
    if issue and issue != '全部':
        where += f" AND ai_issue_type='{issue}'"

    # 先查总数
    c.execute(f"SELECT COUNT(*) as cnt FROM product_performance WHERE {where}")
    total = c.fetchone()['cnt']

    # 排序字段映射
    sort_map = {
        'unique_visits': 'unique_visits',
        'visitor_convert_rate': 'visitor_convert_rate',
        'order_count': 'order_count'
    }
    sort_col = sort_map.get(sort, 'unique_visits')
    sort_dir = 'DESC' if order == 'desc' else 'ASC'

    # 分页查询
    offset = (page - 1) * page_size
    c.execute(f"""
        SELECT item_id, sku, product_name, status, variation,
               unique_visits, order_count, unique_buyers, units_sold,
               gross_sales_usd, share_percent, visitor_convert_rate,
               visitor_buy_convert_rate, thumbnail, pictures, pictures_count,
               ai_issue_type, ai_issue_desc, ai_suggestion
        FROM product_performance
        WHERE {where}
        ORDER BY {sort_col} {sort_dir}
        LIMIT ? OFFSET ?
    """, (page_size, offset))

    rows = c.fetchall()
    conn.close()

    # 转为dict
    items = [dict(r) for r in rows]

    # 如果没有AI诊断字段，全量跑AI诊断
    has_ai = any(p.get('ai_issue_type') for p in items)
    if not has_ai and items:
        items = ai_diagnose(items)

    # 统计各问题类型数量
    stats = {
        '⚠️高曝光低转化': 0,
        '💡低曝光高转化': 0,
        '🛒零订单': 0,
        '📈正常': 0
    }
    for p in items:
        t = p.get('ai_issue_type', '📈正常')
        if t in stats:
            stats[t] += 1

    return {
        'success': True,
        'total': total,
        'page': page,
        'page_size': page_size,
        'total_pages': (total + page_size - 1) // page_size,
        'stats': stats,
        'items': items
    }


@router.get("/performance/list")
async def get_performance_list(
    sort: str = Query("unique_visits"),
    order: str = Query("desc"),
    page: int = Query(1),
    page_size: int = Query(24),
    status: str = Query(None),
    issue: str = Query(None),
    site_id: str = Query(None),
):
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # SQL只筛除未激活状态和站点
    where = "1=1"
    params = []
    if status and status != '全部':
        where += " AND status = ?"
        params.append(status)
    if site_id and site_id != '全部':
        where += " AND site_id = ?"
        params.append(site_id)

    # 先拿全量数据（含 status/site_id 筛选）用于计算均值+AI诊断
    c.execute(f"""
        SELECT item_id, sku, product_name, status, variation,
               unique_visits, order_count, unique_buyers, units_sold,
               gross_sales_usd, share_percent, visitor_convert_rate,
               visitor_buy_convert_rate, thumbnail, pictures, pictures_count,
               ai_issue_type, ai_issue_desc, ai_suggestion, site_id
        FROM product_performance
        WHERE {where}
        ORDER BY unique_visits DESC
    """, params)
    all_rows = c.fetchall()
    conn.close()

    # 全量数据 + 跑诊断
    all_items = [dict(r) for r in all_rows]

    # 图片 URL 高清化：-O. → -F.（美客多 Full 大图）
    for p in all_items:
        if p.get('thumbnail'):
            p['thumbnail'] = p['thumbnail'].replace('-O.', '-F.')
            # 缩略图也可能是 -I. 结尾
            p['thumbnail'] = p['thumbnail'].replace('-I.', '-F.')
        pics = p.get('pictures', '[]')
        if isinstance(pics, str):
            try:
                pics = json.loads(pics)
            except:
                pics = []
        if pics:
            pics = [u.replace('-O.', '-F.').replace('-I.', '-F.') for u in pics]
        p['pictures'] = pics

    all_diagnosed = ai_diagnose(all_items, all_items)

    # 按 issue 类型筛选
    if issue and issue != '全部':
        filtered = [p for p in all_diagnosed if p.get('ai_issue_type') == issue]
    else:
        filtered = all_diagnosed

    # 排序
    sort_map = {'unique_visits': 'unique_visits', 'visitor_convert_rate': 'visitor_convert_rate', 'order_count': 'order_count'}
    sort_col = sort_map.get(sort, 'unique_visits')
    reverse = order == 'desc'
    filtered.sort(key=lambda p: (p.get(sort_col) or 0), reverse=reverse)

    # 分页
    total = len(filtered)
    total_pages = max(1, (total + page_size - 1) // page_size)
    offset = (page - 1) * page_size
    page_items = filtered[offset:offset + page_size]

    # 全量统计
    stats = {'⚠️高曝光低转化': 0, '💡低曝光高转化': 0, '🛒零订单': 0, '📈表现正常': 0}
    for p in all_diagnosed:
        t = p.get('ai_issue_type', '📈表现正常')
        if t in stats:
            stats[t] += 1

    return {
        'success': True, 'total': total, 'page': page,
        'page_size': page_size, 'total_pages': total_pages,
        'stats': stats, 'items': page_items
    }

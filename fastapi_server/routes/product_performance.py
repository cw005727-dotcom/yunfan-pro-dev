"""商品性能查询 API（含AI诊断）"""
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
import sqlite3, json
from ..config import DB_PATH

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

def ai_diagnose(items):
    """AI诊断：识别问题商品"""
    if not items:
        return items

    # 计算均值
    visits = [p['unique_visits'] or 0 for p in items]
    rates = [parse_rate(p.get('visitor_convert_rate', '')) for p in items]
    
    avg_visit = sum(visits) / len(visits) if visits else 1
    avg_rate = sum(rates) / len(rates) if rates else 0.01

    result_types = {
        '⚠️高曝光低转化': [],
        '💡低曝光高转化': [],
        '🛒零订单': [],
        '📈正常': []
    }

    for p in items:
        v = p['unique_visits'] or 0
        r = parse_rate(p.get('visitor_convert_rate', ''))
        orders = p['order_count'] or 0

        if v > avg_visit and r < avg_rate and orders == 0:
            issue_type = '⚠️高曝光低转化'
            issue_desc = f'吸引{v}次访问但无人下单，转化率{round(r,2)}%低于均值{round(avg_rate,2)}%'
            suggestion = '建议检查：主图是否吸引、价格是否有竞争力、标题关键词是否准确'
        elif v < avg_visit * 0.5 and r > avg_rate * 1.5 and orders > 0:
            issue_type = '💡低曝光高转化'
            issue_desc = f'访客少但转化好({r}%)，品本身有潜力但曝光不足'
            suggestion = '建议：优化搜索关键词、增加广告投放、考虑提升排名'
        elif v > 0 and orders == 0:
            issue_type = '🛒零订单'
            issue_desc = f'有{v}次访问但未转化，可能存在主图/价格/库存问题'
            suggestion = '建议：检查商品链接是否正常、价格竞争力、主图吸引力'
        else:
            issue_type = '📈正常'
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

    where = "1=1"
    params = []
    if status and status != '全部':
        where += " AND status = ?"
        params.append(status)
    if issue and issue != '全部':
        where += " AND ai_issue_type = ?"
        params.append(issue)
    if site_id and site_id != '全部':
        where += " AND site_id = ?"
        params.append(site_id)

    c.execute(f"SELECT COUNT(*) as cnt FROM product_performance WHERE {where}", params)
    total = c.fetchone()['cnt']

    sort_map = {'unique_visits': 'unique_visits', 'visitor_convert_rate': 'visitor_convert_rate', 'order_count': 'order_count'}
    sort_col = sort_map.get(sort, 'unique_visits')
    sort_dir = 'DESC' if order == 'desc' else 'ASC'

    offset = (page - 1) * page_size
    c.execute(f"""
        SELECT item_id, sku, product_name, status, variation,
               unique_visits, order_count, unique_buyers, units_sold,
               gross_sales_usd, share_percent, visitor_convert_rate,
               visitor_buy_convert_rate, thumbnail, pictures, pictures_count,
               ai_issue_type, ai_issue_desc, ai_suggestion, site_id
        FROM product_performance
        WHERE {where}
        ORDER BY {sort_col} {sort_dir}
        LIMIT ? OFFSET ?
    """, params + [page_size, offset])

    rows = c.fetchall()
    conn.close()

    items = [dict(r) for r in rows]
    has_ai = any(p.get('ai_issue_type') for p in items)
    if not has_ai and items:
        items = ai_diagnose(items)

    stats = {'⚠️高曝光低转化': 0, '💡低曝光高转化': 0, '🛒零订单': 0, '📈正常': 0}
    for p in items:
        t = p.get('ai_issue_type', '📈正常')
        if t in stats:
            stats[t] += 1

    return {
        'success': True, 'total': total, 'page': page,
        'page_size': page_size, 'total_pages': (total + page_size - 1) // page_size,
        'stats': stats, 'items': items
    }

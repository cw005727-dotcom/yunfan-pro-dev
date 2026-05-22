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
    site_id: str = Query(None, description="筛选站点: MLM/MLB/MLA/MCO/MLC/MLU/全部"),
    status: str = Query(None, description="筛选状态: 激活/未激活/全部"),
    issue: str = Query(None, description="筛选问题类型"),
    page: int = Query(1),
    page_size: int = Query(50)
):
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # 构建WHERE（基础过滤，不含 issue）
    base_where = "1=1"
    if status and status != '全部':
        base_where += f" AND status='{status}'"
    if site_id and site_id != '全部':
        base_where += f" AND site_id='{site_id}'"

    # 查总数（无 issue 过滤，获取所有品）
    c.execute(f"SELECT COUNT(*) as cnt FROM product_performance WHERE {base_where}")
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
               visitor_buy_convert_rate, thumbnail, pictures_count, site_id,
               ai_issue_type, ai_issue_desc, ai_suggestion
        FROM product_performance
        WHERE {base_where}
        ORDER BY {sort_col} {sort_dir}
        LIMIT ? OFFSET ?
    """, (page_size, offset))

    rows = c.fetchall()
    conn.close()

    # 转为dict
    items = [dict(r) for r in rows]

    # 全量 AI 诊断（无论 DB 有无 ai_issue_type，统一诊断）
    items = ai_diagnose(items)

    # 将诊断结果写回 DB（每个 item）
    _conn = sqlite3.connect(str(DB_PATH))
    _c = _conn.cursor()
    for p in items:
        _c.execute("""UPDATE product_performance SET ai_issue_type=?, ai_issue_desc=?, ai_suggestion=? WHERE item_id=?""",
                   (p.get('ai_issue_type'), p.get('ai_issue_desc'), p.get('ai_suggestion'), p['item_id']))
    _conn.commit()
    _conn.close()

    # issue 过滤（在内存中）
    if issue and issue != '全部':
        items = [p for p in items if p.get('ai_issue_type') == issue]
    total = len(items)  # 覆盖为过滤后数量

    # 统计（在全部品范围内，而非仅当前页）
    all_stats = {
        '⚠️高曝光低转化': 0,
        '💡低曝光高转化': 0,
        '⭐高潜力商品': 0,
        '🛒零订单': 0,
        '📊一般': 0
    }
    # 从 DB 重新拉全部品做统计（不受分页影响）
    _conn2 = sqlite3.connect(str(DB_PATH))
    _conn2.row_factory = sqlite3.Row
    _c2 = _conn2.cursor()
    _c2.execute(f"SELECT COUNT(*) as cnt FROM product_performance WHERE {base_where}")
    total_count = _c2.fetchone()['cnt']
    _c2.execute(f"""SELECT item_id, unique_visits, order_count, visitor_convert_rate FROM product_performance WHERE {base_where}""")
    all_items_raw = [dict(r) for r in _c2.fetchall()]
    _conn2.close()
    diagnosed = ai_diagnose(all_items_raw)
    for p in diagnosed:
        t = p.get('ai_issue_type', '📊一般')
        if t in all_stats:
            all_stats[t] += 1

    return {
        'success': True,
        'total': total,
        'page': page,
        'page_size': page_size,
        'total_pages': max(1, (total + page_size - 1) // page_size),
        'stats': all_stats,
        'items': items
    }

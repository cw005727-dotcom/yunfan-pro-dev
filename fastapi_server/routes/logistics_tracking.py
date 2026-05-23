"""物流全链路追踪 API"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
import sqlite3, os

router = APIRouter(prefix="/api/logistics", tags=["物流追踪"])

DB_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'mercadolibre.db')


def get_conn():
    return sqlite3.connect(DB_PATH, check_same_thread=False)


def compute_stage(t):
    """根据物流追踪数据计算当前链路阶段"""
    if t.get('international_tracking'):
        return 5, '✈️', '已上飞机', '#6366f1'
    if t.get('warehouse_in_date'):
        return 4, '🏢', '已到官方仓', '#10b981'
    if t.get('label_status') == '已贴单':
        return 3, '🏭', '已进云仓', '#f59e0b'
    if t.get('logistics_1688_tracking'):
        return 2, '🚚', '1688已发货', '#3b82f6'
    if t.get('logistics_1688_order'):
        return 1, '📦', '已采购', '#8b5cf6'
    return 0, '🛒', '已下单', '#94a3b8'


@router.get("/tracking")
def get_tracking(
    site: str = None,
    date: str = None,
    search: str = None,
    limit: int = 500,
):
    """返回全链路追踪数据：按日期分组+统计"""
    conn = get_conn()
    cur = conn.cursor()

    today = datetime.now().strftime('%Y-%m-%d')

    # 构建查询条件
    where = "1=1"
    params = []
    if site:
        where += " AND site = ?"
        params.append(site)

    if date:
        where += " AND date(replace(order_date,'/','-')) = ?"
        params.append(date)
    elif search:
        where += " AND order_number LIKE ?"
        params.append(f'%{search}%')

    # 取全部（或按条件）
    sql = f"""
        SELECT order_number, site, store_name, order_date,
               logistics_1688_order, logistics_1688_tracking,
               label_status, warehouse_in_date, international_tracking, is_ignored
        FROM logistics_tracking
        WHERE {where}
        ORDER BY order_date DESC
        LIMIT ?
    """
    cur.execute(sql, params + [limit])
    rows = cur.fetchall()

    # 关联 operational_orders 获取采购状态
    orders_list = []
    all_today = 0
    purchased_count = 0

    for r in rows:
        order_number, site_v, store_name, order_date, \
            ls1688, ls1688_t, label_status, wh_date, intl_tracking, is_ignored = r

        # 忽略不计入统计
        if is_ignored:
            continue

        # 今日订单统计
        order_day = order_date.replace('/', '-')[:10] if order_date else ''
        if order_day == today:
            all_today += 1

        # 从 operational_orders 查采购状态
        is_purchased = bool(ls1688)
        if not is_purchased and order_number:
            try:
                cur2 = conn.cursor()
                cur2.execute(
                    "SELECT status FROM operational_orders WHERE order_number = ?",
                    (order_number,)
                )
                op_row = cur2.fetchone()
                if op_row and op_row[0] == '找货-已采购':
                    is_purchased = True
            except:
                pass

        if is_purchased:
            purchased_count += 1

        t = {
            'order_number': order_number,
            'site': site_v or '',
            'store_name': store_name or '',
            'order_date': order_date or '',
            'logistics_1688_order': ls1688 or '',
            'logistics_1688_tracking': ls1688_t or '',
            'label_status': label_status or '',
            'warehouse_in_date': wh_date or '',
            'international_tracking': intl_tracking or '',
            'is_purchased': is_purchased,
        }
        stage_code, stage_icon, stage_name, stage_color = compute_stage(t)
        t['stage_code'] = stage_code
        t['stage_icon'] = stage_icon
        t['stage_name'] = stage_name
        t['stage_color'] = stage_color

        orders_list.append(t)

    conn.close()

    # 按日期分组
    from collections import defaultdict
    orders_by_date = defaultdict(list)
    for o in orders_list:
        d = o['order_date'].replace('/', '-')[:10] if o['order_date'] else '未知'
        orders_by_date[d].append(o)

    # 24H/48H/超48H统计（从下单时间算）
    now = datetime.now()
    stats_24h = {'shipped': 0, 'unshipped': 0}
    stats_48h = {'shipped': 0, 'unshipped': 0}
    over_48h_warning = 0

    for o in orders_list:
        if not o['order_date']:
            continue
        try:
            od = datetime.strptime(o['order_date'].replace('/', '-')[:19], '%Y-%m-%d %H:%M:%S')
        except:
            try:
                od = datetime.strptime(o['order_date'].replace('/', '-')[:10], '%Y-%m-%d')
            except:
                continue
        hours = (now - od).total_seconds() / 3600
        has_shipped = bool(o['logistics_1688_tracking'])

        if hours <= 24:
            if has_shipped:
                stats_24h['shipped'] += 1
            else:
                stats_24h['unshipped'] += 1
        elif hours <= 48:
            if has_shipped:
                stats_48h['shipped'] += 1
            else:
                stats_48h['unshipped'] += 1
        elif hours > 48 and not has_shipped:
            over_48h_warning += 1

    return JSONResponse({
        'today_total': all_today,
        'purchased_count': purchased_count,
        'stats_24h': stats_24h,
        'stats_48h': stats_48h,
        'over_48h_warning': over_48h_warning,
        'orders_by_date': dict(sorted(orders_by_date.items(), reverse=True)),
    })

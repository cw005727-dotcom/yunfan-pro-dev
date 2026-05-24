"""物流全链路追踪 API"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
import sqlite3, os, hashlib, requests, json

router = APIRouter(prefix="/api/logistics", tags=["物流追踪"])

DB_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'mercadolibre.db')

# 快递100配置
KD100_CUSTOMER = '75CA3374A64148674663769A02A7DEC0'
KD100_KEY = 'rzhnMUJI3952'


def get_conn():
    return sqlite3.connect(DB_PATH, check_same_thread=False)


def query_kd100_trace(waybill):
    """调快递100查询物流轨迹，返回第一条轨迹时间"""
    import hashlib, requests, json
    param = {
        "com": "",
        "num": waybill,
        "phone": "",
        "from": "",
        "to": "",
        "resultv2": "1",
        "show": "0",
        "order": "desc"
    }
    param_json = json.dumps(param, separators=(',',':'), ensure_ascii=False)
    raw = param_json + KD100_KEY + KD100_CUSTOMER
    sign = hashlib.md5(raw.encode('utf-8')).hexdigest().upper()
    payload = {
        "customer": KD100_CUSTOMER,
        "sign": sign,
        "param": param_json
    }
    try:
        resp = requests.post('https://poll.kuaidi100.com/poll/query.do', data=payload, timeout=15)
        result = resp.json()
        if result.get('status') == '200' and result.get('data'):
            traces = result['data']
            # 取最早一条轨迹时间（第一条按时间顺序最小）
            if traces:
                times = [t.get('time', '') for t in traces if t.get('time')]
                times.sort()
                return times[0] if times else None
        return None
    except Exception as e:
        print(f"快递100查询失败 {waybill}: {e}")
        return None


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

    cur.execute(f"""
        SELECT order_number, site, store_name, order_date, status,
               logistics_1688_order, logistics_1688_tracking,
               label_status, warehouse_in_date, international_tracking,
               is_ignored, shipped_at, thumbnail
        FROM logistics_tracking
        WHERE {where}
        AND (is_ignored IS NULL OR is_ignored = 0)
        AND (status IS NULL OR status NOT IN ('已取消','取消'))
        ORDER BY order_date DESC
        LIMIT ?
    """, params + [limit])
    rows = cur.fetchall()

    orders_list = []
    all_today = 0
    purchased_count = 0

    for r in rows:
        order_number, site_v, store_name, order_date, status_val, \
            ls1688, ls1688_t, label_status, wh_date, intl_tracking, is_ignored, shipped_at, lt_thumbnail = r

        order_day = order_date.replace('/', '-')[:10] if order_date else ''
        if order_day == today:
            all_today += 1

        is_purchased = False
        if order_number:
            try:
                cur2 = conn.cursor()
                cur2.execute(
                    "SELECT status FROM operational_orders WHERE order_number = ?",
                    (order_number,)
                )
                op_row = cur2.fetchone()
                if op_row and op_row[0] and '已采购' in op_row[0]:
                    is_purchased = True
            except:
                pass

        if is_purchased:
            purchased_count += 1

        # thumbnail 优先级: logistics_tracking.thumbnail > operational_orders.thumbnail > product_performance
        thumbnail = lt_thumbnail or ''
        if not thumbnail and order_number:
            try:
                cur2 = conn.cursor()
                cur2.execute("SELECT thumbnail FROM operational_orders WHERE order_number = ? LIMIT 1", (order_number,))
                t_row = cur2.fetchone()
                if t_row and t_row[0]:
                    thumbnail = t_row[0]
                if not thumbnail:
                    cur2.execute("""
                        SELECT p.thumbnail FROM product_performance p
                        INNER JOIN operational_orders o ON (p.sku = o.sku OR p.item_id = o.asin)
                        WHERE o.order_number = ? LIMIT 1
                    """, (order_number,))
                    p_row = cur2.fetchone()
                    if p_row and p_row[0]:
                        thumbnail = p_row[0]
            except:
                pass

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
            'shipped_at': shipped_at or '',
            'thumbnail': thumbnail,
        }
        stage_code, stage_icon, stage_name, stage_color = compute_stage(t)
        t['stage_code'] = stage_code
        t['stage_icon'] = stage_icon
        t['stage_name'] = stage_name
        t['stage_color'] = stage_color
        orders_list.append(t)

    conn.close()

    from collections import defaultdict
    orders_by_date = defaultdict(list)
    for o in orders_list:
        d = o['order_date'].replace('/', '-')[:10] if o['order_date'] else '未知'
        orders_by_date[d].append(o)

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

    cloud_labeled = sum(1 for o in orders_list if o['label_status'] == '已贴单')
    pending_labeled = sum(1 for o in orders_list if o['label_status'] == '待贴单')
    warehouse_received = sum(1 for o in orders_list if o['warehouse_in_date'])
    air_shipped = sum(1 for o in orders_list if o['international_tracking'])

    # --- 三天时效统计：昨天、前天、三天前（排除已取消/已忽略）---
    def calc_day_stats(day_offset, label):
        now_local = datetime.now()
        day_str = (now_local - timedelta(days=day_offset)).strftime('%Y-%m-%d')
        total = 0
        h12 = 0
        h24 = 0
        over24 = 0
        for o in orders_list:
            if not o['order_date']:
                continue
            od_str = o['order_date'].replace('/', '-')[:10]
            if od_str != day_str:
                continue
            total += 1
            has_tracking = bool(o.get('logistics_1688_tracking'))
            if not has_tracking:
                over24 += 1
                continue
            # 有物流单号即有发货。用shipped_at算差值，没有shipped_at则归入12h内
            try:
                order_time = datetime.strptime(o['order_date'].replace('/', '-')[:19], '%Y-%m-%d %H:%M:%S')
            except:
                try:
                    order_time = datetime.strptime(o['order_date'].replace('/', '-')[:10], '%Y-%m-%d')
                except:
                    over24 += 1
                    continue
            shipped_at = o.get('shipped_at', '')
            if shipped_at:
                try:
                    ship_time = datetime.strptime(shipped_at[:19], '%Y-%m-%d %H:%M:%S')
                    hours_diff = (ship_time - order_time).total_seconds() / 3600
                except:
                    hours_diff = 0
            else:
                # 没有shipped_at但有物流单号=有发货，先归入12h，等1688API通了再精确
                hours_diff = 0
            if hours_diff <= 12:
                h12 += 1
            elif hours_diff <= 24:
                h24 += 1
            else:
                over24 += 1
        return {f'{label}_date': day_str, f'{label}_total': total,
                f'{label}_h12_shipped': h12, f'{label}_h24_shipped': h24,
                f'{label}_over24_unshipped': over24}

    day_stats = {}
    day_stats.update(calc_day_stats(1, 'yesterday'))
    day_stats.update(calc_day_stats(2, 'daybefore'))
    day_stats.update(calc_day_stats(3, 'thirdday'))

    return JSONResponse({
        'today_total': all_today,
        'purchased_count': purchased_count,
        'stats_24h': stats_24h,
        'stats_48h': stats_48h,
        'over_48h_warning': over_48h_warning,
        'cloud_labeled': cloud_labeled,
        'pending_labeled': pending_labeled,
        'warehouse_received': warehouse_received,
        'air_shipped': air_shipped,
        'orders_by_date': dict(sorted(orders_by_date.items(), reverse=True)),
        **day_stats,
    })


@router.get("/fetch-traces")
def fetch_traces():
    """拉取前5条有物流单号但无shipped_at的订单轨迹"""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT order_number, logistics_1688_tracking
        FROM logistics_tracking
        WHERE IFNULL(logistics_1688_tracking, '') != ''
        AND (shipped_at IS NULL OR shipped_at = '')
        AND (is_ignored IS NULL OR is_ignored = 0)
        AND (status IS NULL OR status NOT IN ('已取消','取消'))
        LIMIT 5
    """)
    rows = cur.fetchall()
    results = []
    for order_number, waybill in rows:
        # 去掉冒号及后面的内容
        clean_waybill = waybill.split(':')[0] if ':' in waybill else waybill
        # 只查纯数字或数字+字母组合（含中文的跳过）
        if any('\u4e00' <= c <= '\u9fff' for c in clean_waybill):
            results.append({"order_number": order_number, "waybill": waybill, "shipped_at": None, "success": False, "reason": "含中文跳过"})
            continue
        trace_time = query_kd100_trace(clean_waybill)
        if trace_time:
            cur.execute("UPDATE logistics_tracking SET shipped_at = ? WHERE order_number = ?", (trace_time, order_number))
            results.append({"order_number": order_number, "waybill": waybill, "shipped_at": trace_time, "success": True})
        else:
            results.append({"order_number": order_number, "waybill": waybill, "shipped_at": None, "success": False})
    conn.commit()
    conn.close()
    return JSONResponse({"fetched": len(rows), "results": results})


@router.get("/fetch-thumbnails")
def fetch_thumbnails(limit: int = 30):
    """用 listing_id + site 调 ML API 拿缩略图，补齐 logistics_tracking"""
    from ..middleware.auth import get_ml_token_provider
    import time

    provider = get_ml_token_provider()
    token = provider.get_valid_token()
    if not token:
        return JSONResponse({"error": "无法获取ML access_token"}, status_code=401)

    headers = {"Authorization": f"Bearer {token}"}
    conn = get_conn()
    cur = conn.cursor()

    # 找 logistics_tracking 有 listing_id 但没有 thumbnail 的
    # listing_id 已包含站点前缀（如 MLA1739915551），直接用它调API
    cur.execute("""
        SELECT order_number, listing_id
        FROM logistics_tracking
        WHERE IFNULL(listing_id, '') != ''
        AND (thumbnail IS NULL OR thumbnail = '')
        AND (is_ignored IS NULL OR is_ignored = 0)
        AND (status IS NULL OR status NOT IN ('已取消','取消'))
        LIMIT ?
    """, (limit,))
    rows = cur.fetchall()

    results = []
    for order_number, listing_id in rows:
        ml_id = listing_id  # listing_id 已经包含站点前缀，直接就是完整的item_id
        try:
            r = requests.get(f'https://api.mercadolibre.com/marketplace/items/{ml_id}', headers=headers, timeout=8)
            if r.status_code == 200:
                d = r.json()
                thumb_url = d.get('thumbnail', '') or d.get('secure_thumbnail', '')
                if thumb_url:
                    cur.execute("UPDATE logistics_tracking SET thumbnail = ? WHERE order_number = ?", (thumb_url, order_number))
                    results.append({"order_number": order_number, "listing_id": listing_id, "thumbnail": thumb_url, "success": True})
                else:
                    results.append({"order_number": order_number, "listing_id": listing_id, "success": False, "reason": "无图片"})
            else:
                results.append({"order_number": order_number, "listing_id": listing_id, "success": False, "reason": f"HTTP {r.status_code}"})
        except Exception as e:
            results.append({"order_number": order_number, "listing_id": listing_id, "success": False, "reason": str(e)[:50]})
        time.sleep(0.3)

    conn.commit()
    conn.close()
    return JSONResponse({"fetched": len(rows), "results": results})

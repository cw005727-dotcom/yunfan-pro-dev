"""物流全链路追踪 API"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
import sqlite3, os, hashlib, requests, json
from fastapi_server.config import DB_PATH

router = APIRouter(prefix="/api/logistics", tags=["物流追踪"])

# 快递100配置
KD100_CUSTOMER = '75CA3374A64148674663769A02A7DEC0'
KD100_KEY = 'rzhnMUJI3952'


def get_conn():
    return sqlite3.connect(DB_PATH, check_same_thread=False)


# ── 快递公司映射（自动识别失败时手动匹配） ──────────────
# ── 常见快递公司编码（按优先级排序） ──────────────────
COMMON_COMS = [
    ('YT', 'yuantong'), ('JT', 'jtexpress'), ('SF', 'shunfeng'),
    ('STO', 'shentong'), ('ZTO', 'zhongtong'), ('YD', 'yunda'),
    ('YZ', 'youzhengguonei'), ('DBL', 'debang'),
    ('HHTT', 'huitongkuaidi'), ('UC', 'youshu'),
    ('GTO', 'guotongkuaidi'), ('FAST', 'kuaitao'),
]
# 前缀 → 编码快速匹配
COM_MAP = {k: v for k, v in COMMON_COMS}

# 常见中文名 → 编码
COM_NAMES = {
    '圆通': 'yuantong', '中通': 'zhongtong', '申通': 'shentong',
    '韵达': 'yunda', '极兔': 'jtexpress', '顺丰': 'shunfeng',
    '邮政': 'youzhengguonei', '德邦': 'debang', '百世': 'huitongkuaidi',
}

# ── 快递公司编码规则 ──────────────────────────────────
COM_PREFIX_MAP = {
    'YT': 'yuantong', 'JT': 'jtexpress', 'SF': 'shunfeng',
    'STO': 'shentong', 'ZTO': 'zhongtong', 'YD': 'yunda',
    'YZ': 'youzhengguonei', 'DBL': 'debang',
}


# ── 常见快递列表（优先级排序，纯数字单号遍历用） ─────
COMMON_COMS = ['yuantong', 'zhongtong', 'shentong', 'yunda', 'shunfeng',
               'huitongkuaidi', 'youzhengguonei', 'jtexpress']

# 快递公司中文名 → 编码映射（用于从轨迹内容匹配）
# 快递公司中文名 → 编码映射（用于从轨迹内容匹配）
COM_NAMES_REV = {
    '圆通速递': 'yuantong', '圆通': 'yuantong',
    '中通快递': 'zhongtong', '中通': 'zhongtong',
    '申通快递': 'shentong', '申通': 'shentong',
    '韵达快递': 'yunda', '韵达': 'yunda',
    '极兔速递': 'jtexpress', '极兔': 'jtexpress',
    '顺丰速运': 'shunfeng', '顺丰': 'shunfeng',
    '京东物流': 'jd', '京东': 'jd',
    '中国邮政': 'youzhengguonei', '邮政': 'youzhengguonei', 'EMS': 'youzhengguonei',
    '德邦快递': 'debang', '德邦物流': 'debang', '德邦': 'debang',
    '百世快递': 'huitongkuaidi', '百世': 'huitongkuaidi',
    '壹米滴答': 'yimidida',
    '跨越速运': 'kuayue',
    '安能物流': 'annengwuliu',
    '天地华宇': 'tiandihuayu',
    '速尔': 'suer',
}

# 仓库收货城市列表（用于验证纯数字运单号）
WAREHOUSE_CITIES = ['东莞', '义乌', '郑州', '广州', '深圳', '上海', '北京']
# 常见快递列表（纯数字单号遍历用，排除了易误判的德邦）
COMMON_COMS = ['yuantong', 'zhongtong', 'shentong', 'yunda', 'shunfeng',
               'huitongkuaidi', 'youzhengguonei', 'jtexpress']

# 快递公司数字单号格式规则
COM_NUM_RULES = {
    'yuantong':      (10, 12),    # 圆通通常10-12位数字
    'zhongtong':     (12, 12),    # 中通通常12位
    'shentong':      (12, 15),    # 申通12-15位
    'yunda':         (13, 13),    # 韵达13位
    'shunfeng':      (12, 12),    # 顺丰12位
    'jtexpress':     (12, 15),    # 极兔12-15位
    'huitongkuaidi': (12, 15),    # 百世12-15位
    'youzhengguonei':(13, 13),    # 邮政13位
}


def _detect_com(waybill):
    """根据快递单号规则识别快递公司编码（不调外部接口）"""
    if not waybill or not waybill.strip():
        return '', False
    
    raw = waybill.strip()
    
    # 检查是否包含中文字符（非合法运单号）
    import re
    if re.search(r'[\u4e00-\u9fff]', raw):
        return '', False
    
    # 纯数字：检查位数是否符合常见快递规则
    if raw.isdigit():
        length = len(raw)
        candidates = []
        for com, (min_len, max_len) in COM_NUM_RULES.items():
            if min_len <= length <= max_len:
                candidates.append(com)
        if candidates:
            return None, True  # None = 纯数字，需遍历，flag=True表示有效
        return None, False  # 位数不匹配，无效
    
    # 字母前缀匹配
    prefix = raw[:2].upper()
    if prefix in COM_PREFIX_MAP:
        return COM_PREFIX_MAP[prefix], True
    
    return '', False


def _get_traces_from_waybill(waybill_str):
    """从完整运单号（含:尾号）解析并查轨迹"""
    if not waybill_str or not waybill_str.strip():
        return '', []
    parts = waybill_str.split(':')
    raw = parts[0].strip()
    phone = parts[1].strip() if len(parts) > 1 and parts[1].strip().isdigit() else ''
    com, is_valid = _detect_com(raw)
    if not is_valid:
        return '', []
    if com:
        traces = _get_traces(raw, com, phone=phone)
        return com, traces
    com, traces = _detect_com_and_traces(raw, phone=phone)
    return com, traces


def _get_traces(waybill, com, phone=''):
    """快递100 poll接口查询物流轨迹，支持 com='auto' 自动识别"""
    import hashlib, requests, json

    # 中通、顺丰等需要手机号的，优先用poll带手机号查
    if phone and com in ('zhongtong', 'shunfeng', 'jd'):
        poll_traces = _poll_query(com, waybill, phone)
        if poll_traces:
            return poll_traces

    # 没有手机号时，中通/顺丰用免费接口
    if com in ('zhongtong', 'shunfeng', 'jd'):
        return _get_traces_free(waybill, com)

    param_dict = {"com": com, "num": waybill}
    param = json.dumps(param_dict, separators=(",", ":"), ensure_ascii=False)
    raw = param + KD100_KEY + KD100_CUSTOMER
    sign = hashlib.md5(raw.encode("utf-8")).hexdigest().upper()

    try:
        resp = requests.post(
            "https://poll.kuaidi100.com/poll/query.do",
            data={"customer": KD100_CUSTOMER, "sign": sign, "param": param},
            timeout=10
        )
        result = resp.json()
        if result.get("status") == "200":
            data = result.get("data", [])
            valid = [t for t in data if t.get("context", "") not in ("查无结果", "") and "查无结果" not in t.get("context", "")]
            return valid
        return []
    except Exception:
        return []


def _poll_query(com, waybill, phone=''):
    """快递100 poll付费接口查询"""
    import hashlib, requests, json
    param_dict = {"com": com, "num": waybill}
    if phone:
        param_dict["phone"] = phone
    param = json.dumps(param_dict, separators=(",", ":"), ensure_ascii=False)
    raw = param + KD100_KEY + KD100_CUSTOMER
    sign = hashlib.md5(raw.encode("utf-8")).hexdigest().upper()
    try:
        resp = requests.post(
            "https://poll.kuaidi100.com/poll/query.do",
            data={"customer": KD100_CUSTOMER, "sign": sign, "param": param},
            timeout=10
        )
        result = resp.json()
        if result.get("status") == "200":
            data = result.get("data", [])
            return [t for t in data if t.get("context", "") not in ("查无结果", "")]
    except Exception:
        pass
    return []


def _get_traces_free(waybill, com):
    """免费接口兜底，5秒超时"""
    import requests
    try:
        resp = requests.get(
            f"https://www.kuaidi100.com/query?type={com}&postid={waybill}",
            timeout=5
        )
        result = resp.json()
        if result.get("status") == "200":
            data = result.get("data", [])
            valid = [t for t in data if t.get("context", "") not in ("查无结果", "") and "查无结果" not in t.get("context", "")]
            return valid
    except Exception:
        pass
    return []


def _detect_com_and_traces(waybill, phone=''):
    """识别快递公司并查询轨迹，优先用 auto 自动识别，失败再并发遍历兜底"""
    raw = waybill.split(':')[0].split('|')[0].strip()
    # 从完整字符串提取手机尾号
    if not phone and ':' in waybill:
        parts = waybill.split(':')
        if len(parts) > 1 and parts[1].strip().isdigit():
            phone = parts[1].strip()

    # 先验证运单号有效性
    com, is_valid = _detect_com(raw)
    if not is_valid:
        return '', []

    # === 方案1: auto 自动识别（快递100自动判断物流商）===
    auto_traces = _get_traces(raw, 'auto', phone=phone)
    if auto_traces:
        return 'auto', auto_traces
    # auto 查不到，纯数字用免费接口兜底（快递单号格式一般能匹配）
    if raw.isdigit():
        import concurrent.futures
        # 先试中通（812位numbers常见），再试其他
        priority_coms = ['zhongtong', 'yuantong', 'shentong', 'yunda', 'shunfeng', 
                         'jtexpress', 'huitongkuaidi', 'youzhengguonei']
        best_com = ''
        best_traces = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            future_to_com = {executor.submit(_get_traces_free, raw, c): c for c in priority_coms}
            for future in concurrent.futures.as_completed(future_to_com):
                try:
                    traces = future.result(timeout=8)
                    if traces:
                        ctx_all = ' '.join(t.get('context','') for t in traces)
                        if any(c in ctx_all for c in WAREHOUSE_CITIES):
                            if len(traces) > len(best_traces):
                                best_com = future_to_com[future]
                                best_traces = traces
                except:
                    continue
        if best_traces:
            return best_com, best_traces
        return '', []

    # === 方案2: 有字母前缀直接查 ===
    if com:
        traces = _get_traces(raw, com, phone=phone)
        if traces:
            return com, traces
        return com, []

    # === 方案3: 纯数字单号，并发遍历兜底 ===
    # 有手机尾号时用poll查中通
    if phone:
        poll_traces = _poll_query('zhongtong', raw, phone)
        if poll_traces:
            ctx_all = ' '.join(t.get('context','') for t in poll_traces)
            has_valid_city = any(c in ctx_all for c in WAREHOUSE_CITIES)
            if has_valid_city:
                return 'zhongtong', poll_traces

    # 并发遍历其他快递公司
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        future_to_com = {executor.submit(_get_traces, raw, c, phone): c for c in COMMON_COMS}
        results = []
        for future in concurrent.futures.as_completed(future_to_com):
            c = future_to_com[future]
            try:
                traces = future.result()
                if traces:
                    score = len(traces)
                    ctx_all = ' '.join(t.get('context','') for t in traces)
                    # 命中仓库收货城市加分
                    city_count = sum(1 for city in WAREHOUSE_CITIES if city in ctx_all)
                    score += city_count * 3
                    # 上下文提到本快递公司名加分
                    for zh_name, code in COM_NAMES_REV.items():
                        if code == c and zh_name in ctx_all:
                            score += 5
                    # 上下文提到其他快递公司名扣分
                    for zh_name, code in COM_NAMES_REV.items():
                        if code != c and zh_name in ctx_all:
                            score -= 2
                    results.append((score, c, traces))
            except Exception:
                continue

    if results:
        results.sort(key=lambda x: -x[0])
        # 如果最高分和次高分差距不到2分，认为存在歧义
        if len(results) >= 2 and results[0][0] - results[1][0] < 2:
            # 返回数据量更大的那个
            results.sort(key=lambda x: (-x[0], -len(x[2])))
        return results[0][1], results[0][2]
    return '', []


def query_kd100_trace(waybill):
    """调快递100免费接口查询物流轨迹，返回最早一条轨迹时间"""
    raw = waybill.split(':')[0].split('|')[0].strip()
    try:
        com, traces = _detect_com_and_traces(raw)
        if not com:
            print(f"快递100无法识别单号: {raw}")
            return None
        if traces:
            times = [t.get('time', '') for t in traces if t.get('time')]
            times.sort()
            return times[0] if times else None
        return None
    except Exception as e:
        print(f"快递100查询失败 {raw}: {e}")
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


@router.get("/traces/{waybill}")
def get_express_traces(waybill: str):
    """快递100查询单号轨迹详情（前端Drawer用），从:后提取手机尾号"""
    raw = waybill.split(':')[0].split('|')[0].strip()
    phone = waybill.split(':')[1].strip() if ':' in waybill and waybill.split(':')[1].strip().isdigit() else ''
    com, traces = _detect_com_and_traces(raw, phone=phone)

    if not com:
        return JSONResponse({"success": False, "message": f"无法识别快递公司: {raw}"})

    # auto没数据且有尾号时，用中通+尾号兜底
    if not traces and phone and raw.isdigit():
        poll_traces = _poll_query('zhongtong', raw, phone)
        if poll_traces:
            return JSONResponse({
                "success": True,
                "com": "zhongtong",
                "waybill": raw,
                "traces": poll_traces,
            })

    # 纯数字运单号二次验证：auto模式可信度高，跳过；非auto模式加校验防假数据
    if traces and raw.isdigit():
        ctx_all = ' '.join(t.get('context','') for t in traces)
        if com != 'auto':
            # 检查是否命中仓库城市
            if not any(c in ctx_all for c in WAREHOUSE_CITIES):
                return JSONResponse({"success": False, "message": "轨迹不匹配"})
            # 二次查询验证一致性
            import time
            time.sleep(1)
            com2, traces2 = _detect_com_and_traces(raw, phone=phone)
            if not traces2:
                return JSONResponse({"success": False, "message": "数据不可信（二次验证无结果）"})

    if traces:
        return JSONResponse({
            "success": True,
            "com": com,
            "waybill": raw,
            "traces": traces,
        })
    else:
        return JSONResponse({"success": False, "message": "查询失败"})


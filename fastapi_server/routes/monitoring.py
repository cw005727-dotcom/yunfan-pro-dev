"""
系统监控相关路由
GET /api/health           - 健康检查
GET /api/monitoring_logs   - 历史日志
GET /api/monitoring/stream - 实时事件流（供前端监控面板轮询）
"""
from fastapi import APIRouter
from datetime import datetime, timezone, timedelta
import json
from ..db import get_db_connection

# 北京时间（UTC+8）转巴西时间（UTC-3），差11小时
# "今天"以北京时区为标准，BRT = 北京时间 - 11小时

router = APIRouter(prefix="/api", tags=["监控"])


@router.get("/health")
async def health():
    """健康检查"""
    return {"status": "ok"}


@router.get("/monitoring_logs")
async def monitoring_logs():
    """监控日志"""
    with get_db_connection() as conn:
        rows = conn.execute("""
            SELECT timestamp, level, message, store_id, site_id
            FROM monitoring_logs
            ORDER BY timestamp DESC
            LIMIT 100
        """).fetchall()
        return [dict(row) for row in rows]


@router.get("/monitoring/stream")
async def monitoring_stream():
    """实时监控流 - 来自 monitoring_logs + orders_v2 当日事件"""
    with get_db_connection() as conn:
        cursor = conn.cursor()

        SITE_MAP = {
            'MLM': '墨西哥', 'MLB': '巴西', 'MCO': '哥伦比亚',
            'MLA': '阿根廷', 'MLC': '智利', 'MLU': '乌拉圭', 'CBT': '跨境'
        }

        # 以北京时区为基准，取"今天"的 BRT 日期（北京时间 - 11小时 = BRT）
        beijing_now = datetime.now()  # 北京时间
        brt_now = beijing_now - timedelta(hours=11)  # 巴西时间
        today_brt = brt_now.strftime('%Y-%m-%d')  # BRT "今天"日期，用于过滤
        now_brt_str = brt_now.strftime('%Y-%m-%dT%H:%M:%S')  # BRT 当前时间字符串，用于比较发货截止
        today_bj = beijing_now.strftime('%Y-%m-%d')  # 北京今天日期（监控物流动态用）
        events = []

        # 1. 超期发货预警（last_ship_date 存在 BRT，需要用 BRT 当前时间比较）
        cursor.execute("""
            SELECT o.id, o.last_ship_date, o.site_id, o.product_name, o.quantity, o.tracking_id
            FROM orders_v2 o
            WHERE o.shipping_status IN ('pending', 'ready_to_ship') AND o.last_ship_date < ?
            ORDER BY o.last_ship_date ASC
            LIMIT 5
        """, (now_brt_str,))
        for row in cursor.fetchall():
            site = SITE_MAP.get(row['site_id'], row['site_id'])
            tid = row['tracking_id'] or ''
            events.append({
                "id": f"overdue_{row['id']}",
                "type": "logistics",
                "label": "发货超时",
                "desc": f"{site} 发货已超期 | 运单号:{tid}" if tid else f"{site} 发货已超期",
                "time": "紧急",
                "urgent": True
            })

        # 1b. 当日物流动态（来自 monitoring_logs 的 shipments webhook 记录）
        cursor.execute("""
            SELECT timestamp, message, details, site_id
            FROM monitoring_logs
            WHERE timestamp >= ? AND details LIKE '%logistics%'
            ORDER BY timestamp DESC LIMIT 10
        """, (f"{today_bj} 00:00:00",))
        for row in cursor.fetchall():
            details = row['details'] or {}
            if isinstance(details, str):
                try: details = json.loads(details)
                except: details = {}
            logistic_company = details.get('logistic_company', '')
            receiver_city = details.get('receiver_city', '')
            est_del = details.get('estimated_delivery_date', '')
            if est_del:
                est_del = est_del[:10]
            events.append({
                "id": f"ship_{row['timestamp']}",
                "type": "logistics",
                "label": "物流动态",
                "desc": f"{SITE_MAP.get(row['site_id'], row['site_id'])} {row['message']}",
                "time": row['timestamp'][11:16] if row['timestamp'] else "",
                "urgent": False
            })


        # 2. 当日新增违规记录（created_at 存北京时间，直接用北京日期过滤）
        cursor.execute("""
            SELECT * FROM product_infringements
            WHERE date(created_at) = ?
            ORDER BY created_at DESC LIMIT 5
        """, (beijing_now.strftime('%Y-%m-%d'),))
        for row in cursor.fetchall():
            reason = row['reason'] or ""
            if "trademark" in reason.lower(): reason_zh = "商标侵权"
            elif "copyright" in reason.lower(): reason_zh = "著作权侵权"
            elif "brand" in reason.lower(): reason_zh = "品牌授权违规"
            else: reason_zh = reason
            events.append({
                "id": f"violation_{row['id']}",
                "type": "violation",
                "label": "违规",
                "desc": f"大姐店 新增：{reason_zh}",
                "time": row['created_at'][11:16] if row['created_at'] else "",
                "urgent": row['severity'] == 'high'
            })

        # 3. 当日新订单（直接查 orders_v2，以北京时间日期过滤）
        # orders_v2.order_date 存的是北京时间（+11小时 = BRT 订单时间）
        today_bj = beijing_now.strftime('%Y-%m-%d')
        cursor.execute("""
            SELECT id, order_date, site_id, amount, status
            FROM orders_v2
            WHERE date(order_date) = ?
            ORDER BY order_date DESC LIMIT 10
        """, (today_bj,))
        for row in cursor.fetchall():
            site = SITE_MAP.get(row['site_id'] or '', row['site_id'] or '')
            amount_str = f"${row['amount']:.2f}" if row['amount'] is not None else "N/A"
            events.append({
                "id": f"order_{row['id']}",
                "type": "order",
                "label": "新订单",
                "desc": f"{site} 新订单 成交 {amount_str}",
                "time": row["order_date"][11:16] if row["order_date"] else "",
                "order_date": row["order_date"] or "",
                "urgent": False
            })

        # 4. 当日未读咨询（updated_at 是北京时间，用北京日期过滤）
        cursor.execute("""
            SELECT m.*, m.status FROM customer_messages m
            WHERE m.status = 'unread' AND date(m.updated_at) = ?
            ORDER BY m.updated_at DESC LIMIT 5
        """, (beijing_now.strftime('%Y-%m-%d'),))
        for row in cursor.fetchall():
            msg_preview = (row['last_message'] or "")[:30]
            events.append({
                "id": f"msg_{row['id']}",
                "type": "message",
                "label": "咨询",
                "desc": f" 站：{msg_preview}",
                "time": row['updated_at'][11:16] if row['updated_at'] else "未读",
                "urgent": False
            })

        return {"events": events[:20]}

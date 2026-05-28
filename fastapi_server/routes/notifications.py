from fastapi import APIRouter
from ..db import get_db_connection

router = APIRouter(prefix="/api", tags=["通知"])

@router.get("/notifications")
def get_notifications():
    """
    返回6类通知，数据来自现有数据表：
    - order:     近7天新增未处理订单（orders_v2 排除 cancelled）
    - cancelled: 近7天取消订单（orders_v2 status=cancelled）
    - logistics: 近7天有物流动态的订单（shipping_status 非空）
    - message:   客户消息（customer_messages）
    - reputation: 店铺声誉变化（stores 表）
    - violation: 投诉违规（claims 表）
    """
    result = {
        "order": [],
        "cancelled": [],
        "logistics": [],
        "message": [],
        "reputation": [],
        "violation": [],
    }

    with get_db_connection() as db:
        cur = db.cursor()

        # order: 非cancelled近7天新订单
        rows = cur.execute("""
            SELECT o.id, o.user_id, o.site_id, o.order_date, o.product_name, o.quantity, o.status, o.shipping_status,
                   COALESCE(s.nickname, '') as store_nickname
            FROM orders_v2 o
            LEFT JOIN stores s ON o.user_id = s.user_id
            WHERE (o.status IS NULL OR o.status != 'cancelled')
              AND o.order_date > datetime('now', '-7 days')
            ORDER BY o.order_date DESC
            LIMIT 50
        """).fetchall()
        result["order"] = [
            {
                "id": str(r[0]),
                "site": r[2],
                "nickname": r[8] or f"订单{r[0]}",
                "title": f"新订单: {r[4] or '商品'} x{r[5]}",
                "time": r[3][:10] if r[3] else "",
                "read": False,
            }
            for r in rows
        ]

        # cancelled: 近7天取消
        rows = cur.execute("""
            SELECT o.id, o.user_id, o.site_id, o.order_date, o.product_name, o.status,
                   COALESCE(s.nickname, '') as store_nickname
            FROM orders_v2 o
            LEFT JOIN stores s ON o.user_id = s.user_id
            WHERE o.status = 'cancelled'
              AND o.order_date > datetime('now', '-7 days')
            ORDER BY o.order_date DESC
            LIMIT 30
        """).fetchall()
        result["cancelled"] = [
            {
                "id": f"c_{r[0]}",
                "site": r[2],
                "nickname": r[6] or f"订单{r[0]}",
                "title": f"订单取消: {r[4] or '商品'}",
                "time": r[3][:10] if r[3] else "",
                "read": False,
            }
            for r in rows
        ]

        # logistics: 有物流动态的
        rows = cur.execute("""
            SELECT o.id, o.user_id, o.site_id, o.order_date, o.product_name, o.shipping_status, o.tracking_id,
                   COALESCE(s.nickname, '') as store_nickname
            FROM orders_v2 o
            LEFT JOIN stores s ON o.user_id = s.user_id
            WHERE o.shipping_status IS NOT NULL AND o.shipping_status != ''
              AND o.shipping_status NOT IN ('pending', 'ready_to_ship')
              AND o.order_date > datetime('now', '-7 days')
            ORDER BY o.order_date DESC
            LIMIT 30
        """).fetchall()
        result["logistics"] = [
            {
                "id": f"log_{r[0]}",
                "site": r[2],
                "nickname": r[7] or f"物流{r[0]}",
                "title": f"物流更新: {r[5]} {r[6] or ''}",
                "time": r[3][:10] if r[3] else "",
                "read": False,
            }
            for r in rows
        ]

        # message: 客户消息（兼容字段名差异）
        # 尝试 question_text 或退回到 last_message
        try:
            rows = cur.execute("""
                SELECT id, site_id, updated_at, question_text, last_message
                FROM customer_messages
                ORDER BY updated_at DESC LIMIT 30
            """).fetchall()
        except:
            rows = cur.execute("""
                SELECT id, site_id, updated_at, '', last_message
                FROM customer_messages
                ORDER BY updated_at DESC LIMIT 30
            """).fetchall()
        result["message"] = [
            {
                "id": str(r[0]),
                "site": r[1] or '',
                "nickname": "客户",
                "title": (r[3] or r[4] or '新消息')[:60],
                "time": r[2][:10] if r[2] else "",
                "read": False,
            }
            for r in rows
        ]

        # reputation: 店铺声誉告警
        try:
            rows = cur.execute("""
                SELECT id, nickname, site_id, reclamos, cancellations_rate, new_violations, alert_date
                FROM stores
                WHERE (reclamos > 3 OR cancellations_rate > 3 OR new_violations > 0)
                  AND nickname IS NOT NULL AND nickname != '' AND nickname != '未命名店铺'
                ORDER BY new_violations DESC, reclamos DESC
                LIMIT 20
            """).fetchall()
        except:
            rows = cur.execute("""
                SELECT id, nickname, site_id,
                       COALESCE(CAST(REPLACE(complaints_rate, '%', '') AS REAL), 0),
                       COALESCE(CAST(REPLACE(cancellations_rate, '%', '') AS REAL), 0),
                       0, alert_date
                FROM stores
                WHERE complaints_rate IS NOT NULL AND complaints_rate != ''
                  AND CAST(REPLACE(complaints_rate, '%', '') AS REAL) > 3
                  AND nickname IS NOT NULL AND nickname != '' AND nickname != '未命名店铺'
                ORDER BY CAST(REPLACE(complaints_rate, '%', '') AS REAL) DESC
                LIMIT 20
            """).fetchall()

        result["reputation"] = [
            {
                "id": f"rep_{r[0]}",
                "site": r[2] or "MLM",
                "nickname": r[1] or f"店铺{r[0]}",
                "title": f"声誉告警: 投诉率{r[3]}% 取消率{r[4]}%",
                "time": r[6] or "",
                "read": False,
            }
            for r in rows
        ]

        # violation: 投诉违规（优先从 ml_notifications+monitoring_logs 取）
        rows = cur.execute("""
            SELECT ml_id, resource, user_id, topic, created_at, status
            FROM ml_notifications
            WHERE topic = 'marketplace_claims'
              AND status IN ('pending', 'processed')
            ORDER BY created_at DESC
            LIMIT 30
        """).fetchall()
        # 如果 ml_notifications 没数据，从 monitoring_logs 取警告
        if not rows:
            rows = cur.execute("""
                SELECT message, timestamp, store_id, site_id, level, details
                FROM monitoring_logs
                WHERE level = 'warning' AND message LIKE '%索赔%'
                ORDER BY timestamp DESC
                LIMIT 30
            """).fetchall()
            result["violation"] = [
                {
                    "id": f"w_{i}",
                    "site": r[3] or "",
                    "nickname": f"店铺{r[2]}" if r[2] else "",
                    "title": r[0][:80],
                    "time": r[1][:10] if r[1] else "",
                    "read": False,
                }
                for i, r in enumerate(rows)
            ]
        else:
            result["violation"] = [
                {
                    "id": str(r[0]),
                    "site": "",
                    "nickname": f"Claim_{r[0]}",
                    "title": f"投诉: {r[3]} ({r[5]})",
                    "time": r[4][:10] if r[4] else "",
                    "read": False,
                }
                for r in rows
            ]

    return result


@router.get("/notifications/realtime")
def get_realtime_notifications():
    """
    返回 webhook 实时推送的通知（按时间倒序）
    """
    with get_db_connection() as db:
        cur = db.cursor()
        rows = cur.execute("""
            SELECT id, topic, content, site_id, order_id, received_at, read_status
            FROM realtime_notifications
            ORDER BY id DESC
            LIMIT 100
        """).fetchall()

    return [
        {
            "id": r[0],
            "topic": r[1],
            "content": r[2],
            "site": r[3] or "",
            "order_id": r[4] or "",
            "time": r[5] if r[5] else "",
            "read": bool(r[6]),
        }
        for r in rows
    ]

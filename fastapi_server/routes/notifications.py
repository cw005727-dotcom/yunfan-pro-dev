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
            SELECT id, user_id, site_id, order_date, product_name, quantity, status, shipping_status
            FROM orders_v2
            WHERE status != 'cancelled'
              AND order_date > datetime('now', '-7 days')
            ORDER BY order_date DESC
            LIMIT 50
        """).fetchall()
        result["order"] = [
            {
                "id": str(r[0]),
                "site": r[2],
                "nickname": f"订单{r[0]}",
                "title": f"新订单: {r[4] or '商品'} x{r[5]}",
                "time": r[3][:10] if r[3] else "",
                "read": False,
            }
            for r in rows
        ]

        # cancelled: 近7天取消
        rows = cur.execute("""
            SELECT id, user_id, site_id, order_date, product_name, status
            FROM orders_v2
            WHERE status = 'cancelled'
              AND order_date > datetime('now', '-7 days')
            ORDER BY order_date DESC
            LIMIT 30
        """).fetchall()
        result["cancelled"] = [
            {
                "id": f"c_{r[0]}",
                "site": r[2],
                "nickname": f"订单{r[0]}",
                "title": f"订单取消: {r[4] or '商品'}",
                "time": r[3][:10] if r[3] else "",
                "read": False,
            }
            for r in rows
        ]

        # logistics: 有物流动态的
        rows = cur.execute("""
            SELECT id, user_id, site_id, order_date, product_name, shipping_status, tracking_id
            FROM orders_v2
            WHERE shipping_status IS NOT NULL AND shipping_status != ''
              AND shipping_status NOT IN ('pending', 'ready_to_ship')
              AND order_date > datetime('now', '-7 days')
            ORDER BY order_date DESC
            LIMIT 30
        """).fetchall()
        result["logistics"] = [
            {
                "id": f"log_{r[0]}",
                "site": r[2],
                "nickname": f"物流{r[0]}",
                "title": f"物流更新: {r[5]} {r[6] or ''}",
                "time": r[3][:10] if r[3] else "",
                "read": False,
            }
            for r in rows
        ]

        # message: 客户消息（空表占位）
        rows = cur.execute("""
            SELECT id, site_id, date_created, question_text, last_message
            FROM customer_messages
            ORDER BY date_created DESC LIMIT 30
        """).fetchall()
        result["message"] = [
            {
                "id": str(r[0]),
                "site": r[1],
                "nickname": "客户消息",
                "title": r[1] or (r[2][:20] if r[2] else "新消息"),
                "time": r[1][:10] if r[1] else "",
                "read": False,
            }
            for r in rows
        ]

        # reputation: 店铺声誉告警
        rows = cur.execute("""
            SELECT id, nickname, site_id, reclamos, cancel, new_violations, alert_date
            FROM stores
            WHERE reclamos > 3 OR cancel > 3 OR new_violations > 0
            ORDER BY new_violations DESC, reclamos DESC
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

        # violation: 投诉违规
        rows = cur.execute("""
            SELECT id, order_id, site_id, last_update, type, reason, status
            FROM claims
            ORDER BY last_update DESC
            LIMIT 30
        """).fetchall()
        result["violation"] = [
            {
                "id": str(r[0]),
                "site": r[2],
                "nickname": f"Claim_{r[1]}",
                "title": f"投诉: {r[4] or r[5] or '新投诉'} ({r[6]})",
                "time": r[3][:10] if r[3] else "",
                "read": False,
            }
            for r in rows
        ]

    return result

"""
物流相关路由
Batch 1 - 数据 AI 负责
GET  /api/logistics/stats   - 物流统计（4类订单数量）
GET  /api/logistics/detail   - 物流明细（单个订单详情）
"""
from fastapi import APIRouter, Query
from datetime import datetime, timedelta
from ..db import get_db_connection

router = APIRouter(prefix="/api", tags=["物流"])


@router.get("/logistics/stats")
async def get_logistics_stats():
    """物流统计 - 4类订单数量"""
    now_str = datetime.now().strftime('%Y-%m-%dT%H:%M:%S')

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM orders_v2 WHERE shipping_status IN ('pending', 'ready_to_ship', 'ready_to_print', 'printed')")
        cat1 = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM orders_v2 WHERE shipping_status IN ('shipped', 'in_transit', 'at_customs', 'left_customs', 'picked_up', 'dropped_off')")
        cat2 = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM orders_v2 WHERE shipping_status = 'delivered'")
        cat3 = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM orders_v2 WHERE shipping_status IN ('not_delivered', 'cancelled', 'detained_at_origin', 'cancelled_measurement_exceeded', 'pending_recovery', 'return_failed')")
        cat4 = cursor.fetchone()[0]

    return {
        "preparing": cat1,
        "in_transit": cat2,
        "delivered": cat3,
        "issues": cat4,
        "total": cat1 + cat2 + cat3 + cat4
    }


@router.get("/logistics/detail")
async def get_logistics_detail(order_id: str = Query(None)):
    """物流明细 - 单个订单的物流追踪"""
    if not order_id:
        return {"error": "order_id is required"}

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM orders_v2 WHERE id = ?", (order_id,))
        row = cursor.fetchone()

        if not row:
            return {"error": "Order not found"}

        d = dict(row)
        return {
            "order": d,
            "tracking_id": d.get("tracking_id"),
            "shipping_status": d.get("shipping_status"),
            "shipping_substatus": d.get("shipping_substatus"),
            "last_ship_date": d.get("last_ship_date"),
            "order_date": d.get("order_date"),
            "ship_deadline": d.get("ship_deadline")
        }
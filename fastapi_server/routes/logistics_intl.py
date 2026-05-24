"""
国际物流相关路由
Batch 1 - 数据 AI 负责
GET  /api/logistics/intl/dashboard - 国际物流看板（美客多跨境物流）
"""
from fastapi import APIRouter, Query
from datetime import datetime, timedelta
from ..db import get_db_connection

router = APIRouter(prefix="/api/logistics", tags=["国际物流"])


@router.get("/intl/dashboard")
async def get_intl_dashboard():
    """国际物流看板 - 美客多跨境物流卡片数据"""
    now = datetime.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    today_str = today_start.isoformat()

    with get_db_connection() as conn:
        cursor = conn.cursor()

        # --- 已签收（总数）---
        cursor.execute(
            "SELECT COUNT(*) FROM orders_v2 WHERE shipping_status = 'delivered'"
        )
        total_delivered = cursor.fetchone()[0]

        # --- 新增已签收（今天）---
        cursor.execute(
            "SELECT COUNT(*) FROM orders_v2 WHERE shipping_status = 'delivered' AND order_date >= ?",
            (today_str,)
        )
        today_delivered = cursor.fetchone()[0]

        # --- 已出关（substatus = left_customs）---
        cursor.execute(
            "SELECT COUNT(*) FROM orders_v2 WHERE shipping_substatus = 'left_customs'"
        )
        cleared_customs = cursor.fetchone()[0]

        # --- 运输中（shipped + 不是 left_customs/delivered）---
        cursor.execute(
            "SELECT COUNT(*) FROM orders_v2 WHERE shipping_status = 'shipped' AND COALESCE(shipping_substatus, '') != 'left_customs'"
        )
        in_transit = cursor.fetchone()[0]

        # --- 异常 ---
        cursor.execute(
            "SELECT COUNT(*) FROM orders_v2 WHERE shipping_status IN ('not_delivered', 'cancelled')"
        )
        issues = cursor.fetchone()[0]

        # --- 等待发货（ready_to_ship / pending / printed）---
        cursor.execute(
            "SELECT COUNT(*) FROM orders_v2 WHERE shipping_status IN ('ready_to_ship', 'pending') OR shipping_substatus IN ('ready_to_print', 'printed')"
        )
        pending_ship = cursor.fetchone()[0]

    return {
        "delivered": total_delivered,
        "today_delivered": today_delivered,
        "in_transit": in_transit,
        "cleared_customs": cleared_customs,
        "issues": issues,
        "pending_ship": pending_ship,
        "total": total_delivered + today_delivered + in_transit + cleared_customs + issues + pending_ship,
        "stats_at": datetime.now().isoformat()
    }

"""
Webhook 相关路由
POST /api/ml/webhook/relay - ML webhook 接收转发
"""
from datetime import datetime, timezone, timedelta
import logging
import json
from typing import Optional, Dict, Any

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel

from ..db import get_db_connection

# 北京时间（UTC+8）
BJ_TZ = timezone(timedelta(hours=8))

router = APIRouter(prefix="/api/ml/webhook", tags=["Webhook"])
logger = logging.getLogger(__name__)


def log_to_monitoring(level: str, message: str, store_id=None, site_id=None, details: dict = None):
    """写入 monitoring_logs，供前端 monitoring stream 轮询显示（北京时区）"""
    beijing_now = datetime.now(BJ_TZ).strftime('%Y-%m-%d %H:%M:%S')
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO monitoring_logs (timestamp, level, message, store_id, site_id, details) VALUES (?, ?, ?, ?, ?, ?)",
            (beijing_now, level, message, store_id, site_id, json.dumps(details) if details else None)
        )
        conn.commit()


class WebhookRelayPayload(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    site_id: Optional[str] = None
    topic: Optional[str] = "orders_v2"  # ML 发来的 topic，如 orders_v2/shipments/questions
    resource: Optional[str] = None      # ML API 路径，如 /orders/{id}
    order_date: Optional[str] = None
    product_name: Optional[str] = None
    quantity: Optional[int] = None
    amount: Optional[float] = None
    platform_fee: Optional[float] = None
    tax: Optional[float] = None
    net_profit: Optional[float] = None
    last_ship_date: Optional[str] = None
    status: Optional[str] = None
    shipping_status: Optional[str] = None
    shipping_substatus: Optional[str] = None
    tracking_id: Optional[str] = None
    logistic_type: Optional[str] = None
    seller_sku: Optional[str] = None
    thumbnail: Optional[str] = None
    cancel_detail_group: Optional[str] = None
    mediations_count: Optional[int] = None
    paid_amount: Optional[float] = None
    cancel_code: Optional[str] = None
    logistic_company: Optional[str] = None
    tracking_status: Optional[str] = None
    receiver_city: Optional[str] = None
    receiver_state: Optional[str] = None
    estimated_delivery_date: Optional[str] = None

    class Config:
        extra = "allow"


@router.post("/relay")
async def relay(payload: WebhookRelayPayload):
    """
    接收 ML webhook 通知，转发并保存到 orders_v2 表。
    对应旧端点：GET /api/ml/webhook/relay
    """
    try:
        order_data = payload.model_dump(exclude_none=True)
        if not order_data:
            raise HTTPException(status_code=400, detail="Empty payload")

        order_id = order_data.get('id')
        if not order_id:
            raise HTTPException(status_code=400, detail="Missing order id")

        with get_db_connection() as conn:
            cursor = conn.cursor()

            cursor.execute("SELECT 1 FROM orders_v2 WHERE id = ?", (str(order_id),))
            exists = cursor.fetchone() is not None

            cursor.execute("""
                INSERT OR REPLACE INTO orders_v2
                (id, user_id, site_id, order_date, product_name, quantity, amount,
                 platform_fee, tax, net_profit, last_ship_date, status, shipping_status,
                 shipping_substatus, tracking_id, logistic_type, seller_sku, thumbnail,
                 cancel_detail_group, mediations_count, paid_amount, cancel_code,
                 logistic_company, tracking_status, receiver_city, receiver_state,
                 estimated_delivery_date, source)
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'webhook')
            """", (
                order_data.get('id'),
                order_data.get('user_id'),
                order_data.get('site_id'),
                order_data.get('order_date'),
                order_data.get('product_name'),
                order_data.get('quantity'),
                order_data.get('amount'),
                order_data.get('platform_fee'),
                order_data.get('tax'),
                order_data.get('net_profit'),
                order_data.get('last_ship_date'),
                order_data.get('status'),
                order_data.get('shipping_status'),
                order_data.get('shipping_substatus'),
                order_data.get('tracking_id'),
                order_data.get('logistic_type'),
                order_data.get('seller_sku'),
                order_data.get('thumbnail'),
                order_data.get('cancel_detail_group'),
                order_data.get('mediations_count'),
                order_data.get('paid_amount'),
                order_data.get('cancel_code'),
                order_data.get('logistic_company'),
                order_data.get('tracking_status'),
                order_data.get('receiver_city'),
                order_data.get('receiver_state'),
                order_data.get('estimated_delivery_date'),
            ))
            conn.commit()

            # 写入 ml_notifications 队列，供 notification_processor 处理
            cursor.execute(
                "INSERT INTO ml_notifications (ml_id, resource, user_id, topic, application_id, status) VALUES (?, ?, ?, ?, ?, 'pending')",
                (
                    str(order_id),
                    order_data.get('resource', f"/orders/{order_id}"),
                    order_data.get('user_id'),
                    order_data.get('topic', 'orders_v2'),
                    order_data.get('application_id'),
                )
            )
            conn.commit()

        # 同时写入 monitoring_logs，供前端 monitoring stream 实时显示
        order_id_str = str(order_id)
        log_to_monitoring(
            'info',
            f"📦 新订单：{order_id_str} (金额: {order_data.get('amount', 'N/A')})",
            store_id=order_data.get('user_id'),
            site_id=order_data.get('site_id'),
            details={"order_id": order_id_str, "source": "webhook", "status": order_data.get('status'), "amount": order_data.get('amount')}
        )

        logger.info(f"[Webhook Relay] order {order_id} saved (updated={exists})")
        return {"ok": True, "id": order_id, "updated": exists}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Webhook Relay] error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
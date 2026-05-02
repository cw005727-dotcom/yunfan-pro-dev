"""
Webhook 相关路由
POST /api/ml/webhook/relay - ML webhook 接收转发

支持 topic:
  - orders_v2 / orders: 新订单 → orders_v2 表
  - shipments: 物流状态更新 → 通过 order_id 找到对应订单，更新 shipping/tracking 字段
  - questions: 新咨询 → customer_messages 表
"""
from datetime import datetime, timezone, timedelta
import logging
import json
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..db import get_db_connection

BJ_TZ = timezone(timedelta(hours=8))
router = APIRouter(prefix="/api/ml/webhook", tags=["Webhook"])
logger = logging.getLogger(__name__)

SITE_NAMES = {
    'MLB': '巴西', 'MLM': '墨西哥', 'MLA': '阿根廷',
    'MCO': '哥伦比亚', 'MLC': '智利', 'MLU': '乌拉圭'
}


def log_to_monitoring(level: str, message: str, store_id=None, site_id=None, details: dict = None):
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
    topic: Optional[str] = "orders_v2"
    resource: Optional[str] = None
    order_id: Optional[str] = None        # shipments topic 会带这个
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


def to_beijing(ts_str):
    """ML 返回的时间转北京时间"""
    if not ts_str:
        return ''
    try:
        dt = datetime.fromisoformat(ts_str.replace('Z', '+00:00'))
        bj = dt + timedelta(hours=12)
        return bj.strftime('%Y-%m-%dT%H:%M:%S')
    except:
        return ts_str[:19] if ts_str else ''


def handle_shipments(conn, data: dict):
    """
    shipments webhook: 通过 order_id 或 order__id 找到对应订单，更新物流字段。
    不做 INSERT（订单可能不存在），只 UPDATE 已有订单。
    """
    cursor = conn.cursor()
    order_id = data.get('order_id') or data.get('id')
    if not order_id:
        return

    # 检查该订单是否存在
    cursor.execute("SELECT id FROM orders_v2 WHERE id = ?", (str(order_id),))
    if not cursor.fetchone():
        logger.info(f"[Shipments webhook] order {order_id} not found, skipping")
        return

    cursor.execute("""
        UPDATE orders_v2 SET
            shipping_status = COALESCE(?, shipping_status),
            shipping_substatus = COALESCE(?, shipping_substatus),
            tracking_id = COALESCE(?, tracking_id),
            logistic_type = COALESCE(?, logistic_type),
            logistic_company = COALESCE(?, logistic_company),
            tracking_status = COALESCE(?, tracking_status)
        WHERE id = ?
    """, (
        data.get('shipping_status'),
        data.get('shipping_substatus'),
        data.get('tracking_id'),
        data.get('logistic_type'),
        data.get('logistic_company'),
        data.get('tracking_status'),
        str(order_id)
    ))


def handle_orders(conn, data: dict, topic: str):
    """orders / orders_v2 webhook: 插入或更新订单"""
    cursor = conn.cursor()
    order_id = data.get('id') or data.get('order_id')
    if not order_id:
        raise HTTPException(status_code=400, detail="Missing order id")

    # 巴西时间转北京时间
    raw_date = data.get('order_date') or data.get('date_created') or ''
    order_date_bj = to_beijing(raw_date)

    cursor.execute("""
        INSERT OR REPLACE INTO orders_v2
        (id, user_id, site_id, order_date, product_name, quantity, amount,
         platform_fee, tax, net_profit, last_ship_date, status, shipping_status,
         shipping_substatus, tracking_id, logistic_type, seller_sku, thumbnail,
         cancel_detail_group, mediations_count, paid_amount, cancel_code,
         logistic_company, tracking_status, receiver_city, receiver_state,
         estimated_delivery_date, source)
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        str(order_id),
        data.get('user_id'),
        data.get('site_id'),
        order_date_bj,
        data.get('product_name'),
        data.get('quantity'),
        data.get('amount'),
        data.get('platform_fee'),
        data.get('tax'),
        data.get('net_profit'),
        data.get('last_ship_date'),
        data.get('status'),
        data.get('shipping_status'),
        data.get('shipping_substatus'),
        data.get('tracking_id'),
        data.get('logistic_type'),
        data.get('seller_sku'),
        data.get('thumbnail'),
        data.get('cancel_detail_group'),
        data.get('mediations_count'),
        data.get('paid_amount'),
        data.get('cancel_code'),
        data.get('logistic_company'),
        data.get('tracking_status'),
        data.get('receiver_city'),
        data.get('receiver_state'),
        data.get('estimated_delivery_date'),
        'webhook',
    ))

    # monitoring_logs
    site = SITE_NAMES.get(data.get('site_id', ''), data.get('site_id', ''))
    amount = data.get('amount')
    amt_str = f'${amount:.2f}' if amount else 'N/A'
    log_to_monitoring(
        'info',
        f"📦 新订单：{site} {order_id} 成交 {amt_str}",
        store_id=data.get('user_id'),
        site_id=data.get('site_id'),
        details={"order_id": str(order_id), "source": "webhook", "status": data.get('status'), "amount": amount}
    )


def handle_questions(conn, data: dict):
    """questions webhook: 写入咨询消息"""
    cursor = conn.cursor()
    question_id = data.get('id') or data.get('question_id')
    if not question_id:
        return

    from_val = data.get('from', {})
    from_user = from_val.get('id') if isinstance(from_val, dict) else None
    site = data.get('site_id', '')
    site_name = SITE_NAMES.get(site, site)
    product = data.get('item_id', '')
    question_text = data.get('question_text') or data.get('text', '')
    status = 'unread'

    try:
        cursor.execute("""
            INSERT OR IGNORE INTO customer_messages
            (site_id, buyer_id, item_id, last_message, status, updated_at)
            VALUES (?, ?, ?, ?, 'unread', datetime('now'))
        """, (
            site, from_user, product, question_text[:200]
        ))
        log_to_monitoring(
            'info',
            f"💬 新咨询：{site_name} 咨询 {product[:30]}",
            store_id=from_user,
            site_id=site,
            details={"question_id": str(question_id), "source": "webhook"}
        )
    except Exception as e:
        logger.warning(f"[Questions webhook] failed to write: {e}")


@router.post("/relay")
async def relay(payload: WebhookRelayPayload):
    """
    统一接收 ML 所有 webhook 通知，按 topic 分流处理：
      orders / orders_v2 → handle_orders → orders_v2
      shipments         → handle_shipments → 更新已有订单物流字段
      questions         → handle_questions → customer_messages
    """
    try:
        data = payload.model_dump(exclude_none=True)
        if not data:
            raise HTTPException(status_code=400, detail="Empty payload")

        topic = data.get('topic', 'orders_v2')
        order_id = data.get('id') or data.get('order_id')
        logger.info(f"[Webhook Relay] topic={topic} id={order_id}")

        with get_db_connection() as conn:
            if topic in ('orders', 'orders_v2'):
                handle_orders(conn, data, topic)
            elif topic == 'shipments':
                handle_shipments(conn, data)
            elif topic == 'questions':
                handle_questions(conn, data)
            else:
                # 未知 topic 也记录一下
                logger.info(f"[Webhook Relay] unknown topic: {topic}, data keys: {list(data.keys())}")

            # ml_notifications 队列（仅订单类 topic）
            if topic in ('orders', 'orders_v2', 'shipments'):
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO ml_notifications (ml_id, resource, user_id, topic, application_id, status) VALUES (?, ?, ?, ?, ?, 'pending')",
                    (
                        str(order_id or data.get('id', '')),
                        data.get('resource', f"/{topic}/{order_id}"),
                        data.get('user_id'),
                        topic,
                        data.get('application_id'),
                    )
                )
                conn.commit()

        return {"ok": True, "topic": topic, "id": order_id}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Webhook Relay] error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
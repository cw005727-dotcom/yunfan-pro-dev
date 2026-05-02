"""
Webhook 相关路由
POST /api/ml/webhook/relay - ML webhook 接收转发

支持 topic:
  - orders_v2 / orders: 新订单 → orders_v2 表
  - shipments: 物流状态更新 → 通过 order_id 找到对应订单，更新 shipping/tracking 字段
  - questions: 新咨询 → customer_messages 表
  - marketplace_claims: 索赔/投诉 → monitoring_logs 实时播报（+ ml_notifications 队列表）
"""
from datetime import datetime, timezone, timedelta
import logging
import json
import re
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

# claims status → 中文描述
CLAIM_STATUS_ZH = {
    'opened': '已开立', 'closed': '已关闭', 'resolved': '已解决',
    'refunded': '已退款', 'cancelled': '已取消', 'payment_expiring': '付款即将过期',
    'mediation': '调解中', 'pending': '处理中', 'disputed': '争议中',
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
    order_id: Optional[str] = None
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
    # claims 专用字段
    type: Optional[str] = None
    reason: Optional[dict] = None
    currency_id: Optional[str] = None
    opened_by: Optional[str] = None

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
    shipments webhook: 通过 order_id 找到对应订单，只 UPDATE 物流字段。
    不做 INSERT（订单可能不存在），只更新已有订单。
    """
    cursor = conn.cursor()
    order_id = data.get('order_id') or data.get('id')
    if not order_id:
        return

    cursor.execute("SELECT id FROM orders_v2 WHERE id = ?", (str(order_id),))
    if not cursor.fetchone():
        logger.info(f"[Shipments webhook] order {order_id} not found, skipping")
        return

    cursor.execute(""""
        UPDATE orders_v2 SET
            shipping_status = COALESCE(NULLIF(?, ''), shipping_status),
            shipping_substatus = COALESCE(NULLIF(?, ''), shipping_substatus),
            tracking_id = COALESCE(NULLIF(?, ''), tracking_id),
            logistic_type = COALESCE(NULLIF(?, ''), logistic_type),
            logistic_company = COALESCE(NULLIF(?, ''), logistic_company),
            tracking_status = COALESCE(NULLIF(?, ''), tracking_status),
            receiver_city = COALESCE(NULLIF(?, ''), receiver_city),
            receiver_state = COALESCE(NULLIF(?, ''), receiver_state),
            estimated_delivery_date = COALESCE(NULLIF(?, ''), estimated_delivery_date)
        WHERE id = ?
    """, (
        data.get('shipping_status'),
        data.get('shipping_substatus'),
        data.get('tracking_id'),
        data.get('logistic_type'),
        data.get('logistic_company'),
        data.get('tracking_status'),
        data.get('receiver_city'),
        data.get('receiver_state'),
        data.get('estimated_delivery_date'),
        str(order_id)
    ))


def handle_orders(conn, data: dict):
    """orders / orders_v2 webhook: 插入或更新订单"""
    cursor = conn.cursor()
    order_id = data.get('id') or data.get('order_id')
    if not order_id:
        raise HTTPException(status_code=400, detail="Missing order id")

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


def handle_questions(conn, data: dict):
    """questions webhook: 写入咨询消息"""
    cursor = conn.cursor()
    question_id = data.get('id') or data.get('question_id')
    if not question_id:
        logger.warning(f"[Questions webhook] missing question_id, skipping")
        return

    from_val = data.get('from', {})
    from_user = from_val.get('id') if isinstance(from_val, dict) else None
    seller_id = data.get('seller_id') or data.get('user_id') or '3164139599'
    site = data.get('site_id', '')
    product = data.get('item_id', '')
    question_text = data.get('question_text') or data.get('text', '')
    buyer_name = data.get('from', {}).get('nickname', '') if isinstance(data.get('from'), dict) else ''

    try:
        conn.execute(
            "INSERT OR REPLACE INTO customer_messages (id, site_id, seller_id, buyer_id, buyer_name, item_id, last_message, status) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (str(question_id), site, str(seller_id), str(from_user or ''),
             str(buyer_name), str(product), str(question_text[:200])[:200], 'unread'))
    except Exception as e:
        logger.warning(f"[Questions webhook] failed to write: {e}")




def handle_claims(conn, data: dict):
    """
    marketplace_claims webhook:
    提取 claim_id，写入 ml_notifications（幂等，INSERT OR IGNORE）。
    详细的 claim 信息通过 ml_notifications 触发后续处理。
    """
    resource = data.get('resource', '')
    match = re.search(r'/claims/([^\s/]+)', resource)
    claim_id = match.group(1) if match else data.get('id', '')
    if not claim_id:
        logger.warning(f"[Claims webhook] missing claim_id, skipping")
        return

    try:
        conn.execute(
            "INSERT OR IGNORE INTO ml_notifications (ml_id, resource, user_id, topic, application_id, status) VALUES (?, ?, ?, ?, ?, 'pending')",
            (
                str(claim_id),
                resource or f"/claims/{claim_id}",
                data.get('user_id'),
                'marketplace_claims',
                data.get('application_id'),
            )
        )
    except Exception as e:
        logger.warning(f"[Claims webhook] failed to write ml_notifications: {e}")


@router.post("/relay")
async def relay(payload: WebhookRelayPayload):
    """
    统一接收 ML 所有 webhook 通知，按 topic 分流处理：
      orders / orders_v2      → handle_orders   → orders_v2
      shipments               → handle_shipments → 更新已有订单物流字段
      questions               → handle_questions → customer_messages
      marketplace_claims      → handle_claims    → ml_notifications（后续处理）
    monitoring_logs 写在事务 commit 之后，避免 SQLite 锁。
    """
    try:
        data = payload.model_dump(exclude_none=True)
        if not data:
            raise HTTPException(status_code=400, detail="Empty payload")

        topic = data.get('topic', 'orders_v2')
        order_id = data.get('id') or data.get('order_id')
        logger.info(f"[Webhook Relay] topic={topic} id={order_id}")

        # 预填 monitoring 信息（事务 commit 后再写）
        monitor_msg = None
        monitor_store = None
        monitor_site = None
        monitor_details = None
        urgent = False  # 索赔默认紧急

        with get_db_connection() as conn:
            if topic in ('orders', 'orders_v2'):
                handle_orders(conn, data)
                site = SITE_NAMES.get(data.get('site_id', ''), data.get('site_id', ''))
                amount = data.get('amount')
                amt_str = f'${amount:.2f}' if amount else 'N/A'
                monitor_msg = f"📦 新订单：{site} {order_id} 成交 {amt_str}"
                monitor_store = data.get('user_id')
                monitor_site = data.get('site_id')
                monitor_details = {"order_id": str(order_id), "source": "webhook", "status": data.get('status'), "amount": amount}
                urgent = False

            elif topic == 'shipments':
                handle_shipments(conn, data)
                logistic_company = data.get('logistic_company') or data.get('tracking_method') or '-'
                rcv_city = data.get('receiver_city') or '-'
                est_del = data.get('estimated_delivery_date') or ''
                if est_del:
                    est_del = est_del[:10]
                monitor_msg = (
                    f"🚚 物流更新：订单 {order_id} → "
                    f"{logistic_company} / "
                    f"{data.get('shipping_status', '-')}"
                )
                if rcv_city and rcv_city != '-':
                    monitor_msg += f" / 收货：{rcv_city}"
                if est_del:
                    monitor_msg += f" / 预计{est_del}"
                monitor_site = data.get('site_id')
                monitor_details = {
                    "order_id": str(order_id),
                    "source": "webhook",
                    "logistic_company": logistic_company,
                    "shipping_status": data.get('shipping_status'),
                    "receiver_city": rcv_city,
                    "estimated_delivery_date": est_del
                }
                urgent = False

            elif topic == 'questions':
                handle_questions(conn, data)
                site = SITE_NAMES.get(data.get('site_id', ''), data.get('site_id', ''))
                monitor_msg = f"💬 新咨询：{site} 咨询 {str(data.get('item_id', ''))[:30]}"
                monitor_site = data.get('site_id')
                monitor_details = {"source": "webhook"}
                urgent = False

            elif topic == 'marketplace_claims':
                handle_claims(conn, data)
                site = SITE_NAMES.get(data.get('site_id', ''), data.get('site_id', ''))
                resource = data.get('resource', '')
                match = re.search(r'/claims/([^\s/]+)', resource)
                claim_id = match.group(1) if match else order_id or ''
                reason = data.get('reason', {})
                reason_text = reason.get('description', '') if isinstance(reason, dict) else ''
                status_zh = CLAIM_STATUS_ZH.get(data.get('status', ''), data.get('status', ''))
                type_zh = {'claim': '投诉', 'mediation': '调解', 'return': '退货'}.get(data.get('type', ''), data.get('type', ''))
                monitor_msg = f"⚠️ 索赔/投诉：{site} {type_zh} {claim_id} [{status_zh}] {reason_text}"
                monitor_site = data.get('site_id')
                monitor_store = data.get('user_id')
                monitor_details = {"claim_id": claim_id, "status": data.get('status'), "type": data.get('type'), "reason": reason_text, "source": "webhook"}
                urgent = True

            else:
                logger.info(f"[Webhook Relay] unhandled topic: {topic}, keys: {list(data.keys())}")


            conn.commit()

        # 事务结束后再写 monitoring_logs，避免数据库锁
        if monitor_msg:
            log_to_monitoring('warning' if urgent else 'info', monitor_msg,
                              store_id=monitor_store, site_id=monitor_site, details=monitor_details)

        return {"ok": True, "topic": topic, "id": order_id}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Webhook Relay] error: {e}", exc_info=True)

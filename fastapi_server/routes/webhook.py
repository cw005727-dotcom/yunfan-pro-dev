"""
Webhook 相关路由
POST /api/tongzhi - ML webhook 统一入口（/api/relay 已废弃）
POST /api/meli-auth - OAuth 授权回调

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
import requests
from typing import Optional

from fastapi import APIRouter, HTTPException, Body, Request
import os
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from ..db import get_db_connection

ML_DEFAULT_SELLER_ID = os.environ.get("ML_DEFAULT_SELLER_ID", "3164139599")

BJ_TZ = timezone(timedelta(hours=8))
router = APIRouter(prefix="/api", tags=["Webhook"])
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
        bj = dt + timedelta(hours=8)
        return bj.strftime('%Y-%m-%dT%H:%M:%S')
    except:
        return ts_str[:19] if ts_str else ''


def enrich_marketplace_order(data: dict, order_id: str):
    """marketplace_orders webhook 缺少详情字段，通过 ML API 补充。"""
    try:
        # 从 stores 表读 token，按 user_id 匹配
        from ..config import DB_PATH
        import sqlite3
        uid = data.get('user_id', '')
        conn = sqlite3.connect(str(DB_PATH))
        cur = conn.cursor()
        if uid:
            cur.execute("SELECT access_token FROM stores WHERE ml_user_id=? AND access_token IS NOT NULL AND access_token!='' ORDER BY token_updated_at DESC LIMIT 1", (str(uid),))
        else:
            cur.execute("SELECT access_token FROM stores WHERE access_token IS NOT NULL AND access_token!='' ORDER BY token_updated_at DESC LIMIT 1")
        row = cur.fetchone()
        conn.close()
        if not row or not row[0]:
            logger.warning(f"[enrich] no token for user_id={uid}")
            return
        token = row[0]
        headers = {'Authorization': f'Bearer {token}'}
        url = f'https://api.mercadolibre.com/marketplace/orders/{order_id}'
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code == 200:
            od = resp.json()
            # 合并关键字段（优先用 API 数据，保留 webhook payload 作为 fallback）
            data['site_id'] = od.get('site_id') or od.get('context', {}).get('site') or data.get('site_id')
            data['status'] = od.get('status') or data.get('status')
            raw_date = od.get('date_created')
            data['order_date'] = to_beijing(raw_date) if raw_date else data.get('order_date')
            # order_items 里的单价 × 数量（total_amount 经常为 null，要从 items 累加）
            items = od.get('order_items') or []
            total = round(sum(
                float(i.get('unit_price') or 0) * int(i.get('quantity') or 1)
                for i in items
            ), 2)
            # paid_amount 优先用 API 的 total_amount，没有则用计算值
            data['amount'] = total
            data['paid_amount'] = od.get('total_amount') or total
            if items:
                first = items[0]
                data['product_name'] = first.get('item', {}).get('title', '')
                data['seller_sku'] = first.get('item', {}).get('seller_sku', '')
                data['quantity'] = first.get('quantity', 1)
                data['thumbnail'] = first.get('item', {}).get('id', '')
            logger.info(f"[enrich] got order details: site={data.get('site_id')} amount={data.get('amount')} paid={data.get('paid_amount')} status={data.get('status')}")
        else:
            logger.warning(f"[enrich] API {url} -> {resp.status_code}")
    except Exception as e:
        logger.error(f"[enrich] error: {e}")


def handle_shipments(conn, data: dict):
    """
    shipments webhook: 通过 order_id 找到对应订单，只 UPDATE 物流字段。
    支持两种 payload 格式：
      1. webhook 直发格式（order_id/status/tracking_method/receiver_city 等直接字段）
      2. ML shipments API 格式（shipping.id/status + logistic.type + destination.shipping_address.city.name）
    不做 INSERT（订单可能不存在），只更新已有订单。
    """
    cursor = conn.cursor()
    # ML marketplace_shipments webhook: resource="/marketplace/shipments/46916896649"
    raw_resource = data.get('resource', '') or ''
    order_id = data.get('order_id') or data.get('id')
    if not order_id and raw_resource:
        m = re.search(r'/shipments?/(\d+)', raw_resource)
        if m:
            order_id = m.group(1)
    if not order_id:
        logger.warning(f"[handle_shipments] missing order_id, data keys={list(data.keys())[:8]}")
        return

    cursor.execute("SELECT id FROM orders_v2 WHERE id = ?", (str(order_id),))
    if not cursor.fetchone():
        logger.info(f"[Shipments webhook] order {order_id} not found, skipping")
        return

    # ── 字段兼容：同时支持 webhook 直发字段 和 ML shipments API 嵌套格式 ──
    # shipping_status: webhook 用 status，ML API 用 shipping.status
    raw = data.get('shipping_status') or data.get('status')
    # shipping_substatus: webhook 用 substatus，ML API 用 shipping.substatus
    raw_sub = data.get('shipping_substatus') or data.get('substatus')
    # tracking_id: webhook 用 tracking_id/tracking_number，ML API 用 shipping.tracking_number
    raw_tid = data.get('tracking_id') or data.get('tracking_number')
    if not raw_tid:
        raw_tid = (data.get('shipping') or {}).get('tracking_number')
    # logistic_type: ML API 嵌套在 logistic.type
    raw_lt = (data.get('logistic') or {}).get('type') if isinstance(data.get('logistic'), dict) else data.get('logistic_type')
    # logistic_company: webhook 直接字段或 tracking_method
    raw_lc = data.get('logistic_company') or data.get('tracking_method')
    # tracking_status: ML API substatus
    raw_ts = data.get('tracking_status') or data.get('substatus')
    # receiver_city / receiver_state: 支持 webhook 直发字段 或 ML API 嵌套格式
    addr = (data.get('destination') or {}).get('shipping_address') or {}
    ml_city = (addr.get('city') or {}).get('name') if isinstance(addr.get('city'), dict) else addr.get('city')
    raw_city = data.get('receiver_city') or ml_city or ''
    ml_state = (addr.get('state') or {}).get('name') if isinstance(addr.get('state'), dict) else addr.get('state')
    raw_state = data.get('receiver_state') or ml_state or ''
    # estimated_delivery_date: 支持 webhook 直发字段 或 ML API 嵌套格式
    lt = data.get('lead_time') or {}
    ml_est = (lt.get('estimated_delivery_time') or {}).get('date') if isinstance(lt, dict) else ''
    raw_est = data.get('estimated_delivery_date') or ml_est or ''

    logger.info(f"[handle_shipments] oid={order_id} ss={raw} lc={raw_lc} city={raw_city} est={raw_est}")

    cursor.execute("""
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
        raw, raw_sub, raw_tid, raw_lt, raw_lc,
        raw_ts, raw_city, raw_state, raw_est,
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

    # 兜底：从 webhook payload 的 order_items 直接算金额（不依赖 enrich_marketplace_order 成功）
    amount = data.get('amount')
    if not amount:
        items = data.get('order_items') or []
        amount = round(sum(
            float(i.get('unit_price') or 0) * int(i.get('quantity') or 1)
            for i in items
        ), 2) or None

    paid = data.get('paid_amount')
    if not paid and amount:
        paid = amount

    logger.warning(f"[handle_orders] EXEC: id={str(order_id)} amt={amount} paid={paid} od_bj={order_date_bj} site={data.get('site_id')}")
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
        amount if amount else None,
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
        paid,
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
    seller_id = data.get('seller_id') or data.get('user_id') or ML_DEFAULT_SELLER_ID
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


# 兼容旧版 ML webhook 路径
@router.post("/relay")
async def relay(request: Request):
    """统一接收 ML 所有 webhook 通知（旧路径），按 topic 分流处理。"""
    return await _handle_webhook(request)

# 兼容旧版错误路径 /api/ml/webhook/relay
@router.post("/ml/webhook/relay")
async def ml_relay(request: Request):
    """兼容旧版 ML webhook 路径 /api/ml/webhook/relay"""
    return await _handle_webhook(request)

async def _handle_webhook(request: Request):
    content_type = request.headers.get("content-type", "")
    if "application/x-www-form-urlencoded" in content_type:
        form = await request.form()
        body = dict(form)
    else:
        body = await request.json()

    data = body
    if not data:
        return {"ok": False, "error": "Empty payload", "topic": "unknown"}

    topic = data.get('topic', 'orders_v2')
    raw_resource = data.get('resource', '') or ''

    # 第一时间返回 200，告知 ML 已收到（500ms 时限要求）
    # 后续处理异步执行，不阻塞 webhook 响应
    import asyncio

    # 启动后台任务处理，不 await
    asyncio.create_task(_process_webhook_async(data, topic, raw_resource))

    return {"ok": True, "topic": topic, "id": raw_resource.split('/')[-1] if raw_resource else ""}


async def _process_webhook_async(data: dict, topic: str, raw_resource: str):
    """延后处理 webhook 通知，不影响 200 响应时效"""
    try:
        order_id = data.get('id') or data.get('order_id')
        if not order_id and raw_resource:
            m = re.search(r'/orders/(\d+)', raw_resource)
            if m:
                order_id = m.group(1)

        logger.info(f"[Webhook Async] topic={topic} id={order_id} resource={raw_resource[:50]}")

        # claims / items / marketplace_items / marketplace_messages 这些没有 order_id
        if order_id:
            data['id'] = order_id

        # marketplace_orders 缺少详情字段，通过 API 补充
        if topic in ('marketplace_orders', 'marketplace_orders_on_site') and order_id:
            enrich_marketplace_order(data, order_id)

        # 预填 monitoring 信息
        monitor_msg = None
        monitor_store = None
        monitor_site = None
        monitor_details = None
        urgent = False

        with get_db_connection() as conn:
            if topic in ('orders', 'orders_v2', 'marketplace_orders', 'marketplace_orders_on_site'):
                handle_orders(conn, data)
                if topic in ('marketplace_orders', 'marketplace_orders_on_site') and data.get('_bj_now'):
                    cursor2 = conn.cursor()
                    cursor2.execute("UPDATE orders_v2 SET order_date=? WHERE id=?",
                                    (data['_bj_now'], str(order_id)))
                site = SITE_NAMES.get(data.get('site_id', ''), data.get('site_id', ''))
                amount = data.get('amount')
                amt_str = f'${float(amount):.2f}' if amount else 'N/A'
                monitor_msg = f"📦 新订单：{site} {order_id} 成交 {amt_str}"
                monitor_store = data.get('user_id')
                monitor_site = data.get('site_id')
                monitor_details = {"order_id": str(order_id), "source": "webhook", "status": data.get('status'), "amount": amount}

            elif topic in ('shipments', 'marketplace_shipments'):
                handle_shipments(conn, data)
                sid = raw_resource.split('/')[-1] if raw_resource else order_id or '-'
                logistic_company = data.get('logistic_company') or data.get('tracking_method') or '-'
                rcv_city = data.get('receiver_city') or '-'
                est_del = data.get('estimated_delivery_date') or ''
                if est_del:
                    est_del = est_del[:10]
                monitor_msg = f"🚚 物流更新：发货单 {sid} → {logistic_company} / {data.get('shipping_status', '-')}"
                if rcv_city and rcv_city != '-':
                    monitor_msg += f" / 收货：{rcv_city}"
                if est_del:
                    monitor_msg += f" / 预计{est_del}"
                monitor_site = data.get('site_id')
                monitor_details = {
                    "shipment_id": sid, "source": "webhook", "logistics": True,
                    "logistic_company": logistic_company, "shipping_status": data.get('shipping_status'),
                    "receiver_city": rcv_city, "estimated_delivery_date": est_del
                }

            elif topic == 'questions':
                handle_questions(conn, data)
                site = SITE_NAMES.get(data.get('site_id', ''), data.get('site_id', ''))
                monitor_msg = f"💬 新咨询：{site} 咨询 {str(data.get('item_id', ''))[:30]}"
                monitor_site = data.get('site_id')
                monitor_details = {"source": "webhook"}

            elif topic == 'marketplace_claims':
                handle_claims(conn, data)
                site = SITE_NAMES.get(data.get('site_id', ''), data.get('site_id', ''))
                match = re.search(r'/claims/([^\s/]+)', raw_resource)
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

            elif topic == 'orders_feedback':
                resource = data.get('resource', '') or ''
                order_id = resource.split('/')[-2] if '/feedback' in resource else ''
                monitor_msg = f"\xe2\xad\x90 \xe8\xaf\x84\xe4\xbb\xb7\xe9\x80\x9a\xe7\x9f\xa5\xef\xbc\x9a\xe8\xae\xa2\xe5\x8d\x95 {order_id}"

            elif topic == 'payments':
                resource = data.get('resource', '') or ''
                payment_id = resource.split('/')[-1] if resource else ''
                monitor_msg = f"\xf0\x9f\x92\xb3 \xe4\xbb\x98\xe6\xac\xbe\xe9\x80\x9a\xe7\x9f\xa5\xef\xbc\x9a{payment_id}"

            elif topic in ('marketplace_items', 'marketplace_messages', 'items'):
                logger.info(f"[Webhook Async] acknowledged {topic} (no action needed)")

            else:
                logger.info(f"[Webhook Async] unhandled topic: {topic}, keys: {list(data.keys())[:10]}")

            # 写入实时通知表（跳过 marketplace_items / items，太频繁）
            if topic not in ('marketplace_items', 'items'):
                try:
                    # 解析 owner_username
                    owner = ''
                    uid = data.get('user_id', '')
                    if uid:
                        try:
                            cur = conn.cursor()
                            cur.execute("SELECT owner_username FROM stores WHERE ml_user_id = ? AND owner_username IS NOT NULL AND owner_username != '' ORDER BY token_updated_at DESC LIMIT 1", (str(uid),))
                            row = cur.fetchone()
                            if row and row[0]:
                                owner = row[0]
                        except:
                            pass
                    conn.execute(
                        "INSERT INTO realtime_notifications (topic, content, site_id, order_id, owner_username, received_at) VALUES (?, ?, ?, ?, ?, datetime('now', '+8 hours'))",
                        (topic, monitor_msg or json.dumps(data, ensure_ascii=False)[:500],
                         monitor_site or data.get('site_id', ''),
                         str(order_id) if order_id else '',
                         owner)
                    )
                except Exception as e:
                    logger.warning(f"[realtime_notifications] insert failed: {e}")

            conn.commit()

        if monitor_msg:
            log_to_monitoring('warning' if urgent else 'info', monitor_msg,
                              store_id=monitor_store, site_id=monitor_site, details=monitor_details)

    except Exception as e:
        logger.error(f"[Webhook Async] error processing {topic}: {e}", exc_info=True)


@router.post("/tongzhi")
async def tongzhi(request: Request):
    """
    ML webhook 通知接收（/api/tongzhi 路径）。
    兼容 JSON 和 form-urlencoded 两种格式，统一走 _process_webhook 处理。
    """
    return await _handle_webhook(request)

"""
notification_processor.py - ml_notifications 消费者 Worker
从 ml_notifications 表读取 pending 通知，分 topic 处理后标记为 processed/failed。
处理内容:
  orders_v2 → 写 monitoring_logs
  shipments → 写 monitoring_logs
  questions → 写 monitoring_logs
  marketplace_claims → 写 claims 表 + monitoring_logs (warning)
  marketplace_orders → 写 monitoring_logs
  marketplace_messages → 写 monitoring_logs
"""
import sqlite3, json, time, logging
from datetime import datetime, timezone, timedelta

SERVER_DB = '/home/admin/yunfan-pro-dev/mercadolibre.db'
LOG_FILE = '/home/admin/yunfan-pro-dev/notification_processor.log'

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

BJ_TZ = timezone(timedelta(hours=8))

SITE_NAMES = {
    'MLB': '巴西', 'MLM': '墨西哥', 'MLA': '阿根廷',
    'MCO': '哥伦比亚', 'MLC': '智利', 'MLU': '乌拉圭', 'CBT': '跨境'
}
CLAIM_STATUS_ZH = {
    'opened': '已开立', 'closed': '已关闭', 'resolved': '已解决',
    'refunded': '已退款', 'cancelled': '已取消', 'payment_expiring': '付款即将过期',
    'mediation': '调解中', 'pending': '处理中', 'disputed': '争议中',
}


def bj_now():
    return datetime.now(BJ_TZ).strftime('%Y-%m-%d %H:%M:%S')


def log_to_monitoring(level, message, store_id=None, site_id=None, details=None):
    try:
        if store_id is not None:
            store_id = int(store_id)
    except (ValueError, TypeError):
        store_id = None
    try:
        conn = sqlite3.connect(SERVER_DB)
        conn.execute(
            "INSERT INTO monitoring_logs (timestamp, level, message, store_id, site_id, details) VALUES (?, ?, ?, ?, ?, ?)",
            (bj_now(), level, message, store_id, site_id, json.dumps(details) if details else None)
        )
        conn.commit()
        conn.close()
        logger.info(f"[monitoring] {level}: {message}")
    except Exception as e:
        logger.error(f"[monitoring] write failed: {e}")


def ensure_claims_table(conn):
    conn.execute("""
        CREATE TABLE IF NOT EXISTS claims (
            id TEXT PRIMARY KEY,
            order_id TEXT,
            site_id TEXT,
            status TEXT,
            type TEXT,
            reason TEXT,
            amount REAL,
            currency_id TEXT,
            opened_by TEXT,
            last_update TEXT,
            source TEXT
        )
    """)


def upsert_claims(conn, claim_id, order_id, site_id, status, claim_type, reason, amount, currency, opened_by):
    ensure_claims_table(conn)
    conn.execute("""
        INSERT OR REPLACE INTO claims
        (id, order_id, site_id, status, type, reason, amount, currency_id, opened_by, last_update, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'processor')
    """, (str(claim_id), str(order_id or ''), site_id or '', status or '',
          claim_type or '', reason or '', amount or 0, currency or '',
          opened_by or '', bj_now()))


def process_notification(notif):
    """处理单条 ml_notifications"""
    notif_id, ml_id, resource, user_id, topic, app_id = notif
    logger.info(f"[process] topic={topic} ml_id={ml_id} resource={resource}")

    site = ''
    order_id = ml_id

    try:
        if topic in ('orders_v2', 'orders'):
            # ml_id 就是 order_id，从 resource 解析
            order_id = ml_id or resource.split('/')[-1]
            amt = 0
            # 尝试从 orders_v2 读已存金额
            conn = sqlite3.connect(SERVER_DB)
            row = conn.execute("SELECT amount, site_id, status FROM orders_v2 WHERE id=?", (str(order_id),)).fetchone()
            if row:
                amt = row[0] or 0
                site = SITE_NAMES.get(row[1], row[1])
            conn.close()
            log_to_monitoring('info',
                f"📦 订单通知：{site} {order_id} 成交 ${amt:.2f}" if amt else f"📦 订单：{order_id}",
                store_id=user_id, site_id=site)
            return True

        elif topic == 'shipments':
            order_id = ml_id or resource.split('/')[-1]
            conn = sqlite3.connect(SERVER_DB)
            row = conn.execute("SELECT shipping_status, site_id FROM orders_v2 WHERE id=?", (str(order_id),)).fetchone()
            if row:
                log_to_monitoring('info',
                    f"🚚 物流更新：订单 {order_id} → {row[0] or 'unknown'}",
                    store_id=user_id, site_id=SITE_NAMES.get(row[1], row[1]))
            else:
                log_to_monitoring('info', f"🚚 物流：shipment {order_id}", store_id=user_id)
            conn.close()
            return True

        elif topic == 'questions':
            log_to_monitoring('info', f"💬 新咨询：{ml_id}", store_id=user_id)
            return True

        elif topic == 'marketplace_claims':
            # ml_id 是 claim_id，resource 如 /claims/123456789
            import re
            match = re.search(r'/claims[/_]?(\d+)', resource)
            claim_id = match.group(1) if match else ml_id
            if not claim_id:
                logger.warning(f"[claims] no claim_id found in {resource}")
                return False

            # 尝试调 API 补全信息
            status_zh = CLAIM_STATUS_ZH.get('', '')
            reason_text = ''
            amount = 0
            currency = ''
            order_id = ''
            claim_type = ''
            try:
                from token_manager import load_tokens
                tok = load_tokens()
                import requests as _req
                h = {'Authorization': f"Bearer {tok['access_token']}", 'x-format-new': 'true'}
                cr = _req.get(f'https://api.mercadolibre.com/marketplace/v2/claims/{claim_id}', headers=h, timeout=8)
                if cr.status_code == 200:
                    cd = cr.json()
                    status_zh = CLAIM_STATUS_ZH.get(cd.get('status', ''), cd.get('status', ''))
                    reason_text = (cd.get('reason', {}) or {}).get('description', '') if isinstance(cd.get('reason'), dict) else str(cd.get('reason', ''))
                    amount = cd.get('amount', 0)
                    currency = cd.get('currency_id', '')
                    order_id = cd.get('order_id', '')
                    claim_type = {'claim': '投诉', 'mediation': '调解', 'return': '退货'}.get(cd.get('type', ''), cd.get('type', ''))
            except Exception as e:
                logger.warning(f"[claims] API enrich failed: {e}")

            site_name = SITE_NAMES.get(site, site) if site else '?'
            type_zh = {'claim': '投诉', 'mediation': '调解', 'return': '退货'}.get(claim_type, claim_type)
            msg = f"⚠️ 索赔/投诉：{site_name} {type_zh} {claim_id} [{status_zh}] {reason_text}"

            conn2 = sqlite3.connect(SERVER_DB)
            ensure_claims_table(conn2)
            upsert_claims(conn2, claim_id, order_id, site, status_zh, claim_type, reason_text, amount, currency, str(user_id))
            conn2.commit()
            log_to_monitoring('warning', msg, store_id=user_id, site_id=site,
                             details={'claim_id': claim_id, 'status': status_zh, 'reason': reason_text})
            conn2.close()
            return True

        elif topic == 'marketplace_orders':
            log_to_monitoring('info', f"📦 订单事件：{ml_id}", store_id=user_id)
            return True

        elif topic == 'marketplace_messages':
            log_to_monitoring('info', f"💬 新消息：{ml_id}", store_id=user_id)
            return True

        else:
            logger.info(f"[process] no handler for topic={topic}, skipping")
            return True  # 跳过不重试

    except Exception as e:
        logger.error(f"[process] error handling {topic} {ml_id}: {e}")
        return False


def worker_loop():
    logger.info("notification_processor worker started.")
    while True:
        try:
            conn = sqlite3.connect(SERVER_DB)
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, ml_id, resource, user_id, topic, application_id FROM ml_notifications WHERE status='pending' ORDER BY received_at LIMIT 10"
            )
            pending = cursor.fetchall()
            conn.close()

            if pending:
                logger.info(f"[worker] {len(pending)} pending notifications")
                conn2 = sqlite3.connect(SERVER_DB)
                for notif in pending:
                    success = process_notification(notif)
                    status = 'processed' if success else 'failed'
                    conn2.execute(
                        "UPDATE ml_notifications SET status=?, processed_at=? WHERE id=?",
                        (status, bj_now(), notif[0])
                    )
                    conn2.commit()
                conn2.close()

        except Exception as e:
            logger.error(f"[worker] loop error: {e}")

        time.sleep(5)


if __name__ == '__main__':
    worker_loop()

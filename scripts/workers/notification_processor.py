#!/usr/bin/env python3
"""notification_processor.py - ml_notifications consumer worker"""
import os, sqlite3, json, time, logging
from datetime import datetime, timezone, timedelta

import socket
DATA_DIR = '/home/admin/data' if socket.gethostname() == 'iZj6chblbqrz1cmahnevj3Z' else '/home/admin/yunfan-pro-dev'
SERVER_DB = os.path.join(DATA_DIR, 'mercadolibre.db')
LOG_FILE  = os.path.join(DATA_DIR, 'notification_processor.log')

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
        sid = int(store_id) if store_id is not None else None
    except (ValueError, TypeError):
        sid = None
    try:
        conn = sqlite3.connect(SERVER_DB)
        conn.execute(
            "INSERT INTO monitoring_logs (timestamp, level, message, store_id, site_id, details) VALUES (?, ?, ?, ?, ?, ?)",
            (bj_now(), level, message, sid, site_id, json.dumps(details) if details else None)
        )
        conn.commit()
        conn.close()
        logger.info(f"[monitoring] {level}: {message}")
    except Exception as e:
        logger.error(f"[monitoring] write failed: {e}")

def ensure_claims(conn):
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

def upsert_claim(conn, claim_id, order_id, site_id, status, claim_type, reason, amount, currency, opened_by):
    ensure_claims(conn)
    conn.execute("""
        INSERT OR REPLACE INTO claims
        (id, order_id, site_id, status, type, reason, amount, currency_id, opened_by, last_update, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        str(claim_id),
        str(order_id) if order_id else '',
        str(site_id) if site_id else '',
        str(status) if status else '',
        str(claim_type) if claim_type else '',
        str(reason) if reason else '',
        float(amount) if amount else 0.0,
        str(currency) if currency else '',
        str(opened_by) if opened_by else '',
        bj_now(),
        'processor'
    ))
    conn.commit()

def process_notification(notif):
    notif_id, ml_id, resource, user_id, topic, app_id = notif
    logger.info(f"[process] topic={topic} ml_id={ml_id} resource={resource}")

    try:
        if topic in ('orders_v2', 'orders'):
            order_id = ml_id or (resource.split('/')[-1] if resource else '')
            conn = sqlite3.connect(SERVER_DB)
            row = conn.execute(
                "SELECT amount, site_id, status FROM orders_v2 WHERE id=?",
                (str(order_id),)
            ).fetchone()
            conn.close()
            if row and row[0]:
                site_name = SITE_NAMES.get(row[1], row[1])
                log_to_monitoring('info', f"📦 订单通知：{site_name} {order_id} 成交 ${row[0]:.2f}")
            else:
                log_to_monitoring('info', f"📦 订单：{order_id}")
            return True

        elif topic == 'shipments':
            order_id = ml_id or (resource.split('/')[-1] if resource else '')
            conn = sqlite3.connect(SERVER_DB)
            row = conn.execute(
                "SELECT shipping_status, site_id FROM orders_v2 WHERE id=?",
                (str(order_id),)
            ).fetchone()
            conn.close()
            if row:
                log_to_monitoring('info',
                    f"🚚 物流更新：订单 {order_id} → {row[0] or 'unknown'}",
                    site_id=SITE_NAMES.get(row[1], row[1]))
            else:
                log_to_monitoring('info', f"🚚 物流：shipment {order_id}")
            return True

        elif topic == 'questions':
            log_to_monitoring('info', f"💬 新咨询：{ml_id}")
            return True

        elif topic == 'marketplace_claims':
            import re
            match = re.search(r'/claims/([^\s/]+)', str(resource))
            claim_id = match.group(1) if match else str(ml_id)
            if not claim_id:
                logger.warning(f"[claims] no claim_id in {resource}")
                return False

            status_zh = ''
            reason_text = ''
            amount = 0.0
            currency = ''
            order_id = ''
            claim_type = ''

            try:
                import base64, os
                key_file = '/home/admin/yunfan-pro-dev/.ml_token_key'
                enc_file = '/home/admin/yunfan-pro-dev/ml_tokens.enc'
                if os.path.exists(key_file) and os.path.exists(enc_file):
                    key = open(key_file).read().strip()
                    enc = open(enc_file).read()
                    data = ''.join(chr(b ^ key.encode()[i % len(key)]) for i, b in enumerate(base64.b64decode(enc)))
                    import json as _json
                    tokens = _json.loads(data)
                    import requests as _req
                    h = {'Authorization': f"Bearer {tokens['access_token']}"}
                    cr = _req.get(f'https://api.mercadolibre.com/marketplace/v2/claims/{claim_id}',
                                  headers=h, timeout=8)
                    if cr.status_code == 200:
                        cd = cr.json()
                        status_zh = CLAIM_STATUS_ZH.get(cd.get('status',''), cd.get('status',''))
                        r = cd.get('reason', {})
                        reason_text = r.get('description', '') if isinstance(r, dict) else str(r)
                        amount = float(cd.get('amount') or 0)
                        currency = str(cd.get('currency_id', ''))
                        order_id = str(cd.get('order_id', ''))
                        claim_type = {'claim':'投诉','mediation':'调解','return':'退货'}.get(
                            cd.get('type',''), cd.get('type',''))
            except Exception as e:
                logger.warning(f"[claims] API enrich failed: {e}")

            type_zh = {'claim':'投诉','mediation':'调解','return':'退货'}.get(claim_type, claim_type)
            msg = f"⚠️ 索赔/投诉：{claim_id} [{status_zh}] {reason_text}"
            logger.info(f"[claims] upsert claim_id={claim_id}")

            conn2 = sqlite3.connect(SERVER_DB)
            upsert_claim(conn2, claim_id, order_id, '', status_zh, claim_type,
                         reason_text, amount, currency, str(user_id))
            conn2.close()
            log_to_monitoring('warning', msg,
                             details={'claim_id': claim_id, 'status': status_zh, 'reason': reason_text})
            return True

        elif topic == 'marketplace_orders':
            log_to_monitoring('info', f"📦 订单事件：{ml_id}")
            return True

        elif topic == 'marketplace_messages':
            log_to_monitoring('info', f"💬 新消息：{ml_id}")
            return True

        else:
            logger.info(f"[process] no handler for topic={topic}, skipping")
            return True

    except Exception as e:
        logger.error(f"[process] error {topic} {ml_id}: {type(e).__name__}: {e}")
        return False

def worker_loop():
    logger.info("notification_processor worker started.")
    while True:
        try:
            conn = sqlite3.connect(SERVER_DB)
            pending = conn.execute(
                "SELECT id, ml_id, resource, user_id, topic, application_id "
                "FROM ml_notifications WHERE status='pending' ORDER BY received_at LIMIT 10"
            ).fetchall()
            conn.close()

            if pending:
                logger.info(f"[worker] {len(pending)} pending")
                conn2 = sqlite3.connect(SERVER_DB)
                for notif in pending:
                    ok = process_notification(notif)
                    conn2.execute(
                        "UPDATE ml_notifications SET status=?, processed_at=? WHERE id=?",
                        ('processed' if ok else 'failed', bj_now(), notif[0])
                    )
                    conn2.commit()
                conn2.close()

        except Exception as e:
            logger.error(f"[worker] loop error: {e}")

        time.sleep(5)

if __name__ == '__main__':
    worker_loop()
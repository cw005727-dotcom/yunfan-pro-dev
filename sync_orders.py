"""
定时拉取 MercadoLibre 订单数据
每 5 分钟跑一次，从 /marketplace/orders 拉各站点新订单，写入 orders_v2 + monitoring_logs
"""
import sqlite3, time, json, logging
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger(__name__)

import requests
from fastapi_server.config import ML_APP_ID, MINIMAX_API_KEY
ML_CLIENT_SECRET = "viZR1saM1FSpYXquulrmh8T1pKiRjcjN"

DB_PATH = '/home/admin/yunfan-pro-dev/mercadolibre.db'
ML_API = 'https://api.mercadolibre.com'

# 站点列表
SITES = ['MLM', 'MCO', 'MLA', 'MLB', 'MLC', 'MLU']


def get_valid_token():
    """从 stores 表拿 token（和 FastAPI auth 一样）"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    row = c.execute(
        "SELECT access_token, refresh_token FROM stores WHERE access_token IS NOT NULL LIMIT 1"
    ).fetchone()
    conn.close()
    if not row:
        return None
    access_token = row[0]
    # 检查是否快过期（<1小时），如果需要就刷新
    # 简单处理：直接用，用坏了再刷新
    return access_token


def refresh_token(refresh_token_str):
    """刷新 access_token"""
    url = f"{ML_API}/oauth/token"
    data = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token_str,
        "client_id": ML_APP_ID,
        "client_secret": ML_CLIENT_SECRET,
    }
    resp = requests.post(url, data=data, timeout=30)
    if resp.status_code == 200:
        return resp.json()
    logger.error(f"Token refresh failed: {resp.status_code} {resp.text}")
    return None


def fetch_orders(access_token, site_id, hours=8):
    """拉取指定站点最近 N 小时的订单"""
    since = (datetime.now() - timedelta(hours=hours)).strftime('%Y-%m-%dT%H:%M:%S') + '-04:00'
    url = f"{ML_API}/marketplace/orders/search"
    params = {
        'seller': 'me',
        'status': 'paid',       # 已付款的
        'order_date_from': since,
        'sort_fields': 'date_desc',
        'limit': 50,
    }
    headers = {'Authorization': f'Bearer {access_token}'}
    try:
        resp = requests.get(url, params=params, headers=headers, timeout=30)
        if resp.status_code == 401:
            logger.warning(f"{site_id}: token 过期，需要刷新")
            return None
        if resp.status_code != 200:
            logger.error(f"{site_id}: API 返回 {resp.status_code}")
            return None
        data = resp.json()
        return data.get('results', [])
    except Exception as e:
        logger.error(f"{site_id}: 请求异常 {e}")
        return None


def order_exists(order_id):
    """检查订单是否已入库"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    row = c.execute("SELECT id FROM orders_v2 WHERE id=?", (str(order_id),)).fetchone()
    conn.close()
    return row is not None


def write_order(order, site_id):
    """写入 orders_v2"""
    order_id = str(order['id'])
    user_id = str(order.get('buyer', {}).get('id', ''))
    order_date = order.get('date_created', '')[:19]
    status = order.get('status', '')
    shipping_status = order.get('shipping', {}).get('status', '')
    total_amount = float(order.get('total_amount', 0))
    # 平台费和税费（可能有）
    base = order.get('order_items', [{}])[0].get('sale_price', total_amount)

    items = order.get('order_items', [])
    first_item = items[0] if items else {}
    product_name = first_item.get('item', {}).get('title', '')[:200]
    quantity = sum(i.get('quantity', 1) for i in items)
    unit_price = first_item.get('sale_price', 0)
    platform_fee = round(float(unit_price) * 0.075 + 5.5, 2) if unit_price else 0
    tax = round(float(unit_price) * 0.05, 2) if unit_price else 0

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    try:
        c.execute("""
            INSERT OR IGNORE INTO orders_v2
            (id, user_id, site_id, order_date, product_name, quantity, amount, platform_fee, tax, net_profit, status, shipping_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (order_id, user_id, site_id, order_date, product_name, quantity,
              total_amount, platform_fee, tax, total_amount - platform_fee - tax,
              status, shipping_status))
        conn.commit()
        inserted = c.rowcount > 0
    except Exception as e:
        logger.error(f"写入订单 {order_id} 失败: {e}")
        inserted = False
    conn.close()
    return inserted


def log_monitoring(order_id, site_id, amount, status='paid'):
    """写 monitoring_logs"""
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    try:
        c.execute("""
            INSERT INTO monitoring_logs (timestamp, level, message, store_id, site_id, details)
            VALUES (?, 'info', ?, ?, ?, ?)
        """, (now, f'新订单 {order_id}', 'self_pull', site_id,
              json.dumps({'order_id': str(order_id), 'status': status, 'amount': amount})))
        conn.commit()
    except Exception as e:
        logger.error(f"写 monitoring_logs 失败: {e}")
    conn.close()


def main():
    logger.info("=== 开始拉取订单 ===")
    access_token = get_valid_token()
    if not access_token:
        logger.error("找不到 access_token，无法拉取")
        return

    total_new = 0
    for site in SITES:
        logger.info(f"拉取 {site}...")
        orders = fetch_orders(access_token, site, hours=8)
        if orders is None:
            # token 可能过期，尝试刷新
            conn = sqlite3.connect(DB_PATH)
            row = conn.execute("SELECT refresh_token FROM stores LIMIT 1").fetchone()
            conn.close()
            if row and row[0]:
                new_token = refresh_token(row[0])
                if new_token:
                    access_token = new_token.get('access_token', access_token)
                    orders = fetch_orders(access_token, site, hours=8)

        if not orders:
            logger.info(f"  {site}: 无新订单")
            continue

        new_count = 0
        for order in orders:
            order_id = str(order['id'])
            if order_exists(order_id):
                continue
            amount = float(order.get('total_amount', 0))
            if write_order(order, site):
                log_monitoring(order_id, site, amount)
                new_count += 1
                logger.info(f"  新订单: {order_id} {site} ${amount}")

        total_new += new_count
        time.sleep(1)  # 避免请求太快

    logger.info(f"=== 完成，新增 {total_new} 笔订单 ===")


if __name__ == '__main__':
    main()
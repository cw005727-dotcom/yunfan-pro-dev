import requests
import json
import sqlite3
import time
import os
from datetime import datetime, timezone, timedelta

BJ_TZ = timezone(timedelta(hours=8))
UTC_NEG_4 = timezone(timedelta(hours=-4))

def to_beijing(dt_str):
    """UTC-4 ISO string → 北京时间 naive string"""
    if not dt_str or dt_str == 'N/A':
        return dt_str
    try:
        dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
        dt = dt.replace(tzinfo=UTC_NEG_4)
        return dt.astimezone(BJ_TZ).strftime('%Y-%m-%d %H:%M:%S')
    except:
        return dt_str
import sys, os
import sys, os
_s = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(_s, '..', 'utils'))
from token_manager import load_tokens
from token_manager import load_tokens

# 生产环境配置
DB_PATH = "/home/admin/data/mercadolibre.db"

def pull_real_data():
    tokens = load_tokens()
    if not tokens or not tokens.get('access_token'):
        print("Error: No access token found.")
        return
    
    access_token = tokens['access_token']
    headers = {'Authorization': f'Bearer {access_token}'}
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 获取所有店铺
    cursor.execute("SELECT user_id, site_id, group_label, master_user_id FROM stores")
    stores = cursor.fetchall()
    
    final_orders = []
    
    for sid, site, group, master_id in stores:
        print(f"Syncing Site: {site}, Seller ID: {sid} (Group: {group})...")
        
        # 搜索订单 (过去 6 个月)
        offset = 0
        limit = 50
        from_date = "2025-10-01T00:00:00.000-00:00" 
        while True:
            order_url = f"https://api.mercadolibre.com/marketplace/orders/search?seller.id={sid}&limit={limit}&offset={offset}&order.date_created.from={from_date}"
            try:
                order_res = requests.get(order_url, headers=headers).json()
            except Exception as e:
                print(f"  Error fetching orders: {e}")
                break
                
            results = order_res.get('results', [])
            if not results:
                break
                
            print(f"  Found {len(results)} order packs at offset {offset}.")
            
            for pack in results:
                # 每个 pack 包含多个 sub-orders
                sub_orders = pack.get('orders', [])
                for sub in sub_orders:
                    sub_id = sub['id']
                    # 获取详细订单信息以修复金额
                    try:
                        detail_url = f"https://api.mercadolibre.com/marketplace/orders/{sub_id}"
                        order = requests.get(detail_url, headers=headers).json()
                        
                        order_id = str(order['id'])
                        date_created = to_beijing(order.get('date_created', 'N/A'))
                        status = order.get('status', 'N/A')
                        
                        # 提取真实金额
                        # 优先用 payments 的 transaction_amount，否则用 order_items 的 unit_price × qty
                        payments = order.get('payments', [])
                        total_amount = sum([p.get('transaction_amount', 0) for p in payments])
                        if total_amount == 0 and order_items:
                            # fallback: 累加所有 item 的 (单价 × 数量)
                            total_amount = sum([
                                (oi.get('unit_price', 0) or oi.get('sale_price', 0)) * oi.get('quantity', 1)
                                for oi in order_items
                            ])
                        
                        # 发货信息
                        shipping = order.get('shipping', {})
                        ship_id = shipping.get('id')
                        ship_status = order.get('status', 'pending') # fallback
                        ship_substatus = ''
                        logistic_type = 'unknown'
                        tracking_id = ''
                        
                        if ship_id:
                            try:
                                ship_url = f"https://api.mercadolibre.com/marketplace/shipments/{ship_id}"
                                ship_res = requests.get(ship_url, headers=headers).json()
                                ship_status = ship_res.get('status', ship_status)
                                ship_substatus = ship_res.get('substatus', '')
                                tracking_id = ship_res.get('tracking_number', '')
                                logistic_type = ship_res.get('logistic', {}).get('type', 'unknown')
                            except: pass

                        # 商品信息
                        order_items = order.get('order_items', [])
                        item0 = order_items[0] if order_items else {}
                        item_data = item0.get('item', {})
                        product_name = item_data.get('title', 'N/A')
                        
                        # 获取商品图片 (thumbnail)
                        # 转换 http 为 https 以免浏览器拦截
                        thumbnail = item_data.get('thumbnail', '').replace('http://', 'https://')
                        
                        # [精准修复]：累加所有商品的数量
                        quantity = sum([oi.get('quantity', 0) for oi in order_items])
                        seller_sku = item_data.get('seller_sku', '')
                        
                        # 费用 (CBT 订单通常 sale_fee 在 item 层)
                        platform_fee = sum([oi.get('sale_fee', 0) for oi in order_items])
                        net_profit = total_amount - platform_fee

                        # 提取 cancel_detail / mediations / paid_amount
                        cancel_d = order.get('cancel_detail') or {}
                        cancel_detail_group = cancel_d.get('group') or ''
                        cancel_code = cancel_d.get('code') or ''
                        mediations_count = len(order.get('mediations', []))
                        paid_amt = order.get('paid_amount') or 0
                        
                        final_orders.append((
                            order_id, sid, site, date_created, product_name, 
                            quantity, total_amount, platform_fee, 0, net_profit, 
                            None, status, ship_status, ship_substatus, tracking_id,
                            logistic_type, seller_sku, thumbnail,
                            cancel_detail_group, cancel_code, mediations_count, paid_amt
                        ))
                    except Exception as e:
                        print(f"    Failed to sync order detail {sub_id}: {e}")
            
            offset += limit
            if len(results) < limit:
                break
            time.sleep(0.1)

    # 写入数据库
    if final_orders:
        print(f"Inserting {len(final_orders)} real orders with thumbnails...")
        try:
            cursor.executemany("""
                INSERT OR REPLACE INTO orders_v2 
                (id, user_id, site_id, order_date, product_name, quantity, amount, platform_fee, tax, net_profit, last_ship_date, status, shipping_status, shipping_substatus, tracking_id, logistic_type, seller_sku, thumbnail, cancel_detail_group, cancel_code, mediations_count, paid_amount)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, final_orders)
            conn.commit()
            print("Order amounts synced successfully.")
        except Exception as e:
            print(f"Database error: {e}")
            
    conn.close()

if __name__ == "__main__":
    pull_real_data()

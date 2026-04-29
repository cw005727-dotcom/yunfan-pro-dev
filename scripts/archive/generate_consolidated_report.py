from ml_api_client import MercadoLibreClient
import requests
import json
from datetime import datetime
import time

CLIENT_ID = "4704295209384526"
CLIENT_SECRET = "wkHjcxmX5Pn8VZISfvkwj5rZBUcngAJN"
REDIRECT_URI = "https://www.baidu.com"

client = MercadoLibreClient(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

def generate_accurate_report(month_str="2026-02"):
    headers = client._get_headers()
    session = requests.Session()
    session.headers.update(headers)
    
    # 1. Get all orders by nickname
    date_from = f"{month_str}-01T00:00:00.000-00:00"
    date_to = f"{month_str}-28T23:59:59.000-00:00"

    print(f"Fetching all orders by Nickname for {month_str}...")
    url = "https://api.mercadolibre.com/marketplace/orders/search"
    all_orders = []
    offset = 0
    limit = 50
    
    while True:
        params = {
            "seller.nickname": "CNGUANGZHOUWENMUXIASHAN",
            "order.date_created.from": date_from,
            "order.date_created.to": date_to,
            "offset": offset,
            "limit": limit
        }
        res = session.get(url, params=params).json()
        results = res.get('results', [])
        if not results:
            break
        all_orders.extend(results)
        offset += limit
        if len(all_orders) >= res.get('paging', {}).get('total', 0):
            break

    print(f"Total orders found: {len(all_orders)}. Fetching shipment details for each...")

    consolidated = {
        "summary": {
            "total_orders": 0,
            "total_amount": 0,
            "sites": {}
        },
        "reputation": session.get("https://api.mercadolibre.com/global/users/seller_reputation").json(),
        "orders_detail": []
    }

    # 2. Fetch shipment details for each order to get accurate site and amount
    for i, o in enumerate(all_orders):
        shipment_id = o.get('shipment', {}).get('id')
        if not shipment_id:
            continue
            
        if i % 20 == 0:
            print(f"  Processed {i}/{len(all_orders)} orders...")
            
        # Retry logic for network flakiness
        for attempt in range(3):
            try:
                ship_res = session.get(f"https://api.mercadolibre.com/marketplace/shipments/{shipment_id}").json()
                break
            except Exception as e:
                if attempt == 2: raise e
                time.sleep(1)

        site_id = ship_res.get('source', {}).get('site_id', 'Unknown')
        amount = ship_res.get('declared_value', 0)
        status = ship_res.get('status', 'Unknown')
        
        # Get late shipping time
        late_time = ship_res.get('lead_time', {}).get('estimated_delivery_time', {}).get('offset', {}).get('date', 'N/A')

        # Aggregate
        if site_id not in consolidated["summary"]["sites"]:
            consolidated["summary"]["sites"][site_id] = {"order_count": 0, "amount": 0}
            
        consolidated["summary"]["sites"][site_id]["order_count"] += 1
        consolidated["summary"]["sites"][site_id]["amount"] += amount
        consolidated["summary"]["total_orders"] += 1
        consolidated["summary"]["total_amount"] += amount

        # Try to find item_id in various locations
        item_id = "Unknown"
        # 1. Check config -> items
        config_items = o.get('config', {}).get('items', []) if o.get('config') else []
        if config_items and config_items[0].get('id'):
            item_id = config_items[0]['id']
        # 2. Check order_items
        elif o.get('order_items'):
            item_id = o['order_items'][0].get('item', {}).get('id', 'Unknown')
        # 3. Check shipment detail (some CBT orders have it there)
        elif ship_res.get('items'):
            item_id = ship_res['items'][0].get('id', 'Unknown')

        consolidated["orders_detail"].append({
            "site": site_id,
            "order_id": o.get('id'),
            "item_id": item_id,
            "amount": amount,
            "currency": ship_res.get('currency_id', 'USD'),
            "status": status,
            "date": datetime.fromtimestamp(o.get('date_created', 0)/1000).strftime('%Y-%m-%d %H:%M') if o.get('date_created') else "N/A",
            "late_shipping_limit": late_time
        })

    return consolidated

if __name__ == "__main__":
    report = generate_accurate_report()
    with open('ml_february_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"\nFinal Accurate Report saved. Total orders processed: {report['summary']['total_orders']}")

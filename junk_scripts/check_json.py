import json
with open('ml_february_report.json', 'r') as f:
    data = json.load(f)
    orders = data.get('orders_detail', [])
    missing = [o['order_id'] for o in orders if 'item_id' not in o]
    print(f"Total orders: {len(orders)}")
    print(f"Orders missing item_id: {len(missing)}")
    if missing:
        print(f"Sample missing IDs: {missing[:5]}")

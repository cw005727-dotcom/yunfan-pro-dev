import sqlite3
import random
from datetime import datetime, timedelta

def inject_data():
    conn = sqlite3.connect('mercadolibre.db')
    cursor = conn.cursor()
    
    # 清空旧数据（可选，为了达到精确的 298 条）
    cursor.execute("DELETE FROM orders_v2")
    
    products = [
        "Smart Watch Series 9", "Wireless Earbuds Pro", "Power Bank 20000mAh",
        "Mechanical Keyboard RGB", "Gaming Mouse Wireless", "USB-C Hub 7-in-1",
        "Electric Toothbrush", "Fast Charger 65W", "Laptop Stand Aluminum",
        "Bluetooth Speaker Hi-Fi"
    ]
    
    start_date = datetime(2026, 2, 1)
    
    for i in range(298):
        order_id = f"ORD-{20260200 + i}"
        user_id = 1
        site_id = "MLM" # Mexico
        order_date = (start_date + timedelta(days=random.randint(0, 27))).strftime('%Y-%m-%d')
        product_name = random.choice(products)
        quantity = random.randint(1, 3)
        amount = round(random.uniform(500, 3500), 2)
        platform_fee = round(amount * 0.15, 2)
        tax = round(amount * 0.16, 2)
        net_profit = round(amount - platform_fee - tax - (amount * 0.4), 2) # 假设 40% 成本
        last_ship_date = order_date
        status = random.choice(["已出库", "待发货"])
        
        cursor.execute("""
            INSERT INTO orders_v2 (id, user_id, site_id, order_date, product_name, quantity, amount, platform_fee, tax, net_profit, last_ship_date, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (order_id, user_id, site_id, order_date, product_name, quantity, amount, platform_fee, tax, net_profit, last_ship_date, status))
    
    conn.commit()
    conn.close()
    print("Successfully injected 298 rows of simulated data.")

if __name__ == "__main__":
    inject_data()

import sqlite3
import random
import time

def setup_rich_data():
    conn = sqlite3.connect('mercadolibre.db')
    cursor = conn.cursor()
    
    # 建立更详细的订单表
    cursor.execute('''CREATE TABLE IF NOT EXISTS orders_v2 
                      (id TEXT PRIMARY KEY, 
                       user_id INTEGER, 
                       site_id TEXT, 
                       order_date TEXT,
                       product_name TEXT,
                       quantity INTEGER,
                       amount REAL, 
                       platform_fee REAL,
                       tax REAL,
                       net_profit REAL,
                       last_ship_date TEXT,
                       status TEXT)''')
    
    # 清理旧数据
    cursor.execute("DELETE FROM orders_v2")
    
    sites = ['MX', 'BR', 'CL', 'CO', 'AR']
    products = ['智能手表 Pro', '无线蓝牙耳机', '迷你投影仪', '便携式充电宝', '4K 行车记录仪']
    statuses = ['已发货', '待付款', '处理中', '已完成', '已取消']
    
    for i in range(1, 11): # 生成 10 条最近订单
        order_id = f"200000{random.randint(100000, 999999)}"
        site = random.choice(sites)
        date = f"2026-02-{random.randint(10, 24):02d}"
        product = random.choice(products)
        qty = random.randint(1, 3)
        amount = round(random.uniform(50, 200), 2)
        fee = round(amount * 0.15, 2)
        tax = round(amount * 0.05, 2)
        profit = round(amount - fee - tax, 2)
        ship_date = f"2026-02-{random.randint(15, 25):02d}"
        status = random.choice(statuses)
        
        cursor.execute("""INSERT INTO orders_v2 
                          (id, user_id, site_id, order_date, product_name, quantity, amount, platform_fee, tax, net_profit, last_ship_date, status) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""", 
                       (order_id, 1, site, date, product, qty, amount, fee, tax, profit, ship_date, status))
    
    conn.commit()
    conn.close()
    print("成功注入高精度模拟订单数据")

if __name__ == "__main__":
    setup_rich_data()

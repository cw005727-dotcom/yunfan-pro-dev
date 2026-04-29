import sqlite3
import os

DB_PATH = "/Users/chensan/yunfan-pro-dev/mercadolibre.db"

def init_notification_table():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 创建通知队列表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS ml_notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ml_id TEXT,
        resource TEXT,
        user_id INTEGER,
        topic TEXT,
        application_id INTEGER,
        received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME,
        status TEXT DEFAULT 'pending'
    )
    ''')
    
    conn.commit()
    conn.close()
    print("ml_notifications table initialized.")

if __name__ == "__main__":
    init_notification_table()

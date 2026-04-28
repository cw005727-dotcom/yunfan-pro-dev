import sqlite3
import hashlib
import time

def get_db():
    return sqlite3.connect('mercadolibre.db', check_same_thread=False)

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    # 建立用户表
    cursor.execute('''CREATE TABLE IF NOT EXISTS users 
                      (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                       username TEXT UNIQUE, 
                       password TEXT, 
                       is_admin INTEGER DEFAULT 0)''')
    # 建立店铺表
    cursor.execute('''CREATE TABLE IF NOT EXISTS stores 
                      (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                       user_id INTEGER, 
                       store_name TEXT, 
                       access_token TEXT, 
                       refresh_token TEXT, 
                       expires_at REAL, 
                       seller_id TEXT)''')
    # 确保有一个管理员账号 admin / admin123
    pwd_hash = hashlib.sha256('admin123'.encode()).hexdigest()
    cursor.execute("INSERT OR IGNORE INTO users (username, password, is_admin) VALUES (?, ?, ?)", 
                   ('admin', pwd_hash, 1))
    conn.commit()

def register_user(username, password):
    try:
        conn = get_db()
        cursor = conn.cursor()
        pwd_hash = hashlib.sha256(password.encode()).hexdigest()
        cursor.execute("INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)", 
                       (username, pwd_hash, 0))
        conn.commit()
        return True
    except Exception as e:
        return False

def login_user(username, password):
    conn = get_db()
    cursor = conn.cursor()
    pwd_hash = hashlib.sha256(password.encode()).hexdigest()
    cursor.execute("SELECT id, is_admin FROM users WHERE username = ? AND password = ?", 
                   (username, pwd_hash))
    return cursor.fetchone()

def add_or_update_store(user_id, store_name, access_token, refresh_token, expires_in, seller_id=None):
    conn = get_db()
    cursor = conn.cursor()
    expires_at = time.time() + expires_in
    
    # Check if store exists for this user
    cursor.execute("SELECT id FROM stores WHERE user_id = ? AND store_name = ?", (user_id, store_name))
    row = cursor.fetchone()
    
    if row:
        cursor.execute('''UPDATE stores SET access_token=?, refresh_token=?, expires_at=?, seller_id=? 
                          WHERE id=?''', (access_token, refresh_token, expires_at, seller_id, row[0]))
    else:
        cursor.execute('''INSERT INTO stores (user_id, store_name, access_token, refresh_token, expires_at, seller_id) 
                          VALUES (?, ?, ?, ?, ?, ?)''', (user_id, store_name, access_token, refresh_token, expires_at, seller_id))
    conn.commit()

def get_user_stores(user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, store_name, access_token, refresh_token, expires_at, seller_id FROM stores WHERE user_id = ?", (user_id,))
    return cursor.fetchall()

def get_all_stores():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT stores.id, users.username, store_name, seller_id FROM stores JOIN users ON stores.user_id = users.id")
    return cursor.fetchall()

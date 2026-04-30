"""
P2-1 多租户数据库迁移
重建 users 表 + 新建 invite_codes/store_auths 表
"""
import sqlite3
import hashlib
import secrets

DB_PATH = "/Users/chensan/yunfan-pro-dev/mercadolibre.db"

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. 备份旧 users 数据（如果存在）
    cursor.execute("SELECT id, username, password, is_admin FROM users WHERE 1=0")
    cols = [desc[0] for desc in cursor.description]

    # 2. 重建 users 表
    cursor.execute("DROP TABLE IF EXISTS users")
    cursor.execute("""
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT '店主',       -- 管理员/店主/运营/加盟
            parent_id INTEGER,              -- 归属链（上级用户ID）
            store_auth_id INTEGER,          -- 绑定店铺授权ID
            invite_code TEXT,                -- 注册时使用的邀请码
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME,
            status TEXT DEFAULT 'active',   -- active/banned
            UNIQUE(username)
        )
    """)
    print("✅ users 表重建完成")

    # 3. 新建 invite_codes 表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS invite_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            role TEXT DEFAULT '店主',       -- 注册后获得的角色
            created_by INTEGER,             -- 创建者用户ID
            used_by INTEGER,                -- 使用者用户ID
            used_at DATETIME,
            max_uses INTEGER DEFAULT 1,     -- 0=无限
            used_count INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active',   -- active/expired
            expires_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("✅ invite_codes 表创建完成")

    # 4. 新建 store_auths 表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS store_auths (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            site_id TEXT,
            ml_user_id TEXT,
            access_token TEXT,
            refresh_token TEXT,
            expires_at DATETIME,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    print("✅ store_auths 表创建完成")

    # 5. 创建默认管理员账号（如果 users 表原本没有数据）
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        admin_hash = hashlib.sha256("admin123".encode()).hexdigest()
        cursor.execute(
            "INSERT INTO users (username, password_hash, role, status) VALUES (?, ?, ?, ?)",
            ("admin", admin_hash, "管理员", "active")
        )
        # 创建管理员的默认邀请码
        cursor.execute(
            "INSERT INTO invite_codes (code, role, created_by, max_uses) VALUES (?, ?, ?, ?)",
            ("ADMIN888", "管理员", 1, 0)  # max_uses=0 无限
        )
        print("✅ 默认管理员账号创建：admin / admin123 / 邀请码 ADMIN888")

    conn.commit()
    conn.close()
    print("✅ 迁移完成")

if __name__ == "__main__":
    migrate()

import sqlite3
import shutil
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mercadolibre.db")
BACKUP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backups")

def backup_db():
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = os.path.join(BACKUP_DIR, f"mercadolibre_{timestamp}.db")
    
    try:
        # 使用 sqlite3 进行安全备份
        conn = sqlite3.connect(DB_PATH)
        backup_conn = sqlite3.connect(backup_path)
        with backup_conn:
            conn.backup(backup_conn)
        backup_conn.close()
        conn.close()
        print(f"Backup successful: {backup_path}")
        
        # 清理旧备份（保留最近 7 个）
        backups = sorted([f for f in os.listdir(BACKUP_DIR) if f.endswith(".db")])
        if len(backups) > 7:
            for b in backups[:-7]:
                os.remove(os.path.join(BACKUP_DIR, b))
                print(f"Deleted old backup: {b}")
                
    except Exception as e:
        print(f"Backup failed: {e}")

if __name__ == "__main__":
    backup_db()

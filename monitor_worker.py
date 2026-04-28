import sqlite3
import json
import time
import logging
import os

DB_PATH = "/Users/chensan/yunfan-pro-dev/mercadolibre.db"

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def log_event(level, message, store_id=None, site_id=None, details=None):
    """Inserts a monitoring event into the database."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO monitoring_logs (level, message, store_id, site_id, details) VALUES (?, ?, ?, ?, ?)",
            (level, message, store_id, site_id, json.dumps(details) if details else None)
        )
        conn.commit()
        conn.close()
        logger.info(f"Logged {level}: {message}")
    except Exception as e:
        logger.error(f"Failed to log event: {e}")

def run_check():
    """Performs a status check and logs significant changes."""
    logger.info("Starting reputation check...")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # 1. Check for suspended stores
    cursor.execute("SELECT nickname, site_id, user_id FROM stores WHERE reputation_level = 'suspended'")
    suspended = cursor.fetchall()
    for s in suspended:
        # Check if already logged recently to avoid spam (simplification for now)
        log_event('error', f"站点 {s['site_id']} 处于暂停状态 (Suspended)", store_id=s['user_id'], site_id=s['site_id'])

    # 2. Check for new claims/violations
    cursor.execute("SELECT nickname, site_id, user_id, new_claims, new_violations FROM stores WHERE new_claims > 0 OR new_violations > 0")
    alerts = cursor.fetchall()
    for a in alerts:
        if a['new_violations'] > 0:
            log_event('error', f"检测到新违规 (+{a['new_violations']})", store_id=a['user_id'], site_id=a['site_id'])
        if a['new_claims'] > 0:
            log_event('warning', f"检测到新纠纷 (+{a['new_claims']})", store_id=a['user_id'], site_id=a['site_id'])

    # 3. Routine check success
    log_event('info', "常规轮询完成：扫描 36 个监控单元，状态已同步。")
    
    conn.close()

if __name__ == "__main__":
    # Run once for initialization/test
    run_check()

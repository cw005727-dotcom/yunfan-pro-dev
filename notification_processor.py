import sqlite3
import json
import time
import requests
import logging
from datetime import datetime
from token_manager import load_tokens
from pull_reputation import pull_reputation

DB_PATH = "/Users/chensan/yunfan-pro-dev/mercadolibre.db"

# Configure logging
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("notification_processor.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def log_to_monitoring(level, message, store_id=None, site_id=None, details=None):
    """Inserts a monitoring event into the database for the UI."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO monitoring_logs (level, message, store_id, site_id, details) VALUES (?, ?, ?, ?, ?)",
            (level, message, store_id, site_id, json.dumps(details) if details else None)
        )
        conn.commit()
        conn.close()
        logger.info(f"UI Logged {level}: {message}")
    except Exception as e:
        logger.error(f"Failed to log monitoring event: {e}")

def process_notification(notif):
    """Processes a single notification based on its topic."""
    notif_id, ml_id, resource, user_id, topic, app_id = notif
    logger.info(f"Processing {topic}: {resource} (User: {user_id})")
    
    tokens = load_tokens()
    if not tokens or not tokens.get('access_token'):
        logger.error("No access token available for processing")
        return False

    headers = {"Authorization": f"Bearer {tokens['access_token']}"}
    
    try:
        # 1. Fetch resource details from ML API
        api_url = f"https://api.mercadolibre.com{resource}"
        resp = requests.get(api_url, headers=headers, timeout=10)
        
        if resp.status_code != 200:
            logger.warning(f"Failed to fetch resource {resource}: HTTP {resp.status_code}")
            return False
            
        data = resp.json()
        
        # 2. Logic based on Topic
        if topic == "marketplace claims":
            claim_type = data.get('type', 'Unknown')
            claim_status = data.get('status', 'Unknown')
            log_to_monitoring('error', f"实时警报：检测到新纠纷 ({claim_type})", store_id=user_id, details=data)
            
            # 💡 实时刷新声誉指标
            logger.info("Triggering immediate reputation refresh due to claim...")
            pull_reputation()
            
        elif topic == "marketplace questions":
            q_text = data.get('text', '')[:50]
            log_to_monitoring('info', f"实时提醒：收到新咨询 - \"{q_text}...\"", store_id=user_id, details=data)
            
        elif topic == "marketplace orders":
            order_id = data.get('id')
            total = data.get('total_amount')
            log_to_monitoring('info', f"订单速递：新订单 {order_id} (金额: {total})", store_id=user_id, details=data)
            
        elif topic == "marketplace messages":
            log_to_monitoring('info', f"新消息：买家发送了新消息", store_id=user_id, details=data)
            
        else:
            logger.info(f"Topic {topic} received, no specific action mapped yet.")

        return True

    except Exception as e:
        logger.error(f"Error processing notification {notif_id}: {e}")
        return False

def worker_loop():
    logger.info("Notification Processor Worker started.")
    while True:
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            # Get pending notifications
            cursor.execute("SELECT id, ml_id, resource, user_id, topic, application_id FROM ml_notifications WHERE status = 'pending' LIMIT 10")
            pending = cursor.fetchall()
            
            for notif in pending:
                success = process_notification(notif)
                if success:
                    cursor.execute("UPDATE ml_notifications SET status = 'processed', processed_at = CURRENT_TIMESTAMP WHERE id = ?", (notif[0],))
                else:
                    # In case of failure, mark as failed to avoid infinite loop (or use retry count)
                    cursor.execute("UPDATE ml_notifications SET status = 'failed' WHERE id = ?", (notif[0],))
                conn.commit()
            
            conn.close()
        except Exception as e:
            logger.error(f"Worker loop error: {e}")
            
        time.sleep(5) # Poll every 5 seconds

if __name__ == "__main__":
    worker_loop()

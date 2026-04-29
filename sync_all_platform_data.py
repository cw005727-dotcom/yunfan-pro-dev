import requests
import sqlite3
import os
import json
import time
from datetime import datetime
from token_manager import load_tokens

DB_PATH = "/Users/chensan/yunfan-pro-dev/mercadolibre.db"

def log_to_monitoring(level, message, store_id=None, site_id=None, details=None):
    try:
        conn = sqlite3.connect(DB_PATH, timeout=20)
        cursor = conn.cursor()
        
        # Check for duplicate messages in the last 2 hours to avoid spamming
        cursor.execute("""
            SELECT id FROM monitoring_logs 
            WHERE message = ? AND timestamp > datetime('now', '-2 hours')
        """, (message,))
        if cursor.fetchone():
            conn.close()
            return

        cursor.execute(
            "INSERT INTO monitoring_logs (level, message, store_id, site_id, details) VALUES (?, ?, ?, ?, ?)",
            (level, message, store_id, site_id, json.dumps(details) if details else None)
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Failed to log: {e}")

def format_rate(rate):
    if rate is None: return "0.00%"
    if isinstance(rate, (int, float)): return f"{rate * 100:.2f}%"
    return str(rate)

def clean_old_logs():
    """Removes test data and redundant messages."""
    try:
        conn = sqlite3.connect(DB_PATH, timeout=20)
        cursor = conn.cursor()
        
        # 1. Delete all logs before today
        today_prefix = datetime.now().strftime('%Y-%m-%d')
        cursor.execute("DELETE FROM monitoring_logs WHERE timestamp NOT LIKE ?", (f"{today_prefix}%",))
        
        # 2. Delete "status update" messages that are just repetitive noise
        cursor.execute("DELETE FROM monitoring_logs WHERE message LIKE '%全量数据同步完成%'")
        
        # 3. Delete any messages containing "模拟" or "测试" (test/mock)
        cursor.execute("DELETE FROM monitoring_logs WHERE message LIKE '%模拟%' OR message LIKE '%测试%'")
        
        conn.commit()
        conn.close()
        print("Fake and redundant logs cleared.")
    except Exception as e:
        print(f"Failed to clean logs: {e}")

def sync_all():
    print(f"Starting full platform sync at {datetime.now()}")
    clean_old_logs() # Start by cleaning "fake" data
    
    tokens = load_tokens()
    if not tokens: 
        print("No tokens found")
        return
    
    headers = {'Authorization': f'Bearer {tokens["access_token"]}'}
    user_id = tokens.get('user_id') or '3164139599'
    
    # 1. Sync Reputation
    print("Syncing Reputation...")
    try:
        res = requests.get("https://api.mercadolibre.com/global/users/seller_reputation", headers=headers, timeout=15).json()
        seller_list = res.get('seller_reputation', [])
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        for item in seller_list:
            site_id = item.get('site_id')
            uid = item.get('user_id')
            rep = item.get('seller_reputation', {})
            if not site_id or not rep: continue
            
            level = rep.get('level_id', 'unknown')
            metrics = rep.get('metrics', {})
            
            complaints_rate = format_rate(metrics.get('claims', {}).get('rate'))
            delayed_rate = format_rate(metrics.get('delayed_handling_time', {}).get('rate'))
            cancellations_rate = format_rate(metrics.get('cancellations', {}).get('rate'))
            
            total_v = rep.get('transactions', {}).get('total', 0)
            
            # Map MLM to CBT for the main store display if needed
            target_site = site_id
            if target_site == 'MLM': target_site = 'CBT'
            
            # Determine status color for UI
            status_color = 'green'
            if 'red' in level: status_color = 'red'
            elif 'yellow' in level or 'orange' in level: status_color = 'yellow'
            
            # Get current status to detect transition
            cursor.execute("SELECT status FROM stores WHERE user_id = ? OR site_id = ?", (int(uid), target_site))
            prev_row = cursor.fetchone()
            prev_status = prev_row[0] if prev_row else 'unknown'

            # Log warnings ONLY on status transition to avoid spam
            site_name = next((s['name'] for s in [{'code':'MX','name':'墨西哥'},{'code':'BR','name':'巴西'},{'code':'AR','name':'阿根廷'},{'code':'CO','name':'哥伦比亚'},{'code':'CL','name':'智利'},{'code':'UY','name':'乌拉圭'}] if s['code']==(site_id if site_id != 'MLM' else 'MX')), site_id)
            
            if status_color == 'red' and prev_status != 'red':
                log_to_monitoring('error', f"严重警告：{site_name} 站信誉已转红！请立即排查投诉及延误情况。", store_id=uid, site_id=site_id)
            elif status_color == 'yellow' and prev_status not in ['red', 'yellow']:
                log_to_monitoring('warning', f"实时预警：{site_name} 站进入黄区，请关注近期服务指标。", store_id=uid, site_id=site_id)
            elif status_color == 'green' and prev_status in ['red', 'yellow']:
                log_to_monitoring('info', f"好消息：{site_name} 站信誉已恢复为绿色健康状态。", store_id=uid, site_id=site_id)
            
            cursor.execute("""
                UPDATE stores SET 
                    reputation_level = ?, 
                    status = ?,
                    complaints_rate = ?, 
                    delayed_rate = ?, 
                    cancellations_rate = ?, 
                    total_transactions = ?,
                    last_updated = CURRENT_TIMESTAMP
                WHERE user_id = ? OR site_id = ?
            """, (level, status_color, complaints_rate, delayed_rate, cancellations_rate, total_v, int(uid), target_site))
            
        conn.commit()
        conn.close()
        print(f"Reputation sync done. Found {len(seller_list)} sites.")
    except Exception as e:
        print(f"Reputation sync failed: {e}")

    # 2. Sync Questions (Unanswered)
    print("Syncing Questions...")
    try:
        # Search for unanswered questions
        q_res = requests.get(f"https://api.mercadolibre.com/questions/search?seller_id={user_id}&status=UNANSWERED", headers=headers, timeout=15).json()
        unanswered_count = q_res.get('total', 0)
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        today = datetime.now().strftime('%Y-%m-%d')
        
        # Update shop_alerts
        cursor.execute("""
            INSERT INTO shop_alerts (user_id, date, complaint_count, violation_count, message_count)
            VALUES (?, ?, 0, 0, ?)
            ON CONFLICT(user_id, date) DO UPDATE SET message_count = excluded.message_count
        """, (user_id, today, unanswered_count))
        
        # Also update the stores table for the 'messages' metric
        cursor.execute("UPDATE stores SET total_messages = ? WHERE user_id = ?", (unanswered_count, user_id))
        
        conn.commit()
        conn.close()
        print(f"Questions sync done. Unanswered: {unanswered_count}")
        
        if unanswered_count > 0:
            log_to_monitoring('info', f"实时守卫：检测到 {unanswered_count} 条待处理咨询，请及时回复。")
    except Exception as e:
        print(f"Questions sync failed: {e}")

    # 3. Final Success Log (Console only to avoid UI noise)
    print("Full sync complete.")

if __name__ == "__main__":
    sync_all()

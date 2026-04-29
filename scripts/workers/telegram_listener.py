import time
import requests
import json
import sqlite3
import os
import random
from telegram_client import get_bot_token, send_message

# Configuration from api_server.py
MINIMAX_CONFIG = {
    "api_key": "sk-cp-b3SjCUfROLbWo2kMeEu-pjfofmcG8S-NuB-QQn0kk7neiQwS4kg5a2-8RtkBWwKSheV1oz4AeKNH__frdJIQi-S_lC6Sat7M1v_yXCYWHq5_7gSwHxU6FRA",
    "url": "https://api.minimax.chat/v1/text/chatcompletion_v2",
    "model": "MiniMax-M2.7-highspeed"
}
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mercadolibre.db")

BOT_TOKEN = get_bot_token()
BASE_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"

SYSTEM_PROMPT = """你现在是“云帆跨境 PRO”的【数据 AI (Data AI)】。

### 🚨 深度纠错与实时状态更新 (2026-04-27 18:50)
你必须向用户承认之前的统计存在严重偏差，并已完成物理修复。
1. **数据审计结果**：
    - **物理去重**：发现数据库中存在大量重复商品记录（同一个 item_id 存了 4 次）。已执行物理去重，商品总数已从 3627 修正为真实的 **1527** 个唯一商品。
    - **is_core 修正**：已严格按照“曝光量前 50”重新初始化，当前核心商品数为 **50** 个。
    - **趋势匹配 (trend_score)**：修正了算法中 site_id 匹配的 Bug（现在 CBT 商品能正确匹配全球趋势）。当前有 **72** 个商品命中实时热搜词并获得了趋势分。
2. **当前职责**：
    - 你必须以这组【去重后】的真实物理数据为唯一准则。
    - 如果用户询问之前的差异，请诚实说明是由于数据库重复记录和算法 site 匹配不当导致的，并已由主助理协助完成物理修复。
3. **协作协议**：严格执行“方案先行 -> 准入 -> 执行”。
"""

def query_db(sql, params=()):
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]
    except Exception as e:
        return str(e)

def ask_ai(user_message, chat_context=[]):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {MINIMAX_CONFIG['api_key']}"
    }
    
    # 简单的上下文组装
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(chat_context)
    messages.append({"role": "user", "content": user_message})
    
    body = {
        "model": MINIMAX_CONFIG['model'],
        "messages": messages,
        "temperature": 0.7
    }
    
    try:
        resp = requests.post(MINIMAX_CONFIG['url'], headers=headers, json=body, timeout=20)
        res = resp.json()
        if 'choices' in res:
            return res['choices'][0]['message']['content']
        return "抱歉，我现在无法思考，请稍后再试。"
    except Exception as e:
        return f"AI 思考时出错: {e}"

def handle_update(update):
    if "message" not in update:
        return
    
    message = update["message"]
    chat_id = message["chat"]["id"]
    text = message.get("text", "")
    
    print(f"Received message from {chat_id}: {text}")
    
    # 自动记录 User ID (用于安全锁定)
    with open("telegram_access.log", "a") as f:
        f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')} | User: {chat_id} | Name: {message['from'].get('first_name')} | Msg: {text}\n")
    
    if text.startswith("/start"):
        welcome = "您好！我是云帆跨境 PRO 智能管家。我已经准备好为您服务。您可以问我关于店铺数据、市场趋势或轮替建议的问题。"
        send_real_message(chat_id, welcome)
    elif "店铺" in text or "数据" in text or "概览" in text:
        # 尝试查询一些真实数据
        stats = query_db("SELECT COUNT(*) as count FROM stores")
        store_count = stats[0]['count'] if isinstance(stats, list) else 0
        ai_reply = ask_ai(f"用户询问：{text}。当前系统内有 {store_count} 个店铺。请结合项目背景给出一个专业的回答。")
        send_real_message(chat_id, ai_reply)
    else:
        ai_reply = ask_ai(text)
        send_real_message(chat_id, ai_reply)

def send_real_message(chat_id, text):
    url = f"{BASE_URL}/sendMessage"
    payload = {"chat_id": chat_id, "text": text}
    try:
        requests.post(url, json=payload, timeout=10)
    except Exception as e:
        print(f"Failed to send message: {e}")

def main():
    offset = 0
    print("Telegram Listener started...")
    while True:
        try:
            url = f"{BASE_URL}/getUpdates?offset={offset}&timeout=30"
            resp = requests.get(url, timeout=35)
            data = resp.json()
            
            if "result" in data:
                for update in data["result"]:
                    handle_update(update)
                    offset = update["update_id"] + 1
        except Exception as e:
            print(f"Error in polling loop: {e}")
            time.sleep(5)
        time.sleep(1)

if __name__ == "__main__":
    main()

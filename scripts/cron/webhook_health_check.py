#!/usr/bin/env python3
"""
Webhook 健康检查 - 每5分钟跑一次
1. 发测试请求到 http://47.76.179.242:8507/api/tongzhi
2. 验证返回 ok=true
3. 没响应或非200 → 发 Telegram 告警
4. 记录结果到 webhook_health.log
"""
import requests, json, os, sys
from datetime import datetime

WEBHOOK_URL = "http://47.76.179.242:8507/api/tongzhi"
TEST_PAYLOAD = {
    "resource": "/orders/TEST-HEALTH-CHECK",
    "topic": "orders",
    "id": "TEST-HEALTH-CHECK",
    "user_id": "3164139599",
    "site_id": "MLM",
    "amount": 0.01,
    "status": "test"
}
LOG_FILE = "/Users/chensan/yunfan-pro-dev/webhook_health.log"

def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")

def send_telegram_alert(message):
    token_path = os.path.expanduser("~/.telegram_bot_token")
    if not os.path.exists(token_path):
        print("⚠️ no telegram token found, skipping alert")
        return
    token = open(token_path).read().strip()
    chat_id = open(os.path.expanduser("~/.telegram_chat_id")).read().strip()
    try:
        r = requests.post(
            f"https://api.telegram.org/bot{token}/sendMessage",
            json={"chat_id": chat_id, "text": f"⚠️ Webhook监控告警\n{message}"},
            timeout=10
        )
        return r.status_code == 200
    except Exception as e:
        print(f"Telegram alert failed: {e}")

def main():
    try:
        r = requests.post(WEBHOOK_URL, json=TEST_PAYLOAD, timeout=10)
        if r.status_code == 200:
            data = r.json()
            if data.get("ok"):
                log("✅ webhook 端点正常响应")
                return
        log(f"❌ webhook 返回异常: HTTP {r.status_code} body={r.text[:200]}")
        send_telegram_alert(f"webhook端点异常 HTTP {r.status_code}")
    except requests.exceptions.Timeout:
        log("❌ webhook 超时")
        send_telegram_alert("webhook端点超时")
    except Exception as e:
        log(f"❌ webhook 请求失败: {e}")
        send_telegram_alert(f"webhook端点连接失败: {e}")

if __name__ == "__main__":
    main()

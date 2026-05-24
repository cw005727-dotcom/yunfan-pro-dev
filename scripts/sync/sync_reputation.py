"""
sync_reputation.py - 同步 ML 全球卖店铺声誉数据到 stores 表
按 site_id 定位/创建记录，支持多子账号
"""
import requests, sqlite3, os, json, base64, time
os.makedirs("/home/admin/yunfan-pro-dev/logs", exist_ok=True)
from datetime import datetime

DB_PATH = "/home/admin/yunfan-pro-dev/mercadolibre.db"

def simple_decrypt(enc_data, key):
    key_bytes = key.encode()
    data_bytes = base64.b64decode(enc_data.encode())
    return "".join(chr(b ^ key_bytes[i % len(key_bytes)]) for i, b in enumerate(data_bytes))

def simple_crypt(data, key):
    key_bytes = key.encode()
    data_bytes = data.encode()
    result = bytearray()
    for i in range(len(data_bytes)):
        result.append(data_bytes[i] ^ key_bytes[i % len(key_bytes)])
    return base64.b64encode(result).decode()

def load_tokens():
    key = open("/home/admin/.ml_token_key").read().strip()
    enc = open("/home/admin/yunfan-pro-dev/ml_tokens.enc").read()
    tokens = json.loads(simple_decrypt(enc, key))
    created_at = tokens.get("created_at", 0)
    expires_in = tokens.get("expires_in", 21600)
    if time.time() - created_at > expires_in - 3600:
        refreshed = requests.post("https://api.mercadolibre.com/oauth/token", data={
            "grant_type": "refresh_token",
            "client_id": "4507485641678982",
            "refresh_token": tokens.get("refresh_token", "")
        }, timeout=10).json()
        if refreshed.get("access_token"):
            tokens["access_token"] = refreshed["access_token"]
            tokens["created_at"] = time.time()
            if refreshed.get("refresh_token"):
                tokens["refresh_token"] = refreshed["refresh_token"]
            key2 = open("/home/admin/.ml_token_key").read().strip()
            enc_out = simple_crypt(json.dumps(tokens), key2)
            open("/home/admin/yunfan-pro-dev/ml_tokens.enc", "w").write(enc_out)
    return tokens

def format_rate(rate):
    if rate is None: return "0.00%"
    if isinstance(rate, (int, float)): return "%s%.2f%%" % ("", rate * 100)
    return str(rate)

def sync_reputation():
    tokens = load_tokens()
    if not tokens: return
    access_token = tokens.get("access_token")
    h = {"Authorization": "Bearer " + access_token}

    res = requests.get("https://api.mercadolibre.com/global/users/seller_reputation", headers=h, timeout=(5, 20)).json()
    seller_list = res.get("seller_reputation", [])
    print("Found %d sellers" % len(seller_list))

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    today = datetime.now().strftime("%Y-%m-%d")
    today_short = today[5:]

    for item in seller_list:
        site_id = item.get("site_id")
        user_id = item.get("user_id")
        rep = item.get("seller_reputation", {})
        if not site_id or not rep:
            continue

        level = rep.get("level_id", "unknown")
        metrics = rep.get("metrics", {})

        complaints_rate = format_rate(metrics.get("claims", {}).get("rate"))
        delayed_rate = format_rate(metrics.get("delayed_handling_time", {}).get("rate"))
        cancellations_rate = format_rate(metrics.get("cancellations", {}).get("rate"))

        claims_v = metrics.get("claims", {}).get("value", 0) or 0
        delayed_v = metrics.get("delayed_handling_time", {}).get("value", 0) or 0
        cancel_v = metrics.get("cancellations", {}).get("value", 0) or 0
        total_v = rep.get("transactions", {}).get("total", 0) or 0

        if "red" in level.lower() or "suspended" in level.lower():
            status_color = "red"
        elif "yellow" in level.lower() or "orange" in level.lower():
            status_color = "yellow"
        else:
            status_color = "green"

        print("Site %s (user=%s) -> level=%s claims=%s delayed=%s cancel=%s" % (
            site_id, user_id, level, complaints_rate, delayed_rate, cancellations_rate))

        cursor.execute("SELECT 1 FROM stores WHERE site_id = ?", (site_id,))
        exists = cursor.fetchone() is not None

        if exists:
            cursor.execute("""
                UPDATE stores SET
                    user_id = ?,
                    reputation_level = ?,
                    status = ?,
                    complaints_rate = ?,
                    delayed_rate = ?,
                    cancellations_rate = ?,
                    claims_value = ?,
                    delayed_value = ?,
                    cancel_value = ?,
                    total_transactions = ?,
                    alert_date = ?,
                    last_updated = CURRENT_TIMESTAMP
                WHERE site_id = ?
            """, (str(user_id), level, status_color,
                  complaints_rate, delayed_rate, cancellations_rate,
                  claims_v, delayed_v, cancel_v, total_v,
                  today_short, site_id))
        else:
            cursor.execute("""
                INSERT INTO stores
                    (user_id, site_id, reputation_level, status,
                     complaints_rate, delayed_rate, cancellations_rate,
                     claims_value, delayed_value, cancel_value,
                     total_transactions, alert_date, last_updated)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, (str(user_id), site_id, level, status_color,
                  complaints_rate, delayed_rate, cancellations_rate,
                  claims_v, delayed_v, cancel_v, total_v, today_short))

    conn.commit()
    conn.close()
    print("Done")

if __name__ == "__main__":
    sync_reputation()

"""
MercadoLibre Token Manager
自动刷新 + 加密存储
"""
import json
import os
import base64
import sqlite3
import time
import urllib.request
import urllib.parse
from pathlib import Path

# 生产环境路径
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
KEY_FILE = PROJECT_ROOT / ".ml_token_key"
TOKEN_FILE_ENC = str(PROJECT_ROOT / "ml_tokens.enc")

ML_APP_ID = "4507485641678982"
ML_CLIENT_SECRET = "fuRVTdNiMfXiLLXjoBaDHXcJRWasypPZ"
ML_TOKEN_URL = "https://api.mercadolibre.com/oauth/token"

# 提前刷新：access_token 剩余 < 24 小时时主动刷新
REFRESH_THRESHOLD_SECONDS = 86400


def get_key():
    if KEY_FILE.exists():
        return KEY_FILE.read_text().strip()
    default_key = "YUNFAN_MERCADO_SECRET_2026"
    KEY_FILE.write_text(default_key)
    os.chmod(KEY_FILE, 0o600)
    return default_key


def simple_crypt(data, key):
    key_bytes = key.encode()
    data_bytes = data.encode()
    result = bytearray()
    for i in range(len(data_bytes)):
        result.append(data_bytes[i] ^ key_bytes[i % len(key_bytes)])
    return base64.b64encode(result).decode()


def simple_decrypt(enc_data, key):
    key_bytes = key.encode()
    data_bytes = base64.b64decode(enc_data.encode())
    result = bytearray()
    for i in range(len(data_bytes)):
        result.append(data_bytes[i] ^ key_bytes[i % len(key_bytes)])
    return result.decode()


def save_tokens(tokens, db_path=None):
    """保存 tokens（加密文件 + stores 表）"""
    key = get_key()
    # 抹掉旧expires_at，用当前时间重算
    tokens["created_at"] = time.time()
    data_str = json.dumps(tokens)
    encrypted = simple_crypt(data_str, key)
    with open(TOKEN_FILE_ENC, "w") as f:
        f.write(encrypted)

    access_token = tokens.get("access_token")
    refresh_token = tokens.get("refresh_token")
    expires_in = tokens.get("expires_in", 21600)
    if not access_token:
        return

    # 从 access_token 解析 user_id
    # APP_USR-{app_id}-{ts}-{sig}-{user_id}
    user_id = None
    try:
        parts = access_token.split("-")
        if len(parts) >= 5:
            user_id = parts[-1]
    except:
        pass

    if not db_path:
        db_path = str(PROJECT_ROOT / "mercadolibre.db")
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        if user_id:
            cur.execute(
                "UPDATE stores SET access_token=?, refresh_token=? WHERE user_id=?",
                (access_token, refresh_token, int(user_id)),
            )
            print(f"[token_manager] stores updated for user_id={user_id}")
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[token_manager] WARNING: stores update failed: {e}")

    json_file = str(PROJECT_ROOT / "ml_tokens.json")
    if os.path.exists(json_file):
        os.remove(json_file)


def load_tokens():
    """解密加载 tokens"""
    key = get_key()
    if not os.path.exists(TOKEN_FILE_ENC):
        return None
    with open(TOKEN_FILE_ENC, "r") as f:
        enc_data = f.read()
    try:
        data_str = simple_decrypt(enc_data, key)
        return json.loads(data_str)
    except Exception as e:
        print(f"[token_manager] Decryption error: {e}")
        return None


def is_token_expired(tokens, threshold=REFRESH_THRESHOLD_SECONDS):
    """检查 access_token 是否即将过期（距过期 < threshold 秒）"""
    if not tokens:
        return True
    created_at = tokens.get("created_at", 0)
    expires_in = tokens.get("expires_in", 21600)
    expires_at = created_at + expires_in
    remaining = expires_at - time.time()
    print(f"[token_manager] access_token 剩余: {remaining:.0f}s ({remaining/3600:.1f}h)")
    return remaining < threshold


def refresh_access_token(refresh_token):
    """用 refresh_token 换新的 access_token"""
    params = urllib.parse.urlencode({
        "grant_type": "refresh_token",
        "client_id": ML_APP_ID,
        "client_secret": ML_CLIENT_SECRET,
        "refresh_token": refresh_token,
    })
    req = urllib.request.Request(
        ML_TOKEN_URL,
        data=params.encode(),
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def get_valid_token(force_refresh=False):
    """
    返回可用的 access_token，过期前自动刷新。
    每次 API 调用前统一使用此函数。
    """
    tokens = load_tokens()
    if not tokens:
        raise RuntimeError("[token_manager] No tokens found. Please authorize first.")

    if force_refresh or is_token_expired(tokens):
        print("[token_manager] Token expired or nearly expired, refreshing...")
        rt = tokens.get("refresh_token")
        if not rt:
            raise RuntimeError("[token_manager] No refresh_token available.")
        try:
            new_tokens = refresh_access_token(rt)
            # save_tokens 会追加 created_at
            save_tokens(new_tokens)
            print("[token_manager] Token refreshed successfully!")
            tokens = new_tokens
        except Exception as e:
            print(f"[token_manager] Refresh failed: {e}")
            raise RuntimeError(f"[token_manager] Token refresh failed: {e}")

    return tokens["access_token"]


if __name__ == "__main__":
    # 测试：打印当前 token 状态
    tokens = load_tokens()
    if tokens:
        print("Token loaded OK")
        print(f"  access_token: {tokens.get('access_token','')[:60]}...")
        print(f"  refresh_token: {tokens.get('refresh_token','')[:40]}...")
        print(f"  expires_in: {tokens.get('expires_in')}s")
        print(f"  is_expired: {is_token_expired(tokens)}")
    else:
        print("No token found")

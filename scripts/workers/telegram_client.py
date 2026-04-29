import json
import os
import base64
from pathlib import Path

# DISABLED CONSTANT - Set to False to enable real communication.
TELEGRAM_DISABLED = False

def get_key():
    KEY_FILE = Path.home() / ".ml_token_key"
    if KEY_FILE.exists():
        return KEY_FILE.read_text().strip()
    return "YUNFAN_MERCADO_SECRET_2026"

def simple_decrypt(enc_data, key):
    key_bytes = key.encode()
    data_bytes = base64.b64decode(enc_data.encode())
    result = bytearray()
    for i in range(len(data_bytes)):
        result.append(data_bytes[i] ^ key_bytes[i % len(key_bytes)])
    return result.decode()

def get_bot_token():
    try:
        config_path = os.path.join(os.path.dirname(__file__), "telegram_config.enc")
        if os.path.exists(config_path):
            with open(config_path, "r") as f:
                enc_data = f.read()
            data_str = simple_decrypt(enc_data, get_key())
            return json.loads(data_str).get("bot_token")
    except:
        return None
    return None

def send_message(chat_id, text):
    """
    Silent stub for sending messages. 
    Strictly follows the "no messages" constraint until enabled.
    """
    if TELEGRAM_DISABLED:
        # LOG ONLY TO FILE, DO NOT SEND TO NETWORK
        with open("telegram_audit.log", "a") as f:
            f.write(f"[SILENT_MODE] Would send to {chat_id}: {text}\n")
        return False
    
    # Real implementation placeholder (unused in silent mode)
    return True

if __name__ == "__main__":
    token = get_bot_token()
    if token:
        print("Telegram configuration loaded successfully (SILENT MODE).")
    else:
        print("Telegram configuration not found.")

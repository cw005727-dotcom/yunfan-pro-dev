import json
import os
import base64
from pathlib import Path

# Reuse the same key logic from token_manager
KEY_FILE = Path.home() / ".ml_token_key"
def get_key():
    if KEY_FILE.exists():
        return KEY_FILE.read_text().strip()
    return "YUNFAN_MERCADO_SECRET_2026"

def simple_crypt(data, key):
    key_bytes = key.encode()
    data_bytes = data.encode()
    result = bytearray()
    for i in range(len(data_bytes)):
        result.append(data_bytes[i] ^ key_bytes[i % len(key_bytes)])
    return base64.b64encode(result).decode()

def save_tg_token(token):
    key = get_key()
    data = {"bot_token": token}
    encrypted = simple_crypt(json.dumps(data), key)
    with open("telegram_config.enc", "w") as f:
        f.write(encrypted)
    print("Telegram token successfully encrypted and saved to telegram_config.enc")

if __name__ == "__main__":
    TOKEN = "8382738477:AAGy8M_82GQ6ch0P0liyg4nqGpdPoLhrl-g"
    save_tg_token(TOKEN)

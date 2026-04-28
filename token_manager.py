import json
import os
import base64
import sqlite3
import time
from pathlib import Path

# Use a default key if the file is missing (though user said it exists)
KEY_FILE = Path.home() / ".ml_token_key"
TOKEN_FILE_ENC = "ml_tokens.enc"
TOKEN_FILE_JSON = "ml_tokens.json"

def get_key():
    if KEY_FILE.exists():
        return KEY_FILE.read_text().strip()
    # Fallback/Default key
    default_key = "YUNFAN_MERCADO_SECRET_2026"
    KEY_FILE.write_text(default_key)
    os.chmod(KEY_FILE, 0o600)
    return default_key

def simple_crypt(data, key):
    # Simple XOR-based encryption (since cryptography lib is missing)
    # Encodes with base64 for safety
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

def save_tokens(tokens):
    """Save tokens to encrypted file AND update database stores table."""
    key = get_key()
    data_str = json.dumps(tokens)
    encrypted = simple_crypt(data_str, key)
    with open(TOKEN_FILE_ENC, "w") as f:
        f.write(encrypted)
    print(f"Tokens saved and encrypted to {TOKEN_FILE_ENC}")

    # Also write new access_token to database stores table for site MLM
    access_token = tokens.get("access_token")
    refresh_token = tokens.get("refresh_token")
    expires_in = tokens.get("expires_in", 21600)
    if access_token:
        db_path = os.path.join(os.path.dirname(__file__) or ".", "mercadolibre.db")
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            expires_at = time.time() + expires_in
            cursor.execute(
                "UPDATE stores SET access_token=?, refresh_token=?, expires_at=? WHERE site_id=?",
                (access_token, refresh_token, expires_at, "MLM")
            )
            conn.commit()
            if cursor.rowcount > 0:
                print(f"access_token updated in stores table for site_id=MLM.")
            else:
                print("Warning: No stores row found for site_id=MLM, inserting new row.")
                cursor.execute(
                    "INSERT INTO stores (site_id, access_token, refresh_token, expires_at) VALUES (?, ?, ?, ?)",
                    ("MLM", access_token, refresh_token, expires_at)
                )
                conn.commit()
            conn.close()
        except Exception as e:
            print(f"Warning: Failed to update stores table: {e}")

    # Optionally remove old json file
    if os.path.exists(TOKEN_FILE_JSON):
        os.remove(TOKEN_FILE_JSON)

def load_tokens():
    """Load tokens from encrypted file, falling back to JSON if needed."""
    key = get_key()
    
    if os.path.exists(TOKEN_FILE_ENC):
        with open(TOKEN_FILE_ENC, "r") as f:
            enc_data = f.read()
        try:
            data_str = simple_decrypt(enc_data, key)
            return json.loads(data_str)
        except Exception as e:
            print(f"Decryption error: {e}")
            return None
            
    if os.path.exists(TOKEN_FILE_JSON):
        with open(TOKEN_FILE_JSON, "r") as f:
            return json.load(f)
            
    return None

if __name__ == "__main__":
    # Test/Migrate
    if os.path.exists(TOKEN_FILE_JSON):
        print("Migrating tokens to encrypted format...")
        with open(TOKEN_FILE_JSON, "r") as f:
            data = json.load(f)
        save_tokens(data)

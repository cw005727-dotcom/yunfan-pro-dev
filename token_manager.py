import os
import base64
from cryptography.fernet import Fernet

# 固定的密钥（用于演示和基础加密）
# 在生产环境中，建议使用环境变量存储
ENCRYPTION_KEY = b'G_HlT-n_WwYI7_f_G_HlT-n_WwYI7_f_G_HlT-n_WwY='

def load_tokens(file_path='ml_tokens.enc'):
    if not os.path.exists(file_path):
        return None
    try:
        f = Fernet(ENCRYPTION_KEY)
        with open(file_path, 'rb') as file:
            encrypted_data = file.read()
        decrypted_data = f.decrypt(encrypted_data)
        import json
        return json.loads(decrypted_data)
    except Exception as e:
        print(f"Token decryption error: {e}")
        return None

def save_tokens(tokens, file_path='ml_tokens.enc'):
    try:
        f = Fernet(ENCRYPTION_KEY)
        import json
        data = json.dumps(tokens).encode()
        encrypted_data = f.encrypt(data)
        with open(file_path, 'wb') as file:
            file.write(encrypted_data)
        return True
    except Exception as e:
        print(f"Token encryption error: {e}")
        return False

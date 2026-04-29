"""
Token 管理中间件
提供 Mercado Libre API Token 的依赖注入 + 自动刷新
"""
import time
import logging
from typing import Optional
from functools import lru_cache

import requests
import sqlite3
import sys
sys.path.insert(0, str(__file__).rsplit('/', 3)[0])

# 尝试加载加密模块
try:
    from scripts.utils.token_manager import load_tokens, save_tokens, get_key, simple_crypt, simple_decrypt
    TOKEN_MANAGER_AVAILABLE = True
except ImportError:
    TOKEN_MANAGER_AVAILABLE = False
    # Fallback: 直接从数据库读
    pass

from ..config import DB_PATH, ML_APP_ID, ML_CLIENT_SECRET, LOG_LEVEL

logger = logging.getLogger(__name__)


class MercadoLibreTokenProvider:
    """
    ML Token 提供器
    - 从加密文件或数据库加载 token
    - 自动检测是否过期
    - 过期前自动刷新
    - 提供 get_valid_token() 接口
    """

    TOKEN_FILE_ENC = "~/.ml_tokens_encrypted.json"
    ML_BASE_URL = "https://api.mercadolibre.com"

    def __init__(self):
        self._token_cache: Optional[dict] = None
        self._token_expires_at: float = 0
        self._refresh_token_cache: Optional[str] = None

    def load_from_encrypted(self) -> Optional[dict]:
        """从加密文件加载 token"""
        if not TOKEN_MANAGER_AVAILABLE:
            return None
        try:
            return load_tokens()
        except Exception as e:
            logger.warning(f"加载加密token失败: {e}")
            return None

    def load_from_db(self) -> Optional[dict]:
        """从数据库加载 token（兜底）"""
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute(
                "SELECT access_token, refresh_token FROM stores WHERE access_token IS NOT NULL LIMIT 1"
            )
            row = cursor.fetchone()
            conn.close()
            if row:
                return {"access_token": row[0], "refresh_token": row[1]}
        except Exception as e:
            logger.warning(f"从数据库加载token失败: {e}")
        return None

    def is_token_valid(self, token: str) -> bool:
        """检查 token 是否有效（不检查过期，仅检查格式）"""
        if not token:
            return False
        # 简单检查：token 应该是非空字符串
        return len(token) > 10

    def get_token_data(self) -> Optional[dict]:
        """获取 token 数据（优先从内存缓存，其次加密文件，最后数据库）"""
        # 1. 内存缓存，检查是否未过期
        if self._token_cache and time.time() < self._token_expires_at - 60:  # 提前60秒刷新
            return self._token_cache

        # 2. 加密文件
        token_data = self.load_from_encrypted()
        if token_data and self.is_token_valid(token_data.get("access_token", "")):
            self._token_cache = token_data
            expires_in = token_data.get("expires_in", 21600)
            self._token_expires_at = time.time() + expires_in
            self._refresh_token_cache = token_data.get("refresh_token")
            return token_data

        # 3. 数据库兜底
        token_data = self.load_from_db()
        if token_data and self.is_token_valid(token_data.get("access_token", "")):
            self._token_cache = token_data
            self._token_expires_at = time.time() + 21600  # 假设6小时
            self._refresh_token_cache = token_data.get("refresh_token")
            return token_data

        return None

    def refresh_access_token(self, refresh_token: str) -> Optional[dict]:
        """用 refresh_token 刷新 access_token"""
        if not refresh_token:
            return None

        url = "https://api.mercadolibre.com/oauth/token"
        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": ML_APP_ID,
            "client_secret": ML_CLIENT_SECRET,
        }

        try:
            resp = requests.post(url, data=data, timeout=30)
            if resp.status_code == 200:
                token_data = resp.json()
                # 保存新 token
                if TOKEN_MANAGER_AVAILABLE:
                    save_tokens(token_data)
                # 更新缓存
                self._token_cache = token_data
                self._token_expires_at = time.time() + token_data.get("expires_in", 21600)
                self._refresh_token_cache = token_data.get("refresh_token")
                logger.info("Token 刷新成功")
                return token_data
            else:
                logger.error(f"Token 刷新失败: {resp.status_code} {resp.text}")
        except Exception as e:
            logger.error(f"Token 刷新异常: {e}")

        return None

    def get_valid_token(self) -> Optional[str]:
        """
        获取有效的 access_token（主入口）
        自动处理过期检测和刷新
        """
        token_data = self.get_token_data()
        if not token_data:
            return None

        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token") or self._refresh_token_cache

        # 检查是否即将过期
        if time.time() >= self._token_expires_at - 60:
            logger.info("Token 即将过期，尝试刷新...")
            if refresh_token:
                new_token_data = self.refresh_access_token(refresh_token)
                if new_token_data:
                    access_token = new_token_data.get("access_token")

        return access_token

    def clear_cache(self):
        """清除缓存，强制重新加载"""
        self._token_cache = None
        self._token_expires_at = 0
        self._refresh_token_cache = None


# 全局单例
_token_provider = MercadoLibreTokenProvider()


def get_ml_token() -> str:
    """
    FastAPI 依赖注入：获取有效的 ML access_token
    用法: @router.get("/xxx", dependencies=[Depends(get_ml_token)])
    """
    token = _token_provider.get_valid_token()
    if not token:
        raise RuntimeError("无法获取有效的 MercadoLibre access_token，请重新授权")
    return token


def get_ml_token_provider() -> MercadoLibreTokenProvider:
    """获取 token provider 实例（用于需要刷新能力的场景）"""
    return _token_provider

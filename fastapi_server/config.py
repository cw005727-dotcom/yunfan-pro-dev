"""
FastAPI 配置中心
所有环境变量和路径配置集中在这里
"""
import os
from pathlib import Path

# 项目根目录
BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR

# 数据库路径
# 开发环境: 本地目录
# 生产环境: /home/admin/yunfan-pro-dev/
import socket
DATA_DIR = '/home/admin/data' if socket.gethostname() == 'iZj6chblbqrz1cmahnevj3Z' else str(BASE_DIR)
DB_PATH = os.environ.get("DB_PATH", os.path.join(DATA_DIR, "mercadolibre.db"))

# API 配置
API_PORT = int(os.environ.get("API_PORT", "8506"))
API_HOST = os.environ.get("API_HOST", "0.0.0.0")

# Token 文件路径
TOKEN_FILE_ENC = os.environ.get("TOKEN_FILE_ENC", str(Path.home() / ".ml_token_enc"))
TOKEN_FILE_JSON = os.environ.get("TOKEN_FILE_JSON", str(Path.home() / ".ml_token_json"))

# MiniMax API 配置
MINIMAX_API_KEY = os.environ.get("MINIMAX_API_KEY", "")
MINIMAX_API_URL = "https://api.minimax.chat/v1/text/chatcompletion_v2"
MINIMAX_MODEL = "MiniMax-M2.7-highspeed"

# MiniMax 画图 API（用于 AI 商品图生成）
MINIMAX_IMAGE_API_KEY = MINIMAX_API_KEY  # 同用一个 key
MINIMAX_IMAGE_URL = "https://api.minimax.chat/v1/image_generation"

# ML API 配置
ML_API_BASE = "https://api.mercadolibre.com"
ML_APP_ID = os.environ.get("ML_APP_ID", "4507485641678982")
ML_CLIENT_SECRET = os.environ.get("ML_CLIENT_SECRET", "fuRVTdNiMfXiLLXjoBaDHXcJRWasypPZ")

# 日志配置
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
LOG_FILE = BASE_DIR / "api_server.log"
UPLOAD_DIR = BASE_DIR / "uploads"
EXPORT_DIR = BASE_DIR / "exports"

# CORS 白名单
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://chensan.vip",
]

# JWT/Admin Token (用于简单的 API 鉴权)
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "YUNFAN_ADMIN_2026")

# ── 1688 开放平台 ────────────────────────────────────
ALI1688_APP_KEY = os.environ.get("ALI1688_APP_KEY", "8372841")
ALI1688_APP_SECRET = os.environ.get("ALI1688_APP_SECRET", "")
# OAuth 回调地址（审核通过后配置实际的服务器地址）
ALI1688_CALLBACK_URL = os.environ.get(
    "ALI1688_CALLBACK_URL",
    "http://localhost:8506/api/alibaba1688/callback",
)

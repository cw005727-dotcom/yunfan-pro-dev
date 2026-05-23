"""
FastAPI 主入口
YunFan Pro Backend API
"""
import os
from dotenv import load_dotenv
load_dotenv()

import sys
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import API_PORT, API_HOST, CORS_ORIGINS, LOG_LEVEL, LOG_FILE, UPLOAD_DIR, BASE_DIR
from .db import get_db_connection

# 配置日志
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(str(LOG_FILE)),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI 启动和关闭事件"""
    # 启动时
    logger.info(f"[FastAPI] 启动中，监听 {API_HOST}:{API_PORT}")
    
    # 初始化数据库（如有需要）
    from .db import get_db_path
    import os
    db_path = get_db_path()
    if not os.path.exists(db_path):
        logger.warning(f"[FastAPI] 数据库文件不存在: {db_path}")
    
    yield
    
    # 关闭时
    logger.info("[FastAPI] 关闭中")


# 创建 FastAPI 实例
app = FastAPI(
    title="云帆跨境 PRO API",
    description="Mercado Libre 电商数据管理后台",
    version="5.0.0",
    lifespan=lifespan,
    docs_url="/docs",       # Swagger UI
    redoc_url="/redoc",     # ReDoc
)


# ==================== 静态文件（uploads）====================
from fastapi.staticfiles import StaticFiles
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
app.mount("/app", StaticFiles(directory=str(BASE_DIR / "dist"), html=True), name="dist")

# ==================== 中间件 ====================

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== 路由导入 ====================

from .routes import (
    stores, orders, products, logistics,
    stats, product_data, reputation,
    smart_rotation, market_radar, price_check,
    customer_service, monitoring, ai,
    sync, webhook, holidays, cms, auth,
    product_research, admin, amazon, upload, operational, product_performance
)
from .routes.notifications import router as notifications_router
from .routes.auto_center import router as auto_center_router
from .routes.logistics_tracking import router as logistics_tracking_router

app.include_router(stores.router)
app.include_router(orders.router)
app.include_router(products.router)
app.include_router(logistics.router)
app.include_router(stats.router)
app.include_router(product_data.router)
app.include_router(reputation.router)
app.include_router(smart_rotation.router)
app.include_router(market_radar.router)
app.include_router(price_check.router)
app.include_router(customer_service.router)
app.include_router(monitoring.router)
app.include_router(ai.router)
app.include_router(sync.router)
app.include_router(webhook.router)
app.include_router(holidays.router)
app.include_router(cms.router)
app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(product_research.router)
app.include_router(product_performance.router)
app.include_router(notifications_router)
app.include_router(admin.router)
app.include_router(auto_center_router)
app.include_router(amazon.router)
app.include_router(operational.router)
app.include_router(logistics_tracking_router)


@app.get("/api/proxy/image")
async def proxy_image(url: str):
    """代理 Amazon CDN 图片，解决 datacenter IP 400 问题"""
    import logging
    from urllib.request import Request, urlopen
    from fastapi.responses import Response
    logger = logging.getLogger("uvicorn.error")
    if not url or not url.startswith("http"):
        return Response(content="invalid url", status_code=400)
    try:
        req = Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://www.amazon.com/",
        })
        with urlopen(req, timeout=10) as resp:
            body = resp.read()
            content_type = resp.headers.get("Content-Type", "image/jpeg")
            logger.info(f"[proxy_image] {url[:80]} -> {resp.status}")
            return Response(content=body, media_type=content_type)
    except Exception as e:
        logger.warning(f"[proxy_image] failed: {url[:80]} {e}")
        return Response(content=str(e), status_code=502)


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/")
async def root():
    return {"status": "ok", "service": "yunfan-pro-api", "version": "5.0.0"}


# ==================== 全局异常处理 ====================

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"[全局异常] {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )


# ==================== 启动 ====================

def run():
    import uvicorn
    uvicorn.run(
        "fastapi_server.main:app",
        host=API_HOST,
        port=API_PORT,
        reload=False,
        log_level=LOG_LEVEL.lower(),
    )


if __name__ == "__main__":
    run()

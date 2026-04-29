"""
FastAPI 主入口
YunFan Pro Backend API
"""
import sys
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import API_PORT, API_HOST, CORS_ORIGINS, LOG_LEVEL, LOG_FILE
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
    sync, webhook, admin
)

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
app.include_router(admin.router)


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

"""
系统监控相关路由
GET /api/health        - 健康检查
GET /api/monitoring_logs
GET /api/monitoring/stream
"""
from fastapi import APIRouter, Depends
from ..db import get_db_connection

router = APIRouter(prefix="/api", tags=["监控"])


@router.get("/health")
async def health():
    """健康检查"""
    return {"status": "ok"}


@router.get("/monitoring_logs")
async def monitoring_logs():
    """监控日志"""
    # TODO: 实现
    return []


@router.get("/monitoring/stream")
async def monitoring_stream():
    """监控流"""
    # TODO: 实现
    return {}
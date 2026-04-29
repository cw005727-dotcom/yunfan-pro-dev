"""
系统监控相关路由
GET /api/monitoring_logs
GET /api/monitoring/stream
"""
from fastapi import APIRouter, Depends
from ..db import get_db

router = APIRouter(prefix="/api", tags=["系统监控"])


@router.get("/monitoring_logs")
async def monitoring_logs(db=Depends(get_db)):
    """监控日志"""
    # TODO: 实现
    return []


@router.get("/monitoring/stream")
async def monitoring_stream(db=Depends(get_db)):
    """监控流"""
    # TODO: 实现
    return {}

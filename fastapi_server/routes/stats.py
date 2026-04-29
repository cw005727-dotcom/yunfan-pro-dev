"""
数据统计相关路由
GET /api/stats
GET /api/stats_overview
GET /api/conversion_stats
"""
from fastapi import APIRouter, Depends
from ..db import get_db

router = APIRouter(prefix="/api", tags=["数据统计"])


@router.get("/stats")
async def get_stats(db=Depends(get_db)):
    """统计数据"""
    # TODO: 实现
    return {}


@router.get("/stats_overview")
async def stats_overview(db=Depends(get_db)):
    """数据概览"""
    # TODO: 实现
    return {}


@router.get("/conversion_stats")
async def conversion_stats(db=Depends(get_db)):
    """转化统计"""
    # TODO: 实现
    return {}

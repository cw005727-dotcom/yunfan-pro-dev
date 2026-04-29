"""
市场雷达相关路由
GET  /api/market_radar
POST /api/market_radar/analyze
POST /api/market_radar/search
"""
from fastapi import APIRouter, Depends
from ..db import get_db

router = APIRouter(prefix="/api", tags=["市场雷达"])


@router.get("/market_radar")
async def market_radar():
    """市场雷达"""
    # TODO: 实现
    return []


@router.post("/market_radar/analyze")
async def market_radar_analyze():
    """市场雷达分析"""
    # TODO: 实现
    return {}


@router.post("/market_radar/search")
async def market_radar_search():
    """市场雷达搜索"""
    # TODO: 实现
    return []

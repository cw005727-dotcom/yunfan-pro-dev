"""
物流相关路由
GET /api/logistics/stats
GET /api/logistics/detail
"""
from fastapi import APIRouter, Depends
from ..db import get_db

router = APIRouter(prefix="/api", tags=["物流"])


@router.get("/logistics/stats")
async def logistics_stats(db=Depends(get_db)):
    """物流统计"""
    # TODO: 实现
    return {}


@router.get("/logistics/detail")
async def logistics_detail():
    """物流详情"""
    # TODO: 实现
    return {}

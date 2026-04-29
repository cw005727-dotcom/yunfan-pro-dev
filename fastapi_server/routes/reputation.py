"""
店铺信誉相关路由
GET /api/shop_reputation
"""
from fastapi import APIRouter, Depends
from ..db import get_db

router = APIRouter(prefix="/api", tags=["店铺信誉"])


@router.get("/shop_reputation")
async def shop_reputation(db=Depends(get_db)):
    """店铺信誉"""
    # TODO: 实现
    return {}

"""
订单相关路由
GET /api/orders
"""
from fastapi import APIRouter, Depends
from ..db import get_db

router = APIRouter(prefix="/api", tags=["订单"])


@router.get("/orders")
async def get_orders(db=Depends(get_db)):
    """获取订单列表"""
    # TODO: 实现
    return []

"""
商品数据相关路由
GET /api/product_metrics
GET /api/product_performance
GET /api/product_history
"""
from fastapi import APIRouter, Depends
from ..db import get_db

router = APIRouter(prefix="/api", tags=["商品数据"])


@router.get("/product_metrics")
async def product_metrics(db=Depends(get_db)):
    """商品指标"""
    # TODO: 实现
    return []


@router.get("/product_performance")
async def product_performance(db=Depends(get_db)):
    """商品表现"""
    # TODO: 实现
    return []


@router.get("/product_history")
async def product_history():
    """商品历史"""
    # TODO: 实现
    return {}

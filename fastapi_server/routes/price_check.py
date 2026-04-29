"""
价格监控相关路由
GET  /api/price_check/list
POST /api/price_check/add
POST /api/price_check/delete
POST /api/price_check/calculate
GET  /api/trends
GET  /api/competitor_prices
"""
from fastapi import APIRouter, Depends
from ..db import get_db

router = APIRouter(prefix="/api", tags=["价格监控"])


@router.get("/price_check/list")
async def price_check_list(db=Depends(get_db)):
    """价格检查列表"""
    # TODO: 实现
    return []


@router.post("/price_check/add")
async def price_check_add():
    """添加价格检查"""
    # TODO: 实现
    return {}


@router.post("/price_check/delete")
async def price_check_delete():
    """删除价格检查"""
    # TODO: 实现
    return {}


@router.post("/price_check/calculate")
async def price_check_calculate():
    """计算价格"""
    # TODO: 实现
    return {}


@router.get("/trends")
async def trends(db=Depends(get_db)):
    """趋势"""
    # TODO: 实现
    return []


@router.get("/competitor_prices")
async def competitor_prices():
    """竞品价格"""
    # TODO: 实现
    return []

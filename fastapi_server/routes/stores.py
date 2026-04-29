"""
店铺/认证相关路由
POST /api/meli-auth
GET  /api/stores
GET  /api/shops
POST /api/generate_auth_url
"""
from fastapi import APIRouter, Depends
from sqlite3 import Row
from ..db import get_db

router = APIRouter(prefix="/api", tags=["店铺认证"])


@router.post("/meli-auth")
async def meli_auth():
    """Mercado Libre OAuth 认证"""
    # TODO: 实现
    return {"message": "TODO"}


@router.get("/stores")
async def get_stores(db=Depends(get_db)):
    """获取所有店铺"""
    # TODO: 实现
    return []


@router.get("/shops")
async def get_shops():
    """获取店铺列表"""
    # TODO: 实现
    return []


@router.post("/generate_auth_url")
async def generate_auth_url():
    """生成 ML OAuth URL"""
    # TODO: 实现
    return {"url": ""}

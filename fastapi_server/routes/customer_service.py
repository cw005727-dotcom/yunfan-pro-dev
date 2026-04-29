"""
客服消息相关路由
GET  /api/customer_service/list
POST /api/customer_service/chat
POST /api/customer_service/suggest
"""
from fastapi import APIRouter, Depends
from ..db import get_db

router = APIRouter(prefix="/api", tags=["客服消息"])


@router.get("/customer_service/list")
async def customer_service_list(db=Depends(get_db)):
    """客服消息列表"""
    # TODO: 实现
    return []


@router.post("/customer_service/chat")
async def customer_service_chat():
    """客服聊天"""
    # TODO: 实现
    return {}


@router.post("/customer_service/suggest")
async def customer_service_suggest():
    """客服建议"""
    # TODO: 实现
    return {}

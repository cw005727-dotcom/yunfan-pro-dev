"""
Webhook 相关路由
POST /api/ml/notifications
POST /api/ml/webhook/relay
"""
from fastapi import APIRouter, Request

router = APIRouter(prefix="/api", tags=["Webhook"])


@router.post("/ml/notifications")
async def ml_notifications(request: Request):
    """Mercado Libre 通知"""
    # TODO: 实现
    return {}


@router.post("/ml/webhook/relay")
async def ml_webhook_relay(request: Request):
    """Mercado Libre Webhook 转发"""
    # TODO: 实现
    return {}

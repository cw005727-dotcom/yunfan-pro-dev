"""
智能调价相关路由
GET  /api/smart_rotation
POST /api/apply_rotation
"""
from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["智能调价"])


@router.get("/smart_rotation")
async def smart_rotation():
    """智能调价列表"""
    # TODO: 实现
    return []


@router.post("/apply_rotation")
async def apply_rotation():
    """应用调价"""
    # TODO: 实现
    return {}

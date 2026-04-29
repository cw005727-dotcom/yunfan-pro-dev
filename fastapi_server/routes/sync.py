"""
同步相关路由
POST /api/sync
POST /api/global_sync
"""
from fastapi import APIRouter, BackgroundTasks

router = APIRouter(prefix="/api", tags=["同步"])


@router.post("/sync")
async def sync(background_tasks: BackgroundTasks):
    """同步数据"""
    # TODO: 实现
    return {"message": "sync started"}


@router.post("/global_sync")
async def global_sync(background_tasks: BackgroundTasks):
    """全量同步"""
    # TODO: 实现
    return {"message": "global sync started"}

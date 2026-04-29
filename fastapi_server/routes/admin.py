"""
Admin 相关路由
POST /api/deploy
POST /api/admin/generate_code
GET  /api/admin/invitation_codes
GET  /api/cms/articles
"""
from fastapi import APIRouter, Request

router = APIRouter(prefix="/api", tags=["Admin"])


@router.post("/deploy")
async def deploy(request: Request):
    """远程部署"""
    # TODO: 实现
    return {}


@router.post("/admin/generate_code")
async def generate_code():
    """生成邀请码"""
    # TODO: 实现
    return {}


@router.get("/admin/invitation_codes")
async def invitation_codes():
    """邀请码列表"""
    # TODO: 实现
    return []


@router.get("/cms/articles")
async def cms_articles():
    """CMS 文章"""
    # TODO: 实现
    return []

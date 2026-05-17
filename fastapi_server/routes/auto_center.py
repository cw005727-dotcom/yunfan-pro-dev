"""
自动化中心路由 - AI 工作流集成
美客多4合1: 标题优化/图片生成/视频生成/详情生成
"""
import sys
import os
import json
import base64
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import Optional, List
import logging
import requests

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auto", tags=["自动化中心"])

# 延迟导入，避免循环依赖
_image_gen_client = None

def _get_image_gen_client():
    global _image_gen_client
    if _image_gen_client is None:
        from fastapi_server.routes.utils.coze_client import ImageGenClient
        _image_gen_client = ImageGenClient()
    return _image_gen_client


def _encode_url(url: str) -> str:
    """把 URL 编码成 base64（避免多重 URL 编码问题）"""
    return base64.b64encode(url.encode("utf-8")).decode("ascii")


def _decode_url(encoded: str) -> str:
    """从 base64 解码回原始 URL"""
    return base64.b64decode(encoded.encode("ascii")).decode("utf-8")


class AutoRunRequest(BaseModel):
    workflow_type: str
    product_name: Optional[str] = ""
    custom_instructions: Optional[str] = ""
    # 标题
    title_count: int = 1
    # 图片
    image_description: Optional[str] = None
    image_style: Optional[str] = "product photography"
    image_types: Optional[List[str]] = None
    reference_images: Optional[List[dict]] = None
    category: Optional[str] = None
    # 视频
    video_description: Optional[str] = None
    video_duration: int = 5
    # 详情
    product_description: Optional[str] = None
    detail_language: str = "Spanish"


@router.post("/run")
async def run_auto_workflow(req: AutoRunRequest):
    """
    执行自动化工作流
    workflow_type: title / image / video / detail
    """
    try:
        if req.workflow_type == "image":
            # 图片生成：火山引擎 Seedream
            if not req.image_description:
                raise HTTPException(status_code=400, detail="image_description 不能为空")
            image_gen = _get_image_gen_client()
            result = image_gen.generate(
                prompt=req.image_description,
                image_style=req.image_style,
                image_types=req.image_types,
                reference_images=req.reference_images,
            )
            # 把火山引擎 CDN URL 换成代理 URL（base64 编码，解决 403 + 编码冲突）
            result_data = result.get("result_data", {})
            for img in result_data.get("images", []):
                if img.get("url"):
                    img["url"] = f"/api/auto/proxy-image?img={_encode_url(img['url'])}"
            result_data["image_urls"] = [
                f"/api/auto/proxy-image?img={_encode_url(u)}"
                for u in (result.get("result_data", {}).get("image_urls", []) or [])
            ]
            return {
                "result_data": result_data,
                "cost": result.get("cost", {"image_generations": 0})
            }
        else:
            raise HTTPException(
                status_code=501,
                detail=f"workflow_type={req.workflow_type} 暂未实现，当前仅支持 image"
            )

    except Exception as e:
        logger.error(f"[AutoCenter] error: {str(e)}")
        # 尝试识别错误类型
        error_str = str(e)
        if "ImageGenError" in error_str or "火山引擎" in error_str or "图片生成失败" in error_str:
            raise HTTPException(status_code=502, detail=f"图片生成失败: {error_str}")
        raise HTTPException(status_code=500, detail=f"Internal error: {error_str}")


@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "auto_center", "image_provider": "seedream"}


@router.get("/proxy-image")
async def proxy_image(img: str):
    """代理图片请求，解决火山引擎 CDN 403 问题"""
    try:
        img_url = _decode_url(img)
    except Exception:
        raise HTTPException(status_code=400, detail="无效的图片地址")
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://www.volcengine.com/",
            "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
        }
        resp = requests.get(img_url, headers=headers, timeout=30, allow_redirects=True)
        content_type = resp.headers.get("Content-Type", "image/jpeg")
        # 只返回图片类型的响应
        if not content_type or not content_type.startswith("image"):
            content_type = "image/jpeg"
        return Response(content=resp.content, media_type=content_type)
    except Exception as e:
        logger.error(f"[proxy-image] failed: {str(e)}")
        raise HTTPException(status_code=502, detail=f"图片代理失败: {str(e)}")
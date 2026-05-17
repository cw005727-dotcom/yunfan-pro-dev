"""
自动化中心路由 - AI 工作流集成
美客多4合1: 标题优化/图片生成/视频生成/详情生成
"""
import sys
import os
import json
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from fastapi import APIRouter, HTTPException
from fastapi_server.routes.utils.coze_client import ImageGenClient, ImageGenError
from pydantic import BaseModel
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auto", tags=["自动化中心"])

image_gen_client = ImageGenClient()


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
            result = image_gen_client.generate(
                prompt=req.image_description,
                image_style=req.image_style,
                image_types=req.image_types,
                reference_images=req.reference_images,
            )
            return {
                "result_data": result.get("result_data", {}),
                "cost": result.get("cost", {"image_generations": 0})
            }
        else:
            raise HTTPException(
                status_code=501,
                detail=f"workflow_type={req.workflow_type} 暂未实现，当前仅支持 image"
            )

    except ImageGenError as e:
        logger.error(f"[AutoCenter] ImageGenError: {str(e)}")
        raise HTTPException(status_code=502, detail=f"图片生成失败: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[AutoCenter] Internal error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "auto_center", "image_provider": "seedream"}
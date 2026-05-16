"""
自动化中心路由 - Coze API 集成
美客多4合1: 标题优化/图片生成/视频生成/详情生成
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from fastapi import APIRouter, HTTPException
from fastapi_server.routes.utils.coze_client import CozeClient, CozeAPIError
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/api/auto", tags=["自动化中心"])

coze_client = CozeClient()

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
        if req.workflow_type == "title":
            result = coze_client.run_workflow(
                workflow_type="title",
                product_name=req.product_name,
                custom_instructions=req.custom_instructions,
                title_count=req.title_count
            )
        elif req.workflow_type == "image":
            result = coze_client.generate_image(
                image_description=req.image_description,
                image_style=req.image_style,
                image_types=req.image_types,
                reference_images=req.reference_images,
                category=req.category or "",
                custom_instructions=req.custom_instructions
            )
        elif req.workflow_type == "video":
            result = coze_client.run_workflow(
                workflow_type="video",
                product_name=req.product_name,
                custom_instructions=req.custom_instructions,
                video_description=req.video_description,
                video_duration=req.video_duration
            )
        elif req.workflow_type == "detail":
            result = coze_client.run_workflow(
                workflow_type="detail",
                product_name=req.product_name,
                custom_instructions=req.custom_instructions,
                product_description=req.product_description,
                detail_language=req.detail_language
            )
        else:
            raise HTTPException(status_code=400, detail=f"Unknown workflow type: {req.workflow_type}")

        return result

    except CozeAPIError as e:
        raise HTTPException(status_code=502, detail=f"Coze API error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "auto_center"}
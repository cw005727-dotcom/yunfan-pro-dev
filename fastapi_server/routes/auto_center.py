"""
自动化中心路由 - Coze API 集成
美客多4合1: 标题优化/图片生成/视频生成/详情生成
"""
import sys
import os
import json
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from fastapi import APIRouter, HTTPException
from fastapi_server.routes.utils.coze_client import CozeClient, CozeAPIError
from pydantic import BaseModel
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

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

        logger.info(f"[AutoCenter] workflow={req.workflow_type} result_keys={list(result.get('result_data', {}).keys()) if isinstance(result, dict) else 'N/A'}")
        logger.info(f"[AutoCenter] raw_result={json.dumps(result, ensure_ascii=False)[:500]}")

        # 检查 result_data 是否为空（被 except 吞掉的异常在这里暴露）
        result_data = result.get('result_data', {}) if isinstance(result, dict) else {}
        
        if isinstance(result, dict) and not result_data:
            # 可能是错误但被包装了，检查 error 字段
            if result.get('error') or result.get('error_detail') or result.get('message'):
                error_msg = result.get('error_detail') or result.get('error') or result.get('message', 'unknown error')
                logger.error(f"[AutoCenter] workflow={req.workflow_type} returned error: {error_msg}")
                raise HTTPException(status_code=502, detail=error_msg)
            raise HTTPException(status_code=502, detail=f"Coze返回空结果: {result.get('message', 'no result_data')}")

        # 统一返回 cost 字段
        return {
            "result_data": result_data,
            "cost": result.get("cost", {"llm_calls": 0, "image_generations": 0, "video_generations": 0})
        }

    except CozeAPIError as e:
        logger.error(f"[AutoCenter] CozeAPIError: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Coze API error: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[AutoCenter] Internal error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "auto_center"}
"""
AI 功能相关路由
GET  /api/ai/keywords
GET  /api/keyword_intelligence
POST /api/ai/generate-images
POST /api/translate
POST /api/chat_assistant
POST /api/ai/analyze  - 通用 AI 分析
"""
import json
import requests
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..config import MINIMAX_API_KEY, MINIMAX_API_URL, MINIMAX_MODEL
from ..db import get_db_connection

router = APIRouter(prefix="/api", tags=["AI"])


class AIAnalyzeRequest(BaseModel):
    prompt: str
    system_prompt: Optional[str] = None
    temperature: float = 0.7
    response_format: Optional[dict] = None


class AIAnalyzeResponse(BaseModel):
    content: str
    raw: Optional[dict] = None


@router.post("/ai/analyze", response_model=AIAnalyzeResponse)
async def ai_analyze(body: AIAnalyzeRequest):
    """通用 AI 分析端点"""
    if not MINIMAX_API_KEY:
        raise HTTPException(status_code=500, detail="MiniMax API key not configured")

    messages = []
    if body.system_prompt:
        messages.append({"role": "system", "content": body.system_prompt})
    messages.append({"role": "user", "content": body.prompt})

    req_body = {
        "model": MINIMAX_MODEL,
        "messages": messages,
        "temperature": body.temperature,
    }
    if body.response_format:
        req_body["response_format"] = body.response_format

    try:
        resp = requests.post(
            MINIMAX_API_URL,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {MINIMAX_API_KEY}",
            },
            json=req_body,
            timeout=30,
        )
        resp_json = resp.json()

        if "choices" in resp_json:
            content = resp_json["choices"][0]["message"]["content"]
            return AIAnalyzeResponse(content=content, raw=resp_json)
        else:
            raise HTTPException(status_code=502, detail=f"MiniMax error: {resp.text}")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="MiniMax request timeout")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---- 以下为 TODO，待后续实现 ----

@router.get("/ai/keywords")
@router.get("/keyword_intelligence")
async def ai_keywords():
    """AI 关键词"""
    # TODO: 实现
    return {}


@router.post("/ai/generate-images")
async def generate_images():
    """AI 生成图片"""
    # TODO: 实现
    return {}


@router.post("/translate")
async def translate():
    """翻译"""
    # TODO: 实现
    return {}


@router.post("/chat_assistant")
async def chat_assistant():
    """聊天助手（已迁移至 customer_service 模块）"""
    # TODO: 实现
    return {}
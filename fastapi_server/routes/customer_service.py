"""
客服消息相关路由
POST /api/chat_assistant  - 客服聊天助手（美客多金牌客服）
GET  /api/customer_service/list
POST /api/customer_service/suggest
"""
import requests
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..config import MINIMAX_API_KEY, MINIMAX_API_URL, MINIMAX_MODEL
from ..db import get_db_connection

router = APIRouter(prefix="/api", tags=["客服"])


SYSTEM_PROMPT = "你是一个专业、热情的美客多（Mercado Libre）金牌客服助手。请用友好的语气回答用户关于Mercado Libre平台的问题，包括但不限于：店铺运营、商品上架、物流配送、售后服务、政策规则等。请用中文回复。"


class ChatAssistantRequest(BaseModel):
    message: str
    history: Optional[list] = None
    temperature: float = 0.7


class ChatAssistantResponse(BaseModel):
    reply: str
    raw: Optional[dict] = None


@router.post("/chat_assistant", response_model=ChatAssistantResponse)
async def chat_assistant(body: ChatAssistantRequest):
    """美客多金牌客服聊天助手"""
    if not MINIMAX_API_KEY:
        raise HTTPException(status_code=500, detail="MiniMax API key not configured")

    # 构建消息历史
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # 追加历史对话（如有）
    if body.history:
        for item in body.history:
            if "role" in item and "content" in item:
                messages.append({"role": item["role"], "content": item["content"]})

    # 当前用户消息
    messages.append({"role": "user", "content": body.message})

    try:
        resp = requests.post(
            MINIMAX_API_URL,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {MINIMAX_API_KEY}",
            },
            json={
                "model": MINIMAX_MODEL,
                "messages": messages,
                "temperature": body.temperature,
            },
            timeout=30,
        )
        resp_json = resp.json()

        if "choices" in resp_json:
            reply = resp_json["choices"][0]["message"]["content"]
            return ChatAssistantResponse(reply=reply, raw=resp_json)
        else:
            raise HTTPException(status_code=502, detail=f"MiniMax error: {resp.text}")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="MiniMax request timeout")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---- 以下为 TODO，待后续实现 ----

@router.get("/customer_service/list")
async def customer_service_list(db=Depends(get_db_connection)):
    """客服消息列表"""
    # TODO: 实现
    return []


@router.post("/customer_service/suggest")
async def customer_service_suggest():
    """客服建议"""
    # TODO: 实现
    return {}
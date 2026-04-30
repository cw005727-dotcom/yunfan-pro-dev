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

from fastapi import APIRouter, HTTPException
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


def call_minimax(messages, temperature=0.7, timeout=30):
    """MiniMax API 统一调用"""
    if not MINIMAX_API_KEY:
        raise HTTPException(status_code=500, detail="MiniMax API key not configured")
    try:
        resp = requests.post(
            MINIMAX_API_URL,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {MINIMAX_API_KEY}",
            },
            json={"model": MINIMAX_MODEL, "messages": messages, "temperature": temperature},
            timeout=timeout,
        )
        resp_json = resp.json()
        if "choices" in resp_json:
            return resp_json["choices"][0]["message"]["content"]
        else:
            raise HTTPException(status_code=502, detail=f"MiniMax error: {resp.text}")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="MiniMax request timeout")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/analyze", response_model=AIAnalyzeResponse)
async def ai_analyze(body: AIAnalyzeRequest):
    """通用 AI 分析端点"""
    messages = []
    if body.system_prompt:
        messages.append({"role": "system", "content": body.system_prompt})
    messages.append({"role": "user", "content": body.prompt})
    content = call_minimax(messages, body.temperature)
    return AIAnalyzeResponse(content=content)


# ─── AI 关键词情报 ───────────────────────────────────────────

@router.get("/ai/keywords")
@router.get("/keyword_intelligence")
async def ai_keywords(site: Optional[str] = None, limit: int = 20):
    """
    返回热搜关键词列表（来自 hot_keywords 表）
    ?site=MLB&limit=20
    """
    with get_db_connection() as conn:
        if site:
            rows = conn.execute(
                "SELECT * FROM hot_keywords WHERE site_id = ? ORDER BY rank ASC LIMIT ?",
                (site, limit)
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM hot_keywords ORDER BY site_id, rank ASC LIMIT ?",
                (limit,)
            ).fetchall()
        return [dict(row) for row in rows]


# ─── AI 图片生成 ─────────────────────────────────────────────

class GenerateImagesRequest(BaseModel):
    prompt: str
    aspect_ratio: Optional[str] = "1:1"   # 1:1 / 16:9 / 9:16
    resolution: Optional[str] = "1K"         # 1K / 2K
    count: int = 1


class GenerateImagesResponse(BaseModel):
    images: List[str]  # URL 列表
    prompt: str


@router.post("/ai/generate-images", response_model=GenerateImagesResponse)
async def generate_images(body: GenerateImagesRequest):
    """
    AI 商品图生成（调用 minimax 画图）
    """
    from ..config import MINIMAX_IMAGE_API_KEY, MINIMAX_IMAGE_URL

    if not MINIMAX_IMAGE_API_KEY:
        raise HTTPException(status_code=500, detail="Image API key not configured")

    aspect_map = {"1:1": "1:1", "16:9": "16:9", "9:16": "9:16"}
    ratio = aspect_map.get(body.aspect_ratio, "1:1")
    size_map = {"1K": "1024x1024", "2K": "2048x2048"}
    size = size_map.get(body.resolution, "1024x1024")

    try:
        resp = requests.post(
            MINIMAX_IMAGE_URL,
            headers={"Authorization": f"Bearer {MINIMAX_IMAGE_API_KEY}"},
            json={
                "model": "minimax.ImageGenerator",
                "prompt": body.prompt,
                "num_images": min(body.count, 4),
                "aspect_ratio": ratio,
                "resolution": size,
            },
            timeout=60,
        )
        data = resp.json()
        if "data" in data:
            urls = [item["image_url"] for item in data["data"] if "image_url" in item]
            return GenerateImagesResponse(images=urls, prompt=body.prompt)
        else:
            raise HTTPException(status_code=502, detail=f"Image API error: {resp.text}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── 翻译 ────────────────────────────────────────────────────

class TranslateRequest(BaseModel):
    text: str
    source: str = "auto"   # auto / en / es / pt
    target: str = "zh"     # zh / en / es / pt


class TranslateResponse(BaseModel):
    original: str
    translated: str
    source: str
    target: str


LANGS = {"zh": "中文", "en": "英文", "es": "西班牙语", "pt": "葡萄牙语"}


@router.post("/translate", response_model=TranslateResponse)
async def translate(body: TranslateRequest):
    """翻译接口（调用 MiniMax）"""
    source_lang = LANGS.get(body.source, body.source)
    target_lang = LANGS.get(body.target, body.target)
    messages = [
        {"role": "system", "content": f"你是一个专业的翻译引擎。请将{source_lang}翻译为{target_lang}，只返回翻译结果，不要解释。"},
        {"role": "user", "content": body.text},
    ]
    translated = call_minimax(messages, temperature=0.1)
    return TranslateResponse(
        original=body.text,
        translated=translated.strip(),
        source=body.source,
        target=body.target,
    )


# ─── 聊天助手 ────────────────────────────────────────────────

class ChatAssistantRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = None
    temperature: float = 0.7


class ChatAssistantResponse(BaseModel):
    reply: str


SYSTEM_PROMPT = (
    "你是一个专业、热情的美客多（Mercado Libre）平台运营助手。用户是跨境电商卖家，"
    "请用友好的中文语气回答关于Mercado Libre平台的问题，包括但不限于："
    "店铺运营、商品上架、物流配送、售后服务、政策规则、流量提升、选品策略等。"
    "如果不确定答案，请建议用户查阅Mercado Libre官方帮助文档。"
)


@router.post("/chat_assistant", response_model=ChatAssistantResponse)
async def chat_assistant(body: ChatAssistantRequest):
    """美客多金牌客服聊天助手"""
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if body.history:
        for item in body.history:
            if item.get("role") and item.get("content"):
                messages.append({"role": item["role"], "content": item["content"]})
    messages.append({"role": "user", "content": body.message})
    reply = call_minimax(messages, body.temperature)
    return ChatAssistantResponse(reply=reply)

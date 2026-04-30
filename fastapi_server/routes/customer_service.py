"""
客服消息相关路由
GET  /api/customer_service/list    - 客服消息列表（含聊天记录）
POST /api/customer_service/suggest - AI 生成高情商回复建议
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from ..config import MINIMAX_API_KEY, MINIMAX_API_URL, MINIMAX_MODEL
from ..db import get_db_connection

router = APIRouter(prefix="/api", tags=["客服"])


# ─── 数据模型 ─────────────────────────────────────────────────

class MessageItem(BaseModel):
    role: str       # buyer / seller / ai
    content: str
    translated: Optional[str] = None
    created_at: Optional[str] = None


class CustomerMessage(BaseModel):
    id: str
    site_id: str
    buyer_id: str
    buyer_name: str
    item_id: str
    last_message: str
    last_message_zh: Optional[str] = None
    status: str        # unread / replied
    updated_at: str
    messages: List[MessageItem] = []   # 买家+卖家+AI对话历史


class CustomerServiceListResponse(BaseModel):
    messages: List[CustomerMessage]
    total: int


class SuggestRequest(BaseModel):
    content: str          # 买家发送的原消息
    order_id: str         # 对应的 message_id
    site_id: Optional[str] = None   # 用于判断语言


class SuggestResponse(BaseModel):
    suggestion: str       # 英文原文（西班牙语/葡萄牙语）
    suggestion_zh: str     # 中文翻译


# ─── 工具函数 ─────────────────────────────────────────────────

def call_minimax(messages, temperature=0.7):
    import requests
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
            timeout=25,
        )
        resp_json = resp.json()
        if "choices" in resp_json:
            return resp_json["choices"][0]["message"]["content"]
        else:
            raise HTTPException(status_code=502, detail=f"MiniMax error: {resp.text}")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="MiniMax request timeout")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── 端点 ────────────────────────────────────────────────────

@router.get("/customer_service/list", response_model=CustomerServiceListResponse)
async def customer_service_list(site: Optional[str] = None, status: Optional[str] = None):
    """
    客服消息列表（来自 customer_messages + chat_history）
    ?site=MLM&status=unread
    """
    with get_db_connection() as conn:
        query = "SELECT * FROM customer_messages WHERE 1=1"
        params = []
        if site:
            query += " AND site_id = ?"
            params.append(site)
        if status:
            query += " AND status = ?"
            params.append(status)
        query += " ORDER BY updated_at DESC"

        rows = conn.execute(query, params).fetchall()
        cols = [r[1] for r in conn.execute("PRAGMA table_info(customer_messages)").fetchall()]

        messages = []
        for row in rows:
            d = dict(zip(cols, row))
            msg_id = d["id"]

            # 查聊天历史
            history = conn.execute(
                "SELECT role, content, translated_content, created_at FROM chat_history WHERE message_id = ? ORDER BY id ASC",
                (msg_id,)
            ).fetchall()

            msgs = []
            for h in history:
                msgs.append(MessageItem(
                    role=h[0], content=h[1],
                    translated=h[2] or None,
                    created_at=h[3]
                ))

            messages.append(CustomerMessage(
                id=msg_id,
                site_id=d["site_id"],
                buyer_id=d["buyer_id"],
                buyer_name=d["buyer_name"],
                item_id=d["item_id"],
                last_message=d["last_message"],
                status=d["status"],
                updated_at=d["updated_at"],
                messages=msgs,
            ))

        return CustomerServiceListResponse(messages=messages, total=len(messages))


@router.post("/customer_service/suggest", response_model=SuggestResponse)
async def customer_service_suggest(body: SuggestRequest):
    """
    AI 生成高情商客服回复建议
    输入：买家的原始消息 content + site_id
    输出：西班牙语/葡萄牙语建议回复 + 中文翻译
    """
    # 语言映射
    lang_map = {
        "MLM": ("西班牙语", "es"),
        "MLA": ("西班牙语", "es"),
        "MCO": ("西班牙语", "es"),
        "MLC": ("西班牙语", "es"),
        "MLU": ("西班牙语", "es"),
        "MLB": ("葡萄牙语", "pt"),
    }
    lang_name, lang_code = lang_map.get(body.site_id or "", ("西班牙语", "es"))

    system_prompt = (
        f"你是一名Mercado Libre平台的资深客服人员，擅长用{lang_name}撰写高情商、礼貌、专业的回复。"
        "请根据买家发送的消息，生成一条得体、友善且能促进成交的客服回复。"
        "要求：1-2句话以内，语气友好专业，体现平台客服水准。直接输出回复内容，不要解释。"
    )
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"买家消息：{body.content}"},
    ]

    suggestion = call_minimax(messages, temperature=0.7).strip()

    # 翻译成中文
    zh_messages = [
        {"role": "system", "content": "你是一个专业的翻译引擎。请将西班牙语（或葡萄牙语）翻译为中文，只返回翻译结果，不要解释。"},
        {"role": "user", "content": suggestion},
    ]
    suggestion_zh = call_minimax(zh_messages, temperature=0.1).strip()

    return SuggestResponse(suggestion=suggestion, suggestion_zh=suggestion_zh)

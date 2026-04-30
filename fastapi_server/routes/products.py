"""
商品管理相关路由
Batch 1 - 数据 AI 负责
POST /api/optimize_title   - 标题 AI 优化
POST /api/listing_doctor   - Listing 诊断对比
POST /api/item/update      - 商品更新（标题/主图/描述）
"""
import sys
import os
import json
import requests
from pathlib import Path
from typing import Optional, List

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PROJECT_ROOT / "scripts" / "utils"))

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..config import MINIMAX_API_KEY, MINIMAX_API_URL, MINIMAX_MODEL

router = APIRouter(prefix="/api", tags=["商品管理"])


class OptimizeTitleRequest(BaseModel):
    title: str
    plan: str = "C"
    prompt: str = ""


class OptimizeTitleResponse(BaseModel):
    suggestions: list[str]


@router.post("/optimize_title", response_model=OptimizeTitleResponse)
async def optimize_title(body: OptimizeTitleRequest):
    """标题 AI 优化"""
    try:
        final_prompt = f"{body.prompt}\n\n原标题: {body.title}\n请直接返回5个优化后的标题，每行一个，不要包含序号、引号或其他修饰词。"

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {MINIMAX_API_KEY}"
        }
        body_req = {
            "model": MINIMAX_MODEL,
            "messages": [
                {"role": "system", "content": "你是一个美客多（Mercado Libre）拉美电商SEO专家。"},
                {"role": "user", "content": final_prompt}
            ],
            "temperature": 0.7
        }

        resp = requests.post(MINIMAX_API_URL, headers=headers, json=body_req, timeout=30)
        resp_json = resp.json()

        if 'choices' in resp_json:
            content = resp_json['choices'][0]['message']['content']
            suggestions = [line.strip() for line in content.split('\n') if line.strip()][:5]
            return OptimizeTitleResponse(suggestions=suggestions)
        else:
            raise Exception(f"MiniMax error: {resp.text}")
    except Exception as e:
        # Fallback
        return OptimizeTitleResponse(suggestions=[
            f"{body.title} - Pro Edition",
            f"Nuevo {body.title}",
            f"Top {body.title}"
        ])


class ListingDoctorRequest(BaseModel):
    my_item: dict
    comp_item: dict


@router.post("/listing_doctor")
async def listing_doctor(body: ListingDoctorRequest):
    """Listing 诊断 - 对比自身与竞品给出优化建议"""
    try:
        prompt = (
            "As a Mercado Libre operations expert, compare my product with the competitor bestseller and give optimization advice.\n"
            "My product: title=" + body.my_item.get('title', '') + ", price=" + str(body.my_item.get('price', 0)) + "\n"
            "Competitor: title=" + body.comp_item.get('title', '') + ", price=" + str(body.comp_item.get('price', 0)) + ", sales=" + str(body.comp_item.get('sales', 0)) + "\n\n"
            "Return JSON with: diagnosis, strengths[], suggestions[], new_title"
        )

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {MINIMAX_API_KEY}"
        }
        body_req = {
            "model": MINIMAX_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"}
        }

        resp = requests.post(MINIMAX_API_URL, headers=headers, json=body_req, timeout=30)
        content = resp.json()['choices'][0]['message']['content']
        return json.loads(content)
    except Exception as e:
        return {"error": str(e)}


class ItemUpdateRequest(BaseModel):
    item_id: str
    title: Optional[str] = None
    pictures: Optional[List[str]] = None
    description: Optional[str] = None


class ItemUpdateResponse(BaseModel):
    status: str
    results: dict


@router.post("/item/update", response_model=ItemUpdateResponse)
async def update_item(body: ItemUpdateRequest, token: str = None):
    """更新商品（标题/主图/描述）"""
    from .db import get_db_connection
    from token_manager import load_tokens

    if not body.item_id:
        raise HTTPException(status_code=400, detail="item_id is required")

    tokens = load_tokens()
    if not tokens or not tokens.get('access_token'):
        raise HTTPException(status_code=401, detail="ML token not found")

    access_token = tokens['access_token']

    # Import ML client
    sys.path.insert(0, str(PROJECT_ROOT / "scripts" / "utils"))
    from ml_api_client import MercadoLibreClient

    client = MercadoLibreClient(None, None, None)
    results = {}

    # 1. Update title and pictures
    update_data = {}
    if body.title:
        update_data['title'] = body.title
    if body.pictures:
        update_data['pictures'] = [{"source": p} if isinstance(p, str) else p for p in body.pictures]

    if update_data:
        status, res = client.update_item(access_token, body.item_id, update_data)
        results['item'] = {"status": status, "data": res}
        if (status == 200 or status == 201) and body.title:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                if body.title:
                    cursor.execute("UPDATE product_metrics SET name = ? WHERE item_id = ?", (body.title, body.item_id))
                if body.pictures:
                    cursor.execute("UPDATE product_metrics SET image_url = ? WHERE item_id = ?", (body.pictures[0], body.item_id))
                conn.commit()

    # 2. Update description
    if body.description:
        status, res = client.update_description(access_token, body.item_id, body.description)
        results['description'] = {"status": status, "data": res}

    return ItemUpdateResponse(status="success", results=results)
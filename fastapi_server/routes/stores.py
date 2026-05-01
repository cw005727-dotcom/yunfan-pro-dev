"""
店铺/认证相关路由
Batch 1 - 数据 AI 负责
POST /api/meli-auth        - ML OAuth 回调
GET  /api/stores           - 获取所有店铺
GET  /api/shops            - 获取店铺列表（别名）
POST /api/generate_auth_url - 生成 ML 授权 URL
"""
import sys
import os
import requests
from pathlib import Path

# 添加项目根目录到 path（用于 token_manager 导入）
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PROJECT_ROOT / "scripts" / "utils"))

from fastapi import APIRouter, Query, HTTPException, Body
from fastapi.responses import HTMLResponse
from scripts.utils.token_manager import load_tokens, save_tokens

# ML OAuth 配置（与 api_server.py 保持一致）
ML_APP_ID = "8105299077213607"
ML_CLIENT_SECRET = "viZR1saM1FSpYXquulrmh8T1pKiRjcjN"
ML_REDIRECT_URI = "https://chensan.vip/api/meli-auth"
ML_TOKEN_URL = "https://api.mercadolibre.com/oauth/token"

router = APIRouter(prefix="/api", tags=["店铺认证"])


@router.get("/meli-auth")
async def meli_auth_get(code: str = Query(None)):
    """Mercado Libre OAuth 认证回调（GET，浏览器跳转）"""
    return await _do_auth(code)


@router.post("/meli-auth")
async def meli_auth_post(code: str = Body(None)):
    """Mercado Libre OAuth 回调（POST，兼容旧方式）"""
    return await _do_auth(code)


async def _do_auth(code: str):
    """统一授权处理"""
    if not code:
        raise HTTPException(status_code=400, detail="No code provided")

    try:
        payload = {
            "grant_type": "authorization_code",
            "client_id": ML_APP_ID,
            "client_secret": ML_CLIENT_SECRET,
            "code": code,
            "redirect_uri": ML_REDIRECT_URI
        }
        resp = requests.post(ML_TOKEN_URL, data=payload, timeout=10)
        data = resp.json()

        if 'access_token' in data:
            save_tokens(data)
            return HTMLResponse(content='<html><body><h2>授权成功 ✅</h2><p>可以关闭此窗口。</p></body></html>')
        else:
            return {"status": "error", "detail": str(data)}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


@router.get("/stores")
async def get_stores():
    """获取所有店铺（按站点 group_label 分组）"""
    from fastapi_server.db import get_db_connection

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT user_id, nickname, site_id, status, group_label,
                   reputation_level,
                   complaints_rate, claims_history,
                   cancellations_rate,
                   delayed_rate,
                   new_violations, new_claims, new_delayed, new_cancel,
                   alert_date, claims_period_days,
                   total_violations, total_complaints, total_messages,
                   total_cancellations,
                   new_messages,
                   access_token
            FROM stores
            ORDER BY user_id, site_id
        """)
        rows = [dict(r) for r in cursor.fetchall()]

    stores = []
    for row in rows:
        stores.append({
            "user_id": row['user_id'],
            "nickname": row['nickname'] or "未命名店铺",
            "site_id": row['site_id'],
            "status": row['status'] or "green",
            "group_label": row.get('group_label') or "",
            "reclamos": row.get('complaints_rate', '0%'),
            "claims_history": row.get('claims_history', 'Healthy'),
            "cancel": row.get('cancellations_rate', '0%'),
            "despacho": row.get('delayed_rate', '0%'),
            "new_violations": row.get('new_violations', 0),
            "new_claims": row.get('new_claims', 0),
            "new_delayed": row.get('new_delayed', 0),
            "new_cancel": row.get('new_cancel', 0),
            "new_messages": row.get('new_messages', 0),
            "alert_date": row.get('alert_date', ''),
            "claims_period": row.get('claims_period_days', ''),
            "total_violations": row.get('total_violations', 0),
            "total_claims": row.get('total_complaints', 0),
            "total_messages": row.get('total_messages', 0),
            "has_token": bool(row.get('access_token'))
        })

    return {"stores": stores, "total": len(stores)}


@router.get("/shops")
async def get_shops():
    """获取店铺列表 - get_stores 的别名（兼容旧前端）"""
    return await get_stores()


@router.post("/generate_auth_url")
async def generate_auth_url():
    """生成 ML OAuth 授权 URL"""
    auth_url = (
        f"https://auth.mercadolibre.com.mx/authorization"
        f"?response_type=code&client_id={ML_APP_ID}&redirect_uri={ML_REDIRECT_URI}"
    )
    return {"auth_url": auth_url}
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

# ML OAuth 配置（统一从 config.py 读取）
import json
from ..config import ML_APP_ID, ML_CLIENT_SECRET
ML_REDIRECT_URI = "https://chensan.vip/api/meli-auth"
ML_TOKEN_URL = "https://api.mercadolibre.com/oauth/token"


def _encode_state(data: dict) -> str:
    """将字典编码为 state 参数（base64，urlsafe）"""
    import base64, json
    raw = json.dumps(data, separators=(',', ':'))
    return base64.urlsafe_b64encode(raw.encode()).decode()


def _decode_state(state: str) -> dict:
    """解码 state 参数"""
    import base64, json
    try:
        return json.loads(base64.urlsafe_b64decode(state).decode())
    except:
        return {}

router = APIRouter(prefix="/api", tags=["店铺认证"])


@router.get("/meli-auth")
async def meli_auth_get(code: str = Query(None), state: str = Query("")):
    """Mercado Libre OAuth 认证回调（GET，浏览器跳转）"""
    shop_id = _decode_state(state).get("shop_id", "")
    return await _do_auth(code, shop_id)


@router.post("/meli-auth")
async def meli_auth_post(code: str = Body(None), state: str = Body("")):
    """Mercado Libre OAuth 回调（POST，兼容旧方式）"""
    shop_id = _decode_state(state).get("shop_id", "")
    return await _do_auth(code, shop_id)


async def _do_auth(code: str, shop_id: str = ""):
    """ML OAuth 回调：自动用 code 兑换 Token，写入 stores 表"""
    if not code:
        raise HTTPException(status_code=400, detail="No code provided")

    if not shop_id:
        raise HTTPException(status_code=400, detail="缺少 shop_id")

    # 1. 用 code 兑换 access_token + refresh_token
    import urllib.parse, urllib.request, json as pyjson
    params = urllib.parse.urlencode({
        "grant_type": "authorization_code",
        "client_id": ML_APP_ID,
        "client_secret": ML_CLIENT_SECRET,
        "code": code,
        "redirect_uri": ML_REDIRECT_URI,
    })
    try:
        req = urllib.request.Request(
            ML_TOKEN_URL,
            data=params.encode(),
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            token_data = pyjson.loads(resp.read())
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Token 兑换失败: {str(e)}")

    import logging
    logger = logging.getLogger("uvicorn.error")
    logger.info(f"[ML TOKEN] 兑换结果: {json.dumps({k: v[:30] if isinstance(v, str) else v for k, v in token_data.items()}, ensure_ascii=False)}")

    access_token = token_data.get("access_token", "")
    refresh_token = token_data.get("refresh_token", "")
    expires_in = token_data.get("expires_in", 21600)

    if not access_token:
        raise HTTPException(status_code=502, detail="Token 兑换失败: 无 access_token")
    if not refresh_token:
        logger.warning("[ML TOKEN] 无 refresh_token，此 token 将无法自动刷新")
        refresh_token = ""

    # 2. 用 access_token 查 ML 获取店铺信息（获取 site_id）
    import requests
    site_id = "MLB"
    user_id_from_ml = ""
    try:
        r = requests.get(
            "https://api.mercadolibre.com/users/me",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10
        )
        if r.status_code == 200:
            me = r.json()
            site_id = me.get("site_id", "MLB") or "MLB"
            user_id_from_ml = str(me.get("id", ""))
    except:
        pass

    # 3. 更新 stores 表：写入 token + site_id + ML 返回的 user_id
    from fastapi_server.db import get_db_connection
    now_ts = int(__import__("time").time())
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            """UPDATE stores SET
                access_token = ?,
                refresh_token = ?,
                token_expires_at = ?,
                site_id = ?,
                status = 'green',
                ml_user_id = ?
                WHERE user_id = ?""",
            (access_token, refresh_token, now_ts + expires_in, site_id, user_id_from_ml, int(shop_id))
        )
        conn.commit()

    # 4. 返回成功页面（3秒后自动跳转到首页）
    main_url = "https://chensan.vip/"
    return HTMLResponse(
        content=f'''<html><body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f0fdf4">
<div style="text-align:center;background:white;padding:40px;border-radius:24px;box-shadow:0 10px 40px rgba(0,0,0,0.06)">
<div style="font-size:48px;margin-bottom:16px">✅</div>
<h2 style="color:#064E3B;margin:0">店铺授权成功</h2>
<p style="color:#64748b;margin-top:12px">Token 已自动保存，刷新规则已就绪</p>
<div style="margin-top:24px;padding:16px;background:#f8fafc;border-radius:12px;text-align:left">
<p style="margin:4px 0;font-size:13px;color:#334155"><strong>店铺编号:</strong> {shop_id}</p>
<p style="margin:4px 0;font-size:13px;color:#334155"><strong>Token 有效期:</strong> {expires_in // 3600} 小时</p>
</div>
<p style="color:#94a3b8;font-size:12px;margin-top:16px"><span id="countdown">3</span> 秒后自动跳转...</p>
</div>
<script>
var sec = 3;
setInterval(function() {{
  sec--;
  document.getElementById("countdown").textContent = sec;
  if (sec <= 0) window.location.href = "{main_url}";
}}, 1000);
</script>
</body></html>'''
    )


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
    """
    获取店铺名称列表（去重），供前端下拉筛选用。
    返回的是用户在授权时填写的 nickname（备注名）。
    """
    from fastapi_server.db import get_db_connection

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT DISTINCT nickname FROM stores WHERE nickname IS NOT NULL "
            "AND nickname != '' AND nickname != '未命名店铺' "
            "ORDER BY nickname ASC"
        )
        names = [r[0] for r in cursor.fetchall()]

    if not names:
        names = ["大姐店"]  # fallback
    return names


@router.post("/generate_auth_url")
async def generate_auth_url(data: dict = Body(None)):
    """生成 ML OAuth 授权 URL，保存店铺备注名 + 关联到当前用户名"""
    from fastapi_server.db import get_db_connection
    import random

    nickname = (data or {}).get("nickname", "").strip()
    owner = (data or {}).get("username", "").strip()
    if not nickname:
        nickname = "未命名店铺"

    # 生成唯一 shop_id（时间戳后6位 + 随机4位，共10位纯数字）
    ts = int(__import__('time').time() * 1000) % 1000000
    rnd = random.randint(1000, 9999)
    shop_id = f"{ts:06d}{rnd}"

    # 写一条占位记录（含 owner_username）
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO stores (user_id, nickname, site_id, owner_username) VALUES (?, ?, ?, ?)",
            (int(shop_id), nickname, "PENDING", owner)
        )
        conn.commit()

    # shop_id 通过 state 参数传递
    state = _encode_state({"shop_id": shop_id})
    auth_url = (
        f"https://global-selling.mercadolibre.com/authorization"
        f"?response_type=code&client_id={ML_APP_ID}"
        f"&redirect_uri={ML_REDIRECT_URI}"
        f"&state={state}"
    )
    return {"auth_url": auth_url, "nickname": nickname, "shop_id": shop_id}
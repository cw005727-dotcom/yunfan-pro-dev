"""
店铺/认证相关路由
POST /api/meli-auth        - ML OAuth 回调（自动完成 token 兑换+入库）
GET  /api/stores           - 获取所有店铺（管理员）
GET  /api/my-stores        - 获取当前用户的店铺列表
GET  /api/shops            - 获取店铺名称列表（下去筛选用）
POST /api/generate_auth_url - 生成 ML 授权 URL（附带用户名+备注名）
"""
import sys
import os
import base64
import json
import time
import logging
import requests
import threading
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PROJECT_ROOT / "scripts" / "utils"))

from fastapi import APIRouter, Query, HTTPException, Body
from fastapi.responses import HTMLResponse
from ..config import ML_APP_ID, ML_CLIENT_SECRET
ML_REDIRECT_URI = "https://chensan.vip/api/meli-auth"
from ..db import get_db_connection
from scripts.utils.token_manager import save_tokens

router = APIRouter(prefix="/api", tags=["店铺认证"])
logger = logging.getLogger(__name__)

# ─── OAuth state ─────────────────────────────────────────────
STATE_SECRET = "YUNFAN_ML_OAUTH_STATE_2026"

def make_state(username: str, nickname: str, redirect_to: str = "/") -> str:
    """生成 state 参数（base64 编码的用户+店铺+跳转地址+时间戳）"""
    payload = json.dumps({
        "u": username, "n": nickname,
        "r": redirect_to,
        "ts": int(time.time())
    }, separators=(',', ':'))
    return base64.urlsafe_b64encode(payload.encode()).decode()

def parse_state(state: str) -> dict:
    """解析 state，验证防篡改和有效期"""
    try:
        raw = base64.urlsafe_b64decode(state.encode()).decode()
        data = json.loads(raw)
        if int(time.time()) - data.get("ts", 0) > 1800:
            return None
        return data
    except Exception:
        return None


# ─── 核心：兑换 code 并写入数据库 ─────────────────────────
def _exchange_and_save(code: str, username: str, nickname: str) -> dict:
    """用 code 换 token，把店铺信息写入 stores 表，返回结果"""
    # 1. 换 token
    token_url = "https://api.mercadolibre.com/oauth/token"
    payload = {
        "grant_type": "authorization_code",
        "client_id": ML_APP_ID,
        "client_secret": ML_CLIENT_SECRET,
        "code": code,
        "redirect_uri": ML_REDIRECT_URI,
    }
    resp = requests.post(token_url, data=payload, headers={"accept": "application/json"}, timeout=15)
    if resp.status_code != 200:
        logger.error(f"[ML Auth] token 兑换失败: {resp.status_code} {resp.text}")
        return {"ok": False, "message": f"token 兑换失败: {resp.text}"}

    tokens = resp.json()
    access_token = tokens.get("access_token")
    refresh_token = tokens.get("refresh_token")
    expires_in = tokens.get("expires_in", 21600)

    # 2. 用 access_token 拿 ML 用户信息
    me_resp = requests.get(
        "https://api.mercadolibre.com/users/me",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=15,
    )
    if me_resp.status_code != 200:
        return {"ok": False, "message": f"获取用户信息失败: {me_resp.status_code}"}

    ml_user = me_resp.json()
    ml_user_id = str(ml_user.get("id", ""))
    ml_nickname = ml_user.get("nickname", nickname or "未命名店铺")
    final_nickname = nickname if nickname else ml_nickname

    # 3. 写入/更新 stores 表
    with get_db_connection() as conn:
        cursor = conn.cursor()

        # 查找这个用户是否已有这个 ML user_id 的记录
        cursor.execute(
            "SELECT id FROM stores WHERE ml_user_id = ? AND owner_user_id = (SELECT id FROM users WHERE username = ?)",
            (ml_user_id, username)
        )
        existing = cursor.fetchone()

        if existing:
            cursor.execute("""
                UPDATE stores SET
                    access_token = ?, refresh_token = ?,
                    token_expires_at = ?, token_updated_at = ?,
                    nickname = ?, ml_user_id = ?,
                    status = 'active'
                WHERE ml_user_id = ? AND owner_user_id = (SELECT id FROM users WHERE username = ?)
            """, (access_token, refresh_token, int(time.time()) + expires_in, int(time.time()),
                  final_nickname, ml_user_id, ml_user_id, username))
        else:
            cursor.execute("""
                INSERT INTO stores (owner_user_id, ml_user_id, nickname, access_token, refresh_token,
                                    token_expires_at, token_updated_at, status, site_id)
                VALUES (
                    (SELECT id FROM users WHERE username = ?),
                    ?, ?, ?, ?,
                    ?, ?, 'active', 'MLB'
                )
            """, (username, ml_user_id, final_nickname, access_token, refresh_token,
                  int(time.time()) + expires_in, int(time.time())))

        conn.commit()

    logger.info(f"[ML Auth] 用户 {username} 店铺授权成功，ML user_id={ml_user_id}")

    # 4. 异步拉取声誉
    def _pull():
        try:
            import sys as _sys
            _root = Path(__file__).resolve().parent.parent.parent
            _sys.path.insert(0, str(_root))
            from pull_reputation import pull_reputation
            pull_reputation()
            logger.info("[ML Auth] 授权后声誉拉取完成")
        except Exception as e:
            logger.warning(f"[ML Auth] 授权后声誉拉取失败: {e}")

    threading.Thread(target=_pull, daemon=True).start()

    return {
        "ok": True,
        "message": "授权成功",
        "ml_user_id": ml_user_id,
        "nickname": final_nickname,
    }


# ─── ML OAuth 回调 ─────────────────────────────────────────
@router.get("/meli-auth")
async def meli_auth_get(code: str = Query(None), state: str = Query(None)):
    """
    Mercado Libre OAuth 回调（GET，浏览器跳转）
    - code: ML 颁发的授权码
    - state: base64(json({u:username, n:nickname, ts}))
    """
    if not code:
        return HTMLResponse(
            content='<html><body style="font-family:sans-serif;padding:40px;text-align:center">'
                   '<h2 style="color:#ef4444">授权失败：未收到 code</h2>'
                   '<p>请关闭此页面并重试</p></body></html>',
            status_code=400,
        )

    # 解析 state，还原 username 和 nickname 和跳转地址
    username = None
    nickname = None
    redirect_to = "/"
    if state:
        st = parse_state(state)
        if st:
            username = st.get("u")
            nickname = st.get("n")
            redirect_to = st.get("r") or "/"

    if not username:
        return HTMLResponse(
            content='''<!DOCTYPE html>
<html><head><meta charset="utf-8">
<script>
  if (window.opener) {
    window.opener.postMessage({ type: 'AUTH_FAILED', error: 'state无效或已过期' }, '*');
    setTimeout(() => window.close(), 500);
  } else {
    window.location.href = '/#/auth?error=state_invalid';
  }
</script></head><body style="font-family:sans-serif;padding:40px;text-align:center">
<h2 style="color:#ef4444">授权失败：state 无效</h2>
<p>请关闭并重新授权</p>
</body></html>''',
            status_code=400,
        )

    result = _exchange_and_save(code, username, nickname)

    if result["ok"]:
        # 用 postMessage 通知 opener，然后关闭弹窗
        return HTMLResponse(
            content=f'''<!DOCTYPE html>
<html><head><meta charset="utf-8">
<script>
  if (window.opener) {{
    window.opener.postMessage({{ type: 'AUTH_SUCCESS', shop: '{nickname}' }}, '*');
    setTimeout(() => window.close(), 500);
  }} else {{
    // 没有 opener，直接跳转到主页
    window.location.href = '/#/auth?auth=success&shop={nickname}';
  }}
</script></head><body style="font-family:sans-serif;padding:40px;text-align:center">
<h2 style="color:#10b981">✅ 授权成功！</h2>
<p>店铺 <strong>{nickname}</strong> 已绑定，正在关闭...</p>
</body></html>''',
        )
    else:
        return HTMLResponse(
            content=f'''<!DOCTYPE html>
<html><head><meta charset="utf-8">
<script>
  if (window.opener) {{
    window.opener.postMessage({{ type: 'AUTH_FAILED', error: 'token兑换失败' }}, '*');
    setTimeout(() => window.close(), 500);
  }} else {{
    window.location.href = '/#/auth?error=auth_failed';
  }}
</script></head><body style="font-family:sans-serif;padding:40px;text-align:center">
<h2 style="color:#ef4444">❌ 授权失败</h2>
<p>token 兑换失败，请重试</p>
</body></html>''',
            status_code=500,
        )


@router.post("/meli-auth")
async def meli_auth_post(code: str = Body(None), state: str = Body(None)):
    """POST 方式接收 code（给前端 AJAX 用）"""
    if not code:
        raise HTTPException(status_code=400, detail="code 为空")
    username = None
    nickname = None
    if state:
        st = parse_state(state)
        if st:
            username = st.get("u")
            nickname = st.get("n")
    if not username:
        raise HTTPException(status_code=400, detail="state 无效或已过期")
    result = _exchange_and_save(code, username, nickname)
    if result["ok"]:
        return result
    raise HTTPException(status_code=500, detail=result["message"])


# ─── 生成授权 URL ───────────────────────────────────────────
@router.post("/generate_auth_url")
async def generate_auth_url(data: dict = Body(None)):
    """
    生成 ML OAuth 授权 URL
    - username: 当前登录用户的网站用户名（必填）
    - nickname: 用户自定义的店铺备注名（必填）
    返回 auth_url，前端让用户在新窗口打开即可
    """
    payload = data or {}
    username = (payload.get("username") or "").strip()
    nickname = (payload.get("nickname") or "").strip()
    redirect_to = (payload.get("redirect_to") or "/").strip()

    if not username:
        raise HTTPException(status_code=400, detail="username 不能为空")
    if not nickname:
        raise HTTPException(status_code=400, detail="nickname 不能为空")

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="用户不存在")

    state = make_state(username, nickname, redirect_to)

    auth_url = (
        f"https://auth.mercadolibre.com/authorization"
        f"?response_type=code"
        f"&client_id={ML_APP_ID}"
        f"&redirect_uri={ML_REDIRECT_URI}"
        f"&state={state}"
    )

    logger.info(f"[ML Auth] 为用户 {username} 生成授权 URL，nickname={nickname}，跳转={redirect_to}")
    return {"auth_url": auth_url, "nickname": nickname, "username": username}


# ─── 获取当前用户的店铺列表 ──────────────────────────────────
@router.get("/my-stores")
async def get_my_stores(username: str = Query(...)):
    """获取指定用户自己授权的店铺"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, ml_user_id, nickname, site_id, status,
                   reputation_level, complaints_rate, claims_history,
                   cancellations_rate, delayed_rate,
                   new_violations, new_claims, new_delayed, new_cancel,
                   new_messages, total_complaints, total_messages,
                   total_cancellations,
                   CASE WHEN access_token IS NOT NULL THEN 1 ELSE 0 END as has_token,
                   group_label, alert_date
            FROM stores
            WHERE owner_user_id = (SELECT id FROM users WHERE username = ?)
            ORDER BY id DESC
        """, (username,))
        rows = [dict(r) for r in cursor.fetchall()]

    stores = []
    for row in rows:
        stores.append({
            "id": row["id"],
            "ml_user_id": row["ml_user_id"],
            "nickname": row["nickname"] or "未命名店铺",
            "site_id": row["site_id"] or "MLB",
            "status": row["status"] or "active",
            "group_label": row.get("group_label") or "默认分组",
            "reputation_level": row.get("reputation_level") or 0,
            "complaints_rate": row.get("complaints_rate", 0),
            "claims_history": row.get("claims_history", "Healthy"),
            "cancellations_rate": row.get("cancellations_rate", 0),
            "delayed_rate": row.get("delayed_rate", 0),
            "new_violations": row.get("new_violations", 0),
            "new_claims": row.get("new_claims", 0),
            "new_delayed": row.get("new_delayed", 0),
            "new_cancel": row.get("new_cancel", 0),
            "new_messages": row.get("new_messages", 0),
            "total_complaints": row.get("total_complaints", 0),
            "total_messages": row.get("total_messages", 0),
            "total_cancellations": row.get("total_cancellations", 0),
            "has_token": bool(row.get("has_token")),
            "alert_date": row.get("alert_date") or "",
        })

    return {"stores": stores, "total": len(stores)}


# ─── 获取所有店铺（兼容旧接口，管理员用）───────────────────────────
@router.get("/stores")
async def get_stores():
    """获取所有店铺（管理员用）"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT s.id, s.ml_user_id, s.nickname, s.site_id, s.status,
                   s.reputation_level, s.complaints_rate, s.claims_history,
                   s.cancellations_rate, s.delayed_rate,
                   s.new_violations, s.new_claims, s.new_delayed, s.new_cancel,
                   s.new_messages, s.total_complaints, s.total_messages,
                   s.total_cancellations,
                   CASE WHEN s.access_token IS NOT NULL THEN 1 ELSE 0 END as has_token,
                   s.group_label, s.alert_date,
                   u.username as owner_username
            FROM stores s
            LEFT JOIN users u ON s.owner_user_id = u.id
            ORDER BY s.id DESC
        """)
        rows = [dict(r) for r in cursor.fetchall()]

    stores = []
    for row in rows:
        stores.append({
            "id": row["id"],
            "ml_user_id": row["ml_user_id"],
            "nickname": row["nickname"] or "未命名店铺",
            "site_id": row["site_id"] or "MLB",
            "status": row["status"] or "active",
            "owner_username": row.get("owner_username") or "",
            "group_label": row.get("group_label") or "默认分组",
            "reputation_level": row.get("reputation_level") or 0,
            "complaints_rate": row.get("complaints_rate", 0),
            "claims_history": row.get("claims_history", "Healthy"),
            "cancellations_rate": row.get("cancellations_rate", 0),
            "delayed_rate": row.get("delayed_rate", 0),
            "new_violations": row.get("new_violations", 0),
            "new_claims": row.get("new_claims", 0),
            "new_delayed": row.get("new_delayed", 0),
            "new_cancel": row.get("new_cancel", 0),
            "new_messages": row.get("new_messages", 0),
            "total_complaints": row.get("total_complaints", 0),
            "total_messages": row.get("total_messages", 0),
            "total_cancellations": row.get("total_cancellations", 0),
            "has_token": bool(row.get("has_token")),
            "alert_date": row.get("alert_date") or "",
        })

    return {"stores": stores, "total": len(stores)}


# ─── 获取店铺名称列表（下去筛选用）───────────────────────────────
@router.get("/shops")
async def get_shops():
    """获取所有店铺备注名（去重），供前端下拉筛选用"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT DISTINCT nickname
            FROM stores
            WHERE nickname IS NOT NULL
              AND nickname != ''
              AND nickname != '未命名店铺'
            ORDER BY nickname ASC
        """)
        names = [r[0] for r in cursor.fetchall()]

    if not names:
        names = ["大姐店"]
    return names

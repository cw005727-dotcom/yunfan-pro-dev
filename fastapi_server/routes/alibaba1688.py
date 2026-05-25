"""
1688 API 客户端 & 物流查询路由
================================

依赖：
- config.py: ALI1688_APP_KEY, ALI1688_APP_SECRET, ALI1688_CALLBACK_URL, ALI1688_REFRESH_TOKEN
- db.py: get_db_connection
- 数据库 logistics_tracking 表（logistics_1688_order, logistics_1688_tracking 字段）

API 文档：
- 物流基本信息: alibaba.trade.getLogisticsInfos.buyerView
- 物流轨迹:      alibaba.trade.getLogisticsTraceInfo.buyerView
- Token 刷新:    system.oauth2.getToken
"""
import hashlib
import hmac
import json
import time
import logging
from datetime import datetime
from typing import Optional

import requests
from fastapi import APIRouter, Query
from pydantic import BaseModel

from ..config import (
    ALI1688_APP_KEY,
    ALI1688_APP_SECRET,
    ALI1688_CALLBACK_URL,
)
from ..db import get_db_connection

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/alibaba1688", tags=["1688"])

# ── 常量 ──────────────────────────────────────────────
GW_URL = "https://gw.open.1688.com/openapi"
OAUTH_URL = "https://open.1688.com/oauth/authorize"
TOKEN_URL = "https://open.1688.com/openapi/param2/1/system.oauth2/getToken"

# ── 签名 ──────────────────────────────────────────────

def _sign_top(params: dict, secret: str) -> str:
    """
    1688 开放平台签名（Top 签名算法）。
    参数按 ASCII 升序拼接 key1value1key2value2...，
    首尾拼接 secret 后做 MD5 并转大写。
    """
    keys = sorted(params.keys())
    raw = "".join(f"{k}{params[k]}" for k in keys)
    sign_str = secret + raw + secret
    return hashlib.md5(sign_str.encode("utf-8")).hexdigest().upper()


# ── Token 管理 ────────────────────────────────────────

def _read_refresh_token() -> Optional[str]:
    """从文件中读取 refresh_token"""
    import os
    from pathlib import Path
    token_file = Path(__file__).parent.parent / ".ali1688_token.json"
    if not token_file.exists():
        return None
    try:
        data = json.loads(token_file.read_text())
        return data.get("refresh_token")
    except (json.JSONDecodeError, KeyError):
        return None


def _write_tokens(access_token: str, refresh_token: str, expires_in: int):
    """保存 token 对到文件"""
    from pathlib import Path
    token_file = Path(__file__).parent.parent / ".ali1688_token.json"
    data = {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "expires_at": time.time() + expires_in,
        "updated_at": datetime.now().isoformat(),
    }
    token_file.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    logger.info("1688 tokens saved")


def _read_tokens() -> dict:
    """读取 token 对，自动尝试 refresh 如果过期"""
    from pathlib import Path
    token_file = Path(__file__).parent.parent / ".ali1688_token.json"
    if not token_file.exists():
        return {}
    try:
        data = json.loads(token_file.read_text())
        # 到期前 5 分钟 refresh
        if data.get("expires_at", 0) - 300 < time.time():
            new = refresh_access_token(data.get("refresh_token", ""))
            if new:
                return new
        return data
    except (json.JSONDecodeError, KeyError):
        return {}


def get_access_token() -> Optional[str]:
    """获取当前 access_token（业务入口）"""
    tokens = _read_tokens()
    return tokens.get("access_token")


def refresh_access_token(refresh_token: str) -> Optional[dict]:
    """用 refresh_token 刷新 access_token"""
    params = {
        "client_id": ALI1688_APP_KEY,
        "client_secret": ALI1688_APP_SECRET,
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
    }
    try:
        resp = requests.post(TOKEN_URL, data=params, timeout=15)
        result = resp.json()
        if "error_code" in result:
            logger.error(f"Refresh token failed: {result}")
            return None
        _write_tokens(
            result["access_token"],
            result.get("refresh_token", refresh_token),
            result.get("expires_in", 86400),
        )
        return _read_tokens()
    except Exception as e:
        logger.error(f"Refresh token error: {e}")
        return None


# ── 请求封装 ──────────────────────────────────────────

def call_api(method: str, biz_params: dict = None) -> dict:
    """
    调用 1688 开放平台 API。
    
    Args:
        method: 接口方法名，如 "alibaba.trade.getLogisticsTraceInfo.buyerView"
        biz_params: 业务参数字典（非字符串，会在内部 JSON 序列化）
    
    Returns:
        API 返回的 JSON 结果
    """
    token = get_access_token()
    if not token:
        return {"error": "No access_token. Please authorize first."}

    params = {
        "method": method,
        "app_key": ALI1688_APP_KEY,
        "session": token,
        "timestamp": str(int(time.time() * 1000)),
        "format": "json",
        "v": "2.0",
        "sign_method": "md5",
    }

    if biz_params:
        # 1688 要求业务参数作为 JSON 字符串
        params["param"] = json.dumps(biz_params, ensure_ascii=False, separators=(",", ":"))

    # 生成签名
    params["sign"] = _sign_top(params, ALI1688_APP_SECRET)

    # 请求地址格式: /param2/1/{method}/{appKey}
    url = f"{GW_URL}/param2/1/{method}/{ALI1688_APP_KEY}"

    try:
        resp = requests.post(url, data=params, timeout=15)
        data = resp.json()
        if "error_response" in data and data["error_response"].get("code"):
            logger.error(f"API error [{method}]: {data['error_response']}")
        return data
    except Exception as e:
        logger.error(f"API request failed [{method}]: {e}")
        return {"error": str(e)}


# ── 业务接口封装 ────────────────────────────────────

def get_logistics_infos(order_id: str) -> dict:
    """
    获取物流基本信息（物流单号、状态、收发件人、商品）

    alibaba.trade.getLogisticsInfos.buyerView
    """
    biz = {"orderId": order_id}
    return call_api("alibaba.trade.getLogisticsInfos.buyerView", biz)


def get_logistics_trace(logistics_id: str, logistics_order_id: Optional[str] = None) -> dict:
    """
    获取物流跟踪轨迹

    alibaba.trade.getLogisticsTraceInfo.buyerView

    Args:
        logistics_id: 物流单号（快递单号）
        logistics_order_id: 1688 订单号（可选，部分情况下需要）
    """
    biz = {"logisticsId": logistics_id}
    if logistics_order_id:
        biz["logisticsOrderId"] = logistics_order_id
    return call_api("alibaba.trade.getLogisticsTraceInfo.buyerView", biz)


# ── FastAPI 路由 ─────────────────────────────────────

@router.get("/auth-url")
def get_auth_url():
    """返回 1688 OAuth 授权链接"""
    if not ALI1688_APP_KEY or not ALI1688_CALLBACK_URL:
        return {"error": "ALI1688_APP_KEY or ALI1688_CALLBACK_URL not configured"}
    url = (
        f"{OAUTH_URL}?client_id={ALI1688_APP_KEY}"
        f"&response_type=code"
        f"&redirect_uri={ALI1688_CALLBACK_URL}"
        f"&state=alibaba1688_{int(time.time())}"
    )
    return {"auth_url": url}


@router.get("/callback")
def oauth_callback(code: str = Query(None), state: str = Query(None)):
    """1688 OAuth 回调：用 code 换取 access_token"""
    if not code:
        return {"error": "Missing code parameter"}

    params = {
        "client_id": ALI1688_APP_KEY,
        "client_secret": ALI1688_APP_SECRET,
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": ALI1688_CALLBACK_URL,
    }

    try:
        resp = requests.post(TOKEN_URL, data=params, timeout=15)
        result = resp.json()
        if "error_code" in result:
            logger.error(f"OAuth callback error: {result}")
            return {"error": result.get("error_message", "Auth failed")}

        _write_tokens(
            result["access_token"],
            result.get("refresh_token", ""),
            result.get("expires_in", 86400),
        )
        return {"message": "Authorization successful", "expires_in": result.get("expires_in")}
    except Exception as e:
        logger.error(f"OAuth callback exception: {e}")
        return {"error": str(e)}


@router.get("/token-status")
def token_status():
    """查看当前 token 状态"""
    tokens = _read_tokens()
    if not tokens.get("access_token"):
        return {"status": "no_token", "message": "Not authorized yet"}
    expires_at = tokens.get("expires_at", 0)
    remaining = max(0, int(expires_at - time.time()))
    return {
        "status": "ok" if remaining > 0 else "expired",
        "expires_in_seconds": remaining,
        "expires_at": datetime.fromtimestamp(expires_at).isoformat(),
        "has_refresh_token": bool(tokens.get("refresh_token")),
    }


class LogisticsTraceQuery(BaseModel):
    order_number: str


@router.post("/logistics/trace")
def query_logistics_trace(req: LogisticsTraceQuery):
    """
    查询单个订单的 1688 物流轨迹
    从 logistics_tracking 表取 logistics_1688_tracking 和 logistics_1688_order
    """
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, logistics_1688_tracking, logistics_1688_order "
            "FROM logistics_tracking WHERE order_number = ?",
            (req.order_number,),
        )
        row = cur.fetchone()

    if not row:
        return {"error": "Order not found", "order_number": req.order_number}

    tracking_field = row["logistics_1688_tracking"] or ""
    order_id_1688 = row["logistics_1688_order"] or ""

    if not tracking_field:
        return {"error": "No 1688 tracking number", "order_number": req.order_number}

    # 解析 logistics_1688_tracking 格式
    # 格式1: "79005783055746:9216" — 长号:分单号
    # 格式2: "YT7618036112938" — 快递单号
    # 格式3: "79005783055746" — 纯数字物流单号
    if ":" in tracking_field:
        parts = tracking_field.split(":")
        logistics_id = parts[0]
    else:
        logistics_id = tracking_field

    result = get_logistics_trace(logistics_id, order_id_1688)

    # 解析成功则更新 trace 结果到日志（数据库不改动，看需求）
    return {
        "order_number": req.order_number,
        "logistics_id": logistics_id,
        "logistics_1688_order": order_id_1688,
        "result": result,
    }


@router.post("/logistics/batch-sync")
def batch_sync_logistics(limit: int = Query(50, description="单次最多处理数量")):
    """
    批量查询已有 1688 追踪号的订单的物流轨迹。
    这个接口供定时任务调用（或手动触发）。
    """
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, order_number, logistics_1688_tracking, logistics_1688_order "
            "FROM logistics_tracking "
            "WHERE IFNULL(logistics_1688_tracking, '') != '' "
            "AND (status IS NULL OR status NOT IN ('已取消', '取消')) "
            # 优先查最近 7 天未更新的
            "ORDER BY order_date DESC "
            f"LIMIT {limit}"
        )
        rows = cur.fetchall()

    if not rows:
        return {"message": "No orders to sync", "count": 0}

    results = []
    for row in rows:
        tracking_field = row["logistics_1688_tracking"] or ""
        order_id_1688 = row["logistics_1688_order"] or ""

        if ":" in tracking_field:
            logistics_id = tracking_field.split(":")[0]
        else:
            logistics_id = tracking_field

        trace_result = get_logistics_trace(logistics_id, order_id_1688)
        results.append({
            "order_number": row["order_number"],
            "logistics_id": logistics_id,
            "success": "error" not in trace_result and "error_response" not in trace_result,
        })

        # 速率控制：每秒最多 5 次
        time.sleep(0.25)

    success_count = sum(1 for r in results if r["success"])
    return {
        "message": f"Synced {len(results)} orders, {success_count} succeeded",
        "total": len(results),
        "success": success_count,
        "results": results,
    }


@router.post("/logistics/refresh-token")
def refresh_token():
    """手动触发 refresh_token"""
    refresh = _read_refresh_token()
    if not refresh:
        return {"error": "No refresh_token saved. Please authorize first."}

    result = refresh_access_token(refresh)
    if result:
        return {"message": "Token refreshed", "expires_in": result.get("expires_in")}
    return {"error": "Refresh failed"}

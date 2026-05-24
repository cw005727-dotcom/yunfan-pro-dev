"""
店铺信誉相关路由
GET /api/shop_reputation
"""
import sqlite3
from typing import Optional

from fastapi import APIRouter, Query
from ..db import get_db_connection

router = APIRouter(prefix="/api", tags=["声誉"])

# 站点 ID → 显示名映射
SITE_MAPPING = {
    'MLM': 'MX',
    'MLB': 'BR',
    'MCO': 'CO',
    'MLA': 'AR',
    'MLC': 'CL',
    'MLU': 'UY',
}


def format_rate(val):
    """统一格式化百分比字段"""
    if not val or val == '%':
        return "0.00%"
    if isinstance(val, str) and not val.endswith('%'):
        try:
            return f"{float(val):.2f}%"
        except (ValueError, TypeError):
            return "0.00%"
    return val


def compute_status(reputation_level: Optional[str]) -> str:
    """根据 reputation_level 计算状态灯颜色"""
    level = (reputation_level or '').lower()
    if 'red' in level or 'suspended' in level:
        return 'red'
    elif 'yellow' in level or 'orange' in level:
        return 'yellow'
    return 'green'


def compute_score(status: str) -> int:
    """根据状态计算健康分"""
    return 15 if status == 'red' else 50 if status == 'yellow' else 92


@router.get("/shop_reputation")
async def shop_reputation(group: Optional[str] = Query(None, description="按 group_label 过滤")):
    """
    返回所有店铺的声誉数据，支持按 group_label 过滤。

    返回字段格式与旧端点 /api/shop_reputation 完全一致，
    兼容前端 ShopReputationView.jsx。
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if group:
            cursor.execute(
                "SELECT * FROM stores WHERE group_label = ?",
                (group,)
            )
        else:
            cursor.execute("SELECT * FROM stores")
        rows = [dict(r) for r in cursor.fetchall()]

    data = []
    for r in rows:
        level = r.get('reputation_level') or ''
        status = compute_status(level)

        data.append({
            "id": r.get('id'),
            "account": r.get('nickname') or r.get('store_name'),
            "user_id": r.get('user_id'),
            "site": SITE_MAPPING.get(r.get('site_id', ''), r.get('site_id', '')),
            "site_id": r.get('site_id'),
            "name": r.get('store_name'),
            "group_label": r.get('group_label'),
            "reputation_level": level,
            "status": status,
            "is_suspended": level == 'suspended',
            # 三个核心指标（百分比字符串，来自 stores 表官方字段）
            "reclamos": format_rate(r.get('complaints_rate')),
            "despacho": format_rate(r.get('delayed_rate')),
            "cancel": format_rate(r.get('cancellations_rate')),
            # 指标对应的数值
            "reclamos_v": r.get('claims_value') or 0,
            "despacho_v": r.get('delayed_value') or 0,
            "cancel_v": r.get('cancel_value') or 0,
            "total_v": r.get('total_transactions') or 0,
            # 投诉历史
            "claims_period": r.get('claims_period_days') or '60 days',
            "claims_history": r.get('claims_history') or 'N/A',
            "alert_date": r.get('alert_date'),
            "last_updated": r.get('last_updated') or '',
            # 新增统计（各周期增量）
            "new_claims": r.get('new_claims') or 0,
            "total_claims": r.get('total_complaints') or 0,
            "new_violations": r.get('new_violations') or 0,
            "total_violations": r.get('total_violations') or 0,
            "new_messages": r.get('new_messages') or 0,
            "total_messages": r.get('total_messages') or 0,
            "new_delayed": r.get('new_delayed') or 0,
            "new_cancel": r.get('new_cancel') or 0,
            "total_cancellations": r.get('total_cancellations') or 0,
            # 综合健康分
            "score": compute_score(status),
        })

    return data


@router.post("/shop_reputation/refresh")
async def refresh_reputation():
    """强制触发声誉数据同步（调用 sync_reputation.py）"""
    import subprocess, os
    
    script_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "scripts", "sync", "sync_reputation.py")
    
    try:
        result = subprocess.run(
            ["python3", script_path],
            capture_output=True,
            text=True,
            timeout=60
        )
        return {
            "success": True,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode
        }
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "脚本执行超时"}
    except Exception as e:
        return {"success": False, "error": str(e)}

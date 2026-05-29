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

    每个店铺展开为 6 个站点（MLM/MLB/MLA/MCO/MLC/MLU），
    每个站点从独立字段读取数据。
    """
    ALL_SITES = ['MLM', 'MLB', 'MLA', 'MCO', 'MLC', 'MLU']

    with get_db_connection() as conn:
        cursor = conn.cursor()
        if group:
            cursor.execute("SELECT * FROM stores WHERE group_label = ?", (group,))
        else:
            cursor.execute("SELECT * FROM stores")
        rows = [dict(r) for r in cursor.fetchall()]

    data = []
    for r in rows:
        for site_id in ALL_SITES:
            p = site_id.lower()
            level = r.get(f'{p}_reputation_level') or r.get('reputation_level') or ''
            complaints_rate = r.get(f'{p}_complaints_rate') if r.get(f'{p}_complaints_rate') else r.get('complaints_rate')
            delayed_rate = r.get(f'{p}_delayed_rate') if r.get(f'{p}_delayed_rate') else r.get('delayed_rate')
            cancellations_rate = r.get(f'{p}_cancellations_rate') if r.get(f'{p}_cancellations_rate') else r.get('cancellations_rate')

            status = compute_status(level)
            data.append({
                "id": r.get('id'),
                "account": r.get('nickname') or r.get('store_name'),
                "user_id": r.get('user_id'),
                "site": SITE_MAPPING.get(site_id, site_id),
                "site_id": site_id,
                "name": r.get('store_name'),
                "group_label": r.get('group_label'),
                "reputation_level": level,
                "status": status,
                "is_suspended": 'suspended' in level,
                "reclamos": format_rate(complaints_rate),
                "despacho": format_rate(delayed_rate),
                "cancel": format_rate(cancellations_rate),
                "reclamos_v": r.get('claims_value') or 0,
                "despacho_v": r.get('delayed_value') or 0,
                "cancel_v": r.get('cancel_value') or 0,
                "total_v": r.get('total_transactions') or 0,
                "claims_period": r.get('claims_period_days') or '60 days',
                "claims_history": r.get('claims_history') or 'N/A',
                "alert_date": r.get('alert_date'),
                "last_updated": r.get('last_updated') or '',
                "new_claims": r.get(f'{p}_new_claims') or r.get('new_claims') or 0,
                "total_claims": r.get('total_complaints') or 0,
                "new_violations": r.get(f'{p}_new_violations') or r.get('new_violations') or 0,
                "total_violations": r.get('total_violations') or 0,
                "new_messages": r.get('new_messages') or 0,
                "total_messages": r.get('total_messages') or 0,
                "new_delayed": r.get(f'{p}_new_delayed') or r.get('new_delayed') or 0,
                "new_cancel": r.get(f'{p}_new_cancel') or r.get('new_cancel') or 0,
                "total_cancellations": r.get('total_cancellations') or 0,
                "score": compute_score(status),
            })

    return data


@router.post("/shop_reputation/refresh")
async def refresh_reputation():
    """强制触发声誉数据同步（调外部 Python 脚本）"""
    import subprocess
    import sys
    from pathlib import Path

    script_path = Path(__file__).parent.parent.parent / "pull_reputation.py"
    if not script_path.exists():
        return {"status": "error", "message": f"Script not found: {script_path}"}

    try:
        result = subprocess.run(
            [sys.executable, str(script_path)],
            capture_output=True,
            text=True,
            timeout=30,
            cwd=str(script_path.parent),
        )
        if result.returncode == 0:
            return {
                "status": "ok",
                "message": "Reputation sync triggered",
                "output": result.stdout.strip()[-500:] if result.stdout else "",
            }
        else:
            return {
                "status": "error",
                "message": f"Script failed: {result.stderr.strip()[-200:]}",
            }
    except subprocess.TimeoutExpired:
        return {"status": "error", "message": "Script timed out after 30s"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


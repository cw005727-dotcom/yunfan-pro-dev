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


def _pget(r: dict, field: str, site_prefix: str) -> any:
    """优先取站点前缀字段（即使是 0 也取），再 fallback 到通用字段"""
    site_key = f'{site_prefix}_{field}'
    if site_key in r:
        return r[site_key] if r[site_key] is not None else 0
    return r.get(field, 0) or 0


def format_rate(val):
    """统一格式化百分比字段（ML 返回 0.0714 表示 7.14%）"""
    if val is None or val == '%' or val == '':
        return "0.00%"
    if isinstance(val, (int, float)):
        return f"{val * 100:.2f}%"
    if isinstance(val, str):
        if val.endswith('%'):
            return val
        try:
            return f"{float(val) * 100:.2f}%"
        except (ValueError, TypeError):
            return "0.00%"
    return "0.00%"


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
async def shop_reputation(
    group: Optional[str] = Query(None, description="按 group_label 过滤"),
    owner: Optional[str] = Query(None, description="按 owner_username 过滤"),
):
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
        elif owner:
            cursor.execute("SELECT * FROM stores WHERE owner_username = ?", (owner,))
        else:
            cursor.execute("SELECT * FROM stores")
        rows = [dict(r) for r in cursor.fetchall()]

    data = []
    for r in rows:
        for site_id in ALL_SITES:
            p = site_id.lower()
            level = r.get(f'{p}_reputation_level') or r.get('reputation_level') or ''
            complaints_rate = r.get(f'{p}_complaints_rate') if r.get(f'{p}_complaints_rate') is not None else r.get('complaints_rate')
            delayed_rate = r.get(f'{p}_delayed_rate') if r.get(f'{p}_delayed_rate') is not None else r.get('delayed_rate')
            cancellations_rate = r.get(f'{p}_cancellations_rate') if r.get(f'{p}_cancellations_rate') is not None else r.get('cancellations_rate')

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
                "new_claims": _pget(r, 'new_claims', p),
                "total_claims": r.get('total_complaints') or 0,
                "new_violations": _pget(r, 'new_violations', p),
                "total_violations": r.get('total_violations') or 0,
                "new_messages": r.get('new_messages') or 0,
                "total_messages": r.get('total_messages') or 0,
                "new_delayed": _pget(r, 'new_delayed', p),
                "new_cancel": _pget(r, 'new_cancel', p),
                "total_cancellations": r.get('total_cancellations') or 0,
                "score": compute_score(status),
            })

    return data


@router.post("/shop_reputation/refresh")
async def refresh_reputation(owner: Optional[str] = Query(None, description="按 owner_username 过滤")):
    """强制触发声誉数据同步（调外部 Python 脚本）"""
    import subprocess
    import sys
    from pathlib import Path

    script_path = Path(__file__).parent.parent.parent / "pull_reputation.py"
    if not script_path.exists():
        return {"status": "error", "message": f"Script not found: {script_path}"}

    try:
        cmd = [sys.executable, str(script_path)]
        if owner:
            cmd.extend(['--owner', owner])
        result = subprocess.run(
            cmd,
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


@router.get("/reputation/token")
async def reputation_token():
    """返回当前店铺的 access_token（供本地 Mac 拉取声誉用）"""
    from fastapi_server.db import get_db_connection
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT access_token FROM stores WHERE access_token IS NOT NULL AND access_token != '' LIMIT 1")
        row = cur.fetchone()
    if row:
        return {"access_token": row["access_token"]}
    return {"access_token": ""}


@router.post("/reputation/sync")
async def reputation_sync(data: dict):
    """接收本地 Mac 推送的声誉数据"""
    reputation_list = data.get("reputation", [])
    if not reputation_list:
        return {"status": "error", "message": "无数据"}

    from fastapi_server.db import get_db_connection
    from datetime import datetime

    updated = 0
    with get_db_connection() as conn:
        cur = conn.cursor()
        # 排除 fulfillment，只保留 remote/CBT 数据
        site_groups = {}
        for rep in reputation_list:
            lt = rep.get("logistic_type", "")
            if lt == 'fulfillment':
                continue
            sid = rep.get("site_id", "")
            if sid not in site_groups:
                site_groups[sid] = rep
            else:
                existing_level = site_groups[sid].get("seller_reputation", {}).get("level_id", "")
                new_level = rep.get("seller_reputation", {}).get("level_id", "")
                if 'newbie' in existing_level and 'newbie' not in new_level:
                    site_groups[sid] = rep

        for site_id, rep in site_groups.items():
            rep_detail = rep.get("seller_reputation", {})
            metrics = rep_detail.get("metrics", {})

            level = rep_detail.get("level_id") or ""
            complaints_rate = metrics.get("claims", {}).get("rate", 0)
            delayed_rate = metrics.get("delayed_handling_time", {}).get("rate", 0)
            cancellations_rate = metrics.get("cancellations", {}).get("rate", 0)
            new_claims = metrics.get("claims", {}).get("value", 0) or 0
            new_delayed = metrics.get("delayed_handling_time", {}).get("value", 0) or 0
            new_cancel = metrics.get("cancellations", {}).get("value", 0) or 0
            new_violations = new_claims + new_delayed + new_cancel

            prefix = site_id.lower()
            cur.execute(f"""
                UPDATE stores SET
                    {prefix}_reputation_level = ?,
                    {prefix}_complaints_rate = ?,
                    {prefix}_delayed_rate = ?,
                    {prefix}_cancellations_rate = ?,
                    {prefix}_new_violations = ?,
                    {prefix}_new_claims = ?,
                    {prefix}_new_delayed = ?,
                    {prefix}_new_cancel = ?
                WHERE rowid IN (SELECT MIN(rowid) FROM stores WHERE ml_user_id IS NOT NULL AND ml_user_id != '')
            """, (level, complaints_rate, delayed_rate, cancellations_rate,
                  new_violations, new_claims, new_delayed, new_cancel))
            if cur.rowcount > 0:
                updated += 1

        conn.commit()

    return {"status": "ok", "updated": updated}



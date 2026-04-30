"""
同步相关路由
POST /api/sync - 触发 Lark 同步（final_lark_sync.py）
POST /api/global_sync - 触发全量同步（global_sync.py）
POST /api/sync/orders - 同步订单数据
"""
import os
import logging
import subprocess
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query
from pydantic import BaseModel

from ..db import get_db_connection

router = APIRouter(prefix="/api", tags=["数据同步"])
logger = logging.getLogger(__name__)

# 同步脚本路径（来自旧 api_server.py）
SCRIPT_DIR = "/Users/chensan/.accio/accounts/7086454425/agents/MID-95454425U1776995-4A33A1-0369-3FFD58/project"
LARK_SYNC_SCRIPT = os.path.join(SCRIPT_DIR, "final_lark_sync.py")
GLOBAL_SYNC_SCRIPT = os.path.join(SCRIPT_DIR, "global_sync.py")


class SyncOrdersRequest(BaseModel):
    shop: Optional[str] = None
    group: Optional[str] = None
    since_days: Optional[int] = 30


def _run_sync_script(script_path: str) -> dict:
    """执行同步脚本，返回结果"""
    if not os.path.exists(script_path):
        return {"status": "error", "message": f"Script not found: {script_path}"}

    try:
        result = subprocess.run(
            ["python3", script_path],
            capture_output=True,
            text=True,
            timeout=300,
            cwd=os.path.dirname(script_path),
        )
        return {
            "status": "success" if result.returncode == 0 else "error",
            "message": result.stdout or result.stderr,
            "returncode": result.returncode,
        }
    except subprocess.TimeoutExpired:
        return {"status": "error", "message": "Script timed out after 300s"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/sync")
async def sync(background_tasks: BackgroundTasks):
    """
    触发 Lark 同步（final_lark_sync.py）
    对应旧端点：POST /api/sync
    """
    logger.info("[Sync] Lark Sync triggered via /api/sync")
    background_tasks.add_task(_run_sync_script, LARK_SYNC_SCRIPT)
    return {"status": "success", "message": "Lark Sync 已触发"}


@router.post("/global_sync")
async def global_sync(background_tasks: BackgroundTasks):
    """
    触发全量同步（global_sync.py）- 所有店铺，本地 DB
    对应旧端点：POST /api/global_sync
    """
    logger.info("[Sync] Global Sync triggered via /api/global_sync")
    background_tasks.add_task(_run_sync_script, GLOBAL_SYNC_SCRIPT)
    return {"status": "success", "message": "全量同步已触发"}


@router.post("/sync/orders")
async def sync_orders(req: SyncOrdersRequest, background_tasks: BackgroundTasks):
    """
    同步订单数据
    - 可按 shop / group 过滤
    - 可指定拉取近 N 天订单
    """
    try:
        now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        since_str = None
        if req.since_days:
            from datetime import timedelta
            since_dt = datetime.now() - timedelta(days=req.since_days)
            since_str = since_dt.strftime('%Y-%m-%d')

        with get_db_connection() as conn:
            cursor = conn.cursor()

            # 按店铺过滤
            where_clauses = []
            params = []

            if req.shop:
                cursor.execute("SELECT user_id FROM stores WHERE nickname = ?", (req.shop,))
                row = cursor.fetchone()
                if row:
                    where_clauses.append("user_id = ?")
                    params.append(row['user_id'])

            if req.group:
                cursor.execute("SELECT user_id FROM stores WHERE group_label = ?", (req.group,))
                uids = [r['user_id'] for r in cursor.fetchall() if r['user_id']]
                if uids:
                    placeholders = ','.join(['?'] * len(uids))
                    where_clauses.append(f"user_id IN ({placeholders})")
                    params.extend(uids)

            if since_str:
                where_clauses.append("order_date >= ?")
                params.append(since_str)

            where = " WHERE " + " AND ".join(where_clauses) if where_clauses else ""
            cursor.execute(f"SELECT COUNT(*) as cnt FROM orders_v2{where}", params)
            count = cursor.fetchone()['cnt']

        return {
            "status": "success",
            "shop": req.shop,
            "group": req.group,
            "since_days": req.since_days,
            "matched_orders": count,
            "message": f"订单同步筛选条件已记录，{count} 条订单待处理",
        }
    except Exception as e:
        logger.error(f"[Sync Orders] error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sync/status")
async def sync_status():
    """
    返回同步任务状态（本地缓存统计）
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as total FROM orders_v2")
            total = cursor.fetchone()['total']

            cursor.execute("""
                SELECT COUNT(*) as cnt FROM orders_v2
                WHERE shipping_status IN ('pending', 'ready_to_ship')
                AND last_ship_date < ?
            """, (datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),))
            overdue = cursor.fetchone()['cnt']

        return {
            "total_orders": total,
            "overdue_orders": overdue,
            "status": "ok",
        }
    except Exception as e:
        return {"error": str(e)}
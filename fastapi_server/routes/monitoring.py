"""
系统监控相关路由
GET /api/health        - 健康检查
GET /api/monitoring_logs
GET /api/monitoring/stream
"""
from fastapi import APIRouter, Depends
from ..db import get_db_connection

router = APIRouter(prefix="/api", tags=["监控"])


@router.get("/health")
async def health():
    """健康检查"""
    return {"status": "ok"}


@router.get("/monitoring_logs")
async def monitoring_logs():
    """监控日志"""
    from ..db import get_db_connection
    with get_db_connection() as conn:
        rows = conn.execute("""
            SELECT timestamp, level, message, store_id
            FROM monitoring_logs
            ORDER BY timestamp DESC
            LIMIT 100
        """).fetchall()
        return [dict(row) for row in rows]


@router.get("/monitoring/stream")
async def monitoring_stream():
    """监控流 - 返回最新日志统计"""
    from ..db import get_db_connection
    import time
    with get_db_connection() as conn:
        count = conn.execute("SELECT COUNT(*) as c FROM monitoring_logs").fetchone()
        return {"connected": True, "total": count["c"] if count else 0, "timestamp": int(time.time())}
"""
顶栏统计 API
GET /api/top-stats/today - 今日订单 + 今日 GMV（来自 daily_stats 表）

数据由 scripts/daily_stats.py 每天 9 点（crontab）写入。
如果今天还没生成（早于 9 点或 cron 没跑），返回 order_count=0, gmv_usd=0。
"""
from datetime import date
from fastapi import APIRouter

from ..db import get_db_connection

router = APIRouter(prefix="/api/top-stats", tags=["顶栏统计"])


@router.get("/today")
async def get_today_stats():
    """今日订单 / 今日 GMV（美元）/ 今日净利（人民币）"""
    today = date.today().strftime("%Y-%m-%d")
    with get_db_connection() as conn:
        row = conn.execute(
            "SELECT order_count, avg_order_value, gmv_usd, profit_rate, "
            "profit_per_order_cny, profit_cny, generated_at "
            "FROM daily_stats WHERE date = ?",
            (today,),
        ).fetchone()
    if not row:
        return {
            "date": today,
            "order_count": 0,
            "avg_order_value": 0.0,
            "gmv_usd": 0.0,
            "profit_rate": 0.0,
            "profit_per_order_cny": 0.0,
            "profit_cny": 0.0,
            "generated_today": False,
        }
    return {
        "date": today,
        "order_count": row["order_count"],
        "avg_order_value": row["avg_order_value"],
        "gmv_usd": row["gmv_usd"],
        "profit_rate": row["profit_rate"],
        "profit_per_order_cny": row["profit_per_order_cny"],
        "profit_cny": row["profit_cny"],
        "generated_at": row["generated_at"],
        "generated_today": True,
    }

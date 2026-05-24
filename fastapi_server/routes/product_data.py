"""
商品数据相关路由
GET /api/product_metrics    - 商品指标列表（含汇总）
GET /api/product_performance - 商品表现（含配件推荐）
GET /api/product_history     - 商品历史数据
GET /api/product_top         - 商品排行（曝光/销量/GMV）
"""
import sqlite3
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Query
from ..db import get_db_connection

router = APIRouter(prefix="/api", tags=["商品数据"])


# 全局站点名称映射
SITE_NAMES = {
    "MLM": "墨西哥 (MX)",
    "MCO": "哥伦比亚 (CO)",
    "MLA": "阿根廷 (AR)",
    "MLB": "巴西 (BR)",
    "CBT": "跨境 (CBT)",
}


@router.get("/product_metrics")
async def product_metrics(
    site: Optional[str] = Query(None, description="站点筛选，如 MLM/MCO/MLA/MLB/CBT"),
    status: Optional[str] = Query(None, description="状态筛选：active/under_review/closed"),
):
    """
    商品指标列表
    从 product_metrics 表查询，支持站点和状态筛选
    """
    with get_db_connection() as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # ---- 获取大姐店各站点账号状态 ----
        cursor.execute("""
            SELECT site_id, status, reputation_level,
                   complaints_rate, delayed_rate, cancellations_rate
            FROM stores WHERE group_label = '大姐店'
        """)
        store_rows = [dict(r) for r in cursor.fetchall()]

        def parse_rate(val) -> float:
            """解析带%的字符串，返回浮点数，无效返回0"""
            if not val:
                return 0.0
            s = str(val).strip().replace('%', '')
            try:
                return float(s)
            except ValueError:
                return 0.0

        def construct_status(row) -> str:
            """根据 reputation_level 和各指标构造账号健康状态"""
            if row.get('reputation_level') == 'suspended':
                return 'red'
            rate = max(
                parse_rate(row.get('complaints_rate')),
                parse_rate(row.get('delayed_rate')),
                parse_rate(row.get('cancellations_rate')),
            )
            if rate >= 7.14:
                return 'red'
            if rate >= 2.0:
                return 'yellow'
            return 'green'

        # 按站点聚合账号状态
        site_status_map: dict = {}
        for sr in store_rows:
            sid = sr['site_id']
            s = construct_status(sr)
            if sid not in site_status_map or (
                site_status_map[sid] == 'green' and s != 'green'
            ) or (
                site_status_map[sid] == 'yellow' and s == 'red'
            ):
                site_status_map[sid] = s

        is_suspended = any(v == 'red' for v in site_status_map.values())
        suspended_sites = [s for s, v in site_status_map.items() if v == 'red']
        suspended_display = ", ".join([SITE_NAMES.get(s, s) for s in suspended_sites])

        # 账号状态汇总（绿/黄/红各几个站）
        status_counts = {"green": 0, "yellow": 0, "red": 0}
        for v in site_status_map.values():
            status_counts[v] = status_counts.get(v, 0) + 1

        # 状态过滤逻辑
        if is_suspended:
            status_filter = "(status = 'active' OR status = 'closed' OR status = 'inactive')"
        else:
            if status:
                status_filter = f"status = '{status}'"
            else:
                status_filter = "(status = 'active' OR status = 'under_review' OR status = 'closed')"

        # 站点过滤
        if site and site != 'all':
            site_filter = f"site_id = '{site}'"
        else:
            site_filter = "1=1"

        # 大姐店全店汇总
        cursor.execute(f"""
            SELECT SUM(exposure) as exp, SUM(clicks) as clk, SUM(carts) as crt
            FROM product_metrics
            WHERE {site_filter} AND {status_filter}
            AND site_id IN (SELECT site_id FROM stores WHERE group_label = '大姐店')
            AND start_time IS NOT NULL AND start_time != 0
        """)
        summary_row = cursor.fetchone()

        exposure = summary_row['exp'] if summary_row and summary_row['exp'] else 0
        clicks = summary_row['clk'] if summary_row and summary_row['clk'] else 0
        carts = summary_row['crt'] if summary_row and summary_row['crt'] else 0

        summary = {
            "total_exposure": exposure,
            "total_clicks": clicks,
            "total_carts": carts,
            "account_status": "suspended" if is_suspended else "active",
            "site_status": site_status_map,
            "site_status_counts": status_counts,
            "suspended_sites": suspended_sites,
            "suspension_reason": f"账号在以下站点已暂停: {suspended_display}" if is_suspended else "",
        }

        # 获取商品列表
        cursor.execute(f"""
            SELECT * FROM product_metrics
            WHERE {site_filter} AND {status_filter}
            AND start_time IS NOT NULL AND start_time != 0
            ORDER BY is_core DESC, exposure DESC
            LIMIT 2000
        """)
        rows = [dict(r) for r in cursor.fetchall()]

        # 计算已上架天数
        now = datetime.now()
        for row in rows:
            st = row.get('start_time')
            if st:
                try:
                    dt_str = str(st).split('T')[0]
                    dt = datetime.strptime(dt_str, '%Y-%m-%d')
                    row['days_listed'] = (now - dt).days
                except Exception:
                    row['days_listed'] = 0
            else:
                row['days_listed'] = 0

        return {"items": rows, "summary": summary}


@router.get("/product_history")
async def product_history(
    item_id: str = Query(..., description="商品 item_id"),
    days: int = Query(15, description="历史天数，默认15天"),
):
    """
    商品历史数据（从 product_metrics_history 表）
    """
    with get_db_connection() as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute(
            "SELECT record_date, exposure, clicks, carts FROM product_metrics_history "
            "WHERE item_id = ? ORDER BY record_date ASC LIMIT ?",
            (item_id, days)
        )
        rows = [dict(r) for r in cursor.fetchall()]

        return {"item_id": item_id, "history": rows}


@router.get("/product_top")
async def product_top(
    metric: str = Query("exposure", description="排序指标：exposure/clicks/carts/sales"),
    limit: int = Query(10, ge=1, le=100, description="返回数量"),
    site: Optional[str] = Query(None, description="站点筛选"),
):
    """
    商品排行（按指定指标排序）
    """
    with get_db_connection() as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        allowed_metrics = ["exposure", "clicks", "carts", "sales", "health_score"]
        if metric not in allowed_metrics:
            metric = "exposure"

        site_filter = f"site_id = '{site}'" if site else "1=1"

        cursor.execute(
            f"SELECT item_id, name, {metric}, site_id, health_score, status "
            f"FROM product_metrics WHERE {site_filter} "
            f"ORDER BY {metric} DESC LIMIT ?",
            (limit,)
        )
        rows = [dict(r) for r in cursor.fetchall()]

        return {"metric": metric, "items": rows}
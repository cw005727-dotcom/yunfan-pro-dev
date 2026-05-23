"""
数据统计相关路由
GET /api/stats             - 全局统计数据
GET /api/stats_overview    - 数据概览（含趋势）
GET /api/conversion_stats  - 转化统计
"""
import sqlite3
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from ..db import get_db_connection

router = APIRouter(prefix="/api", tags=["统计"])


@router.get("/stats")
@router.get("/stats/orders", include_in_schema=False)  # alias
async def get_stats(
    shop: Optional[str] = Query(None, description="按店铺名称筛选"),
    group: Optional[str] = Query(None, description="按分组标签筛选"),
):
    """
    全局统计数据
    返回：总销售额、总订单数、每日预警等
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()

        # 构建 user_id 筛选条件
        where = ""
        params = []
        uids = []

        if group:
            cursor.execute("SELECT user_id FROM stores WHERE group_label = ?", (group,))
            uids = [str(r[0]) for r in cursor.fetchall() if r[0]]
            if uids:
                placeholders = ','.join(['?'] * len(uids))
                where = f" WHERE user_id IN ({placeholders})"
                params = uids
        elif shop:
            cursor.execute("SELECT user_id FROM stores WHERE nickname = ?", (shop,))
            row = cursor.fetchone()
            if row and row[0]:
                uids = [str(row[0])]
                where = " WHERE user_id = ?"
                params = uids

        # 1. 基础指标汇总
        cursor.execute(f"SELECT SUM(amount), COUNT(*) FROM orders_v2{where}", params)
        gmv_row = cursor.fetchone()
        gmv = gmv_row[0] or 0
        count = gmv_row[1] or 0

        # 2. 有效订单数（非取消/退款）
        cursor.execute(
            f"SELECT COUNT(*) FROM orders_v2{where} AND status NOT IN ('cancelled', 'refunded')" if where else
            f"SELECT COUNT(*) FROM orders_v2 WHERE status NOT IN ('cancelled', 'refunded')",
            params
        )
        valid_orders = cursor.fetchone()[0] or 0

        # 3. 平均客单价
        aov = round(gmv / count, 2) if count > 0 else 0

        # 4. 每日预警汇总
        alerts = {"complaints": 0, "violations": 0, "messages": 0}
        if uids:
            placeholders = ','.join(['?'] * len(uids))
            alert_sql = (
                f"SELECT SUM(complaint_count), SUM(violation_count), SUM(message_count) "
                f"FROM shop_alerts WHERE user_id IN ({placeholders}) AND date = date('now')"
            )
            cursor.execute(alert_sql, uids)
            alert_row = cursor.fetchone()
            if alert_row:
                alerts["complaints"] = alert_row[0] or 0
                alerts["violations"] = alert_row[1] or 0
                alerts["messages"] = alert_row[2] or 0

        return {
            "total_gmv": round(gmv, 2),
            "total_orders": count,
            "valid_orders": valid_orders,
            "aov": aov,
            "alerts": alerts["complaints"],
            "daily_alerts": alerts,
        }


@router.get("/stats_overview")
async def stats_overview(
    site: Optional[str] = Query(None, description="站点筛选，如 MLM/MCO/MLA/MLB/CBT"),
    group: Optional[str] = Query(None, description="分组标签筛选"),
    days: int = Query(30, description="统计天数"),
):
    """
    数据概览（含趋势对比）
    返回：核心指标、每日趋势、站点分布、商品排行
    """
    with get_db_connection() as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cutoff_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%S")

        where_clause = " WHERE order_date >= ?"
        params = [cutoff_date]

        uids = []
        if group:
            cursor.execute("SELECT user_id FROM stores WHERE group_label = ?", (group,))
            uids = [str(r[0]) for r in cursor.fetchall() if r[0]]
            if uids:
                where_clause += f" AND user_id IN ({','.join(['?']*len(uids))})"
                params.extend(uids)
        elif site and site != 'ALL':
            where_clause += " AND site_id = ?"
            params.append(site)

        # 当前周期数据
        cursor.execute(
            f"SELECT SUM(amount), SUM(quantity), COUNT(*) FROM orders_v2{where_clause}",
            params
        )
        res = cursor.fetchone()
        total_gmv = res[0] or 0
        total_units = res[1] or 0
        total_orders = res[2] or 0
        aov = round(total_gmv / total_orders, 2) if total_orders > 0 else 0

        # 上一周期数据（趋势计算）
        prev_cutoff = (datetime.now() - timedelta(days=days * 2)).strftime("%Y-%m-%dT%H:%M:%S")
        prev_where = " WHERE order_date >= ? AND order_date < ?"
        prev_params = [prev_cutoff, cutoff_date]
        if group and uids:
            prev_where += f" AND user_id IN ({','.join(['?']*len(uids))})"
            prev_params.extend(uids)
        elif site and site != 'ALL':
            prev_where += " AND site_id = ?"
            prev_params.append(site)

        cursor.execute(
            f"SELECT SUM(amount), SUM(quantity), COUNT(*) FROM orders_v2{prev_where}",
            prev_params
        )
        res_prev = cursor.fetchone()
        p_gmv = res_prev[0] or 0
        p_units = res_prev[1] or 0
        p_orders = res_prev[2] or 0

        def trend(current, prev):
            return round(((current - prev) / prev * 100), 1) if prev > 0 else 0.0

        metrics = {
            "total_gmv": round(total_gmv, 2),
            "total_units": total_units,
            "total_orders": total_orders,
            "aov": aov,
            "gmv_trend": trend(total_gmv, p_gmv),
            "units_trend": trend(total_units, p_units),
            "orders_trend": trend(total_orders, p_orders),
            "expected_payout": round(total_gmv * 0.85, 2),
            "actual_payout": round(total_gmv * 0.6, 2),
        }

        # 趋势图数据（每日聚合）
        trend_sql = (
            f"SELECT strftime('%Y-%m-%d', order_date) as day, "
            f"SUM(amount) as gmv, SUM(quantity) as units "
            f"FROM orders_v2{where_clause} GROUP BY day ORDER BY day ASC"
        )
        cursor.execute(trend_sql, params)
        trend_rows = {r['day']: r for r in cursor.fetchall()}

        trends = []
        for i in range(days):
            d_str = (datetime.now() - timedelta(days=days - 1 - i)).strftime("%Y-%m-%d")
            day_data = trend_rows.get(d_str, {"gmv": 0, "units": 0})
            trends.append({
                "date": d_str,
                "gmv": round(day_data['gmv'] or 0, 2),
                "units": day_data['units'] or 0,
            })

        # 站点分布
        dist_sql = (
            f"SELECT site_id, SUM(amount) as gmv "
            f"FROM orders_v2{where_clause} GROUP BY site_id"
        )
        cursor.execute(dist_sql, params)
        store_distribution = [
            {"name": r['site_id'], "gmv": round(r['gmv'] or 0, 2)}
            for r in cursor.fetchall()
        ]

        # 商品排行（基于真实订单）
        rank_sql = (
            f"SELECT product_name, SUM(amount) as gmv, SUM(quantity) as units "
            f"FROM orders_v2{where_clause} GROUP BY product_name"
        )

        # Top GMV
        cursor.execute(f"{rank_sql} ORDER BY gmv DESC LIMIT 5", params)
        top_gmv = [
            {"name": r['product_name'], "gmv": round(r['gmv'], 2), "image_url": None}
            for r in cursor.fetchall()
        ]

        # Top Units
        cursor.execute(f"{rank_sql} ORDER BY units DESC LIMIT 5", params)
        top_units = [
            {"name": r['product_name'], "units": r['units'], "image_url": None}
            for r in cursor.fetchall()
        ]

        # 补充图片
        for item in top_gmv + top_units:
            cursor.execute(
                "SELECT image_url FROM product_metrics WHERE name = ? LIMIT 1",
                (item['name'],)
            )
            img_row = cursor.fetchone()
            if img_row and img_row[0]:
                item['image_url'] = img_row[0]

        return {
            "metrics": metrics,
            "trends": trends,
            "store_distribution": store_distribution,
            "rankings": {"top_units": top_units, "top_gmv": top_gmv},
        }


@router.get("/conversion_stats")
async def conversion_stats(
    group: Optional[str] = Query(None, description="分组标签筛选"),
    days: int = Query(7, description="统计天数"),
):
    """
    转化统计
    从 product_metrics 汇总曝光→点击→加购→销售额转化漏斗
    """
    with get_db_connection() as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        where = ""
        params = []
        uids = []
        if group:
            cursor.execute("SELECT user_id FROM stores WHERE group_label = ?", (group,))
            uids = [str(r[0]) for r in cursor.fetchall() if r[0]]
            if uids:
                placeholders = ','.join(['?'] * len(uids))
                where = f" AND user_id IN ({placeholders})"
                params = uids

        # 从 product_metrics 汇总
        base_sql = f"SELECT SUM(exposure), SUM(clicks), SUM(carts) FROM product_metrics WHERE status = 'active'{where}"
        cursor.execute(base_sql, params)
        row = cursor.fetchone()

        exposure = row['SUM(exposure)'] or 0 if row else 0
        clicks = row['SUM(clicks)'] or 0 if row else 0
        carts = row['SUM(carts)'] or 0 if row else 0

        # 从 orders_v2 汇总销售额（近 N 天）
        cutoff_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%S")
        order_where = f" WHERE order_date >= ?{where}"
        order_params = [cutoff_date] + params

        cursor.execute(
            f"SELECT SUM(amount), COUNT(*) FROM orders_v2{order_where}",
            order_params
        )
        order_row = cursor.fetchone()
        gmv = order_row[0] or 0
        orders = order_row[1] or 0

        # 计算转化率
        ctr = round((clicks / exposure * 100), 2) if exposure > 0 else 0.0
        cart_rate = round((carts / clicks * 100), 2) if clicks > 0 else 0.0

        return {
            "exposure": int(exposure),
            "clicks": int(clicks),
            "carts": int(carts),
            "gmv": round(gmv, 2),
            "orders": orders,
            "ctr": ctr,
            "cart_rate": cart_rate,
            "period_days": days,
        }

@router.get("/changes")
def get_changes(
    change_type: str = Query(...),
    limit: int = Query(100, le=500),
):
    with get_db_connection() as conn:
        cur = conn.cursor()
        rows = cur.execute(
            "SELECT id, order_number, change_type, old_value, new_value, thumbnail, site, store_name, created_at "
            "FROM order_changes WHERE change_type = ? ORDER BY created_at DESC LIMIT ?",
            [change_type, limit]
        ).fetchall()
        return JSONResponse({"changes": [{"id":r[0],"order_number":r[1],"change_type":r[2],"old_value":r[3],"new_value":r[4],"thumbnail":r[5],"site":r[6],"store_name":r[7],"created_at":r[8]} for r in rows]})

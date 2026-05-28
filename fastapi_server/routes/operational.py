"""
运营数据 API — 来自 operational_orders 表（Excel导入）
"""
import sqlite3
import os
import re
from datetime import date
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from typing import Optional
from fastapi_server.config import DB_PATH

router = APIRouter(prefix="/api/operational", tags=["运营数据"])


def get_conn():
    return sqlite3.connect(DB_PATH, check_same_thread=False)


def dt(day):
    return day.replace('/', '-') if day else day


def extract_store_name(source):
    """
    从 source 列提取店铺名。
    格式示例：'美客多 张2店(巴西)' → '张2店'
    去掉'美客多 '前缀和'({国家})'后缀
    """
    if not source:
        return '未知'
    # 去掉前缀
    s = re.sub(r'^美客多\s*', '', source)
    # 去掉 ({国家}) 后缀
    s = re.sub(r'\([^)]*\)$', '', s)
    return s.strip() or '未知'


EXCLUDED_SALESPERSONS = {
    '1502886', '15028868888',
    'dc', 'DC', 'Dc',
    'yy', 'YY', 'Yy',
    '大川', 'yfkj1', 'YFkj1', 'yfkj',
    '',
}

def _is_excluded(sp):
    if not sp: return True
    s = sp.strip()
    if not s: return True
    if s in EXCLUDED_SALESPERSONS: return True
    if s.lower() in {'dc', 'yy'}: return True
    if s.startswith('150'): return True
    if s.lower().startswith('yfkj'): return True
    return False


def _exclude_clause():
    """返回排除测试账号的SQL条件（用于数据查询）"""
    parts = ["salesperson IS NULL OR salesperson = ''"]
    parts.append(f" salesperson NOT IN ({','.join('?' * len(EXCLUDED_SALESPERSONS))})")
    return " AND (" + " OR ".join(parts) + ")"

# 用于拼接参数的占位列表
_EXCLUDED_LIST = list(EXCLUDED_SALESPERSONS)


def base_where(salesperson, site, store_name, date_from, date_to):
    w, p = [], []
    if salesperson: w.append(" salesperson = ? "); p.append(salesperson)
    if site:        w.append(" site = ? ");        p.append(site)
    if store_name:
        w.append(" source LIKE ? "); p.append(f"%{store_name}%")
    if date_from:   w.append(" date(replace(order_date,'/','-')) >= ? "); p.append(dt(date_from))
    if date_to:     w.append(" date(replace(order_date,'/','-')) <= ? "); p.append(dt(date_to))
    # 全局排除测试/无效账号
    if not salesperson:
        w.append(_exclude_clause())
        p.extend(_EXCLUDED_LIST)
    wc = " AND ".join(w)
    return (" AND " + wc) if wc else "", p


def agg_filter(conn, where_sql, params):
    """统计主数据：排除 取消-发货前 + 取消-已取消 + 找货-没汇总"""
    cur = conn.cursor()
    exclude_sql = " AND status NOT IN ('取消-发货前','取消-已取消','找货-没汇总')"
    cur.execute(
        "SELECT COUNT(*), COALESCE(SUM(amount_usd),0), COALESCE(SUM(profit),0), "
        "COALESCE(SUM(purchase_cost),0) FROM operational_orders WHERE 1=1" + where_sql + exclude_sql,
        params
    )
    r = cur.fetchone()
    return {"count": r[0] or 0, "gmv": round(r[1] or 0, 2), "profit": round(r[2] or 0, 2), "purchase_cost": round(r[3] or 0, 2)}


def count_cancels(conn, where_sql, params):
    """统计取消数：发货前取消 = 取消-发货前 + 取消-已取消；发货后取消 = 取消-发货后"""
    cur = conn.cursor()
    rows = cur.execute(
        "SELECT status, COUNT(*) FROM operational_orders WHERE 1=1" + where_sql + " AND status LIKE '取消%' GROUP BY status",
        params
    ).fetchall()
    cancel_pre = cancel_post = 0
    for s, c in rows:
        if s in ('取消-发货前', '取消-已取消'):
            cancel_pre += c
        elif s == '取消-发货后':
            cancel_post += c
    return {"cancel_pre": cancel_pre, "cancel_post": cancel_post}


def margin(p, c):
    if not c or not p:
        return 0
    return round(p / c * 100, 2)


@router.get("/stats")
def get_stats(
    salesperson: Optional[str] = Query(None),
    site:        Optional[str] = Query(None),
    store_name:  Optional[str] = Query(None),
    date_from:   Optional[str] = Query(None),
    date_to:     Optional[str] = Query(None),
):
    conn = get_conn()
    today_str = date.today().strftime("%Y-%m-%d")
    month_start = date.today().replace(day=1).strftime("%Y-%m-%d")

    # 总计
    w, p = base_where(salesperson, site, store_name, date_from, date_to)
    total = agg_filter(conn, w, p)
    tc = count_cancels(conn, w, p)
    total.update(tc)

    # 本月（统计主数据时带日期条件，取消单独查）
    w2, p2 = base_where(salesperson, site, store_name, None, None)
    w2 += " AND date(replace(order_date,'/','-')) >= ?"
    p2m = p2 + [month_start]
    monthly = agg_filter(conn, w2, p2m)
    mc = count_cancels(conn, w2, p2 + [month_start])
    monthly.update(mc)

    # 今日
    w3, p3 = base_where(salesperson, site, store_name, None, None)
    w3 += " AND date(replace(order_date,'/','-')) = ?"
    p3d = p3 + [today_str]
    daily = agg_filter(conn, w3, p3d)
    dc = count_cancels(conn, w3, p3 + [today_str])
    daily.update(dc)

    conn.close()
    return JSONResponse({
        "total_orders": total["count"], "total_gmv": total["gmv"],
        "total_profit": total["profit"], "total_purchase_cost": total["purchase_cost"],
        "total_margin": margin(total["profit"], total["purchase_cost"]),
        "total_cancel_pre": total["cancel_pre"], "total_cancel_post": total["cancel_post"],
        "monthly_orders": monthly["count"], "monthly_gmv": monthly["gmv"],
        "monthly_profit": monthly["profit"], "monthly_purchase_cost": monthly["purchase_cost"],
        "monthly_margin": margin(monthly["profit"], monthly["purchase_cost"]),
        "monthly_cancel_pre": monthly["cancel_pre"], "monthly_cancel_post": monthly["cancel_post"],
        "today_orders": daily["count"], "today_gmv": daily["gmv"],
        "today_profit": daily["profit"], "today_purchase_cost": daily["purchase_cost"],
        "today_margin": margin(daily["profit"], daily["purchase_cost"]),
        "today_cancel_pre": daily["cancel_pre"], "today_cancel_post": daily["cancel_post"],
    })


@router.get("/daily")
def get_daily(
    salesperson: Optional[str] = Query(None),
    site:        Optional[str] = Query(None),
    store_name:  Optional[str] = Query(None),
    date_from:   Optional[str] = Query(None),
    date_to:     Optional[str] = Query(None),
):
    conn = get_conn()
    cur = conn.cursor()
    w, p = base_where(salesperson, site, store_name, date_from, date_to)
    w += " AND status NOT IN ('取消-发货前','取消-已取消','找货-没汇总')"
    sql = (
        "SELECT date(replace(order_date,'/','-')), COUNT(*), "
        "COALESCE(SUM(amount_usd),0), COALESCE(SUM(profit),0) "
        "FROM operational_orders WHERE 1=1" + w +
        " GROUP BY date(replace(order_date,'/','-')) ORDER BY date(replace(order_date,'/','-')) ASC"
    )
    cur.execute(sql, p)
    rows = cur.fetchall()
    conn.close()
    return JSONResponse({
        "daily": [
            {"date": r[0], "order_count": r[1], "gmv_usd": round(r[2], 2), "profit_cny": round(r[3], 2)}
            for r in rows
        ]
    })


@router.get("/stores")
def get_stores(
    salesperson: Optional[str] = Query(None),
    site:        Optional[str] = Query(None),
    store_name:  Optional[str] = Query(None),
    date_from:   Optional[str] = Query(None),
    date_to:     Optional[str] = Query(None),
):
    conn = get_conn()
    cur = conn.cursor()
    where, params = [], []
    if salesperson: where.append(" salesperson = ? ");  params.append(salesperson)
    if site:        where.append(" site = ? ");        params.append(site)
    if date_from:   where.append(" date(replace(order_date,'/','-')) >= ? "); params.append(dt(date_from))
    if date_to:     where.append(" date(replace(order_date,'/','-')) <= ? "); params.append(dt(date_to))
    where.append(" status NOT IN ('取消-发货前','取消-已取消','找货-没汇总') ")
    wc = (" AND " + " AND ".join(where)) if where else ""
    sql = (
        "SELECT COALESCE(salesperson,'未知'), COALESCE(site,'未知'), COALESCE(source,'未知'), "
        "COUNT(*), COALESCE(SUM(amount_usd),0), COALESCE(SUM(profit),0), COALESCE(SUM(purchase_cost),0) "
        "FROM operational_orders WHERE 1=1" + wc +
        " GROUP BY salesperson, site, source ORDER BY 5 DESC"
    )
    cur.execute(sql, params)
    rows = cur.fetchall()
    conn.close()
    return JSONResponse({
        "stores": [
            {"salesperson": r[0], "site": r[1], "store_name": extract_store_name(r[2]),
             "order_count": r[3], "gmv_usd": round(r[4], 2),
             "profit_cny": round(r[5], 2), "purchase_cost": round(r[6], 2)}
            for r in rows
        ]
    })


@router.get("/sites")
def get_sites():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT DISTINCT COALESCE(site,'未知') FROM operational_orders ORDER BY site")
    rows = cur.fetchall()
    conn.close()
    return JSONResponse({"sites": [r[0] for r in rows]})


@router.get("/store-names")
def get_store_names(site: Optional[str] = Query(None), salesperson: Optional[str] = Query(None)):
    conn = get_conn()
    cur = conn.cursor()
    w, p = [], []
    if site:        w.append(" site = ? ");        p.append(site)
    if salesperson: w.append(" salesperson = ? "); p.append(salesperson)
    wc = (" AND " + " AND ".join(w)) if w else ""
    cur.execute(
        "SELECT DISTINCT source FROM operational_orders WHERE 1=1" + wc,
        p
    )
    rows = cur.fetchall()
    conn.close()
    names = sorted(set(extract_store_name(r[0]) for r in rows if r[0]))
    return JSONResponse({"store_names": names})


@router.get("/salespersons")
def get_salespersons():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT DISTINCT salesperson FROM operational_orders WHERE salesperson IS NOT NULL AND salesperson != '' ORDER BY salesperson"
    )
    rows = cur.fetchall()
    conn.close()
    names = sorted(set(r[0] for r in rows if not _is_excluded(r[0])))
    return JSONResponse({"salespersons": names})

@router.get("/changes")
def get_changes(
    change_type: str = Query(..., description="profit 或 logistics"),
    limit: int = Query(100, le=500),
):
    conn = get_conn()
    cur = conn.cursor()
    rows = cur.execute(
        "SELECT id, order_number, change_type, old_value, new_value, thumbnail, site, store_name, created_at "
        "FROM order_changes WHERE change_type = ? ORDER BY created_at DESC LIMIT ?",
        [change_type, limit]
    ).fetchall()
    conn.close()
    return JSONResponse({"changes": [{"id":r[0],"order_number":r[1],"change_type":r[2],"old_value":r[3],"new_value":r[4],"thumbnail":r[5],"site":r[6],"store_name":r[7],"created_at":r[8]} for r in rows]})


@router.get("/logistics-stats")
def get_logistics_stats(
    date_from: Optional[str] = Query(None),
    date_to:   Optional[str] = Query(None),
):
    conn = get_conn()
    cur = conn.cursor()
    where, params = [], []
    if date_from: where.append(" date(replace(order_date,'/','-')) >= ? "); params.append(dt(date_from))
    if date_to:   where.append(" date(replace(order_date,'/','-')) <= ? "); params.append(dt(date_to))
    wc = (" AND " + " AND ".join(where)) if where else ""
    cur.execute(
        "SELECT COALESCE(logistics,'未知'), COUNT(*), "
        "COALESCE(SUM(amount_usd),0), COALESCE(SUM(profit),0) "
        "FROM operational_orders WHERE 1=1" + wc + " GROUP BY logistics ORDER BY 2 DESC",
        params
    )
    rows = cur.fetchall()
    conn.close()
    return JSONResponse({
        "logistics": [{"name": r[0] or "未知", "count": r[1], "gmv": round(r[2],2), "profit": round(r[3],2)} for r in rows],
        "total_orders": sum(r[1] for r in rows),
    })


@router.get("/logistics-list")
def get_logistics_list(
    date_from: Optional[str] = Query(None),
    date_to:   Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0, ge=0),
):
    conn = get_conn()
    cur = conn.cursor()
    where, params = [], []
    if date_from: where.append(" date(replace(order_date,'/','-')) >= ? "); params.append(dt(date_from))
    if date_to:   where.append(" date(replace(order_date,'/','-')) <= ? "); params.append(dt(date_to))
    wc = (" AND " + " AND ".join(where)) if where else ""
    cur.execute(
        "SELECT order_number, logistics, site, store_name, amount_usd, profit, status, "
        "waybill_no, tracking_no, carrier, buyer_name, city, created_at "
        "FROM operational_orders WHERE 1=1" + wc + " ORDER BY created_at DESC LIMIT ? OFFSET ?",
        params + [limit, offset]
    )
    rows = cur.fetchall()
    conn.close()
    return JSONResponse({"items": [{"order_number":r[0],"logistics":r[1] or "未知","site":r[2],"store_name":r[3],"amount_usd":r[4],"profit":r[5],"status":r[6],"waybill_no":r[7],"tracking_no":r[8],"carrier":r[9],"buyer_name":r[10],"city":r[11],"created_at":r[12]} for r in rows]})

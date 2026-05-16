from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import sqlite3
import os
from datetime import datetime

router = APIRouter(prefix="/api/research", tags=["选品研究"])

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "mercadolibre.db")


class ProductOut(BaseModel):
    id: int
    asin: str
    title: str
    price: float
    weight_g: Optional[float]
    monthly_sales: int
    review_count: int
    rating: float
    brand: Optional[str]
    node_name: str
    launch_date: Optional[str]
    thumbnail_url: Optional[str]
    product_url: Optional[str]
    status: str
    margin_rate: Optional[float]


class CategoryStats(BaseModel):
    node_name: str
    node_id: str
    total: int
    avg_sales: float
    avg_price: float
    avg_rating: float
    top_product: Optional[dict]


@router.get("/products", response_model=List[ProductOut])
def get_products(
    node_id: Optional[str] = None,
    status: Optional[str] = None,
    min_sales: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    limit: int = Query(default=50, le=200),
    offset: int = 0,
):
    """查询选品产品列表"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    where = ["1=1"]
    params = []

    if node_id:
        where.append("node_id = ?")
        params.append(node_id)
    if status:
        where.append("status = ?")
        params.append(status)
    if min_sales:
        where.append("monthly_sales >= ?")
        params.append(min_sales)
    if min_price:
        where.append("price >= ?")
        params.append(min_price)
    if max_price:
        where.append("price <= ?")
        params.append(max_price)

    query = f"""
        SELECT id, asin, title, price, weight_g, monthly_sales,
               review_count, rating, brand, node_name, launch_date,
               thumbnail_url, product_url, status, margin_rate
        FROM product_research
        WHERE {' AND '.join(where)}
        ORDER BY monthly_sales DESC
        LIMIT ? OFFSET ?
    """
    params.extend([limit, offset])

    rows = cur.execute(query, params).fetchall()
    conn.close()

    return [dict(r) for r in rows]


@router.get("/categories/stats", response_model=List[CategoryStats])
def get_category_stats():
    """各品类分析报告"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    rows = cur.execute("""
        SELECT node_id, node_name,
               COUNT(*) as total,
               ROUND(AVG(monthly_sales), 1) as avg_sales,
               ROUND(AVG(price), 2) as avg_price,
               ROUND(AVG(rating), 2) as avg_rating
        FROM product_research
        GROUP BY node_id, node_name
        ORDER BY total DESC
    """).fetchall()

    stats = []
    for r in rows:
        item = dict(r)
        # 获取品类销量最高的产品
        top = cur.execute("""
            SELECT title, price, monthly_sales, thumbnail_url
            FROM product_research
            WHERE node_id = ?
            ORDER BY monthly_sales DESC
            LIMIT 1
        """, (item['node_id'],)).fetchone()
        
        stats.append({
            "node_name": item['node_name'],
            "node_id": item['node_id'],
            "total": item['total'],
            "avg_sales": item['avg_sales'],
            "avg_price": item['avg_price'],
            "avg_rating": item['avg_rating'],
            "top_product": dict(top) if top else None,
        })

    conn.close()
    return stats


@router.post("/products/{product_id}/mark")
def mark_product(product_id: int, action: str = "favorite"):
    """标记产品（favorite/marked/ignore）"""
    valid_actions = ["favorite", "marked", "ignore", "pending"]
    if action not in valid_actions:
        raise HTTPException(400, f"action must be one of: {valid_actions}")

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cur.execute(
        "UPDATE product_research SET status=?, marked_at=? WHERE id=?",
        (action, now, product_id)
    )
    affected = cur.rowcount
    conn.commit()
    conn.close()

    if affected == 0:
        raise HTTPException(404, "Product not found")
    return {"ok": True, "action": action, "id": product_id}


@router.get("/products/{product_id}")
def get_product(product_id: int):
    """获取单个产品详情"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    row = cur.execute(
        "SELECT * FROM product_research WHERE id = ?", (product_id,)
    ).fetchone()
    conn.close()
    if not row:
        raise HTTPException(404, "Product not found")
    return dict(row)
"""
价格监控相关路由
GET  /api/price_check/list   - 价格检查队列列表
POST /api/price_check/add    - 添加价格检查商品
POST /api/price_check/delete - 删除价格检查商品
POST /api/price_check/calculate - 计算利润
GET  /api/trends             - 市场热词趋势
GET  /api/competitor_prices   - 竞品价格
"""
import json
import sqlite3
from typing import Optional

from fastapi import APIRouter, Query, Body
from pydantic import BaseModel
from ..db import get_db_connection

router = APIRouter(prefix="/api", tags=["价格"])

# 汇率配置（site → CNY 汇率）
FX_RATES = {
    "MLM": 0.42,   # MXN/CNY
    "MLB": 1.4,    # BRL/CNY
    "MLA": 0.008,  # ARS/CNY
    "MCO": 0.0018, # COP/CNY
    "MLC": 0.0017, # CLP/CNY
    "MLU": 0.00013 # UYU/CNY
}

# 佣金比例
COMM_RATES = {
    "MLM": 0.175,  # MLM CBT
    "MLB": 0.12,
    "MLA": 0.12,
    "MCO": 0.12,
    "MLC": 0.12,
    "MLU": 0.12
}

# 基础运费（本地货币）
BASE_SHIPPING = {
    "MLM": 150,
    "MLB": 45,
    "MLA": 15000,
    "MCO": 8000,
    "MLC": 500,
    "MLU": 600
}


# ─── Request / Response Models ────────────────────────────────────────

class PriceCheckAddPayload(BaseModel):
    source_platform: Optional[str] = None
    source_url: Optional[str] = None
    platform: Optional[str] = None
    url: Optional[str] = None
    id: Optional[str] = None
    title: Optional[str] = "Unknown Product"
    image_url: Optional[str] = None
    image: Optional[str] = None
    price_cny: Optional[float] = None
    price: Optional[float] = None
    weight_g: Optional[float] = None
    weight: Optional[float] = None
    target_site: Optional[str] = "MLM"
    price_tiers: Optional[list] = []


class PriceCheckDeletePayload(BaseModel):
    id: int


class PriceCheckCalculatePayload(BaseModel):
    cost_cny: Optional[float] = 0.0
    weight_g: Optional[float] = 0.0
    site: Optional[str] = "MLM"
    target_price_local: Optional[float] = 0.0
    quantity: Optional[int] = 1
    price_tiers: Optional[list] = []


# ─── Helper Functions ─────────────────────────────────────────────────

def get_float(val, default=0.0) -> float:
    """安全转 float"""
    try:
        return float(val) if val is not None else default
    except (ValueError, TypeError):
        return default


def guess_category(keyword: str) -> str:
    """根据关键词猜测商品类目"""
    kw = keyword.lower()
    if any(x in kw for x in ["audifono", "auricular", "headset", "earbud", "bocina", "parlante", "sony", "jbl", "jabra"]):
        return "🎧 电子音频"
    if any(x in kw for x in ["celular", "iphone", "samsung", "xiaomi", "funda", "case", "mica", "cargador", "cable"]):
        return "📱 手机配件"
    if any(x in kw for x in ["reloj", "smartwatch", "pulsera", "huawei", "fitbit"]):
        return "⌚ 智能穿戴"
    if any(x in kw for x in ["tenis", "zapato", "bota", "sandalia", "pantufla", "nike", "adidas", "puma"]):
        return "👟 鞋靴箱包"
    if any(x in kw for x in ["mochila", "bolso", "cartera", "maleta", "equipaje"]):
        return "🎒 箱包服饰"
    if any(x in kw for x in ["vestido", "ropa", "pantalon", "camisa", "playera", "short", "jeans"]):
        return "👗 流行服饰"
    if any(x in kw for x in ["proyector", "monitor", "teclado", "mouse", "laptop", "pc", "gaming", "razer"]):
        return "💻 电脑办公"
    if any(x in kw for x in ["lampara", "hogar", "cocina", "mueble", "decoracion", "jardin", "herramienta"]):
        return "🏠 家居生活"
    if any(x in kw for x in ["maquillaje", "belleza", "skincare", "crema", "perfume", "shampoo"]):
        return "💄 美妆个护"
    if any(x in kw for x in ["juguete", "lego", "figura", "juego", "nintendo", "xbox", "ps5"]):
        return "🎮 玩具电玩"
    return "📦 综合类目"


# ─── Endpoints ────────────────────────────────────────────────────────

@router.get("/price_check/list")
async def price_check_list(site: Optional[str] = Query(None, description="按 site_id 过滤")):
    """
    返回 price_check_queue 队列列表。
    来自旧端点 GET /api/price_check/list。
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if site:
            cursor.execute(
                "SELECT * FROM price_check_queue WHERE target_site = ? ORDER BY created_at DESC",
                (site,)
            )
        else:
            cursor.execute("SELECT * FROM price_check_queue ORDER BY created_at DESC")
        rows = [dict(r) for r in cursor.fetchall()]
    return rows


@router.post("/price_check/add")
async def price_check_add(payload: PriceCheckAddPayload = Body(...)):
    """
    向价格检查队列添加商品。
    来自旧端点 POST /api/price_check/add。
    """
    platform = payload.source_platform or payload.platform or 'Unknown'
    url = payload.source_url or payload.url or ''
    title = payload.title or 'Unknown Product'
    image = payload.image_url or payload.image or ''
    price = get_float(payload.price_cny or payload.price)
    weight = get_float(payload.weight_g or payload.weight)
    target_site = payload.target_site or 'MLM'
    price_tiers = json.dumps(payload.price_tiers or [])

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO price_check_queue
            (source_platform, source_url, source_id, title, image_url,
             price_cny, weight_g, target_site, price_tiers)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            platform, url,
            payload.id or '',
            title, image,
            price, weight,
            target_site, price_tiers
        ))
        conn.commit()

    return {"status": "success"}


@router.post("/price_check/delete")
async def price_check_delete(payload: PriceCheckDeletePayload = Body(...)):
    """
    从价格检查队列中删除商品。
    来自旧端点 POST /api/price_check/delete。
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM price_check_queue WHERE id = ?",
            (payload.id,)
        )
        conn.commit()

    return {"status": "success"}


@router.post("/price_check/calculate")
async def price_check_calculate(payload: PriceCheckCalculatePayload = Body(...)):
    """
    计算指定商品在目标站点的利润与利润率。

    参数：
    - cost_cny: 商品成本（人民币）
    - weight_g: 商品重量（克）
    - site: 目标站点代码（MLM/MLB/MLA/MCO/MLC/MLU）
    - target_price_local: 目标售价（本地货币）
    - quantity: 采购数量（用于阶梯价）
    - price_tiers: 阶梯价列表 [{"min": N, "price": P}, ...]
    """
    cost_cny = get_float(payload.cost_cny)
    weight_g = get_float(payload.weight_g)
    site = payload.site or "MLM"
    target_price_local = get_float(payload.target_price_local)
    quantity = payload.quantity or 1
    price_tiers = payload.price_tiers or []

    # 站点标准化
    site_map = {"MX": "MLM", "BR": "MLB", "CO": "MCO", "AR": "MLA"}
    site = site_map.get(site, site)

    # 阶梯价匹配
    if price_tiers:
        sorted_tiers = sorted(price_tiers, key=lambda x: x.get('min', 0), reverse=True)
        for tier in sorted_tiers:
            if quantity >= tier.get('min', 0):
                cost_cny = get_float(tier.get('price'), cost_cny)
                break

    # 汇率
    fx = FX_RATES.get(site, 0.4)

    # 佣金
    comm_rate = COMM_RATES.get(site, 0.12)
    comm = target_price_local * comm_rate

    # 运费（按重量递增）
    base_ship = BASE_SHIPPING.get(site, 150)
    shipping = base_ship * (weight_g / 500.0 if weight_g > 500 else 1.0)

    # 税费（增值税）
    tax_rate = 0.16 if site == "MLM" else 0.0
    tax = target_price_local * tax_rate

    # 利润计算
    revenue_cny = target_price_local * fx
    expenses_cny = cost_cny + (shipping + comm + tax) * fx
    net_profit_cny = revenue_cny - expenses_cny
    margin = round(net_profit_cny / revenue_cny * 100, 2) if revenue_cny > 0 else 0

    return {
        "revenue_cny": round(revenue_cny, 2),
        "expenses_cny": round(expenses_cny, 2),
        "net_profit_cny": round(net_profit_cny, 2),
        "margin": round(margin, 2),
        "details": {
            "commission_local": round(comm, 2),
            "shipping_local": round(shipping, 2),
            "tax_local": round(tax, 2),
            "site": site,
            "fx_rate": fx
        }
    }


@router.get("/trends")
async def trends(site: Optional[str] = Query(None, description="站点代码")):
    """
    返回市场热词趋势，优先从 hot_keywords 表读取实时数据，
    无数据时返回 guess_category 推断的保底数据。
    来自旧端点 GET /api/trends。
    """
    # 保底数据（fallback）
    fallback = {
        "rising": [
            {"keyword": k, "type": "rising", "category": guess_category(k), "source": "FALLBACK"}
            for k in ["Audífonos Bluetooth", "Smartwatch", "Tenis Jordan",
                      "Mochila Impermeable", "Cargador Rápido", "Case iPhone",
                      "Proyector Portátil", "Humidificador", "Mouse Gamer", "Teclado Mecánico"]
        ],
        "most_wanted": [
            {"keyword": k, "type": "most_wanted", "category": guess_category(k), "source": "FALLBACK"}
            for k in ["Vestidos Verano", "Lámpara Solar", "Organizador Maquillaje",
                      "Soporte Celular Auto", "Botella Motivacional", "Mini Ventilador",
                      "Brochas Maquillaje", "Reloj Hombre", "Gafas Sol", "Cámara Seguridad"]
        ],
        "popular": [
            {"keyword": k, "type": "popular", "category": guess_category(k), "source": "FALLBACK"}
            for k in ["Ropa", "Hogar", "Electrónica", "Deportes", "Belleza",
                      "Juguetes", "Herramientas", "Bebés", "Automotriz", "Papelería"]
        ]
    }

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            if site:
                cursor.execute("""
                    SELECT keyword, type, category, rank
                    FROM hot_keywords
                    WHERE site_id = ?
                    ORDER BY type, rank
                """, (site,))
            else:
                cursor.execute("""
                    SELECT keyword, type, category, rank
                    FROM hot_keywords
                    ORDER BY type, rank
                """)
            rows = cursor.fetchall()

            if rows:
                grouped = {"rising": [], "most_wanted": [], "popular": []}
                for kw, typ, cat, rank in rows:
                    if typ in grouped:
                        grouped[typ].append({
                            "keyword": kw,
                            "type": typ,
                            "category": cat or guess_category(kw),
                            "source": "REALTIME"
                        })
                return grouped
    except Exception:
        pass

    return fallback


@router.get("/competitor_prices")
async def competitor_prices(
    keyword: Optional[str] = Query(None, description="商品关键词"),
    site: Optional[str] = Query(None, description="站点代码")
):
    """
    从 product_metrics 表中查询竞品价格信息。
    来自旧端点 GET /api/competitor_prices。
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            if keyword and site:
                cursor.execute("""
                    SELECT name, price, sales, exposure,
                           health_score, site_id, image_url
                    FROM product_metrics
                    WHERE (name LIKE ? OR title LIKE ?) AND site_id = ?
                    ORDER BY exposure DESC
                    LIMIT 20
                """, (f"%{keyword}%", f"%{keyword}%", site))
            elif keyword:
                cursor.execute("""
                    SELECT name, price, sales, exposure,
                           health_score, site_id, image_url
                    FROM product_metrics
                    WHERE name LIKE ? OR title LIKE ?
                    ORDER BY exposure DESC
                    LIMIT 20
                """, (f"%{keyword}%", f"%{keyword}%"))
            elif site:
                cursor.execute("""
                    SELECT name, price, sales, exposure,
                           health_score, site_id, image_url
                    FROM product_metrics
                    WHERE site_id = ?
                    ORDER BY exposure DESC
                    LIMIT 20
                """, (site,))
            else:
                cursor.execute("""
                    SELECT name, price, sales, exposure,
                           health_score, site_id, image_url
                    FROM product_metrics
                    ORDER BY exposure DESC
                    LIMIT 20
                """)
            rows = [dict(r) for r in cursor.fetchall()]
        return rows
    except Exception as e:
        return {"error": str(e)}

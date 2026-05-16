"""亚马逊选品 API（SORFTime MCP 驱动）"""
import re, json, asyncio
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/amazon", tags=["amazon"])

MCP_KEY = "znfbzeq3wwfgahdzzeznmfhxtzljqt09"
MCP_URL = "https://mcp.sorftime.com"

CATEGORIES = {
    "automotive":      {"name": "汽车用品",      "node_id": "automotive",      "emoji": "🚗"},
    "baby-products":   {"name": "母婴",          "node_id": "baby-products",   "emoji": "👶"},
    "beauty":          {"name": "美妆个护",       "node_id": "beauty",          "emoji": "💄"},
    "electronics":     {"name": "电子数码",       "node_id": "electronics",     "emoji": "📱"},
    "home-garden":     {"name": "家居厨房",       "node_id": "home-garden",     "emoji": "🏠"},
    "kitchen":         {"name": "餐厨用品",       "node_id": "kitchen",         "emoji": "🍳"},
    "lawn-garden":     {"name": "园艺花园",       "node_id": "lawn-garden",     "emoji": "🌿"},
    "pet-supplies":    {"name": "宠物用品",       "node_id": "pet-supplies",    "emoji": "🐶"},
    "sporting-goods":  {"name": "运动户外",       "node_id": "sporting-goods",  "emoji": "⚽"},
    "hi":              {"name": "工具五金",        "node_id": "hi",              "emoji": "🔧"},
    "office-products": {"name": "办公文具",        "node_id": "office-products", "emoji": "📎"},
}

_SUBCAT_PARENT_MAP = {
    "15718271": "automotive", "15857511": "automotive", "15857501": "automotive",
    "15736321": "beauty", "346333011": "beauty",
    "524136": "electronics", "669973011": "electronics",
    "284507": "home-garden",
    "165796011": "kitchen", "165795011": "kitchen",
    "165793011": "lawn-garden", "165792011": "lawn-garden",
    "15710042011": "pet-supplies",
    "15711018011": "sporting-goods",
    "166830011": "office-products",
    "15708937011": "baby-products", "15708936011": "baby-products",
}

def _get_parent_cat(node_id):
    return _SUBCAT_PARENT_MAP.get(node_id)

def mcp_call(tool, args):
    import urllib.request
    payload = json.dumps({
        "jsonrpc": "2.0", "method": "tools/call",
        "params": {"name": tool, "arguments": args}, "id": 1
    }).encode()
    req = urllib.request.Request(
        MCP_URL + "?key=" + MCP_KEY, data=payload,
        headers={"Content-Type": "application/json"}, method="POST"
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        for line in resp.read().decode().split("\n"):
            if line.startswith("data: "):
                d = json.loads(line[6:])
                if d.get("isError"):
                    return json.dumps({"error": d.get("result", {}).get("content", [{"text": "err"}])[0].get("text", "")})
                return d.get("result", {}).get("content", [{}])[0].get("text", "{}")
    return "{}"

def _calc_listed_days(date_str):
    if not date_str or len(str(date_str)) < 4:
        return 999
    try:
        s = str(date_str).strip()
        if m := re.match(r"(\d{4})-(\d{1,2})-(\d{1,2})", s):
            dt = datetime(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        elif m := re.match(r"(\d{1,2})/(\d{1,2})/(\d{4})", s):
            dt = datetime(int(m.group(3)), int(m.group(1)), int(m.group(2)))
        elif m := re.match(r"(\d{1,2})-(\w{3})-(\d{2})", s):
            mo = {"Jan":1,"Feb":2,"Mar":3,"Apr":4,"May":5,"Jun":6,"Jul":7,"Aug":8,"Sep":9,"Oct":10,"Nov":11,"Dec":12}
            dt = datetime(2000 + int(m.group(3)), mo.get(m.group(2), 1), int(m.group(1)))
        else:
            return 999
        return (datetime.now() - dt).days
    except:
        return 999

def parse_dimensions(s):
    if not s:
        return None
    m = re.search(r"(\d+\.?\d*)\s*[xX*]+\s*(\d+\.?\d*)\s*[xX*]+\s*(\d+\.?\d*)", str(s), re.I)
    if m:
        v = [float(m.group(i)) for i in (1, 2, 3)]
        vol = v[0] * v[1] * v[2]
        return {"d1": round(v[0], 1), "d2": round(v[1], 1), "d3": round(v[2], 1), "volume": round(vol, 1)}
    return None

def normalize_product(p, site):
    title = p.get("title") or p.get("product_name") or ""
    raw_date = p.get("date") or p.get("listed_date") or p.get("input_date") or ""
    sales_str = str(p.get("sales", "") or p.get("月销量", "") or "0").replace(",", "").replace("万", "0000")
    try: sales = int(float(sales_str))
    except: sales = 0
    rating_str = str(p.get("rating", "") or p.get("评分", "") or "0").replace("★", "").replace("stars", "").strip()
    try: rating = float(rating_str)
    except: rating = 0.0
    reviews_str = str(p.get("reviews", "") or p.get("评论数", "") or "0").replace(",", "")
    try: reviews = int(float(reviews_str))
    except: reviews = 0
    price_str = str(p.get("price") or p.get("buyBoxPrice") or p.get("价格") or "0").replace("$", "").replace(" ", "")
    try: price = float(re.sub(r"[^\d.]", "", price_str))
    except: price = 0.0
    dims = parse_dimensions(p.get("product_dimensions") or p.get("item_package_dimensions") or "")
    return {
        "asin": p.get("asin") or p.get("Asin") or p.get("id") or "",
        "title": title,
        "brand": p.get("brand") or p.get("品牌") or "",
        "price": price,
        "sales": sales,
        "rating": rating,
        "reviews": reviews,
        "listed_days": _calc_listed_days(raw_date),
        "volume": dims["volume"] if dims else None,
        "dimensions": dims,
        "fulfillment": p.get("fulfillment") or p.get("fulfillment_type") or "FBM",
        "thumbnail": p.get("thumbnail") or p.get("img_url") or p.get("image") or "",
    }

class HotReq(BaseModel):
    site: str = "US"
    node_ids: Optional[list] = None
    min_sales: int = 0
    min_rating: float = 0.0
    max_listed_days: Optional[int] = None

class NewReq(BaseModel):
    site: str = "US"
    node_id: str = "beauty"
    max_listed_days: Optional[int] = None

@router.get("/categories")
def list_categories():
    return [{"id": k, "name": v["name"], "emoji": v["emoji"]} for k, v in CATEGORIES.items()]

@router.post("/hot")
def pull_hot_products(req: HotReq):
    if req.site not in ("US", "MX", "BR"):
        raise HTTPException(400, "站点仅支持 US/MX/BR")
    node_ids = req.node_ids if req.node_ids else list(CATEGORIES.keys())
    all_products = []
    errors = []
    for node_id in node_ids:
        if node_id in CATEGORIES:
            api_node_id = CATEGORIES[node_id]["node_id"]
        elif node_id.isdigit() and node_id not in ("beauty","automotive","electronics","home-garden","kitchen","lawn-garden","pet-supplies","sporting-goods","baby-products","office-products","hi"):
            api_node_id = _get_parent_cat(node_id) or node_id
        else:
            api_node_id = node_id
        raw = mcp_call("category_report", {"amzSite": req.site, "nodeId": api_node_id})
        try:
            data = json.loads(raw) if isinstance(raw, str) else raw
        except:
            data = {}
        products = data.get("Top100产品", [])
        for p in products:
            norm = normalize_product(p, req.site)
            parent_cat_id = api_node_id if api_node_id in CATEGORIES else node_id
            norm["category_id"] = node_id
            norm["category_name"] = CATEGORIES.get(parent_cat_id, CATEGORIES.get(api_node_id, {})).get("name", api_node_id)
            if norm["sales"] < req.min_sales: continue
            if norm["rating"] < req.min_rating: continue
            if req.max_listed_days is not None and norm["listed_days"] > req.max_listed_days: continue
            all_products.append(norm)
    return {"products": all_products, "total": len(all_products), "errors": errors}

@router.post("/new")
def pull_new_products(req: NewReq):
    if req.site not in ("US", "MX", "BR"):
        raise HTTPException(400, "站点仅支持 US/MX/BR")
    api_node = CATEGORIES.get(req.node_id, {}).get("node_id", req.node_id)
    raw = mcp_call("potential_product", {"amzSite": req.site, "nodeId": api_node})
    try:
        data = json.loads(raw) if isinstance(raw, str) else raw
    except:
        data = {}
    products = data.get("潜在新品", []) or data.get("潜在产品", []) or data.get("products", [])
    result = []
    for p in products:
        norm = normalize_product(p, req.site)
        norm["category_id"] = req.node_id
        norm["category_name"] = CATEGORIES.get(req.node_id, {}).get("name", req.node_id)
        norm["potential_index"] = p.get("potential_index") or p.get("潜力指数") or 0
        if req.max_listed_days is not None and norm["listed_days"] > req.max_listed_days:
            continue
        result.append(norm)
    return {"products": result, "total": len(result)}
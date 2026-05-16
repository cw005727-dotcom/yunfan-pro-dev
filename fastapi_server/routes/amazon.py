"""亚马逊选品 API（SORFTime MCP 驱动）
新工具（2026-05 验证）：
  - category_report:  类目畅销榜（支持US/GB/DE/FR/IN/CA/JP/ES/IT/MX/BR/AE/AU/SA）
  - potential_product: 潜力产品（仅 US/GB/DE，BR会报错）
  - product_search:    搜索+潜力排序（支持 MX/BR）
  - category_tree:    类目树结构（各站点独立）
"""
import re, json
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/amazon", tags=["amazon"])

MCP_KEY = "znfbzeq3wwfgahdzzeznmfhxtzljqt09"
MCP_URL = "https://mcp.sorftime.com"

# ── MCP 调用（新增 User-Agent header，修复 406）───────────────────────────
def mcp_call(tool, args):
    import urllib.request
    payload = json.dumps({
        "jsonrpc": "2.0", "method": "tools/call",
        "params": {"name": tool, "arguments": args}, "id": 1
    }).encode()
    req = urllib.request.Request(
        MCP_URL + "?key=" + MCP_KEY, data=payload,
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
            "User-Agent": "Mozilla/5.0",
        },
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=45) as resp:
        for line in resp.read().decode().split("\n"):
            if line.startswith("data: "):
                d = json.loads(line[6:])
                if d.get("isError"):
                    return json.dumps({
                        "error": d.get("result", {}).get("content", [{"text": "err"}])[0].get("text", "")
                    })
                return d.get("result", {}).get("content", [{}])[0].get("text", "{}")
    return "{}"

# ── 类目树缓存（按站点缓存）───────────────────────────────────────────────
_CATEGORY_TREE_CACHE = {}  # { site: [ {nodeId, 类目名称, 子类:[...]} ] }
_CATEGORY_FLAT_CACHE = {}  # { site: {node_id: {name, emoji}} }  扁平化

def _load_category_tree(site: str) -> list:
    """从 SORFTime 加载类目树，缓存结果"""
    if site in _CATEGORY_TREE_CACHE:
        return _CATEGORY_TREE_CACHE[site]
    raw = mcp_call("category_tree", {"amzSite": site})
    try:
        tree = json.loads(raw) if isinstance(raw, str) else raw
    except Exception:
        tree = []
    _CATEGORY_TREE_CACHE[site] = tree

    # 扁平化：nodeId → {name, emoji}
    flat = {}

    def walk(nodes, parent_emoji="📦"):
        for node in nodes:
            cat_name = node.get("类目名称", "")
            node_id = node.get("nodeId", "")
            # 根据类目名给 emoji
            emoji = "📦"
            if any(kw in cat_name for kw in ["电子", "Celular", "Computador", "Phone", "Electronics"]): emoji = "📱"
            elif any(kw in cat_name for kw in ["美妆", "Beleza", "Beauty", "Cosmét"]): emoji = "💄"
            elif any(kw in cat_name for kw in ["母婴", "Bebê", "Baby", "Crianças"]): emoji = "👶"
            elif any(kw in cat_name for kw in ["家居", "Casa", "Home", "Kitchen", "Cozinha"]): emoji = "🏠"
            elif any(kw in cat_name for kw in ["汽车", "Auto", "Veículos"]): emoji = "🚗"
            elif any(kw in cat_name for kw in ["运动", "Sport", "Esporte"]): emoji = "⚽"
            elif any(kw in cat_name for kw in ["宠物", "Pet", "Animal"]): emoji = "🐶"
            elif any(kw in cat_name for kw in ["玩具", "Toy", "Brinquedo"]): emoji = "🎮"
            elif any(kw in cat_name for kw in ["服装", "Sapat", "Clothing", "Roupa", "Shoe"]): emoji = "👕"
            elif any(kw in cat_name for kw in ["食品", "Food", "Alimento", "Grocery"]): emoji = "🍎"
            elif any(kw in cat_name for kw in ["图书", "Book", "Livro"]): emoji = "📚"
            elif any(kw in cat_name for kw in ["健康", "Health", "Saúde"]): emoji = "💊"
            flat[node_id] = {"name": cat_name, "emoji": emoji}
            if node.get("子类"):
                walk(node["子类"], emoji)
    walk(tree)
    _CATEGORY_FLAT_CACHE[site] = flat
    return tree

def _get_category_info(site: str, node_id: str):
    """返回 {name, emoji}，未知类目返回 nodeId 本身"""
    if site not in _CATEGORY_FLAT_CACHE:
        _load_category_tree(site)
    info = _CATEGORY_FLAT_CACHE[site].get(node_id, {})
    return {
        "name": info.get("name", node_id),
        "emoji": info.get("emoji", "📦"),
    }

def _list_all_node_ids(site: str) -> list:
    """返回该站点所有类目 nodeId（扁平列表）"""
    if site not in _CATEGORY_FLAT_CACHE:
        _load_category_tree(site)
    return list(_CATEGORY_FLAT_CACHE[site].keys())

# ── 辅助函数─────────────────────────────────────────────────────────────
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
    except Exception:
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

def normalize_product(p: dict, site: str) -> dict:
    """统一字段映射，处理中文API字段名"""
    # 月销量：可能是字符串"5137"或数字5137
    sales_raw = p.get("sales") or p.get("月销量") or p.get("月销量") or 0
    sales_str = str(sales_raw).replace(",", "").replace("万", "0000")
    try: sales = int(float(sales_str))
    except: sales = 0

    # 评分
    rating_raw = str(p.get("rating") or p.get("星级") or "0").replace("★", "").replace("stars", "").strip()
    try: rating = float(rating_raw)
    except: rating = 0.0

    # 评论数
    reviews_raw = str(p.get("reviews") or p.get("评论数") or "0").replace(",", "")
    try: reviews = int(float(reviews_raw))
    except: reviews = 0

    # 价格
    price_raw = str(p.get("price") or p.get("buyBoxPrice") or p.get("价格") or "0").replace("$", "").replace(" ", "")
    try: price = float(re.sub(r"[^\d.]", "", price_raw))
    except: price = 0.0

    # 上架日期
    raw_date = (
        p.get("date") or p.get("listed_date") or p.get("上架日期") or
        p.get("input_date") or p.get("上架时间") or ""
    )
    listed_days = _calc_listed_days(raw_date)

    # 尺寸
    dims_src = p.get("product_dimensions") or p.get("item_package_dimensions") or p.get("外包装尺寸") or ""
    dims = parse_dimensions(dims_src)

    # ASIN（各种可能的字段名）
    asin = (
        p.get("asin") or p.get("Asin") or p.get("ASIN") or
        p.get("产品ASIN码") or p.get("parent_asin") or p.get("父级ASIN码") or
        p.get("id") or ""
    )

    # 图片
    thumbnail = (
        p.get("thumbnail") or p.get("img_url") or p.get("image") or
        p.get("主图") or ""
    )
    # 如果 thumbnail 是完整 URL 则不处理，如果不是则保持原样
    if thumbnail and not thumbnail.startswith("http"):
        thumbnail = ""

    # FBA/FBM
    fulfillment = p.get("fulfillment") or p.get("fulfillment_type") or p.get("发货方式") or "FBM"

    return {
        "asin": str(asin),
        "title": p.get("title") or p.get("标题") or p.get("product_name") or "",
        "brand": p.get("brand") or p.get("品牌") or "",
        "price": price,
        "sales": sales,
        "rating": rating,
        "reviews": reviews,
        "listed_days": listed_days,
        "volume": dims["volume"] if dims else None,
        "dimensions": dims,
        "fulfillment": fulfillment,
        "thumbnail": thumbnail,
    }

# ── 请求模型─────────────────────────────────────────────────────────────
class HotReq(BaseModel):
    site: str = "US"
    node_ids: Optional[list] = None   # 类目 nodeId 列表，不传则全量
    min_sales: int = 0
    min_rating: float = 0.0
    max_listed_days: Optional[int] = None

class NewReq(BaseModel):
    site: str = "US"
    node_id: str = ""
    search: Optional[str] = None       # optional keyword filter
    page: int = 1
    max_listed_days: Optional[int] = None

# ── 路由─────────────────────────────────────────────────────────────────
@router.get("/categories")
def list_categories():
    """返回前端类目选择列表，按站点动态加载"""
    site = "US"  # 默认展示美国类目树，前端可按需切换
    try:
        tree = _load_category_tree(site)
    except Exception:
        tree = []
    result = []
    for node in tree:
        info = _get_category_info(site, node.get("nodeId", ""))
        result.append({
            "id": node.get("nodeId", ""),
            "name": info.get("name", node.get("类目名称", "")),
            "emoji": info.get("emoji", "📦"),
        })
    return result

@router.get("/categories/{site}")
def list_categories_by_site(site: str):
    """返回指定站点的完整类目树（含子类）"""
    try:
        tree = _load_category_tree(site.upper())
    except Exception as e:
        raise HTTPException(500, f"加载类目树失败: {e}")
    return tree

@router.get("/sites")
def list_sites():
    """返回支持的站点列表"""
    return [
        {"id": "US", "name": "🇺🇸 美国", "flag": "US"},
        {"id": "MX", "name": "🇲🇽 墨西哥", "flag": "MX"},
        {"id": "BR", "name": "🇧🇷 巴西", "flag": "BR"},
    ]

@router.post("/hot")
def pull_hot_products(req: HotReq):
    """
    类目畅销榜（Bestsellers），支持 US/MX/BR。
    调用 category_report，nodeId 支持站点本地类目ID。
    """
    site = req.site.upper()
    if site not in ("US", "MX", "BR"):
        raise HTTPException(400, "站点仅支持 US / MX / BR")

    # 如果没指定 node_ids，取该站点所有类目（最多取前10个避免超时）
    if not req.node_ids:
        all_ids = _list_all_node_ids(site)
        req.node_ids = all_ids[:10]

    all_products = []
    errors = []

    for node_id in req.node_ids:
        raw = mcp_call("category_report", {"amzSite": site, "nodeId": node_id})
        try:
            data = json.loads(raw) if isinstance(raw, str) else raw
        except Exception:
            data = {}
        products = data.get("Top100产品", [])

        cat_info = _get_category_info(site, node_id)
        for p in products:
            norm = normalize_product(p, site)
            norm["category_id"] = node_id
            norm["category_name"] = cat_info["name"]
            # 过滤
            if norm["sales"] < req.min_sales:
                continue
            if norm["rating"] < req.min_rating:
                continue
            if req.max_listed_days is not None and norm["listed_days"] > req.max_listed_days:
                continue
            all_products.append(norm)

    return {"products": all_products, "total": len(all_products), "errors": errors}

@router.post("/potential")
def pull_potential_products(req: NewReq):
    """
    潜力产品模式。
    - US/GB/DE: 用 potential_product（最准确）
    - MX/BR: 用 product_search + sortby_potential_index=True（BR potential_product 有bug）
    """
    site = req.site.upper()
    if site not in ("US", "MX", "BR"):
        raise HTTPException(400, "站点仅支持 US / MX / BR")

    products = []

    if site == "US":
        # potential_product 对 US 有效
        args = {"amzSite": site, "page": req.page}
        if req.search:
            args["searchName"] = req.search
        raw = mcp_call("potential_product", args)
        try:
            data = json.loads(raw) if isinstance(raw, str) else raw
        except Exception:
            data = []
        if isinstance(data, dict) and "error" in data:
            errors = [data["error"]]
            products = []
        else:
            products = data if isinstance(data, list) else []
            errors = []
    else:
        # MX / BR: 用 product_search + sortby_potential_index
        args = {
            "amzSite": site,
            "sortby_potential_index": True,
            "page": req.page,
        }
        if req.search:
            args["searchName"] = req.search
        raw = mcp_call("product_search", args)
        try:
            data = json.loads(raw) if isinstance(raw, str) else raw
        except Exception:
            data = []
        products = data if isinstance(data, list) else []
        errors = []

    result = []
    for p in products:
        norm = normalize_product(p, site)
        # 产品潜力指数
        norm["potential_index"] = (
            p.get("potential_index") or p.get("产品潜力指数") or 0
        )
        # 所属类目（中文字段）
        big_cat = p.get("所属大类", "")
        sub_cat = p.get("所属细分类目", "")
        norm["big_category"] = big_cat
        norm["sub_category"] = sub_cat
        # 卖家国籍
        norm["seller_country"] = p.get("卖家国籍", "")
        # FBA费用
        norm["fba_fee"] = p.get("FBA费用", 0)
        # 重量
        weight_raw = p.get("重量", 0)
        try: norm["weight"] = float(weight_raw)
        except: norm["weight"] = 0

        if req.max_listed_days is not None and norm["listed_days"] > req.max_listed_days:
            continue
        result.append(norm)

    return {"products": result, "total": len(result), "errors": errors}
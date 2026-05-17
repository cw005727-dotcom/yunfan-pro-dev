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
_CATEGORY_SUBS_CACHE = {}  # { site: {top_id: [sub_id, ...]} }  顶级→子类映射

# ── 类目中文翻译映射─────────────────────────────────────────────────────
_BR_CATEGORIES = {
    "grocery": "食品饮料",
    "automotive": "汽车用品",
    "baby-products": "母婴用品",
    "beauty": "美妆护肤",
    "toys": "玩具游戏",
    "home": "家居家装",
    "computers": "电脑办公",
    "kitchen": "厨房餐饮",
    "appliances": "大小家电",
    "electronics": "消费电子",
    "sports": "体育用品",
    "hi": "五金工具",
    "musical-instruments": "乐器演奏",
    "lawn-and-garden": "园艺庭院",
    "fashion": "时尚服饰",
    "furniture": "家具家居",
    "office": "办公文具",
    "pet-products": "宠物用品",
    "hpc": "健康个护",
    # BR 子类
    "19778004011": "罐头包装食品",
    "19778021011": "新鲜冷藏食品",
    "19778003011": "酒精饮料",
    "19778001011": "咖啡茶饮",
    "19778014011": "肉禽野味",
    "118520415011": "早餐麦片",
    "19778010011": "礼品美食篮",
    "19778000011": "婴儿辅食",
    "19778009011": "冷冻食品",
    "19778011011": "香草调料",
    "19778013011": "果酱蜂蜜",
    "19778008011": "干粮米面",
    "19778018011": "生鲜果蔬",
    "19778006011": "烘焙食材",
    "19778012011": "自酿原料",
    "19778022011": "零食甜点",
    "19778007011": "奶制品蛋类",
    "19778019011": "调味酱料",
    "19778002011": "面包糕点",
    "19778016011": "鱼虾海鲜",
    "19778020011": "熟食奶酪肉制品",
    "19778015011": "素食替代品",
    "19778017011": "油醋汁",
    "19701930011": "汽车护理",
    "19702047011": "车载导航",
    "19701949011": "汽车电子",
    "19702094011": "汽车工具",
    "19701558011": "汽车配件",
    "17540055011": "辅食喂养",
    "17540057011": "婴儿玩乐",
    "17540060011": "洗护尿布",
    "17681968011": "婴儿服饰",
    "16754344011": "身体护理",
    "16754346011": "护发美发",
    "16754350011": "彩妆美甲",
    "16754345011": "护肤保养",
    "16754347011": "香水香氛",
    "16746738011": "积木拼装",
    "16746739011": "婴儿玩具",
    "16746749011": "桌游卡牌",
    "17100528011": "浴室用品",
    "17100532011": "床上用品",
    "17124719011": "空气净化",
    "17406462011": "灯具照明",
    "17100533011": "收纳储物",
    "17124724011": "清洁用品",
    "16364748011": "电脑配件",
    "16364755011": "笔记本电脑",
    "16364762011": "平板电脑",
    "16243803011": "手机通讯",
    "16243809011": "电视音响",
    "17833917011": "健身器材",
    "17833929011": "跑步运动",
    "19335818011": "园林工具",
    "19335825011": "泳池水疗",
    "17113547011": "电动工具",
    "20972461011": "乐器配件",
    "17681967011": "箱包皮具",
    "17100554011": "客厅家具",
    "17100547011": "卧室家具",
    "17095636011": "美术手工",
    "17095643011": "书写修正",
    "19653951011": "狗粮狗用品",
    "19653950011": "猫粮猫用品",
    "16769353011": "膳食营养",
    "16769355011": "口腔护理",
    "16769375011": "维矿补剂",
    "16769357011": "医疗药品",
    "18364161011": "家用医疗器械",
    # 通用/其他子类（补充常见项）
    "121856382011": "户外运动",
    "17681969011": "女装",
    "17681970011": "男装",
}

_MX_CATEGORIES = {
    "grocery": "食品饮料",
    "automotive": "汽车用品",
    "baby-products": "母婴用品",
    "beauty": "美妆护肤",
    "toys": "玩具游戏",
    "home": "家居家装",
    "computers": "电脑办公",
    "kitchen": "厨房餐饮",
    "appliances": "大小家电",
    "electronics": "消费电子",
    "sports": "体育用品",
    "hi": "五金工具",
    "musical-instruments": "乐器演奏",
    "lawn-and-garden": "园艺庭院",
    "fashion": "时尚服饰",
    "furniture": "家具家居",
    "office-products": "办公文具",
    "pet-supplies": "宠物用品",
    "hpc": "健康个护",
    "video-games": "电子游戏",
    # MX 子类
    "17724549011": "油醋调味",
    "17724559011": "零食甜点",
    "17724598011": "咖啡茶饮",
    "122426689011": "新鲜食品",
    "14129383011": "婴儿食品",
    "17724630011": "酒类饮品",
    "122426687011": "冷冻食品",
    "17724670011": "香草调料",
    "18234326011": "烘焙糕点",
    "17724730011": "酱料调味",
    "17861876011": "奶制品蛋类",
    "16364748011": "电脑配件",
    "16364755011": "笔记本电脑",
    "16364762011": "平板电脑",
    "16243803011": "手机通讯",
    "16243809011": "电视音响",
    "16754344011": "身体护理",
    "16754345011": "护肤保养",
    "16754347011": "香水香氛",
    "17540060011": "洗护尿布",
    "17681968011": "婴儿服装",
    "16746733011": "早教玩具",
    "16746738011": "积木拼装",
    "16746749011": "桌游卡牌",
    "17124719011": "空气净化",
    "17124724011": "清洁用品",
    "17100528011": "浴室用品",
    "17100532011": "床上用品",
    "17833917011": "健身器材",
    "19335818011": "园艺工具",
    "17681969011": "女装",
    "17681970011": "男装",
    "17095636011": "美术手工",
    "17095643011": "书写修正",
}

_US_CATEGORIES = {
    "amazon-devices": "亚马逊设备",
    "appliances": "大小家电",
    "arts-crafts": "艺术手工",
    "automotive": "汽车用品",
    "baby-products": "母婴用品",
    "beauty": "美妆护肤",
    "books": "图书音像",
    "camera-products": "摄影摄像",
    "electronics": "消费电子",
    "fashion": "时尚服饰",
    "fashion-womens": "女装",
    "fashion-mens": "男装",
    "fashion-girls": "女童装",
    "fashion-boys": "男童装",
    "fashion-luggage": "箱包皮具",
    "grocery": "食品饮料",
    "home-garden": "家居园艺",
    "industrial": "工业用品",
    "digital-music": "数字音乐",
    "kindle": "电子书设备",
    "movies-tv": "电影电视",
    "music": "音乐唱片",
    "musical-instruments": "乐器演奏",
    "office-products": "办公文具",
    "pet-supplies": "宠物用品",
    "software": "软件游戏",
    "sports": "体育用品",
    "tools": "工具家居",
    "toys-games": "玩具游戏",
    "video-games": "电子游戏",
    "computers": "电脑办公",
    "gift-cards": "礼品卡",
}

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

    # 建立顶级→子类映射（用于自动展开）
    subs_map = {}
    for node in tree:
        top_id = node.get("nodeId", "")
        subs_map[top_id] = [
            sub.get("nodeId", "") for sub in node.get("子类", []) if sub.get("nodeId")
        ]
    _CATEGORY_SUBS_CACHE[site] = subs_map

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
    # 优先用翻译，否则用原始名
    name = info.get("name", "")
    cn = _translate_cat(site, node_id) or name
    return {
        "name": cn if cn else node_id,
        "emoji": info.get("emoji", "📦"),
    }

def _translate_cat(site: str, node_id: str) -> str:
    """查询类目中文翻译（BR/MX 返回翻译，US 返回英文原文的中文对照）"""
    if site == "BR":
        return _BR_CATEGORIES.get(node_id, "")
    elif site == "MX":
        return _MX_CATEGORIES.get(node_id, "")
    elif site == "US":
        return _US_CATEGORIES.get(node_id, "")
    return ""

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

    # 图片：优先用 MCP 返回的 `主图` 字段（product_search 有），否则为空
    # 注意：不要用 ASIN 构造 CDN URL（m.media-amazon.com 对 ASIN URL 在浏览器和服务器都返回 400）
    thumbnail = p.get("主图") or p.get("thumbnail") or ""

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
    # site 参数通过 query 传递，前端 JS: /api/amazon/categories?site=BR
    # FastAPI 自动从 request 中解析 query 参数
    from fastapi import Request
    # 这个技巧在依赖注入里用，但不在函数签名中，我们可以直接从请求对象取
    # 实际上这里我们不用这个方法，改为用查询参数
    site = "US"
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
    """返回指定站点的完整类目树（含子类），一级/二级类目均返回中文翻译名"""
    try:
        tree = _load_category_tree(site.upper())
    except Exception as e:
        raise HTTPException(500, f"加载类目树失败: {e}")
    result = []
    for node in tree:
        node_id = node.get("nodeId", "")
        top_info = _get_category_info(site.upper(), node_id)
        subs = []
        for sub in node.get("子类", []):
            sub_id = sub.get("nodeId", "")
            sub_info = _get_category_info(site.upper(), sub_id)
            subs.append({
                "nodeId": sub_id,
                "id": sub_id,
                "类目名称": sub_info.get("name", sub.get("类目名称", "")),
                "name": sub_info.get("name", sub.get("类目名称", "")),
                "emoji": sub_info.get("emoji", "📦"),
            })
        result.append({
            "nodeId": node_id,
            "id": node_id,
            "类目名称": top_info.get("name", node.get("类目名称", "")),
            "name": top_info.get("name", node.get("类目名称", "")),
            "emoji": top_info.get("emoji", "📦"),
            "子类": subs,
        })
    return result

@router.get("/sites")
def list_sites():
    """返回支持的站点列表"""
    return [
        {"id": "US", "name": "🇺🇸 美国", "flag": "US"},
        {"id": "MX", "name": "🇲🇽 墨西哥", "flag": "MX"},
        {"id": "BR", "name": "🇧🇷 巴西", "flag": "BR"},
    ]

@router.post("/hot")
async def pull_hot_products(req: HotReq):
    import logging
    logger = logging.getLogger("uvicorn.error")
    logger.warning(f"[AMAZON HOT] site={req.site} node_ids={req.node_ids} min_sales={req.min_sales}")
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
        except Exception as ex:
            logger.warning(f"[AMAZON HOT] json parse error: {ex}, raw[:100]={str(raw)[:100]}")
            errors.append(f"node {node_id}: parse error")
            continue
        products = data.get("Top100产品", [])
        logger.warning(f"[AMAZON HOT] node={node_id} raw_products={len(products)} data_keys={list(data.keys())}")

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
            if req.max_listed_days and norm["listed_days"] > req.max_listed_days:
                continue
            all_products.append(norm)

    return {"products": all_products, "total": len(all_products), "errors": errors}

@router.post("/potential")
async def pull_potential_products(req: NewReq):
    import logging
    logger = logging.getLogger("uvicorn.error")
    logger.warning(f"[AMAZON POT] site={req.site} node_id={req.node_id} page={req.page}")
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
        # ⚠️ product_search 的 nodeId 对 MX/BR 不生效（返回相同产品）；改用 searchName 搜索中文类目名
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

        if req.max_listed_days and norm["listed_days"] > req.max_listed_days:
            continue
        result.append(norm)

    return {"products": result, "total": len(result), "errors": errors}
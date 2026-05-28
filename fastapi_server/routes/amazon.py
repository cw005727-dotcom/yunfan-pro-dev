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

MCP_KEY = "l08rouw3cki1ugntvk1hq1bpuujszz09"
MCP_URL = "https://mcp.sorftime.com"

# ── 数据库路径─────────────────────────────────────────────────────────────
from fastapi_server.config import DB_PATH, EXPORT_DIR

# ── 数据库初始化─────────────────────────────────────────────────────────
def _ensure_amazon_table():
    """建表/升级：确保 amazon_products 表有 category_node_id 字段"""
    import sqlite3
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    # 建表（完整结构）
    cur.execute("""
    CREATE TABLE IF NOT EXISTS amazon_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asin TEXT NOT NULL,
        site TEXT NOT NULL,
        mode TEXT NOT NULL,
        title TEXT,
        price REAL DEFAULT 0,
        weight REAL DEFAULT 0,
        monthly_sales INTEGER DEFAULT 0,
        monthly_revenue REAL DEFAULT 0,
        brand TEXT,
        review_count INTEGER DEFAULT 0,
        rating REAL DEFAULT 0,
        seller_country TEXT,
        node_id TEXT,
        node_name TEXT,
        big_category TEXT,
        sub_category TEXT,
        listed_days INTEGER DEFAULT 0,
        launch_date TEXT,
        fba_fee REAL DEFAULT 0,
        fulfillment TEXT DEFAULT 'FBM',
        thumbnail_url TEXT,
        product_url TEXT,
        potential_index REAL DEFAULT 0,
        status TEXT DEFAULT 'pending',
        category_node_id TEXT,
        fetched_at TEXT DEFAULT (datetime('now', '+8 hours')),
        CONSTRAINT uq_amazon_asin_site_mode UNIQUE(asin, site, mode)
    )""")
    # 升级：如果表已存在但缺 category_node_id 列，补充
    cur.execute("PRAGMA table_info(amazon_products)")
    cols = [row[1] for row in cur.fetchall()]
    if 'category_node_id' not in cols:
        cur.execute("ALTER TABLE amazon_products ADD COLUMN category_node_id TEXT")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_ap_site_mode ON amazon_products(site, mode)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_ap_category_node ON amazon_products(category_node_id)")
    conn.commit()
    conn.close()

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
    # bypass system proxy to avoid SSL handshake failures
    proxy_handler = urllib.request.ProxyHandler({})
    opener = urllib.request.build_opener(proxy_handler)
    with opener.open(req, timeout=45) as resp:
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
    cn = _translate_cat(site, node_id, name) or name
    return {
        "name": cn if cn else node_id,
        "emoji": info.get("emoji", "📦"),
    }

def _translate_cat(site: str, node_id: str, fallback_name: str = "") -> str:
    """查询类目中文翻译。BR/MX/US 均从对应站点映射表查；US 子类未映射时翻译英文名，MX/BR 子类未映射时翻译西/葡文名。"""
    cn = ""
    if site == "BR":
        cn = _BR_CATEGORIES.get(node_id, "")
        if not cn and fallback_name:
            cn = _translate_pt_to_zh(fallback_name)
    elif site == "MX":
        cn = _MX_CATEGORIES.get(node_id, "")
        if not cn and fallback_name:
            cn = _translate_es_to_zh(fallback_name)
    elif site == "US":
        cn = _US_CATEGORIES.get(node_id, "")
        # US 子类未翻译：尝试把英文名翻译成中文
        if not cn and fallback_name:
            cn = _translate_en_to_zh(fallback_name)
    return cn

def _translate_es_to_zh(es_name: str) -> str:
    """把常见西班牙语类目名翻译成中文（MX 子类 fallback 用）"""
    es_lower = es_name.lower()
    mapping = {
        "arroz": "大米", "frijoles": "豆类", "pasta": "面食",
        "canastas de regalo": "礼品篮", "regalos gourmet": "美食礼盒",
        "carne": "肉类", "aves de corral": "禽肉", "caza": "野味",
        "cereal de desayuno": "早餐麦片", "desayuno": "早餐",
        "comida enlatada": "罐头食品", "envasada": "包装食品",
        "empaquetada": "包装食品", "charcuter": "熟食",
        "cerveza": "啤酒", "vino": "葡萄酒", "cocina": "厨房",
        "reposter": "烘焙", "mermeladas": "果酱", "miel": "蜂蜜",
        "pescados": "鱼", "mariscos": "海鲜", "frescos": "新鲜",
        "accesorios para coche": "汽车配件", "aceites": "机油",
        "fluidos para vehiculos": "汽车液", "cuidado de coche": "汽车护理",
        "herramientas": "工具", "llantas": "轮胎", "rines": "轮毂",
        "motos": "摩托车", "partes": "配件", "refacciones": "零部件",
        "pinturas": "油漆", "paint": "油漆",
        "sillas de coche": "安全座椅", "transporte": "车载用品",
        "bebes": "婴儿", "bebe": "母婴",
        "actividad": "活动用品", "entretenimiento": "娱乐",
        "bacinicas": "便盆", "bancos infantiles": "儿童凳",
        "ropa": "服装", "zapatos": "童鞋",
        "pañales": "尿布", "carriolas": "婴儿车", "cochecitos": "童车",
        "chupones": "奶嘴", "mordederas": "牙胶",
        "higiene": "护理", "cuidado": "护理",
        "baño": "沐浴", "cuerpo": "身体",
        "cosmeticos": "彩妆", "cuidado de la piel": "护肤",
        "juguetes": "玩具", "juegos": "游戏",
        "herramientas": "工具", "jardineria": "园艺",
        "deportes": "运动", "outdoors": "户外",
        "electronica": "电子", "computadoras": "电脑",
        "celulares": "手机", "tablets": "平板电脑",
        "hogar": "家居", "cocina": "厨房",
        "muebles": "家具", "iluminacion": "灯具",
        "oficina": "办公", "papeleria": "文具",
        "musica": "音乐", "peliculas": "电影",
        "libros": "图书", "mascotas": "宠物",
    }
    for key, zh in mapping.items():
        if key in es_lower or es_lower in key:
            return zh
    return ""

def _translate_pt_to_zh(pt_name: str) -> str:
    """把常见葡萄牙语类目名翻译成中文（BR 子类 fallback 用）"""
    pt_lower = pt_name.lower()
    mapping = {
        "alimentos": "食品", "bebidas": "饮料",
        "frescos": "新鲜", "refrigerados": "冷藏",
        "enlatados": "罐头", "embalados": "包装",
        "automotivo": "汽车用品", "automoveis": "汽车",
        "bebes": "母婴", "cuidado": "护理",
        "higiene": "卫生", "brinquedos": "玩具",
        "jogos": "游戏", "artes": "艺术",
        "artesanato": "手工", "ferramentas": "工具",
        "casa": "家居", "cozinha": "厨房",
        "moveis": "家具", "ilumina": "灯具",
        "eletronicos": "电子产品", "informatica": "电脑",
        "celulares": "手机", "tablets": "平板电脑",
        "esportes": "运动", "ar livre": "户外",
        "pets": "宠物", "animais": "宠物",
        "livros": "图书", "musica": "音乐",
        "filmes": "电影", "beleza": "美妆",
        "maquiagem": "彩妆", "cuidado": "护肤",
        "skincare": "护肤", "cabelo": "护发",
        "maos": "手护理", "pes": "足部护理",
    }
    for key, zh in mapping.items():
        if key in pt_lower or pt_lower in key:
            return zh
    return ""

def _translate_en_to_zh(en_name: str) -> str:
    """把常见英文类目名翻译成中文（US 子类 fallback 用）"""
    import unicodedata
    en_lower = unicodedata.normalize('NFD', en_name.lower())
    en_lower = ''.join(c for c in en_lower if unicodedata.category(c) != 'Mn')
    mapping = {
        # 电子/数码
        "cell phone": "手机通讯", "cell phones": "手机通讯",
        "accessories": "配件", "cases": "保护套",
        "screen protectors": "屏幕保护膜", "cables": "数据线",
        "chargers": "充电器", "batteries": "电池",
        "power banks": "移动电源", "tablets": "平板电脑",
        "laptops": "笔记本电脑", "desktops": "台式机",
        "computers": "电脑配件", "computer accessories": "电脑配件",
        "computer components": "电脑组件", "monitors": "显示器",
        "keyboards": "键盘", "mice": "鼠标",
        "headsets": "耳机", "earbuds": "耳机",
        "headphones": "耳机", "speakers": "音响",
        "cameras": "相机", "tvs": "电视", "tv": "电视",
        "video games": "电子游戏", "game consoles": "游戏机",
        "electronics": "电子产品", "smartphones": "智能手机",
        "smartwatches": "智能手表", "kindle": "电子书",
        # 美妆/个护
        "makeup": "彩妆", "skincare": "护肤", "hair care": "护发",
        "perfumes": "香水", "fragrances": "香水",
        "nail care": "美甲", "cosmetics": "美妆",
        "beauty gift sets": "美妆礼盒",
        # 母婴/儿童
        "baby": "母婴", "diapering": "尿布", "feeding": "喂养",
        "toys": "玩具", "toys & games": "玩具游戏",
        "kids": "儿童", "children": "儿童",
        "clothing": "服装", "shoes": "鞋",
        "costumes": "服装", "baby clothing": "婴儿服装",
        "boys fashion": "男童服装", "girls fashion": "女童服装",
        "womens fashion": "女装", "mens fashion": "男装",
        "luggage": "箱包", "fashion": "服饰",
        # 儿童玩具细分类
        "kids dress up": "儿童变装游戏", "pretend play": "过家家玩具",
        "kids electronics": "儿童电子玩具", "kids party supplies": "儿童派对用品",
        "dress up": "变装游戏", "party supplies": "派对用品",
        "building sets": "积木", "building toys": "积木玩具",
        "puzzles": "拼图", "board games": "桌游", "card games": "卡牌游戏",
        "action figures": "玩偶手办", "dolls": "娃娃", "dollhouses": "娃娃屋",
        "learning toys": "早教玩具", "stem toys": "STEM玩具",
        "outdoor play": "户外玩具", "play tents": "游戏帐篷",
        "ride on toys": "骑乘玩具", "bikes": "自行车",
        "arts crafts": "艺术手工", "beading": "串珠",
        "jewelry making": "珠宝制作", "craft supplies": "手工材料",
        "face paints": "面部彩绘",
        # 家居/厨房
        "home": "家居", "kitchen": "厨房", "cookware": "厨具",
        "bedding": "床上用品", "bathroom": "浴室",
        "furniture": "家具", "lighting": "灯具",
        "storage": "收纳", "cleaning": "清洁用品",
        "appliances": "家电", "garden": "园艺", "gardening": "园艺",
        # 家居细分
        "seasonal decor": "季节装饰", "seasonal": "季节用品",
        "outdoor decor": "户外装饰", "patio decor": "露台装饰",
        "holiday decor": "节日装饰", "christmas": "圣诞用品",
        "halloween": "万圣节", "thanksgiving": "感恩节",
        "wall art": "墙上装饰", "wall decor": "墙上装饰",
        "throw pillows": "抱枕靠垫", "blankets": "毯子",
        "curtains": "窗帘", "rugs": "地毯", "mats": "地垫",
        # 食品/健康
        "grocery": "食品饮料", "food": "食品", "drinks": "饮料",
        "coffee": "咖啡", "tea": "茶", "snacks": "零食",
        "health": "健康", "supplements": "营养补充",
        "medicine": "药品", "oral care": "口腔护理",
        # 汽车/户外
        "automotive": "汽车用品", "car care": "汽车护理",
        "tools": "工具", "sports": "运动", "outdoors": "户外",
        "fitness": "健身", "running": "跑步",
        "camping": "露营", "hiking": "徒步", "fishing": "钓鱼",
        "boating": "船类", "cycling": "骑行",
        # 办公/其他
        "office": "办公", "pet": "宠物", "books": "图书",
        "music": "音乐", "movies": "电影", "arts": "艺术",
        "crafts": "手工", "jewelry": "珠宝",
        "watches": "手表", "sunglasses": "太阳镜",
        # 家电细分
        "cooktops": "电磁炉", "dishwashers": "洗碗机",
        "freezers": "冰柜", "ranges": "燃气灶",
        "microwaves": "微波炉", "built-in": "嵌入式",
        "refrigerators": "冰箱", "washers": "洗衣机",
        "dryers": "干衣机", "air conditioners": "空调",
        "vacuum cleaners": "吸尘器", "fans": "风扇",
        "heaters": "取暖器", "air purifiers": "空气净化器",
        "smart home": "智能家居", "security cameras": "监控摄像",
        # 翻新/设备
        "device accessories": "配件", "device subscriptions": "订阅服务",
        "amazon devices": "亚马逊设备", "amazon renewed": "官方翻新",
        "renewed automotive": "汽车用品", "renewed camera": "相机",
        "renewed computers": "电脑配件", "renewed headphones": "耳机",
        "renewed home": "家居", "renewed tablets": "平板电脑",
        "renewed smartphones": "智能手机", "renewed smartwatches": "智能手表",
        "renewed video game": "游戏机", "renewed laptops": "笔记本电脑",
        # 儿童服装/鞋
        "boys clothing": "男童服装", "girls clothing": "女童服装",
        "baby shoes": "婴儿鞋", "kids shoes": "童鞋",
        "costume accessories": "演出配饰", "wigs": "假发",
        "makeup kits": "化妆套装",
    }
    for key, zh in mapping.items():
        if key in en_lower or en_lower in key:
            return zh
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
        "monthly_sales": sales,
        "rating": rating,
        "review_count": reviews,
        "listed_days": listed_days,
        "volume": dims["volume"] if dims else None,
        "dimensions": dims,
        "fulfillment": fulfillment,
        "thumbnail_url": thumbnail,
        "product_url": f'https://www.amazon.{site.lower()}/dp/{asin}' if asin else '',
        "launch_date": raw_date,
    }

# ── 请求模型─────────────────────────────────────────────────────────────
class HotReq(BaseModel):
    site: str = "US"
    node_id: str = ""
    search: Optional[str] = None       # 类目中文名，用于 product_search searchName
    page: int = 1
    min_sales: int = 0
    min_rating: float = 0.0
    max_listed_days: Optional[int] = None

class NewReq(BaseModel):
    site: str = "US"
    node_id: str = ""
    search: Optional[str] = None       # 类目中文名，用于 product_search searchName
    page: int = 1
    max_listed_days: Optional[int] = 365  # 默认只返回上架1年内的商品(Sorftime数据源限制，缺乏真正新品)

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
    def _cn_emoji(name):
        """根据中文类目名匹配 emoji"""
        if not name: return "📦"
        emoji_map = [
            (["电子", "手机", "电脑", "相机", "摄影", "平板", "音箱"], "📱"),
            (["美妆", "护肤", "彩妆", "香水", "美甲", "护发"], "💄"),
            (["母婴", "婴儿", "宝宝", "辅食", "尿布", "玩具"], "👶"),
            (["家居", "厨房", "餐饮", "浴室", "床上", "灯具", "收纳", "清洁", "家具"], "🏠"),
            (["汽车", "车载", "摩托"], "🚗"),
            (["运动", "体育", "健身", "跑步", "户外"], "⚽"),
            (["宠物", "狗", "猫"], "🐶"),
            (["玩具", "游戏", "积木", "桌游", "卡牌"], "🎮"),
            (["服装", "服饰", "鞋", "箱包", "配饰", "女装", "男装", "童装"], "👕"),
            (["食品", "饮料", "零食", "酒", "咖啡", "茶"], "🍎"),
            (["图书", "书", "音乐"], "📚"),
            (["健康", "个护", "口腔", "营养", "医疗", "药品"], "💊"),
            (["办公", "文具"], "✏️"),
            (["工具", "五金"], "🔧"),
            (["园艺", "庭院", "花园"], "🌱"),
            (["珠宝", "首饰", "手表"], "💍"),
            (["乐器"], "🎵"),
            (["工业"], "🏭"),
            (["软件", "游戏"], "💻"),
            (["设备", "配件"], "🔌"),
        ]
        for keywords, e in emoji_map:
            if any(kw in name for kw in keywords):
                return e
        return "📦"

    def _cn_filter(name):
        """过滤掉亚马逊品牌相关类目名"""
        if not name: return name
        import re
        # 去掉 "Amazon" 开头或 "& Accessories" "Devices" 等英文
        name = re.sub(r'^Amazon\s*', '', name)
        name = re.sub(r'\s*&\s*Accessories$', '', name)
        name = re.sub(r'\s*Devices?$', '', name)
        name = re.sub(r'\s*Subscriptions?$', '', name)
        name = name.strip()
        # 如果去掉后空了，保留原始中文翻译
        if not name:
            return name
        return name

    # 原始名映射（Sorftime 英文名，用于搜索）
    _ORIGINAL_NAMES = {}
    for node in tree:
        _ORIGINAL_NAMES[node.get("nodeId", "")] = node.get("类目名称", "") or node.get("name", "")
        for sub in node.get("子类", []):
            _ORIGINAL_NAMES[sub.get("nodeId", "")] = sub.get("类目名称", "") or sub.get("name", "")

    result = []
    for node in tree:
        node_id = node.get("nodeId", "")
        top_info = _get_category_info(site.upper(), node_id)
        top_cn = _translate_cat(site.upper(), node_id, node.get("类目名称", "") or node.get("name", ""))
        top_cn = _cn_filter(top_cn or top_info.get("name", node.get("类目名称", "")))
        # 跳过亚马逊品牌相关、翻新、纯英文名（未翻译的）
        top_lower = (top_cn or '').lower()
        if not top_cn or 'amazon' in top_lower or '亚马逊' in top_cn or '翻新' in top_lower or (len(top_cn) > 8 and all(ord(c) < 128 for c in top_cn.strip())):
            continue

        subs = []
        for sub in node.get("子类", []):
            sub_id = sub.get("nodeId", "")
            sub_info = _get_category_info(site.upper(), sub_id)
            cn = _translate_cat(site.upper(), sub_id, sub.get("类目名称", "") or sub.get("name", ""))
            cn = _cn_filter(cn or sub_info.get("name", sub.get("类目名称", "")))
            cn_lower = (cn or '').lower()
            if not cn or 'amazon' in cn_lower or '亚马逊' in cn or '翻新' in cn_lower:
                continue
            emoji = _cn_emoji(cn)
            subs.append({
                "nodeId": sub_id,
                "id": sub_id,
                "类目名称": cn,
                "name": cn,
                "emoji": emoji,
                "originalName": _ORIGINAL_NAMES.get(sub_id, ""),
            })
        emoji = _cn_emoji(top_cn)
        result.append({
            "nodeId": node_id,
            "id": node_id,
            "类目名称": top_cn,
            "name": top_cn,
            "emoji": emoji,
            "子类": subs,
            "originalName": _ORIGINAL_NAMES.get(node_id, ""),
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

# ── US 类目中文→英文/西语映射（Sorftime 树名 → big_category 关键词）─────
_US_CAT_ZH2EN = {
    '大小家电': ['Health & Household', 'Home & Kitchen', 'Appliance', 'Kitchen & Dining'],
    '艺术手工': ['Arts, Crafts & Sewing', 'Handmade'],
    '汽车用品': ['Automotive', 'Automotriz', 'Motocicletas'],
    '母婴用品': ['Baby', 'Bebé'],
    '美妆护肤': ['Beauty & Personal Care', 'Belleza', 'Salud'],
    '手机通讯': ['Cell Phones & Accessories'],
    '时尚服饰': ['Clothing, Shoes & Jewelry', 'Ropa, Zapatos y Accesorios'],
    '配件': ['Accessorie'],
    '消费电子': ['Electronics', 'Electrónicos', 'Computers & Accessories', 'Camera & Photo', 'Amazon Devices', 'Amazon Renewed'],
    '食品饮料': ['Grocery & Gourmet Food', 'Alimentos y Bebidas', 'Alimentos'],
    '健康': ['Health & Household', 'Salud'],
    '家居园艺': ['Patio, Lawn & Garden', 'Hogar y Cocina', 'Home & Kitchen'],
    '工业用品': ['Industrial & Scientific', 'Industria'],
    '厨房': ['Kitchen & Dining'],
    '乐器演奏': ['Musical Instruments', 'Instrumentos Musicales'],
    '办公文具': ['Office Products', 'Oficina y Papelería', 'Oficina'],
    '园艺': ['Patio, Lawn & Garden', 'Garden'],
    '宠物用品': ['Pet Supplies', 'Productos para animales', 'Productos para Animales'],
    '运动': ['Sports & Outdoors', 'Deportes'],
    '家居': ['Home & Kitchen', 'Hogar y Cocina'],
    '玩具': ['Toys & Games', 'Juguetes y Juegos'],
    '电子游戏': ['Video Games', 'Videojuegos'],
    '图书': ['Books'],
    'Our Brands': ['Our Brands'],
}


def _query_amazon_from_db(site: str, mode: str, search: str = "", page: int = 1, limit: int = 200, node_id: str = "") -> dict:
    """从 amazon_products 表查询商品
    - node_id: 按 category_node_id 精确过滤（前端选类目时传）
    - search: 按 big_category/sub_category/title 模糊搜索
    """
    import sqlite3
    _ensure_amazon_table()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    bindings = [site, mode]
    has_cat_node = False
    sql = (
        "SELECT asin, title, price, monthly_sales, monthly_revenue, brand, review_count, rating, "
        "seller_country, big_category, sub_category, listed_days, launch_date, fba_fee, weight, "
        "fulfillment, thumbnail_url, product_url, potential_index, category_node_id, fetched_at "
        "FROM amazon_products WHERE site=? AND mode=? "
    )
    if node_id:
        # 检查数据是否有 category_node_id（旧数据可能没有）
        cur.execute("SELECT COUNT(*) FROM amazon_products WHERE site=? AND mode=? AND category_node_id IS NOT NULL AND category_node_id!=''", (site, mode))
        has_cat_node = cur.fetchone()[0] > 0
        if has_cat_node:
            sql += "AND category_node_id=? "
            bindings.append(node_id)
    if search:
        # 中文类目名→英文/西语 big_category 关键词
        zh_mapped = _US_CAT_ZH2EN.get(search.strip(), [])
        if zh_mapped:
            or_clauses = []
            for kw in zh_mapped:
                or_clauses.append("(big_category LIKE ? OR sub_category LIKE ?)")
                like = f"%{kw}%"
                bindings.extend([like, like])
            sql += "AND (" + " OR ".join(or_clauses) + ") "
        else:
            sql += "AND (title LIKE ? OR big_category LIKE ? OR sub_category LIKE ?) "
            like = f"%{search}%"
            bindings.extend([like, like, like])
    sql += "ORDER BY monthly_sales DESC LIMIT ? OFFSET ?"
    offset = (page - 1) * limit
    bindings.extend([limit, offset])
    cur.execute(sql, bindings)
    rows = cur.fetchall()
    products = [dict(r) for r in rows]
    # count
    count_sql = "SELECT COUNT(*) FROM amazon_products WHERE site=? AND mode=?"
    count_bindings = [site, mode]
    if node_id and has_cat_node:
        count_sql += " AND category_node_id=?"
        count_bindings.append(node_id)
    if search:
        zh_mapped = _US_CAT_ZH2EN.get(search.strip(), [])
        if zh_mapped:
            or_clauses = []
            for kw in zh_mapped:
                or_clauses.append("(big_category LIKE ? OR sub_category LIKE ?)")
                like = f"%{kw}%"
                count_bindings.extend([like, like])
            count_sql += " AND (" + " OR ".join(or_clauses) + ")"
        else:
            like = f"%{search}%"
            count_sql += " AND (title LIKE ? OR big_category LIKE ? OR sub_category LIKE ?)"
            count_bindings.extend([like, like, like])
    cur.execute(count_sql, count_bindings)
    total = cur.fetchone()[0]
    conn.close()
    return {"products": products, "total": total, "errors": []}


@router.post("/hot")
async def pull_hot_products(req: HotReq):
    """爆品模式：从数据库读取，按月销量降序"""
    import logging
    logger = logging.getLogger("uvicorn.error")
    logger.warning(f"[AMAZON DB] hot site={req.site}")
    site = req.site.upper()
    if site not in ("US", "MX", "BR"):
        raise HTTPException(400, "站点仅支持 US / MX / BR")
    return _query_amazon_from_db(site, "hot", search=req.search or "", page=req.page or 1, node_id=req.node_id or "")

@router.post("/potential")
async def pull_potential_products(req: NewReq):
    """潜力产品模式：从数据库读取，按潜力指数降序"""
    import logging
    logger = logging.getLogger("uvicorn.error")
    logger.warning(f"[AMAZON DB] potential site={req.site}")
    site = req.site.upper()
    if site not in ("US", "MX", "BR"):
        raise HTTPException(400, "站点仅支持 US / MX / BR")
    import sqlite3
    _ensure_amazon_table()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    bindings = [site, "potential"]
    sql = "SELECT asin, title, price, monthly_sales, monthly_revenue, brand, review_count, rating, seller_country, big_category, sub_category, listed_days, launch_date, fba_fee, weight, fulfillment, thumbnail_url, product_url, potential_index, category_node_id, fetched_at FROM amazon_products WHERE site=? AND mode=? "
    if req.node_id:
        sql += "AND category_node_id=? "
        bindings.append(req.node_id)
    if req.search:
        sql += "AND (title LIKE ? OR big_category LIKE ? OR sub_category LIKE ?) "
        like = f"%{req.search}%"
        bindings.extend([like, like, like])
    sql += "ORDER BY potential_index DESC, monthly_sales DESC LIMIT ? OFFSET ?"
    limit = 200
    page_num = req.page or 1
    offset = (page_num - 1) * limit
    bindings.extend([limit, offset])
    cur.execute(sql, bindings)
    rows = cur.fetchall()
    products = [dict(r) for r in rows]
    if req.node_id:
        count_bindings = [site, "potential", req.node_id]
        cur.execute("SELECT COUNT(*) FROM amazon_products WHERE site=? AND mode=? AND category_node_id=?", count_bindings)
    else:
        cur.execute("SELECT COUNT(*) FROM amazon_products WHERE site=? AND mode=?", [site, "potential"])
    total = cur.fetchone()[0]
    conn.close()
    return {"products": products, "total": total, "errors": []}

@router.post("/new")
async def pull_new_products(req: NewReq):
    """新品模式：从数据库读取，按月销量降序"""
    import logging
    logger = logging.getLogger("uvicorn.error")
    logger.warning(f"[AMAZON DB] new site={req.site}")
    site = req.site.upper()
    if site not in ("US", "MX", "BR"):
        raise HTTPException(400, "站点仅支持 US / MX / BR")
    return _query_amazon_from_db(site, "new", search=req.search or "", page=req.page or 1, node_id=req.node_id or "")

# ── 数据库写入─────────────────────────────────────────────────────────────
def _upsert_products_db(products: list, site: str, mode: str, category_node_id: str = ""):
    """先删 site+mode 的旧数据，再批量写入（全量替换，避免 UNIQUE 冲突浪费）
    category_node_id: 记录这批数据来自哪个类目 nodeId"""
    import sqlite3
    _ensure_amazon_table()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    # 先删该 site+mode 的旧数据
    cur.execute("DELETE FROM amazon_products WHERE site=? AND mode=?", [site, mode])
    # 批量插入新数据
    for p in products:
        p['site'] = site
        p['mode'] = mode
        p['category_node_id'] = category_node_id
        cur.execute("""
        INSERT INTO amazon_products (
            asin, title, price, weight, monthly_sales, monthly_revenue,
            brand, review_count, rating, seller_country, node_id, node_name,
            big_category, sub_category, listed_days, launch_date, fba_fee,
            fulfillment, thumbnail_url, product_url, potential_index, status, fetched_at,
            category_node_id
        ) VALUES (
            :asin, :title, :price, :weight, :monthly_sales, :monthly_revenue,
            :brand, :review_count, :rating, :seller_country, :node_id, :node_name,
            :big_category, :sub_category, :listed_days, :launch_date, :fba_fee,
            :fulfillment, :thumbnail_url, :product_url, :potential_index, 'pending', datetime('now', '+8 hours'),
            :category_node_id
        )""", p)
    conn.commit()
    conn.close()


def _normalize_for_db(p: dict, site: str) -> dict:
    """将 MCP 商品数据规范化为数据库字段"""
    asin = str(p.get('asin') or p.get('ASIN') or p.get('Asin') or p.get('产品ASIN码') or '')
    site_map = {'US': 'com', 'MX': 'com.mx', 'BR': 'com.br'}
    sl = site_map.get(site, 'com')
    thumbnail = p.get('主图') or p.get('thumbnail') or p.get('image_url') or ''
    title = p.get('title') or p.get('标题') or p.get('product_name') or ''
    price_raw = p.get('price') or p.get('buyBoxPrice') or p.get('价格') or 0
    try: price = float(str(price_raw).replace('$', '').replace(' ', ''))
    except: price = 0.0
    sales_raw = p.get('sales') or p.get('月销量') or 0
    try: monthly_sales = int(float(str(sales_raw).replace(',', '')))
    except: monthly_sales = 0
    revenue_raw = p.get('revenue') or p.get('月销售额') or 0
    try: monthly_revenue = float(str(revenue_raw).replace('$', '').replace(',', ''))
    except: monthly_revenue = 0.0
    brand = p.get('brand') or p.get('品牌') or ''
    reviews_raw = p.get('reviews') or p.get('评论数') or 0
    try: review_count = int(float(str(reviews_raw).replace(',', '')))
    except: review_count = 0
    rating_raw = str(p.get('rating') or p.get('星级') or '0').replace('★', '').strip()
    try: rating = float(rating_raw)
    except: rating = 0.0
    seller_country = p.get('seller_country') or p.get('卖家国籍') or ''
    node_id = p.get('node_id') or p.get('nodeId') or ''
    node_name = p.get('node_name') or p.get('类目名称') or ''
    raw_big = p.get('big_category') or p.get('所属大类') or ''
    # 提取干净类目名（去掉（排名:xx）后缀和多余空格）
    import re
    big_cat = re.sub(r'[\s]*[（(]排名[:：][^）)]*[）)]', '', raw_big).strip()
    sub_cat = p.get('sub_category') or p.get('所属细分类目') or ''
    listed_raw = p.get('listed_days') or p.get('上架天数') or p.get('上架时间') or 0
    try: listed_days = int(float(listed_raw))
    except: listed_days = 0
    launch_date = p.get('launch_date') or p.get('上架日期') or p.get('date') or ''
    if not listed_days and launch_date:
        try:
            launch_dt = datetime.strptime(launch_date, "%Y-%m-%d")
            listed_days = (datetime.now() - launch_dt).days
        except:
            pass
    fba_fee_raw = p.get('fba_fee') or p.get('FBA费用') or 0
    try: fba_fee = float(fba_fee_raw)
    except: fba_fee = 0.0
    fulfillment = p.get('fulfillment') or p.get('fulfillment_type') or 'FBM'
    weight_raw = p.get('weight') or p.get('重量') or 0
    try: weight = float(weight_raw)
    except: weight = 0.0
    potential_raw = p.get('potential_index') or p.get('产品潜力指数') or 0
    try: potential_index = float(potential_raw)
    except: potential_index = 0.0
    return {
        'asin': asin,
        'title': title[:500] if title else '',
        'price': price,
        'weight': weight,
        'monthly_sales': monthly_sales,
        'monthly_revenue': monthly_revenue,
        'brand': brand[:100] if brand else '',
        'review_count': review_count,
        'rating': rating,
        'seller_country': seller_country,
        'node_id': node_id,
        'node_name': node_name,
        'big_category': big_cat,
        'sub_category': sub_cat,
        'listed_days': listed_days,
        'launch_date': str(launch_date),
        'fba_fee': fba_fee,
        'fulfillment': fulfillment,
        'thumbnail_url': thumbnail,
        'product_url': f'https://www.amazon.{sl}/dp/{asin}',
        'potential_index': potential_index,
    }

# ── 新 API：全量拉取并存库（播种）───────────────────────────────────────
class SeedReq(BaseModel):
    site: str = "US"
    mode: str = "hot"
    category_name: Optional[str] = None
    category_node_id: str = ""   # 记录拉取来源的 nodeId
    pages: int = 25

@router.post("/seed")
async def seed_category(req: SeedReq):
    """
    单站×单模式×单个类目，拉取 N 页（默认25页=500条）并存库。
    """
    import logging, time
    logger = logging.getLogger("uvicorn.error")
    site = req.site.upper()
    mode = req.mode.lower()
    search = req.category_name
    page_limit = max(1, min(req.pages, 25))

    if site not in ('US', 'MX', 'BR'):
        raise HTTPException(400, '站点仅支持 US/MX/BR')
    if mode not in ('hot', 'potential', 'new'):
        raise HTTPException(400, '模式仅支持 hot/potential/new')

    _ensure_amazon_table()
    logger.warning(f'[AMAZON SEED] site={site} mode={mode} cat={search} pages={page_limit}')

    all_products = []
    for page in range(1, page_limit + 1):
        if search:
            # 有搜索词时用 product_search（通用搜索）
            tool = 'product_search'
        else:
            if mode == 'hot':
                tool = 'product_search'  # category_report已失效，改用product_search
                if not search:
                    # 无搜索词时product_search需要兜底，用空search返回热门
                    args['searchName'] = 'best seller'
            elif mode == 'potential':
                tool = 'potential_product' if site == 'US' else 'product_search'
            else:
                tool = 'product_search'

        args = {'amzSite': site, 'page': page}
        if search:
            args['searchName'] = search
        if mode == 'potential' and site != 'US' and not search:
            args['sortby_potential_index'] = True

        raw = mcp_call(tool, args)
        try:
            chunk = json.loads(raw) if isinstance(raw, str) else raw
        except Exception:
            chunk = []
        if isinstance(chunk, dict) and 'error' in chunk:
            logger.warning(f'[AMAZON SEED] page {page} error: {chunk["error"]}')
            break
        # category_report wraps in {"Top100产品": [...]} vs product_search returns direct list
        if isinstance(chunk, dict) and 'Top100产品' in chunk:
            chunk = chunk['Top100产品']
        chunk = chunk if isinstance(chunk, list) else []
        if not chunk:
            break

        for p in chunk:
            norm = _normalize_for_db(p, site)
            all_products.append(norm)

        if len(chunk) < 20:
            logger.warning(f'[AMAZON SEED] page {page} 返回不足20条，数据源耗尽')
            break
        time.sleep(0.2)

    if all_products:
        _upsert_products_db(all_products, site, mode, category_node_id=req.category_node_id)

    logger.warning(f'[AMAZON SEED] 完成: 写入 {len(all_products)} 条 [{site}][{mode}][{search}]')
    return {
        'site': site, 'mode': mode, 'category': search,
        'pages_pulled': page_limit, 'products_saved': len(all_products),
        'products': all_products,
        'preview': all_products[:3],
    }


# ── 新 API：从数据库读取──────────────────────────────────────────────────
class ListReq(BaseModel):
    site: str = "US"
    mode: str = "hot"
    sort: str = "monthly_sales"
    order: str = "desc"
    limit: int = 500
    node_id: Optional[str] = None
    search: Optional[str] = None

@router.post("/list")
async def list_products(req: ListReq):
    """从 amazon_products 表读取数据，按指定字段排序"""
    import sqlite3
    site = req.site.upper()
    mode = req.mode.lower()
    sort_field = req.sort
    allowed_sorts = ['monthly_sales', 'listed_days', 'potential_index', 'price', 'review_count', 'rating', 'weight']
    if sort_field not in allowed_sorts:
        sort_field = 'monthly_sales'
    order = 'DESC' if req.order.lower() == 'desc' else 'ASC'
    limit = max(1, min(req.limit, 500))

    _ensure_amazon_table()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    # 构建 WHERE 条件
    where_parts = ["site=?", "mode=?"]
    where_params = [site, mode]

    # 去重：new 和 potential 排除同时存在于 hot 的商品
    if mode in ('new', 'potential'):
        where_parts.append("asin NOT IN (SELECT asin FROM amazon_products WHERE site=? AND mode='hot')")
        where_params.append(site)
    if mode == 'potential':
        where_parts.append("asin NOT IN (SELECT asin FROM amazon_products WHERE site=? AND mode='new')")
        where_params.append(site)

    # 类目筛选：search 可能包含逗号分隔的多个词，分别 OR 匹配
    # 类目筛选：按 node_id 或 search 关键词匹配
    had_category_filter = bool(req.node_id or req.search)
    if had_category_filter:
        terms = []
        if req.node_id:
            terms.append(req.node_id)
        if req.search:
            for part in req.search.split(','):
                part = part.strip()
                if part and part not in terms:
                    terms.append(part)
        if terms:
            clauses = []
            for term in terms:
                clauses.append("(big_category LIKE ? OR sub_category LIKE ? OR title LIKE ?)")
                like = f'%{term}%'
                where_params.extend([like, like, like])
            where_parts.append("(" + " OR ".join(clauses) + ")")

    where = " AND ".join(where_parts)
    sql = f"SELECT * FROM amazon_products WHERE {where} ORDER BY {sort_field} {order} LIMIT ?"
    where_params.append(limit)

    cur.execute(sql, where_params)
    rows = cur.fetchall()
    products = [dict(r) for r in rows]

    # 如果加了类目筛选但结果为空，自动降级返回全部数据
    if had_category_filter and len(products) == 0:
        fallback_sql = f"SELECT * FROM amazon_products WHERE site=? AND mode=? ORDER BY {sort_field} {order} LIMIT ?"
        cur.execute(fallback_sql, (site, mode, limit))
        products = [dict(r) for r in cur.fetchall()]

    conn.close()
    return {'products': products, 'total': len(products), 'site': site, 'mode': mode}


@router.post("/seed-all")
async def seed_all():
    """
    全量拉取：遍历所有站点×模式×类目，批量写入数据库。
    供定时任务调用（每周一三五 8:00）。
    """
    import logging, time, asyncio
    logger = logging.getLogger("uvicorn.error")

    sites = ['US', 'MX', 'BR']
    modes = ['hot', 'potential', 'new']
    total_saved = 0

    _load_category_tree('US')
    _load_category_tree('MX')
    _load_category_tree('BR')

    for site in sites:
        for mode in modes:
            await asyncio.sleep(0.5)
            logger.warning(f'[SEED-ALL] site={site} mode={mode} start')
            try:
                seed_result = await seed_category(SeedReq(site=site, mode=mode, pages=25))
                total_saved += seed_result.get('products_saved', 0)
                logger.warning(f'[SEED-ALL] site={site} mode={mode} OK: {seed_result.get("products_saved", 0)}条')
            except Exception as e:
                logger.warning(f'[SEED-ALL] site={site} mode={mode} FAIL: {e}')

            # 每个站点取前20个大类，附带 nodeId 一起传递给 seed_category
            tree = _load_category_tree(site.upper())
            for node in tree[:20]:
                node_id = node.get("nodeId", "")
                cn = _translate_cat(site.upper(), node_id, node.get("类目名称", "") or node.get("name", ""))
                cat_name = cn or node.get("类目名称", "") or node.get("name", "")
                if not cat_name:
                    continue
                await asyncio.sleep(0.3)
                try:
                    seed_result = await seed_category(SeedReq(
                        site=site, mode=mode,
                        category_name=cat_name,
                        category_node_id=node_id,
                        pages=5
                    ))
                    total_saved += seed_result.get('products_saved', 0)
                    logger.warning(f'[SEED-ALL] site={site} mode={mode} cat={cat_name[:20]} nodeId={node_id} OK: {seed_result.get("products_saved", 0)}条')
                except Exception as e:
                    logger.warning(f'[SEED-ALL] site={site} mode={mode} cat={cat_name[:20]} nodeId={node_id} FAIL: {e}')

            logger.warning(f'[SEED-ALL] site={site} mode={mode} 完成')

    logger.warning(f'[SEED-ALL] 全量完成，共拉取 {total_saved} 条')
    return {"success": True, "total_saved": total_saved, "message": f"全量拉取完成，共 {total_saved} 条"}


@router.post("/export")
async def amazon_export(data: dict):
    """导出 Amazon 商品为 Excel，返回下载链接"""
    import sqlite3, openpyxl, uuid, os, io
    asins = data.get("asins", [])
    site = data.get("site", "US")
    mode = data.get("mode", "hot")

    if not asins:
        return {"error": "没有可导出的商品"}

    _ensure_amazon_table()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    placeholders = ",".join(["?"] * len(asins))
    cur.execute(f"SELECT asin, title, brand, price, month_sales, rating, review_count, thumbnail_url, product_url FROM amazon_products WHERE asin IN ({placeholders}) AND site=? AND mode=?", asins + [site, mode])
    rows = cur.fetchall()
    conn.close()

    # 生成 Excel
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Amazon Export"
    ws.append(["ASIN", "标题", "品牌", "价格", "月销量", "评分", "评论数", "图片", "链接"])
    for r in rows:
        ws.append([r[0], r[1], r[2], r[3], r[4] or 0, r[5] or 0, r[6] or 0, r[7] or "", r[8] or ""])

    filename = f"amazon_export_{uuid.uuid4().hex[:8]}.xlsx"
    filepath = EXPORT_DIR / filename
    os.makedirs(str(EXPORT_DIR), exist_ok=True)
    wb.save(str(filepath))

    download_url = f"/api/amazon/download/{filename}"
    return {"task_id": filename, "download_url": download_url, "total": len(rows)}


@router.get("/download/{filename}")
async def amazon_download(filename: str):
    """下载导出的 Excel 文件"""
    from fastapi.responses import FileResponse
    filepath = EXPORT_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="文件不存在或已过期")
    return FileResponse(str(filepath), filename=filename, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")


@router.get("/stats")
async def amazon_stats():
    """返回各站点×模式的商品数量"""
    import sqlite3
    _ensure_amazon_table()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT site, mode, COUNT(*) as cnt FROM amazon_products GROUP BY site, mode ORDER BY site, mode")
    rows = cur.fetchall()
    conn.close()
    stats = {}
    for row in rows:
        site, mode, cnt = row
        if site not in stats:
            stats[site] = {}
        stats[site][mode] = cnt
    return stats

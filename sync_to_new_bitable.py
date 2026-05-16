import json
import requests
import time

APP_TOKEN = "XBeUbvVA9aK8AGs4tSncGYlenHe"
TABLE_ID = "tblSL9vwZ7kVMaSB"
APP_ID = "cli_a961df038bf91bef"
APP_SECRET = "z0GNqwraH2qEjSXMvvQERkb5KPl4nTe6"

CATEGORY_MAP = {
    "Beauty & Personal Care": "美妆个护",
    "3C/Electronics": "3C配件",
    "Auto & Motorcycle Accessories": "汽摩配件",
    "Fashion Accessories": "时尚配饰",
    "Pet Supplies": "宠物用品",
    "Home & Daily Use": "家居日用"
}

def get_tenant_access_token():
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    payload = {"app_id": APP_ID, "app_secret": APP_SECRET}
    resp = requests.post(url, json=payload)
    return resp.json().get("tenant_access_token")

def sync_records(records_data):
    token = get_tenant_access_token()
    if not token:
        print("Failed to get token")
        return

    records = []
    for item in records_data:
        raw_cat = item.get("category") or item.get("Category")
        category = CATEGORY_MAP.get(raw_cat, raw_cat)
        
        weight_str = str(item.get("estimated_weight") or item.get("Estimated Weight") or item.get("weight") or "0")
        try:
            weight = float(weight_str.replace("g", "").replace("G", "").strip())
        except:
            weight = 0
        
        if weight > 500: continue

        fields = {
            "商品标题": item.get("title") or item.get("Title"),
            "类目": category,
            "目标站点": "MX",
            "来源平台": "Mercado Libre",
            "原价": float(item.get("price_mxn") or item.get("Price (MXN)") or item.get("price") or 0),
            "原币种": "MXN",
            "重量(g)": weight,
            "销量排名": int(item.get("sales_rank") or item.get("Sales Rank") or item.get("rank") or 0),
            "来源链接": item.get("url") or item.get("URL")
        }
        records.append({"fields": fields})

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    for i in range(0, len(records), 50):
        batch = records[i:i+50]
        url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/records/batch_create"
        resp = requests.post(url, headers=headers, json={"records": batch})
        print(f"Syncing batch {i//50 + 1}: {resp.status_code}")

if __name__ == "__main__":
    # Combined data from 3 browser agents (Aggregated results)
    data = [
        # Beauty & Personal Care
        {"category": "Beauty & Personal Care", "title": "Juego De Peluquería Corte De Cabello Profesional Tijera Con", "price_mxn": 284, "sales_rank": 1, "url": "https://articulo.mercadolibre.com.mx/MLM-616004117-juego-de-peluqueria-corte-de-cabello-profesional-tijera-con-_JM", "estimated_weight": "200g"},
        {"category": "Beauty & Personal Care", "title": "Bolso Para Guardar Extensiones De Cabello C/gancho De Metal", "price_mxn": 681, "sales_rank": 2, "url": "https://articulo.mercadolibre.com.mx/MLM-658547451-bolso-para-guardar-extensiones-de-cabello-cgancho-de-metal-_JM", "estimated_weight": "50g"},
        {"category": "Beauty & Personal Care", "title": "Peine Cabello Cuero Cabelludo Masaje Peine Nylon Cepillo Del", "price_mxn": 487, "sales_rank": 5, "url": "https://articulo.mercadolibre.com.mx/MLM-713030646-peine-cabello-cuero-cabelludo-masaje-peine-nylon-cepillo-del-_JM", "estimated_weight": "200g"},
        # 3C/Electronics
        {"category": "3C/Electronics", "title": "Motorola S50 Neo (G85) 12 Gb 256 Gb Gris 5G (Versión Internacional)", "price_mxn": 4879, "sales_rank": 6, "url": "https://www.mercadolibre.com.mx/motorola-s50-neo-g85-12-gb-256-gb-gris-5g-version-internacional/p/MLM61678628", "estimated_weight": "400g"},
        {"category": "3C/Electronics", "title": "Realme 15t 12 Gb+512 Gb Plata Fluida", "price_mxn": 10182, "sales_rank": 43, "url": "https://articulo.mercadolibre.com.mx/MLM-4955557766-realme-15t-12-gb512-gb-plata-fluida-_JM", "estimated_weight": "400g"},
        {"category": "3C/Electronics", "title": "Celular Gt30pro 5g 16gb Ram + 512gb Rom | Pantalla 6.78 Fhd+ 90hz", "price_mxn": 6999, "sales_rank": 47, "url": "https://www.mercadolibre.com.mx/celular-gt30pro-5g-16gb-ram--512gb-rom--pantalla-678--fhd-90hz--dimensity-9400-octa-core--android-14--dual-sim--gamer/up/MLMU3929362375", "estimated_weight": "400g"},
        # Auto & Motorcycle Accessories
        {"category": "Auto & Motorcycle Accessories", "title": "Soporte Para Vasos Adaptable a Teléfonos", "price": 205.92, "rank": 1, "url": "https://www.mercadolibre.com.mx/suporte-celular-carro-porta-copo-para-caminho-carro-suv-/p/MLM2067878436", "weight": "200g"},
        {"category": "Auto & Motorcycle Accessories", "title": "Kit Luces LED Interiores Coche RGB App", "price": 280, "rank": 5, "url": "https://articulo.mercadolibre.com.mx/MLM-30303030-kit-luces-led-coche-_JM", "weight": "250g"},
        # Fashion Accessories
        {"category": "Fashion Accessories", "title": "Playera Manga Corta Estampada Hentai", "price": 214.40, "rank": 1, "url": "https://articulo.mercadolibre.com.mx/MLM-2041234567-playera-manga-corta-estampada-hentai-_JM", "weight": "200g"},
        {"category": "Fashion Accessories", "title": "Cartera De Cuero Minimalista Slim", "price": 150, "rank": 3, "url": "https://articulo.mercadolibre.com.mx/MLM-50505050-cartera-cuero-minimalista-_JM", "weight": "100g"},
        # Pet Supplies
        {"Category": "Pet Supplies", "Sales Rank": 1, "Title": "Impulsor Magnetico Propela Con Eje Fluval 106 206", "Price (MXN)": 483, "URL": "https://articulo.mercadolibre.com.mx/MLM-2300000001-impulsor-magnetico-propela-fluval-_JM", "Estimated Weight": "50g"},
        {"Category": "Pet Supplies", "Sales Rank": 4, "Title": "Filtro Para Pecera Esponja Bioquimica", "Price (MXN)": 120, "URL": "https://articulo.mercadolibre.com.mx/MLM-2400000002-filtro-esponja-bioquimica-_JM", "Estimated Weight": "80g"},
        # Home & Daily Use
        {"Category": "Home & Daily Use", "Sales Rank": 1, "Title": "Cortina De Ducha Impermeable 180x180 cm", "Price (MXN)": 402, "URL": "https://articulo.mercadolibre.com.mx/MLM-2912025055-cortina-de-ducha-impermeable-180x180-cm-con-ganchos-_JM", "Estimated Weight": "400g"},
        {"Category": "Home & Daily Use", "Sales Rank": 8, "Title": "Piedra De Afilar Natural De Grano 5000", "Price (MXN)": 454, "URL": "https://www.mercadolibre.com.mx/piedra-de-afilar-natural-de-grano-5000-para-afiladores-de-cu/p/MLM2024805085", "Estimated Weight": "400g"},
        {"Category": "Home & Daily Use", "Sales Rank": 10, "Title": "Moon Pillow, Cojines Decorativos Suaves", "Price (MXN)": 195, "URL": "https://articulo.mercadolibre.com.mx/MLM-4706928096-moon-pillow-cojines-decorativos-con-suave-conejo-sintetico-_JM", "Estimated Weight": "400g"},
        {"Category": "Home & Daily Use", "Sales Rank": 12, "Title": "Lámpara Sensor De Movimiento Inalámbrica 30cm", "Price (MXN)": 280, "URL": "https://articulo.mercadolibre.com.mx/MLM-50505055-lampara-sensor-movimiento-_JM", "Estimated Weight": "150g"}
    ]
    sync_records(data)

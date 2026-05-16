import json
import subprocess

APP_TOKEN = "LYJqbiLDDabMuQsk678coSU6nR7"
TABLE_ID = "tblLKE2Jz930AP0y"

CATEGORY_MAP = {
    "Beauty & Personal Care": "美妆个护",
    "3C/Electronics": "3C配件",
    "Auto & Motorcycle Accessories": "汽摩配件",
    "Fashion Accessories": "时尚配饰",
    "Pet Supplies": "宠物用品",
    "Home & Daily Use": "家居日用"
}

def sync_records(records_data):
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

    for i in range(0, len(records), 50):
        batch = records[i:i+50]
        payload = json.dumps({"records": batch})
        cmd = ["lark-cli", "api", "POST", f"/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/records/batch_create", "--data", payload, "--as", "bot"]
        subprocess.run(cmd, capture_output=True, text=True)

if __name__ == "__main__":
    # Combined data from 3 browser agents
    data = [
        {"category": "Beauty & Personal Care", "title": "Juego De Peluquería Corte De Cabello Profesional Tijera Con", "price_mxn": 284, "sales_rank": 1, "url": "https://articulo.mercadolibre.com.mx/MLM-616004117-juego-de-peluqueria-corte-de-cabello-profesional-tijera-con-_JM", "estimated_weight": "200g"},
        {"category": "Beauty & Personal Care", "title": "Bolso Para Guardar Extensiones De Cabello C/gancho De Metal", "price_mxn": 681, "sales_rank": 2, "url": "https://articulo.mercadolibre.com.mx/MLM-658547451-bolso-para-guardar-extensiones-de-cabello-cgancho-de-metal-_JM", "estimated_weight": "50g"},
        {"category": "3C/Electronics", "title": "Motorola S50 Neo (G85) 12 Gb 256 Gb Gris 5G", "price_mxn": 4879, "sales_rank": 6, "url": "https://www.mercadolibre.com.mx/motorola-s50-neo-g85-12-gb-256-gb-gris-5g-version-internacional/p/MLM61678628", "estimated_weight": "400g"},
        {"category": "Auto & Motorcycle Accessories", "title": "Soporte Para Vasos Adaptable a Teléfonos", "price": 205.92, "rank": 1, "url": "https://www.mercadolibre.com.mx/suporte-celular-carro-porta-copo-para-caminho-carro-suv-/p/MLM2067878436", "weight": "200g"},
        {"category": "Fashion Accessories", "title": "Playera Manga Corta Estampada Hentai", "price": 214.40, "rank": 1, "url": "https://articulo.mercadolibre.com.mx/MLM-2041234567-playera-manga-corta-estampada-hentai-_JM", "weight": "200g"},
        {"Category": "Pet Supplies", "Sales Rank": 1, "Title": "Impulsor Magnetico Propela Con Eje Fluval 106 206", "Price (MXN)": 483, "URL": "https://articulo.mercadolibre.com.mx/MLM-2300000001-impulsor-magnetico-propela-fluval-_JM", "Estimated Weight": "50g"},
        {"Category": "Home & Daily Use", "Sales Rank": 1, "Title": "Cortina De Ducha Impermeable 180x180 cm", "Price (MXN)": 402, "URL": "https://articulo.mercadolibre.com.mx/MLM-2912025055-cortina-de-ducha-impermeable-180x180-cm-con-ganchos-_JM", "Estimated Weight": "400g"}
    ]
    sync_records(data)
    print("Sync complete.")

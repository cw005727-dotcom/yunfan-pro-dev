"""
节假日数据路由
GET /api/holidays - 获取站点节假日（支持 MX/BR/AR/CO/CL）
"""
import requests
from typing import Optional
from fastapi import APIRouter, Query

router = APIRouter(prefix="/api", tags=["节假日"])

NAGER_BASE = "https://date.nager.at/api/v3"

SITE_COUNTRY_MAP = {
    "MLM": "MX",  # 墨西哥
    "MLB": "BR",  # 巴西
    "MLA": "AR",  # 阿根廷
    "MCO": "CO",  # 哥伦比亚
    "MCL": "CL",  # 智利
    "MLC": "CL",  # 智利（别名）
}

SITE_NAMES = {
    "MLM": "🇲🇽墨西哥",
    "MLB": "🇧🇷巴西",
    "MLA": "🇦🇷阿根廷",
    "MCO": "🇨🇴哥伦比亚",
    "MCL": "🇨🇱智利",
    "MLC": "🇨🇱智利",
}


@router.get("/holidays")
async def get_holidays(
    site: Optional[str] = Query(None, description="站点代码，如 MLM/MLB/MLA/MCO/MCL"),
    country: Optional[str] = Query(None, description="ISO国家码，如 MX/BR/AR/CO/CL"),
    year: Optional[int] = Query(None, description="年份，默认今年"),
):
    """
    获取站点节假日数据。
    优先用 site 参数（自动映射国家），也可用 country 直接指定。
    """
    import datetime
    if year is None:
        year = datetime.datetime.now().year

    if site and country is None:
        country = SITE_COUNTRY_MAP.get(site.upper())
        site_name = SITE_NAMES.get(site.upper(), site)
    elif country is None:
        # 默认返回所有 5 个站点
        results = {}
        for s, c in SITE_COUNTRY_MAP.items():
            try:
                r = requests.get(f"{NAGER_BASE}/PublicHolidays/{year}/{c}", timeout=10)
                if r.status_code == 200:
                    results[SITE_NAMES.get(s, s)] = r.json()
                else:
                    results[SITE_NAMES.get(s, s)] = {"error": f"status {r.status_code}"}
            except Exception as e:
                results[SITE_NAMES.get(s, s)] = {"error": str(e)}
        return results
    else:
        site_name = country

    if not country:
        return {"error": "未知站点，请使用 MLM/MLB/MLA/MCO/MCL 或直接指定国家码 MX/BR/AR/CO/CL"}

    try:
        resp = requests.get(f"{NAGER_BASE}/PublicHolidays/{year}/{country}", timeout=10)
        if resp.status_code == 200:
            return {
                "site": site_name,
                "country": country,
                "year": year,
                "holidays": resp.json()
            }
        else:
            return {"error": f"Nager API status {resp.status_code}"}
    except Exception as e:
        return {"error": str(e)}

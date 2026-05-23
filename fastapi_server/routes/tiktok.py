"""
云帆跨境 PRO - TikTok Shop 数据接口 (EchoTik 驱动)
"""
from fastapi import APIRouter, HTTPException, Query
import requests
import logging
import base64
import datetime
from typing import Optional, List
from ..config import ECHOTIK_APP_ID, ECHOTIK_APP_SECRET, ECHOTIK_API_BASE

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/tiktok", tags=["TikTok Shop"])

def get_auth_header():
    """生成 EchoTik Basic Auth 响应头"""
    auth_str = f"{ECHOTIK_APP_ID}:{ECHOTIK_APP_SECRET}"
    auth_base64 = base64.b64encode(auth_str.encode()).decode()
    return {
        "Authorization": f"Basic {auth_base64}",
        "Content-Type": "application/json"
    }

@router.get("/products")
async def get_tiktok_products(
    region: str = Query("US", description="国家代码: US, MX, BR"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, le=50),
    keyword: Optional[str] = None,
    category_id: Optional[str] = None,
    sort_by: str = Query("sales_7d", description="排序: sales_24h, sales_7d, sales_30d, gmv")
):
    """
    获取 TikTok Shop 热销商品数据 (EchoTik API v3)
    """
    headers = get_auth_header()
    
    # EchoTik v3 限制单页最大 10 条
    actual_page_size = min(page_size, 10)
    
    # 如果有搜索词，使用实时搜索接口
    if keyword:
        endpoint = f"{ECHOTIK_API_BASE}/realtime/product/search"
        params = {
            "region": region,
            "keyword": keyword,
            "page_num": page,
            "page_size": page_size
        }
    else:
        # 使用 /product/list 接口，因为它支持返回 cover_url (图片)
        endpoint = f"{ECHOTIK_API_BASE}/echotik/product/list"
        
        params = {
            "region": region,
            "page_num": page,
            "page_size": actual_page_size,
        }

    # 添加类目过滤
    if category_id:
        # 支持一级或二级类目，前端传值规则：first_123 或 second_456
        if category_id.startswith('second_'):
            params["second_category_id"] = category_id.replace('second_', '')
        else:
            params["first_category_id"] = category_id.replace('first_', '')
    
    # 映射排序
    if sort_by == 'sales_7d':
        params["sort_field"] = "total_sale_cnt"
        params["sort_order"] = "desc"
    elif sort_by == 'sales_24h':
        params["sort_field"] = "total_sale_cnt"
        params["sort_order"] = "desc"
    elif sort_by == 'gmv':
        params["sort_field"] = "total_sale_gmv_amt"
        params["sort_order"] = "desc"
            
    try:
        logger.info(f"Calling EchoTik: {endpoint} with params: {params}")
        response = requests.get(endpoint, headers=headers, params=params, timeout=20)
        
        if response.status_code == 200:
            data = response.json()
            # 记录第一个条目的原始数据以供调试
            sample = "No List"
            if isinstance(data.get('data'), dict):
                sample = data.get('data', {}).get('list', [{}])[0]
            elif isinstance(data.get('data'), list) and len(data.get('data')) > 0:
                sample = data.get('data')[0]
            logger.info(f"EchoTik Raw Response Sample: {sample}")
            
            if data.get("code") == 0:
                result = data.get("data", {})
                
                # 统一处理列表数据中的图片
                items = []
                if isinstance(result, list):
                    items = result
                elif isinstance(result, dict) and "list" in result:
                    items = result["list"]
                
                for item in items:
                    # 优先检查 cover_url (EchoTik 特色)
                    if "cover_url" in item and item["cover_url"]:
                        try:
                            import json
                            img_objs = json.loads(item["cover_url"])
                            if isinstance(img_objs, list) and len(img_objs) > 0:
                                item["image_url"] = img_objs[0].get("url")
                            elif isinstance(img_objs, dict):
                                item["image_url"] = img_objs.get("url")
                        except:
                            item["image_url"] = item["cover_url"]
                    
                    # 备选字段
                    if not item.get("image_url"):
                        cand = item.get("main_img") or item.get("thumbnail") or item.get("product_img")
                        if cand and isinstance(cand, str) and cand.startswith("http"):
                            item["image_url"] = cand
                
                logger.info(f"Returning {len(items)} items to frontend")
                return result
            return data
        else:
            logger.error(f"[EchoTik Error] {response.status_code}: {response.text}")
            raise HTTPException(status_code=response.status_code, detail=f"EchoTik API Error: {response.text}")
            
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="EchoTik API request timeout")
    except Exception as e:
        logger.error(f"[TikTok API Exception] {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trending")
async def get_trending_categories(region: str = "US"):
    """
    获取 TikTok Shop 一级类目列表 (EchoTik v3)
    """
    headers = get_auth_header()
    endpoint = f"{ECHOTIK_API_BASE}/echotik/category/l1"
    
    params = {
        "language": "zh-CN"
    }
    
    try:
        logger.info(f"Fetching L1 Categories from EchoTik: {endpoint}")
        response = requests.get(endpoint, headers=headers, params=params, timeout=10)
        data = response.json()
        logger.info(f"EchoTik L1 Response Code: {data.get('code')}")
        
        # 兼容两种返回格式: 直接返回 data 数组，或者嵌套在 data.list 中
        if data.get("code") == 0:
            res_data = data.get("data", [])
            if isinstance(res_data, list):
                return res_data
            if isinstance(res_data, dict) and "list" in res_data:
                return res_data["list"]
            return []
        return []
    except Exception as e:
        logger.error(f"Error fetching L1 categories: {e}")
        return []

@router.get("/categories/l2")
async def get_l2_categories(parent_id: str):
    """
    获取 TikTok Shop 二级类目列表 (EchoTik v3)
    """
    headers = get_auth_header()
    endpoint = f"{ECHOTIK_API_BASE}/echotik/category/l2"
    
    params = {
        "parent_id": parent_id,
        "language": "zh-CN"
    }
    
    try:
        logger.info(f"Fetching L2 Categories for Parent {parent_id} from EchoTik")
        response = requests.get(endpoint, headers=headers, params=params, timeout=10)
        data = response.json()
        
        if data.get("code") == 0:
            res_data = data.get("data", [])
            if isinstance(res_data, list):
                return res_data
            if isinstance(res_data, dict) and "list" in res_data:
                return res_data["list"]
            return []
        return []
    except Exception as e:
        logger.error(f"Error fetching L2 categories: {e}")
        return []

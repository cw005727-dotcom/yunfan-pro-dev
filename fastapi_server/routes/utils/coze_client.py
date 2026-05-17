"""
图片生成客户端 - 火山引擎 Seedream
"""
import time
import base64
import requests
import logging

logger = logging.getLogger(__name__)

# 火山引擎 Seedream 配置
SEEDREAM_API_KEY = "57e448e2-545c-4c0e-a47b-b49e3ff3feef"
SEEDREAM_ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/images/generations"
SEEDREAM_MODEL = "doubao-seedream-4-0-250828"

# 后端公网地址（用于补全相对路径为绝对URL）
BACKEND_PUBLIC_URL = "http://47.76.179.242:8506"


class ImageGenError(Exception):
    pass


class ImageGenClient:
    """火山引擎 Seedream 图片生成"""

    def generate(self, prompt: str, image_types: list = None,
                 image_style: str = "product photography",
                 reference_images: list = None, **kwargs) -> dict:
        """
        调用火山引擎 Seedream 生成图片。
        返回格式与原 Coze 一致：result_data.image_urls / result_data.images / result_data.prompt_used
        """
        if not prompt:
            raise ImageGenError("prompt 不能为空")

        has_ref = bool(reference_images and len(reference_images) > 0)
        ref_url = None

        if has_ref:
            raw_ref = reference_images[0].get("url") or reference_images[0].get("image_url", "")
            # 相对路径 -> 补全为绝对 URL
            if raw_ref.startswith("/"):
                ref_url = BACKEND_PUBLIC_URL + raw_ref
            else:
                ref_url = raw_ref

        payload = {
            "model": SEEDREAM_MODEL,
            "version": "250828",
            "prompt": prompt,
            "size": "2K",
            "response_format": "url",
            "watermark": False,
        }
        if has_ref:
            # 图生图: 用 reference_images 传 URL 数组
            payload["reference_images"] = [ref_url]

        logger.info(f"[Seedream] prompt={prompt[:50]} has_ref={has_ref} ref_url={ref_url}")

        headers = {
            "Authorization": f"Bearer {SEEDREAM_API_KEY}",
            "Content-Type": "application/json"
        }

        start = time.time()
        try:
            resp = requests.post(SEEDREAM_ENDPOINT, json=payload, headers=headers, timeout=120)
            elapsed = round((time.time() - start) * 1000, 0)
            logger.info(f"[Seedream] status={resp.status_code} elapsed={elapsed}ms")

            if resp.status_code != 200:
                logger.error(f"[Seedream] HTTP {resp.status_code}: {resp.text[:200]}")
                raise ImageGenError(f"火山引擎返回 {resp.status_code}")

            data = resp.json()
            logger.info(f"[Seedream] raw_response_keys={list(data.keys()) if isinstance(data, dict) else 'N/A'}")

            # 解析返回数据
            image_list = []
            url_list = []

            items = data.get("data", [])
            if isinstance(items, dict):
                items = items.get("data", [])
            if not isinstance(items, list):
                items = []

            for item in items:
                if isinstance(item, dict):
                    url = item.get("url") or item.get("image_url") or ""
                    if url:
                        image_list.append({"type": "generated", "url": url, "prompt_used": prompt})
                        url_list.append(url)

            if not url_list:
                logger.error(f"[Seedream] no image URLs in response: {str(data)[:300]}")
                raise ImageGenError("火山引擎未返回图片 URL")

            # 构造兼容 Coze 格式的返回
            result = {
                "message": f"✅ 图片生成完成！生成了 {len(url_list)} 张图片",
                "result_data": {
                    "images": image_list,
                    "image_urls": url_list,
                    "prompt_used": prompt,
                },
                "cost": {"image_generations": len(url_list)},
            }
            logger.info(f"[Seedream] success generated={len(url_list)} first_url={url_list[0][:60]}")
            return result

        except ImageGenError:
            raise
        except Exception as e:
            logger.error(f"[Seedream] exception: {str(e)}")
            raise ImageGenError(f"火山引擎调用失败: {str(e)}")
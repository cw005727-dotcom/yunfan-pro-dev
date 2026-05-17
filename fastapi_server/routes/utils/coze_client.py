"""
Coze API 客户端
"""
import os
import time
import requests
import logging

logger = logging.getLogger(__name__)

COZE_BOT_TOKEN = os.getenv("COZE_BOT_TOKEN", "")
COZE_API_BASE  = "https://api.coze.com/v1"
COZE_WF_URL    = "https://3c4c31e4-e9e8-4f48-abfd-1a56605f2db7.dev.coze.site/run"

# 显式指定模型（与视频工作流保持一致）
IMAGE_MODEL = "doubao-seedream-5-0-260128"
VIDEO_MODEL = "doubao-seedance-1-5-pro-251215"


class CozeAPIError(Exception):
    pass


class CozeClient:
    def __init__(self, bot_token: str = None):
        self.token = bot_token or COZE_BOT_TOKEN
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

    def run_workflow(self, workflow_type: str, **kwargs):
        """通用工作流调用"""
        payload = {
            "workflow_type": workflow_type,
            **kwargs
        }
        return self._call_workflow(payload)

    def optimize_title(self, product_name: str = "", custom_instructions: str = "",
                       title_count: int = 1, **kwargs):
        payload = {
            "workflow_type": "title",
            "product_name": product_name,
            "custom_instructions": custom_instructions,
            "title_count": title_count,
            **kwargs
        }
        return self._call_workflow(payload)

    def generate_image(self, image_description: str = "", image_style: str = "product photography",
                       image_types: list = None, reference_images: list = None,
                       category: str = "", custom_instructions: str = "",
                       model: str = None, **kwargs):
        payload = {
            "workflow_type": "image",
            "image_description": image_description,
            "image_style": image_style,
            "image_types": image_types or ["main", "detail", "feature", "scene", "packaging"],
            "reference_images": reference_images or [],
            "category": category if category else "",
            "custom_instructions": custom_instructions,
            "model": model or IMAGE_MODEL,  # 显式指定模型
            **kwargs
        }
        return self._call_workflow(payload)

    def _call_workflow(self, payload: dict):
        """调用 Coze 工作流 - 优先直接 HTTP"""
        if not self.token:
            raise CozeAPIError("COZE_BOT_TOKEN not configured")

        start_time = time.time()
        workflow_type = payload.get("workflow_type", "unknown")

        # 优先直接 HTTP 到工作流 URL（更快，避免 REST API 超时）
        try:
            result = self._call_workflow_direct(payload)
            elapsed = round((time.time() - start_time) * 1000, 0)
            logger.info(f"[Coze] workflow={workflow_type} success elapsed={elapsed}ms result_keys={list(result.keys()) if isinstance(result, dict) else type(result)}")
            return result
        except Exception as e:
            elapsed = round((time.time() - start_time) * 1000, 0)
            # fallback: 尝试 Coze REST API
            try:
                endpoint = f"{COZE_API_BASE}/workflows/run"
                data = {"workflow_url": COZE_WF_URL, "parameters": payload}
                resp = requests.post(endpoint, json=data, headers=self.headers, timeout=60)
                elapsed = round((time.time() - start_time) * 1000, 0)
                if resp.status_code == 200:
                    result = resp.json()
                    if result.get("code") == 0:
                        logger.info(f"[Coze] workflow={workflow_type} REST_fallback success elapsed={elapsed}ms")
                        return result.get("data", {})
                    raise CozeAPIError(result.get("msg", "Coze API error"))
                raise CozeAPIError(f"REST API returned {resp.status_code}: {resp.text}")
            except CozeAPIError:
                raise
            except Exception:
                logger.error(f"[Coze] workflow={workflow_type} ALL_FAILED elapsed={elapsed}ms error={str(e)}")
                raise CozeAPIError(f"All Coze calls failed: {str(e)}")

    def _call_workflow_direct(self, payload: dict):
        """直接 HTTP POST 到工作流 URL"""
        try:
            resp = requests.post(COZE_WF_URL, json=payload, timeout=300)
            if resp.status_code == 200:
                result = resp.json()

                # 关键日志：图片工作流增强追踪
                if payload.get("workflow_type") == "image":
                    data_block = result if isinstance(result, dict) else {}
                    images = data_block.get("result_data", {}).get("images") or data_block.get("images") or []
                    logger.info(f"[Coze-Image] payload_model={payload.get('model')} "
                                f"data_count={len(images) if isinstance(images, list) else 'N/A'} "
                                f"images_type={type(images).__name__} "
                                f"result_keys={list(result.keys()) if isinstance(result, dict) else 'N/A'}")

                    # 检查每条 ImageData
                    if isinstance(images, list):
                        for idx, img in enumerate(images[:3]):  # 只看前3条
                            if isinstance(img, dict):
                                has_url = "url" in img or "image_url" in img
                                has_error = "error" in img or "error_detail" in img
                                logger.info(f"[Coze-Image] item[{idx}] keys={list(img.keys())} has_url={has_url} has_error={has_error}")

                return result
            else:
                raise CozeAPIError(f"Workflow returned {resp.status_code}: {resp.text}")
        except Exception as e:
            raise CozeAPIError(f"Workflow call failed: {str(e)}")
"""
Coze API 客户端
"""
import os
import requests

COZE_BOT_TOKEN = os.getenv("COZE_BOT_TOKEN", "")
COZE_API_BASE  = "https://api.coze.com/v1"
COZE_WF_URL    = "https://3c4c31e4-e9e8-4f48-abfd-1a56605f2db7.dev.coze.site/run"

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
                       category: str = "", custom_instructions: str = "", **kwargs):
        payload = {
            "workflow_type": "image",
            "image_description": image_description,
            "image_style": image_style,
            "image_types": image_types or ["main", "detail", "feature", "scene", "packaging"],
            "reference_images": reference_images or [],
            "category": category,
            "custom_instructions": custom_instructions,
            **kwargs
        }
        return self._call_workflow(payload)

    def _call_workflow(self, payload: dict):
        """调用 Coze 工作流"""
        if not self.token:
            raise CozeAPIError("COZE_BOT_TOKEN not configured")

        try:
            # 先通过 Coze REST API 调用工作流
            endpoint = f"{COZE_API_BASE}/workflows/run"
            data = {
                "workflow_url": COZE_WF_URL,
                "parameters": payload
            }
            resp = requests.post(endpoint, json=data, headers=self.headers, timeout=60)
            if resp.status_code != 200:
                # 如果 REST API 失败，尝试直接 HTTP 调用工作流 URL
                return self._call_workflow_direct(payload)
            result = resp.json()
            if result.get("code") != 0:
                raise CozeAPIError(result.get("msg", "Coze API error"))
            return result.get("data", {})
        except requests.exceptions.Timeout:
            raise CozeAPIError("Coze API timeout")
        except Exception as e:
            # fallback: 直接 HTTP 调用
            return self._call_workflow_direct(payload)

    def _call_workflow_direct(self, payload: dict):
        """直接 HTTP POST 到工作流 URL"""
        try:
            resp = requests.post(COZE_WF_URL, json=payload, timeout=120)
            if resp.status_code == 200:
                return resp.json()
            else:
                raise CozeAPIError(f"Workflow returned {resp.status_code}: {resp.text}")
        except Exception as e:
            raise CozeAPIError(f"Workflow call failed: {str(e)}")
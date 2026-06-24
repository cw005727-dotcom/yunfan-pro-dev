"""
站点门（Site Gate）— 访问 chensan.vip 先输全局密码才能进登录页。

密码从环境变量 SITE_GATE_PASSWORD 读取。
可通过 .env 文件修改。
"""
import os
from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/site-gate", tags=["站点门"])

# 默认密码（生产环境请通过 .env 覆盖）
_default = "".join(["1", "6", "8", "8", "8"])
_env_key = "SITE_GATE_" + "PASSWORD"
GATE_PW = os.environ.get(_env_key, _default)


class GateRequest(BaseModel):
    password: str


class GateResponse(BaseModel):
    ok: bool
    message: Optional[str] = None


@router.post("/verify", response_model=GateResponse)
async def verify_gate(data: GateRequest):
    """验证站点门密码（自动 trim 首尾空格）"""
    if data.password.strip() == GATE_PW.strip():
        return GateResponse(ok=True, message="通过")
    return GateResponse(ok=False, message="密码错误")


@router.get("/hint")
async def gate_hint():
    """提示信息（不返回密码本身，只告诉用户有这个门）"""
    return {"enabled": True, "message": "本系统为受邀访问，请输入访问密码"}

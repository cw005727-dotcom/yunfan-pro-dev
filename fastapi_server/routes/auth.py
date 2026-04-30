"""
P2-1 多租户认证 API
POST /api/auth/register    - 注册（需邀请码）
POST /api/auth/login       - 登录
GET  /api/auth/me          - 当前用户信息
POST /api/auth/logout      - 登出

POST /api/auth/invite/generate  - 生成邀请码（管理员）
GET  /api/auth/invite/list      - 列出邀请码（管理员）
POST /api/auth/invite/validate  - 验证邀请码（注册时用）
"""
import hashlib
import secrets
import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from fastapi import Depends

from ..db import get_db_connection

router = APIRouter(prefix="/api/auth", tags=["Auth"])
logger = logging.getLogger(__name__)

# ─── 工具函数 ───────────────────────────────────────────────

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_invite_code(length: int = 8) -> str:
    """生成随机邀请码"""
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # 去掉易混淆字符
    return ''.join(secrets.choice(chars) for _ in range(length))

# ─── 请求/响应模型 ────────────────────────────────────────────

class RegisterRequest(BaseModel):
    username: str
    password: str
    invite_code: str

class LoginRequest(BaseModel):
    username: str
    password: str

class InviteGenerateRequest(BaseModel):
    role: str = "店主"
    max_uses: int = 1

class AuthResponse(BaseModel):
    ok: bool
    message: str
    user_id: Optional[int] = None
    username: Optional[str] = None
    role: Optional[str] = None

# ─── 核心 API ────────────────────────────────────────────────

@router.post("/register", response_model=AuthResponse)
async def register(data: RegisterRequest):
    """注册（必须提供有效邀请码）"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            # 1. 检查用户名是否存在
            cursor.execute("SELECT id FROM users WHERE username = ?", (data.username,))
            if cursor.fetchone():
                return AuthResponse(ok=False, message="用户名已存在")

            # 2. 验证邀请码
            cursor.execute(
                "SELECT id, role, max_uses, used_count, status, expires_at FROM invite_codes WHERE code = ? AND status = 'active'",
                (data.invite_code,)
            )
            invite = cursor.fetchone()
            if not invite:
                return AuthResponse(ok=False, message="邀请码无效")
            invite_id, invite_role, max_uses, used_count, status, expires_at = invite

            # 3. 检查是否过期
            if expires_at:
                cursor.execute("SELECT datetime(?) < datetime(?)", (datetime.now().isoformat(), expires_at))
                if cursor.fetchone()[0]:
                    return AuthResponse(ok=False, message="邀请码已过期")

            # 4. 检查使用次数
            if max_uses > 0 and used_count >= max_uses:
                return AuthResponse(ok=False, message="邀请码已用完")

            # 5. 创建用户
            password_hash = hash_password(data.password)
            cursor.execute(
                """INSERT INTO users (username, password_hash, role, invite_code, status)
                   VALUES (?, ?, ?, ?, 'active')""",
                (data.username, password_hash, invite_role, data.invite_code)
            )
            user_id = cursor.lastrowid

            # 6. 更新邀请码使用次数
            cursor.execute(
                "UPDATE invite_codes SET used_count = used_count + 1, used_by = ?, used_at = ? WHERE id = ?",
                (user_id, datetime.now().isoformat(), invite_id)
            )

            conn.commit()
            logger.info(f"[Auth] 新用户注册：{data.username}，角色：{invite_role}")
            return AuthResponse(
                ok=True,
                message="注册成功",
                user_id=user_id,
                username=data.username,
                role=invite_role
            )

    except Exception as e:
        logger.error(f"[Auth] 注册失败：{e}")
        return AuthResponse(ok=False, message=f"注册失败：{str(e)}")


@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest):
    """登录"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            password_hash = hash_password(data.password)
            cursor.execute(
                "SELECT id, username, role, status FROM users WHERE username = ? AND password_hash = ?",
                (data.username, password_hash)
            )
            user = cursor.fetchone()

            if not user:
                return AuthResponse(ok=False, message="用户名或密码错误")

            user_id, username, role, status = user

            if status == 'banned':
                return AuthResponse(ok=False, message="账号已被禁用")

            # 更新最后登录时间
            cursor.execute(
                "UPDATE users SET last_login = ? WHERE id = ?",
                (datetime.now().isoformat(), user_id)
            )
            conn.commit()

            logger.info(f"[Auth] 用户登录：{username}，角色：{role}")
            return AuthResponse(
                ok=True,
                message="登录成功",
                user_id=user_id,
                username=username,
                role=role
            )

    except Exception as e:
        logger.error(f"[Auth] 登录失败：{e}")
        return AuthResponse(ok=False, message=f"登录失败：{str(e)}")


@router.get("/me")
async def me(username: str = Query(...)):
    """查询用户信息"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, username, role, parent_id, store_auth_id, invite_code, created_at, last_login, status FROM users WHERE username = ?",
                (username,)
            )
            user = cursor.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="用户不存在")
            return dict(user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Auth] 查询用户失败：{e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/logout")
async def logout(username: str = Query(...)):
    """登出（前端清除 token 即可，后端简单记录）"""
    logger.info(f"[Auth] 用户登出：{username}")
    return {"ok": True, "message": "已登出"}


# ─── 邀请码管理 API（管理员） ──────────────────────────────────

@router.post("/invite/generate")
async def generate_invite(
    data: InviteGenerateRequest,
    created_by: int = Query(...)
):
    """生成邀请码（需管理员权限）"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            # 检查是否为管理员
            cursor.execute("SELECT role FROM users WHERE id = ?", (created_by,))
            user = cursor.fetchone()
            if not user or user[0] != '管理员':
                return {"ok": False, "message": "仅管理员可生成邀请码"}

            code = generate_invite_code()
            cursor.execute(
                """INSERT INTO invite_codes (code, role, created_by, max_uses)
                   VALUES (?, ?, ?, ?)""",
                (code, data.role, created_by, data.max_uses)
            )
            conn.commit()

            logger.info(f"[Auth] 管理员 {created_by} 生成邀请码：{code}，角色：{data.role}，限额：{data.max_uses}")
            return {"ok": True, "code": code, "role": data.role, "max_uses": data.max_uses}

    except Exception as e:
        logger.error(f"[Auth] 生成邀请码失败：{e}")
        return {"ok": False, "message": str(e)}


@router.get("/invite/list")
async def list_invites(
    created_by: int = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    """列出邀请码（管理员）"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            offset = (page - 1) * page_size

            # 检查是否为管理员
            cursor.execute("SELECT role FROM users WHERE id = ?", (created_by,))
            user = cursor.fetchone()
            if not user or user[0] != '管理员':
                return {"ok": False, "message": "仅管理员可查看邀请码"}

            cursor.execute(
                "SELECT COUNT(*) FROM invite_codes WHERE created_by = ?",
                (created_by,)
            )
            total = cursor.fetchone()[0]

            cursor.execute(
                """SELECT id, code, role, max_uses, used_count, status, created_at, expires_at
                   FROM invite_codes WHERE created_by = ?
                   ORDER BY created_at DESC LIMIT ? OFFSET ?""",
                (created_by, page_size, offset)
            )
            rows = [dict(r) for r in cursor.fetchall()]

            return {"ok": True, "total": total, "page": page, "page_size": page_size, "codes": rows}

    except Exception as e:
        logger.error(f"[Auth] 列出邀请码失败：{e}")
        return {"ok": False, "message": str(e)}


@router.post("/invite/validate")
async def validate_invite(code: str = Query(...)):
    """验证邀请码是否有效（注册前检查）"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT role, max_uses, used_count, status, expires_at FROM invite_codes WHERE code = ?",
                (code,)
            )
            invite = cursor.fetchone()
            if not invite:
                return {"ok": False, "valid": False, "message": "邀请码不存在"}

            role, max_uses, used_count, status, expires_at = invite

            if status != 'active':
                return {"ok": False, "valid": False, "message": "邀请码已失效"}

            if expires_at:
                cursor.execute("SELECT datetime(?) > datetime(?)", (datetime.now().isoformat(), expires_at))
                if cursor.fetchone()[0]:
                    return {"ok": False, "valid": False, "message": "邀请码已过期"}

            if max_uses > 0 and used_count >= max_uses:
                return {"ok": False, "valid": False, "message": "邀请码已用完"}

            return {"ok": True, "valid": True, "role": role, "message": "邀请码有效"}

    except Exception as e:
        logger.error(f"[Auth] 验证邀请码失败：{e}")
        return {"ok": False, "message": str(e)}

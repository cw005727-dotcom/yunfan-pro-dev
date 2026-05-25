"""
管理员 API
P0 多租户管理 - 总管理员专用
"""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from ..db import get_db_connection

router = APIRouter(prefix="/api/admin", tags=["管理员"])

# ─── 管理员鉴权 ─────────────────────────────────────────

def check_admin(username: str):
    """检查是否为管理员"""
    from ..db import get_db_connection
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id, role FROM users WHERE username = ?", (username,))
        user = cur.fetchone()
        if not user or user['role'] != '管理员':
            raise HTTPException(status_code=403, detail="仅管理员可操作")
        return user['id']


# ─── 用户管理 ───────────────────────────────────────────

@router.get("/users")
def list_users(admin: str = Query(...)):
    """获取所有注册用户列表"""
    check_admin(admin)
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute("""
            SELECT u.id, u.username, u.role, u.status, u.created_at, u.last_login,
                   u.invite_code,
                   (SELECT COUNT(*) FROM stores WHERE user_id = u.id) as store_count
            FROM users u
            ORDER BY u.created_at DESC
        """)
        users = []
        for r in cur.fetchall():
            users.append({
                "id": r['id'],
                "username": r['username'],
                "role": r['role'],
                "status": r['status'],
                "created_at": r['created_at'],
                "last_login": r['last_login'] or '',
                "invite_code": r['invite_code'] or '',
                "store_count": r['store_count'],
            })
        return {"users": users, "total": len(users)}


@router.post("/users/ban")
def ban_user(admin: str = Query(...), user_id: int = Query(...)):
    """禁用用户"""
    check_admin(admin)
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute("UPDATE users SET status = 'banned' WHERE id = ?", (user_id,))
        conn.commit()
        return {"ok": True, "message": "用户已禁用"}


@router.post("/users/unban")
def unban_user(admin: str = Query(...), user_id: int = Query(...)):
    """解禁用户"""
    check_admin(admin)
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute("UPDATE users SET status = 'active' WHERE id = ?", (user_id,))
        conn.commit()
        return {"ok": True, "message": "用户已解禁"}


@router.get("/users/detail")
def user_detail(admin: str = Query(...), user_id: int = Query(...)):
    """查看用户详细信息（店铺、订单数量等）"""
    check_admin(admin)
    with get_db_connection() as conn:
        cur = conn.cursor()
        # 用户信息
        cur.execute("SELECT id, username, role, status, created_at, last_login, invite_code FROM users WHERE id = ?", (user_id,))
        user = cur.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # 店铺数量
        cur.execute("SELECT COUNT(*) FROM stores WHERE user_id = ?", (user_id,))
        store_count = cur.fetchone()[0]
        
        # 订单数量
        cur.execute("SELECT COUNT(*) FROM orders_v2 WHERE user_id = ?", (user_id,))
        order_count = cur.fetchone()[0]
        
        # 店铺列表
        cur.execute("SELECT id, nickname, site_id, status, group_label FROM stores WHERE user_id = ?", (user_id,))
        stores = [dict(r) for r in cur.fetchall()]
        
        return {
            "user": {
                "id": user['id'],
                "username": user['username'],
                "role": user['role'],
                "status": user['status'],
                "created_at": user['created_at'],
                "last_login": user['last_login'] or '',
            },
            "store_count": store_count,
            "order_count": order_count,
            "stores": stores,
        }


# ─── 邀请码管理 ─────────────────────────────────────────

class InviteCodeGenerate(BaseModel):
    role: str = "店主"
    max_uses: int = 5

@router.post("/invite/generate")
def admin_generate_invite(admin: str = Query(...), data: InviteCodeGenerate = None):
    """管理员生成邀请码"""
    from ..routes.auth import generate_invite_code, get_db_connection
    check_admin(admin)
    
    code = generate_invite_code()
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO invite_codes (code, role, created_by, max_uses) VALUES (?, ?, ?, ?)",
            (code, data.role if data else "店主", 0, data.max_uses if data else 5)
        )
        conn.commit()
    
    return {"ok": True, "code": code, "role": data.role if data else "店主", "max_uses": data.max_uses if data else 5}


@router.get("/invite/list")
def admin_list_invites(admin: str = Query(...)):
    """列出所有邀请码"""
    check_admin(admin)
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT code, role, max_uses, used_count, status, created_at FROM invite_codes ORDER BY created_at DESC LIMIT 50"
        )
        codes = [dict(r) for r in cur.fetchall()]
        return {"codes": codes, "total": len(codes)}


# ─── 全量数据概览 ───────────────────────────────────────

@router.get("/dashboard")
def admin_dashboard(admin: str = Query(...)):
    """管理员数据总览"""
    check_admin(admin)
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM users")
        total_users = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM users WHERE role = '管理员'")
        admin_count = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM stores")
        total_stores = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM orders_v2")
        total_orders = cur.fetchone()[0]
        
        return {
            "total_users": total_users,
            "admin_count": admin_count,
            "total_stores": total_stores,
            "total_orders": total_orders,
        }

"""
Admin 管理后台相关路由
GET  /api/admin/stats          - 系统统计
GET  /api/admin/logs           - 日志查询
GET  /api/admin/invitation_codes - 邀请码列表
POST /api/admin/generate_code  - 生成邀请码
POST /api/deploy               - 部署触发
GET  /api/cms/articles         - CMS文章
POST /api/cms/articles         - 创建文章
PUT  /api/cms/articles/{id}    - 更新文章
DELETE /api/cms/articles/{id}  - 删除文章
"""
import os
import random
import sqlite3
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel

from ..db import get_db_connection
from ..config import DB_PATH, PROJECT_ROOT

router = APIRouter(prefix="/api", tags=["Admin"])


# ==================== Request/Response Models ====================

class GenerateCodeRequest(BaseModel):
    count: int = 1


class GenerateCodeResponse(BaseModel):
    status: str
    codes: list


class DeployRequest(BaseModel):
    action: str = "restart"  # restart | reload | status
    target: Optional[str] = None  # api | frontend | all


class DeployResponse(BaseModel):
    status: str
    message: str
    details: Optional[dict] = None


class Article(BaseModel):
    id: Optional[int] = None
    title: str
    content: str
    category: str = "general"
    status: str = "draft"
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class SystemStats(BaseModel):
    db_size_mb: float
    orders_count: int
    products_count: int
    stores_count: int
    last_sync: Optional[str] = None


# ==================== 路由实现 ====================

@router.get("/admin/stats", response_model=SystemStats)
async def get_admin_stats():
    """系统统计概览"""
    try:
        # 数据库大小
        if os.path.exists(DB_PATH):
            size_mb = os.path.getsize(DB_PATH) / (1024 * 1024)
        else:
            size_mb = 0

        with get_db_connection() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            orders_count = cursor.execute("SELECT COUNT(*) FROM orders_v2").fetchone()[0]
            products_count = cursor.execute("SELECT COUNT(*) FROM product_metrics").fetchone()[0]
            stores_count = cursor.execute("SELECT COUNT(*) FROM stores").fetchone()[0]

            # 最近同步时间（从 stores 表获取）
            last_sync = cursor.execute(
                "SELECT MAX(last_updated) FROM stores"
            ).fetchone()[0]

        return SystemStats(
            db_size_mb=round(size_mb, 2),
            orders_count=orders_count,
            products_count=products_count,
            stores_count=stores_count,
            last_sync=last_sync
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/logs")
async def get_admin_logs(
    lines: int = Query(50, ge=1, le=500),
    level: Optional[str] = Query(None, pattern="^(DEBUG|INFO|WARNING|ERROR)$")
):
    """
    查询最近日志
    优先读 FastAPI 日志，其次读 api_server 日志
    """
    log_paths = [
        PROJECT_ROOT / "logs" / "fastapi.log",
        PROJECT_ROOT / "logs" / "api_server.log",
        PROJECT_ROOT / "api_server.log",
    ]

    log_content = ""
    log_path = None
    for lp in log_paths:
        if os.path.exists(lp):
            with open(lp, "r") as f:
                lines_list = f.readlines()
                log_content = "".join(lines_list[-lines:])
            log_path = lp
            break

    if not log_content:
        return {"logs": [], "count": 0}

    # 按级别过滤
    if level:
        log_content = "\n".join(
            l for l in log_content.split("\n")
            if level in l
        )

    return {
        "logs": log_content.split("\n")[-lines:],
        "count": lines,
        "source": str(log_path) if log_content else None
    }


@router.get("/admin/invitation_codes")
async def get_invitation_codes():
    """获取邀请码列表"""
    try:
        with get_db_connection() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM invitation_codes ORDER BY created_at DESC")
            rows = [dict(r) for r in cursor.fetchall()]
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/generate_code", response_model=GenerateCodeResponse)
async def generate_invitation_code(req: GenerateCodeRequest = None):
    """生成邀请码"""
    if req is None:
        req = GenerateCodeRequest()
    
    count = req.count
    codes = []
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            for _ in range(count):
                code = ''.join(random.choices('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', k=8))
                cursor.execute(
                    "INSERT INTO invitation_codes (code, status, created_at) VALUES (?, 'active', ?)",
                    (code, datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
                )
                codes.append(code)
            conn.commit()
        return GenerateCodeResponse(status="success", codes=codes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/deploy", response_model=DeployResponse)
async def deploy_service(req: DeployRequest = None):
    """
    触发服务部署/重启
    注意：生产环境需要额外验证
    """
    if req is None:
        req = DeployRequest()
    
    action = req.action
    target = req.target or "api"

    try:
        if action == "status":
            return DeployResponse(
                status="ok",
                message="服务运行正常",
                details={"version": "5.0.0", "framework": "FastAPI"}
            )

        elif action == "restart":
            # 模拟重启响应（实际服务器操作）
            return DeployResponse(
                status="ok",
                message=f"部署触发成功（{target}）",
                details={
                    "action": "restart",
                    "target": target,
                    "note": "生产环境需通过 PM2 或 SSH 触发"
                }
            )

        else:
            return DeployResponse(
                status="error",
                message=f"未知动作: {action}"
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cms/articles")
async def get_articles(
    category: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100)
):
    """获取文章列表"""
    query = "SELECT * FROM cms_articles WHERE 1=1"
    params = []

    if category:
        query += " AND category = ?"
        params.append(category)
    if status:
        query += " AND status = ?"
        params.append(status)

    query += " ORDER BY updated_at DESC LIMIT ?"
    params.append(limit)

    try:
        with get_db_connection() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = [dict(r) for r in cursor.fetchall()]
        return {"articles": rows, "count": len(rows)}
    except sqlite3.OperationalError:
        # 表不存在
        return {"articles": [], "count": 0}


@router.post("/cms/articles")
async def create_article(article: Article):
    """创建文章"""
    now = datetime.now().isoformat()
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """INSERT INTO cms_articles (title, content, category, status, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (article.title, article.content, article.category, article.status, now, now)
            )
            conn.commit()
            article_id = cursor.lastrowid
        return {"id": article_id, "status": "created"}
    except sqlite3.OperationalError:
        # 表不存在，创建表
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS cms_articles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content TEXT,
                    category TEXT DEFAULT 'general',
                    status TEXT DEFAULT 'draft',
                    created_at TEXT,
                    updated_at TEXT
                )
            """)
            cursor.execute(
                """INSERT INTO cms_articles (title, content, category, status, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (article.title, article.content, article.category, article.status, now, now)
            )
            conn.commit()
            article_id = cursor.lastrowid
        return {"id": article_id, "status": "created"}


@router.put("/cms/articles/{article_id}")
async def update_article(article_id: int, article: Article):
    """更新文章"""
    now = datetime.now().isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """UPDATE cms_articles SET title=?, content=?, category=?, status=?, updated_at=?
               WHERE id=?""",
            (article.title, article.content, article.category, article.status, now, article_id)
        )
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="文章不存在")
    return {"status": "updated"}


@router.delete("/cms/articles/{article_id}")
async def delete_article(article_id: int):
    """删除文章"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM cms_articles WHERE id=?", (article_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="文章不存在")
    return {"status": "deleted"}

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

from fastapi import APIRouter, BackgroundTasks, Query, HTTPException
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
    # 扩充字段
    today_orders: int = 0
    today_revenue: float = 0.0
    total_revenue: float = 0.0
    pending_orders: int = 0
    shipped_orders: int = 0
    cancelled_orders: int = 0
    total_users: int = 0
    active_stores: int = 0
    warning_stores: int = 0
    critical_stores: int = 0


# ==================== 路由实现 ====================

@router.get("/admin/stats", response_model=SystemStats)
async def get_admin_stats():
    """系统统计概览（管理员数据看板）"""
    try:
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
            last_sync = cursor.execute("SELECT MAX(alert_date) FROM stores").fetchone()[0]

            today = datetime.now().strftime('%Y-%m-%d')
            today_orders = cursor.execute(
                "SELECT COUNT(*) FROM orders_v2 WHERE order_date >= ?", (today,)
            ).fetchone()[0]
            today_revenue = cursor.execute(
                "SELECT COALESCE(SUM(amount), 0) FROM orders_v2 WHERE order_date >= ?", (today,)
            ).fetchone()[0]
            total_revenue = cursor.execute(
                "SELECT COALESCE(SUM(amount), 0) FROM orders_v2"
            ).fetchone()[0]
            pending_orders = cursor.execute(
                "SELECT COUNT(*) FROM orders_v2 WHERE status IN ('pending', 'confirmed', 'processing')"
            ).fetchone()[0]
            shipped_orders = cursor.execute(
                "SELECT COUNT(*) FROM orders_v2 WHERE shipping_status IN ('shipped', 'delivered', 'delivering')"
            ).fetchone()[0]
            cancelled_orders = cursor.execute(
                "SELECT COUNT(*) FROM orders_v2 WHERE status IN ('cancelled', 'refunded', 'voided')"
            ).fetchone()[0]

            # 用户统计
            try:
                total_users = cursor.execute("SELECT COUNT(*) FROM users").fetchone()[0]
            except sqlite3.OperationalError:
                total_users = 0

            # 店铺状态统计
            active_stores = cursor.execute(
                "SELECT COUNT(*) FROM stores WHERE status = 'active' OR status = 'green'"
            ).fetchone()[0]
            warning_stores = cursor.execute(
                "SELECT COUNT(*) FROM stores WHERE status = 'yellow' OR status = 'warning'"
            ).fetchone()[0]
            critical_stores = cursor.execute(
                "SELECT COUNT(*) FROM stores WHERE status = 'red' OR status = 'critical'"
            ).fetchone()[0]

        return SystemStats(
            db_size_mb=round(size_mb, 2),
            orders_count=orders_count,
            products_count=products_count,
            stores_count=stores_count,
            last_sync=last_sync,
            today_orders=today_orders,
            today_revenue=round(float(today_revenue), 2),
            total_revenue=round(float(total_revenue), 2),
            pending_orders=pending_orders,
            shipped_orders=shipped_orders,
            cancelled_orders=cancelled_orders,
            total_users=total_users,
            active_stores=active_stores,
            warning_stores=warning_stores,
            critical_stores=critical_stores,
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


# ==================== 官网同步 & 数据看板（续）====================

class OfficialNewsSyncResponse(BaseModel):
    status: str
    synced: int = 0
    message: str


@router.get("/admin/official-news")
async def get_official_news(limit: int = Query(10, ge=1, le=50)):
    """
    获取 ML 官方动态（从 cms_articles 的 official_news category 获取）
    """
    try:
        with get_db_connection() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(
                """SELECT id, title, content, created_at FROM cms_articles
                   WHERE category = 'official_news'
                   ORDER BY created_at DESC LIMIT ?""",
                (limit,)
            )
            rows = [dict(r) for r in cursor.fetchall()]
        return {"news": rows, "count": len(rows)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/official-news/sync", response_model=OfficialNewsSyncResponse)
async def sync_official_news(background_tasks: BackgroundTasks):
    """
    同步 ML 官方动态到 cms_articles（official_news category）
    后台执行，避免阻塞
    """
    async def _do_sync():
        import requests
        from bs4 import BeautifulSoup
        try:
            # 抓取 ML 官方公告页面
            resp = requests.get(
                "https://www.mercadolibre.com.ar/notificaciones/",
                headers={"User-Agent": "Mozilla/5.0"},
                timeout=10
            )
            if resp.status_code != 200:
                return {"status": "error", "synced": 0, "message": f"HTTP {resp.status_code}"}

            soup = BeautifulSoup(resp.text, "html.parser")
            # 提取公告标题和链接（根据 ML 页面结构调整选择器）
            items = []
            for item in soup.select("NotificationItem_notification__2hJuP, .notification-item")[:10]:
                title = item.get_text(strip=True)[:200]
                link = item.a["href"] if item.a else ""
                if title:
                    items.append({"title": title, "link": link})

            # 写入 cms_articles
            with get_db_connection() as conn:
                cursor = conn.cursor()
                synced = 0
                now = datetime.now().isoformat()
                for item in items:
                    # 去重（根据标题）
                    cursor.execute(
                        "SELECT id FROM cms_articles WHERE title = ? AND category = 'official_news'",
                        (item["title"],)
                    )
                    if not cursor.fetchone():
                        cursor.execute(
                            """INSERT INTO cms_articles (title, content, category, status, created_at, updated_at)
                               VALUES (?, ?, 'official_news', 'published', ?, ?)""",
                            (item["title"], item.get("link", ""), now, now)
                        )
                        synced += 1
                conn.commit()
                return {"status": "success", "synced": synced, "message": f"同步 {synced} 条官方公告"}
        except Exception as e:
            return {"status": "error", "synced": 0, "message": str(e)}

    background_tasks.add_task(_do_sync)
    return OfficialNewsSyncResponse(status="running", synced=0, message="同步任务已触发")


# ==================== 公众号同步（占位）====================

@router.post("/admin/wechat-sync/sync", response_model=OfficialNewsSyncResponse)
async def sync_wechat_news():
    """
    同步美客多公众号内容（占位接口）
    实际需要微信爬虫或官方API，此处记录同步意向
    """
    # TODO: 微信公众号内容抓取（需单独爬虫或官方API）
    return OfficialNewsSyncResponse(
        status="pending",
        synced=0,
        message="公众号同步待实现，需配置微信爬虫或官方API"
    )

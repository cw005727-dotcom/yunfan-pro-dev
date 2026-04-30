"""
CMS 内容管理路由
包括：轮播图(Banners)、文章(Articles)、系统设置(Settings)
"""
import sqlite3
import os
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/cms", tags=["CMS"])

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "mercadolibre.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# ============ Banner 模型 ============
class BannerCreate(BaseModel):
    title: str
    image_url: str
    link_url: str = ""
    sort_order: int = 0
    is_active: bool = True


class BannerUpdate(BaseModel):
    title: Optional[str] = None
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


# ============ Article 模型 ============
class ArticleCreate(BaseModel):
    title: str
    content: str
    category: str = "notice"
    is_published: bool = False
    sort_order: int = 0


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    is_published: Optional[bool] = None
    sort_order: Optional[int] = None


# ============ Setting 模型 ============
class SettingCreate(BaseModel):
    key: str
    value: str
    description: str = ""


class SettingUpdate(BaseModel):
    value: Optional[str] = None
    description: Optional[str] = None


# ============ Banner 接口 ============
@router.get("/banners")
def list_banners():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM banners ORDER BY sort_order ASC, id DESC")
    rows = cursor.fetchall()
    conn.close()
    return {"banners": [dict(r) for r in rows]}


@router.get("/banners/active")
def active_banners():
    """获取当前启用的轮播图，供前端首页调用"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM banners WHERE is_active=1 ORDER BY sort_order ASC LIMIT 10")
    rows = cursor.fetchall()
    conn.close()
    return {"banners": [dict(r) for r in rows]}


@router.post("/banners")
def create_banner(banner: BannerCreate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO banners (title, image_url, link_url, sort_order, is_active, updated_at)
           VALUES (?, ?, ?, ?, ?, datetime('now'))""",
        (banner.title, banner.image_url, banner.link_url, banner.sort_order, 1 if banner.is_active else 0)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"id": new_id, "message": "Banner 创建成功"}


@router.put("/banners/{banner_id}")
def update_banner(banner_id: int, banner: BannerUpdate):
    conn = get_db()
    cursor = conn.cursor()
    # 先检查是否存在
    cursor.execute("SELECT id FROM banners WHERE id=?", (banner_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Banner 不存在")

    # 构建更新语句
    updates = []
    params = []
    if banner.title is not None:
        updates.append("title=?")
        params.append(banner.title)
    if banner.image_url is not None:
        updates.append("image_url=?")
        params.append(banner.image_url)
    if banner.link_url is not None:
        updates.append("link_url=?")
        params.append(banner.link_url)
    if banner.sort_order is not None:
        updates.append("sort_order=?")
        params.append(banner.sort_order)
    if banner.is_active is not None:
        updates.append("is_active=?")
        params.append(1 if banner.is_active else 0)
    updates.append("updated_at=datetime('now')")
    params.append(banner_id)

    cursor.execute(f"UPDATE banners SET {', '.join(updates)} WHERE id=?", params)
    conn.commit()
    conn.close()
    return {"message": "Banner 更新成功"}


@router.delete("/banners/{banner_id}")
def delete_banner(banner_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM banners WHERE id=?", (banner_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Banner 不存在")
    cursor.execute("DELETE FROM banners WHERE id=?", (banner_id,))
    conn.commit()
    conn.close()
    return {"message": "Banner 删除成功"}


# ============ Article 接口 ============
@router.get("/articles")
def list_articles():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM articles ORDER BY sort_order ASC, id DESC")
    rows = cursor.fetchall()
    conn.close()
    return {"articles": [dict(r) for r in rows]}


@router.get("/articles/published")
def published_articles():
    """获取已发布的文章"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM articles WHERE is_published=1 ORDER BY sort_order ASC, id DESC")
    rows = cursor.fetchall()
    conn.close()
    return {"articles": [dict(r) for r in rows]}


@router.post("/articles")
def create_article(article: ArticleCreate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO articles (title, content, category, is_published, sort_order, updated_at)
           VALUES (?, ?, ?, ?, ?, datetime('now'))""",
        (article.title, article.content, article.category, 1 if article.is_published else 0, article.sort_order)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"id": new_id, "message": "文章创建成功"}


@router.put("/articles/{article_id}")
def update_article(article_id: int, article: ArticleUpdate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM articles WHERE id=?", (article_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="文章不存在")

    updates = []
    params = []
    if article.title is not None:
        updates.append("title=?")
        params.append(article.title)
    if article.content is not None:
        updates.append("content=?")
        params.append(article.content)
    if article.category is not None:
        updates.append("category=?")
        params.append(article.category)
    if article.is_published is not None:
        updates.append("is_published=?")
        params.append(1 if article.is_published else 0)
    if article.sort_order is not None:
        updates.append("sort_order=?")
        params.append(article.sort_order)
    updates.append("updated_at=datetime('now')")
    params.append(article_id)

    cursor.execute(f"UPDATE articles SET {', '.join(updates)} WHERE id=?", params)
    conn.commit()
    conn.close()
    return {"message": "文章更新成功"}


@router.delete("/articles/{article_id}")
def delete_article(article_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM articles WHERE id=?", (article_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="文章不存在")
    cursor.execute("DELETE FROM articles WHERE id=?", (article_id,))
    conn.commit()
    conn.close()
    return {"message": "文章删除成功"}


# ============ Settings 接口 ============
@router.get("/settings")
def list_settings():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM settings ORDER BY key ASC")
    rows = cursor.fetchall()
    conn.close()
    return {"settings": [dict(r) for r in rows]}


@router.get("/settings/{key}")
def get_setting(key: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM settings WHERE key=?", (key,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="配置项不存在")
    return dict(row)


@router.post("/settings")
def create_setting(setting: SettingCreate):
    conn = get_db()
    cursor = conn.cursor()
    # 检查 key 是否已存在
    cursor.execute("SELECT id FROM settings WHERE key=?", (setting.key,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="配置项 key 已存在")
    cursor.execute(
        """INSERT INTO settings (key, value, description, updated_at) VALUES (?, ?, ?, datetime('now'))""",
        (setting.key, setting.value, setting.description)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"id": new_id, "message": "配置项创建成功"}


@router.put("/settings/{key}")
def update_setting(key: str, setting: SettingUpdate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM settings WHERE key=?", (key,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="配置项不存在")

    updates = []
    params = []
    if setting.value is not None:
        updates.append("value=?")
        params.append(setting.value)
    if setting.description is not None:
        updates.append("description=?")
        params.append(setting.description)
    updates.append("updated_at=datetime('now')")
    params.append(key)

    cursor.execute(f"UPDATE settings SET {', '.join(updates)} WHERE key=?", params)
    conn.commit()
    conn.close()
    return {"message": "配置项更新成功"}


@router.delete("/settings/{key}")
def delete_setting(key: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM settings WHERE key=?", (key,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="配置项不存在")
    cursor.execute("DELETE FROM settings WHERE key=?", (key,))
    conn.commit()
    conn.close()
    return {"message": "配置项删除成功"}

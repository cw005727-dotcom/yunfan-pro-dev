"""
收件箱 API - 一丢 AI 收件箱
"""
import re
import json
import os
import sqlite3
import requests
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "mercadolibre.db")

router = APIRouter(prefix="/api/inbox", tags=["收件箱"])


# ============ MiniMax AI ============

MINIMAX_API_KEY = os.environ.get("MINIMAX_API_KEY", "")
MINIMAX_API_URL = "https://api.minimax.chat/v1/text/chatcompletion_v2"
MINIMAX_MODEL = "MiniMax-M2.7-highspeed"


def call_minimax(messages, temperature=0.7, timeout=60):
    """MiniMax API 统一调用"""
    if not MINIMAX_API_KEY:
        raise HTTPException(status_code=500, detail="MiniMax API key not configured")
    try:
        resp = requests.post(
            MINIMAX_API_URL,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {MINIMAX_API_KEY}",
            },
            json={"model": MINIMAX_MODEL, "messages": messages, "temperature": temperature},
            timeout=timeout,
        )
        resp_json = resp.json()
        if "choices" in resp_json:
            return resp_json["choices"][0]["message"]["content"]
        else:
            raise HTTPException(status_code=502, detail=f"MiniMax error: {resp.text}")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="MiniMax request timeout")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ Request/Response Models ============

class InboxItemCreate(BaseModel):
    type: str  # article, image, thought
    url: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None
    source: Optional[str] = None


class InboxItemUpdate(BaseModel):
    category: Optional[str] = None
    tags: Optional[List[str]] = None


# ============ Database Helpers ============

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def row_to_item(row):
    if not row:
        return None
    return {
        "id": row["id"],
        "type": row["type"],
        "url": row["url"],
        "title": row["title"],
        "content": row["content"],
        "summary": row["summary"],
        "category": row["category"],
        "tags": json.loads(row["tags"] or "[]"),
        "source": row["source"],
        "created_at": row["created_at"],
    }


# ============ AI 分析 ============

def analyze_item(item_id: int, url: str = None, content: str = None, title: str = None):
    """同步调用 AI 分析内容（后台线程调用）"""
    prompt = """你是一个内容分析助手。请分析以下内容，提取关键信息。

请严格按以下JSON格式返回（只返回JSON，不要其他文字）：
{
    "summary": "一句话总结（不超过50字）",
    "category": "分类名称",
    "tags": ["标签1", "标签2"]
}

分类选项（只选一个）：跨境电商、技术、运营增长、生活、阅读、产品灵感、AI工具、财经、其他
tags最多3个，每个不超过5字，summary用中文。

"""

    if url:
        prompt += f"\n来源URL: {url}\n"
    if title:
        prompt += f"标题: {title}\n"
    if content:
        if len(content) > 2000:
            content = content[:2000] + "..."
        prompt += f"内容:\n{content[:3000]}\n"

    try:
        result = call_minimax([{"role": "user", "content": prompt}])
        json_match = re.search(r'\{[\s\S]*\}', result)
        if json_match:
            data = json.loads(json_match.group())
            summary = data.get("summary", "")
            category = data.get("category", "其他")
            tags = data.get("tags", [])
            if isinstance(tags, str):
                tags = [tags]
        else:
            summary = result[:100] if result else ""
            category = "其他"
            tags = []
    except Exception as e:
        summary = f"分析失败"
        category = "其他"
        tags = []

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE inbox_items SET summary=?, category=?, tags=? WHERE id=?",
        (summary, category, json.dumps(tags, ensure_ascii=False), item_id)
    )
    conn.commit()
    conn.close()

    return summary, category, tags


# ============ Routes ============

@router.get("/items")
async def list_items(
    type: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(default=50, le=200),
    offset: int = 0,
):
    """获取收件箱列表"""
    conn = get_db()
    cursor = conn.cursor()

    where = ["1=1"]
    params = []

    if type:
        where.append("type = ?")
        params.append(type)
    if category:
        where.append("category = ?")
        params.append(category)
    if search:
        where.append("(title LIKE ? OR content LIKE ? OR summary LIKE ?)")
        s = f"%{search}%"
        params.extend([s, s, s])

    query = f"""
        SELECT * FROM inbox_items
        WHERE {' AND '.join(where)}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    """
    params.extend([limit, offset])

    cursor.execute(query, params)
    rows = cursor.fetchall()

    cursor.execute(f"SELECT COUNT(*) FROM inbox_items WHERE {' AND '.join(where)}", params[:-2])
    total = cursor.fetchone()[0]

    conn.close()

    return {
        "items": [row_to_item(r) for r in rows],
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.post("/items")
async def create_item(item: InboxItemCreate):
    """新增收件箱内容"""
    conn = get_db()
    cursor = conn.cursor()

    if item.url:
        cursor.execute("SELECT id FROM inbox_items WHERE url = ?", (item.url,))
        existing = cursor.fetchone()
        if existing:
            conn.close()
            return {"error": "duplicate", "id": existing["id"], "message": "该链接已收藏"}

    cursor.execute(
        """INSERT INTO inbox_items (type, url, title, content, source)
           VALUES (?, ?, ?, ?, ?)""",
        (item.type, item.url, item.title, item.content, item.source)
    )
    item_id = cursor.lastrowid
    conn.commit()
    conn.close()

    # 后台 AI 分析
    import threading
    thread = threading.Thread(
        target=analyze_item,
        args=(item_id, item.url, item.content, item.title)
    )
    thread.start()

    return {"id": item_id, "status": "added"}


@router.get("/items/{item_id}")
async def get_item(item_id: int):
    """获取单条内容"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM inbox_items WHERE id = ?", (item_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="内容不存在")

    return row_to_item(row)


@router.delete("/items/{item_id}")
async def delete_item(item_id: int):
    """删除内容"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM inbox_items WHERE id = ?", (item_id,))
    deleted = cursor.rowcount
    conn.commit()
    conn.close()

    if deleted == 0:
        raise HTTPException(status_code=404, detail="内容不存在")

    return {"status": "deleted"}


@router.put("/items/{item_id}")
async def update_item(item_id: int, update: InboxItemUpdate):
    """更新分类/标签"""
    conn = get_db()
    cursor = conn.cursor()

    fields = []
    params = []
    if update.category is not None:
        fields.append("category = ?")
        params.append(update.category)
    if update.tags is not None:
        fields.append("tags = ?")
        params.append(json.dumps(update.tags, ensure_ascii=False))

    if not fields:
        raise HTTPException(status_code=400, detail="没有要更新的字段")

    params.append(item_id)
    cursor.execute(f"UPDATE inbox_items SET {', '.join(fields)} WHERE id = ?", params)
    conn.commit()
    conn.close()

    return {"status": "updated"}


@router.post("/items/{item_id}/analyze")
async def reanalyze_item(item_id: int):
    """重新 AI 分析"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM inbox_items WHERE id = ?", (item_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="内容不存在")

    summary, category, tags = analyze_item(
        item_id, row["url"], row["content"], row["title"]
    )

    return {"summary": summary, "category": category, "tags": tags}


@router.get("/categories")
async def list_categories():
    """获取分类统计"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT category, COUNT(*) as count
        FROM inbox_items
        GROUP BY category
        ORDER BY count DESC
    """)
    rows = cursor.fetchall()
    conn.close()

    return [{"name": r["category"], "count": r["count"]} for r in rows]


@router.get("/stats")
async def get_stats():
    """收件箱统计"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total FROM inbox_items")
    total = cursor.fetchone()["total"]

    cursor.execute("SELECT type, COUNT(*) as count FROM inbox_items GROUP BY type")
    by_type = {r["type"]: r["count"] for r in cursor.fetchall()}

    cursor.execute("SELECT COUNT(*) as count FROM inbox_items WHERE summary IS NULL OR summary = ''")
    pending = cursor.fetchone()["count"]

    conn.close()

    return {
        "total": total,
        "by_type": by_type,
        "pending_analysis": pending,
    }

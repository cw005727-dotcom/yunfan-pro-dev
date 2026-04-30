"""
智能轮转相关路由
GET  /api/smart_rotation/list   - 轮转产品列表
POST /api/apply_rotation        - 执行轮转（替换核心产品）
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..db import get_db_connection

router = APIRouter(prefix="/api", tags=["智能轮转"])


class ApplyRotationRequest(BaseModel):
    remove_id: str
    add_id: str


@router.get("/smart_rotation/list")
async def smart_rotation_list():
    """获取智能轮转产品列表（is_core=1 的核心产品）"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM product_metrics WHERE is_core = 1 ORDER BY created_at DESC"
        )
        rows = cursor.fetchall()
        return [dict(r) for r in rows]


@router.post("/apply_rotation")
async def apply_rotation(req: ApplyRotationRequest):
    """执行轮转：将 remove_id 设为非核心，将 add_id 设为核心"""
    remove_id = req.remove_id
    add_id = req.add_id

    if not remove_id or not add_id:
        raise HTTPException(status_code=400, detail="remove_id and add_id are required")

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE product_metrics SET is_core = 0 WHERE item_id = ?",
            (remove_id,),
        )
        cursor.execute(
            "UPDATE product_metrics SET is_core = 1 WHERE item_id = ?",
            (add_id,),
        )
        conn.commit()

        # 验证更新结果
        cursor.execute(
            "SELECT item_id, is_core FROM product_metrics WHERE item_id IN (?, ?)",
            (remove_id, add_id),
        )
        rows = [dict(r) for r in cursor.fetchall()]

        removed_ok = any(r["item_id"] == remove_id and r["is_core"] == 0 for r in rows)
        added_ok = any(r["item_id"] == add_id and r["is_core"] == 1 for r in rows)

        if removed_ok and added_ok:
            return {"status": "success", "message": "轮转完成"}
        else:
            raise HTTPException(status_code=500, detail="轮转执行异常，请检查 ID 是否存在")
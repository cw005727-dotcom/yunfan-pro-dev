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


def _build_status(row) -> str:
    """
    根据投诉/延迟/取消率自构造状态标识。
    - complaints_rate / delayed_rate / cancellations_rate 都是带 % 的字符串
    - 无数据时默认 green
    """
    def pct(val: str) -> float:
        try:
            return float(val.replace("%", "").strip())
        except (AttributeError, ValueError):
            return 0.0

    complaints = pct(row.get("complaints_rate", "0%"))
    delayed = pct(row.get("delayed_rate", "0%"))
    cancels = pct(row.get("cancellations_rate", "0%"))

    if complaints >= 5.0 or delayed >= 10.0 or cancels >= 5.0:
        return "red"
    elif complaints >= 2.0 or delayed >= 5.0 or cancels >= 2.0:
        return "yellow"
    return "green"


@router.get("/smart_rotation/list")
async def smart_rotation_list():
    """
    获取智能轮转产品列表。
    店铺字段：没有 nickname 时用 store_name；status 自构造（默认 green）。
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                user_id, site_id,
                COALESCE(NULLIF(nickname, ''), NULLIF(store_name, ''), '未命名店铺') AS name,
                group_label,
                reputation_level,
                complaints_rate,
                delayed_rate,
                cancellations_rate,
                claims_history,
                new_violations, new_claims, new_delayed, new_cancel,
                alert_date, claims_period_days,
                total_violations, total_complaints, total_messages,
                total_cancellations, new_messages,
                has_token
            FROM stores
            ORDER BY user_id, site_id
        """)
        rows = [dict(r) for r in cursor.fetchall()]

    result = []
    for row in rows:
        status = _build_status(row)
        result.append({
            "user_id": row["user_id"],
            "site_id": row["site_id"],
            "name": row["name"],
            "group_label": row.get("group_label") or "",
            "reputation_level": row.get("reputation_level") or "",
            # 表原生字段（带 % 字符串）
            "complaints_rate": row.get("complaints_rate") or "0%",
            "delayed_rate": row.get("delayed_rate") or "0%",
            "cancellations_rate": row.get("cancellations_rate") or "0%",
            # 自构造 status
            "status": status,
            "claims_history": row.get("claims_history") or "Healthy",
            "new_violations": row.get("new_violations") or 0,
            "new_claims": row.get("new_claims") or 0,
            "new_delayed": row.get("new_delayed") or 0,
            "new_cancel": row.get("new_cancel") or 0,
            "new_messages": row.get("new_messages") or 0,
            "alert_date": row.get("alert_date") or "",
            "claims_period": row.get("claims_period_days") or "",
            "total_violations": row.get("total_violations") or 0,
            "total_claims": row.get("total_complaints") or 0,
            "total_messages": row.get("total_messages") or 0,
            "has_token": row.get("has_token", False),
        })

    return {"stores": result, "total": len(result)}


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

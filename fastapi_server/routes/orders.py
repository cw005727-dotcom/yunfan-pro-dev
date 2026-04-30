"""
订单相关路由
GET /api/orders - 查询订单列表，支持 shop / group / category 过滤
"""
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Query
from ..db import get_db_connection

router = APIRouter(prefix="/api", tags=["订单"])

STATUS_MAP = {
    'pending': '待入库',
    'ready_to_ship': '待发货',
    'shipped': '已发货',
    'in_transit': '在途中',
    'delivered': '已妥投',
    'cancelled': '已取消',
    'returned': '已退货',
    'at_customs': '海关清关',
    'printed': '已打单',
    'ready_to_print': '待打单',
}


@router.get("/orders")
async def get_orders(
    shop: Optional[str] = Query(None, description="店铺名称"),
    group: Optional[str] = Query(None, description="分组标签"),
    category: Optional[str] = Query(None, description="类别：1=待处理 2=在途中 3=已妥投 4=有异常"),
):
    """
    获取订单列表

    - **shop**: 按店铺名称过滤
    - **group**: 按分组标签过滤
    - **category**: 1=待处理 2=在途中 3=已妥投 4=有异常
    """
    try:
        now_str = datetime.now().strftime('%Y-%m-%dT%H:%M:%S')

        with get_db_connection() as conn:
            cursor = conn.cursor()

            where_clauses = []
            params = []

            # Group / Shop 过滤
            if group:
                cursor.execute(
                    "SELECT user_id FROM stores WHERE group_label = ?",
                    (group,)
                )
                uids = [r['user_id'] for r in cursor.fetchall() if r['user_id']]
                if uids:
                    placeholders = ','.join(['?'] * len(uids))
                    where_clauses.append(f"user_id IN ({placeholders})")
                    params.extend(uids)
            elif shop:
                cursor.execute(
                    "SELECT user_id FROM stores WHERE nickname = ?",
                    (shop,)
                )
                row = cursor.fetchone()
                if row:
                    where_clauses.append("user_id = ?")
                    params.append(row['user_id'])

            # Category 过滤
            if category == "1":  # 待处理
                where_clauses.append(
                    "shipping_status IN ('pending', 'ready_to_ship', 'ready_to_print', 'printed')"
                )
            elif category == "2":  # 在途中
                where_clauses.append(
                    "shipping_status IN ('shipped', 'in_transit', 'at_customs', "
                    "'left_customs', 'picked_up', 'dropped_off')"
                )
            elif category == "3":  # 已妥投
                where_clauses.append("shipping_status = 'delivered'")
            elif category == "4":  # 有异常
                where_clauses.append(
                    "(shipping_status IN ('cancelled', 'returned', "
                    "'detained_at_origin', 'fraudulent') OR "
                    "(shipping_status IN ('pending', 'ready_to_ship') "
                    "AND last_ship_date < ?))"
                )
                params.append(now_str)

            where = " WHERE " + " AND ".join(where_clauses) if where_clauses else ""

            sql = f"SELECT * FROM orders_v2{where} ORDER BY order_date DESC LIMIT 100"
            cursor.execute(sql, params)

            orders = []
            for r in cursor.fetchall():
                d = dict(r)

                # 检查是否超期
                is_overdue = (
                    d.get('shipping_status') in ('pending', 'ready_to_ship')
                    and d.get('last_ship_date')
                    and d['last_ship_date'] < now_str
                )

                d['status_zh'] = "发货超期" if is_overdue else STATUS_MAP.get(
                    d.get('shipping_status', ''), d.get('shipping_status', '')
                )
                d['is_overdue'] = is_overdue

                # 计算最晚发货时间：下单后 5 个自然日内
                if d.get('order_date'):
                    try:
                        dt_str = d['order_date'][:19]
                        dt = datetime.fromisoformat(dt_str)
                        deadline = dt + timedelta(days=5)
                        d['ship_deadline'] = deadline.strftime('%Y-%m-%d')
                    except Exception:
                        d['ship_deadline'] = None
                else:
                    d['ship_deadline'] = None

                # UI 分类
                if is_overdue or d.get('shipping_status') in (
                    'cancelled', 'returned', 'detained_at_origin', 'fraudulent'
                ):
                    d['category'] = 4
                elif d.get('shipping_status') == 'delivered':
                    d['category'] = 3
                elif d.get('shipping_status') in (
                    'shipped', 'in_transit', 'at_customs',
                    'left_customs', 'picked_up', 'dropped_off'
                ):
                    d['category'] = 2
                else:
                    d['category'] = 1

                orders.append(d)

        return {
            "orders": orders,
            "summary": {
                "total_gmv": sum(o.get('amount', 0) for o in orders),
                "total_orders": len(orders),
            }
        }

    except Exception as e:
        return {"orders": [], "error": str(e)}

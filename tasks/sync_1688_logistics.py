"""
1688 物流轨迹定时同步任务
=========================
使用方式：
    python tasks/sync_1688_logistics.py
    
推荐配合 cron 使用，每 6 小时跑一次：
    0 */6 * * * cd /path/to/project && python tasks/sync_1688_logistics.py >> logs/sync_1688.log 2>&1
"""
import sys
import os
import time
import json
import logging

# 确保能找到 fastapi_server
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)


def main():
    """主流程：批量拉取 1688 物流轨迹，更新到数据库"""
    # 延时导入避免模块未就绪
    from fastapi_server.db import get_db_connection
    from fastapi_server.routes.alibaba1688 import (
        get_access_token,
        call_api,
    )

    token = get_access_token()
    if not token:
        logger.error("No access_token. Have you authorized yet?")
        logger.error("Visit /api/alibaba1688/auth-url to get the authorization link.")
        return

    with get_db_connection() as conn:
        cur = conn.cursor()
        # 查询有 1688 追踪号但最近 24h 未更新轨迹的订单
        cur.execute("""
            SELECT id, order_number, logistics_1688_tracking, logistics_1688_order
            FROM logistics_tracking
            WHERE IFNULL(logistics_1688_tracking, '') != ''
              AND (status IS NULL OR status NOT IN ('已取消', '取消'))
            ORDER BY order_date DESC
            LIMIT 100
        """)
        rows = cur.fetchall()

    if not rows:
        logger.info("No orders to sync.")
        return

    success = 0
    fail = 0
    for i, row in enumerate(rows):
        tracking_field = row["logistics_1688_tracking"] or ""
        order_id_1688 = row["logistics_1688_order"] or ""

        # 解析物流单号
        if ":" in tracking_field:
            logistics_id = tracking_field.split(":")[0]
        else:
            logistics_id = tracking_field

        try:
            biz = {"logisticsId": logistics_id}
            if order_id_1688:
                biz["logisticsOrderId"] = order_id_1688

            result = call_api("alibaba.trade.getLogisticsTraceInfo.buyerView", biz)

            # 成功/失败日志
            if "error_response" not in result:
                success += 1
                logger.info(
                    f"[{i+1}/{len(rows)}] ✅ {row['order_number']} "
                    f"-> trace ok ({logistics_id})"
                )
            else:
                fail += 1
                err = result.get("error_response", {})
                logger.warning(
                    f"[{i+1}/{len(rows)}] ⚠️ {row['order_number']} "
                    f"-> {err.get('msg', str(err))}"
                )
        except Exception as e:
            fail += 1
            logger.error(f"[{i+1}/{len(rows)}] ❌ {row['order_number']} -> {e}")

        # QPS 限制: 每秒 <= 5 次
        time.sleep(0.25)

    logger.info(f"Done. Total={len(rows)}, Success={success}, Fail={fail}")


if __name__ == "__main__":
    main()

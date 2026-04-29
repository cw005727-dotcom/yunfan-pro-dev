"""
aggregate_orders.py — 数据侧核心脚本
从 orders_v2 聚合订单 → 计算各率 → 更新 stores 表 → 生成 monitoring_logs

运行频率: 每15分钟（通过 cron 或 api_server.py 内调用）
数据准确性规则:
  1. 无新数据时不覆盖旧数据
  2. 数据全为零时触发告警
  3. status 必须从聚合计算，禁止直接写入
  4. 每次写入必须带 alert_date
"""

import sqlite3
import logging
import os
from datetime import datetime

DB_PATH = "/Users/chensan/yunfan-pro-dev/mercadolibre.db"
LOG_PATH = "/Users/chensan/yunfan-pro-dev/logs/aggregate.log"

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(LOG_PATH),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# 状态阈值（从订单率计算）
THRESHOLD_RED = 0.05     # >5% 任意一项 → red
THRESHOLD_YELLOW = 0.02  # >2% 任意一项 → yellow
THRESHOLD_DELAYED = 0.03 # 延误>3% → red

# 延误判定：物流异常子状态（来自 ML 官方定义）
# https://shipping-docs.mercadolibre.com/api-docs/shipping_notifications_v2/
DELAYED_SUBSTATUS = [
    'at_customs',           # 清关中
    'customs_ready_to_pickup_release',  # 待提货
    'delayed',              # 延误
    'delivered',            # 已妥投（不是延误）
    'detained_at_origin',   # 在原产地扣押
    'pending_customer_modification',  # 等待客户修改地址
    'pending_other',        # 其他待处理
    'pending_pickup',       # 待提货
    'pending_recovery',     # 等待退回
    'picked_up',            # 已提取
    'ready_to_ship',        # 准备发货
    'return_delivered',     # 退回已妥投
    'return_failed',        # 退回失败
    'shipped',              # 已发货
    'unshipped'             # 未发货
]

# 卖家取消判定：cancel_detail.group = 'seller' or 'internal'
# 这是卖家主动取消的订单，算作"由你取消"

# 投诉判定：mediations 数量 > 0（买卖家纠纷）
# 或 cancel_detail.group = 'mediation'

# 不合规发货（Envíos）判定：
# 1. logistic_type = 'drop_off'（自寄/线下寄）且
# 2. shipped/picked_up/dropped_off 但 substatus 含异常关键词
# 或：用 cancel_detail.group = 'shipment' 但不是 shipped_not_delivered（那是 Envíos 正常状态）

def format_rate(rate):
    """返回百分比字符串，如 '7.14%'"""
    if rate is None or rate == 0:
        return "0.00%"
    return f"{rate * 100:.2f}%"

def compute_status(complaints_rate, cancellations_rate, delayed_rate):
    """从三率计算 status（red/yellow/green）"""
    if complaints_rate > THRESHOLD_RED or cancellations_rate > THRESHOLD_RED or delayed_rate > THRESHOLD_DELAYED:
        return 'red'
    if complaints_rate > THRESHOLD_YELLOW or cancellations_rate > THRESHOLD_YELLOW or delayed_rate > THRESHOLD_YELLOW:
        return 'yellow'
    return 'green'

def aggregate_by_site(site_id, user_id, conn):
    """对一个站点的订单进行聚合计算，返回 dict
    
    ML 投诉率/取消率/不合规发货率的正确计算方式（从实际订单验证）：
    - 投诉（claims）= mediations_count > 0（买卖家有纠纷）
    - 取消（cancellations）= cancel_detail_group IN ('seller', 'internal')（卖家主动取消）
    - 不合规发货（non-compliant）= cancel_detail_group = 'shipment'（Envíos 配送异常）
      注意：shipment_not_delivered 是"已发货但未到达"，属于不合规
    - 分母 = 近60天内的总订单数
    """
    cursor = conn.cursor()
    
    # 总有效订单数（近60天内）
    cursor.execute("""
        SELECT COUNT(*) FROM orders_v2
        WHERE user_id = ? AND order_date >= date('now', '-60 days')
    """, (user_id,))
    total = cursor.fetchone()[0] or 1  # 避免除零
    
    # 投诉（mediations_count > 0）
    cursor.execute("""
        SELECT COUNT(*) FROM orders_v2
        WHERE user_id = ? AND mediations_count > 0
        AND order_date >= date('now', '-60 days')
    """, (user_id,))
    complaints = cursor.fetchone()[0]
    
    # 取消（cancel_detail_group = 'seller' or 'internal'，卖家主动取消）
    cursor.execute("""
        SELECT COUNT(*) FROM orders_v2
        WHERE user_id = ? AND cancel_detail_group IN ('seller', 'internal')
        AND order_date >= date('now', '-60 days')
    """, (user_id,))
    cancellations = cursor.fetchone()[0]
    
    # 不合规发货（Envíos 配送异常：shipment 相关）
    cursor.execute("""
        SELECT COUNT(*) FROM orders_v2
        WHERE user_id = ? AND cancel_detail_group = 'shipment'
        AND order_date >= date('now', '-60 days')
    """, (user_id,))
    non_compliant = cursor.fetchone()[0]
    
    # 延误（物流子状态异常，已发货但有问题的）
    # shipped_not_delivered / delayed substatuses
    delayed_substatuses = ['shipped_not_delivered', 'delayed', 'at_customs',
                           'detained_at_origin', 'pending_recovery', 'return_failed']
    cursor.execute(f"""
        SELECT COUNT(*) FROM orders_v2
        WHERE user_id = ? AND shipping_substatus IN ({','.join(['?'] * len(delayed_substatuses))})
        AND order_date >= date('now', '-60 days')
    """, [user_id] + delayed_substatuses)
    delayed = cursor.fetchone()[0]
    
    complaints_rate = complaints / total
    cancellations_rate = cancellations / total
    delayed_rate = delayed / total
    non_compliant_rate = non_compliant / total
    
    status = compute_status(complaints_rate, cancellations_rate, delayed_rate)
    
    # 新增计数（本次 vs 上次 stored value）
    # 逻辑优化：如果旧值为 0 且之前从未记录过基准，说明是初始化，不计入新增
    cursor.execute("SELECT new_claims, new_cancel, new_delayed, claims_value, cancel_value, delayed_value FROM stores WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    prev_claims_v = row[3] if (row and row[3] is not None) else -1
    prev_cancel_v = row[4] if (row and row[4] is not None) else -1
    prev_delayed_v = row[5] if (row and row[5] is not None) else -1
    
    # 第一次同步（prev_v == -1）时，新增设为 0，防止把历史纠纷当成今日新增
    new_claims = (complaints - prev_claims_v) if prev_claims_v >= 0 else 0
    new_cancel = (cancellations - prev_cancel_v) if prev_cancel_v >= 0 else 0
    new_delayed = (delayed - prev_delayed_v) if prev_delayed_v >= 0 else 0
    
    return {
        'total': total,
        'complaints': complaints,
        'cancellations': cancellations,
        'delayed': delayed,
        'non_compliant': non_compliant,
        'complaints_rate': complaints_rate,
        'cancellations_rate': cancellations_rate,
        'delayed_rate': delayed_rate,
        'non_compliant_rate': non_compliant_rate,
        'status': status,
        'new_claims': max(0, new_claims),
        'new_cancel': max(0, new_cancel),
        'new_delayed': max(0, new_delayed),
    }

def log_monitoring_event(conn, level, message, user_id, site_id, new_count):
    """写入 monitoring_logs（新数据才写）"""
    if new_count <= 0:
        return
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO monitoring_logs (level, message, store_id, site_id, details)
        VALUES (?, ?, ?, ?, ?)
    """, (level, message, user_id, site_id, f'{{"count": {new_count}}}'))
    conn.commit()

def run():
    logger.info("=" * 40)
    logger.info("Starting orders aggregation...")
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    today_str = datetime.now().strftime('%m.%d')
    
    # 遍历所有店铺
    cursor.execute("SELECT id, user_id, site_id, nickname, group_label, claims_value, cancel_value, delayed_value FROM stores")
    stores = cursor.fetchall()
    logger.info(f"Scanning {len(stores)} stores...")
    
    total_updated = 0
    
    for store in stores:
        user_id = store['user_id']
        site_id = store['site_id']
        nickname = (store['nickname'] if store['nickname'] else site_id)
        
        try:
            agg = aggregate_by_site(site_id, user_id, conn)
            
            # 数据质量检查：本次有数据但全为零 → 告警
            if agg['total'] > 5 and agg['complaints'] == 0 and agg['cancellations'] == 0 and agg['delayed'] == 0:
                logger.warning(f"[{site_id}] 订单{total}但三率全零，数据可能异常")
            
            # 更新 stores 表（仅更新原始数值和新增数值，不覆盖 API 拉取的声誉比例和状态）
            cursor.execute("""
                UPDATE stores SET
                    claims_value = ?,
                    cancel_value = ?,
                    delayed_value = ?,
                    total_transactions = ?,
                    new_claims = ?,
                    new_cancel = ?,
                    new_delayed = ?,
                    alert_date = ?,
                    last_updated = CURRENT_TIMESTAMP
                WHERE user_id = ?
            """, (
                agg['complaints'],
                agg['cancellations'],
                agg['delayed'],
                agg['total'],
                agg['new_claims'],
                agg['new_cancel'],
                agg['new_delayed'],
                today_str,
                user_id
            ))
            conn.commit()
            
            # 写入 monitoring_logs（只有新增才写）
            if agg['new_claims'] > 0:
                log_monitoring_event(conn, 'error', f"检测到新投诉 (+{agg['new_claims']})", user_id, site_id, agg['new_claims'])
            if agg['new_delayed'] > 0:
                log_monitoring_event(conn, 'warning', f"检测到新延误 (+{agg['new_delayed']})", user_id, site_id, agg['new_delayed'])
            if agg['new_cancel'] > 0:
                log_monitoring_event(conn, 'warning', f"检测到新取消 (+{agg['new_cancel']})", user_id, site_id, agg['new_cancel'])
            
            logger.info(f"  [{site_id}] {agg['status']} | 投诉{agg['complaints']}/{agg['total']}({format_rate(agg['complaints_rate'])}) | 延误{agg['delayed']}/{agg['total']}({format_rate(agg['delayed_rate'])}) | 取消{agg['cancellations']}/{agg['total']}({format_rate(agg['cancellations_rate'])})")
            total_updated += 1
            
        except Exception as e:
            logger.error(f"[{site_id}] Aggregation failed: {e}")
            continue
    
    conn.close()
    logger.info(f"Aggregation done. {total_updated} stores updated.")

if __name__ == "__main__":
    run()
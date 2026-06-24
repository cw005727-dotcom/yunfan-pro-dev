#!/usr/bin/env python3
"""
每日 9 点生成假通知（管理员专属）。
4 类 × 3-5 条/天，共 12-20 条。

格式完全照搬真实通知（学习自 realtime_notifications 表真实样本）：

  订单     marketplace_orders
    格式: 📦 新订单：{国名} {19位订单号} 成交 $13.00~$15.00

  物流     marketplace_shipments
    格式: 🚚 物流更新：发货单 {11位发货单号} → - / -

  索赔     marketplace_claims
    格式: ⚠️ 索赔/投诉：  {10位索赔号} []

  消息     marketplace_messages
    格式: {国名} 站点订单 #{19位订单号} 客户消息：{内容}

owner_username 固定为 '美客多开挂指南'（管理员）。
dedup: 表有 UNIQUE INDEX (topic, order_id, content)，用 INSERT OR IGNORE。
"""

import argparse
import random
import sqlite3
import sys
from datetime import date, datetime
from pathlib import Path

DEFAULT_DB = Path(__file__).resolve().parent.parent / "mercadolibre.db"

# site_id → 国名（按真实通知样本）
SITE_TO_COUNTRY = {
    'MLM': '墨西哥',
    'MLB': '巴西',
    'MLA': '阿根廷',
    'MCO': '哥伦比亚',
    'MLC': '智利',
    'MLU': '乌拉圭',
}
SITES = list(SITE_TO_COUNTRY.keys())

# 客户消息文案（学习真实样本中的措辞 — 国外客户合理提问）
MESSAGE_TEXTS = [
    '¿Está disponible?',                    # 西语：现货吗？
    'When can I receive it?',                # 英语：什么时候收到
    'Do you have it in stock?',              # 英语：有现货吗
    'Is it available in another color?',     # 英语：换颜色
    'What is the estimated delivery date?',  # 英语：预计送达
    'Is there any discount?',                # 英语：打折吗
    '¿Cuándo lo envías?',                    # 西语：什么时候发
    'Do you ship to my country?',            # 英语：能寄到我的国家吗
]


def rand_order_id() -> str:
    """16 位订单号，20000 开头（学习真实样本：61/65 用这种格式）"""
    return "20000" + "".join(random.choices("0123456789", k=11))


def rand_shipment_id() -> str:
    """11 位发货单号（学习真实样本：46986804570）"""
    return "4" + "".join(random.choices("0123456789", k=10))


def rand_claim_id() -> str:
    """10 位索赔号（学习真实样本：5521319216）"""
    return "5" + "".join(random.choices("0123456789", k=9))


def rand_time_today() -> str:
    """今天 9:00 - 18:00 之间的随机时间"""
    h = random.randint(9, 17)
    m = random.randint(0, 59)
    s = random.randint(0, 59)
    return datetime.now().replace(hour=h, minute=m, second=s, microsecond=0).isoformat()


def build_content(topic: str, site: str) -> tuple[str, str]:
    """
    根据 topic 生成一条假通知的 content 和 order_id。
    返回 (content, order_id) — order_id 用于 dedup
    """
    country = SITE_TO_COUNTRY[site]
    if topic == 'marketplace_orders':
        oid = rand_order_id()
        amount = round(random.uniform(13.0, 15.0), 2)
        content = f"📦 新订单：{country} {oid} 成交 ${amount:.2f}"
        return content, oid
    elif topic == 'marketplace_shipments':
        # 物流通知用发货单号（11 位）
        sid = rand_shipment_id()
        content = f"🚚 物流更新：发货单 {sid} → - / -"
        return content, sid
    elif topic == 'marketplace_claims':
        # 索赔通知用索赔号（10 位）
        cid = rand_claim_id()
        content = f"⚠️ 索赔/投诉：  {cid} []"
        return content, cid
    elif topic == 'marketplace_messages':
        oid = rand_order_id()
        text = random.choice(MESSAGE_TEXTS)
        content = f"{country} 站点订单 #{oid} 客户消息：{text}"
        return content, oid
    else:
        oid = rand_order_id()
        return f"通知：{country} {oid}", oid


def generate_for_date(target_date: date, db_path: Path) -> int:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    inserted = 0

    topics = ['marketplace_orders', 'marketplace_shipments', 'marketplace_claims', 'marketplace_messages']
    for topic in topics:
        n = random.randint(3, 5)
        for _ in range(n):
            site = random.choice(SITES)
            content, order_id = build_content(topic, site)
            received_at = rand_time_today()
            cur.execute(
                """
                INSERT OR IGNORE INTO realtime_notifications
                    (topic, content, site_id, order_id, received_at, read, owner_username)
                VALUES (?, ?, ?, ?, ?, 0, '美客多开挂指南')
                """,
                (topic, content, site, order_id, received_at),
            )
            if cur.rowcount > 0:
                inserted += 1

    conn.commit()
    conn.close()
    return inserted


def main():
    parser = argparse.ArgumentParser(description="生成每日假通知（管理员）")
    parser.add_argument(
        "--date",
        default=date.today().strftime("%Y-%m-%d"),
        help="日期 YYYY-MM-DD（默认今天）",
    )
    parser.add_argument(
        "--db",
        default=str(DEFAULT_DB),
        help="SQLite 数据库路径",
    )
    args = parser.parse_args()

    db_path = Path(args.db)
    if not db_path.exists():
        print(f"[ERROR] 数据库不存在: {db_path}", file=sys.stderr)
        sys.exit(1)

    target = date.fromisoformat(args.date)
    n = generate_for_date(target, db_path)
    print(f"[daily_notifications] {args.date}: 插入 {n} 条假通知（管理员专属）")


if __name__ == "__main__":
    main()

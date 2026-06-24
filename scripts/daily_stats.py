#!/usr/bin/env python3
"""
每日 9 点生成顶栏统计：今日订单 / 今日 GMV / 今日净利。

- order_count:           20-50 整数（每天不一样）
- avg_order_value:       13.0-15.0 USD/单（保留 2 位小数）
- gmv_usd:               order_count * avg_order_value
- profit_rate:           0.25-0.35 利润率（每天定一个，控制在 25-35%）
- profit_cny:            gmv_usd * 7 * profit_rate（按 USD/CNY=7 换算）
- profit_per_order_cny:  profit_cny / order_count（自动算出）

表结构：
    CREATE TABLE daily_stats (
        date TEXT PRIMARY KEY,
        order_count INTEGER NOT NULL,
        avg_order_value REAL NOT NULL,
        gmv_usd REAL NOT NULL,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        profit_rate REAL NOT NULL DEFAULT 0,
        profit_per_order_cny REAL NOT NULL DEFAULT 0,
        profit_cny REAL NOT NULL DEFAULT 0
    );

可手动跑：`python3 scripts/daily_stats.py`
可指定日期：`python3 scripts/daily_stats.py --date 2026-06-09`
可回填区间：`python3 scripts/daily_stats.py --from 2026-06-01 --to 2026-06-08`
"""

import argparse
import random
import sqlite3
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

# mercadolibre.db 在项目根
DEFAULT_DB = Path(__file__).resolve().parent.parent / "mercadolibre.db"
USD_TO_CNY = 7.0  # 美元兑人民币汇率（用于利润换算）


def generate(date_str: str, db_path: Path) -> dict:
    order_count = random.randint(20, 50)
    avg_value = round(random.uniform(13.0, 15.0), 2)
    gmv = round(order_count * avg_value, 2)
    # 每天总利润 800-1200 元（硬要求，每天定一个，含 2 位小数）
    profit_cny = round(random.uniform(800.0, 1200.0), 2)
    # 利润率 = 利润 / (GMV × 汇率) — 跟件数+GMV 联动算出
    profit_rate = round(profit_cny / (gmv * USD_TO_CNY), 4)
    profit_per_order = round(profit_cny / order_count, 2)
    # 取消率 15-26% 每天定一个
    cancel_rate = round(random.uniform(0.15, 0.26), 4)

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute(
        """
        INSERT OR REPLACE INTO daily_stats (
            date, order_count, avg_order_value, gmv_usd, generated_at,
            profit_rate, profit_per_order_cny, profit_cny, cancel_rate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            date_str, order_count, avg_value, gmv,
            datetime.now(timezone.utc).isoformat(),
            profit_rate, profit_per_order, profit_cny, cancel_rate,
        ),
    )
    conn.commit()
    conn.close()
    return {
        "date": date_str,
        "order_count": order_count,
        "avg_order_value": avg_value,
        "gmv_usd": gmv,
        "profit_rate": profit_rate,
        "profit_per_order_cny": profit_per_order,
        "profit_cny": profit_cny,
    }


def main():
    parser = argparse.ArgumentParser(description="生成每日顶栏统计")
    parser.add_argument(
        "--date",
        default=date.today().strftime("%Y-%m-%d"),
        help="日期 YYYY-MM-DD（默认今天，配合 --from/--to 使用会被忽略）",
    )
    parser.add_argument(
        "--from",
        dest="from_date",
        default=None,
        help="回填起始日期 YYYY-MM-DD（含）",
    )
    parser.add_argument(
        "--to",
        dest="to_date",
        default=None,
        help="回填结束日期 YYYY-MM-DD（含）",
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

    if args.from_date and args.to_date:
        # 回填模式
        start = date.fromisoformat(args.from_date)
        end = date.fromisoformat(args.to_date)
        if end < start:
            print(f"[ERROR] --to ({end}) 早于 --from ({start})", file=sys.stderr)
            sys.exit(1)
        cur = start
        while cur <= end:
            r = generate(cur.strftime("%Y-%m-%d"), db_path)
            print(
                f"[daily_stats] {r['date']}: 订单 {r['order_count']}, "
                f"均价 ${r['avg_order_value']}, GMV ${r['gmv_usd']}, "
                f"利润 ¥{r['profit_cny']} (利润率 {r['profit_rate']*100:.1f}%, "
                f"单利 ¥{r['profit_per_order_cny']})"
            )
            cur += timedelta(days=1)
    else:
        r = generate(args.date, db_path)
        print(
            f"[daily_stats] {r['date']}: 订单 {r['order_count']}, "
            f"均价 ${r['avg_order_value']}, GMV ${r['gmv_usd']}, "
            f"利润 ¥{r['profit_cny']} (利润率 {r['profit_rate']*100:.1f}%, "
            f"单利 ¥{r['profit_per_order_cny']})"
        )


if __name__ == "__main__":
    main()

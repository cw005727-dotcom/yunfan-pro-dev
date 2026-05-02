#!/usr/bin/env python3
"""
Migration: 给 ml_notifications 加 (ml_id, topic) 唯一索引
防止重复 webhook 导致同一通知多次入队

用法: python3 -m scripts.migrations.add_ml_notif_index
"""
import sys
import os

# 确保能导入项目模块
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))


def run(db_path: str):
    import sqlite3
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # 去重（保留 rowid 最小的）
    c.execute("""
        DELETE FROM ml_notifications
        WHERE rowid NOT IN (
            SELECT MIN(rowid)
            FROM ml_notifications
            GROUP BY ml_id, topic
        )
    """)
    deleted = c.rowcount
    print(f"删除了 {deleted} 条重复数据")

    # 加唯一索引
    c.execute("DROP INDEX IF EXISTS idx_ml_notif_ml_id_topic")
    c.execute("CREATE UNIQUE INDEX idx_ml_notif_ml_id_topic ON ml_notifications(ml_id, topic)")
    conn.commit()
    print("✅ 唯一索引 idx_ml_notif_ml_id_topic 已创建")

    conn.close()


if __name__ == "__main__":
    from fastapi_server.config import DB_PATH
    run(DB_PATH)

"""
MercadoLibre 声誉数据同步脚本
============================
通过 ML API 拉取所有站点的声誉数据，更新到 stores 表。

用法:
    python pull_reputation.py

依赖:
    - fastapi_server.config: ML_API_BASE, ML_CLIENT_SECRET, ML_APP_ID
    - fastapi_server.db: get_db_connection
    - ~/.ml_token_json: ML access_token
"""
"""
MercadoLibre 声誉数据同步脚本
============================
通过 ML API 拉取所有站点的声誉数据，更新到 stores 表。

用法:
    python pull_reputation.py

依赖:
    - scripts/utils/token_manager: 加载/刷新 ML access_token
    - fastapi_server.db: get_db_connection
    - fastapi_server.config: ML_API_BASE
"""
import sys
import os
from pathlib import Path

# 将项目根目录和 scripts/ 加入 Python 路径
ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "scripts"))

from utils.token_manager import load_tokens


def pull_reputation():
    from fastapi_server.config import ML_API_BASE
    from fastapi_server.db import get_db_connection

    tokens = load_tokens()
    if not tokens or "access_token" not in tokens:
        print("[ERROR] No valid access_token found.")
        # 尝试从 ML_ACCESS_TOKEN 环境变量兜底
        alt = os.environ.get("ML_ACCESS_TOKEN")
        if alt:
            tokens = {"access_token": alt}
            print("[INFO] Using ML_ACCESS_TOKEN env var")
        else:
            return

    headers = {"Authorization": f"Bearer {tokens['access_token']}"}
    url = f"{ML_API_BASE}/global/users/seller_reputation"

    print(f"[INFO] Fetching global reputation from {url}...")
    import requests

    try:
        resp = requests.get(url, headers=headers, timeout=30)
    except requests.RequestException as e:
        print(f"[ERROR] Request failed: {e}")
        return

    if resp.status_code != 200:
        print(f"[ERROR] API returned {resp.status_code}: {resp.text[:300]}")
        return

    data = resp.json()
    reputation_list = data.get("seller_reputation", [])
    if not reputation_list:
        print("[WARN] No reputation data in response.")
        return

    # 优先处理 fulfillment，再处理 remote（CBT），确保 remote 覆盖实际生效
    reputation_list.sort(key=lambda x: 1 if x.get("logistic_type") == "remote" else 0)

    updated_sites = []

    with get_db_connection() as conn:
        cursor = conn.cursor()

        for rep in reputation_list:
            site_id = rep.get("site_id", "")
            logistic_type = rep.get("logistic_type", "")
            rep_detail = rep.get("seller_reputation", {})

            level = rep_detail.get("level_id") or ""
            metrics = rep_detail.get("metrics", {})

            complaints_rate = f"{metrics.get('claims', {}).get('rate', 0) * 100:.2f}%"
            delayed_rate = f"{metrics.get('delayed_handling_time', {}).get('rate', 0) * 100:.2f}%"
            cancellations_rate = f"{metrics.get('cancellations', {}).get('rate', 0) * 100:.2f}%"

            transactions = rep_detail.get("transactions", {})
            total_transactions = transactions.get("total", 0)

            # 状态灯
            status = "green"
            level_lower = level.lower()
            if "red" in level_lower:
                status = "red"
            elif "yellow" in level_lower or "orange" in level_lower:
                status = "yellow"

            cursor.execute(
                """UPDATE stores SET
                    reputation_level = ?,
                    complaints_rate = ?,
                    delayed_rate = ?,
                    cancellations_rate = ?,
                    total_v = ?,
                    status = ?
                 WHERE site_id = ?""",
                (level, complaints_rate, delayed_rate, cancellations_rate,
                 total_transactions, status, site_id),
            )

            if cursor.rowcount > 0:
                print(f"  [OK] {site_id} ({logistic_type}) → {status} / {level}")
                updated_sites.append(site_id)

        conn.commit()

    print(f"[DONE] Updated {len(updated_sites)} sites: {', '.join(updated_sites)}")


if __name__ == "__main__":
    pull_reputation()

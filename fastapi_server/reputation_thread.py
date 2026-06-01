"""MercadoLibre 声誉数据拉取逻辑（直接在 API 进程内运行，避免跨进程锁竞争）"""
import time
import requests
from datetime import datetime
from fastapi_server.db import get_db_connection
from fastapi_server.config import ML_API_BASE

ALL_SITES = ['MLM', 'MLB', 'MLA', 'MCO', 'MLC', 'MLU']

def compute_status(level):
    level_lower = (level or '').lower()
    if 'red' in level_lower:
        return 'red'
    if 'yellow' in level_lower or 'orange' in level_lower:
        return 'yellow'
    return 'green'

def pull_reputation_inprocess(owner: str = None):
    """在线程中直接拉取声誉，不走独立进程"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if owner:
            cursor.execute(
                "SELECT rowid, user_id, nickname, owner_username, access_token, ml_user_id FROM stores "
                "WHERE access_token IS NOT NULL AND access_token != '' AND owner_username = ?",
                (owner,)
            )
        else:
            cursor.execute(
                "SELECT rowid, user_id, nickname, owner_username, access_token, ml_user_id FROM stores "
                "WHERE access_token IS NOT NULL AND access_token != ''"
            )
        stores = cursor.fetchall()

        if not stores:
            print(f"[INFO] 没有找到有 token 的店铺 (owner={owner})")
            return

        updated_count = 0
        for row in stores:
            store_rowid, user_id, nickname, owner, at, ml_uid = row
            print(f"\n[店铺] {nickname or user_id} (owner: {owner})")

            if not at:
                print("  [SKIP] 无 access_token")
                continue

            # 全局端点
            global_url = f"{ML_API_BASE}/global/users/seller_reputation"
            headers = {"Authorization": f"Bearer {at}"}
            r = requests.get(global_url, headers=headers, timeout=30)

            if r.status_code == 200:
                raw_list = r.json().get("seller_reputation", [])
                best = {}
                for rep in raw_list:
                    sid = rep.get("site_id", "")
                    if sid not in ALL_SITES:
                        continue
                    lt = rep.get("logistic_type", "")
                    if lt == 'fulfillment':
                        continue
                    if sid not in best:
                        best[sid] = rep
                    else:
                        old_level = best[sid].get("seller_reputation", {}).get("level_id", "")
                        new_level = rep.get("seller_reputation", {}).get("level_id", "")
                        if 'newbie' in old_level and 'newbie' not in new_level:
                            best[sid] = rep

                for site_id, rep in best.items():
                    logistic_type = rep.get("logistic_type", "")
                    rep_detail = rep.get("seller_reputation", {})
                    metrics = rep_detail.get("metrics", {})

                    level = rep_detail.get("level_id") or ""
                    complaints_rate = metrics.get("claims", {}).get("rate", 0)
                    delayed_rate = metrics.get("delayed_handling_time", {}).get("rate", 0)
                    cancellations_rate = metrics.get("cancellations", {}).get("rate", 0)
                    new_claims = metrics.get("claims", {}).get("value", 0) or 0
                    new_delayed = metrics.get("delayed_handling_time", {}).get("value", 0) or 0
                    new_cancel = metrics.get("cancellations", {}).get("value", 0) or 0
                    new_violations = new_claims + new_delayed + new_cancel

                    prefix = site_id.lower()
                    cursor.execute(f"""
                        UPDATE stores SET
                            {prefix}_reputation_level = ?,
                            {prefix}_complaints_rate = ?,
                            {prefix}_delayed_rate = ?,
                            {prefix}_cancellations_rate = ?,
                            {prefix}_new_violations = ?,
                            {prefix}_new_claims = ?,
                            {prefix}_new_delayed = ?,
                            {prefix}_new_cancel = ?
                        WHERE rowid = ?
                    """, (level, complaints_rate, delayed_rate, cancellations_rate,
                          new_violations, new_claims, new_delayed, new_cancel, store_rowid))
                    print(f"  [全球] {site_id} ({logistic_type}) -> {compute_status(level)}")
                    updated_count += 1
                    time.sleep(0.3)

            else:
                # 兜底端点
                print(f"  [INFO] 全局端点 {r.status_code}，使用用户端点兜底")
                for site_id in ALL_SITES:
                    url = f"{ML_API_BASE}/users/{ml_uid}"
                    try:
                        resp = requests.get(url, headers=headers, timeout=10)
                        if resp.status_code == 200:
                            data = resp.json()
                            sr = data.get("seller_reputation", {})
                            metrics = sr.get("metrics", {})

                            level = sr.get("level_id") or ""
                            complaints_rate = metrics.get("claims", {}).get("rate", 0)
                            delayed_rate = metrics.get("delayed_handling_time", {}).get("rate", 0)
                            cancellations_rate = metrics.get("cancellations", {}).get("rate", 0)
                            new_claims = metrics.get("claims", {}).get("value", 0) or 0
                            new_delayed = metrics.get("delayed_handling_time", {}).get("value", 0) or 0
                            new_cancel = metrics.get("cancellations", {}).get("value", 0) or 0
                            new_violations = new_claims + new_delayed + new_cancel

                            prefix = site_id.lower()
                            cursor.execute(f"""
                                UPDATE stores SET
                                    {prefix}_reputation_level = ?,
                                    {prefix}_complaints_rate = ?,
                                    {prefix}_delayed_rate = ?,
                                    {prefix}_cancellations_rate = ?,
                                    {prefix}_new_violations = ?,
                                    {prefix}_new_claims = ?,
                                    {prefix}_new_delayed = ?,
                                    {prefix}_new_cancel = ?
                                WHERE rowid = ?
                            """, (level, complaints_rate, delayed_rate, cancellations_rate,
                                  new_violations, new_claims, new_delayed, new_cancel, store_rowid))
                            print(f"  [兜底] {site_id} -> {compute_status(level)}")
                            updated_count += 1
                    except Exception as e:
                        print(f"  [ERR] {site_id} {e}")
                    time.sleep(0.3)

            cursor.execute(
                "UPDATE stores SET last_updated = ? WHERE rowid = ?",
                (datetime.now().isoformat(), store_rowid)
            )
            conn.commit()

        print(f"\n[DONE] 共更新 {updated_count} 个站点数据\n")

"""优化 financials.py - 拉满所有订单"""
import logging
import requests
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Query
from ..db import get_db_connection
from ..config import ML_API_BASE, ML_APP_ID, ML_CLIENT_SECRET

router = APIRouter(prefix="/api/financials", tags=["财务"])
logger = logging.getLogger(__name__)

ALL_SITES = {
    'MLM': '墨西哥', 'MLB': '巴西', 'MLA': '阿根廷',
    'MCO': '哥伦比亚', 'MLC': '智利', 'MLU': '乌拉圭',
}


def refresh_ml_token(refresh_token: str) -> dict:
    try:
        r = requests.post(
            'https://api.mercadolibre.com/oauth/token',
            data={
                'grant_type': 'refresh_token',
                'client_id': ML_APP_ID,
                'client_secret': ML_CLIENT_SECRET,
                'refresh_token': refresh_token,
            },
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            timeout=15
        )
        if r.status_code == 200:
            return r.json()
    except Exception as e:
        logger.error(f"[Financials] Token refresh error: {e}")
    return {}


def get_order_details(orders_list, token, now, max_orders=50):
    """批量获取订单详情，按 payment.status + expiration_date 分类"""
    pending = released = refunded = 0.0
    pending_count = released_count = refunded_count = 0
    count = 0

    for sub in orders_list:
        if count >= max_orders:
            break
        try:
            rd = requests.get(
                f"{ML_API_BASE}/marketplace/orders/{sub['id']}",
                headers={'Authorization': f'Bearer {token}'},
                timeout=10
            )
            if rd.status_code != 200:
                continue

            detail = rd.json()
            amt = detail.get('paid_amount', 0) or 0
            exp_str = detail.get('expiration_date', '')
            pay_status = ''
            for p in detail.get('payments', []):
                pay_status = p.get('status', '')
                break

            if pay_status == 'refunded':
                refunded += amt
                refunded_count += 1
            elif pay_status == 'approved':
                if exp_str:
                    try:
                        exp_dt = datetime.fromisoformat(exp_str.replace('Z', '+00:00'))
                        if exp_dt > now:
                            pending += amt
                            pending_count += 1
                        else:
                            released += amt
                            released_count += 1
                    except:
                        pending += amt
                        pending_count += 1
                else:
                    pending += amt
                    pending_count += 1
            else:
                pending += amt
                pending_count += 1

            count += 1
        except Exception:
            continue

    return pending, released, refunded, pending_count, released_count, refunded_count, count


@router.get("/summary")
async def get_financial_summary(
    username: Optional[str] = Query(None, description="用户名，不传则返回所有店铺"),
    max_orders: int = Query(50, description="每站点最多查多少订单详情", ge=1, le=100),
):
    """
    拉取美客多财务汇总（按站点 + 按店铺）
    - 待回款: order.status=paid + expiration_date > now
    - 已回款: order.status=paid + expiration_date < now
    - 已退款: payment.status=refunded
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            if username:
                cursor.execute(
                    "SELECT user_id, nickname, access_token, refresh_token "
                    "FROM stores WHERE owner_username = ? AND access_token IS NOT NULL AND access_token != ''",
                    (username,)
                )
            else:
                cursor.execute(
                    "SELECT user_id, nickname, access_token, refresh_token "
                    "FROM stores WHERE access_token IS NOT NULL AND access_token != ''"
                )
            stores = [dict(r) for r in cursor.fetchall()]

        if not stores:
            return {"ok": True, "stores": [], "total": {"pending": 0, "released": 0, "refunded": 0}}

        all_results = []
        grand_total = {"pending": 0.0, "released": 0.0, "refunded": 0.0}
        now = datetime.now(timezone.utc)

        for store in stores:
            token = store['access_token']
            store_result = {
                "user_id": store['user_id'],
                "nickname": store['nickname'] or "未命名店铺",
                "sites": {},
            }

            for site_id in ALL_SITES:
                try:
                    # 查该站点已付款订单（最多50个pack）
                    r = requests.get(
                        f"{ML_API_BASE}/marketplace/orders/search",
                        params={
                            'seller_id': store['user_id'],
                            'order.status': 'paid',
                            'site': site_id,
                            'limit': 50,
                        },
                        headers={'Authorization': f'Bearer {token}'},
                        timeout=15
                    )

                    if r.status_code == 401 and store.get('refresh_token'):
                        new_tokens = refresh_ml_token(store['refresh_token'])
                        if new_tokens.get('access_token'):
                            token = new_tokens['access_token']
                            with get_db_connection() as conn2:
                                conn2.execute("UPDATE stores SET access_token=? WHERE user_id=?", (token, store['user_id']))
                                conn2.commit()
                            r = requests.get(
                                f"{ML_API_BASE}/marketplace/orders/search",
                                params={
                                    'seller_id': store['user_id'],
                                    'order.status': 'paid',
                                    'site': site_id,
                                    'limit': 50,
                                },
                                headers={'Authorization': f'Bearer {token}'},
                                timeout=15
                            )

                    if r.status_code != 200:
                        continue

                    data = r.json()
                    total_orders = data.get('paging', {}).get('total', 0)
                    if total_orders == 0:
                        continue

                    # 收集所有子订单
                    all_subs = []
                    for pack in data.get('results', []):
                        all_subs.extend(pack.get('orders', []))

                    # 获取详情（最多 max_orders 笔）
                    p, rel, ref, pc, rc, rfc, sampled = get_order_details(
                        all_subs, token, now, max_orders
                    )

                    store_result["sites"][site_id] = {
                        "site_name": ALL_SITES[site_id],
                        "total_orders": total_orders,
                        "sampled": sampled,
                        "pending": round(p, 2),
                        "released": round(rel, 2),
                        "refunded": round(ref, 2),
                        "pending_count": pc,
                        "released_count": rc,
                        "refunded_count": rfc,
                    }
                    grand_total["pending"] += p
                    grand_total["released"] += rel
                    grand_total["refunded"] += ref

                except Exception as e:
                    logger.error(f"[Financials] Site {site_id} error: {e}")
                    continue

            if store_result["sites"]:
                all_results.append(store_result)

        return {
            "ok": True,
            "currency": "USD",
            "timestamp": datetime.now().isoformat(),
            "stores": all_results,
            "total": {
                "pending": round(grand_total["pending"], 2),
                "released": round(grand_total["released"], 2),
                "refunded": round(grand_total["refunded"], 2),
            }
        }

    except Exception as e:
        logger.error(f"[Financials] Summary error: {e}")
        return {"ok": False, "error": str(e)}

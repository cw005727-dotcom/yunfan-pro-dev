#!/usr/bin/env python3
"""检查今日巴西订单（北京时间5月2日）"""
import sys
sys.path.insert(0, '/home/admin/yunfan-pro-dev')

from scripts.utils.token_manager import get_valid_token
import requests

def check_brazil_today():
    token = get_valid_token()
    if not token:
        print("❌ 无法获取有效token")
        return

    seller = 3164144051
    # 北京时间 2026-05-02 = UTC-4 2026-05-01 12:00 ~ 2026-05-02 15:59
    start = "2026-05-01T12:00:00.000-04:00"
    end = "2026-05-02T15:59:59.000-04:00"

    url = "https://api.mercadolibre.com/marketplace/orders/search"
    params = {
        "seller": seller,
        "order.date_created.from": start,
        "order.date_created.to": end,
        "limit": 50
    }
    headers = {"Authorization": f"Bearer {token}"}

    try:
        r = requests.get(url, headers=headers, params=params, timeout=20)
        data = r.json()
        results = data.get('results', [])
        print(f"✅ API响应 {r.status_code}，订单数: {len(results)}")
        for o in results:
            items = [i.get('item',{}).get('id','?') for i in o.get('order_items',[])]
            print(f"  订单 {o['id']} | {o['date_created']} | {o['status']} | 商品 {items}")
    except Exception as e:
        print(f"❌ 请求失败: {e}")

if __name__ == '__main__':
    check_brazil_today()
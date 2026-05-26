#!/usr/bin/env python3
"""
本地 Mac 定时拉取 ML 声誉数据并推送到服务器
定时执行：crontab -e 添加 */5 * * * * python3 /path/to/local_reputation_sync.py
"""
import requests, json, sys, time
from pathlib import Path

SERVER = "https://chensan.vip"

def pull_and_push():
    """从服务器拿 token → 调 ML API → 推送到服务器"""

    # 1. 从服务器获取 access_token
    print(f"[{time.strftime('%H:%M:%S')}] 从服务器获取 token...")
    try:
        # 通过声誉同步专用接口拿 token（不暴露在普通 API 里）
        r = requests.get(f"{SERVER}/api/reputation/token", timeout=10)
        if r.status_code != 200:
            print(f"  获取 token 失败: {r.status_code}")
            return
        data = r.json()
        at = data.get("access_token", "")
        if not at:
            print("  无 token")
            return
    except Exception as e:
        print(f"  请求失败: {e}")
        return

    print(f"  Token: {at[:40]}...")

    # 2. 调 ML API 拉取声誉
    print("  拉取声誉数据...")
    try:
        r = requests.get(
            "https://api.mercadolibre.com/global/users/seller_reputation",
            headers={"Authorization": f"Bearer {at}"},
            timeout=30
        )
        if r.status_code != 200:
            print(f"  ML API 返回 {r.status_code}: {r.text[:200]}")
            return
        rep_data = r.json()
    except Exception as e:
        print(f"  ML API 请求失败: {e}")
        return

    # 3. 推送到服务器
    print("  推送到服务器...")
    try:
        push_data = {"reputation": rep_data.get("seller_reputation", [])}
        r = requests.post(
            f"{SERVER}/api/reputation/sync",
            json=push_data,
            timeout=15
        )
        result = r.json()
        print(f"  推送结果: {result.get('status')}, 更新 {result.get('updated', 0)} 条")
    except Exception as e:
        print(f"  推送失败: {e}")

if __name__ == "__main__":
    pull_and_push()

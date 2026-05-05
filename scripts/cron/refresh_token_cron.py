#!/usr/bin/env python3
"""自动刷新 ML access_token，防止过期"""
import sys, os
# 修复：需要加 project root 到 sys.path，才能 import utils.token_manager
PROJECT_ROOT = '/home/admin/yunfan-pro-dev'
sys.path.insert(0, PROJECT_ROOT)
sys.path.insert(0, os.path.join(PROJECT_ROOT, 'scripts'))

from utils.token_manager import refresh_access_token, load_tokens, save_tokens
import time

def main():
    tokens = load_tokens()
    if not tokens:
        print("❌ 无法获取 token")
        return

    rt = tokens.get('refresh_token')
    if not rt:
        print("❌ 无 refresh_token")
        return

    created_at = tokens.get('created_at', 0)
    expires_in = tokens.get('expires_in', 21600)
    expires_at = created_at + expires_in
    remaining = expires_at - time.time()

    print(f"当前 AT 剩余 {remaining:.0f}s ({remaining/3600:.1f}h)")

    # 快过期了（<30分钟）或已过期才刷新
    if remaining > 1800:
        print(f"AT 仍有效（还剩 {remaining:.0f}s），跳过刷新")
        return

    print("AT 快过期，开始刷新...")
    new_tokens = refresh_access_token(rt)
    if new_tokens:
        print("✅ 刷新成功:", new_tokens['access_token'][:40])
    else:
        print("❌ 刷新失败")

if __name__ == '__main__':
    main()
#!/usr/bin/python3
"""Auto-refresh ML access_token"""
import sys, os, time, json, urllib.parse, urllib.request

import socket
PROJECT_ROOT = '/home/admin/yunfan-pro-dev' if socket.gethostname() == 'iZj6chblbqrz1cmahnevj3Z' else os.path.expanduser('~/yunfan-pro-dev')
sys.path.insert(0, PROJECT_ROOT)
sys.path.insert(0, os.path.join(PROJECT_ROOT, 'scripts'))

# 统一从 config.py 读取凭证
from fastapi_server.config import ML_APP_ID as CLIENT_ID, ML_CLIENT_SECRET

from utils.token_manager import load_tokens, save_tokens

def refresh_access_token(rt):
    params = urllib.parse.urlencode({
        'grant_type': 'refresh_token',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'refresh_token': rt,
    })
    req = urllib.request.Request(
        'https://api.mercadolibre.com/oauth/token',
        data=params.encode(),
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())

def main(force=False):
    tokens = load_tokens()
    if not tokens:
        print('No tokens found')
        return

    rt = tokens.get('refresh_token')
    if not rt:
        print('No refresh_token')
        return

    remaining = tokens.get('created_at', 0) + tokens.get('expires_in', 21600) - time.time()
    print(f'AT remaining: {remaining:.0f}s ({remaining/3600:.1f}h)')

    if not force and remaining > 1800:
        print(f'Still valid ({remaining:.0f}s), skip')
        return

    print('Refreshing...')
    refresh_try = 0
    while refresh_try < 2:
        try:
            new_tokens = refresh_access_token(rt)
            if new_tokens.get('access_token'):
                save_tokens(new_tokens)
                print(f'OK: {new_tokens["access_token"][:40]}...')
                print(f'Expires in: {new_tokens.get("expires_in", "?")}s')
                return
            else:
                print(f'Bad response (try {refresh_try+1}): {new_tokens}')
        except Exception as e:
            print(f'Attempt {refresh_try+1} FAILED: {e}')
        refresh_try += 1
        time.sleep(3)
    print('Refresh failed after 2 attempts')

if __name__ == '__main__':
    # 接收可选参数 --force 强制刷新
    force = '--force' in sys.argv
    main(force=force)
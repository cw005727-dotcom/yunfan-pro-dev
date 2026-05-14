#!/usr/bin/env python3
"""Auto-refresh ML access_token"""
import sys, os, time, json, urllib.parse, urllib.request

import socket
PROJECT_ROOT = '/home/admin/yunfan-pro-dev' if socket.gethostname() == 'iZj6chblbqrz1cmahnevj3Z' else os.path.expanduser('~/yunfan-pro-dev')
sys.path.insert(0, PROJECT_ROOT)
sys.path.insert(0, os.path.join(PROJECT_ROOT, 'scripts'))

CLIENT_ID = '2853782117476515'
CLIENT_SECRET = '0pxmJU6zBiOJ4LyNokerwH4I835ykX3F'

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

def main():
    tokens = load_tokens()
    if not tokens:
        print('no tokens found')
        return

    rt = tokens.get('refresh_token')
    if not rt:
        print('no refresh_token')
        return

    remaining = tokens.get('created_at', 0) + tokens.get('expires_in', 21600) - time.time()
    print(f'AT remaining: {remaining:.0f}s ({remaining/3600:.1f}h)')

    if remaining > 1800:
        print(f'Still valid ({remaining:.0f}s), skip')
        return

    print('Refreshing...')
    try:
        new_tokens = refresh_access_token(rt)
        save_tokens(new_tokens)
        print('OK:', new_tokens['access_token'][:40])
    except Exception as e:
        print(f'FAILED: {e}')

if __name__ == '__main__':
    main()
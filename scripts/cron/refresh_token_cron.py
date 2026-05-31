#!/usr/bin/python3
"""Auto-refresh ML access_token for ALL stores"""
import sys, os, time, json, urllib.parse, urllib.request, sqlite3
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from fastapi_server.config import ML_APP_ID as CLIENT_ID, ML_CLIENT_SECRET

DB_PATH = PROJECT_ROOT / 'mercadolibre.db'

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
    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()

    # 找出所有有 refresh_token 的店铺
    cur.execute(
        "SELECT user_id, nickname, owner_username, refresh_token, token_expires_at FROM stores "
        "WHERE refresh_token IS NOT NULL AND refresh_token != ''"
    )
    stores = cur.fetchall()

    if not stores:
        print('No stores with refresh_token found')
        conn.close()
        return

    now = time.time()
    refreshed = 0
    failed = 0

    for user_id, nickname, owner, rt, expires_at in stores:
        remaining = (expires_at or 0) - now
        print(f'[{owner or "?"}] {nickname or user_id}: AT remaining {remaining:.0f}s ({remaining/3600:.1f}h)')

        if not force and remaining > 1800:
            print(f'  -> Still valid, skip')
            continue

        print(f'  -> Refreshing...')
        refresh_try = 0
        success = False
        while refresh_try < 2:
            try:
                new_tokens = refresh_access_token(rt)
                if new_tokens.get('access_token'):
                    new_at = new_tokens['access_token']
                    new_rt = new_tokens.get('refresh_token', rt)
                    new_expires_in = new_tokens.get('expires_in', 21600)
                    new_expires_at = int(now + new_expires_in)

                    cur.execute(
                        "UPDATE stores SET access_token=? , refresh_token=? , token_expires_at=? WHERE user_id=?",
                        (new_at, new_rt, new_expires_at, user_id)
                    )
                    conn.commit()
                    print(f'  -> OK (expires in {new_expires_in}s)')
                    success = True
                    refreshed += 1
                    break
                else:
                    print(f'  -> Bad response (try {refresh_try+1}): {new_tokens}')
            except Exception as e:
                print(f'  -> Attempt {refresh_try+1} FAILED: {e}')
            refresh_try += 1
            time.sleep(2)

        if not success:
            failed += 1

    conn.close()
    print(f'\nDone: {refreshed} refreshed, {failed} failed')

if __name__ == '__main__':
    force = '--force' in sys.argv
    main(force=force)

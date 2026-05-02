"""
sync_reputation.py - 同步 ML 全球卖店铺声誉数据到 stores 表
从 /global/users/seller_reputation API 获取各站点 seller reputation
按 site_id 写入 stores 表（INSERT OR REPLACE）
API返回的 user_id 可能和 stores 表里的 master_user_id 不一致，用 site_id 定位记录
"""
import requests, sqlite3, os, json
from datetime import datetime

DB_PATH = '/home/admin/yunfan-pro-dev/mercadolibre.db'
TOKEN_ENC = '/home/admin/yunfan-pro-dev/ml_tokens.enc'
TOKEN_KEY_FILE = '/home/admin/yunfan-pro-dev/.ml_token_key'

def simple_decrypt(enc_data, key):
    key_bytes = key.encode()
    data_bytes = base64.b64decode(enc_data.encode())
    return ''.join(chr(b ^ key_bytes[i % len(key_bytes)]) for i, b in enumerate(data_bytes))

def load_tokens():
    key = open(TOKEN_KEY_FILE).read().strip()
    enc = open(TOKEN_ENC).read()
    tokens = json.loads(simple_decrypt(enc, key))
    import time
    created_at = tokens.get('created_at', 0)
    expires_in = tokens.get('expires_in', 21600)
    if time.time() - created_at > expires_in - 3600:
        refreshed = requests.post('https://api.mercadolibre.com/oauth/token', data={
            'grant_type': 'refresh_token',
            'client_id': '8105299077213607',
            'refresh_token': tokens.get('refresh_token', '')
        }, timeout=10).json()
        if refreshed.get('access_token'):
            tokens['access_token'] = refreshed['access_token']
            tokens['created_at'] = time.time()
            if refreshed.get('refresh_token'):
                tokens['refresh_token'] = refreshed['refresh_token']
            key2 = open(TOKEN_KEY_FILE).read().strip()
            enc_out = simple_crypt(json.dumps(tokens), key2)
            open(TOKEN_ENC, 'w').write(enc_out)
    return tokens

def simple_crypt(data, key):
    key_bytes = key.encode()
    data_bytes = data.encode()
    result = bytearray()
    for i in range(len(data_bytes)):
        result.append(data_bytes[i] ^ key_bytes[i % len(key_bytes)])
    return base64.b64encode(result).decode()

def format_rate(rate):
    if rate is None: return '0.00%'
    if isinstance(rate, (int, float)): return f'{rate * 100:.2f}%'
    return str(rate)

def sync_reputation():
    tokens = load_tokens()
    if not tokens: return
    h = {'Authorization': f"Bearer {tokens['access_token']}"}

    res = requests.get('https://api.mercadolibre.com/global/users/seller_reputation', headers=h, timeout=15).json()
    seller_list = res.get('seller_reputation', [])
    print(f'Found {len(seller_list)} sellers in global response')

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    today = datetime.now().strftime('%Y-%m-%d')
    today_short = today[5:]  # e.g. '05-02'

    for item in seller_list:
        site_id = item.get('site_id')
        user_id = item.get('user_id')
        rep = item.get('seller_reputation', {})
        if not site_id or not rep:
            continue

        level = rep.get('level_id', 'unknown')
        metrics = rep.get('metrics', {})

        complaints_rate = format_rate(metrics.get('claims', {}).get('rate'))
        delayed_rate = format_rate(metrics.get('delayed_handling_time', {}).get('rate'))
        cancellations_rate = format_rate(metrics.get('cancellations', {}).get('rate'))

        claims_v = metrics.get('claims', {}).get('value', 0) or 0
        delayed_v = metrics.get('delayed_handling_time', {}).get('value', 0) or 0
        cancel_v = metrics.get('cancellations', {}).get('value', 0) or 0
        total_v = rep.get('transactions', {}).get('total', 0) or 0

        # 计算状态灯
        if 'red' in level.lower() or 'suspended' in level.lower():
            status_color = 'red'
        elif 'yellow' in level.lower() or 'orange' in level.lower():
            status_color = 'yellow'
        else:
            status_color = 'green'

        # 判断是否有问题的指标（> 5% 视为有问题）
        has_complaint = (metrics.get('claims', {}).get('rate') or 0) > 0.05
        has_delayed = (metrics.get('delayed_handling_time', {}).get('rate') or 0) > 0.05
        has_cancel = (metrics.get('cancellations', {}).get('rate') or 0) > 0.05

        print(f'Syncing {site_id} (user_id={user_id}) -> level={level} status={status_color}')
        print(f'  claims={complaints_rate}({claims_v}) delayed={delayed_rate}({delayed_v}) cancel={cancellations_rate}({cancel_v}) total={total_v}')

        # 按 site_id 更新（优先用 site_id 匹配，不管 user_id 对不对得上）
        cursor.execute("""
            UPDATE stores SET
                user_id = ?,
                master_user_id = ?,
                reputation_level = ?,
                status = ?,
                complaints_rate = ?,
                delayed_rate = ?,
                cancellations_rate = ?,
                claims_value = ?,
                delayed_value = ?,
                cancel_value = ?,
                total_transactions = ?,
                alert_date = ?,
                last_updated = CURRENT_TIMESTAMP
            WHERE site_id = ?
        """, (int(user_id), int(user_id), level, status_color,
              complaints_rate, delayed_rate, cancellations_rate,
              claims_v, delayed_v, cancel_v, total_v,
              today_short, site_id))

        if cursor.rowcount == 0:
            # site_id 匹配不上，再用 user_id 试一次
            cursor.execute("""
                UPDATE stores SET
                    user_id = ?,
                    site_id = ?,
                    reputation_level = ?,
                    status = ?,
                    complaints_rate = ?,
                    delayed_rate = ?,
                    cancellations_rate = ?,
                    claims_value = ?,
                    delayed_value = ?,
                    cancel_value = ?,
                    total_transactions = ?,
                    alert_date = ?,
                    last_updated = CURRENT_TIMESTAMP
                WHERE user_id = ? AND site_id IS NULL
            """, (int(user_id), site_id, level, status_color,
                  complaints_rate, delayed_rate, cancellations_rate,
                  claims_v, delayed_v, cancel_v, total_v,
                  today_short, int(user_id)))
            if cursor.rowcount == 0:
                print(f'Warning: No store found for site_id={site_id} user_id={user_id}')

    conn.commit()
    conn.close()
    print('Done')


if __name__ == '__main__':
    import base64
    sync_reputation()

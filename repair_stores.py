"""
修复 stores 表：从 ML API 拉全球声誉数据并填充 stores 表
"""
import json, base64, time, requests, sqlite3
from datetime import datetime

enc = open('/Users/chensan/yunfan-pro-dev/ml_tokens.enc').read()
key = 'YUNFAN_MERCADO_SECRET_2026'
key_bytes = key.encode()
data_bytes = base64.b64decode(enc.encode())
decrypted = ''.join(chr(b ^ key_bytes[i % len(key_bytes)]) for i, b in enumerate(data_bytes))
tokens = json.loads(decrypted)
access_token = tokens.get('access_token')

headers = {'Authorization': f'Bearer {access_token}'}
ALL_SITES = ['MLM', 'MLB', 'MLA', 'MCO', 'MLC', 'MLU']

# 拉全球端点
r = requests.get('https://api.mercadolibre.com/global/users/seller_reputation', headers=headers, timeout=30)
if r.status_code != 200:
    print(f'API error: {r.status_code} {r.text[:300]}')
    exit(1)

raw_list = r.json().get('seller_reputation', [])
print(f'Fetched {len(raw_list)} entries')

# 去重：每个站点保留非 fulfillment 非 newbie 的
best = {}
for item in raw_list:
    sid = item.get('site_id', '')
    if sid not in ALL_SITES:
        continue
    lt = item.get('logistic_type', '')
    if lt == 'fulfillment':
        continue
    rep = item.get('seller_reputation', {})
    level = rep.get('level_id', '')
    
    if sid not in best:
        best[sid] = item
    else:
        old_level = best[sid].get('seller_reputation', {}).get('level_id', '')
        if 'newbie' in old_level and 'newbie' not in level:
            best[sid] = item

print(f'Best entries (non-fulfillment): {len(best)}')
for sid, item in best.items():
    rep = item.get('seller_reputation', {})
    level = rep.get('level_id', '')
    print(f'  {sid}: level={level}')

# 用户信息
user_id = tokens.get('user_id')
ml_user_id = str(user_id)

# 连库
conn = sqlite3.connect('/Users/chensan/yunfan-pro-dev/mercadolibre.db')
cur = conn.cursor()

# 检查已有数据
cur.execute('SELECT COUNT(*) FROM stores')
cnt = cur.fetchone()[0]
print(f'\nCurrent stores count: {cnt}')

if cnt == 0:
    # 插入一条店铺主记录
    cur.execute('''
        INSERT INTO stores (nickname, store_name, user_id, ml_user_id, group_label, last_updated)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', ('主营店铺', '主营店铺', str(user_id), ml_user_id, '默认分组', datetime.now().isoformat()))
    print('Inserted main store record')

# 获取店铺 rowid（最近一条）
cur.execute('SELECT rowid FROM stores ORDER BY rowid DESC LIMIT 1')
row = cur.fetchone()
if not row:
    print('No store found')
    exit(1)
store_rowid = row[0]

# 更新各站点数据
for site_id, item in best.items():
    rep = item.get('seller_reputation', {})
    metrics = rep.get('metrics', {})
    level = rep.get('level_id') or ''
    
    complaints_rate = metrics.get('claims', {}).get('rate', 0)
    delayed_rate = metrics.get('delayed_handling_time', {}).get('rate', 0)
    cancellations_rate = metrics.get('cancellations', {}).get('rate', 0)
    new_claims = metrics.get('claims', {}).get('value', 0) or 0
    new_delayed = metrics.get('delayed_handling_time', {}).get('value', 0) or 0
    new_cancel = metrics.get('cancellations', {}).get('value', 0) or 0
    new_violations = new_claims + new_delayed + new_cancel
    
    prefix = site_id.lower()
    cur.execute(f'''
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
    ''', (level, complaints_rate, delayed_rate, cancellations_rate,
          new_violations, new_claims, new_delayed, new_cancel, store_rowid))
    print(f'  Updated {site_id}: level={level}')

# 更新总违规数和时间戳
cur.execute(f'''
    UPDATE stores SET
        new_violations = (
            COALESCE(mlm_new_violations,0) + COALESCE(mlb_new_violations,0) +
            COALESCE(mla_new_violations,0) + COALESCE(mco_new_violations,0) +
            COALESCE(mlc_new_violations,0) + COALESCE(mlu_new_violations,0)
        ),
        access_token = ?,
        last_updated = ?
    WHERE rowid = ?
''', (access_token, datetime.now().isoformat(), store_rowid))

conn.commit()

# 验证
cur.execute('SELECT * FROM stores WHERE rowid = ?', (store_rowid,))
row = dict(cur.fetchone())
for k, v in row.items():
    if v is not None and v != 0 and v != '' and v != 0.0:
        print(f'  {k}: {v}')

conn.close()
print('\nDone! stores table has been populated.')

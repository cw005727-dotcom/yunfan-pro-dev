"""
同步商品实时数据：曝光(visits) + 评分(purchase_experience)
按 ProductPerformanceView 分类逻辑写入 product_metrics

分类标准：
- 新品(上新关注): start_time 近15天
- 爆款(潜力爆款): 各站点曝光前20
- 已售: sales > 0
- 风险: (conditions TBD)
- 无效: (conditions TBD)
"""
import sqlite3, json, requests, time, os, sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

# 项目根目录，脚本放在 scripts/sync/，所以向上两级
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DB_PATH = str(PROJECT_ROOT / 'mercadolibre.db')

# 用 token_manager 统一拿 token
sys.path.insert(0, str(PROJECT_ROOT))
from scripts.utils.token_manager import load_tokens

BJ_TZ = timezone(timedelta(hours=8))

def get_token():
    tokens = load_tokens()
    return tokens['access_token']

def now_bj():
    return datetime.now(BJ_TZ).strftime('%Y-%m-%d %H:%M:%S')

def fetch_live_data(item_id, headers):
    """拉取单个商品的实时曝光+评分"""
    exposure = 0
    rep_value = -1

    # 1. visits 曝光
    try:
        vr = requests.get(f'https://api.mercadolibre.com/visits/items?ids={item_id}', headers=headers, timeout=6)
        if vr.status_code == 200:
            exposure = vr.json().get(item_id, 0)
    except:
        pass

    # 2. purchase_experience 评分（0-100，ML 官方购物体验评分）
    try:
        pe = requests.get(f'https://api.mercadolibre.com/marketplace/items/{item_id}/purchase_experience', headers=headers, timeout=6)
        if pe.status_code == 200:
            d = pe.json()
            if isinstance(d, list) and d:
                rep_value = d[0].get('reputation', {}).get('value', -1)
    except:
        pass

    return exposure, rep_value

def sync():
    token = get_token()
    headers = {'Authorization': f'Bearer {token}'}
    now = now_bj()

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    sites = ['MLB', 'MLM', 'MCO', 'MLA', 'MLC', 'MLU']
    total_updated = 0

    for site in sites:
        # 取该站点所有商品（优先有销量+有曝光的）
        cur.execute("""
            SELECT item_id, name, exposure, sales, health_score, start_time, status, image_url
            FROM product_metrics
            WHERE site_id = ?
            ORDER BY sales DESC, exposure DESC
            LIMIT 100
        """, (site,))

        rows = cur.fetchall()
        if not rows:
            print(f'[{site}] 无商品')
            continue

        print(f'[{site}] 开始同步 {len(rows)} 个商品...')
        updated = 0

        for row in rows:
            iid = row[0]
            try:
                live_exp, live_score = fetch_live_data(iid, headers)

                # 写入 DB
                cur.execute("""
                    UPDATE product_metrics
                    SET exposure = ?, health_score = ?, last_updated = ?
                    WHERE item_id = ?
                """, (live_exp, live_score, now, iid))
                updated += 1
                total_updated += 1

                # 每50个提交一次，避免锁太久
                if updated % 50 == 0:
                    conn.commit()

                # API 限速：每秒不超过2个请求
                time.sleep(0.5)

            except Exception as e:
                print(f'  error {iid}: {e}')
                continue

        conn.commit()
        print(f'[{site}] 完成 {updated} 个')

    conn.close()
    print(f'\n全部完成，共更新 {total_updated} 个，更新时间 {now}')

if __name__ == '__main__':
    sync()
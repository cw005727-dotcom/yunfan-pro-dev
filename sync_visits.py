#!/usr/bin/env python3
"""Step 2: 拉取所有真实商品访客量 (exposure) - SSL稳定版"""
import requests, sqlite3, time, threading, queue
from token_manager import load_tokens
from concurrent.futures import ThreadPoolExecutor, as_completed
import urllib3
urllib3.disable_warnings()

DB = "/Users/chensan/yunfan-pro-dev/mercadolibre.db"
BATCH = 200
RATE_MS = 150  # 每请求间隔
TOKEN = None

# 配置不验证SSL（因LibreSSL兼容问题）
session = requests.Session()
adapter = requests.adapters.HTTPAdapter(
    max_retries=urllib3.util.retry.Retry(total=3, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
)
session.mount("https://", adapter)

def get_token():
    global TOKEN
    if TOKEN is None:
        TOKEN = load_tokens()["access_token"]
    return TOKEN

def fetch(item_id):
    for attempt in range(3):
        try:
            h = {"Authorization": "Bearer " + get_token()}
            r = session.get(
                "https://api.mercadolibre.com/visits/items?ids=" + item_id,
                headers=h, timeout=20
            )
            if r.status_code == 200:
                return item_id, r.json().get(item_id, 0)
            elif r.status_code == 429:
                time.sleep(5)
            else:
                return item_id, 0
        except Exception:
            pass
        time.sleep(1)
    return item_id, 0

def writer(q, total):
    buf = []
    written = [0]
    while True:
        try:
            item_id, views = q.get(timeout=300)
        except queue.Empty:
            break
        if item_id is None:
            _flush(buf); buf = []
            break
        buf.append((views, item_id))
        if len(buf) >= BATCH:
            _flush(buf); buf = []
    print(f"写线程结束, 共{written[0]}条", flush=True)

def _flush(buf):
    if not buf: return
    try:
        conn = sqlite3.connect(DB)
        c = conn.cursor()
        c.executemany("UPDATE product_metrics SET exposure=? WHERE item_id=?", buf)
        conn.commit()
        conn.close()
    except Exception as e:
        print("写入错误: " + str(e), flush=True)

def main():
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("SELECT item_id FROM product_metrics WHERE site_id IN ('MLB','MLA','MCO','MLU','MLM_R')")
    items = [r[0] for r in c.fetchall()]
    conn.close()

    total = len(items)
    result_q = queue.Queue(maxsize=500)
    w = threading.Thread(target=writer, args=(result_q, total), daemon=True)
    w.start()

    print(f"总商品: {total} | 并发: 8 | 限速: {RATE_MS}ms/请求", flush=True)
    t0 = time.time()
    done = [0]

    with ThreadPoolExecutor(max_workers=8) as ex:
        futures = {ex.submit(fetch, i): i for i in items}
        for future in as_completed(futures):
            iid, views = future.result()
            result_q.put((iid, views))
            with threading.Lock():
                done[0] += 1
                if done[0] % 500 == 0:
                    rate = done[0] / (time.time() - t0)
                    eta = (total - done[0]) / rate / 60
                    print(f"  {done[0]}/{total} ({rate:.0f}/s, ETA {eta:.1f} min)", flush=True)
            time.sleep(RATE_MS / 1000)

    result_q.put((None, None))
    w.join(timeout=60)

    conn3 = sqlite3.connect(DB)
    c3 = conn3.cursor()
    c3.execute("SELECT site_id, count(*), sum(exposure) FROM product_metrics WHERE exposure>0 GROUP BY site_id ORDER BY site_id")
    print("=== 访客统计 ===", flush=True)
    for r in c3.fetchall():
        print(f"  {r[0]}: {r[1]}品, {r[2]}访", flush=True)
    conn3.close()
    print("DONE", flush=True)

if __name__ == "__main__":
    main()

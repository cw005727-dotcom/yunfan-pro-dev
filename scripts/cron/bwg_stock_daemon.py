#!/usr/bin/env python3
"""
搬瓦工库存监控服务
监控 KVM 年付（一直有货）和 CN2 GIA-E 限量版补货通知
后台常驻，有货时发 Telegram 通知
"""
import subprocess, time, json, sys, os, signal
from threading import Timer

CHAT_ID = "6641785946"
CHECK_INTERVAL = 3600  # 1小时检查一次
LOG_FILE = "/Users/chensan/yunfan-pro-dev/logs/bwg_monitor.log"
STATE_FILE = "/tmp/bwg_last_stock.json"
PID_FILE = "/tmp/bwg_monitor.pid"
PROXY_HTTP = "http://127.0.0.1:7897"

def log(msg):
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}\n"
    with open(LOG_FILE, "a") as f:
        f.write(line)
    print(line.strip())

def fetch_page(url):
    try:
        return subprocess.check_output([
            "curl", "-s", "--max-time", "15",
            "-x", PROXY_HTTP,
            "-L", "-H", "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            url
        ], stderr=subprocess.DEVNULL).decode("utf-8", errors="ignore")
    except Exception as e:
        log(f"获取页面失败 {url}: {e}")
        return ""

def check_kvm_in_stock():
    """KVM $49.99/年 常规款 — 一直有货，直接返回有货"""
    return "有货"

def check_cn2_gia_e_restock():
    """CN2 GIA-E 限量版补货检测 — 有货才算补货成功"""
    page = fetch_page("https://bwg6.net/cn2-gia-e/")
    
    # 缺货特征
    if any(kw in page.lower() for kw in ["out of stock", "sold out", "缺货", "已售罄"]):
        return "缺货"
    
    # 有货特征：有 Add to Cart 或 Order Now 且有 $49.99 价格
    page_lower = page.lower()
    has_add_cart = "add to cart" in page_lower or "order now" in page_lower
    has_low_price = "$49.99" in page
    
    if has_add_cart and has_low_price:
        return "有货"
    
    # 页面能打开但无明确信号
    if page and "bandwagon" in page_lower:
        return "未知(页面正常)"
    
    return "未知"

def send_telegram(text):
    try:
        cmd = [
            "curl", "-s", "--max-time", "10",
            "-x", PROXY_HTTP,
            "https://api.telegram.org/bot8611187791:AAGNwpeNScAerXxrt3g6JjLa_Cur8fhoi8o/sendMessage",
            "-d", f"chat_id={CHAT_ID}",
            "-d", f"text={text}"
        ]
        result = subprocess.run(cmd, capture_output=True, timeout=15)
        resp = result.stdout.decode("utf-8", errors="ignore")
        try:
            j = json.loads(resp)
            if j.get("ok"):
                log("Telegram 通知发送成功")
            else:
                log(f"Telegram 发送失败: {j}")
        except:
            log(f"Telegram 响应解析失败: {resp[:200]}")
    except Exception as e:
        log(f"Telegram 发送异常: {e}")

def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE) as f:
            return json.load(f)
    return {"cn2_last_stock": "", "cn2_last_notify": 0, "kvm_last": "有货"}

def save_state(state):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f)

def check_and_notify():
    state = load_state()
    now = time.time()

    # 1. KVM $49.99/年 状态（始终有货）
    kvm_status = check_kvm_in_stock()
    log(f"KVM 常规款: {kvm_status}")

    # 2. CN2 GIA-E 限量版补货检测
    cn2_status = check_cn2_gia_e_restock()
    log(f"CN2 GIA-E 限量版: {cn2_status} (上次: {state['cn2_last_stock']})")

    # CN2 GIA-E 从缺货变有货 → 发补货通知
    if cn2_status == "有货" and state["cn2_last_stock"] != "有货":
        state["cn2_last_notify"] = now
        save_state(state)

        msg = """🎉 搬瓦工 CN2 GIA-E 限量套餐补货了！

💰 配置：1GB · 2核 · 20GB · 1TB · 2.5Gbps
💵 价格：$49.99/季度 ($169.99/年)
🌐 可迁往：DC6 / DC9 / 日本软银 / JPOS_1 / 荷兰 / 加拿大 / 🇸🇬新加坡

👉 立即购买：https://bwg6.net/cn2-gia-e/
🔖 优惠码：BWHNCXNVXV（6.58%折扣）"""
        send_telegram(msg)
        log("已发送 CN2 GIA-E 补货通知")

    elif cn2_status == "有货" and state["cn2_last_stock"] == "有货":
        # 持续有货，每6小时提醒一次
        if now - state.get("cn2_last_notify", 0) > 6 * 3600:
            msg = "📦 搬瓦工 CN2 GIA-E 限量套餐持续有货中，还没买？👉 https://bwg6.net/cn2-gia-e/"
            send_telegram(msg)
            state["cn2_last_notify"] = now
            save_state(state)
            log("发送持续有货提醒")

    state["cn2_last_stock"] = cn2_status
    state["kvm_last"] = kvm_status
    save_state(state)

    Timer(CHECK_INTERVAL, check_and_notify).start()

def main():
    log("=== 搬瓦工库存监控启动 ===")
    log("监控：KVM $49.99/年（常规款）+ CN2 GIA-E 限量版补货")

    if os.path.exists(PID_FILE):
        with open(PID_FILE) as f:
            old_pid = int(f.read().strip())
        try:
            os.kill(old_pid, 0)
            log(f"已有监控进程运行 (PID={old_pid})，退出")
            sys.exit(0)
        except OSError:
            log("旧PID文件过期，启动新进程")

    with open(PID_FILE, "w") as f:
        f.write(str(os.getpid()))

    check_and_notify()

    def cleanup(signum, frame):
        log("收到停止信号，退出")
        os.unlink(PID_FILE)
        sys.exit(0)

    signal.signal(signal.SIGTERM, cleanup)
    signal.signal(signal.SIGINT, cleanup)

    while True:
        time.sleep(3600)

if __name__ == "__main__":
    main()
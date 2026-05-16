#!/usr/bin/env python3
"""
用卖家 Cookie 测试 ML 墨西哥站可访问的数据
"""
import json
import time
from playwright.sync_api import sync_playwright

COOKIE_FILE = "/Users/chensan/yunfan-pro-dev/scripts/workers/mlm_cookies.json"

def load_cookies():
    with open(COOKIE_FILE) as f:
        raw = json.load(f)
    # 转换为 Playwright 格式
    cookies = []
    for c in raw:
        exp = c.get("expirationDate")
        same = c.get("sameSite", "no_restriction")
        if same in ("no_restriction", "unspecified"):
            same = "None"
        cookies.append({
            "name": c["name"],
            "value": c["value"],
            "domain": c["domain"],
            "path": c["path"],
            "expires": exp if exp and exp > 0 else -1,
            "httpOnly": c.get("httpOnly", False),
            "secure": c.get("secure", True),
            "sameSite": same,
        })
    return cookies

def test_mlm_access():
    with sync_playwright() as p:
        # 启动 Chromium（不留痕模式）
        ctx = p.chromium.launch_persistent_context(
            "/tmp/mlm_test_profile",
            headless=True,
            args=["--disable-blink-features=AutomationControlled"]
        )
        
        # 加载 cookie
        cookies = load_cookies()
        ctx.add_cookies(cookies)
        print(f"✅ 已加载 {len(cookies)} 条 cookie")
        
        page = ctx.new_page()
        page.set_extra_http_headers({
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        })
        
        # 测试1：访问 ML 主页
        print("\n=== 测试1: MLM 首页 ===")
        try:
            resp = page.goto("https://www.mercadolibre.com.mx", timeout=15000)
            print(f"状态码: {resp.status}")
            print(f"标题: {page.title()}")
        except Exception as e:
            print(f"失败: {e}")
        
        # 测试2：访问分类目录（JS渲染的数据）
        print("\n=== 测试2: 搜索电子类商品 ===")
        try:
            page.goto("https://www.mercadolibre.com.mx/DO-electronics/", timeout=15000)
            page.wait_for_timeout(3000)
            # 提取商品标题
            titles = page.locator(".ui-search-item__title").all_text_contents()[:5]
            print(f"找到商品: {len(titles)} 条")
            for t in titles:
                print(f"  - {t[:50]}")
        except Exception as e:
            print(f"失败: {e}")
        
        # 测试3：调 ML API（用 session cookie）
        print("\n=== 测试3: 调用 ML Catalog API ===")
        api_tests = [
            # (url, description)
            ("https://api.mercadolibre.com/sites/MLM/categories", "站点分类"),
            ("https://api.mercadolibre.com/sites/MLM/search?q=smartphone&limit=5", "搜索API"),
            ("https://api.mercadolibre.com/users/3286244639", "用户信息"),
        ]
        
        for url, desc in api_tests:
            try:
                resp = page.request.get(url, timeout=10000)
                print(f"\n  {desc}: {resp.status}")
                if resp.status == 200:
                    data = resp.json()
                    keys = list(data.keys())[:5] if isinstance(data, dict) else "list"
                    print(f"  返回字段: {keys}")
            except Exception as e:
                print(f"  {desc}: 失败 - {e}")
        
        # 测试4：访问卖家后台
        print("\n=== 测试4: 卖家中心 ===")
        try:
            resp = page.goto("https://myMercadoLibre.mercadolibre.com.mx/", timeout=15000)
            print(f"状态码: {resp.status}")
            print(f"标题: {page.title()}")
        except Exception as e:
            print(f"失败: {e}")
        
        # 保存截图
        page.goto("https://www.mercadolibre.com.mx", timeout=10000)
        page.wait_for_timeout(2000)
        page.screenshot(path="/Users/chensan/yunfan-pro-dev/mlm_cookie_test.png")
        print("\n截图已保存: mlm_cookie_test.png")
        
        ctx.close()

if __name__ == "__main__":
    test_mlm_access()
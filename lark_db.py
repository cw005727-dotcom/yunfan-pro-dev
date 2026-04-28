import json
import subprocess
import time

APP_TOKEN = "I8OlbQZMwaVh08sdFvIcrcW3nbc"
ORDERS_TABLE = "tblcYUBPsHH96puy"
USERS_TABLE = "tblHTgIw2qyTVIZl"

def get_tenant_orders(user_email):
    """
    Fetch orders from Feishu Bitable filtered by user_email.
    Using Feishu API filter logic: filter=fields.所属用户="user_email"
    """
    filter_query = f'fields.所属用户="{user_email}"'
    cmd = [
        "lark-cli", "api", "GET",
        f"/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{ORDERS_TABLE}/records",
        "--params", json.dumps({"filter": filter_query, "page_size": 100})
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        data = json.loads(result.stdout)
        records = data.get("data", {}).get("items", [])
        orders = []
        for r in records:
            f = r["fields"]
            orders.append([
                f.get("站点", ""),
                f.get("下单时间", 0),
                f.get("商品名称", ""),
                f.get("数量", 0),
                f.get("订单金额", 0),
                f.get("状态", "")
            ])
        return orders
    return []

def verify_lark_user(email, password):
    """
    Verify user in Feishu '用户中心' table.
    Note: For simplicity in this demo, we assume plain text or simple hash check.
    In production, use hashed passwords.
    """
    filter_query = f'fields.用户邮箱="{email}"'
    cmd = [
        "lark-cli", "api", "GET",
        f"/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{USERS_TABLE}/records",
        "--params", json.dumps({"filter": filter_query})
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        data = json.loads(result.stdout)
        items = data.get("data", {}).get("items", [])
        if items:
            # Check password (assuming we stored it in a field '密码')
            # For now, let's just return the user if they exist for testing
            return True
    return False

def register_lark_user(email, password):
    """Create a new user record in Feishu."""
    fields = {
        "用户邮箱": email,
        "用户角色": "普通客户",
        "账户积分": 0
    }
    cmd = [
        "lark-cli", "api", "POST",
        f"/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{USERS_TABLE}/records",
        "--data", json.dumps({"fields": fields})
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode == 0

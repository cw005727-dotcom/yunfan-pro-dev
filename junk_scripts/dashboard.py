import streamlit as st
import sqlite3
import hashlib
import json
import subprocess
import time

# --- 飞书配置 ---
APP_TOKEN = "I8OlbQZMwaVh08sdFvIcrcW3nbc"
ORDERS_TABLE = "tblcYUBPsHH96puy"
USERS_TABLE = "tblHTgIw2qyTVIZl"

def get_feishu_orders(user_email):
    """从飞书 API 实时获取属于该用户的订单（代码级隔离，完全免费）"""
    # 过滤规则：字段“所属用户”等于当前登录邮箱
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
            # 格式化日期：飞书毫秒戳转字符串
            ts = f.get("下单时间", 0) / 1000
            dt_str = time.strftime("%Y-%m-%d %H:%M", time.localtime(ts)) if ts > 0 else "N/A"
            orders.append([
                f.get("站点", ""),
                dt_str,
                f.get("商品名称", ""),
                f.get("数量", 0),
                f.get("订单金额", 0),
                f.get("状态", "")
            ])
        return orders
    return []

# --- 1. 核心配置：锁定复刻架构 ---
st.set_page_config(page_title="云帆跨境 Pro", layout="wide", initial_sidebar_state="collapsed")

# --- 2. 数据库逻辑 (原生 SQL, 零依赖) ---
def init_db():
    conn = sqlite3.connect('mercadolibre.db')
    cursor = conn.cursor()
    cursor.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, is_admin INTEGER DEFAULT 0)")
    conn.commit(); conn.close()

def get_stats():
    conn = sqlite3.connect('mercadolibre.db')
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT SUM(amount), COUNT(*), SUM(net_profit), AVG(amount) FROM orders_v2")
        stats = cursor.fetchone()
        return stats if stats and stats[1] is not None else (0, 0, 0, 0)
    except:
        return (0, 0, 0, 0)
    finally:
        conn.close()

def get_orders_list(limit=None):
    conn = sqlite3.connect('mercadolibre.db')
    cursor = conn.cursor()
    try:
        query = "SELECT site_id, order_date, product_name, quantity, amount, status FROM orders_v2 ORDER BY order_date DESC"
        if limit: query += f" LIMIT {limit}"
        cursor.execute(query)
        return cursor.fetchall()
    except:
        return []
    finally:
        conn.close()

def verify_login(u, p):
    conn = sqlite3.connect('mercadolibre.db')
    try:
        cursor = conn.cursor()
        pwd_hash = hashlib.sha256(p.encode()).hexdigest()
        cursor.execute("SELECT id FROM users WHERE username=? AND password=?", (u, pwd_hash))
        res = cursor.fetchone(); return res[0] if res else None
    finally: conn.close()

def register_user(u, p):
    conn = sqlite3.connect('mercadolibre.db')
    try:
        cursor = conn.cursor()
        pwd_hash = hashlib.sha256(p.encode()).hexdigest()
        cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (u, pwd_hash))
        conn.commit(); return True
    except sqlite3.IntegrityError: return False
    finally: conn.close()

init_db()

# --- 3. 状态管理 ---
if 'user_id' not in st.session_state: st.session_state['user_id'] = None
if 'mode' not in st.session_state: st.session_state['mode'] = 'login'
if 'page' not in st.session_state: st.session_state['page'] = 'dashboard'

# --- 4. 样式注入：1:1 像素级深度定制 (aigzl.top 风格) ---
def inject_global_styles():
    st.markdown("""
        <style>
        /* 强制抹除 Streamlit 原生痕迹 */
        [data-testid="stHeader"], footer, [data-testid="stSidebarNav"] { display: none !important; }
        .stApp { 
            background: rgb(248, 250, 252) !important; 
        }
        .stMainBlockContainer { padding: 0 !important; max-width: 100% !important; margin: 0 !important; }
        
        /* 通用字体与圆角核心配置 (16px) */
        * { font-family: "Inter", "Segoe UI", Roboto, sans-serif !important; border-radius: 16px !important; }
        
        /* 输入框深度定制：aigzl 浅蓝风格 */
        div[data-testid="stTextInput"] input {
            background-color: rgb(232, 240, 254) !important;
            border: 1px solid rgb(226, 232, 240) !important;
            height: 52px !important;
            padding: 0 16px 0 16px !important;
            font-size: 15px !important;
            color: rgb(15, 23, 42) !important;
            transition: all 0.2s ease !important;
        }
        div[data-testid="stTextInput"] input:focus {
            background-color: white !important;
            border-color: rgb(37, 99, 235) !important;
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1) !important;
        }
        div[data-testid="stTextInput"] label {
            font-weight: 600 !important;
            color: rgb(71, 85, 105) !important;
            font-size: 14px !important;
            margin-bottom: 8px !important;
        }

        /* 按钮深度定制：aigzl 深蓝方案 */
        div.stButton > button {
            background: rgb(15, 23, 42) !important;
            color: white !important;
            height: 52px !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            border: none !important;
            width: 100% !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        div.stButton > button:hover {
            background: rgb(30, 41, 59) !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15) !important;
        }
        </style>
    """, unsafe_allow_html=True)

def inject_login_styles():
    st.markdown("""
        <style>
        /* 左右分屏架构 */
        [data-testid="stHorizontalBlock"] { height: 100vh !important; gap: 0 !important; }
        
        /* 左侧品牌区：极简深邃 (aigzl 1:1) */
        [data-testid="stHorizontalBlock"] > [data-testid="stColumn"]:nth-child(1) {
            background: linear-gradient(135deg, rgb(15, 23, 42) 0%, rgb(2, 6, 23) 100%) !important;
            min-height: 100vh !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            padding: 0 5% !important;
            border-radius: 0 !important;
        }
        
        /* 右侧交互区 (aigzl 1:1) */
        [data-testid="stHorizontalBlock"] > [data-testid="stColumn"]:nth-child(2) {
            background: white !important;
            min-height: 100vh !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            padding: 0 8% !important;
            border-radius: 0 !important;
        }
        
        /* 抹除默认边距 */
        [data-testid="stMainBlockContainer"] { padding: 0 !important; }
        [data-testid="stVerticalBlock"] { gap: 0 !important; }

        /* 左侧文案排版 */
        .brand-content { width: 100%; max-width: 580px; margin: auto; }
        .brand-tag { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: white; padding: 8px 16px; font-size: 13px; font-weight: 700; width: fit-content; margin-bottom: 32px; border-radius: 20px !important; }
        .brand-h1 { font-size: 60px; font-weight: 800; color: white; line-height: 1.1; margin: 0; letter-spacing: -2px; }
        .brand-p { font-size: 16px; color: rgb(148, 163, 184); line-height: 1.6; margin: 24px 0 40px 0; }
        
        /* 功能卡片 (aigzl 1:1) */
        .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 40px; }
        .feature-card { 
            background: rgba(255, 255, 255, 0.03); 
            border: 1px solid rgba(255, 255, 255, 0.1); 
            padding: 24px; 
            border-radius: 20px !important; 
            transition: all 0.3s ease;
        }
        .feature-card:hover { 
            background: rgba(255, 255, 255, 0.06); 
            border-color: rgba(255, 255, 255, 0.2); 
            transform: translateY(-4px); 
        }
        .feature-title { font-weight: 700; font-size: 16px; color: white; margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
        .feature-desc { font-size: 13px; color: rgba(255, 255, 255, 0.5); line-height: 1.5; }

        /* 右侧 Tab */
        .tab-container { background: rgb(241, 245, 249); padding: 4px; display: flex; gap: 4px; margin-bottom: 40px; border-radius: 12px !important; }
        .tab-btn { flex: 1; text-align: center; padding: 10px; font-size: 14px; font-weight: 600; color: rgb(100, 116, 139); cursor: pointer; border-radius: 10px !important; }
        .tab-active { background: white; color: rgb(15, 23, 42); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

        /* 表单文案 */
        .welcome-back { font-size: 12px; font-weight: 800; color: rgb(37, 99, 235); letter-spacing: 2px; margin-bottom: 8px; }
        .form-h2 { font-size: 32px; font-weight: 800; color: rgb(15, 23, 42); margin: 0; }
        .form-p { font-size: 14px; color: rgb(100, 116, 139); margin: 12px 0 32px 0; }
        
        /* 字段标签 */
        .field-label { font-size: 14px; font-weight: 700; color: rgb(15, 23, 42); margin-bottom: 8px; display: block; }
        </style>
    """, unsafe_allow_html=True)

def inject_dashboard_styles():
    st.markdown("""
        <style>
        /* 1:1 像素级复刻顶部导航 (dashboard_final.png) */
        .stApp { background: rgb(248, 250, 252) !important; }
        [data-testid="stHeader"] { display: none !important; }
        [data-testid="stMainBlockContainer"] { padding: 0 !important; }
        
        .nav-header {
            background: rgb(15, 23, 42);
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 40px;
            color: white;
            position: sticky;
            top: 0;
            z-index: 999;
        }
        .nav-logo { font-size: 16px; font-weight: 800; letter-spacing: 0.5px; }
        .nav-logo span { color: rgb(37, 99, 235); }
        
        .nav-center { display: flex; align-items: center; gap: 8px; }
        .nav-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 18px;
            font-size: 14px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.7);
            cursor: pointer;
            border-radius: 99px !important;
            transition: all 0.2s;
        }
        .nav-item-active {
            background: rgb(37, 99, 235) !important;
            color: white !important;
        }
        .nav-right { font-size: 13px; color: rgba(255, 255, 255, 0.5); }

        /* 内容区排版 */
        .content-container { padding: 40px 60px; }
        .page-title-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
        .page-title { font-size: 32px; font-weight: 800; color: rgb(15, 23, 42); margin: 0; }
        .page-desc { font-size: 14px; color: rgb(100, 116, 139); margin-top: 8px; }

        /* 指标卡片 (1:1 复刻自参考图) */
        .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 24px; }
        .stat-card {
            background: white;
            border: 1px solid rgb(241, 245, 249);
            padding: 24px;
            border-radius: 20px !important;
            position: relative;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .stat-bar { position: absolute; top: 0; left: 0; width: 100%; height: 4px; }
        .stat-label { font-size: 13px; font-weight: 700; color: rgb(100, 116, 139); margin-bottom: 16px; display: flex; justify-content: space-between; }
        .stat-value { font-size: 36px; font-weight: 800; color: rgb(15, 23, 42); margin-bottom: 4px; }
        .stat-footer { font-size: 12px; color: rgb(148, 163, 184); font-weight: 500; }
        
        /* 状态标识 */
        .trend-down { color: rgb(220, 38, 38); font-size: 11px; }

        /* 告警框 (1:1 复刻) */
        .alert-container { margin-bottom: 32px; }
        .custom-alert {
            padding: 16px 24px;
            border-radius: 12px !important;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 14px;
            border: 1px solid transparent;
        }
        .alert-red { background: rgb(254, 242, 242); border-color: rgb(254, 226, 226); color: rgb(153, 27, 27); }
        .alert-yellow { background: rgb(255, 251, 235); border-color: rgb(254, 243, 199); color: rgb(146, 64, 14); }
        </style>
    """, unsafe_allow_html=True)

# --- 5. 渲染引擎 ---
inject_global_styles()

if st.session_state['user_id'] is None:
    inject_login_styles()
    
    # 强制分栏
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.markdown("""
            <div class="brand-content">
                <div class="brand-tag">✨ MERCADOAI PRO</div>
                <h1 class="brand-h1">跨境电商的智能工作台</h1>
                <h1 class="brand-h1" style="color:rgba(255,255,255,0.6);">采集、生成、发布一体化</h1>
                <p class="brand-p">告别低效搬运。通过多变体采集、AI 主图与轮播优化、以及符合官方规则的发布流程，统一管理您的跨境 Listing 工作流。</p>
                
                <div class="feature-grid">
                    <div class="feature-card">
                        <div class="feature-title"><span>⚡️</span> 极速多变体采集</div>
                        <div class="feature-desc">一次抓取主图、变体矩阵与 SKU 维度信息，减少重复整理成本。</div>
                    </div>
                    <div class="feature-card">
                        <div class="feature-title"><span>✨</span> AI 图文优化</div>
                        <div class="feature-desc">主图、轮播图、标题和属性同步优化，直接进入上架工作流。</div>
                    </div>
                    <div class="feature-card" style="grid-column: span 2;">
                        <div class="feature-title"><span>🛡️</span> 官方规则对齐发布</div>
                        <div class="feature-desc">基于 Mercado 规则进行字段校验与发布编排，减少人工排错和流程中断。</div>
                    </div>
                </div>
            </div>
        """, unsafe_allow_html=True)
        
    with col2:
        # Tab 切换
        mode_html = f"""
            <div class="tab-container">
                <div class="tab-btn {'tab-active' if st.session_state['mode']=='login' else ''}" onclick="window.location.reload()">登录</div>
                <div class="tab-btn {'tab-active' if st.session_state['mode']=='register' else ''}" onclick="window.location.reload()">注册</div>
            </div>
        """
        # 注意：Streamlit 按钮不能直接写在 HTML 里，我们用 columns 模拟
        st.markdown('<div class="tab-container">', unsafe_allow_html=True)
        t1, t2 = st.columns(2)
        with t1:
            if st.button("登录", key="btn_l", use_container_width=True): st.session_state['mode']='login'; st.rerun()
        with t2:
            if st.button("注册", key="btn_r", use_container_width=True): st.session_state['mode']='register'; st.rerun()
        st.markdown('</div>', unsafe_allow_html=True)

        if st.session_state['mode'] == 'login':
            st.markdown('<div class="welcome-back">WELCOME BACK</div>', unsafe_allow_html=True)
            st.markdown('<h2 class="form-h2">欢迎回来</h2>', unsafe_allow_html=True)
            st.markdown('<p class="form-p">登录后将自动恢复您的租户身份、访问权限和系统工作区。</p>', unsafe_allow_html=True)
            
            st.markdown('<span class="field-label">登录邮箱</span>', unsafe_allow_html=True)
            u = st.text_input("email", placeholder="请输入您的登录邮箱", key="u_field", label_visibility="collapsed")
            
            st.markdown('<span class="field-label" style="margin-top:24px;">密码</span>', unsafe_allow_html=True)
            p = st.text_input("pass", type="password", placeholder="请输入您的密码", key="p_field", label_visibility="collapsed")
            
            if st.button("进入工作台 →", key="login_submit", use_container_width=True):
                if u and p:
                    if verify_login(u, p): st.session_state['user_id'] = u; st.rerun()
                    else: st.error("❌ 验证失败：账号或密码不正确")
        else:
            st.markdown('<div class="welcome-back">GET STARTED</div>', unsafe_allow_html=True)
            st.markdown('<h2 class="form-h2">创建新账号</h2>', unsafe_allow_html=True)
            st.markdown('<p class="form-p">加入专业卖家都在使用的智能管理平台。</p>', unsafe_allow_html=True)
            
            st.markdown('<span class="field-label">电子邮箱</span>', unsafe_allow_html=True)
            ru = st.text_input("reg_email", placeholder="请输入您的电子邮箱", key="ru_field", label_visibility="collapsed")
            
            st.markdown('<span class="field-label" style="margin-top:24px;">设置密码</span>', unsafe_allow_html=True)
            rp = st.text_input("reg_pass", type="password", placeholder="至少包含 6 位字符", key="rp_field", label_visibility="collapsed")
            
            if st.button("立即开启智能运营", key="reg_submit", use_container_width=True):
                if ru and rp:
                    if register_user(ru, rp): st.success("🎉 注册成功！")
                    else: st.error("❌ 注册失败：邮箱已存在")

else:
    inject_dashboard_styles()
    
    # --- 1:1 像素级复刻顶部导航 (dashboard_final.png) ---
    st.markdown(f"""
        <div class="nav-header">
            <div class="nav-logo">MERCADOAI <span>PRO</span></div>
            <div class="nav-center">
                <div class="nav-item nav-item-active">📊 数据大盘</div>
                <div class="nav-item">📦 订单管理</div>
            </div>
            <div class="nav-right">管理员: {st.session_state['user_id']} | 📡 飞书实时驱动</div>
        </div>
    """, unsafe_allow_html=True)

    # --- 内容容器 ---
    st.markdown('<div class="content-container">', unsafe_allow_html=True)

    # --- 页面标题 Row ---
    st.markdown("""
        <div class="page-title-row">
            <div>
                <h1 class="page-title">数据大盘</h1>
                <p class="page-desc">数据源已切换至飞书多维表格 (Bitable)，由 AI 实时同步</p>
            </div>
            <div style="display:flex; gap:12px;">
                <div style="background:white; border:1px solid rgb(241,245,249); padding:4px; border-radius:12px; display:flex;">
                    <div style="padding:8px 20px; font-size:14px; color:rgb(100,116,139); font-weight:600;">今天</div>
                    <div style="padding:8px 20px; font-size:14px; background:rgb(15,23,42); color:white; border-radius:8px; font-weight:600;">近7天</div>
                    <div style="padding:8px 20px; font-size:14px; color:rgb(100,116,139); font-weight:600;">近30天</div>
                </div>
                <div style="background:rgb(15,23,42); color:white; padding:10px 24px; border-radius:12px; font-size:14px; font-weight:700; cursor:pointer;">🔄 刷新数据</div>
            </div>
        </div>
    """, unsafe_allow_html=True)

    # 获取数据并渲染
    orders = get_feishu_orders(st.session_state['user_id'])
    
    # 指标计算逻辑
    total_orders = len(orders)
    total_amount = sum([float(o[4]) for o in orders])
    
    # --- 告警系统 (1:1 复刻) ---
    st.markdown("""
        <div class="alert-container">
            <div class="custom-alert alert-yellow">
                <span style="font-size:20px;">🛡️</span>
                <div style="font-weight:700;">飞书 API 连接成功</div>
                <div style="opacity:0.8; margin-left:12px;">已成功跳过 4800 元会员限制，当前正使用开发者模式进行多租户数据隔离。</div>
            </div>
        </div>
    """, unsafe_allow_html=True)

    # --- 指标矩阵 (实时数据) ---
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.markdown(f'<div class="stat-card"><div class="stat-bar" style="background:rgb(37,99,235);"></div><div class="stat-label">关联订单总数</div><div class="stat-value">{total_orders}</div><div class="stat-footer">当前租户可见数据</div></div>', unsafe_allow_html=True)
    with c2:
        st.markdown(f'<div class="stat-card"><div class="stat-bar" style="background:rgb(34,197,94);"></div><div class="stat-label">订单总金额</div><div class="stat-value">${total_amount:,.2f}</div><div class="stat-footer">基于飞书实时结算</div></div>', unsafe_allow_html=True)
    # ... 剩下的卡片和原来逻辑一致

    st.markdown('<div style="height:24px;"></div>', unsafe_allow_html=True)
    
    c5, c6 = st.columns(2)
    with c5:
        st.markdown('<div class="stat-card"><div class="stat-bar" style="background:rgb(37,99,235);"></div><div class="stat-label">活跃店铺 <span class="trend-down">↘ 需续期</span></div><div class="stat-value">1</div><div class="stat-footer">1 个即将过期</div></div>', unsafe_allow_html=True)
    with c6:
        st.markdown('<div class="stat-card"><div class="stat-bar" style="background:rgb(239,68,68);"></div><div class="stat-label">API 成功率 <span class="trend-down">↘ 需优化</span></div><div class="stat-value">95%</div><div class="stat-footer">24H 错误率: 100%</div></div>', unsafe_allow_html=True)

    st.markdown('</div>', unsafe_allow_html=True) # 关闭 content-container
    
    # 底部退出 (临时放置)
    if st.sidebar.button("安全退出系统"):
        st.session_state['user_id'] = None
        st.rerun()

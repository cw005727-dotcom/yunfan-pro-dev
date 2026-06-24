import { useState, useEffect, useRef } from "react";
import Icon from "./Icon";
import { useAppContext } from "../context/AppContext";

export default function TopMonitoringBar({ user, pageTitle }) {
  const { setUser } = useAppContext();
  const [todayStats, setTodayStats] = useState(null);
  const [topStats, setTopStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [now, setNow] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const owner = user?.username || "";
    const loadStats = () => {
      fetch("/api/operational/stats?owner=" + encodeURIComponent(owner))
        .then(r => r.json())
        .then(d => setTodayStats(d))
        .catch(() => {});
    };
    const loadTopStats = () => {
      fetch("/api/top-stats/today")
        .then(r => r.json())
        .then(d => setTopStats(d))
        .catch(() => {});
    };
    const loadNotifs = () => {
      fetch("/api/notifications/realtime?owner=" + encodeURIComponent(owner))
        .then(r => r.json())
        .then(d => setNotifications(Array.isArray(d) ? d : []))
        .catch(() => {});
    };
    loadStats(); loadTopStats(); loadNotifs();
    const si = setInterval(loadStats, 30000);
    const ti2 = setInterval(loadTopStats, 60000);
    const ni = setInterval(loadNotifs, 10000);
    const ti = setInterval(() => setNow(new Date()), 10000);
    return () => { clearInterval(si); clearInterval(ti2); clearInterval(ni); clearInterval(ti); };
  }, [user]);

  // 点外面关闭下拉
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const todayOrders = topStats?.order_count ?? 0;
  const todayGmv = topStats?.gmv_usd ?? 0;
  const username = (user?.username || "访客").split("@")[0];
  // 顶栏只滚动「订单」类型通知（订单=GMV 故事）
  const latestNotif = notifications.find(n =>
    n.topic === 'marketplace_orders' || n.topic === 'orders_v2'
  ) || null;
  // 通知类型映射（前端显示用）
  const NOTIF_TYPE_LABEL = {
    marketplace_orders: '订单',
    orders_v2: '订单',
    marketplace_shipments: '物流',
    shipments: '物流',
    marketplace_claims: '索赔',
    claims: '索赔',
    marketplace_messages: '消息',
    messages: '消息',
  };
  const timeStr = now.toLocaleTimeString("en-US", { hour12: false });
  const dateStr = now.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout?username=" + encodeURIComponent(user?.username || ""));
    } catch (e) { /* 后端登出是 noop，无所谓 */ }
    setUser(null); // AppContext 自动清 localStorage 并跳回登录页
  };

  const scrollKeyframes = "@keyframes tbScroll{0%,75%{transform:translateY(0);opacity:1}85%{transform:translateY(-18px);opacity:0}100%{transform:translateY(0);opacity:1}}.tbScroll{animation:tbScroll 8s ease-in-out infinite}";

  return (
    <div>
      <style>{scrollKeyframes}</style>
      <div className="flex items-center px-5 gap-4 shrink-0 relative z-[200]"
        style={{ height: 60, background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(o => !o)}
            className="flex items-center gap-3 shrink-0 px-2 py-1 rounded-lg transition-colors"
            style={{ background: menuOpen ? "rgba(255,255,255,0.08)" : "transparent" }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
              <Icon name="zap" className="text-white" size={14} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[13px] font-bold text-slate-300 leading-none">
                {username} &middot; 预祝爆单 🎉
              </span>
            </div>
            <Icon name="chevron-down" size={12} className="text-slate-500" />
          </button>

          {menuOpen && (
            <div
              className="absolute top-full left-0 mt-2 w-64 rounded-xl shadow-2xl overflow-hidden"
              style={{
                background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
                border: "1px solid rgba(148,163,184,0.15)",
                boxShadow: "0 20px 50px -10px rgba(0,0,0,0.6)",
                zIndex: 300,
              }}
            >
              <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(148,163,184,0.1)" }}>
                <div className="text-[14px] font-black text-white truncate">{user?.username || "访客"}</div>
                <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                  角色：{user?.role || "—"}
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors"
                style={{ color: "#fca5a5" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <Icon name="log-out" size={14} />
                <span className="text-[13px] font-bold">退出登录</span>
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-8 shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />

        <div className="flex items-center gap-4 px-5 py-2 rounded-lg shrink-0"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Icon name="shopping-cart" size={14} className="text-emerald-400" />
            <span className="text-[11px] font-bold text-slate-400">今日订单</span>
            <span className="text-[18px] font-black text-white">{todayOrders}</span>
          </div>
          <div className="w-px h-5" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Icon name="dollar-sign" size={14} className="text-emerald-400" />
            <span className="text-[11px] font-bold text-slate-400">GMV</span>
            <span className="text-[18px] font-black text-white">${todayGmv.toFixed(2)}</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg max-w-[400px]"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="relative">
            <Icon name="bell" size={12} className="text-emerald-400" />
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping opacity-50" />
          </div>
          <div className="overflow-hidden" style={{ height: 16 }}>
            <div className="tbScroll">
              {latestNotif ? (
                <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap block">
                  [{NOTIF_TYPE_LABEL[latestNotif.topic] || '通知'}] {latestNotif.content || latestNotif.topic}
                </span>
              ) : (
                <span className="text-[11px] font-medium text-slate-600 whitespace-nowrap block">监听中...</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1" />

        <div className="text-right shrink-0">
          <div className="text-[14px] font-black text-slate-300 leading-none tabular-nums">{timeStr}</div>
          <div className="text-[8px] font-bold text-slate-600 uppercase mt-1 tracking-[1px]">{dateStr}</div>
        </div>
      </div>
    </div>
  );
}

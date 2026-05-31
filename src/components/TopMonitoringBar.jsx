import { useState, useEffect } from "react";
import Icon from "./Icon";

export default function TopMonitoringBar({ user, pageTitle }) {
  const [todayStats, setTodayStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const owner = user?.username || "";
    const loadStats = () => {
      fetch("/api/operational/stats?owner=" + encodeURIComponent(owner))
        .then(r => r.json())
        .then(d => setTodayStats(d))
        .catch(() => {});
    };
    const loadNotifs = () => {
      fetch("/api/notifications/realtime?owner=" + encodeURIComponent(owner))
        .then(r => r.json())
        .then(d => setNotifications(Array.isArray(d) ? d : []))
        .catch(() => {});
    };
    loadStats(); loadNotifs();
    const si = setInterval(loadStats, 30000);
    const ni = setInterval(loadNotifs, 10000);
    const ti = setInterval(() => setNow(new Date()), 10000);
    return () => { clearInterval(si); clearInterval(ni); clearInterval(ti); };
  }, [user]);

  const todayOrders = todayStats?.today_orders || 0;
  const todayGmv = todayStats?.today_gmv || 0;
  const username = (user?.username || "\u8bbf\u5ba2").split("@")[0];
  const latestNotif = notifications.length > 0 ? notifications[0] : null;
  const timeStr = now.toLocaleTimeString("en-US", { hour12: false });
  const dateStr = now.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });

  const scrollKeyframes = "@keyframes tbScroll{0%,75%{transform:translateY(0);opacity:1}85%{transform:translateY(-18px);opacity:0}100%{transform:translateY(0);opacity:1}}.tbScroll{animation:tbScroll 8s ease-in-out infinite}";

  return (
    <div>
      <style>{scrollKeyframes}</style>
      <div className="flex items-center px-5 gap-4 shrink-0 relative z-[200]"
        style={{ height: 60, background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>

        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
            <Icon name="zap" className="text-white" size={14} />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-slate-300 leading-none">
              {username} &middot; \u9884\u795d\u7206\u5355 \ud83c\udf89
            </span>
          </div>
        </div>

        <div className="w-px h-8 shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />

        <div className="flex items-center gap-4 px-5 py-2 rounded-lg shrink-0"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Icon name="shopping-cart" size={14} className="text-emerald-400" />
            <span className="text-[11px] font-bold text-slate-400">\u4eca\u65e5\u8ba2\u5355</span>
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
                <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap block">{latestNotif.content || latestNotif.topic}</span>
              ) : (
                <span className="text-[11px] font-medium text-slate-600 whitespace-nowrap block">\u76d1\u542c\u4e2d...</span>
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

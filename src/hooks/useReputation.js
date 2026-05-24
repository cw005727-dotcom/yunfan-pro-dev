import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE } from '../api/client';

/**
 * 店铺声誉获取钩子
 * @param {string|null} group - group_label 过滤
 */
export const useReputation = (group = null) => {
  const [reputation, setReputation] = useState([]);
  const [dailyAlerts, setDailyAlerts] = useState({ complaints: '00', violations: '00', messages: '00' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  // syncStatus: 'idle' | 'syncing' | 'fetching' | 'done'
  // done 会在 2 秒后变回 'idle'，让 UI 有个短暂确认
  const [syncStatus, setSyncStatus] = useState('idle');
  const abortRef = useRef(null);

  const fetchData = useCallback(async (fromRefresh = false) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (fromRefresh) {
        setSyncStatus('fetching');
      }
      const repParams = group ? `?group=${encodeURIComponent(group)}` : '';
      const [repRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/shop_reputation${repParams}`, { signal: controller.signal }),
        fetch(`${API_BASE}/stats${repParams}`, { signal: controller.signal })
      ]);

      if (!repRes.ok) throw new Error('Failed to fetch reputation');

      const repData = await repRes.json();
      if (!controller.signal.aborted) {
        setReputation(Array.isArray(repData) ? repData : []);
        setLastUpdated(new Date());
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        const d = statsData.daily_alerts || {};
        if (!controller.signal.aborted) {
          setDailyAlerts({
            complaints: String(d.complaints ?? statsData.alerts ?? 0).padStart(2, '0'),
            violations: String(d.violations ?? 0).padStart(2, '0'),
            messages: String(d.messages ?? 0).padStart(2, '0'),
          });
        }
      }

      if (!controller.signal.aborted) {
        setError(null);
      }
    } catch (err) {
      if (err.name !== 'AbortError' && !controller.signal.aborted) {
        setError(err.message);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        if (fromRefresh) {
          setSyncStatus('done');
          setTimeout(() => setSyncStatus('idle'), 2000);
        }
      }
    }
  }, [group]);

  // 强制刷新：先调后端同步脚本，再重新拉数据
  const refresh = useCallback(async () => {
    setLoading(true);
    setSyncStatus('syncing');
    try {
      await fetch(`${API_BASE}/shop_reputation/refresh`, { method: 'POST' });
    } catch (e) {
      // 即使同步请求失败，也继续拉最新数据
    }
    await fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(false), 30000);
    return () => {
      clearInterval(interval);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchData]);

  return { reputation, dailyAlerts, loading, error, refresh, lastUpdated, syncStatus };
};

import { useState, useEffect, useCallback } from 'react';
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const repParams = group ? `?group=${encodeURIComponent(group)}` : '';
      const statsParams = group ? `?group=${encodeURIComponent(group)}` : '';
      const [repRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/shop_reputation${repParams}`),
        fetch(`${API_BASE}/stats${statsParams}`)
      ]);
      
      if (!repRes.ok) throw new Error('Failed to fetch reputation');
      
      const repData = await repRes.json();
      setReputation(Array.isArray(repData) ? repData : []);
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        const d = statsData.daily_alerts || {};
        setDailyAlerts({
          complaints: String(d.complaints ?? statsData.alerts ?? 0).padStart(2, '0'),
          violations: String(d.violations ?? 0).padStart(2, '0'),
          messages: String(d.messages ?? 0).padStart(2, '0'),
        });
      }
      
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [group]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { reputation, dailyAlerts, loading, error, refresh: fetchData };
};

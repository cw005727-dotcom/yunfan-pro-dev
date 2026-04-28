import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../api/client';

/**
 * 市场雷达获取钩子 (获取热销商品与趋势)
 * @param {string} site - 站点 ID (MLM, MLB, etc.)
 */
export const useMarketRadar = (site = 'MLM') => {
  const [items, setItems] = useState([]);
  const [trends, setTrends] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRadar = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch both Radar Items and Trends in parallel
      const [radarRes, trendsRes] = await Promise.all([
        fetch(`${API_BASE}/market_radar?site=${site}`),
        fetch(`${API_BASE}/trends?site=${site}`)
      ]);
      
      if (!radarRes.ok) throw new Error('Failed to fetch market radar');
      if (!trendsRes.ok) throw new Error('Failed to fetch trends');
      
      const radarData = await radarRes.json();
      const trendsData = await trendsRes.json();
      
      if (Array.isArray(radarData)) {
        setItems(radarData);
      }
      setTrends(prev => ({ ...prev, [site]: trendsData }));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [site]);

  useEffect(() => {
    fetchRadar();
  }, [fetchRadar]);

  return { items, trends, loading, error, refresh: fetchRadar };
};

/**
 * 爆品诊断 Hook (调用 AI 接口)
 */
export const useListingDoctor = () => {
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const diagnose = async (myItem, compItem) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/listing_doctor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ my_item: myItem, comp_item: compItem })
      });
      if (!response.ok) throw new Error('AI Diagnosis failed');
      const result = await response.json();
      setDiagnosis(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { diagnose, diagnosis, loading, error };
};

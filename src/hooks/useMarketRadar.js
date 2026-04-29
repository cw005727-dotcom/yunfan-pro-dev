import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../api/client';

/**
 * 市场雷达获取钩子 (获取热销商品与趋势)
 * @param {string} site - 站点 ID (MLM, MLB, etc.)
 * @param {string} platform - 平台 ID (mercado_libre, 1688, temu, etc.)
 */
export const useMarketRadar = (site = 'MLM', platform = 'mercado_libre') => {
  const [items, setItems] = useState([]);
  const [trends, setTrends] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [platformReason, setPlatformReason] = useState(null);
  const [platformMessage, setPlatformMessage] = useState(null);

  const fetchRadar = useCallback(async (keyword = null) => {
    try {
      setLoading(true);
      
      let radarUrl = `${API_BASE}/market_radar?site=${site}&platform=${platform}`;
      if (keyword) radarUrl += `&keyword=${encodeURIComponent(keyword)}`;

      // Fetch both Radar Items and Trends in parallel
      const [radarRes, trendsRes] = await Promise.all([
        fetch(radarUrl),
        fetch(`${API_BASE}/trends?site=${site}`)
      ]);
      
      if (!radarRes.ok) throw new Error('Failed to fetch market radar');
      if (!trendsRes.ok) throw new Error('Failed to fetch trends');
      
      const radarData = await radarRes.json();
      const trendsData = await trendsRes.json();
      
      // Handle both array response (normal) and object response (platform_unsupported)
      if (Array.isArray(radarData)) {
        setItems(radarData);
        setPlatformReason(null);
        setPlatformMessage(null);
      } else if (radarData.items !== undefined) {
        setItems(radarData.items || []);
        setPlatformReason(radarData.reason || null);
        setPlatformMessage(radarData.message || null);
      }
      setTrends(prev => ({ ...prev, [site]: trendsData }));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [site, platform]);

  useEffect(() => {
    fetchRadar();
  }, [fetchRadar]);

  return { items, trends, loading, error, platformReason, platformMessage, refresh: fetchRadar };
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

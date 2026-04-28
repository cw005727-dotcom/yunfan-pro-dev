import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../api/client';

/**
 * 关键词情报获取钩子
 * @param {string} site - 站点 ID
 */
export const useKeywords = (site = 'MLM') => {
  const [keywords, setKeywords] = useState({ trending: [], gaps: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchKeywords = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/keyword_intelligence?site=${site}`);
      if (!response.ok) throw new Error('Failed to fetch keywords');
      const data = await response.json();
      setKeywords(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [site]);

  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords]);

  return { ...keywords, loading, error, refresh: fetchKeywords };
};

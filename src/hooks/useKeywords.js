import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE } from '../api/client';

/**
 * 关键词情报获取钩子
 * @param {string} site - 站点 ID
 */
export const useKeywords = (site = 'MLM') => {
  const [keywords, setKeywords] = useState({ trending: [], gaps: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const fetchKeywords = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/keyword_intelligence?site=${site}`, { signal: controller.signal });
      if (controller.signal.aborted) return;
      if (!response.ok) throw new Error('Failed to fetch keywords');
      const data = await response.json();
      if (!controller.signal.aborted) {
        setKeywords(data);
        setError(null);
      }
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [site]);

  useEffect(() => {
    fetchKeywords();
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [fetchKeywords]);

  return { ...keywords, loading, error, refresh: fetchKeywords };
};

import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE } from '../api/client';

/**
 * 商品性能表现获取钩子 (全量商品指标)
 */
export const useProductPerformance = (site = 'all') => {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({ total_exposure: 0, total_clicks: 0, total_carts: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const fetchPerformance = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      const url = site && site !== 'all'
          ? `${API_BASE}/product_metrics?site=${site}`
          : `${API_BASE}/product_metrics`;
      const response = await fetch(url, { signal: controller.signal });
      if (controller.signal.aborted) return;
      if (!response.ok) throw new Error('Failed to fetch product metrics');
      const data = await response.json();
      if (controller.signal.aborted) return;

      if (data && data.items) {
        setProducts(data.items);
        if (data.summary) setSummary(data.summary);
      } else if (Array.isArray(data)) {
        setProducts(data);
      } else if (data && data.error) {
        throw new Error(data.error);
      }
      setError(null);
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [site]);

  useEffect(() => {
    fetchPerformance();
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [fetchPerformance]);

  return { products, summary, loading, error, refresh: fetchPerformance };
};

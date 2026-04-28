import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../api/client';

/**
 * 商品性能表现获取钩子 (全量商品指标)
 */
export const useProductPerformance = (site = 'all') => {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({ total_exposure: 0, total_clicks: 0, total_carts: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPerformance = useCallback(async () => {
    try {
      setLoading(true);
      const url = site && site !== 'all'
          ? `${API_BASE}/product_metrics?site=${site}`
          : `${API_BASE}/product_metrics`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch product metrics');
      const data = await response.json();
      
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [site]);

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  return { products, summary, loading, error, refresh: fetchPerformance };
};

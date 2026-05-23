import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE } from '../api/client';

/**
 * 订单管理 Hook
 * @param {Object} filters - 过滤条件 { site, status, shop }
 */
export const useOrders = (filters = {}) => {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const fetchOrders = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.site) params.append('site', filters.site);
      if (filters.status) params.append('status', filters.status);
      if (filters.shop) params.append('shop', filters.shop);

      const url = `${API_BASE}/orders?${params.toString()}`;
      const response = await fetch(url, { signal: controller.signal });
      if (controller.signal.aborted) return;
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      if (!controller.signal.aborted) {
        setOrders(data.orders || []);
        setSummary(data.summary || null);
        setError(null);
      }
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [filters.site, filters.status, filters.shop]);

  useEffect(() => {
    fetchOrders();
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [fetchOrders]);

  return { orders, summary, loading, error, refresh: fetchOrders };
};

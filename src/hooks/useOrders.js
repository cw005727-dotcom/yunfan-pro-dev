import { useState, useEffect, useCallback } from 'react';
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

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.site) params.append('site', filters.site);
      if (filters.status) params.append('status', filters.status);
      if (filters.shop) params.append('shop', filters.shop);
      
      const url = `${API_BASE}/orders?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters.site, filters.status, filters.shop]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, summary, loading, error, refresh: fetchOrders };
};

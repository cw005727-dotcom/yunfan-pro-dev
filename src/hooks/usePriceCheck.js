import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../api/client';

export const usePriceCheck = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/price_check/list`);
      if (!res.ok) throw new Error('Failed to fetch queue');
      const data = await res.json();
      setQueue(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setQueue([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateProfit = async (params) => {
    try {
      const res = await fetch(`${API_BASE}/price_check/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error('Calculation Error:', errText);
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const deleteItem = async (id) => {
    try {
      await fetch(`${API_BASE}/price_check/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchQueue();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  return { queue, loading, error, calculateProfit, deleteItem, refresh: fetchQueue };
};

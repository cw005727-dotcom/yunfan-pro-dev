import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE } from '../api/client';

export const usePriceCheck = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const fetchQueue = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/price_check/list`, { signal: controller.signal });
      if (controller.signal.aborted) return;
      if (!res.ok) throw new Error('Failed to fetch queue');
      const data = await res.json();
      if (!controller.signal.aborted) setQueue(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name !== 'AbortError') { setError(err.message); setQueue([]); }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  const calculateProfit = async (params) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_BASE}/price_check/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: controller.signal,
      });
      if (controller.signal.aborted) return null;
      if (!res.ok) { const errText = await res.text(); console.error('Calculation Error:', errText); return null; }
      return await res.json();
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err);
      return null;
    }
  };

  const deleteItem = async (id) => {
    if (abortRef.current) abortRef.current.abort();
    try {
      await fetch(`${API_BASE}/price_check/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchQueue();
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err);
    }
  };

  useEffect(() => {
    fetchQueue();
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [fetchQueue]);

  return { queue, loading, error, calculateProfit, deleteItem, refresh: fetchQueue };
};

import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../api/client';

export const useSmartRotation = (site = 'MLM') => {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const fetchRotation = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/smart_rotation?site=${site}`);
      if (!res.ok) throw new Error('Rotation fetch failed');
      const data = await res.json();
      setRecommendation(data);
    } catch (err) {
      console.error(err);
      setRecommendation(null);
    } finally {
      setLoading(false);
    }
  }, [site]);

  const applyRotation = async () => {
    // 适配 has_suggestion 结构
    const data = recommendation?.has_suggestion ? recommendation.suggestion : recommendation;
    if (!data) return;

    try {
      setIsApplying(true);
      const res = await fetch(`${API_BASE}/apply_rotation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          add_id: data.new_item_id,
          remove_id: data.current_item_id
        })
      });
      if (!res.ok) throw new Error('Apply rotation failed');
      await fetchRotation();
      return true;
    } catch (err) {
      alert(`轮替失败: ${err.message}`);
      return false;
    } finally {
      setIsApplying(false);
    }
  };

  useEffect(() => {
    fetchRotation();
  }, [fetchRotation]);

  return { recommendation, loading, isApplying, applyRotation, refresh: fetchRotation };
};

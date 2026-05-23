import { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../api/client';

export const useStatsOverview = () => {
    const [stats, setStats] = useState({
        total_gmv: 0,
        total_orders: 0,
        gmv_trend: 0,
        units_trend: 0,
        expected_payout: 0,
        actual_payout: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const abortRef = useRef(null);

    useEffect(() => {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        fetch(`${API_BASE}/stats_overview`, { signal: controller.signal })
            .then(async res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (controller.signal.aborted) return;
                const m = data.metrics || {};
                setStats({
                    total_gmv: m.total_gmv ?? 0,
                    total_orders: m.total_units ?? 0,
                    gmv_trend: m.gmv_trend ?? 0,
                    units_trend: m.units_trend ?? 0,
                    expected_payout: m.expected_payout ?? 0,
                    actual_payout: m.actual_payout ?? 0
                });
                setIsLoading(false);
            })
            .catch(err => {
                if (err.name !== 'AbortError') console.error("Stats Overview fetch error:", err);
                if (!controller.signal.aborted) setIsLoading(false);
            });

        return () => { if (abortRef.current) abortRef.current.abort(); };
    }, []);

    return { stats, isLoading };
};

import { useState, useEffect } from 'react';
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

    useEffect(() => {
        fetch(`${API_BASE}/stats_overview`)
            .then(res => res.json())
            .then(data => {
                setStats({
                    total_gmv: data.metrics.total_gmv,
                    total_orders: data.metrics.total_units,
                    gmv_trend: data.metrics.gmv_trend,
                    units_trend: data.metrics.units_trend,
                    expected_payout: data.metrics.expected_payout,
                    actual_payout: data.metrics.actual_payout
                });
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Stats Overview fetch error:", err);
                setIsLoading(false);
            });
    }, []);

    return { stats, isLoading };
};

import { useState, useEffect } from 'react';
import { API_BASE } from '../api/client';

export const useMonitoringLogs = (limit = 20) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            const resp = await fetch(`${API_BASE}/monitoring_logs?limit=${limit}`);
            const data = await resp.json();
            setLogs(data);
        } catch (err) {
            console.error("Failed to fetch monitoring logs:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const timer = setInterval(fetchLogs, 60000); // Refresh every minute
        return () => clearInterval(timer);
    }, [limit]);

    return { logs, loading, refetch: fetchLogs };
};

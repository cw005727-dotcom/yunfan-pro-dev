import { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../api/client';

export const useMonitoringLogs = (limit = 20) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const abortRef = useRef(null);

    const fetchLogs = async () => {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const resp = await fetch(`${API_BASE}/monitoring_logs?limit=${limit}`, { signal: controller.signal });
            const data = await resp.json();
            if (!controller.signal.aborted) setLogs(data);
        } catch (err) {
            if (err.name !== 'AbortError') console.error("Failed to fetch monitoring logs:", err);
        } finally {
            if (!controller.signal.aborted) setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const timer = setInterval(fetchLogs, 120000); // 从60秒降到120秒
        return () => {
            clearInterval(timer);
            if (abortRef.current) abortRef.current.abort();
        };
    }, [limit]);

    return { logs, loading, refetch: fetchLogs };
};

import { useState, useCallback, useEffect } from 'react';
import { alertApi } from '../api/alertApi.js';

export function useAlerts(coords) {
    const [alerts, setAlerts] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchAlerts = useCallback(async () => {
        try {
            const params = coords ? { lat: coords.lat, lng: coords.lng, radius: 5 } : {};
            const { data } = await alertApi.getAlerts(params);
            setAlerts(data.data);
            setUnreadCount(data.data.length);
        } catch (_) { }
    }, [coords]);

    useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

    const markAllRead = useCallback(() => setUnreadCount(0), []);

    return { alerts, unreadCount, markAllRead, fetchAlerts };
}

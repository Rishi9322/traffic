import { useState, useEffect } from 'react';

export function useGeolocation() {
    const [coords, setCoords] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported');
            setLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    return { coords, error, loading };
}

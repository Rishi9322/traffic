import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '../api/authApi.js';

const AuthContext = createContext(null);

// Module-level flag: prevents double-fire in React StrictMode / Vite HMR
let _refreshAttempted = false;

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const isMounted = useRef(false);

    // On mount: try to silently refresh the session (runs only once ever)
    useEffect(() => {
        // Prevent double-invoke in React StrictMode
        if (_refreshAttempted) {
            setLoading(false);
            return;
        }
        _refreshAttempted = true;

        (async () => {
            try {
                const { data } = await authApi.refresh();
                globalThis.__OSTAS_ACCESS_TOKEN__ = data.accessToken;
                const meRes = await authApi.getMe();
                setUser(meRes.data.user);
            } catch (_) {
                // No valid session — stay logged out
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const login = useCallback(async (email, password) => {
        const { data } = await authApi.login({ email, password });
        globalThis.__OSTAS_ACCESS_TOKEN__ = data.accessToken;
        setUser(data.user);
        return data.user;
    }, []);

    const register = useCallback(async (payload) => {
        const { data } = await authApi.register(payload);
        globalThis.__OSTAS_ACCESS_TOKEN__ = data.accessToken;
        setUser(data.user);
        return data.user;
    }, []);

    const logout = useCallback(async () => {
        try { await authApi.logout(); } catch (_) { }
        globalThis.__OSTAS_ACCESS_TOKEN__ = null;
        _refreshAttempted = false; // allow fresh check after logout
        setUser(null);
    }, []);

    const updateUser = useCallback((updates) => {
        setUser((prev) => ({ ...prev, ...updates }));
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuthContext = () => useContext(AuthContext);

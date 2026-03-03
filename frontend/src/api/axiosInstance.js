import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // send httpOnly cookies
});

// ── Request interceptor: attach access token ──────────────────────────────────
axiosInstance.interceptors.request.use((config) => {
    const token = globalThis.__OSTAS_ACCESS_TOKEN__;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ── Response interceptor: auto-refresh on 401 ────────────────────────────────
let isRefreshing = false;
let pendingQueue = [];

function resolveQueue(token) {
    pendingQueue.forEach((cb) => cb(token));
    pendingQueue = [];
}

function isRefreshEndpoint(config) {
    // Detect if the failing request IS the refresh endpoint itself
    const url = config?.url || '';
    return url.includes('/auth/refresh');
}

axiosInstance.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;

        // ⚠️ Do NOT retry if:
        //    - Status is NOT 401
        //    - Already retried (_retry flag)
        //    - The failing request IS the refresh endpoint (would cause infinite loop)
        if (
            error.response?.status !== 401 ||
            original._retry ||
            isRefreshEndpoint(original)
        ) {
            return Promise.reject(error);
        }

        // Only auto-redirect to login if user WAS logged in
        // (had an access token). If they never logged in, just reject silently.
        if (!globalThis.__OSTAS_ACCESS_TOKEN__) {
            return Promise.reject(error);
        }

        original._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                pendingQueue.push((token) => {
                    if (token) {
                        original.headers.Authorization = `Bearer ${token}`;
                        resolve(axiosInstance(original));
                    } else {
                        reject(error);
                    }
                });
            });
        }

        isRefreshing = true;
        try {
            // Use plain axios to avoid the interceptor catching this call too
            const { data } = await axios.post(
                `${BASE_URL}/auth/refresh`,
                {},
                { withCredentials: true }
            );
            const newToken = data.accessToken;
            globalThis.__OSTAS_ACCESS_TOKEN__ = newToken;
            resolveQueue(newToken);
            original.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(original);
        } catch (_) {
            // Refresh failed → clear token and redirect to login
            globalThis.__OSTAS_ACCESS_TOKEN__ = null;
            resolveQueue(null);
            window.location.href = '/login';
            return Promise.reject(error);
        } finally {
            isRefreshing = false;
        }
    }
);

export default axiosInstance;

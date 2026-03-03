import api from './axiosInstance.js';

export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    refresh: () => api.post('/auth/refresh'),
    getMe: () => api.get('/auth/me'),
    updateMe: (data) => api.patch('/auth/me', data),
    changePassword: (data) => api.patch('/auth/me/password', data),
};

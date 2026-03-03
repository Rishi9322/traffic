import api from './axiosInstance.js';
export const alertApi = {
    getAlerts: (params) => api.get('/alerts', { params }),
};

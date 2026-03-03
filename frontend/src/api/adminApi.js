import api from './axiosInstance.js';

export const adminApi = {
    getStats: () => api.get('/admin/stats'),
    getReports: (params) => api.get('/admin/reports', { params }),
    deleteReport: (id) => api.delete(`/admin/reports/${id}`),
    flagReport: (id) => api.patch(`/admin/reports/${id}/flag`),
    resolveReport: (id) => api.patch(`/admin/reports/${id}/resolve`),
    getUsers: (params) => api.get('/admin/users', { params }),
    banUser: (id) => api.patch(`/admin/users/${id}/ban`),
    promoteUser: (id) => api.patch(`/admin/users/${id}/promote`),
    getLogs: (params) => api.get('/admin/logs', { params }),
    getFeedback: () => api.get('/admin/feedback'),
    markFeedbackRead: (id) => api.patch(`/admin/feedback/${id}/read`),
};

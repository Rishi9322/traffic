import api from './axiosInstance.js';

export const reportApi = {
    getReports: (params) => api.get('/reports', { params }),
    getReport: (id) => api.get(`/reports/${id}`),
    createReport: (data) => api.post('/reports', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    updateReport: (id, data) => api.patch(`/reports/${id}`, data),
    deleteReport: (id) => api.delete(`/reports/${id}`),
    resolveReport: (id) => api.patch(`/reports/${id}/resolve`),
    toggleUpvote: (id) => api.post(`/reports/${id}/upvote`),
};

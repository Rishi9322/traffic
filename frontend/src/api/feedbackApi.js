import api from './axiosInstance.js';
export const feedbackApi = {
    submitFeedback: (data) => api.post('/feedback', data),
};

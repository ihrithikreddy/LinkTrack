import api from './api';

export const analyticsService = {
  async getUrlAnalytics(id) {
    const response = await api.get(`/api/urls/${id}/analytics`);
    return response.data;
  },
};

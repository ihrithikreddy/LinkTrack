import api from './api';

export const dashboardService = {
  async getDashboard() {
    const response = await api.get('/api/dashboard');
    return response.data;
  },
};

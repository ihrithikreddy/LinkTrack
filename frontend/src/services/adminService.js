import api from './api';

export const adminService = {
  async getStatistics() {
    const response = await api.get('/api/admin/statistics');
    return response.data;
  },

  async getUsers({ page = 0, size = 10 } = {}) {
    const response = await api.get('/api/admin/users', { params: { page, size } });
    return response.data;
  },

  async getAllUrls({ page = 0, size = 10 } = {}) {
    const response = await api.get('/api/admin/urls', { params: { page, size } });
    return response.data;
  },

  async updateUrlStatus(id, active) {
    const response = await api.patch(`/api/admin/urls/${id}/status`, null, {
      params: { active },
    });
    return response.data;
  },
};

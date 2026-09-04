import api from './api';

export const urlService = {
  async createUrl(data) {
    const response = await api.post('/api/urls', data);
    return response.data;
  },

  async getUrls({ page = 0, size = 10, search = '', status = '', sortBy = 'createdAt', sortDir = 'desc' } = {}) {
    const params = { page, size, sortBy, sortDir };
    if (search) params.search = search;
    if (status && status !== 'ALL') params.status = status;

    const response = await api.get('/api/urls', { params });
    return response.data;
  },

  async getUrlById(id) {
    const response = await api.get(`/api/urls/${id}`);
    return response.data;
  },

  async updateUrl(id, data) {
    const response = await api.put(`/api/urls/${id}`, data);
    return response.data;
  },

  async deleteUrl(id) {
    const response = await api.delete(`/api/urls/${id}`);
    return response.data;
  },
};

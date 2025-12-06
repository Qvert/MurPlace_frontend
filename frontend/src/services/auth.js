import api from './api';

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/api/login/', {
        email,
        password
      });

      if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async logout() {
    try {
      await api.post('/api/logout/');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers.common['Authorization'];
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/api/profile/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
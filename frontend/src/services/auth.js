import api from './api';

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/api/login/', {
        email,
        password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
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
      localStorage.removeItem('token');
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
  },

  async updateProfile(data) {
    try {
      const response = await api.patch('/api/profile/', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
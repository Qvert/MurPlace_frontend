import axios from 'axios';

// Создаем базовый экземпляр axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Для отправки куков/сессий
});

// Интерцептор для запросов
api.interceptors.request.use(
  (config) => {
    // Можно добавить токен авторизации
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для ответов
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt token refresh if there's a token to refresh
    if (error.response?.status === 401 && !originalRequest._retry && localStorage.getItem('refresh_token')) {
      originalRequest._retry = true;

      try {
        // Попытка обновить токен
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/token/refresh/`,
          { refresh: refreshToken }
        );

        localStorage.setItem('access_token', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Перенаправляем на логин
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Обработка других ошибок
    if (error.response?.status === 404) {
      console.error('Ресурс не найден');
    }

    return Promise.reject(error);
  }
);

export default api;
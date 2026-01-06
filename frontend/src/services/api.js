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
    // Добавить токен авторизации
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Добавить язык (если выбран пользователем)
    const lang = localStorage.getItem('lang');
    if (lang) {
      config.headers['X-Lang'] = lang;
      // Установим Accept-Language для совместимости с некоторыми бэкендами
      config.headers['Accept-Language'] = lang === 'ru' ? 'ru' : 'en';
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

    // If unauthorized, redirect to login
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Обработка других ошибок
    if (error.response?.status === 404) {
      console.error('Ресурс не найден');
    }

    return Promise.reject(error);
  }
);

export default api;
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

    // Для Django CSRF токена (если используете)
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
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

    if (error.response?.status === 401 && !originalRequest._retry) {
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

// Вспомогательная функция для получения кук
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export default api;
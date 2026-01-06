import api from './api';

// Enable front-end mock auth for local testing using Vite env var:
// VITE_USE_MOCK_AUTH=true
const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === 'true'

const _getMockStore = () => JSON.parse(localStorage.getItem('mock_confirmation_codes') || '{}')
const _saveMockStore = (s) => localStorage.setItem('mock_confirmation_codes', JSON.stringify(s))
const _setMockCode = (email) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const store = _getMockStore()
  store[email] = code
  _saveMockStore(store)
  return code
}
const _getMockCode = (email) => _getMockStore()[email]

export const authService = {
  async login(email, password) {
    if (USE_MOCK) {
      // In mock mode accept any password and return a token
      const token = `mock-token-${Date.now()}`
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      return { token }
    }

    try {
      const response = await api.post('/api/login/', { email, password })

      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      }

      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  async logout() {
    try {
      await api.post('/api/logout/')
    } finally {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    }
  },

  async getCurrentUser() {
    if (USE_MOCK) {
      return { email: 'dev@example.com', username: 'dev_user', first_name: 'Dev' }
    }
    try {
      const response = await api.get('/api/profile/')
      return response.data
    } catch (error) {
      throw error
    }
  },

  async updateProfile(data) {
    try {
      const response = await api.patch('/api/profile/', data)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  async signup(data) {
    if (USE_MOCK) {
      // Generate and store a mock confirmation code for the email
      const code = _setMockCode(data.email)
      return { message: 'Confirmation required. Check your inbox for the code.', mockCode: code }
    }

    try {
      const response = await api.post('/api/signup/', data)

      // If backend returns a token (signup also logs user in), persist it
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token)
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      }

      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  async confirmEmail({ token, email }) {
    if (USE_MOCK) {
      const expected = _getMockCode(email)
      if (!expected) {
        throw { message: 'No confirmation code found for this email. Please request a confirmation email.' }
      }
      if (String(token) !== String(expected)) {
        throw { message: 'Invalid confirmation code' }
      }

      // On success persist a mock auth token
      const tokenStr = `mock-token-${Date.now()}`
      localStorage.setItem('token', tokenStr)
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenStr}`
      return { message: 'Email confirmed', token: tokenStr }
    }

    try {
      const response = await api.post('/api/confirm/', { token, email })

      // Persist token if backend returned one after confirmation
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token)
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      }

      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  async resendConfirmation(email) {
    if (USE_MOCK) {
      const code = _setMockCode(email)
      return { message: 'Confirmation email resent', mockCode: code }
    }

    try {
      const response = await api.post('/api/resend-confirmation/', { email })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
};
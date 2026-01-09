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
      // In mock mode accept any password and return JWT-like tokens
      const accessToken = `mock-access-${Date.now()}`
      const refreshToken = `mock-refresh-${Date.now()}`
      localStorage.setItem('token', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      return { access: accessToken, refresh: refreshToken }
    }

    try {
      const response = await api.post('/api/login/', { email, password })

      // Handle JWT tokens (access + refresh)
      if (response.data.access) {
        localStorage.setItem('token', response.data.access)
        localStorage.setItem('refreshToken', response.data.refresh)
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`
      } else if (response.data.token) {
        // Fallback for old token system
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
      localStorage.removeItem('refreshToken')
      delete api.defaults.headers.common['Authorization']
    }
  },

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    if (USE_MOCK) {
      // In mock mode, generate a new access token
      const accessToken = `mock-access-${Date.now()}`
      localStorage.setItem('token', accessToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      return accessToken
    }

    try {
      const response = await api.post('/api/token/refresh/', { refresh: refreshToken })
      
      if (response.data.access) {
        localStorage.setItem('token', response.data.access)
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`
        return response.data.access
      }
      
      throw new Error('No access token in refresh response')
    } catch (error) {
      // If refresh fails, clear tokens and force re-login
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      delete api.defaults.headers.common['Authorization']
      throw error
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

      // Handle JWT tokens (access + refresh)
      if (response.data?.access) {
        localStorage.setItem('token', response.data.access)
        localStorage.setItem('refreshToken', response.data.refresh)
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`
      } else if (response.data?.token) {
        // Fallback for old token system
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

      // On success persist mock JWT tokens
      const accessToken = `mock-access-${Date.now()}`
      const refreshToken = `mock-refresh-${Date.now()}`
      localStorage.setItem('token', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      return { message: 'Email confirmed', access: accessToken, refresh: refreshToken }
    }

    try {
      const response = await api.post('/api/email/verify/', { token, email })

      // Handle JWT tokens (access + refresh)
      if (response.data?.access) {
        localStorage.setItem('token', response.data.access)
        localStorage.setItem('refreshToken', response.data.refresh)
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`
      } else if (response.data?.token) {
        // Fallback for old token system
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
      const response = await api.post('/api/email/request-verification/', { email })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  async checkEmailVerificationStatus() {
    if (USE_MOCK) {
      return { verified: true }
    }

    try {
      const response = await api.get('/api/email/verification-status/')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
};
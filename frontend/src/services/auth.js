import api from './api';
import { AUTH_CHANGED_EVENT } from '../constants/authEvents'

// Enable front-end mock auth for local testing using Vite env var:
// VITE_USE_MOCK_AUTH=true
const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === 'true'
const PASSWORD_RESET_ENDPOINTS = [
  '/api/password/reset/',
  '/api/password-reset/',
  '/api/auth/password/reset/',
  '/api/password-reset-request/'
]

const _getMockStore = () => JSON.parse(localStorage.getItem('mock_confirmation_codes') || '{}')
const _saveMockStore = (s) => localStorage.setItem('mock_confirmation_codes', JSON.stringify(s))
const notifyAuthChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
  }
}
const setAuthTokens = (accessToken, refreshToken) => {
  localStorage.setItem('token', accessToken)
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken)
  } else {
    localStorage.removeItem('refreshToken')
  }
  api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
  notifyAuthChanged()
}
const clearAuthTokens = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  delete api.defaults.headers.common['Authorization']
  notifyAuthChanged()
}
const _setMockCode = (email) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const store = _getMockStore()
  store[email] = code
  _saveMockStore(store)
  return code
}
const _getMockCode = (email) => _getMockStore()[email]

export const authService = {
    async getTelegramLink() {
      try {
        // Этот эндпоинт мы описывали в Django views (generate_telegram_link)
        const response = await api.get('/api/telegram/generate-link/')
        return response.data // ожидаем { link: "https://t.me/..." }
      } catch (error) {
        throw error.response?.data || error
      }
    },
  async login(loginId, password) {
    if (USE_MOCK) {
      // In mock mode accept any password and return JWT-like tokens
      const accessToken = `mock-access-${Date.now()}`
      const refreshToken = `mock-refresh-${Date.now()}`
      setAuthTokens(accessToken, refreshToken)
      return { access: accessToken, refresh: refreshToken }
    }

    try {
      const response = await api.post('/api/login/', {
        email: loginId,
        username: loginId,
        password
      })

      // Handle JWT tokens (access + refresh)
      if (response.data.access) {
        setAuthTokens(response.data.access, response.data.refresh)
      } else if (response.data.token) {
        // Fallback for old token system
        setAuthTokens(response.data.token)
      }

      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  async requestPasswordReset(email) {
    if (USE_MOCK) {
      const code = _setMockCode(`reset:${email}`)
      return { message: 'Password reset email sent', mockCode: code }
    }

    let lastError = null

    for (const endpoint of PASSWORD_RESET_ENDPOINTS) {
      try {
        const response = await api.post(endpoint, { email })
        return response.data
      } catch (error) {
        lastError = error.response?.data || error

        const status = error.response?.status
        if (status !== 404 && status !== 405) {
          throw lastError
        }
      }
    }

    throw lastError || new Error('Password reset request failed')
  },

  async logout() {
    try {
      await api.post('/api/logout/')
    } finally {
      clearAuthTokens()
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
      setAuthTokens(accessToken)
      return accessToken
    }

    try {
      const response = await api.post('/api/token/refresh/', { refresh: refreshToken })
      
      if (response.data.access) {
        setAuthTokens(response.data.access, localStorage.getItem('refreshToken'))
        return response.data.access
      }
      
      throw new Error('No access token in refresh response')
    } catch (error) {
      // If refresh fails, clear tokens and force re-login
      clearAuthTokens()
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
        setAuthTokens(response.data.access, response.data.refresh)
      } else if (response.data?.token) {
        // Fallback for old token system
        setAuthTokens(response.data.token)
      }

      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  async confirmEmail({ email }) {
    if (USE_MOCK) {
      // In mock mode, just check if verification is done
      const verified = _getMockCode(email) !== undefined
      if (verified) {
        const accessToken = `mock-access-${Date.now()}`
        const refreshToken = `mock-refresh-${Date.now()}`
        setAuthTokens(accessToken, refreshToken)
        return { verified: true, access: accessToken, refresh: refreshToken }
      }
      return { verified: false }
    }

    try {
      const response = await api.get('/api/email/verification-status/')

      // If email is verified, handle JWT tokens
      if (response.data?.verified) {
        if (response.data?.access) {
          setAuthTokens(response.data.access, response.data.refresh)
        } else if (response.data?.token) {
          setAuthTokens(response.data.token)
        }
      }

      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  async resendConfirmation(email) {
    if (USE_MOCK) {
      const code = _setMockCode(email)
      console.log('Mock: Resending confirmation to', email, 'Code:', code)
      return { message: 'Confirmation email resent', mockCode: code }
    }

    try {
      console.log('Sending email verification request to /api/email/request-verification/', { email })
      const response = await api.post('/api/email/request-verification/', { email })
      console.log('Email verification request response:', response.data)
      return response.data
    } catch (error) {
      console.error('Email verification request failed:', error)
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
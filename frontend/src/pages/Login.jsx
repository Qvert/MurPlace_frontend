import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { postJSON } from '../utils/api'
import { useLang } from '../i18n.jsx'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { t } = useLang()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const data = await postJSON('/api/login/', { username, password })
      // Handle JWT tokens (access + refresh)
      if (data.access) {
        localStorage.setItem('token', data.access)
        localStorage.setItem('refreshToken', data.refresh)
        window.dispatchEvent(new Event('storage'))
        navigate('/account')
      } else if (data.token) {
        // Fallback for old token system
        localStorage.setItem('token', data.token)
        window.dispatchEvent(new Event('storage'))
        navigate('/account')
      } else if (data.success) {
        navigate('/')
      } else {
        setError(data.error || t('login.failed'))
      }
    } catch (err) {
      setError(t('login.network_error'))
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-indigo-600 p-6 text-center">
          <h2 className="text-2xl font-bold text-white">{t('login.title')}</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">{t('login.username')}</label>
              <input className="w-full py-3 px-4 border rounded-lg" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">{t('login.password')}</label>
              <input type="password" className="w-full py-3 px-4 border rounded-lg" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg">{t('login.sign_in')}</button>
          </form>
        </div>
      </div>
    </div>
  )
}

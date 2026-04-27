import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../services/auth'
import { useLang } from '../i18n.jsx'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { t } = useLang()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setMessage('')
    setLoading(true)

    try {
      const data = await authService.requestPasswordReset(email)
      setMessage(data?.message || t('reset_password.success'))
      if (data?.mockCode) {
        setMessage(`${data?.message || t('reset_password.success')} ${t('reset_password.dev_code_display', { code: data.mockCode })}`)
      }
    } catch (err) {
      setError(err?.message || t('reset_password.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-indigo-600 p-6 text-center">
          <h2 className="text-2xl font-bold text-white">{t('reset_password.title')}</h2>
        </div>
        <div className="p-6">
          <p className="mb-4 text-gray-600">{t('reset_password.instructions')}</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">{t('reset_password.email_label')}</label>
              <input
                type="email"
                autoComplete="email"
                className="w-full py-3 px-4 border rounded-lg"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}
            {message && <div className="text-green-600 mb-4">{message}</div>}

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-lg disabled:opacity-50">
              {loading ? t('reset_password.processing') : t('reset_password.submit')}
            </button>

            <div className="mt-4 text-center">
              <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                {t('reset_password.back_to_login')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

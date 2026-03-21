import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth'
import { useLang } from '../i18n.jsx'

export default function Account() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { t, setLang } = useLang()

  useEffect(() => {
    let mounted = true

    async function loadUser() {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      try {
        const userData = await authService.getCurrentUser()
        if (mounted) setUser(userData)
      } catch (err) {
        if (mounted) {
          setError(t('account.load_error'))
          // If unauthorized, redirect to login
          if (err.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            navigate('/login')
          }
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadUser()
    return () => { mounted = false }
  }, [navigate])

  async function handleLogout() {
    try {
      await authService.logout()
      navigate('/login')
    } catch (err) {
      // Still navigate even if logout fails
      navigate('/login')
    }
  }

  if (loading) {
    return (
      <div className="account-shell max-w-2xl mx-auto bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-600">{t('account.loading')}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="account-shell max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <div className="text-red-500 mb-4">{error}</div>
        <Link to="/login" className="text-indigo-600 hover:text-indigo-700">{t('account.go_to_login')}</Link>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="account-shell bg-white rounded-xl shadow-md overflow-hidden">
        <div className="account-banner bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
          <h1 className="site-title text-3xl font-bold text-white">{t('account.title')}</h1>
          <p className="text-indigo-100 mt-1">{t('account.subtitle')}</p>
        </div>

        <div className="p-6">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">{t('account.info')}</h2>
            <div className="space-y-3">
              <div className="flex border-b pb-3">
                <span className="text-gray-600 w-32 font-medium">{t('account.username')}</span>
                <span className="text-gray-900">{user.username || 'N/A'}</span>
              </div>
              <div className="flex border-b pb-3">
                <span className="text-gray-600 w-32 font-medium">{t('account.name')}</span>
                <span className="text-gray-900">{user.first_name || 'N/A'} {user.last_name || ''}</span>
              </div>
              <div className="flex border-b pb-3">
                <span className="text-gray-600 w-32 font-medium">{t('account.email')}</span>
                <span className="text-gray-900">{user.email || 'N/A'}</span>
              </div>
              {user.date_joined && (
                <div className="flex border-b pb-3">
                  <span className="text-gray-600 w-32 font-medium">{t('account.member_since')}</span>
                  <span className="text-gray-900">{new Date(user.date_joined).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">{t('account.quick_actions')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/cart"
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <i data-feather="shopping-cart" className="mr-3 text-indigo-600"></i>
                <div>
                  <div className="font-medium">{t('account.view_cart')}</div>
                  <div className="text-sm text-gray-600">{t('account.check_items')}</div>
                </div>
              </Link>
              <Link
                to="/"
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <i data-feather="shopping-bag" className="mr-3 text-indigo-600"></i>
                <div>
                  <div className="font-medium">{t('account.browse_products')}</div>
                  <div className="text-sm text-gray-600">{t('account.find_products')}</div>
                </div>
              </Link>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">{t('account.settings')}</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('account.preferred_language')}</label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="lang"
                    value="en"
                    checked={(user.lang || localStorage.getItem('lang') || 'en') === 'en'}
                    onChange={async (e) => {
                      const next = 'en'
                      setLang(next)
                      setUser(prev => ({ ...prev, lang: next }))
                    }}
                    className="mr-2"
                  />
                  {t('lang.en')}
                </label>

                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="lang"
                    value="ru"
                    checked={(user.lang || localStorage.getItem('lang') || 'en') === 'ru'}
                    onChange={async (e) => {
                      const next = 'ru'
                      setLang(next)
                      setUser(prev => ({ ...prev, lang: next }))
                    }}
                    className="mr-2"
                  />
                  {t('lang.ru')}
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                {t('account.edit_profile')}
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                {t('account.change_password')}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {t('account.logout')}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

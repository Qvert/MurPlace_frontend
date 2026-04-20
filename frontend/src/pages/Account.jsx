import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth' // Убедись, что путь верный
import { useLang } from '../i18n.jsx' // Убедись, что путь верный

// Иконка Telegram (SVG)
const TelegramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <path d="M20.665 3.333L3.333 10.665L8.665 13.333L16.665 6.665L10.665 14.665L16.665 18.665L20.665 3.333Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function Account() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tgLoading, setTgLoading] = useState(false) // Состояние загрузки для кнопки ТГ
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
          setError(t('account.load_error') || 'Failed to load profile')
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
  }, [navigate, t])

  async function handleLogout() {
    try {
      await authService.logout()
      navigate('/login')
    } catch (err) {
      navigate('/login')
    }
  }

  // Логика кнопки Telegram
  async function handleConnectTelegram() {
    setTgLoading(true)
    try {
      const data = await authService.getTelegramLink()
      // Перенаправляем пользователя в телеграм
      if (data.link) {
        window.location.href = data.link
      }
    } catch (err) {
      console.error("Failed to get TG link", err)
      alert(t('account.tg_error') || 'Error generating Telegram link')
    } finally {
      setTgLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="account-shell max-w-2xl mx-auto bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-600">{t('account.loading') || 'Loading...'}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="account-shell max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <div className="text-red-500 mb-4">{error}</div>
        <Link to="/login" className="text-indigo-600 hover:text-indigo-700">{t('account.go_to_login') || 'Login'}</Link>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="account-shell bg-white rounded-xl shadow-md overflow-hidden">
        {/* Шапка профиля */}
        <div className="account-banner bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
          <h1 className="site-title text-3xl font-bold text-white">{t('account.title') || 'My Account'}</h1>
          <p className="text-indigo-100 mt-1">{t('account.subtitle') || 'Manage your profile and settings'}</p>
        </div>

        <div className="p-6">
          {/* Инфо секция */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">{t('account.info') || 'Account Information'}</h2>
            <div className="space-y-3">
              <div className="flex border-b pb-3">
                <span className="text-gray-600 w-32 font-medium">{t('account.username') || 'Username'}</span>
                <span className="text-gray-900">{user.username || 'N/A'}</span>
              </div>
              <div className="flex border-b pb-3">
                <span className="text-gray-600 w-32 font-medium">{t('account.name') || 'Name'}</span>
                <span className="text-gray-900">{user.first_name || 'N/A'} {user.last_name || ''}</span>
              </div>
              <div className="flex border-b pb-3">
                <span className="text-gray-600 w-32 font-medium">{t('account.email') || 'Email'}</span>
                <span className="text-gray-900">{user.email || 'N/A'}</span>
              </div>
              {user.date_joined && (
                <div className="flex border-b pb-3">
                  <span className="text-gray-600 w-32 font-medium">{t('account.member_since') || 'Joined'}</span>
                  <span className="text-gray-900">{new Date(user.date_joined).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </section>

          {/* Быстрые действия */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">{t('account.quick_actions') || 'Quick Actions'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/cart"
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Если используешь feather-icons через скрипт, оставь i, иначе замени на SVG */}
                <i data-feather="shopping-cart" className="mr-3 text-indigo-600"></i>
                <div>
                  <div className="font-medium">{t('account.view_cart') || 'Cart'}</div>
                  <div className="text-sm text-gray-600">{t('account.check_items') || 'Check your items'}</div>
                </div>
              </Link>
              <Link
                to="/"
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <i data-feather="shopping-bag" className="mr-3 text-indigo-600"></i>
                <div>
                  <div className="font-medium">{t('account.browse_products') || 'Products'}</div>
                  <div className="text-sm text-gray-600">{t('account.find_products') || 'Find something new'}</div>
                </div>
              </Link>
            </div>
          </section>

          {/* --- НОВАЯ СЕКЦИЯ: ИНТЕГРАЦИИ (TELEGRAM) --- */}
          <section className="mb-8">
             <h2 className="text-xl font-semibold mb-4 text-gray-800">{t('account.integrations') || 'Integrations'}</h2>
             <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-blue-900 flex items-center">
                    <TelegramIcon /> Telegram
                  </div>
                  <div className="text-sm text-blue-700 mt-1">
                    {user.chat_id
                      ? (t('account.connected_prompt') || 'Your account is connected to our bot.')
                      : (t('account.connect_prompt') || 'Connect to receive notifications.')}
                  </div>
                </div>

                {user.chat_id ? (
                   <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-200">
                     {t('account.connected') || 'Connected'}
                   </span>
                ) : (
                  <button
                    onClick={handleConnectTelegram}
                    disabled={tgLoading}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors shadow-sm flex items-center"
                  >
                    {tgLoading ? 'Loading...' : (t('account.connect') || 'Connect')}
                  </button>
                )}
             </div>
          </section>

          {/* Настройки */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">{t('account.settings') || 'Settings'}</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('account.preferred_language') || 'Language'}</label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="lang"
                    value="en"
                    checked={(user.lang || localStorage.getItem('lang') || 'en') === 'en'}
                    onChange={() => {
                      setLang('en')
                      setUser(prev => ({ ...prev, lang: 'en' }))
                    }}
                    className="mr-2 text-indigo-600 focus:ring-indigo-500"
                  />
                  {t('lang.en') || 'English'}
                </label>

                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="lang"
                    value="ru"
                    checked={(user.lang || localStorage.getItem('lang') || 'en') === 'ru'}
                    onChange={() => {
                      setLang('ru')
                      setUser(prev => ({ ...prev, lang: 'ru' }))
                    }}
                    className="mr-2 text-indigo-600 focus:ring-indigo-500"
                  />
                  {t('lang.ru') || 'Русский'}
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                {t('account.edit_profile') || 'Edit Profile'}
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                {t('account.change_password') || 'Change Password'}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ml-auto"
              >
                {t('account.logout') || 'Logout'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
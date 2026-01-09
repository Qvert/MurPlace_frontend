import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth'
import { useLang } from '../i18n.jsx'

export default function ConfirmEmail() {
  const { t } = useLang()
  const location = useLocation()
  const navigate = useNavigate()
  const qs = new URLSearchParams(location.search)
  const initialEmail = location.state?.email || qs.get('email') || ''
  const tokenFromUrl = qs.get('token')

  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState(tokenFromUrl || '')
  const [message, setMessage] = useState(location.state?.message || '')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  useEffect(() => {
    // If token present in URL, try to confirm automatically
    if (tokenFromUrl) {
      handleConfirm(tokenFromUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenFromUrl])

  async function handleConfirm(tokenToUse) {
    setError(null)
    setStatus('sending')
    try {
      const res = await authService.confirmEmail({ token: tokenToUse || code, email })
      setStatus('success')

      // If backend provided access token after confirmation, sign-in automatically
      if (res.access) {
        // authService already stored tokens
        navigate('/')
      } else if (res.token) {
        // Fallback for old token system
        localStorage.setItem('token', res.token)
        navigate('/')
      } else {
        // otherwise go to login with a success message
        navigate('/login', { state: { message: t('confirm.success_login') } })
      }
    } catch (err) {
      setStatus('error')
      let msg = err?.message
      if (msg) {
        if (msg.includes('Invalid confirmation code')) msg = t('confirm.invalid_code')
        else if (msg.includes('No confirmation code')) msg = t('confirm.no_code_found')
      } else {
        msg = t('confirm.error_generic')
      }
      setError(msg)
    }
  }

  async function handleResend() {
    setError(null)
    setStatus('sending')
    try {
      await authService.resendConfirmation(email)
      setStatus('sent')
      setMessage(t('confirm.resent_message'))
    } catch (err) {
      setStatus('error')
      setError(err?.message || t('confirm.error_generic'))
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-center">
          <h2 className="text-2xl font-bold text-white">{t('confirm.title')}</h2>
        </div>
        <div className="p-6">
          <p className="mb-4">
            {message || t('confirm.instructions')}
          </p>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">{t('confirm.email_label')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-3 px-4 border rounded-lg"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">{t('confirm.code_label')}</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full py-3 px-4 border rounded-lg"
            />
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <div className="flex gap-3">
            <button onClick={() => handleConfirm()} className="flex-1 bg-indigo-600 text-white py-3 rounded-lg">{t('confirm.confirm_button')}</button>
            <button onClick={() => handleResend()} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg">{t('confirm.resend_button')}</button>
          </div>

          {status === 'sending' && <p className="text-sm text-gray-500 mt-3">{t('confirm.processing')}</p>}
          {status === 'sent' && <p className="text-sm text-green-600 mt-3">{message}</p>}
        </div>
      </div>
    </div>
  )
}

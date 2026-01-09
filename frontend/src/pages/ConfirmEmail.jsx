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

  const [email, setEmail] = useState(initialEmail)
  const [message, setMessage] = useState(location.state?.message || '')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  // Mark verification as already requested (sent from signup)
  useEffect(() => {
    // If message is present, verification was already requested during signup
    if (message) {
      // No need to request again
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEmail])

  async function handleConfirm() {
    setError(null)
    setStatus('checking')
    try {
      const res = await authService.confirmEmail({ email })

      // If email is verified, sign-in or redirect
      if (res.verified) {
        setStatus('success')
        if (res.access || res.token) {
          // authService already stored tokens
          navigate('/')
        } else {
          // Email verified but no auto-login tokens, go to login
          navigate('/login', { state: { message: t('confirm.success_login') } })
        }
      } else {
        setStatus('error')
        setError(t('confirm.not_verified_yet'))
      }
    } catch (err) {
      setStatus('error')
      let msg = err?.message || t('confirm.error_generic')
      if (msg.includes('No confirmation code')) msg = t('confirm.no_code_found')
      setError(msg)
    }
  }

  async function handleResend() {
    console.log('Resend button clicked for email:', email)
    setError(null)
    setStatus('sending')
    try {
      console.log('Calling authService.resendConfirmation...')
      await authService.resendConfirmation(email)
      console.log('Resend successful')
      setStatus('idle')
      setMessage(t('confirm.resent_message'))
    } catch (err) {
      console.error('Resend failed:', err)
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

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <div className="flex gap-3">
            <button onClick={() => handleConfirm()} disabled={status === 'checking'} className="flex-1 bg-indigo-600 text-white py-3 rounded-lg disabled:opacity-50">{status === 'checking' ? t('confirm.processing') : t('confirm.confirm_button')}</button>
            <button onClick={() => handleResend()} disabled={status === 'sending'} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg disabled:opacity-50">{t('confirm.resend_button')}</button>
          </div>

          {status === 'sending' && <p className="text-sm text-blue-600 mt-3">{t('confirm.processing')}</p>}
          {status === 'success' && <p className="text-sm text-green-600 mt-3">{t('confirm.success_message')}</p>}
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { postJSON } from '../utils/api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const data = await postJSON('/api/login/', { username, password })
      if (data.token) {
        localStorage.setItem('token', data.token)
        window.dispatchEvent(new Event('storage'))
        navigate('/account')
      } else if (data.success) {
        navigate('/')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Network error')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-center">
          <h2 className="text-2xl font-bold text-white">Login to Your Account</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Username</label>
              <input className="w-full py-3 px-4 border rounded-lg" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
              <input type="password" className="w-full py-3 px-4 border rounded-lg" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg">Sign In</button>
          </form>
        </div>
      </div>
    </div>
  )
}

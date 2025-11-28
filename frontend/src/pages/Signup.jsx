import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { postJSON } from '../utils/api'

export default function Signup() {
  const [form, setForm] = useState({ username: '', first_name: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const data = await postJSON('/api/signup/', form)
      if (data.success) {
        navigate('/login')
      } else {
        setError(data.error || 'Signup failed')
      }
    } catch (err) {
      setError('Network error')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-center">
          <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Username</label>
              <input name="username" className="w-full py-3 px-4 border rounded-lg" value={form.username} onChange={onChange} required minLength={3} />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">First Name</label>
              <input name="first_name" className="w-full py-3 px-4 border rounded-lg" value={form.first_name} onChange={onChange} required />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
              <input type="email" name="email" className="w-full py-3 px-4 border rounded-lg" value={form.email} onChange={onChange} required />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
              <input type="password" name="password" className="w-full py-3 px-4 border rounded-lg" value={form.password} onChange={onChange} required minLength={8} />
            </div>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg">Create Account</button>
          </form>
        </div>
      </div>
    </div>
  )
}

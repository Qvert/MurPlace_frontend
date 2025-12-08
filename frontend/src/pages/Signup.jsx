import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { postJSON } from '../utils/api'

export default function Signup() {
  const [form, setForm] = useState({ username: '', first_name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  function onChange(e) {
    const { name, value } = e.target
    // Sanitize input: trim whitespace for non-password fields
    const sanitized = name === 'password' || name === 'confirmPassword' ? value : value.trim()
    setForm({ ...form, [name]: sanitized })
  }

  function validateForm() {
    // Username: alphanumeric and underscores only, 3-20 chars
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) {
      return 'Username must be 3-20 characters (letters, numbers, underscores only)'
    }

    // First name: letters, spaces, hyphens only
    if (!/^[a-zA-Z\s-]{1,50}$/.test(form.first_name)) {
      return 'First name can only contain letters, spaces, and hyphens'
    }

    // Email: basic format check (browser validation handles most of this)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return 'Please enter a valid email address'
    }

    // Password: at least 8 chars, must contain letter and number
    if (form.password.length < 8) {
      return 'Password must be at least 8 characters'
    }
    if (!/[a-zA-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      return 'Password must contain at least one letter and one number'
    }

    // Confirm password match
    if (form.password !== form.confirmPassword) {
      return 'Passwords do not match'
    }

    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    // Validate before submitting
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      // Send only necessary fields (exclude confirmPassword)
      const { confirmPassword, ...payload } = form
      const data = await postJSON('/api/signup/', payload)
      // Store token if provided by backend
      if (data.token) {
        localStorage.setItem('token', data.token)
      }
      // If postJSON doesn't throw, the request was successful (2xx status)
      navigate('/')
    } catch (err) {
      // Handle different error types
      if (err.message) {
        const msg = err.message.toLowerCase()
        
        // Check for status codes in error message
        if (msg.includes('400')) {
          setError('Invalid signup data. Please check your information and try again.')
        } else if (msg.includes('501') || msg.includes('500')) {
          setError('Server error. Please try again later.')
        } else if (msg.includes('network')) {
          setError('Network error. Please check your connection.')
        } else {
          // Try to extract error message from server response
          const match = err.message.match(/\d{3}\s+(.+)/)
          setError(match ? match[1] : 'Signup failed. Please try again.')
        }
      } else {
        setError('An unexpected error occurred')
      }
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
              <input 
                name="username" 
                className="w-full py-3 px-4 border rounded-lg" 
                value={form.username} 
                onChange={onChange} 
                required 
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]+"
                title="Letters, numbers, and underscores only"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">First Name</label>
              <input 
                name="first_name" 
                className="w-full py-3 px-4 border rounded-lg" 
                value={form.first_name} 
                onChange={onChange} 
                required 
                maxLength={50}
                pattern="[a-zA-Z\s-]+"
                title="Letters, spaces, and hyphens only"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
              <input 
                type="email" 
                name="email" 
                className="w-full py-3 px-4 border rounded-lg" 
                value={form.email} 
                onChange={onChange} 
                required 
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
              <input 
                type="password" 
                name="password" 
                className="w-full py-3 px-4 border rounded-lg" 
                value={form.password} 
                onChange={onChange} 
                required 
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">At least 8 characters with letters and numbers</p>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword" 
                className="w-full py-3 px-4 border rounded-lg" 
                value={form.confirmPassword} 
                onChange={onChange} 
                required 
                minLength={8}
              />
            </div>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg">Create Account</button>
          </form>
        </div>
      </div>
    </div>
  )
}

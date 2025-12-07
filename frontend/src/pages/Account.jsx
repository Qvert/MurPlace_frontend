import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth'

export default function Account() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    async function loadUser() {
      const token = localStorage.getItem('access_token')
      if (!token) {
        navigate('/login')
        return
      }

      try {
        const userData = await authService.getCurrentUser()
        if (mounted) setUser(userData)
      } catch (err) {
        if (mounted) {
          setError('Failed to load user data')
          // If unauthorized, redirect to login
          if (err.response?.status === 401) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
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
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-600">Loading account...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <div className="text-red-500 mb-4">{error}</div>
        <Link to="/login" className="text-indigo-600 hover:text-indigo-700">Go to Login</Link>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
          <h1 className="text-3xl font-bold text-white">My Account</h1>
          <p className="text-indigo-100 mt-1">Manage your profile and preferences</p>
        </div>

        <div className="p-6">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Account Information</h2>
            <div className="space-y-3">
              <div className="flex border-b pb-3">
                <span className="text-gray-600 w-32 font-medium">Username:</span>
                <span className="text-gray-900">{user.username || 'N/A'}</span>
              </div>
              <div className="flex border-b pb-3">
                <span className="text-gray-600 w-32 font-medium">Name:</span>
                <span className="text-gray-900">{user.first_name || 'N/A'} {user.last_name || ''}</span>
              </div>
              <div className="flex border-b pb-3">
                <span className="text-gray-600 w-32 font-medium">Email:</span>
                <span className="text-gray-900">{user.email || 'N/A'}</span>
              </div>
              {user.date_joined && (
                <div className="flex border-b pb-3">
                  <span className="text-gray-600 w-32 font-medium">Member since:</span>
                  <span className="text-gray-900">{new Date(user.date_joined).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/cart"
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <i data-feather="shopping-cart" className="mr-3 text-indigo-600"></i>
                <div>
                  <div className="font-medium">View Cart</div>
                  <div className="text-sm text-gray-600">Check your items</div>
                </div>
              </Link>
              <Link
                to="/"
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <i data-feather="shopping-bag" className="mr-3 text-indigo-600"></i>
                <div>
                  <div className="font-medium">Browse Products</div>
                  <div className="text-sm text-gray-600">Find pet supplies</div>
                </div>
              </Link>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Account Settings</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Edit Profile
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

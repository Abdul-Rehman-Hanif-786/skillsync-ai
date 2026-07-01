import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { FiLogOut, FiUser, FiShield, FiBell } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

      {/* Account Info */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <FiUser className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold">Account</h2>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Full Name</span>
            <span className="font-medium">{user?.full_name || '—'}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Email</span>
            <span className="font-medium">{user?.email || '—'}</span>
          </div>
        </div>
      </div>

      {/* Preferences placeholder */}
      <div className="card opacity-60">
        <div className="flex items-center gap-3 mb-2">
          <FiBell className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-600">Notifications</h2>
        </div>
        <p className="text-sm text-gray-400">Notification preferences coming soon.</p>
      </div>

      {/* Privacy placeholder */}
      <div className="card opacity-60">
        <div className="flex items-center gap-3 mb-2">
          <FiShield className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-600">Privacy</h2>
        </div>
        <p className="text-sm text-gray-400">Privacy settings coming soon.</p>
      </div>

      {/* Danger Zone */}
      <div className="card border border-red-100">
        <h2 className="text-lg font-semibold text-red-700 mb-4">Danger Zone</h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <FiLogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </div>
  )
}

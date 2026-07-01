import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiUser, FiEdit, FiMail, FiBriefcase, FiMapPin, FiCalendar } from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'
import { useProfile } from '../../hooks'
import { formatDate, capitalize } from '../../utils'

export default function ProfileView() {
  const { user } = useAuthStore()
  const { profile, loading } = useProfile()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <Link to="/profile/edit" className="btn-primary flex items-center gap-2">
          <FiEdit className="w-4 h-4" />
          Edit Profile
        </Link>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <FiUser className="w-10 h-10 text-primary-600" />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{user?.full_name || 'No name set'}</h2>
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <FiMail className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>

            {profile ? (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {profile.current_role && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <FiBriefcase className="w-4 h-4 text-primary-600" />
                    <span>{profile.current_role}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <FiMapPin className="w-4 h-4 text-primary-600" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.years_of_experience != null && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <FiCalendar className="w-4 h-4 text-primary-600" />
                    <span>{profile.years_of_experience} years of experience</span>
                  </div>
                )}
                {profile.experience_level && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="px-2 py-1 bg-primary-50 text-primary-700 text-sm rounded-full capitalize">
                      {capitalize(profile.experience_level)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 mt-3 text-sm">No profile details yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {profile?.bio && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">About Me</h3>
          <p className="text-gray-700 whitespace-pre-line">{profile.bio}</p>
        </div>
      )}

      {/* Target Role */}
      {profile?.target_role && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Career Goal</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <FiBriefcase className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{profile.target_role}</p>
              <p className="text-sm text-gray-500">Target Role</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      {!profile && (
        <div className="card border-2 border-dashed border-gray-200 text-center py-10">
          <FiUser className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Complete Your Profile</h3>
          <p className="text-gray-500 mb-4">Add your details to get personalized career recommendations</p>
          <Link to="/profile/edit" className="btn-primary">
            Set Up Profile
          </Link>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { profileService } from '../../services'
import { useAuthStore } from '../../store/authStore'
import { getErrorMessage } from '../../utils'
import { PROFICIENCY_LEVELS, EXPERIENCE_LEVELS } from '../../config'
import toast from 'react-hot-toast'

export default function ProfileEdit() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [isNew, setIsNew] = useState(false)

  const [form, setForm] = useState({
    bio: '',
    current_role: '',
    target_role: '',
    location: '',
    years_of_experience: '',
    experience_level: 'entry',
  })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await profileService.get()
        const p = res.data
        setForm({
          bio: p.bio || '',
          current_role: p.current_role || '',
          target_role: p.target_role || '',
          location: p.location || '',
          years_of_experience: p.years_of_experience ?? '',
          experience_level: p.experience_level || 'entry',
        })
      } catch (err) {
        if (err?.response?.status === 404) {
          setIsNew(true)
        }
      } finally {
        setFetching(false)
      }
    }
    loadProfile()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        years_of_experience: form.years_of_experience !== '' ? Number(form.years_of_experience) : null,
      }
      if (isNew) {
        await profileService.create(payload)
        toast.success('Profile created!')
      } else {
        await profileService.update(payload)
        toast.success('Profile updated!')
      }
      navigate('/profile')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {isNew ? 'Set Up Profile' : 'Edit Profile'}
      </h1>

      <form onSubmit={handleSubmit} className="card space-y-5">
        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={4}
            className="input-field resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>

        {/* Current Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Role</label>
          <input
            type="text"
            name="current_role"
            value={form.current_role}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g. Frontend Developer"
          />
        </div>

        {/* Target Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
          <input
            type="text"
            name="target_role"
            value={form.target_role}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g. Full Stack Engineer"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g. Karachi, Pakistan"
          />
        </div>

        {/* Years of Experience & Level */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
            <input
              type="number"
              name="years_of_experience"
              value={form.years_of_experience}
              onChange={handleChange}
              min="0"
              max="50"
              className="input-field"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
            <select
              name="experience_level"
              value={form.experience_level}
              onChange={handleChange}
              className="input-field"
            >
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

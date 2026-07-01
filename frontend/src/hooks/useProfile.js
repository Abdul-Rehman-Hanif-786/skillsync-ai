import { useState, useEffect } from 'react'
import { profileService } from '../services'
import { getErrorMessage } from '../utils'

/**
 * Hook to fetch and manage the current user's profile
 */
export function useProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await profileService.get()
      setProfile(response.data)
    } catch (err) {
      // 404 means profile doesn't exist yet — not an error
      if (err?.response?.status !== 404) {
        setError(getErrorMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  return { profile, loading, error, refetch: fetchProfile, setProfile }
}

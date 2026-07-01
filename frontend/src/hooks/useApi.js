import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../utils'

/**
 * Generic hook for API calls with loading / error state management
 *
 * Usage:
 *   const { data, loading, execute } = useApi(someService.getAll)
 *   useEffect(() => { execute() }, [])
 */
export function useApi(apiFn, { showErrorToast = true } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(
    async (...args) => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiFn(...args)
        setData(response.data)
        return response.data
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        if (showErrorToast) {
          toast.error(message)
        }
        return null
      } finally {
        setLoading(false)
      }
    },
    [apiFn, showErrorToast]
  )

  return { data, loading, error, execute, setData }
}

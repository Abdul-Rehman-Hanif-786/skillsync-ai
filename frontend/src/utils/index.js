// Helper utility functions

/**
 * Format a date string to a readable format
 */
export const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Capitalize the first letter of a string
 */
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Truncate text to a max length with ellipsis
 */
export const truncate = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Extract error message from an axios error response
 */
export const getErrorMessage = (error, fallback = 'Something went wrong') => {
  return error?.response?.data?.detail || error?.message || fallback
}

/**
 * Convert a proficiency level string to a numeric progress value (0-100)
 */
export const proficiencyToPercent = (level) => {
  const map = {
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 100,
  }
  return map[level?.toLowerCase()] ?? 0
}

/**
 * Get Tailwind color class based on proficiency level
 */
export const proficiencyColor = (level) => {
  const map = {
    beginner: 'text-yellow-600 bg-yellow-100',
    intermediate: 'text-blue-600 bg-blue-100',
    advanced: 'text-green-600 bg-green-100',
    expert: 'text-purple-600 bg-purple-100',
  }
  return map[level?.toLowerCase()] ?? 'text-gray-600 bg-gray-100'
}

/**
 * Debounce a function call
 */
export const debounce = (fn, delay = 300) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

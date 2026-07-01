/**
 * AuthContext — wraps Zustand authStore into a React context
 * for components that prefer useContext over direct Zustand hooks.
 *
 * Most components should use useAuthStore() directly.
 * This context exists for compatibility / future extension.
 */
import { createContext, useContext } from 'react'
import { useAuthStore } from '../store/authStore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const auth = useAuthStore()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}

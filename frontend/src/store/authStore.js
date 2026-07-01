import { create } from 'zustand'

const USER_KEY = 'skillsync_user'

export const useAuthStore = create((set) => ({
  user: (() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })(),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  setAuth: (user, token) => {
    localStorage.setItem('token', token)
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem(USER_KEY)
    set({ user: null, token: null, isAuthenticated: false })
  },

  updateUser: (userData) => {
    if (userData) localStorage.setItem(USER_KEY, JSON.stringify(userData))
    set({ user: userData })
  },
}))

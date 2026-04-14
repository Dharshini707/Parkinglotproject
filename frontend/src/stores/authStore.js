import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const res = await api.post('/auth/login', { email, password })
        const { user, token } = res.data
        set({ user, token, isAuthenticated: true })
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        return user
      },

      register: async (name, email, password) => {
        const res = await api.post('/auth/register', { name, email, password })
        const { user, token } = res.data
        set({ user, token, isAuthenticated: true })
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        return user
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
        delete api.defaults.headers.common['Authorization']
      },

      updateUser: (data) => set(state => ({ user: { ...state.user, ...data } })),
    }),
    {
      name: 'park-auth',
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
        }
      },
    }
  )
)

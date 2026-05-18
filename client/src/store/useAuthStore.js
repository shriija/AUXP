import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post('/auth/login', { email, password });
          set({
            user: { _id: res.data._id, name: res.data.name, email: res.data.email, xp: res.data.xp, level: res.data.level, badges: res.data.badges },
            token: res.data.token,
            isAuthenticated: true,
            loading: false,
          });
          return true;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Login failed', loading: false });
          return false;
        }
      },

      register: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post('/auth/register', { name, email, password });
          set({
            user: { _id: res.data._id, name: res.data.name, email: res.data.email, xp: res.data.xp, level: res.data.level, badges: res.data.badges },
            token: res.data.token,
            isAuthenticated: true,
            loading: false,
          });
          return true;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Registration failed', loading: false });
          return false;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage', // saves to localStorage
    }
  )
);

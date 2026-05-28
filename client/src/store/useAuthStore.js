import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import { useToastStore } from './useToastStore';

let lastProcessedXp = null;

const triggerGamificationToasts = (oldUser, newUser) => {
  if (!oldUser || !newUser) return;
  if (oldUser.xp === newUser.xp) return;
  if (lastProcessedXp === newUser.xp) return;
  lastProcessedXp = newUser.xp;
  
  // 1. XP changes
  if (newUser.xp > oldUser.xp) {
    const diff = newUser.xp - oldUser.xp;
    useToastStore.getState().addToast(`+${diff} XP GAINED!`, 'xp');
  } else if (newUser.xp < oldUser.xp) {
    const diff = oldUser.xp - newUser.xp;
    useToastStore.getState().addToast(`-${diff} XP DEDUCTED`, 'error');
  }

  // 2. Level changes
  if (newUser.level > oldUser.level) {
    useToastStore.getState().addToast(`🎉 LEVEL UP! YOU REACHED LEVEL ${newUser.level}!`, 'badge', true);
  }

  // 3. Badge changes
  if (newUser.badges && oldUser.badges) {
    const newBadges = newUser.badges.filter(b => !oldUser.badges.includes(b));
    newBadges.forEach(badge => {
      const badgeNames = {
        'FIRST_UPLOAD': 'FIRST UPLOAD',
        'TEN_RESOURCES': '10 RESOURCES SHARED',
        'FORUM_HELPER': 'FORUM HELPER',
        'WHITEBOARD_WIZARD': 'WHITEBOARD WIZARD',
        'THIRTY_DAY_STREAK': '30-DAY STREAK',
        'SCHOLAR_10': 'LEVEL 10 SCHOLAR'
      };
      const name = badgeNames[badge] || badge.replace(/_/g, ' ');
      useToastStore.getState().addToast(`🏆 BADGE UNLOCKED: ${name}!`, 'badge', true);
    });
  }
};

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
          const newUser = { _id: res.data._id, name: res.data.name, email: res.data.email, role: res.data.role, xp: res.data.xp, level: res.data.level, badges: res.data.badges, department: res.data.department, weeklyXp: res.data.weeklyXp };
          set({
            user: newUser,
            token: res.data.token,
            isAuthenticated: true,
            loading: false,
          });
          useToastStore.getState().addToast(`WELCOME BACK, ${res.data.name.toUpperCase()}!`, 'success');
          return true;
        } catch (error) {
          const errMsg = error.response?.data?.message || 'Login failed';
          set({ error: errMsg, loading: false });
          useToastStore.getState().addToast(errMsg, 'error');
          return false;
        }
      },

      register: async (name, email, password, department) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post('/auth/register', { name, email, password, department });
          const newUser = { _id: res.data._id, name: res.data.name, email: res.data.email, role: res.data.role, xp: res.data.xp, level: res.data.level, badges: res.data.badges, department: res.data.department, weeklyXp: res.data.weeklyXp };
          set({
            user: newUser,
            token: res.data.token,
            isAuthenticated: true,
            loading: false,
          });
          useToastStore.getState().addToast(`WELCOME TO AUXP, ${res.data.name.toUpperCase()}!`, 'badge', true);
          return true;
        } catch (error) {
          const errMsg = error.response?.data?.message || 'Registration failed';
          set({ error: errMsg, loading: false });
          useToastStore.getState().addToast(errMsg, 'error');
          return false;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        useToastStore.getState().addToast('LOGGED OUT SUCCESSFULY', 'info');
      },
      
      getMe: async () => {
        try {
          const oldUser = useAuthStore.getState().user;
          const res = await api.get('/auth/me');
          const newUser = { _id: res.data._id, name: res.data.name, email: res.data.email, role: res.data.role, xp: res.data.xp, level: res.data.level, badges: res.data.badges, department: res.data.department, weeklyXp: res.data.weeklyXp };
          set({ user: newUser });
          triggerGamificationToasts(oldUser, newUser);
          return res.data;
        } catch (error) {
          console.error('Failed to fetch current user', error);
          return null;
        }
      },
      
      updateProfile: async (profileData) => {
        set({ loading: true, error: null });
        try {
          const res = await api.put('/auth/update', profileData);
          const newUser = { _id: res.data._id, name: res.data.name, email: res.data.email, role: res.data.role, xp: res.data.xp, level: res.data.level, badges: res.data.badges, department: res.data.department, weeklyXp: res.data.weeklyXp };
          set({
            user: newUser,
            loading: false
          });
          useToastStore.getState().addToast('PROFILE UPDATED SUCCESSFULLY', 'success');
          return true;
        } catch (error) {
          const errMsg = error.response?.data?.message || 'Update failed';
          set({ error: errMsg, loading: false });
          useToastStore.getState().addToast(errMsg, 'error');
          return false;
        }
      },
      
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage', // saves to localStorage
    }
  )
);

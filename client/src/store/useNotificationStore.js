import { create } from 'zustand';
import api from '../services/api';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/notifications');
      const unread = res.data.filter(n => !n.isRead).length;
      set({ notifications: res.data, unreadCount: unread, loading: false });
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      set({ loading: false });
    }
  },

  markAllRead: async () => {
    try {
      await api.put('/notifications/read');
      const updated = get().notifications.map(n => ({ ...n, isRead: true }));
      set({ notifications: updated, unreadCount: 0 });
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  },

  markAsRead: async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      const updated = get().notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      );
      const unread = updated.filter(n => !n.isRead).length;
      set({ notifications: updated, unreadCount: unread });
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  },

  deleteNotification: async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      const updated = get().notifications.filter(n => n._id !== id);
      const unread = updated.filter(n => !n.isRead).length;
      set({ notifications: updated, unreadCount: unread });
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  },

  clearAllNotifications: async () => {
    try {
      await api.delete('/notifications');
      set({ notifications: [], unreadCount: 0 });
    } catch (error) {
      console.error('Failed to clear notifications', error);
    }
  }
}));

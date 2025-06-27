import { create } from "zustand";
import { notificationRepository } from "../services/notificationService";
import { Notification } from "../types/notificationTypes";

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  addNotification: (notif: Notification) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const list = await notificationRepository.list();
      set({ notifications: list, isLoading: false });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    const count = await notificationRepository.countUnread();
    set({ unreadCount: count });
  },

  markAsRead: async (id: string) => {
    await notificationRepository.markRead(id);
    set(state => ({
      notifications: state.notifications.map(n => n.notificationId === id
        ? { ...n, read: true }
        : n
      ),
      unreadCount: state.unreadCount - 1,
    }));
  },

  addNotification: (notif) =>
    set(state => ({
      notifications: [notif, ...state.notifications],
      unreadCount: state.unreadCount + (notif.read ? 0 : 1),
    })),
}));

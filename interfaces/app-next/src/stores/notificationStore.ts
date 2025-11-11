import { PostWithTagsAndUser } from '@/utils/endpoint/advisor/feedsEndpoint';
import { UserId } from '@infrastructure/types/user';
import { create } from 'zustand';

type NotificationStore = {
  notifications: PostWithTagsAndUser[];
  setNotifications: (posts: PostWithTagsAndUser[]) => void;
  addNotification: (post: PostWithTagsAndUser) => void;
  markAsRead: (id: string) => void;
  unreadCount: (userId: UserId) => number;
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  setNotifications: (posts) => set({ notifications: posts }),
  addNotification: (post) => set({ notifications: [post, ...get().notifications] }),
  markAsRead: (id) =>
    set({
      notifications: get().notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }),
  unreadCount: (userId: UserId) =>
    get().notifications.filter((n) => !n.readBy.includes(userId)).length,
}));

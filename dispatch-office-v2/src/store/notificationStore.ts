// ═══════════════════════════════════════════════════════
//  notificationStore.ts — система уведомлений
//  SMS, email, звонки от водителей и брокеров
// ═══════════════════════════════════════════════════════
import { create } from 'zustand';

export type NotificationType =
  | 'sms'
  | 'email'
  | 'missed_call'
  | 'voicemail'
  | 'urgent'
  | 'detention'
  | 'pod_ready'
  | 'rate_con'
  | 'system';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Notification {
  id: string;
  type: NotificationType;
  from: string;
  subject: string;
  message: string;
  timestamp: number; // game minute
  read: boolean;
  priority: NotificationPriority;
  actionRequired?: boolean;
  relatedTruckId?: string;
  relatedLoadId?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;

  addNotification: (notif: Omit<Notification, 'id' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
}

let notifIdCounter = 1;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notif) => {
    const newNotif: Notification = {
      ...notif,
      id: `notif_${String(notifIdCounter++).padStart(5, '0')}`,
      read: false,
    };
    set((s) => ({
      notifications: [newNotif, ...s.notifications].slice(0, 50), // max 50
      unreadCount: s.unreadCount + 1,
    }));
  },

  markRead: (id) =>
    set((s) => {
      const notif = s.notifications.find((n) => n.id === id);
      if (!notif || notif.read) return s;
      return {
        notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        unreadCount: Math.max(0, s.unreadCount - 1),
      };
    }),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  dismissNotification: (id) =>
    set((s) => {
      const notif = s.notifications.find((n) => n.id === id);
      return {
        notifications: s.notifications.filter((n) => n.id !== id),
        unreadCount: notif && !notif.read ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
      };
    }),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));

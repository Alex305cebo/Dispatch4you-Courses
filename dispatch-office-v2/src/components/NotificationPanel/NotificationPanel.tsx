// ═══════════════════════════════════════════════════════
//  NotificationPanel.tsx — панель уведомлений
// ═══════════════════════════════════════════════════════
import { useState } from 'react';
import { useNotificationStore, type Notification } from '@/store/notificationStore';
import styles from './NotificationPanel.module.css';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const TYPE_ICON: Record<string, string> = {
  sms: '💬',
  email: '📧',
  missed_call: '📞',
  voicemail: '🎙️',
  urgent: '🚨',
  detention: '⏰',
  pod_ready: '📋',
  rate_con: '📄',
  system: '⚙️',
};

const PRIORITY_COLOR: Record<string, string> = {
  critical: 'var(--danger)',
  high: 'var(--accent-orange)',
  medium: 'var(--warning)',
  low: 'var(--text-muted)',
};

export function NotificationPanel({ visible, onClose }: Props) {
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = filter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  function handleNotifClick(notif: Notification) {
    if (!notif.read) markRead(notif.id);
  }

  if (!visible) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>🔔 Уведомления</h3>
          {unreadCount > 0 && (
            <button className={styles.markAllBtn} onClick={markAllRead}>
              Прочитать все
            </button>
          )}
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Filter tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${filter === 'all' ? styles.tabActive : ''}`}
            onClick={() => setFilter('all')}
          >
            Все ({notifications.length})
          </button>
          <button
            className={`${styles.tab} ${filter === 'unread' ? styles.tabActive : ''}`}
            onClick={() => setFilter('unread')}
          >
            Новые ({unreadCount})
          </button>
        </div>

        {/* List */}
        <div className={styles.list}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <span>📭</span>
              <p>Нет уведомлений</p>
            </div>
          ) : (
            filtered.map((notif) => (
              <button
                key={notif.id}
                className={`${styles.item} ${!notif.read ? styles.itemUnread : ''}`}
                onClick={() => handleNotifClick(notif)}
              >
                <span className={styles.itemIcon}>{TYPE_ICON[notif.type] || '📌'}</span>
                <div className={styles.itemContent}>
                  <div className={styles.itemSubject}>{notif.subject}</div>
                  <div className={styles.itemMessage}>{notif.message}</div>
                  <div className={styles.itemMeta}>
                    <span className={styles.itemFrom}>{notif.from}</span>
                    <span
                      className={styles.itemPriority}
                      style={{ color: PRIORITY_COLOR[notif.priority] }}
                    >
                      ●
                    </span>
                  </div>
                </div>
                {!notif.read && <span className={styles.unreadDot} />}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

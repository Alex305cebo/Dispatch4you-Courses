import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { useGameStore, Notification, formatGameTime } from '../store/gameStore';
// import BrokerCommunicationModal from './BrokerCommunicationModal';
import { ThreadChatPopup } from './EmailPanel';

interface Props {
  onNavigateToTrucks?: () => void;
  onNavigateToLoads?: () => void;
  onNavigateToEvents?: () => void;
}

// ─── Компонент одного уведомления ────────────────────────────────────────────
function NotifItem({ notif, onPress, getIcon, getPriorityColor }: {
  notif: Notification;
  onPress: () => void;
  getIcon: (t: Notification['type']) => string;
  getPriorityColor: (p: Notification['priority']) => string;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.notifItem,
        !notif.read && styles.notifItemUnread,
        notif.priority === 'critical' && !notif.read && styles.notifItemCritical,
        { borderLeftColor: getPriorityColor(notif.priority) },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.notifHeader}>
        <Text style={styles.notifIcon}>{getIcon(notif.type)}</Text>
        <Text style={styles.notifTime}>{formatGameTime(notif.minute)}</Text>
        {notif.priority === 'critical' && !notif.read && (
          <View style={styles.criticalBadge}><Text style={styles.criticalBadgeText}>🚨 СРОЧНО</Text></View>
        )}
        {!notif.read && <View style={styles.unreadDot} />}
        {notif.read && <Text style={styles.readCheck}>✓</Text>}
      </View>
      <Text style={styles.notifFrom}>{notif.from}</Text>
      <Text style={styles.notifSubject}>{notif.subject}</Text>
      <Text style={styles.notifMessage} numberOfLines={2}>{notif.message}</Text>
      {notif.actionRequired && !notif.read && (
        <View style={styles.actionBadge}>
          <Text style={styles.actionBadgeText}>⚡ Нажми для действия</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function NotificationBell({ onNavigateToTrucks, onNavigateToLoads, onNavigateToEvents }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBrokerNotification, setSelectedBrokerNotification] = useState<Notification | null>(null);
  const [selectedDriverNotification, setSelectedDriverNotification] = useState<Notification | null>(null);
  const [selectedEmailNotification, setSelectedEmailNotification] = useState<Notification | null>(null);
  const [sortMode, setSortMode] = useState<'unread' | 'read'>('unread');
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, selectTruck, trucks } = useGameStore();

  // Сортировка и группировка
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

  const sorted = [...notifications].sort((a, b) => {
    if (sortMode === 'priority') {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3);
    }
    if (sortMode === 'time') return b.minute - a.minute;
    if (sortMode === 'done') return a.read === b.read ? 0 : a.read ? -1 : 1;
    return 0;
  });

  const pending = sorted.filter(n => !n.read);
  const done = sorted.filter(n => n.read);

  const handleNotificationClick = (notif: Notification) => {
    markNotificationRead(notif.id);
    setIsOpen(false);
    // Все типы открываем в ThreadChat попапе
    setSelectedEmailNotification(notif);
  };

  const getIcon = (type: Notification['type']) => {
    const icons: Record<Notification['type'], string> = {
      missed_call: '📞',
      email: '📧',
      voicemail: '🎙️',
      text: '💬',
      urgent: '🚨',
      detention: '⏱️',
      pod_ready: '📄',
      rate_con: '📋',
    };
    return icons[type] || '📬';
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    const colors: Record<Notification['priority'], string> = {
      low: '#64748b',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626',
    };
    return colors[priority];
  };

  return (
    <>
      {/* Bell Button */}
      <TouchableOpacity
        style={styles.bellBtn}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.bellIcon}>🔔</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Notification Panel */}
      <Modal transparent animationType="fade" visible={isOpen} onRequestClose={() => setIsOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.panel}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>🔔 Уведомления</Text>
                <Text style={styles.subtitle}>{unreadCount} непрочитанных</Text>
              </View>
              <View style={styles.headerActions}>
                {unreadCount > 0 && (
                  <TouchableOpacity onPress={markAllNotificationsRead} style={styles.markAllBtn}>
                    <Text style={styles.markAllText}>✓ Все</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sort tabs */}
            <View style={styles.sortTabs}>
              {(['unread', 'read'] as const).map(mode => {
                const count = mode === 'unread' ? pending.length : done.length;
                return (
                  <TouchableOpacity
                    key={mode}
                    style={[styles.sortTab, sortMode === mode && styles.sortTabActive]}
                    onPress={() => setSortMode(mode)}
                  >
                    <Text style={[styles.sortTabText, sortMode === mode && styles.sortTabTextActive]}>
                      {mode === 'unread' ? '🔔 Новые' : '✅ Прочитанные'}
                    </Text>
                    {count > 0 && (
                      <View style={[styles.tabBadge, mode === 'unread' && styles.tabBadgeRed]}>
                        <Text style={styles.tabBadgeText}>{count}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Notifications List */}
            <ScrollView style={styles.list}>
              {notifications.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyIcon}>📭</Text>
                  <Text style={styles.emptyText}>Нет уведомлений</Text>
                </View>
              ) : (() => {
                const list = sortMode === 'unread' ? pending : done;
                const critical = list.filter(n => n.priority === 'critical' || n.priority === 'high');
                const normal = list.filter(n => n.priority !== 'critical' && n.priority !== 'high');

                if (list.length === 0) {
                  return (
                    <View style={styles.empty}>
                      <Text style={styles.emptyIcon}>{sortMode === 'unread' ? '🔔' : '✅'}</Text>
                      <Text style={styles.emptyText}>{sortMode === 'unread' ? 'Нет новых' : 'Нет прочитанных'}</Text>
                    </View>
                  );
                }

                return (
                  <>
                    {/* Красный раздел — Критические */}
                    {critical.length > 0 && (
                      <>
                        <View style={styles.criticalHeader}>
                          <Text style={styles.criticalHeaderText}>🚨 ВАЖНЫЕ / КРИТИЧЕСКИЕ ({critical.length})</Text>
                        </View>
                        {critical.map(notif => (
                          <NotifItem key={notif.id} notif={notif} onPress={() => handleNotificationClick(notif)} getIcon={getIcon} getPriorityColor={getPriorityColor} />
                        ))}
                      </>
                    )}
                    {/* Обычные */}
                    {normal.length > 0 && (
                      <>
                        {critical.length > 0 && (
                          <View style={styles.groupHeader}>
                            <Text style={styles.groupHeaderText}>📋 Остальные ({normal.length})</Text>
                          </View>
                        )}
                        {normal.map(notif => (
                          <NotifItem key={notif.id} notif={notif} onPress={() => handleNotificationClick(notif)} getIcon={getIcon} getPriorityColor={getPriorityColor} />
                        ))}
                      </>
                    )}
                  </>
                );
              })()}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Email/Chat Popup — открывается для любого уведомления */}
      {selectedEmailNotification && (
        <ThreadChatPopup
          notification={selectedEmailNotification}
          onClose={() => setSelectedEmailNotification(null)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  bellBtn: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(6,182,212,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIcon: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#0a0f1e',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  panel: {
    backgroundColor: '#111827',
    borderRadius: 20,
    width: '100%',
    maxWidth: 520,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 13,
    color: '#e5e7eb',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  markAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(6,182,212,0.15)',
    borderRadius: 8,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#06b6d4',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    color: '#e5e7eb',
  },
  list: {
    flex: 1,
  },
  empty: {
    padding: 60,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#e5e7eb',
  },
  notifItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    borderLeftWidth: 3,
  },
  notifItemUnread: {
    backgroundColor: 'rgba(6,182,212,0.05)',
  },
  notifItemCritical: {
    backgroundColor: 'rgba(220,38,38,0.08)',
  },
  criticalBadge: {
    paddingHorizontal: 6, paddingVertical: 2,
    backgroundColor: 'rgba(220,38,38,0.2)', borderRadius: 6,
  },
  criticalBadgeText: { fontSize: 10, fontWeight: '800', color: '#dc2626' },
  readCheck: { fontSize: 11, color: '#475569', fontWeight: '700' },
  sortTabs: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  sortTab: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    flexDirection: 'row' as any, justifyContent: 'center' as any, gap: 4,
  },
  sortTabActive: {
    borderBottomWidth: 2, borderBottomColor: '#06b6d4',
  },
  sortTabText: { fontSize: 11, color: '#475569', fontWeight: '600' },
  sortTabTextActive: { color: '#06b6d4' },
  groupHeader: {
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(239,68,68,0.15)',
  },
  groupHeaderDone: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  groupHeaderText: { fontSize: 11, fontWeight: '800', color: '#ef4444', textTransform: 'uppercase' as any, letterSpacing: 0.5 },
  criticalHeader: {
    padding: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(239,68,68,0.18)',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239,68,68,0.3)',
    marginBottom: 2,
  },
  criticalHeaderText: { fontSize: 12, fontWeight: '900', color: '#ef4444', letterSpacing: 0.5 },
  tabBadge: {
    marginLeft: 6, paddingHorizontal: 6, paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10,
  },
  tabBadgeRed: { backgroundColor: 'rgba(239,68,68,0.3)' },
  tabBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  moreRow: { padding: 12, alignItems: 'center' },
  moreText: { fontSize: 11, color: '#475569', fontWeight: '600' },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  notifIcon: {
    fontSize: 18,
  },
  notifTime: {
    fontSize: 11,
    color: '#9ca3af',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#06b6d4',
  },
  notifFrom: {
    fontSize: 13,
    fontWeight: '600',
    color: '#06b6d4',
    marginBottom: 4,
  },
  notifSubject: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  notifMessage: {
    fontSize: 13,
    color: '#e5e7eb',
    lineHeight: 18,
  },
  actionBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(251,191,36,0.15)',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  actionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fbbf24',
  },
  priorityBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

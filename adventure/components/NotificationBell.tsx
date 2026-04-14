import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { useGameStore, Notification, formatGameTime } from '../store/gameStore';
import BrokerCommunicationModal from './BrokerCommunicationModal';
import DriverCommunicationModal from './DriverCommunicationModal';

interface Props {
  onNavigateToTrucks?: () => void;
  onNavigateToLoads?: () => void;
  onNavigateToEvents?: () => void;
}

export default function NotificationBell({ onNavigateToTrucks, onNavigateToLoads, onNavigateToEvents }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBrokerNotification, setSelectedBrokerNotification] = useState<Notification | null>(null);
  const [selectedDriverNotification, setSelectedDriverNotification] = useState<Notification | null>(null);
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, selectTruck, trucks } = useGameStore();

  const handleNotificationClick = (notif: Notification) => {
    markNotificationRead(notif.id);
    
    // Для определенных типов уведомлений открываем модалку связи с брокером
    if (notif.type === 'pod_ready' || notif.type === 'detention' || notif.type === 'rate_con') {
      setSelectedBrokerNotification(notif);
      setIsOpen(false);
      return;
    }
    
    // Для голосовых сообщений и текстов от водителей открываем модалку связи с водителем
    if (notif.type === 'voicemail' || notif.type === 'text') {
      setSelectedDriverNotification(notif);
      setIsOpen(false);
      return;
    }
    
    // Выполняем действие в зависимости от типа уведомления
    switch (notif.type) {
      case 'missed_call':
        // Открываем Load Board для поиска грузов
        setIsOpen(false);
        onNavigateToLoads?.();
        break;
        
      case 'urgent':
        // Открываем События
        setIsOpen(false);
        onNavigateToEvents?.();
        break;
        
      case 'email':
        // Открываем Почту (email tab)
        setIsOpen(false);
        onNavigateToLoads?.();
        break;
        
      default:
        // Просто закрываем уведомление
        break;
    }
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

            {/* Notifications List */}
            <ScrollView style={styles.list}>
              {notifications.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyIcon}>📭</Text>
                  <Text style={styles.emptyText}>Нет уведомлений</Text>
                </View>
              ) : (
                notifications.map(notif => (
                  <TouchableOpacity
                    key={notif.id}
                    style={[
                      styles.notifItem,
                      !notif.read && styles.notifItemUnread,
                      { borderLeftColor: getPriorityColor(notif.priority) }
                    ]}
                    onPress={() => handleNotificationClick(notif)}
                    activeOpacity={0.7}
                  >
                    {/* Icon & Time */}
                    <View style={styles.notifHeader}>
                      <Text style={styles.notifIcon}>{getIcon(notif.type)}</Text>
                      <Text style={styles.notifTime}>{formatGameTime(notif.minute)}</Text>
                      {!notif.read && <View style={styles.unreadDot} />}
                    </View>

                    {/* From */}
                    <Text style={styles.notifFrom}>{notif.from}</Text>

                    {/* Subject */}
                    <Text style={styles.notifSubject}>{notif.subject}</Text>

                    {/* Message */}
                    <Text style={styles.notifMessage} numberOfLines={2}>{notif.message}</Text>

                    {/* Action Required Badge */}
                    {notif.actionRequired && (
                      <View style={styles.actionBadge}>
                        <Text style={styles.actionBadgeText}>⚡ Нажми для действия</Text>
                      </View>
                    )}

                    {/* Priority Badge */}
                    {notif.priority === 'critical' && (
                      <View style={[styles.priorityBadge, { backgroundColor: 'rgba(220,38,38,0.15)' }]}>
                        <Text style={[styles.priorityText, { color: '#dc2626' }]}>🚨 СРОЧНО</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Broker Communication Modal */}
      <BrokerCommunicationModal
        notification={selectedBrokerNotification}
        onClose={() => setSelectedBrokerNotification(null)}
      />

      {/* Driver Communication Modal */}
      <DriverCommunicationModal
        notification={selectedDriverNotification}
        onClose={() => setSelectedDriverNotification(null)}
      />
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

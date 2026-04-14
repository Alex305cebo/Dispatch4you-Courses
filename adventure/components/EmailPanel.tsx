import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { useGameStore, Notification } from '../store/gameStore';
import ComposeEmailModal from './ComposeEmailModal';

export default function EmailPanel() {
  const { notifications, markNotificationRead } = useGameStore();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedEmail, setSelectedEmail] = useState<Notification | null>(null);
  const [composeModalVisible, setComposeModalVisible] = useState(false);
  const [replyTo, setReplyTo] = useState<Notification | null>(null);

  // Фильтруем только email-типы уведомлений
  const emails = notifications.filter(n => 
    n.type === 'email' || 
    n.type === 'pod_ready' || 
    n.type === 'rate_con' || 
    n.type === 'detention'
  );

  const filteredEmails = filter === 'unread' ? emails.filter(e => !e.read) : emails;
  const unreadCount = emails.filter(e => !e.read).length;

  const handleEmailClick = (email: Notification) => {
    markNotificationRead(email.id);
    setSelectedEmail(email);
  };

  const handleReply = () => {
    if (selectedEmail) {
      setReplyTo(selectedEmail);
      setComposeModalVisible(true);
      setSelectedEmail(null);
    }
  };

  const handleCompose = () => {
    setReplyTo(null);
    setComposeModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📧 Почта</Text>
          <Text style={styles.headerSub}>{unreadCount} непрочитанных</Text>
        </View>
        <TouchableOpacity style={styles.composeBtn} onPress={handleCompose}>
          <Text style={styles.composeBtnText}>✉️ Написать</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Все ({emails.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'unread' && styles.filterBtnActive]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>
            Непрочитанные ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Email List or Detail View */}
      {selectedEmail ? (
        // Email Detail View
        <ScrollView style={styles.emailDetail}>
          <View style={styles.emailDetailHeader}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setSelectedEmail(null)}
            >
              <Text style={styles.backBtnText}>← Назад</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.replyBtn}
              onPress={handleReply}
            >
              <Text style={styles.replyBtnText}>↩️ Ответить</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.emailDetailContent}>
            <View style={styles.emailDetailMeta}>
              <Text style={styles.emailDetailIcon}>📧</Text>
              <View style={styles.emailDetailInfo}>
                <Text style={styles.emailDetailFrom}>{selectedEmail.from}</Text>
                <Text style={styles.emailDetailTime}>
                  {new Date(selectedEmail.minute * 60000).toLocaleString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>

            <Text style={styles.emailDetailSubject}>{selectedEmail.subject}</Text>
            
            <View style={styles.emailDetailBody}>
              <Text style={styles.emailDetailBodyText}>{selectedEmail.message}</Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        // Email List
        <ScrollView style={styles.emailList}>
        {filteredEmails.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Нет писем</Text>
            <Text style={styles.emptySub}>
              {filter === 'unread' ? 'Все письма прочитаны' : 'Почтовый ящик пуст'}
            </Text>
          </View>
        ) : (
          filteredEmails.map(email => (
            <TouchableOpacity
              key={email.id}
              style={[
                styles.emailCard,
                !email.read && styles.emailCardUnread,
              ]}
              onPress={() => handleEmailClick(email)}
              activeOpacity={0.7}
            >
              <View style={styles.emailHeader}>
                <Text style={styles.emailIcon}>📧</Text>
                <View style={styles.emailHeaderInfo}>
                  <Text style={styles.emailFrom}>{email.from}</Text>
                  <Text style={styles.emailTime}>
                    {new Date(email.minute * 60000).toLocaleTimeString('ru-RU', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </View>
                {!email.read && <View style={styles.unreadDot} />}
              </View>

              <Text style={styles.emailSubject} numberOfLines={1}>
                {email.subject}
              </Text>

              <Text style={styles.emailPreview} numberOfLines={2}>
                {email.message}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      )}

      {/* Compose Email Modal */}
      <ComposeEmailModal
        visible={composeModalVisible}
        onClose={() => {
          setComposeModalVisible(false);
          setReplyTo(null);
        }}
        replyTo={replyTo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
  },
  headerSub: {
    fontSize: 11,
    color: Colors.textDim,
    marginTop: 2,
  },
  composeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },
  composeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  filters: {
    flexDirection: 'row',
    padding: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: 'rgba(6,182,212,0.15)',
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  filterTextActive: {
    color: Colors.primary,
  },
  emailList: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textDim,
    textAlign: 'center',
  },
  emailCard: {
    padding: 14,
    marginHorizontal: 10,
    marginVertical: 6,
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  emailCardUnread: {
    backgroundColor: 'rgba(6,182,212,0.05)',
    borderColor: 'rgba(6,182,212,0.2)',
  },
  emailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emailIcon: {
    fontSize: 20,
  },
  emailHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emailFrom: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  emailTime: {
    fontSize: 10,
    color: Colors.textDim,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  emailSubject: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  emailPreview: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
  },
  emailDetail: {
    flex: 1,
  },
  emailDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: Colors.bgCard,
    borderRadius: 8,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  replyBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  replyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  emailDetailContent: {
    padding: 16,
  },
  emailDetailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  emailDetailIcon: {
    fontSize: 32,
  },
  emailDetailInfo: {
    flex: 1,
  },
  emailDetailFrom: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  emailDetailTime: {
    fontSize: 12,
    color: Colors.textDim,
  },
  emailDetailSubject: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  emailDetailBody: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 16,
  },
  emailDetailBodyText: {
    fontSize: 14,
    color: '#e5e7eb',
    lineHeight: 22,
  },
});

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { useGameStore, Notification } from '../store/gameStore';

interface Props {
  notification: Notification | null;
  onClose: () => void;
}

type ActionType = 'email' | 'call' | 'detention';

export default function BrokerCommunicationModal({ notification, onClose }: Props) {
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { addMoney, brokers } = useGameStore();

  if (!notification) return null;

  // Определяем брокера из уведомления
  const brokerName = notification.from.split(' ')[0];
  const broker = brokers.find(b => b.name === brokerName);

  // Предзаполненные шаблоны
  const getEmailTemplate = (type: Notification['type']) => {
    switch (type) {
      case 'pod_ready':
        return {
          subject: 'POD for Load #L123',
          body: 'Hi,\n\nAttached is the signed POD for load #L123.\nPlease process payment at your earliest convenience.\n\nThank you!'
        };
      case 'detention':
        return {
          subject: 'Detention Request - Load #L123',
          body: 'Hi,\n\nOur driver has been waiting at the facility for over 2 hours.\nPer our agreement, we are requesting detention payment.\n\nArrival time: 10:00 AM\nLoading completed: 1:30 PM\nTotal detention: 3.5 hours\n\nPlease confirm.'
        };
      case 'rate_con':
        return {
          subject: 'Rate Con Signed - Load #L123',
          body: 'Hi,\n\nRate Con has been signed and returned.\nDriver is en route to pickup.\n\nETA: Tomorrow 8:00 AM\n\nThank you!'
        };
      default:
        return {
          subject: 'Re: ' + notification.subject,
          body: 'Hi,\n\n'
        };
    }
  };

  const handleSelectAction = (action: ActionType) => {
    setSelectedAction(action);
    if (action === 'email') {
      const template = getEmailTemplate(notification.type);
      setEmailSubject(template.subject);
      setEmailBody(template.body);
    }
  };

  const handleSendEmail = () => {
    setIsSending(true);
    setTimeout(() => {
      // Симуляция отправки email
      if (notification.type === 'detention') {
        // Получаем detention payment
        addMoney(150, 'Detention payment received');
      } else if (notification.type === 'pod_ready') {
        // Факторинговая компания выплачивает сразу после отправки POD (комиссия 3%)
        const loadRate = notification.relatedLoadId ? 1500 : 1000; // примерная ставка
        const factoringFee = Math.round(loadRate * 0.03);
        const netPayout = loadRate - factoringFee;
        addMoney(netPayout, `Факторинг: оплата за груз (минус 3% комиссия $${factoringFee})`);
      }
      
      setIsSending(false);
      onClose();
    }, 1500);
  };

  const handleCall = () => {
    setIsSending(true);
    setTimeout(() => {
      // Симуляция звонка
      if (notification.type === 'detention') {
        addMoney(200, 'Detention negotiated via call');
      }
      setIsSending(false);
      onClose();
    }, 2000);
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>📞 Связь с брокером</Text>
              <Text style={styles.subtitle}>{notification.from}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Notification Info */}
          <View style={styles.notifCard}>
            <Text style={styles.notifSubject}>{notification.subject}</Text>
            <Text style={styles.notifMessage}>{notification.message}</Text>
          </View>

          {!selectedAction ? (
            // Action Selection
            <View style={styles.actions}>
              <Text style={styles.actionsTitle}>Выбери действие:</Text>
              
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleSelectAction('email')}
              >
                <Text style={styles.actionIcon}>📧</Text>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Отправить Email</Text>
                  <Text style={styles.actionDesc}>Написать письмо брокеру</Text>
                </View>
                <Text style={styles.actionArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleSelectAction('call')}
              >
                <Text style={styles.actionIcon}>📞</Text>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Позвонить</Text>
                  <Text style={styles.actionDesc}>Быстрое решение вопроса</Text>
                </View>
                <Text style={styles.actionArrow}>›</Text>
              </TouchableOpacity>

              {notification.type === 'detention' && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnHighlight]}
                  onPress={() => handleSelectAction('detention')}
                >
                  <Text style={styles.actionIcon}>⏱️</Text>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>Запросить Detention</Text>
                    <Text style={styles.actionDesc}>Оплата за ожидание</Text>
                  </View>
                  <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : selectedAction === 'email' ? (
            // Email Form
            <ScrollView style={styles.emailForm}>
              <Text style={styles.label}>Тема:</Text>
              <TextInput
                style={styles.input}
                value={emailSubject}
                onChangeText={setEmailSubject}
                placeholder="Тема письма"
                placeholderTextColor={Colors.textDim}
              />

              <Text style={styles.label}>Сообщение:</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={emailBody}
                onChangeText={setEmailBody}
                placeholder="Текст письма"
                placeholderTextColor={Colors.textDim}
                multiline
                numberOfLines={8}
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setSelectedAction(null)}
                >
                  <Text style={styles.backBtnText}>← Назад</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sendBtn, isSending && styles.sendBtnDisabled]}
                  onPress={handleSendEmail}
                  disabled={isSending}
                >
                  <Text style={styles.sendBtnText}>
                    {isSending ? '📤 Отправка...' : '📧 Отправить'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : selectedAction === 'call' ? (
            // Call Screen
            <View style={styles.callScreen}>
              <Text style={styles.callIcon}>📞</Text>
              <Text style={styles.callText}>Звоним {brokerName}...</Text>
              <Text style={styles.callSubtext}>{broker?.company || 'Broker Company'}</Text>
              
              {isSending ? (
                <View style={styles.callProgress}>
                  <Text style={styles.callProgressText}>Соединение...</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={handleCall}
                >
                  <Text style={styles.callBtnText}>☎️ Позвонить</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setSelectedAction(null)}
              >
                <Text style={styles.backBtnText}>← Назад</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Detention Request
            <View style={styles.detentionScreen}>
              <Text style={styles.detentionIcon}>⏱️</Text>
              <Text style={styles.detentionTitle}>Запрос Detention</Text>
              <Text style={styles.detentionText}>
                Водитель ожидает на погрузке более 2 часов.{'\n'}
                Стандартная ставка: $50/час после 2 часов.
              </Text>

              <View style={styles.detentionCalc}>
                <Text style={styles.detentionCalcLabel}>Время ожидания:</Text>
                <Text style={styles.detentionCalcValue}>3.5 часа</Text>
                <Text style={styles.detentionCalcLabel}>Сумма к оплате:</Text>
                <Text style={styles.detentionCalcValue}>$150</Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setSelectedAction(null)}
                >
                  <Text style={styles.backBtnText}>← Назад</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sendBtn, isSending && styles.sendBtnDisabled]}
                  onPress={handleSendEmail}
                  disabled={isSending}
                >
                  <Text style={styles.sendBtnText}>
                    {isSending ? '📤 Отправка...' : '📧 Отправить запрос'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#111827',
    borderRadius: 20,
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 13,
    color: '#06b6d4',
    marginTop: 4,
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
  notifCard: {
    margin: 16,
    padding: 14,
    backgroundColor: 'rgba(6,182,212,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.2)',
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
  actions: {
    padding: 16,
    gap: 12,
  },
  actionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 12,
  },
  actionBtnHighlight: {
    backgroundColor: 'rgba(251,191,36,0.1)',
    borderColor: 'rgba(251,191,36,0.3)',
  },
  actionIcon: {
    fontSize: 28,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 12,
    color: '#9ca3af',
  },
  actionArrow: {
    fontSize: 24,
    color: '#06b6d4',
  },
  emailForm: {
    padding: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 16,
  },
  inputMultiline: {
    height: 160,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  backBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  sendBtn: {
    flex: 2,
    padding: 14,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.bgCard,
    opacity: 0.5,
  },
  sendBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  callScreen: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  callIcon: {
    fontSize: 64,
  },
  callText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  callSubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  callProgress: {
    padding: 20,
  },
  callProgressText: {
    fontSize: 14,
    color: '#06b6d4',
  },
  callBtn: {
    backgroundColor: Colors.success,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 50,
    marginTop: 20,
  },
  callBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  detentionScreen: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  detentionIcon: {
    fontSize: 48,
  },
  detentionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  detentionText: {
    fontSize: 13,
    color: '#e5e7eb',
    textAlign: 'center',
    lineHeight: 20,
  },
  detentionCalc: {
    width: '100%',
    backgroundColor: 'rgba(251,191,36,0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  detentionCalcLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  detentionCalcValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fbbf24',
    marginBottom: 12,
  },
});

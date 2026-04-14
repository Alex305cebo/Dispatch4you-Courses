import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { Colors } from '../constants/colors';
import { useGameStore, Notification } from '../store/gameStore';

interface Props {
  notification: Notification | null;
  onClose: () => void;
}

export default function DriverCommunicationModal({ notification, onClose }: Props) {
  const { addNotification, addMoney, trucks } = useGameStore();
  const [action, setAction] = useState<'listen' | 'call' | 'text' | null>(null);
  const [textMessage, setTextMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!notification) return null;

  // Находим трак водителя
  const driverName = notification.from.split(' ')[0];
  const truck = trucks.find(t => t.driver.includes(driverName));

  const handleListen = () => {
    setAction('listen');
    setIsProcessing(true);

    // Симулируем прослушивание голосового сообщения
    setTimeout(() => {
      setIsProcessing(false);
      
      // Добавляем уведомление что сообщение прослушано
      addNotification({
        type: 'text',
        from: 'System',
        subject: 'Голосовое сообщение прослушано',
        message: `Вы прослушали сообщение от ${notification.from}`,
        priority: 'low',
        actionRequired: false,
      });

      // Небольшая награда за быструю реакцию
      addMoney(10, 'Быстрая реакция на сообщение водителя');
      
      onClose();
    }, 2000);
  };

  const handleCall = () => {
    setAction('call');
    setIsProcessing(true);

    // Симулируем звонок водителю
    setTimeout(() => {
      setIsProcessing(false);
      
      const responses = [
        'Водитель подтвердил, что всё в порядке. Едет по графику.',
        'Водитель сообщил о небольшой задержке на 30 минут из-за пробки.',
        'Водитель подтвердил получение инструкций.',
        'Водитель запросил дополнительную информацию о месте разгрузки.',
        'Водитель сообщил, что прибудет раньше срока.',
      ];

      addNotification({
        type: 'text',
        from: notification.from,
        subject: 'Звонок завершён',
        message: responses[Math.floor(Math.random() * responses.length)],
        priority: 'low',
        actionRequired: false,
      });

      // Награда за звонок
      addMoney(25, 'Звонок водителю');
      
      onClose();
    }, 3000);
  };

  const handleSendText = () => {
    if (!textMessage.trim()) return;

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      
      // Добавляем отправленное сообщение
      addNotification({
        type: 'text',
        from: `You → ${notification.from}`,
        subject: 'SMS отправлено',
        message: textMessage,
        priority: 'low',
        actionRequired: false,
      });

      // Симулируем ответ водителя
      setTimeout(() => {
        const responses = [
          'Понял, спасибо!',
          'Ок, буду на связи.',
          'Получил, выполняю.',
          'Спасибо за информацию.',
          'Всё ясно, еду.',
        ];

        addNotification({
          type: 'text',
          from: notification.from,
          subject: 'Re: SMS',
          message: responses[Math.floor(Math.random() * responses.length)],
          priority: 'low',
          actionRequired: false,
        });
      }, 5000);

      addMoney(15, 'SMS водителю');
      setTextMessage('');
      onClose();
    }, 1500);
  };

  const quickMessages = [
    'Подтверди получение груза',
    'Какой ETA до доставки?',
    'Всё в порядке?',
    'Позвони когда освободишься',
    'Проверь температуру рефрижератора',
    'Отправь фото BOL',
  ];

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.modal}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>💬 Связь с водителем</Text>
              <Text style={styles.subtitle}>{notification.from}</Text>
              {truck && (
                <Text style={styles.truckInfo}>🚛 {truck.name} · {truck.currentCity}</Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Original Message */}
            <View style={styles.messageCard}>
              <View style={styles.messageHeader}>
                <Text style={styles.messageIcon}>
                  {notification.type === 'voicemail' ? '🎙️' : '💬'}
                </Text>
                <Text style={styles.messageTitle}>{notification.subject}</Text>
              </View>
              <Text style={styles.messageText}>{notification.message}</Text>
            </View>

            {/* Actions */}
            {!action && (
              <View style={styles.actions}>
                {notification.type === 'voicemail' && (
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.actionBtnPrimary]}
                    onPress={handleListen}
                  >
                    <Text style={styles.actionBtnIcon}>🎧</Text>
                    <Text style={styles.actionBtnText}>Прослушать</Text>
                    <Text style={styles.actionBtnReward}>+$10</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  style={[styles.actionBtn, styles.actionBtnSuccess]}
                  onPress={handleCall}
                >
                  <Text style={styles.actionBtnIcon}>📞</Text>
                  <Text style={styles.actionBtnText}>Позвонить</Text>
                  <Text style={styles.actionBtnReward}>+$25</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionBtn, styles.actionBtnInfo]}
                  onPress={() => setAction('text')}
                >
                  <Text style={styles.actionBtnIcon}>💬</Text>
                  <Text style={styles.actionBtnText}>Отправить SMS</Text>
                  <Text style={styles.actionBtnReward}>+$15</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Processing State */}
            {isProcessing && (
              <View style={styles.processing}>
                <Text style={styles.processingIcon}>⏳</Text>
                <Text style={styles.processingText}>
                  {action === 'listen' && 'Прослушивание сообщения...'}
                  {action === 'call' && 'Звонок водителю...'}
                  {action === 'text' && 'Отправка SMS...'}
                </Text>
              </View>
            )}

            {/* Text Message Form */}
            {action === 'text' && !isProcessing && (
              <View style={styles.textForm}>
                <Text style={styles.textFormLabel}>Быстрые сообщения:</Text>
                <View style={styles.quickMessages}>
                  {quickMessages.map((msg, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.quickMessageBtn}
                      onPress={() => setTextMessage(msg)}
                    >
                      <Text style={styles.quickMessageText}>{msg}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.textFormLabel}>Или напишите своё:</Text>
                <TextInput
                  style={styles.textInput}
                  value={textMessage}
                  onChangeText={setTextMessage}
                  placeholder="Напишите сообщение..."
                  placeholderTextColor={Colors.textDim}
                  multiline
                  numberOfLines={4}
                />

                <View style={styles.textFormActions}>
                  <TouchableOpacity 
                    style={styles.textCancelBtn}
                    onPress={() => {
                      setAction(null);
                      setTextMessage('');
                    }}
                  >
                    <Text style={styles.textCancelBtnText}>Отмена</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.textSendBtn,
                      !textMessage.trim() && styles.textSendBtnDisabled
                    ]}
                    onPress={handleSendText}
                    disabled={!textMessage.trim()}
                  >
                    <Text style={styles.textSendBtnText}>📤 Отправить</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
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
    backgroundColor: Colors.bg,
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 4,
    fontWeight: '600',
  },
  truckInfo: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    color: Colors.textMuted,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  messageCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  messageIcon: {
    fontSize: 24,
  },
  messageTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  messageText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  actions: {
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  actionBtnPrimary: {
    backgroundColor: 'rgba(6,182,212,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
  },
  actionBtnSuccess: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  actionBtnInfo: {
    backgroundColor: 'rgba(251,191,36,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
  },
  actionBtnIcon: {
    fontSize: 24,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  actionBtnReward: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.success,
  },
  processing: {
    alignItems: 'center',
    padding: 40,
  },
  processingIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  processingText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  textForm: {
    gap: 12,
  },
  textFormLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  quickMessages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickMessageBtn: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  quickMessageText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#fff',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  textFormActions: {
    flexDirection: 'row',
    gap: 10,
  },
  textCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors.bgCard,
    borderRadius: 10,
    alignItems: 'center',
  },
  textCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  textSendBtn: {
    flex: 2,
    paddingVertical: 14,
    backgroundColor: Colors.success,
    borderRadius: 10,
    alignItems: 'center',
  },
  textSendBtnDisabled: {
    backgroundColor: Colors.bgCardHover,
    opacity: 0.5,
  },
  textSendBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
});

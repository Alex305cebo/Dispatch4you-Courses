import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated } from 'react-native';
import { Colors } from '../constants/colors';
import { useGameStore, Notification } from '../store/gameStore';

interface Props {
  visible: boolean;
  notification: Notification | null;
  onClose: () => void;
  onNegotiate?: () => void;
}

export default function CallModal({ visible, notification, onClose, onNegotiate }: Props) {
  const { markNotificationRead, addNotification, brokers } = useGameStore();
  const [called, setCalled] = useState(false);
  const [ignored, setIgnored] = useState(false);

  if (!notification) return null;

  const brokerName = notification.from.split(' - ')[0] || notification.from;
  const brokerCompany = notification.from.split(' - ')[1] || '';
  const broker = brokers.find(b => b.name === brokerName);

  function handleCallback() {
    setCalled(true);
    markNotificationRead(notification!.id);

    // Брокер отвечает — добавляем email с предложением
    setTimeout(() => {
      addNotification({
        type: 'email',
        priority: 'high',
        from: notification!.from,
        subject: `Re: Перезвонил — есть груз для тебя`,
        message: `Привет! Рад что перезвонил.\n\nЕсть хороший груз — проверь Load Board, я только что выложил. Ставка хорошая, давай обсудим.\n\nЖду!\n${brokerName}`,
        actionRequired: false,
      });
      onClose();
    }, 1500);
  }

  function handleIgnore() {
    setIgnored(true);
    markNotificationRead(notification!.id);

    // Репутация с брокером падает
    addNotification({
      type: 'email',
      priority: 'low',
      from: notification!.from,
      subject: 'Не дозвонился...',
      message: `Привет, пытался дозвониться несколько раз — не берёшь трубку.\n\nЕсли будешь свободен — напиши, есть груз.\n\n${brokerName}`,
      actionRequired: false,
    });

    setTimeout(() => onClose(), 800);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>

          {/* Звонящий */}
          <View style={styles.callerWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{broker?.avatar || '📞'}</Text>
            </View>
            <Text style={styles.callerName}>{brokerName}</Text>
            {brokerCompany ? <Text style={styles.callerCompany}>{brokerCompany}</Text> : null}
            <View style={styles.missedBadge}>
              <Text style={styles.missedText}>📵 Пропущенный звонок</Text>
            </View>
          </View>

          {/* Сообщение */}
          <View style={styles.messageWrap}>
            <Text style={styles.message}>{notification.message}</Text>
          </View>

          {/* Кнопки */}
          {!called && !ignored ? (
            <View style={styles.btns}>
              <TouchableOpacity style={styles.ignoreBtn} onPress={handleIgnore}>
                <Text style={styles.ignoreBtnText}>🚫 Игнорировать</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.callBtn} onPress={handleCallback}>
                <Text style={styles.callBtnText}>📞 Перезвонить</Text>
              </TouchableOpacity>
            </View>
          ) : called ? (
            <View style={styles.calledWrap}>
              <Text style={styles.calledText}>✅ Перезвонил! Брокер ответил — проверь почту.</Text>
            </View>
          ) : (
            <View style={styles.calledWrap}>
              <Text style={[styles.calledText, { color: Colors.danger }]}>❌ Проигнорировано. Репутация упала.</Text>
            </View>
          )}

          {/* Закрыть */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Закрыть</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modal: {
    backgroundColor: '#080e1c', borderRadius: 24,
    borderWidth: 1, borderColor: '#1e2d45',
    width: '100%', maxWidth: 360, padding: 24, alignItems: 'center',
    shadowColor: '#06b6d4', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 24, elevation: 20,
  },
  callerWrap: { alignItems: 'center', marginBottom: 20 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(6,182,212,0.15)',
    borderWidth: 2, borderColor: 'rgba(6,182,212,0.4)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 36 },
  callerName: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 4 },
  callerCompany: { fontSize: 13, color: Colors.textMuted, marginBottom: 10 },
  missedBadge: {
    paddingHorizontal: 12, paddingVertical: 4,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
  },
  missedText: { fontSize: 12, color: '#ef4444', fontWeight: '700' },
  messageWrap: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12, borderWidth: 1, borderColor: '#1e2d45',
    padding: 14, width: '100%', marginBottom: 20,
  },
  message: { fontSize: 13, color: Colors.textMuted, lineHeight: 20, textAlign: 'center' },
  btns: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 12 },
  ignoreBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
    alignItems: 'center',
  },
  ignoreBtnText: { fontSize: 13, fontWeight: '700', color: '#ef4444' },
  callBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: '#22c55e', alignItems: 'center',
  },
  callBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  calledWrap: {
    padding: 14, borderRadius: 12,
    backgroundColor: 'rgba(34,197,94,0.08)',
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)',
    width: '100%', marginBottom: 12, alignItems: 'center',
  },
  calledText: { fontSize: 13, color: '#4ade80', fontWeight: '700', textAlign: 'center' },
  closeBtn: {
    paddingVertical: 10, paddingHorizontal: 24,
    borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: '#1e2d45',
  },
  closeBtnText: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },
});

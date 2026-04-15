import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { useGameStore, Notification } from '../store/gameStore';

interface Props {
  notification: Notification | null;
  onClose: () => void;
}

// Варианты ответов зависят от темы сообщения
function getResponses(notification: Notification, driverName: string) {
  const msg = (notification.message + ' ' + notification.subject).toLowerCase();

  if (msg.includes('задержк') || msg.includes('delay') || msg.includes('погрузк')) {
    return [
      {
        text: 'Жди — фиксируй время. Если больше 2 часов — detention.',
        icon: '⏰',
        outcome: 'Водитель ждёт. Detention clock запущен.',
        moneyDelta: 0,
        mood: 0,
        isCorrect: true,
      },
      {
        text: 'Уезжай — найдём другой груз.',
        icon: '🚛',
        outcome: 'Груз отменён. TONU fee $150.',
        moneyDelta: -150,
        mood: -10,
        isCorrect: false,
      },
      {
        text: 'Позвони брокеру и сообщи о задержке.',
        icon: '📞',
        outcome: 'Брокер в курсе. Репутация +2.',
        moneyDelta: 0,
        mood: 5,
        isCorrect: true,
      },
    ];
  }

  if (msg.includes('поломк') || msg.includes('breakdown') || msg.includes('сломал')) {
    return [
      {
        text: 'Вызови техпомощь. Сообщи брокеру о задержке.',
        icon: '🔧',
        outcome: 'Техпомощь вызвана. Задержка ~3 часа. Брокер уведомлён.',
        moneyDelta: -200,
        mood: 0,
        isCorrect: true,
      },
      {
        text: 'Попробуй починить сам.',
        icon: '🛠️',
        outcome: 'Водитель потратил 2 часа. Не починил. Всё равно вызвал техпомощь.',
        moneyDelta: -350,
        mood: -15,
        isCorrect: false,
      },
      {
        text: 'Найди другой трак для перегрузки.',
        icon: '🔄',
        outcome: 'Перегрузка организована. Доп. расходы $300.',
        moneyDelta: -300,
        mood: 5,
        isCorrect: false,
      },
    ];
  }

  if (msg.includes('detention') || msg.includes('ждёт') || msg.includes('ждет')) {
    return [
      {
        text: 'Требуй detention у брокера — $50/час после 2 часов.',
        icon: '💰',
        outcome: 'Detention claim отправлен брокеру. Ожидай подтверждения.',
        moneyDelta: 100,
        mood: 5,
        isCorrect: true,
      },
      {
        text: 'Скажи водителю ждать без detention.',
        icon: '😐',
        outcome: 'Водитель недоволен. Настроение -10.',
        moneyDelta: 0,
        mood: -10,
        isCorrect: false,
      },
      {
        text: 'Уточни у водителя точное время прибытия.',
        icon: '🕐',
        outcome: 'Водитель прислал BOL с временем. Detention подтверждён.',
        moneyDelta: 75,
        mood: 0,
        isCorrect: true,
      },
    ];
  }

  if (msg.includes('pod') || msg.includes('разгрузил') || msg.includes('доставил')) {
    return [
      {
        text: 'Отлично! Попроси POD и отправь брокеру.',
        icon: '📄',
        outcome: 'POD получен. Инвойс выставлен. Оплата через 30 дней.',
        moneyDelta: 50,
        mood: 10,
        isCorrect: true,
      },
      {
        text: 'Найди следующий груз для этого трака.',
        icon: '📋',
        outcome: 'Водитель ждёт следующего груза. POD не отправлен — штраф.',
        moneyDelta: -50,
        mood: 0,
        isCorrect: false,
      },
      {
        text: 'Скажи водителю отдохнуть — он заслужил.',
        icon: '😴',
        outcome: 'Водитель доволен. Настроение +15. Трак простаивает 2 часа.',
        moneyDelta: 0,
        mood: 15,
        isCorrect: false,
      },
    ];
  }

  // Дефолтные варианты
  return [
    {
      text: 'Понял, продолжай по плану.',
      icon: '✅',
      outcome: 'Водитель продолжает маршрут.',
      moneyDelta: 0,
      mood: 5,
      isCorrect: true,
    },
    {
      text: 'Уточни детали — позвони мне.',
      icon: '📞',
      outcome: 'Водитель перезвонил. Ситуация прояснилась.',
      moneyDelta: 0,
      mood: 5,
      isCorrect: true,
    },
    {
      text: 'Игнорировать — разберётся сам.',
      icon: '🙈',
      outcome: 'Водитель недоволен. Настроение -10.',
      moneyDelta: 0,
      mood: -10,
      isCorrect: false,
    },
  ];
}

export default function DriverCommunicationModal({ notification, onClose }: Props) {
  const { addNotification, addMoney, trucks } = useGameStore();
  const [chosen, setChosen] = useState<number | null>(null);

  if (!notification) return null;

  const driverName = notification.from.split(' ')[0];
  const truck = trucks.find(t => t.driver.includes(driverName));
  const responses = getResponses(notification, driverName);
  const result = chosen !== null ? responses[chosen] : null;

  function handleChoose(idx: number) {
    if (chosen !== null) return;
    setChosen(idx);
    const r = responses[idx];
    if (r.moneyDelta > 0) addMoney(r.moneyDelta, `Решение: ${r.text.slice(0, 30)}`);
    if (r.moneyDelta < 0) {
      const { removeMoney } = useGameStore.getState();
      removeMoney(Math.abs(r.moneyDelta), `Решение: ${r.text.slice(0, 30)}`);
    }
    addNotification({
      type: 'text',
      from: notification?.from ?? '',
      subject: `Re: ${notification?.subject ?? ''}`,
      message: r.outcome,
      priority: 'low',
      actionRequired: false,
    });
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={chosen !== null ? onClose : undefined}>
        <TouchableOpacity style={styles.modal} activeOpacity={1} onPress={e => e.stopPropagation()}>

          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>💬 Связь с водителем</Text>
              <Text style={styles.subtitle}>{notification.from}</Text>
              {truck && <Text style={styles.truckInfo}>🚛 {truck.name} · {truck.currentCity}</Text>}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

            {/* Сообщение водителя */}
            <View style={styles.messageCard}>
              <View style={styles.messageHeader}>
                <Text style={styles.messageIcon}>
                  {notification.type === 'voicemail' ? '🎙️' : '💬'}
                </Text>
                <Text style={styles.messageTitle}>{notification.subject}</Text>
              </View>
              <Text style={styles.messageText}>{notification.message}</Text>
            </View>

            {/* Варианты ответа */}
            {chosen === null ? (
              <View style={styles.choicesWrap}>
                <Text style={styles.choicesLabel}>Как ответишь?</Text>
                {responses.map((r, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.choiceBtn}
                    onPress={() => handleChoose(i)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.choiceIcon}>{r.icon}</Text>
                    <Text style={styles.choiceText}>{r.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.resultWrap}>
                <View style={[
                  styles.resultCard,
                  result?.isCorrect ? styles.resultCorrect : styles.resultWrong,
                ]}>
                  <Text style={styles.resultIcon}>{result?.isCorrect ? '✅' : '⚠️'}</Text>
                  <Text style={styles.resultTitle}>
                    {result?.isCorrect ? 'Правильное решение!' : 'Не лучший выбор'}
                  </Text>
                  <Text style={styles.resultOutcome}>{result?.outcome}</Text>
                  {result && result.moneyDelta !== 0 && (
                    <Text style={[
                      styles.resultMoney,
                      { color: result.moneyDelta > 0 ? Colors.success : Colors.danger },
                    ]}>
                      {result.moneyDelta > 0 ? '+' : ''}{result.moneyDelta}$
                    </Text>
                  )}
                  {result && result.mood !== 0 && (
                    <Text style={[
                      styles.resultMood,
                      { color: result.mood > 0 ? Colors.success : Colors.danger },
                    ]}>
                      Настроение водителя: {result.mood > 0 ? '+' : ''}{result.mood}
                    </Text>
                  )}
                </View>
                <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
                  <Text style={styles.doneBtnText}>Готово</Text>
                </TouchableOpacity>
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
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  modal: {
    backgroundColor: Colors.bg, borderRadius: 20,
    width: '100%', maxWidth: 500, maxHeight: '85%',
    borderWidth: 1, borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: 20, fontWeight: '900', color: '#fff' },
  subtitle: { fontSize: 14, color: Colors.primary, marginTop: 4, fontWeight: '600' },
  truckInfo: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.bgCard, justifyContent: 'center', alignItems: 'center',
  },
  closeBtnText: { fontSize: 18, color: Colors.textMuted },
  content: { flex: 1, padding: 16 },

  messageCard: {
    backgroundColor: Colors.bgCard, borderRadius: 12, padding: 14,
    marginBottom: 16, borderLeftWidth: 3, borderLeftColor: Colors.warning,
  },
  messageHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  messageIcon: { fontSize: 22 },
  messageTitle: { fontSize: 14, fontWeight: '700', color: '#fff', flex: 1 },
  messageText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  choicesWrap: { gap: 10 },
  choicesLabel: {
    fontSize: 12, fontWeight: '800', color: Colors.textDim,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
  },
  choiceBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.bgCard, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border,
    padding: 14,
  },
  choiceIcon: { fontSize: 22, flexShrink: 0 },
  choiceText: { flex: 1, fontSize: 14, color: '#fff', fontWeight: '600', lineHeight: 20 },

  resultWrap: { gap: 12 },
  resultCard: {
    borderRadius: 14, padding: 16, gap: 6,
    borderWidth: 1, alignItems: 'center',
  },
  resultCorrect: {
    backgroundColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)',
  },
  resultWrong: {
    backgroundColor: 'rgba(251,191,36,0.1)', borderColor: 'rgba(251,191,36,0.3)',
  },
  resultIcon: { fontSize: 32, marginBottom: 4 },
  resultTitle: { fontSize: 16, fontWeight: '900', color: '#fff' },
  resultOutcome: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  resultMoney: { fontSize: 18, fontWeight: '900', marginTop: 4 },
  resultMood: { fontSize: 13, fontWeight: '700' },
  doneBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  doneBtnText: { fontSize: 15, fontWeight: '900', color: '#fff' },
});

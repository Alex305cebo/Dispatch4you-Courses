import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { useGameStore, GameEvent } from '../store/gameStore';

const URGENCY_COLOR = {
  low: '#94a3b8',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

const URGENCY_LABEL = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  critical: '🚨 КРИТИЧНО',
};

export default function EventsPanel() {
  const { activeEvents, resolvedEvents, selectedEventId, selectEvent, resolveEvent } = useGameStore();

  if (activeEvents.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>✅</Text>
        <Text style={styles.emptyTitle}>Всё спокойно</Text>
        <Text style={styles.emptySub}>Кризисов нет. Следи за траками.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚡ Активные события</Text>
        <Text style={styles.headerSub}>{activeEvents.length} требуют решения</Text>
      </View>

      {activeEvents.map(event => (
        <View key={event.id} style={[styles.eventCard, { borderColor: URGENCY_COLOR[event.urgency] }]}>
          <View style={styles.eventTop}>
            <View style={[styles.urgencyBadge, { backgroundColor: `${URGENCY_COLOR[event.urgency]}22` }]}>
              <Text style={[styles.urgencyText, { color: URGENCY_COLOR[event.urgency] }]}>
                {URGENCY_LABEL[event.urgency]}
              </Text>
            </View>
            <Text style={styles.eventTruck}>Unit {event.truckId}</Text>
          </View>

          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventMsg}>{event.message}</Text>

          <View style={styles.options}>
            {event.options.map(opt => (
              <TouchableOpacity
                key={opt.id}
                style={styles.optBtn}
                onPress={() => resolveEvent(event.id, opt.id)}
              >
                <Text style={styles.optText}>{opt.text}</Text>
                <View style={styles.optOutcome}>
                  {opt.outcome.moneyDelta !== 0 && (
                    <Text style={[styles.optMoney, { color: opt.outcome.moneyDelta > 0 ? Colors.success : Colors.danger }]}>
                      {opt.outcome.moneyDelta > 0 ? '+' : ''}{opt.outcome.moneyDelta.toLocaleString()}$
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 12, gap: 10 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 6 },
  emptySub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4,
  },
  headerTitle: { fontSize: 15, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 11, color: Colors.danger },

  eventCard: {
    backgroundColor: Colors.bgCard, borderRadius: 14,
    borderWidth: 2, padding: 14, gap: 8,
  },
  eventTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  urgencyBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  urgencyText: { fontSize: 10, fontWeight: '800' },
  eventTruck: { fontSize: 11, color: Colors.textDim },

  eventTitle: { fontSize: 15, fontWeight: '800', color: '#fff' },
  eventMsg: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },

  options: { gap: 8 },
  optBtn: {
    backgroundColor: Colors.bg, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
    padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  optText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  optOutcome: { marginLeft: 8 },
  optMoney: { fontSize: 12, fontWeight: '800' },
});

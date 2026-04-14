import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { LoadOffer } from '../store/gameStore';

interface Props {
  load: LoadOffer | null;
  onClose: () => void;
  onAccept?: (targetRate: number) => void;
}

export default function RateAnalysisModal({ load, onClose, onAccept }: Props) {
  if (!load) return null;

  const rpm = load.postedRate / load.miles;
  const marketRate = rpm * 1.25; // рыночная ставка выше на 25%
  const targetRate = load.postedRate * 1.2; // целевая ставка +20%
  const difference = ((rpm - marketRate) / marketRate) * 100;

  // История ставок (mock data)
  const history = [
    { day: 'Пн', rate: 2.3 },
    { day: 'Вт', rate: 2.5 },
    { day: 'Ср', rate: 2.4 },
    { day: 'Чт', rate: 2.6 },
    { day: 'Пт', rate: 2.2 },
    { day: 'Сб', rate: 2.0 },
    { day: 'Вс', rate: rpm },
  ];

  const maxRate = Math.max(...history.map(h => h.rate));

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>💰 Анализ ставки</Text>
                <Text style={styles.route}>{load.fromCity} → {load.toCity}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Current Rate */}
            <View style={styles.currentRate}>
              <Text style={styles.currentLabel}>Предложение брокера</Text>
              <Text style={[styles.currentValue, { color: rpm >= 2.5 ? '#22c55e' : rpm >= 2.0 ? '#f59e0b' : '#ef4444' }]}>
                ${rpm.toFixed(2)}/mi
              </Text>
              <Text style={styles.currentTotal}>${load.postedRate.toLocaleString()} total</Text>
            </View>

            {/* Comparison */}
            <View style={styles.comparison}>
              <View style={styles.compItem}>
                <Text style={styles.compLabel}>Рыночная ставка DAT</Text>
                <Text style={styles.compValue}>${marketRate.toFixed(2)}/mi</Text>
              </View>
              <View style={styles.compItem}>
                <Text style={styles.compLabel}>Твоя цель</Text>
                <Text style={[styles.compValue, { color: Colors.primary }]}>${(targetRate / load.miles).toFixed(2)}/mi</Text>
              </View>
              <View style={styles.compItem}>
                <Text style={styles.compLabel}>Разница с рынком</Text>
                <Text style={[styles.compValue, { color: difference < 0 ? '#ef4444' : '#22c55e' }]}>
                  {difference > 0 ? '+' : ''}{difference.toFixed(0)}%
                </Text>
              </View>
            </View>

            {/* Chart */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 История ставок на этом лейне (7 дней)</Text>
              <View style={styles.chart}>
                {history.map((item, i) => {
                  const height = (item.rate / maxRate) * 100;
                  const isToday = i === history.length - 1;
                  return (
                    <View key={i} style={styles.chartCol}>
                      <View style={styles.chartBarWrap}>
                        <View style={[styles.chartBar, {
                          height: `${height}%`,
                          backgroundColor: isToday ? Colors.primary : 'rgba(148,163,184,0.3)',
                        }]} />
                      </View>
                      <Text style={styles.chartLabel}>{item.day}</Text>
                      <Text style={styles.chartValue}>${item.rate.toFixed(1)}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Market Insights */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📈 Рыночная ситуация</Text>
              <View style={styles.insight}>
                <Text style={styles.insightIcon}>📉</Text>
                <View style={styles.insightText}>
                  <Text style={styles.insightTitle}>Низкий сезон</Text>
                  <Text style={styles.insightDesc}>
                    Спрос на этом лейне упал на 15% за последнюю неделю. Брокеры предлагают ниже рынка.
                  </Text>
                </View>
              </View>
              <View style={styles.insight}>
                <Text style={styles.insightIcon}>🚛</Text>
                <View style={styles.insightText}>
                  <Text style={styles.insightTitle}>Много траков в регионе</Text>
                  <Text style={styles.insightDesc}>
                    В {load.fromCity} сейчас 47 свободных траков — конкуренция высокая.
                  </Text>
                </View>
              </View>
            </View>

            {/* AI Recommendation */}
            <View style={[styles.section, styles.recommendation]}>
              <Text style={styles.recTitle}>🤖 AI рекомендация</Text>
              <Text style={styles.recText}>
                {rpm < 2.0 && 'Ставка слишком низкая. Торгуйся до $' + (targetRate / load.miles).toFixed(2) + '/mi или откажись — не стоит везти в убыток.'}
                {rpm >= 2.0 && rpm < 2.5 && 'Ставка приемлемая, но можно лучше. Попробуй выбить +10-15% — сейчас низкий сезон, но брокер может пойти навстречу.'}
                {rpm >= 2.5 && 'Отличная ставка! Соглашайся на $' + (load.postedRate * 1.05).toFixed(0) + ' (+5%) и закрывай сделку быстро.'}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.acceptBtn]}
                onPress={() => onAccept?.(targetRate)}
                activeOpacity={0.85}
              >
                <Text style={styles.acceptBtnText}>✓ Торговаться до ${(targetRate / load.miles).toFixed(2)}/mi</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.rejectBtnText}>✕ Отказаться</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.bg.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
    color: Colors.text.primary,
  },
  route: {
    fontSize: 13,
    color: Colors.text.secondary,
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
    color: Colors.text.secondary,
  },
  currentRate: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  currentLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  currentValue: {
    fontSize: 42,
    fontWeight: '700',
  },
  currentTotal: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  comparison: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  compItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  compLabel: {
    fontSize: 10,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 6,
  },
  compValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  section: {
    padding: 20,
    paddingTop: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingHorizontal: 8,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  chartBarWrap: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chartBar: {
    width: '70%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 8,
  },
  chartLabel: {
    fontSize: 10,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  chartValue: {
    fontSize: 9,
    color: Colors.text.muted,
  },
  insight: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  insightIcon: {
    fontSize: 24,
  },
  insightText: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  insightDesc: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  recommendation: {
    backgroundColor: 'rgba(6,182,212,0.08)',
    borderRadius: 12,
    margin: 20,
    marginTop: 0,
  },
  recTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  recText: {
    fontSize: 13,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  actions: {
    padding: 20,
    paddingTop: 0,
    gap: 10,
  },
  actionBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: Colors.primary,
  },
  acceptBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  rejectBtn: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  rejectBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
  },
});

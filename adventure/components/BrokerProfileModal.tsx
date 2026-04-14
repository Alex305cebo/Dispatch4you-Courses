import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { Broker } from '../store/gameStore';

interface Props {
  broker: Broker | null;
  onClose: () => void;
  onCall?: () => void;
}

export default function BrokerProfileModal({ broker, onClose, onCall }: Props) {
  if (!broker) return null;

  // Personality mapping
  const personalityLabels: Record<string, string> = {
    aggressive: '🔥 Агрессивный',
    flexible: '🤝 Гибкий',
    greedy: '💰 Жадный',
  };

  // Rating stars
  const stars = '⭐'.repeat(Math.floor(broker.rating));

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.brokerName}>{broker.name}</Text>
                <Text style={styles.company}>{broker.company}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Rating */}
            <View style={styles.ratingSection}>
              <Text style={styles.stars}>{stars}</Text>
              <Text style={styles.ratingText}>{broker.rating.toFixed(1)} / 5.0</Text>
              <Text style={styles.reviewsText}>Основано на 47 отзывах</Text>
            </View>

            {/* Stats */}
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>23</Text>
                <Text style={styles.statLabel}>Грузов вместе</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{broker.discountPercent}%</Text>
                <Text style={styles.statLabel}>Средняя скидка</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>98%</Text>
                <Text style={styles.statLabel}>Оплата вовремя</Text>
              </View>
            </View>

            {/* Personality */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👤 Характер</Text>
              <View style={styles.personalityChip}>
                <Text style={styles.personalityText}>
                  {personalityLabels[broker.personality] || broker.personality}
                </Text>
              </View>
              <Text style={styles.personalityDesc}>
                {broker.personality === 'aggressive' && 'Торгуется жёстко, но уважает уверенность. Не давай слабину.'}
                {broker.personality === 'flexible' && 'Готов идти на компромисс. Предлагай встречные варианты.'}
                {broker.personality === 'greedy' && 'Пытается выжать максимум. Стой на своём и не соглашайся на первое предложение.'}
              </Text>
            </View>

            {/* Best Time to Call */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📞 Лучшее время звонить</Text>
              <Text style={styles.timeText}>🌅 Утро (8:00 - 10:00 AM)</Text>
              <Text style={styles.hint}>В это время он более сговорчивый и готов закрывать сделки быстро</Text>
            </View>

            {/* Favorite Routes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🛣️ Любимые маршруты</Text>
              <View style={styles.routeItem}>
                <Text style={styles.routeText}>📍 Atlanta → Dallas</Text>
                <Text style={styles.routeCount}>12 грузов</Text>
              </View>
              <View style={styles.routeItem}>
                <Text style={styles.routeText}>📍 Chicago → Houston</Text>
                <Text style={styles.routeCount}>8 грузов</Text>
              </View>
              <View style={styles.routeItem}>
                <Text style={styles.routeText}>📍 Los Angeles → Phoenix</Text>
                <Text style={styles.routeCount}>3 груза</Text>
              </View>
            </View>

            {/* Detention History */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⏱️ История Detention</Text>
              <View style={styles.detentionRow}>
                <Text style={styles.detentionLabel}>Задержки на погрузке:</Text>
                <Text style={styles.detentionValue}>2 раза</Text>
              </View>
              <View style={styles.detentionRow}>
                <Text style={styles.detentionLabel}>Оплатил detention:</Text>
                <Text style={[styles.detentionValue, { color: '#22c55e' }]}>✓ Всегда</Text>
              </View>
            </View>

            {/* Warning (if any) */}
            {broker.rating < 3.5 && (
              <View style={styles.warning}>
                <Text style={styles.warningTitle}>⚠️ Внимание</Text>
                <Text style={styles.warningText}>
                  Этот брокер имеет низкий рейтинг. Будь осторожен с условиями и требуй предоплату.
                </Text>
              </View>
            )}

            {/* AI Advice */}
            <View style={[styles.section, styles.advice]}>
              <Text style={styles.adviceTitle}>🤖 AI совет</Text>
              <Text style={styles.adviceText}>
                Торгуйся до ${(broker.initialOffer * 1.15).toFixed(0)} — этот брокер обычно соглашается на +10-15% от первого предложения. 
                Начни с уверенного тона и покажи что знаешь рынок.
              </Text>
            </View>

            {/* Action */}
            {onCall && (
              <TouchableOpacity style={styles.callBtn} onPress={onCall} activeOpacity={0.85}>
                <Text style={styles.callBtnText}>📞 Позвонить {broker.name}</Text>
              </TouchableOpacity>
            )}

          </ScrollView>
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
    backgroundColor: Colors.bg.secondary,
    borderRadius: 20,
    width: '100%',
    maxWidth: 480,
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
  brokerName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  company: {
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
  ratingSection: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  stars: {
    fontSize: 28,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  reviewsText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: 'rgba(6,182,212,0.1)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
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
    marginBottom: 12,
  },
  personalityChip: {
    backgroundColor: 'rgba(251,146,60,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  personalityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fb923c',
  },
  personalityDesc: {
    fontSize: 13,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  routeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  routeText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  routeCount: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  detentionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detentionLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  detentionValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  warning: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 6,
  },
  warningText: {
    fontSize: 12,
    color: Colors.text.primary,
    lineHeight: 18,
  },
  advice: {
    backgroundColor: 'rgba(6,182,212,0.08)',
    borderRadius: 12,
    margin: 20,
    marginTop: 0,
  },
  adviceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  adviceText: {
    fontSize: 13,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  callBtn: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  callBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
});

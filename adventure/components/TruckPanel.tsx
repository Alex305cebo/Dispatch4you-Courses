import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { Colors } from '../constants/colors';
import { cityState } from '../constants/config';
import { useGameStore, Truck, TruckStatus } from '../store/gameStore';
import TruckDetailModal from './TruckDetailModal';

const STATUS_LABEL: Record<TruckStatus, string> = {
  idle: '⚪ Свободен',
  driving: '🔵 Едет к погрузке',
  at_pickup: '🟡 На погрузке',
  loaded: '🟢 Везёт груз',
  at_delivery: '🟣 На разгрузке',
  breakdown: '🔴 Поломка',
  waiting: '🟠 Ожидает',
};

const STATUS_COLOR: Record<TruckStatus, string> = {
  idle: '#94a3b8',
  driving: '#06b6d4',
  at_pickup: '#f59e0b',
  loaded: '#22c55e',
  at_delivery: '#8b5cf6',
  breakdown: '#ef4444',
  waiting: '#f97316',
};

export default function TruckPanel() {
  const { trucks, selectedTruckId, selectTruck } = useGameStore();
  const [detailTruck, setDetailTruck] = useState<Truck | null>(null);
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isMobile && { fontSize: 14 }]}>🚛 Мои траки</Text>
        <Text style={[styles.headerSub, isMobile && { fontSize: 10 }]}>{trucks.filter(t => t.status === 'idle').length} свободно</Text>
      </View>

      {trucks.map(truck => (
        <TouchableOpacity
          key={truck.id}
          style={[styles.card, selectedTruckId === truck.id && styles.cardSelected]}
          onPress={() => selectTruck(selectedTruckId === truck.id ? null : truck.id)}
        >
          {/* Статус */}
          <View style={styles.cardTop}>
            <Text style={[styles.truckName, isMobile && { fontSize: 13 }]}>{truck.name} - {truck.driver}</Text>
            <View style={[styles.statusBadge, { borderColor: STATUS_COLOR[truck.status] }]}>
              <Text style={[styles.statusText, { color: STATUS_COLOR[truck.status] }, isMobile && { fontSize: 9 }]}>
                {STATUS_LABEL[truck.status]}
              </Text>
            </View>
          </View>

          {/* Маршрут */}
          <Text style={[styles.route, isMobile && { fontSize: 11 }]}>
            📍 {cityState(truck.currentCity)}
            {truck.destinationCity ? ` → ${truck.destinationCity}` : ''}
          </Text>

          {/* Прогресс если едет */}
          {(truck.status === 'driving' || truck.status === 'loaded') && (
            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, {
                  width: `${truck.progress * 100}%`,
                  backgroundColor: STATUS_COLOR[truck.status],
                }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(truck.progress * 100)}%</Text>
            </View>
          )}

          {/* Метрики */}
          <View style={styles.metrics}>
            <View style={styles.metric}>
              <Text style={[styles.metricVal, truck.hoursLeft < 4 && { color: Colors.danger }, isMobile && { fontSize: 12 }]}>
                {truck.hoursLeft}ч
              </Text>
              <Text style={[styles.metricLabel, isMobile && { fontSize: 8 }]}>HOS</Text>
            </View>
            <View style={styles.metric}>
              <Text style={[styles.metricVal, { color: truck.mood > 70 ? Colors.success : truck.mood > 40 ? Colors.warning : Colors.danger }, isMobile && { fontSize: 12 }]}>
                {truck.mood}%
              </Text>
              <Text style={[styles.metricLabel, isMobile && { fontSize: 8 }]}>Настроение</Text>
            </View>
            {truck.currentLoad && (
              <View style={styles.metric}>
                <Text style={[styles.metricVal, isMobile && { fontSize: 12 }]}>${truck.currentLoad.agreedRate.toLocaleString()}</Text>
                <Text style={[styles.metricLabel, isMobile && { fontSize: 8 }]}>Ставка</Text>
              </View>
            )}
          </View>

          {/* Кнопка "Подробнее" */}
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={(e) => {
              e.stopPropagation();
              setDetailTruck(truck);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.detailBtnText, isMobile && { fontSize: 11 }]}>📊 Подробнее (HOS, Аналитика)</Text>
          </TouchableOpacity>

          {/* Текущий груз */}
          {truck.currentLoad && (
            <View style={styles.loadInfo}>
              <Text style={[styles.loadInfoText, isMobile && { fontSize: 10 }]}>
                📦 {truck.currentLoad.commodity} · {cityState(truck.currentLoad.fromCity)} → {cityState(truck.currentLoad.toCity)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}

      {/* Модалка с деталями трака */}
      <TruckDetailModal
        truck={detailTruck}
        onClose={() => setDetailTruck(null)}
        onFindLoad={() => {
          setDetailTruck(null);
          // TODO: переключить на Load Board
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 12, gap: 10 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: { fontSize: 15, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 11, color: Colors.textDim },

  card: {
    backgroundColor: Colors.bgCard, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border, padding: 14, gap: 6,
  },
  cardSelected: { borderColor: Colors.primary, backgroundColor: 'rgba(6,182,212,0.05)' },

  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  truckName: { fontSize: 14, fontWeight: '800', color: '#fff', flex: 1, marginRight: 8 },
  statusBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1,
  },
  statusText: { fontSize: 10, fontWeight: '700' },

  route: { fontSize: 12, color: Colors.textSecondary },

  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTrack: { flex: 1, height: 4, backgroundColor: Colors.bgCardHover, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  progressText: { fontSize: 10, color: Colors.textDim, width: 30 },

  metrics: { flexDirection: 'row', gap: 8 },
  metric: {
    backgroundColor: Colors.bg, borderRadius: 8, padding: 8, alignItems: 'center', minWidth: 60,
  },
  metricVal: { fontSize: 13, fontWeight: '800', color: '#fff' },
  metricLabel: { fontSize: 9, color: Colors.textDim, fontWeight: '600' },

  loadInfo: {
    backgroundColor: 'rgba(6,182,212,0.08)', borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)', padding: 8,
  },
  loadInfoText: { fontSize: 11, color: '#67e8f9' },

  detailBtn: {
    backgroundColor: 'rgba(6,182,212,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  detailBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#67e8f9',
  },
});

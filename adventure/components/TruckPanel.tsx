import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { Colors } from '../constants/colors';
import { cityState } from '../constants/config';
import { useGameStore, Truck, TruckStatus } from '../store/gameStore';
import TruckDetailModal from './TruckDetailModal';

interface TruckPanelProps {
  onSwitchToLoadBoard?: () => void;
}

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

export default function TruckPanel({ onSwitchToLoadBoard }: TruckPanelProps = {}) {
  const { trucks, selectedTruckId, selectTruck, setLoadBoardSearch } = useGameStore();
  const [detailTruck, setDetailTruck] = useState<Truck | null>(null);
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚛 Мои траки</Text>
        <Text style={styles.headerSub}>{trucks.filter(t => t.status === 'idle').length} свободно</Text>
      </View>

      {trucks.map(truck => (
        <TouchableOpacity
          key={truck.id}
          style={[styles.card, selectedTruckId === truck.id && styles.cardSelected]}
          onPress={() => selectTruck(selectedTruckId === truck.id ? null : truck.id)}
        >
          {/* Статус */}
          <View style={styles.cardTop}>
            <Text style={styles.truckName}>{truck.name} - {truck.driver}</Text>
            <View style={[styles.statusBadge, { borderColor: (truck as any).onNightStop || (truck as any).hosRestUntilMinute > 0 ? '#64748b' : STATUS_COLOR[truck.status] }]}>
              <Text style={[styles.statusText, { color: (truck as any).onNightStop || (truck as any).hosRestUntilMinute > 0 ? '#94a3b8' : STATUS_COLOR[truck.status] }]}>
                {(truck as any).onNightStop
                  ? '🌙 Ночёвка'
                  : (truck as any).hosRestUntilMinute > 0
                  ? '😴 HOS отдых'
                  : STATUS_LABEL[truck.status]}
              </Text>
            </View>
          </View>

          {/* Маршрут */}
          <Text style={styles.route}>
            📍 {cityState(truck.currentCity)}
            {truck.destinationCity ? ` → ${truck.destinationCity}` : ''}
          </Text>

          {/* Прогресс если едет */}
          {(truck.status === 'driving' || truck.status === 'loaded') && !(truck as any).onNightStop && !((truck as any).hosRestUntilMinute > 0) && (
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
              <Text style={[styles.metricVal, truck.hoursLeft < 4 && { color: Colors.danger }]}>
                {(Math.round(truck.hoursLeft * 10) / 10).toFixed(1)}ч
              </Text>
              <Text style={styles.metricLabel}>HOS</Text>
            </View>
            <View style={styles.metric}>
              <Text style={[styles.metricVal, { color: truck.mood > 70 ? Colors.success : truck.mood > 40 ? Colors.warning : Colors.danger }]}>
                {truck.mood}%
              </Text>
              <Text style={styles.metricLabel}>Настроение</Text>
            </View>
            {truck.currentLoad && (
              <View style={styles.metric}>
                <Text style={styles.metricVal}>${truck.currentLoad.agreedRate.toLocaleString()}</Text>
                <Text style={styles.metricLabel}>Ставка</Text>
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
            <Text style={styles.detailBtnText}>📊 Подробнее (HOS, Аналитика)</Text>
          </TouchableOpacity>

          {/* Текущий груз */}
          {truck.currentLoad && (
            <View style={styles.loadInfo}>
              <Text style={styles.loadInfoText}>
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
        onFindLoad={(city) => {
          setLoadBoardSearch(city);
          setDetailTruck(null);
          onSwitchToLoadBoard?.();
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 12, gap: 12 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 6,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: '#94a3b8' },

  card: {
    backgroundColor: Colors.bgCard, borderRadius: 16,
    borderWidth: 1.5, borderColor: Colors.border, padding: 16, gap: 10,
  },
  cardSelected: { borderColor: Colors.primary, backgroundColor: 'rgba(6,182,212,0.07)' },

  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  truckName: { fontSize: 16, fontWeight: '800', color: '#fff', flex: 1, marginRight: 8 },
  statusBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1.5,
  },
  statusText: { fontSize: 12, fontWeight: '700' },

  route: { fontSize: 13, color: '#e2e8f0' },

  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTrack: { flex: 1, height: 6, backgroundColor: Colors.bgCardHover, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 12, color: '#94a3b8', width: 34 },

  metrics: { flexDirection: 'row', gap: 8 },
  metric: {
    backgroundColor: Colors.bg, borderRadius: 10, padding: 10, alignItems: 'center', minWidth: 68,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  metricVal: { fontSize: 15, fontWeight: '800', color: '#fff' },
  metricLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '600', marginTop: 2 },

  loadInfo: {
    backgroundColor: 'rgba(6,182,212,0.08)', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(6,182,212,0.25)', padding: 10,
  },
  loadInfoText: { fontSize: 13, color: '#67e8f9' },

  detailBtn: {
    backgroundColor: 'rgba(6,182,212,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(6,182,212,0.35)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginTop: 2,
  },
  detailBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#67e8f9',
  },
});

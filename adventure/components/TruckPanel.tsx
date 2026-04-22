import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { Colors } from '../constants/colors';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../constants/themes';
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
  const T = useTheme();
  const { trucks, selectedTruckId, selectTruck, setLoadBoardSearch } = useGameStore();
  const [detailTruck, setDetailTruck] = useState<Truck | null>(null);
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const styles = useMemo(() => makeStyles(T), [T]);

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
              <Text style={[styles.metricVal, truck.hoursLeft < 4 && { color: T.danger }]}>
                {(Math.round(truck.hoursLeft * 10) / 10).toFixed(1)}ч
              </Text>
              <Text style={styles.metricLabel}>HOS</Text>
            </View>
            <View style={styles.metric}>
              <Text style={[styles.metricVal, { color: truck.mood > 70 ? T.success : truck.mood > 40 ? T.warning : T.danger }]}>
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

      {/* Плашка — расширить флот */}
      <TouchableOpacity 
        style={styles.shopBanner} 
        activeOpacity={0.75} 
        onPress={() => {
          console.log('TruckPanel: Shop button clicked');
          useGameStore.getState().setTruckShopOpen(true);
          console.log('TruckPanel: After setTruckShopOpen, state:', useGameStore.getState().truckShopOpen);
        }}
      >
        <View style={styles.shopBannerLeft}>
          <Text style={styles.shopBannerIcon}>🏪</Text>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.shopBannerTitle}>Расширь флот!</Text>
            <Text style={styles.shopBannerSub}>Купи ещё траки в магазине и зарабатывай больше</Text>
          </View>
        </View>
        <View style={styles.shopBannerBadge}>
          <Text style={styles.shopBannerBadgeText}>В магазин →</Text>
        </View>
      </TouchableOpacity>

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

function makeStyles(T: ThemeColors) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { padding: 12, gap: 12 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 6,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: T.text },
  headerSub: { fontSize: 12, color: T.textMuted },

  card: {
    backgroundColor: T.bgCard, borderRadius: 18,
    borderWidth: 2, borderColor: T.border, padding: 18, gap: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  cardSelected: { borderColor: T.primary, backgroundColor: 'rgba(0,122,255,0.06)', borderWidth: 2 },

  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  truckName: { fontSize: 17, fontWeight: '900', color: T.text, flex: 1, marginRight: 8 },
  statusBadge: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, borderWidth: 2,
  },
  statusText: { fontSize: 13, fontWeight: '800' },

  route: { fontSize: 14, color: T.textSecondary, fontWeight: '600' },

  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTrack: { flex: 1, height: 8, backgroundColor: T.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 13, color: T.textSecondary, fontWeight: '700', width: 36 },

  metrics: { flexDirection: 'row', gap: 10 },
  metric: {
    backgroundColor: T.bgCardHover, borderRadius: 12, padding: 12, alignItems: 'center', minWidth: 72,
    borderWidth: 1.5, borderColor: T.border,
  },
  metricVal: { fontSize: 16, fontWeight: '900', color: T.text },
  metricLabel: { fontSize: 12, color: T.textMuted, fontWeight: '700', marginTop: 3 },

  loadInfo: {
    backgroundColor: 'rgba(0,122,255,0.07)', borderRadius: 12,
    borderWidth: 1.5, borderColor: 'rgba(0,122,255,0.2)', padding: 12,
  },
  loadInfoText: { fontSize: 14, color: T.primary, fontWeight: '600' },

  detailBtn: {
    backgroundColor: 'rgba(0,122,255,0.08)',
    borderWidth: 2,
    borderColor: 'rgba(0,122,255,0.25)',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 2,
  },
  detailBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: T.primary,
  },

  shopBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,149,0,0.08)',
    borderWidth: 2,
    borderColor: 'rgba(255,149,0,0.25)',
    borderRadius: 18,
    padding: 16,
    marginTop: 4,
  },
  shopBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
    minWidth: 0,
  },
  shopBannerIcon: {
    fontSize: 32,
    flexShrink: 0,
  },
  shopBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: T.warning,
    marginBottom: 2,
  },
  shopBannerSub: {
    fontSize: 12,
    color: T.textMuted,
    fontWeight: '500',
    lineHeight: 16,
    flexShrink: 1,
  },
  shopBannerBadge: {
    backgroundColor: 'rgba(6,182,212,0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.4)',
    flexShrink: 0,
  },
  shopBannerBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#06b6d4',
  },
  });
}

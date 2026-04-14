import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, Animated, ScrollView,
} from 'react-native';
import { useGameStore } from '../store/gameStore';

interface Props {
  onComplete: () => void;
}

// ─── ШАГИ УТРЕННЕГО БРИФИНГА ─────────────────────────────────────────────────
const STEPS = [
  {
    id: 'wake',
    time: '7:30 AM',
    icon: '☀️',
    title: 'Доброе утро, Диспетчер!',
    subtitle: 'Понедельник · 14 апреля 2026',
    content: null,
    action: 'Начать рабочий день',
    color: '#f59e0b',
  },
  {
    id: 'status',
    time: '7:32 AM',
    icon: '🚛',
    title: 'Статус парка',
    subtitle: 'Проверь своих водителей',
    content: 'trucks',
    action: 'Всё проверил →',
    color: '#06b6d4',
  },
  {
    id: 'market',
    time: '7:35 AM',
    icon: '📊',
    title: 'Рыночные ставки сегодня',
    subtitle: 'DAT Rate Index · Live',
    content: 'market',
    action: 'Понял, к работе →',
    color: '#22c55e',
  },
  {
    id: 'weather',
    time: '7:38 AM',
    icon: '🌤️',
    title: 'Погода на маршрутах',
    subtitle: 'Важные предупреждения',
    content: 'weather',
    action: 'Учту →',
    color: '#8b5cf6',
  },
  {
    id: 'tasks',
    time: '7:40 AM',
    icon: '✅',
    title: 'Задачи на сегодня',
    subtitle: 'Твой план на смену',
    content: 'tasks',
    action: '🚀 Начать смену!',
    color: '#22c55e',
  },
];

// Рыночные ставки (имитация DAT)
const MARKET_RATES = [
  { lane: 'Chicago → Houston', rpm: 2.94, trend: '+0.12', hot: true },
  { lane: 'LA → Dallas', rpm: 2.71, trend: '+0.08', hot: true },
  { lane: 'Atlanta → NY', rpm: 3.18, trend: '+0.21', hot: true },
  { lane: 'Dallas → Chicago', rpm: 2.45, trend: '-0.05', hot: false },
  { lane: 'Houston → Atlanta', rpm: 2.62, trend: '+0.03', hot: false },
  { lane: 'NY → Miami', rpm: 2.88, trend: '+0.15', hot: true },
];

// Погода
const WEATHER_ALERTS = [
  { region: 'I-40 Tennessee', type: '⛈️ Гроза', severity: 'medium', note: 'Возможные задержки 1-2ч' },
  { region: 'I-90 Montana', type: '❄️ Снег', severity: 'high', note: 'Закрыт перевал, объезд +80mi' },
  { region: 'I-10 Texas', type: '🌬️ Ветер', severity: 'low', note: 'Порывы до 45mph, осторожно' },
  { region: 'I-95 Florida', type: '☀️ Ясно', severity: 'none', note: 'Отличные условия' },
];

export default function MorningBriefing({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { trucks } = useGameStore();

  const current = STEPS[step];

  function nextStep() {
    if (step >= STEPS.length - 1) {
      // Финал
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setVisible(false);
        onComplete();
      });
      return;
    }
    // Анимация перехода
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setStep(s => s + 1);
  }

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.overlay}>
        <Animated.View style={[styles.modal, { opacity: fadeAnim }]}>

          {/* Progress dots */}
          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View key={i} style={[
                styles.dot,
                i === step && styles.dotActive,
                i < step && styles.dotDone,
              ]} />
            ))}
          </View>

          {/* Time */}
          <Text style={styles.time}>{current.time}</Text>

          {/* Icon */}
          <View style={[styles.iconWrap, { backgroundColor: current.color + '22', borderColor: current.color + '44' }]}>
            <Text style={styles.icon}>{current.icon}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.subtitle}>{current.subtitle}</Text>

          {/* Content */}
          <View style={styles.content}>
            {current.content === 'trucks' && <TrucksContent trucks={trucks} />}
            {current.content === 'market' && <MarketContent />}
            {current.content === 'weather' && <WeatherContent />}
            {current.content === 'tasks' && <TasksContent trucks={trucks} />}
          </View>

          {/* Action button */}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: current.color }]}
            onPress={nextStep}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnText}>{current.action}</Text>
          </TouchableOpacity>

          {/* Skip */}
          {step < STEPS.length - 1 && (
            <TouchableOpacity onPress={() => { setVisible(false); onComplete(); }} style={styles.skipBtn}>
              <Text style={styles.skipText}>Пропустить</Text>
            </TouchableOpacity>
          )}

        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── КОНТЕНТ: ТРАКИ ──────────────────────────────────────────────────────────
function TrucksContent({ trucks }: { trucks: any[] }) {
  const [selectedTruck, setSelectedTruck] = useState<any>(null);
  
  return (
    <>
      <ScrollView style={styles.trucksScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionHint}>💡 Нажми на трак чтобы узнать детали</Text>
          {trucks.map(truck => {
        let statusText = '';
        let statusColor = '';
        let statusBg = '';
        
        if (truck.status === 'loaded') {
          statusText = `🚛 В пути → ${truck.destinationCity} (${Math.round(truck.progress * 100)}%)`;
          statusColor = '#67e8f9';
          statusBg = 'rgba(6,182,212,.15)';
        } else if (truck.status === 'at_delivery') {
          statusText = `📦 На разгрузке — ждёт`;
          statusColor = '#fbbf24';
          statusBg = 'rgba(251,191,36,.15)';
        } else if (truck.status === 'idle') {
          statusText = `✅ Свободен — готов`;
          statusColor = '#4ade80';
          statusBg = 'rgba(34,197,94,.15)';
        } else {
          statusText = `🚛 ${truck.status}`;
          statusColor = '#67e8f9';
          statusBg = 'rgba(6,182,212,.15)';
        }

        return (
          <TouchableOpacity
            key={truck.id}
            style={styles.truckRow}
            onPress={() => setSelectedTruck(truck)}
            activeOpacity={0.7}
          >
            <View style={styles.truckLeft}>
              <Text style={styles.truckName}>{truck.name} - {truck.driver}</Text>
            </View>
            <View style={styles.truckRight}>
              <View style={[styles.truckStatus, { backgroundColor: statusBg }]}>
                <Text style={[styles.truckStatusText, { color: statusColor }]}>
                  {statusText}
                </Text>
              </View>
              <Text style={styles.truckMeta}>📍 {truck.currentCity} · HOS {truck.hoursLeft}ч · 😊 {truck.mood}%</Text>
            </View>
            <Text style={styles.clickArrow}>→</Text>
          </TouchableOpacity>
        );
      })}
      
      {/* Simple inline detail modal */}
      {selectedTruck && (
        <Modal transparent animationType="fade">
          <TouchableOpacity
            style={styles.truckDetailOverlay}
            activeOpacity={1}
            onPress={() => setSelectedTruck(null)}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={styles.truckDetailModal}>
                <Text style={styles.truckDetailTitle}>{selectedTruck.name} - {selectedTruck.driver}</Text>
                
                <View style={styles.truckDetailStats}>
                  <View style={styles.truckDetailStat}>
                    <Text style={styles.truckDetailStatLabel}>Локация</Text>
                    <Text style={styles.truckDetailStatValue}>📍 {selectedTruck.currentCity}</Text>
                  </View>
                  <View style={styles.truckDetailStat}>
                    <Text style={styles.truckDetailStatLabel}>HOS осталось</Text>
                    <Text style={styles.truckDetailStatValue}>⏰ {selectedTruck.hoursLeft}ч</Text>
                  </View>
                  <View style={styles.truckDetailStat}>
                    <Text style={styles.truckDetailStatLabel}>Настроение</Text>
                    <Text style={styles.truckDetailStatValue}>😊 {selectedTruck.mood}%</Text>
                  </View>
                </View>
                
                {selectedTruck.currentLoad && (
                  <View style={styles.truckDetailLoad}>
                    <Text style={styles.truckDetailLoadTitle}>Текущий груз:</Text>
                    <Text style={styles.truckDetailLoadText}>
                      {selectedTruck.currentLoad.fromCity} → {selectedTruck.currentLoad.toCity}
                    </Text>
                    <Text style={styles.truckDetailLoadText}>
                      {selectedTruck.currentLoad.commodity} · {selectedTruck.currentLoad.weight}lbs
                    </Text>
                    <Text style={styles.truckDetailLoadRate}>
                      ${selectedTruck.currentLoad.agreedRate.toLocaleString()}
                    </Text>
                  </View>
                )}
                
                <TouchableOpacity
                  style={styles.truckDetailClose}
                  onPress={() => setSelectedTruck(null)}
                >
                  <Text style={styles.truckDetailCloseText}>Закрыть</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
        </View>
      </ScrollView>
    </>
  );
}

// ─── КОНТЕНТ: РЫНОК ──────────────────────────────────────────────────────────
function MarketContent() {
  return (
    <View style={styles.section}>
      <View style={styles.marketHeader}>
        <Text style={styles.marketHeaderText}>Маршрут</Text>
        <Text style={styles.marketHeaderText}>$/миля</Text>
        <Text style={styles.marketHeaderText}>Тренд</Text>
      </View>
      {MARKET_RATES.map((r, i) => (
        <View key={i} style={styles.marketRow}>
          <View style={styles.marketLane}>
            {r.hot && <Text style={styles.hotBadge}>🔥</Text>}
            <Text style={styles.marketLaneText}>{r.lane}</Text>
          </View>
          <Text style={[styles.marketRpm, { color: r.rpm >= 2.8 ? '#4ade80' : r.rpm >= 2.5 ? '#fbbf24' : '#f87171' }]}>
            ${r.rpm.toFixed(2)}
          </Text>
          <Text style={[styles.marketTrend, { color: r.trend.startsWith('+') ? '#4ade80' : '#f87171' }]}>
            {r.trend}
          </Text>
        </View>
      ))}
      <Text style={styles.marketNote}>📡 Источник: DAT Rate Index · Обновлено 7:30 AM</Text>
    </View>
  );
}

// ─── КОНТЕНТ: ПОГОДА ─────────────────────────────────────────────────────────
function WeatherContent() {
  const severityColor: Record<string, string> = {
    high: '#ef4444', medium: '#f59e0b', low: '#06b6d4', none: '#22c55e',
  };
  return (
    <View style={styles.section}>
      {WEATHER_ALERTS.map((w, i) => (
        <View key={i} style={[styles.weatherRow, { borderLeftColor: severityColor[w.severity] }]}>
          <View style={styles.weatherLeft}>
            <Text style={styles.weatherType}>{w.type}</Text>
            <Text style={styles.weatherRegion}>{w.region}</Text>
          </View>
          <Text style={styles.weatherNote}>{w.note}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── КОНТЕНТ: ЗАДАЧИ ─────────────────────────────────────────────────────────
function TasksContent({ trucks }: { trucks: any[] }) {
  const atDeliveryCount = trucks.filter(t => t.status === 'at_delivery').length;
  const loadedCount = trucks.filter(t => t.status === 'loaded').length;
  const idleCount = trucks.filter(t => t.status === 'idle').length;
  
  const tasks = [
    { done: false, text: `Найти грузы для ${atDeliveryCount} траков на разгрузке`, priority: 'high' },
    { done: false, text: `Мониторить ${loadedCount} траков в пути`, priority: 'high' },
    { done: false, text: 'Проверить рыночные ставки на горячих лейнах', priority: 'medium' },
    { done: false, text: 'Позвонить брокерам по приоритетным маршрутам', priority: 'high' },
    { done: false, text: 'Проверить HOS водителей перед отправкой', priority: 'medium' },
    { done: false, text: 'Цель смены: заработать $2,500+', priority: 'high' },
  ];
  const priorityColor: Record<string, string> = { high: '#ef4444', medium: '#f59e0b', low: '#64748b' };
  return (
    <View style={styles.section}>
      <View style={styles.taskGoal}>
        <Text style={styles.taskGoalLabel}>Цель смены</Text>
        <Text style={styles.taskGoalVal}>$8,000+</Text>
        <Text style={styles.taskGoalSub}>при {idleCount} свободных траках</Text>
      </View>
      {tasks.map((t, i) => (
        <View key={i} style={styles.taskRow}>
          <View style={[styles.taskPriority, { backgroundColor: priorityColor[t.priority] + '22' }]}>
            <View style={[styles.taskDot, { backgroundColor: priorityColor[t.priority] }]} />
          </View>
          <Text style={styles.taskText}>{t.text}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── СТИЛИ ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  modal: {
    backgroundColor: '#080e1c',
    borderRadius: 24, borderWidth: 1, borderColor: '#1e2d45',
    width: '100%', maxWidth: 480,
    padding: 24, alignItems: 'center',
    shadowColor: '#06b6d4', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 24, elevation: 20,
  },

  dots: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1e2d45' },
  dotActive: { width: 20, backgroundColor: '#06b6d4' },
  dotDone: { backgroundColor: '#22c55e' },

  time: { fontSize: 12, color: '#64748b', fontWeight: '700', marginBottom: 12, letterSpacing: 1 },

  iconWrap: {
    width: 64, height: 64, borderRadius: 20,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  icon: { fontSize: 32 },

  title: { fontSize: 20, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 16 },

  content: { width: '100%', marginBottom: 20, maxHeight: 380 },

  section: { width: '100%', gap: 8 },
  trucksScroll: { maxHeight: 380 },
  sectionHint: {
    fontSize: 11, color: '#64748b', textAlign: 'center',
    marginBottom: 8, fontWeight: '600',
  },

  // Trucks
  truckRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#0d1526', borderRadius: 12,
    borderWidth: 1, borderColor: '#1e2d45', padding: 12,
    position: 'relative',
  },
  clickArrow: {
    position: 'absolute', right: 12, top: '50%',
    fontSize: 16, color: '#475569', fontWeight: '700',
  },
  truckLeft: { gap: 2 },
  truckName: { fontSize: 13, fontWeight: '800', color: '#fff' },
  truckRight: { alignItems: 'flex-end', gap: 4, paddingRight: 20 },
  truckStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  truckStatusText: { fontSize: 11, fontWeight: '700' },
  truckMeta: { fontSize: 10, color: '#475569' },

  // Truck Detail Modal
  truckDetailOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  truckDetailModal: {
    backgroundColor: '#0d1526', borderRadius: 16,
    borderWidth: 1, borderColor: '#1e2d45',
    padding: 20, width: '100%', maxWidth: 360,
  },
  truckDetailTitle: { fontSize: 16, fontWeight: '900', color: '#fff', marginBottom: 4 },
  truckDetailDriver: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  truckDetailStats: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  truckDetailStat: { flex: 1, backgroundColor: '#080e1c', borderRadius: 8, padding: 10 },
  truckDetailStatLabel: { fontSize: 9, color: '#475569', marginBottom: 4, textTransform: 'uppercase' },
  truckDetailStatValue: { fontSize: 12, color: '#e2e8f0', fontWeight: '700' },
  truckDetailLoad: {
    backgroundColor: 'rgba(6,182,212,0.08)', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)',
    padding: 12, marginBottom: 16,
  },
  truckDetailLoadTitle: { fontSize: 11, color: '#64748b', marginBottom: 6, fontWeight: '700' },
  truckDetailLoadText: { fontSize: 12, color: '#e2e8f0', marginBottom: 2 },
  truckDetailLoadRate: { fontSize: 16, color: '#4ade80', fontWeight: '900', marginTop: 4 },
  truckDetailClose: {
    backgroundColor: '#06b6d4', borderRadius: 10, paddingVertical: 12,
    alignItems: 'center',
  },
  truckDetailCloseText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  // Market
  marketHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 4 },
  marketHeaderText: { fontSize: 9, color: '#475569', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  marketRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#0d1526', borderRadius: 10,
    borderWidth: 1, borderColor: '#1e2d45', padding: 10,
  },
  marketLane: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  hotBadge: { fontSize: 10 },
  marketLaneText: { fontSize: 12, color: '#e2e8f0', fontWeight: '600' },
  marketRpm: { fontSize: 14, fontWeight: '900', width: 50, textAlign: 'center' },
  marketTrend: { fontSize: 12, fontWeight: '700', width: 45, textAlign: 'right' },
  marketNote: { fontSize: 10, color: '#475569', textAlign: 'center', marginTop: 4 },

  // Weather
  weatherRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#0d1526', borderRadius: 10,
    borderWidth: 1, borderColor: '#1e2d45', borderLeftWidth: 3,
    padding: 10,
  },
  weatherLeft: { gap: 2 },
  weatherType: { fontSize: 13, fontWeight: '700', color: '#fff' },
  weatherRegion: { fontSize: 10, color: '#64748b' },
  weatherNote: { fontSize: 11, color: '#94a3b8', maxWidth: 160, textAlign: 'right' },

  // Tasks
  taskGoal: {
    backgroundColor: 'rgba(34,197,94,.08)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(34,197,94,.2)',
    padding: 12, alignItems: 'center', marginBottom: 8,
  },
  taskGoalLabel: { fontSize: 10, color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  taskGoalVal: { fontSize: 28, fontWeight: '900', color: '#4ade80' },
  taskGoalSub: { fontSize: 11, color: '#64748b' },
  taskRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#0d1526', borderRadius: 10,
    borderWidth: 1, borderColor: '#1e2d45', padding: 10,
  },
  taskPriority: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  taskDot: { width: 8, height: 8, borderRadius: 4 },
  taskText: { flex: 1, fontSize: 12, color: '#e2e8f0', lineHeight: 17 },

  // Buttons
  actionBtn: {
    width: '100%', borderRadius: 16, paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  actionBtnText: { fontSize: 15, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },

  skipBtn: { marginTop: 10, padding: 8 },
  skipText: { fontSize: 12, color: '#475569' },
});

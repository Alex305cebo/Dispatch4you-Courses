import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Truck } from '../store/gameStore';
import { cityState } from '../constants/config';
import DriverScorecard from './DriverScorecard';

interface Props {
  truck: Truck | null;
  onClose: () => void;
  onFindLoad: () => void;
}

const STATUS_COLOR: Record<string, string> = {
  loaded: '#67e8f9', driving: '#06b6d4', at_delivery: '#fbbf24',
  at_pickup: '#f59e0b', idle: '#4ade80', breakdown: '#ef4444', waiting: '#fb923c',
};
const STATUS_ICON: Record<string, string> = {
  loaded: '🚛', driving: '🚛', at_delivery: '📦',
  at_pickup: '📦', idle: '✅', breakdown: '⚠️', waiting: '⏳',
};
const STATUS_LABEL: Record<string, string> = {
  loaded: 'Везёт груз', driving: 'Едет к погрузке', at_delivery: 'На разгрузке',
  at_pickup: 'На погрузке', idle: 'Свободен', breakdown: 'Поломка', waiting: 'Detention',
};

export default function TruckDetailModal({ truck, onClose, onFindLoad }: Props) {
  const [showScorecard, setShowScorecard] = useState(false);
  if (!truck) return null;

  const hoursWorked = 11 - truck.hoursLeft;
  const needsRest = truck.hoursLeft < 2;
  const rpm = truck.currentLoad
    ? (truck.currentLoad.agreedRate / truck.currentLoad.miles).toFixed(2) : '0.00';
  const sc = STATUS_COLOR[truck.status] || '#94a3b8';
  const dest = truck.destinationCity ? ` → ${cityState(truck.destinationCity)}` : '';
  const canFind = truck.status === 'idle' || truck.status === 'at_delivery' || truck.status === 'at_pickup';

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={s.modal} activeOpacity={1} onPress={e => e.stopPropagation()}>

          {/* ── ШАПКА ── */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <View style={s.avatar}><Text style={s.avatarText}>👤</Text></View>
              <View>
                <Text style={s.driverName}>{truck.driver}</Text>
                <Text style={s.truckSub}>{truck.name} · {cityState(truck.currentCity)}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* ── СТАТУС ── */}
            <View style={[s.statusBar, { backgroundColor: sc + '18', borderColor: sc + '44' }]}>
              <Text style={s.statusIcon}>{STATUS_ICON[truck.status] || '🚛'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.statusLabel, { color: sc }]}>
                  {STATUS_LABEL[truck.status] || truck.status}{dest}
                </Text>
                {truck.status === 'loaded' && truck.currentLoad && (
                  <Text style={s.statusSub}>
                    {Math.round(truck.progress * 100)}% пути · ETA ~{Math.round((1 - truck.progress) * truck.currentLoad.miles / 60)}ч
                  </Text>
                )}
              </View>
              {needsRest && (
                <View style={s.restBadge}><Text style={s.restBadgeText}>⚠️ Отдых!</Text></View>
              )}
            </View>

            {/* ── БЕЙДЖИ ── */}
            <View style={s.badgesRow}>
              <View style={s.badge}><Text style={s.badgeText}>⭐ {truck.safetyScore}</Text><Text style={s.badgeLabel}>Safety</Text></View>
              <View style={s.badge}><Text style={s.badgeText}>🎯 {truck.onTimeRate}%</Text><Text style={s.badgeLabel}>On Time</Text></View>
              <View style={s.badge}><Text style={s.badgeText}>😊 {truck.mood}%</Text><Text style={s.badgeLabel}>Mood</Text></View>
              <View style={s.badge}><Text style={s.badgeText}>⛽ {truck.fuelEfficiency}</Text><Text style={s.badgeLabel}>MPG</Text></View>
            </View>

            {/* ── HOS ── */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>⏰ HOS — Hours of Service</Text>
              <View style={s.hosRow}>
                <HosBar label="Drive" value={truck.hoursLeft} max={11} color={needsRest ? '#ef4444' : '#06b6d4'} />
                <HosBar label="Shift" value={Math.max(0, 14 - hoursWorked - 1)} max={14} color="#22c55e" />
                <HosBar label="Cycle" value={52} max={70} color="#94a3b8" />
              </View>
              {needsRest && (
                <Text style={s.hosWarn}>⚠️ Требуется 10-часовой отдых перед следующей сменой</Text>
              )}
            </View>

            {/* ── ТЕКУЩИЙ ГРУЗ ── */}
            {truck.currentLoad && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>📦 Текущий груз</Text>
                <Text style={s.loadRoute}>
                  {cityState(truck.currentLoad.fromCity)} → {cityState(truck.currentLoad.toCity)}
                </Text>
                <View style={s.loadStats}>
                  <LoadStat label="Ставка" value={`$${truck.currentLoad.agreedRate.toLocaleString()}`} />
                  <LoadStat label="$/миля" value={`$${rpm}`} />
                  <LoadStat label="Миль" value={String(truck.currentLoad.miles)} />
                  <LoadStat label="Груз" value={truck.currentLoad.commodity} />
                </View>
              </View>
            )}

            {/* ── ДЕЙСТВИЯ ── */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>✅ Действия</Text>
              {canFind && (
                <TouchableOpacity style={s.findBtn} onPress={onFindLoad} activeOpacity={0.85}>
                  <Text style={s.findBtnIcon}>🔍</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.findBtnTitle}>Найти груз</Text>
                    <Text style={s.findBtnSub}>из {cityState(truck.currentCity)}</Text>
                  </View>
                  <Text style={s.findBtnArrow}>→</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={s.statsBtn} onPress={() => setShowScorecard(true)} activeOpacity={0.85}>
                <Text style={s.statsBtnText}>📊 Driver Performance & Stats</Text>
              </TouchableOpacity>
            </View>

            {/* ── AI СОВЕТ ── */}
            <View style={s.aiCard}>
              <Text style={s.aiTitle}>🤖 AI Диспетчер</Text>
              <Text style={s.aiText}>
                {canFind
                  ? `Найди груз из ${cityState(truck.currentCity)} — 0 deadhead миль!`
                  : truck.status === 'loaded' && truck.progress > 0.7
                  ? `Уже ищи следующий груз из ${cityState(truck.destinationCity || truck.currentCity)}.`
                  : needsRest
                  ? 'Водитель скоро должен отдыхать — учти при планировании!'
                  : 'Мониторь прогресс, проверяй каждые 2 часа.'}
              </Text>
            </View>

          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>

      {showScorecard && <DriverScorecard truck={truck} onClose={() => setShowScorecard(false)} />}
    </Modal>
  );
}

function HosBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <View style={s.hosItem}>
      <Text style={[s.hosVal, { color }]}>{value.toFixed(0)}h</Text>
      <View style={s.hosBarTrack}>
        <View style={[s.hosBarFill, { width: `${Math.min(1, value / max) * 100}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={s.hosLabel}>{label}</Text>
    </View>
  );
}

function LoadStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.loadStat}>
      <Text style={s.loadStatVal}>{value}</Text>
      <Text style={s.loadStatLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modal: { backgroundColor: '#111827', borderRadius: 20, width: '100%', maxWidth: 480, maxHeight: '88%', borderWidth: 1.5, borderColor: 'rgba(6,182,212,0.35)' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(6,182,212,0.2)', borderWidth: 2, borderColor: '#06b6d4', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24 },
  driverName: { fontSize: 16, fontWeight: '900', color: '#67e8f9' },
  truckSub: { fontSize: 13, color: '#cbd5e1', marginTop: 1 },
  closeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 16, color: '#cbd5e1' },

  // Status bar
  statusBar: { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 12, marginBottom: 0, padding: 12, borderRadius: 12, borderWidth: 1 },
  statusIcon: { fontSize: 22 },
  statusLabel: { fontSize: 14, fontWeight: '700' },
  statusSub: { fontSize: 13, color: '#cbd5e1', marginTop: 2 },
  restBadge: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: 'rgba(239,68,68,0.2)', borderRadius: 8 },
  restBadgeText: { fontSize: 12, fontWeight: '800', color: '#ef4444' },

  // Badges
  badgesRow: { flexDirection: 'row', gap: 8, margin: 12, marginBottom: 0 },
  badge: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  badgeText: { fontSize: 13, fontWeight: '800', color: '#e2e8f0' },
  badgeLabel: { fontSize: 13, color: '#cbd5e1', marginTop: 2, textTransform: 'uppercase' },

  // Section
  section: { margin: 12, marginBottom: 0, padding: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', gap: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: 0.5 },

  // HOS
  hosRow: { flexDirection: 'row', gap: 10 },
  hosItem: { flex: 1, alignItems: 'center', gap: 4 },
  hosVal: { fontSize: 18, fontWeight: '900' },
  hosBarTrack: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  hosBarFill: { height: '100%', borderRadius: 3 },
  hosLabel: { fontSize: 13, color: '#cbd5e1', fontWeight: '700', textTransform: 'uppercase' },
  hosWarn: { fontSize: 13, color: '#ef4444', fontWeight: '600', textAlign: 'center' },

  // Load
  loadRoute: { fontSize: 14, fontWeight: '700', color: '#67e8f9' },
  loadStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  loadStat: { minWidth: '22%', flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 8, alignItems: 'center' },
  loadStatVal: { fontSize: 13, fontWeight: '800', color: '#e2e8f0' },
  loadStatLabel: { fontSize: 13, color: '#cbd5e1', marginTop: 2, textTransform: 'uppercase' },

  // Actions
  findBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: 'rgba(34,197,94,0.12)', borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(34,197,94,0.3)' },
  findBtnIcon: { fontSize: 22 },
  findBtnTitle: { fontSize: 14, fontWeight: '800', color: '#4ade80' },
  findBtnSub: { fontSize: 13, color: '#cbd5e1' },
  findBtnArrow: { fontSize: 18, color: '#4ade80', fontWeight: '900' },
  statsBtn: { padding: 12, backgroundColor: 'rgba(6,182,212,0.08)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)', alignItems: 'center' },
  statsBtnText: { fontSize: 13, fontWeight: '700', color: '#06b6d4' },

  // AI
  aiCard: { margin: 12, padding: 12, backgroundColor: 'rgba(6,182,212,0.08)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)' },
  aiTitle: { fontSize: 12, fontWeight: '800', color: '#06b6d4', textTransform: 'uppercase', marginBottom: 6 },
  aiText: { fontSize: 12, color: '#e2e8f0', lineHeight: 18 },
});

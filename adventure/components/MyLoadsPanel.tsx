import { View, Text, StyleSheet, TouchableOpacity, FlatList, useWindowDimensions, useMemo } from 'react-native';
import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useThemeStore } from '../store/themeStore';
import { ThemeColors } from '../constants/themes';
import { useGameStore, ActiveLoad } from '../store/gameStore';
import { cityState } from '../constants/config';
import AssignModal from './AssignModal';
import CancelLoadModal from './CancelLoadModal';

export default function MyLoadsPanel() {
  const T = useTheme();
  const { mode: themeMode } = useThemeStore();
  const isDark = themeMode === 'dark';
  const styles = (useMemo as any)(() => makeStyles(T, isDark), [T, isDark]);

  const { bookedLoads, activeLoads, trucks } = useGameStore();
  const [assignLoad, setAssignLoad] = useState<ActiveLoad | null>(null);
  const [cancelLoad, setCancelLoad] = useState<ActiveLoad | null>(null);
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const unassigned = bookedLoads.filter(l => !l.truckId);
  const assigned = activeLoads;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isMobile && { fontSize: 14 }]}>📦 Мои грузы</Text>
        <Text style={[styles.headerSub, isMobile && { fontSize: 10 }]}>
          {unassigned.length} ожидают водителя · {assigned.length} в работе
        </Text>
      </View>

      {/* Ожидают назначения */}
      {unassigned.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionDot} />
            <Text style={[styles.sectionTitle, isMobile && { fontSize: 11 }]}>⏳ Ожидают водителя</Text>
          </View>
          {unassigned.map(load => (
            <View key={load.id} style={[styles.loadCard, styles.loadCardPending]}>
              <View style={styles.loadTop}>
                <Text style={[styles.loadRoute, isMobile && { fontSize: 14 }]}>{cityState(load.fromCity)} → {cityState(load.toCity)}</Text>
                <Text style={[styles.loadRate, isMobile && { fontSize: 15 }]}>${load.agreedRate.toLocaleString()}</Text>
              </View>
              <Text style={[styles.loadDetails, isMobile && { fontSize: 11 }]}>{load.commodity} · {load.miles} mi · {load.equipment}</Text>
              <Text style={[styles.loadBroker, isMobile && { fontSize: 10 }]}>Брокер: {load.brokerName}</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.assignBtn, { flex: 1 }]} onPress={() => setAssignLoad(load)}>
                  <Text style={[styles.assignBtnText, isMobile && { fontSize: 12 }]}>🚛 Назначить водителя</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtnSmall} onPress={() => setCancelLoad(load)}>
                  <Text style={styles.cancelBtnSmallText}>🚫</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* В работе */}
      {assigned.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: T.success }]} />
            <Text style={[styles.sectionTitle, isMobile && { fontSize: 11 }]}>🚛 В работе</Text>
          </View>
          {assigned.map(load => {
            const truck = trucks.find(t => t.id === load.truckId);
            const phaseLabel: Record<string, string> = {
              to_pickup: '🔵 Едет к погрузке',
              loading: '🟡 Грузится',
              to_delivery: '🟢 Везёт груз',
              unloading: '🟣 Разгружается',
              done: '✅ Доставлено',
            };
            return (
              <View key={load.id} style={[styles.loadCard, styles.loadCardActive]}>
                <View style={styles.loadTop}>
                  <Text style={[styles.loadRoute, isMobile && { fontSize: 14 }]}>{cityState(load.fromCity)} → {cityState(load.toCity)}</Text>
                  <Text style={[styles.loadRate, isMobile && { fontSize: 15 }]}>${load.agreedRate.toLocaleString()}</Text>
                </View>
                <Text style={[styles.loadDetails, isMobile && { fontSize: 11 }]}>{load.commodity} · {load.miles} mi</Text>
                <View style={styles.loadStatus}>
                  <Text style={[styles.loadStatusText, isMobile && { fontSize: 11 }]}>{phaseLabel[load.phase] || load.phase}</Text>
                  {truck && <Text style={[styles.loadTruck, isMobile && { fontSize: 10 }]}>🚛 {truck.name} · {truck.driver}</Text>}
                </View>
                {truck && (truck.status === 'driving' || truck.status === 'loaded') && (
                  <View style={styles.progressWrap}>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${truck.progress * 100}%` as any }]} />
                    </View>
                    <Text style={styles.progressText}>{Math.round(truck.progress * 100)}%</Text>
                  </View>
                )}
                {load.phase !== 'done' && (
                  <TouchableOpacity style={styles.cancelLoadBtn} onPress={() => setCancelLoad(load)}>
                    <Text style={styles.cancelLoadBtnText}>🚫 Отменить груз</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      )}

      {unassigned.length === 0 && assigned.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={[styles.emptyTitle, isMobile && { fontSize: 15 }]}>Нет грузов</Text>
          <Text style={[styles.emptySub, isMobile && { fontSize: 11 }]}>Найди груз на Load Board и договорись с брокером</Text>
        </View>
      )}

      {assignLoad && <AssignModal load={assignLoad} onClose={() => setAssignLoad(null)} />}
      {cancelLoad && <CancelLoadModal load={cancelLoad} onClose={() => setCancelLoad(null)} />}
    </View>
  );
}

function makeStyles(T: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: T.bg },
    header: {
      padding: 14, borderBottomWidth: 1, borderBottomColor: T.border,
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    headerTitle: { fontSize: 16, fontWeight: '900', color: T.text },
    headerSub: { fontSize: 11, color: T.textDim },

    section: { padding: 10, gap: 8 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    sectionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: T.warning },
    sectionTitle: { fontSize: 12, fontWeight: '800', color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1 },

    loadCard: {
      backgroundColor: isDark ? '#0d1526' : T.bgCard,
      borderRadius: 14,
      borderWidth: 1, borderColor: isDark ? '#1e2d45' : T.border,
      padding: 14, gap: 6,
    },
    loadCardPending: {
      borderColor: 'rgba(249,115,22,0.4)',
      backgroundColor: isDark ? 'rgba(249,115,22,0.06)' : 'rgba(249,115,22,0.04)',
    },
    loadCardActive: {
      borderColor: isDark ? 'rgba(34,197,94,0.3)' : 'rgba(52,199,89,0.2)',
      backgroundColor: isDark ? 'rgba(34,197,94,0.04)' : 'rgba(52,199,89,0.03)',
    },

    loadTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    loadRoute: { fontSize: 15, fontWeight: '900', color: T.text },
    loadRate: { fontSize: 16, fontWeight: '900', color: T.success },
    loadDetails: { fontSize: 12, color: T.textMuted },
    loadBroker: { fontSize: 11, color: T.textDim },

    loadStatus: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    loadStatusText: { fontSize: 12, fontWeight: '700', color: T.textSecondary },
    loadTruck: { fontSize: 11, color: T.primary },

    progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    progressTrack: { flex: 1, height: 4, backgroundColor: T.bgCardHover, borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: T.success, borderRadius: 2 },
    progressText: { fontSize: 10, color: T.textDim, width: 30 },

    actionRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
    assignBtn: {
      backgroundColor: T.primary, borderRadius: 10,
      paddingVertical: 10, alignItems: 'center', marginTop: 4,
    },
    assignBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' },

    cancelBtnSmall: {
      backgroundColor: 'rgba(239,68,68,0.15)',
      borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
      borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14,
      alignItems: 'center', justifyContent: 'center', marginTop: 4,
    },
    cancelBtnSmallText: { fontSize: 16 },

    cancelLoadBtn: {
      backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
      borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
      borderRadius: 8, paddingVertical: 8, alignItems: 'center', marginTop: 8,
    },
    cancelLoadBtnText: { fontSize: 12, fontWeight: '700', color: '#ef4444' },

    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 },
    emptyIcon: { fontSize: 40 },
    emptyTitle: { fontSize: 16, fontWeight: '800', color: T.text },
    emptySub: { fontSize: 12, color: T.textDim, textAlign: 'center', lineHeight: 18 },
  });
}

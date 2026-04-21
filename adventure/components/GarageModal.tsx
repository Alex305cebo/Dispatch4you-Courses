import { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { Colors } from '../constants/colors';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../constants/themes';

const NEW_TRUCK_PRICE = 15000;

export default function GarageModal() {
  const T = useTheme();
  const styles = useMemo(() => makeStyles(T), [T]);
  const { garageOpen, setGarageOpen, balance, trucks, buyNewTruck } = useGameStore();

  const canAfford = balance >= NEW_TRUCK_PRICE;
  const oldTruck = trucks.find(t => (t as any).isOldTruck);
  const currentTruckCount = trucks.length;
  const progress = Math.min(1, balance / NEW_TRUCK_PRICE);
  const progressPct = Math.round(progress * 100);

  function handleBuy() {
    if (!canAfford) return;
    const ok = buyNewTruck();
    if (ok) setGarageOpen(false);
  }

  return (
    <Modal
      visible={garageOpen}
      transparent
      animationType="slide"
      onRequestClose={() => setGarageOpen(false)}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => setGarageOpen(false)}
      />
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🏪 Гараж</Text>
          <TouchableOpacity onPress={() => setGarageOpen(false)} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {/* Баланс */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Твой баланс</Text>
            <Text style={[styles.balanceValue, { color: canAfford ? '#4ade80' : '#f97316' }]}>
              ${balance.toLocaleString()}
            </Text>
            {!canAfford && (
              <Text style={styles.balanceNeed}>
                Нужно ещё ${(NEW_TRUCK_PRICE - balance).toLocaleString()}
              </Text>
            )}
          </View>

          {/* Прогресс-бар */}
          <View style={styles.progressWrap}>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progressPct}%` as any }]} />
            </View>
            <Text style={styles.progressLabel}>{progressPct}% от $15,000</Text>
          </View>

          {/* Старый трак — что с ним не так */}
          {oldTruck && (
            <View style={styles.oldTruckCard}>
              <Text style={styles.oldTruckTitle}>⚠️ {oldTruck.name} — Старый трак</Text>
              <View style={styles.oldTruckProblems}>
                <View style={styles.problemRow}>
                  <Text style={styles.problemIcon}>🐢</Text>
                  <Text style={styles.problemText}>Едет на 20% медленнее обычного</Text>
                </View>
                <View style={styles.problemRow}>
                  <Text style={styles.problemIcon}>🔧</Text>
                  <Text style={styles.problemText}>Ломается в 3× чаще нового</Text>
                </View>
                <View style={styles.problemRow}>
                  <Text style={styles.problemIcon}>⛽</Text>
                  <Text style={styles.problemText}>Расход топлива выше нормы</Text>
                </View>
                <View style={styles.problemRow}>
                  <Text style={styles.problemIcon}>😤</Text>
                  <Text style={styles.problemText}>Водитель регулярно жалуется</Text>
                </View>
              </View>
            </View>
          )}

          {/* Новый трак — что получишь */}
          <View style={styles.newTruckCard}>
            <Text style={styles.newTruckTitle}>🚛 Новый трак — $15,000</Text>
            <View style={styles.newTruckFeatures}>
              <View style={styles.featureRow}>
                <Text style={styles.featureIcon}>✅</Text>
                <Text style={styles.featureText}>Полная скорость — без штрафов</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.featureIcon}>✅</Text>
                <Text style={styles.featureText}>Минимальный риск поломок</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.featureIcon}>✅</Text>
                <Text style={styles.featureText}>Довольный водитель — лучше работает</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.featureIcon}>✅</Text>
                <Text style={styles.featureText}>Флот растёт — больше грузов</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]}
              onPress={handleBuy}
              disabled={!canAfford}
              activeOpacity={0.8}
            >
              <Text style={styles.buyBtnText}>
                {canAfford ? '🎉 Купить новый трак — $15,000' : `Нужно ещё $${(NEW_TRUCK_PRICE - balance).toLocaleString()}`}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Текущий флот */}
          <View style={styles.fleetInfo}>
            <Text style={styles.fleetInfoTitle}>Текущий флот: {currentTruckCount} {currentTruckCount === 1 ? 'трак' : 'трака'}</Text>
            {trucks.map(t => (
              <View key={t.id} style={styles.fleetTruckRow}>
                <Text style={styles.fleetTruckIcon}>{(t as any).isOldTruck ? '🚚' : '🚛'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fleetTruckName}>{t.name}</Text>
                  <Text style={styles.fleetTruckDriver}>{t.driver}</Text>
                </View>
                {(t as any).isOldTruck && (
                  <View style={styles.oldBadge}>
                    <Text style={styles.oldBadgeText}>СТАРЫЙ</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function makeStyles(T: ThemeColors) {
  return StyleSheet.create({
    overlay: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
    panel: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      backgroundColor: Colors.bgCard,
      borderTopLeftRadius: 20, borderTopRightRadius: 20,
      borderWidth: 1, borderColor: Colors.border,
      maxHeight: '85%',
      paddingBottom: 20,
    },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border,
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
    closeBtn: {
      width: 28, height: 28, borderRadius: 14,
      backgroundColor: 'rgba(255,255,255,0.08)',
      alignItems: 'center', justifyContent: 'center',
    },
    closeBtnText: { fontSize: 14, color: Colors.textMuted, fontWeight: '600' },

    balanceCard: {
      margin: 16, marginBottom: 8,
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
      padding: 14, alignItems: 'center',
    },
    balanceLabel: { fontSize: 11, fontWeight: '600', color: Colors.textMuted, marginBottom: 4 },
    balanceValue: { fontSize: 28, fontWeight: '800' },
    balanceNeed: { fontSize: 12, color: '#f97316', marginTop: 4, fontWeight: '600' },

    progressWrap: { marginHorizontal: 16, marginBottom: 12 },
    progressBg: {
      height: 8, backgroundColor: 'rgba(255,255,255,0.08)',
      borderRadius: 4, overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#06b6d4',
      borderRadius: 4,
    },
    progressLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 4, textAlign: 'right' },

    oldTruckCard: {
      marginHorizontal: 16, marginBottom: 12,
      backgroundColor: 'rgba(239,68,68,0.07)',
      borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
      padding: 12,
    },
    oldTruckTitle: { fontSize: 13, fontWeight: '800', color: '#ef4444', marginBottom: 8 },
    oldTruckProblems: { gap: 6 },
    problemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    problemIcon: { fontSize: 14, width: 20 },
    problemText: { fontSize: 12, color: '#e2e8f0', flex: 1 },

    newTruckCard: {
      marginHorizontal: 16, marginBottom: 12,
      backgroundColor: 'rgba(74,222,128,0.07)',
      borderRadius: 12, borderWidth: 1, borderColor: 'rgba(74,222,128,0.25)',
      padding: 12,
    },
    newTruckTitle: { fontSize: 13, fontWeight: '800', color: '#4ade80', marginBottom: 8 },
    newTruckFeatures: { gap: 6, marginBottom: 12 },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    featureIcon: { fontSize: 14, width: 20 },
    featureText: { fontSize: 12, color: '#e2e8f0', flex: 1 },

    buyBtn: {
      backgroundColor: '#16a34a',
      borderRadius: 12, padding: 14,
      alignItems: 'center',
    },
    buyBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.08)' },
    buyBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },

    fleetInfo: {
      marginHorizontal: 16,
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
      padding: 12,
    },
    fleetInfoTitle: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    fleetTruckRow: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    fleetTruckIcon: { fontSize: 18 },
    fleetTruckName: { fontSize: 13, fontWeight: '700', color: Colors.text },
    fleetTruckDriver: { fontSize: 11, color: Colors.textMuted },
    oldBadge: {
      backgroundColor: 'rgba(239,68,68,0.15)',
      borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2,
      borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
    },
    oldBadgeText: { fontSize: 9, fontWeight: '800', color: '#ef4444' },
  });
}

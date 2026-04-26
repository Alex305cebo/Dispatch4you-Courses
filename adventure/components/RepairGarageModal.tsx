import { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../constants/themes';

const UPGRADES = [
  { id: 'engine', icon: '⚡', label: 'Двигатель', desc: '+10% скорость, +0.5 MPG', cost: 3000, color: '#06b6d4' },
  { id: 'tires', icon: '🛞', label: 'Новые шины', desc: '+10 Safety Score', cost: 1500, color: '#4ade80' },
  { id: 'brakes', icon: '🛑', label: 'Тормоза', desc: '+12 Safety, +5% Compliance', cost: 2000, color: '#f87171' },
  { id: 'apu', icon: '❄️', label: 'APU система', desc: '+0.8 MPG экономия', cost: 4000, color: '#8b5cf6' },
  { id: 'sleeper', icon: '🛏️', label: 'Кабина', desc: '+15 настроение водителя', cost: 2500, color: '#fb923c' },
  { id: 'gps', icon: '📡', label: 'GPS + ELD', desc: '+8% HOS Compliance', cost: 800, color: '#38bdf8' },
];

export default function RepairGarageModal() {
  const T = useTheme();
  const s = useMemo(() => makeStyles(T), [T]);
  const { repairGarageOpen, setRepairGarageOpen, trucks, balance,
    repairTruckInGarage, upgradeTruckInGarage, releaseFromGarage } = useGameStore();

  const garageTrucks = trucks.filter(t => t.status === 'in_garage');

  if (!repairGarageOpen) return null;

  return (
    <Modal visible={repairGarageOpen} transparent animationType="slide" onRequestClose={() => setRepairGarageOpen(false)}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setRepairGarageOpen(false)} />
      <View style={s.panel}>
        {/* Header */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>🏗️ Гараж — Ремонт и Улучшения</Text>
            <Text style={s.subtitle}>Баланс: ${balance.toLocaleString()}</Text>
          </View>
          <TouchableOpacity onPress={() => setRepairGarageOpen(false)} style={s.closeBtn}>
            <Text style={s.closeTxt}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={s.body} contentContainerStyle={{ paddingBottom: 30 }}>
          {garageTrucks.length === 0 ? (
            <View style={s.empty}>
              <Text style={{ fontSize: 40 }}>🏗️</Text>
              <Text style={s.emptyTitle}>Гараж пуст</Text>
              <Text style={s.emptyDesc}>Траки попадают в гараж после эвакуации. Здесь можно ремонтировать и улучшать.</Text>
            </View>
          ) : (
            garageTrucks.map(truck => {
              const repairDone = truck.garageRepairDone;
              const installed = truck.garageUpgrades || [];
              const repairCost = truck.isOldTruck ? 2500 : 1200;
              const canRepair = !repairDone && balance >= repairCost;

              return (
                <View key={truck.id} style={s.truckCard}>
                  {/* Truck header */}
                  <View style={s.truckHeader}>
                    <Text style={{ fontSize: 28 }}>🚛</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.truckName}>{truck.name}</Text>
                      <Text style={s.truckDriver}>👤 {truck.driver} • 📍 {truck.garageCity || truck.currentCity}</Text>
                    </View>
                    <View style={[s.statusBadge, { borderColor: repairDone ? '#4ade8055' : '#f59e0b55', backgroundColor: repairDone ? '#4ade8012' : '#f59e0b12' }]}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: repairDone ? '#4ade80' : '#f59e0b' }}>
                        {repairDone ? '✅ Отремонтирован' : '⚠️ Требует ремонта'}
                      </Text>
                    </View>
                  </View>

                  {/* Stats */}
                  <View style={s.statsRow}>
                    <View style={s.stat}><Text style={s.statLabel}>Safety</Text><Text style={s.statVal}>{truck.safetyScore || 70}</Text></View>
                    <View style={s.stat}><Text style={s.statLabel}>MPG</Text><Text style={s.statVal}>{(truck.fuelEfficiency || 6.5).toFixed(1)}</Text></View>
                    <View style={s.stat}><Text style={s.statLabel}>Mood</Text><Text style={s.statVal}>{truck.mood || 60}%</Text></View>
                    <View style={s.stat}><Text style={s.statLabel}>HOS</Text><Text style={s.statVal}>{truck.complianceRate || 80}%</Text></View>
                  </View>

                  {/* Repair button */}
                  {!repairDone && (
                    <TouchableOpacity
                      style={[s.repairBtn, !canRepair && s.btnDisabled]}
                      onPress={() => canRepair && repairTruckInGarage(truck.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={s.repairBtnTxt}>🔧 Полный ремонт — ${repairCost.toLocaleString()}</Text>
                      {truck.isOldTruck && <Text style={s.repairNote}>Старый трак → как новый</Text>}
                    </TouchableOpacity>
                  )}

                  {/* Upgrades */}
                  <Text style={s.sectionTitle}>⬆️ Улучшения</Text>
                  <View style={s.upgradesGrid}>
                    {UPGRADES.map(up => {
                      const done = installed.includes(up.id);
                      const canBuy = !done && balance >= up.cost;
                      return (
                        <TouchableOpacity
                          key={up.id}
                          style={[s.upgradeCard, { borderColor: done ? '#4ade8044' : up.color + '44' }, done && s.upgradeDone]}
                          onPress={() => canBuy && upgradeTruckInGarage(truck.id, up.id)}
                          activeOpacity={done ? 1 : 0.8}
                        >
                          <Text style={{ fontSize: 22 }}>{up.icon}</Text>
                          <Text style={[s.upgradeName, { color: done ? '#4ade80' : up.color }]}>{up.label}</Text>
                          <Text style={s.upgradeDesc}>{up.desc}</Text>
                          {done ? (
                            <Text style={s.upgradeDoneTxt}>✅ Установлено</Text>
                          ) : (
                            <Text style={[s.upgradePrice, { color: canBuy ? up.color : '#64748b' }]}>${up.cost.toLocaleString()}</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Release button */}
                  <TouchableOpacity
                    style={s.releaseBtn}
                    onPress={() => { releaseFromGarage(truck.id); if (garageTrucks.length <= 1) setRepairGarageOpen(false); }}
                    activeOpacity={0.8}
                  >
                    <Text style={s.releaseBtnTxt}>🚛 Выпустить из гаража — готов к работе</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

function makeStyles(T: ThemeColors) {
  return StyleSheet.create({
    overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)' },
    panel: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      maxHeight: '85%', backgroundColor: T.bgCard,
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      borderWidth: 1.5, borderColor: 'rgba(245,158,11,0.3)',
      borderBottomWidth: 0,
    },
    header: {
      flexDirection: 'row', alignItems: 'center', padding: 16,
      borderBottomWidth: 1, borderBottomColor: T.border,
    },
    title: { fontSize: 18, fontWeight: '900', color: '#f59e0b' },
    subtitle: { fontSize: 12, color: T.textSecondary, marginTop: 2 },
    closeBtn: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: T.border, alignItems: 'center', justifyContent: 'center',
    },
    closeTxt: { fontSize: 16, color: T.textSecondary },
    body: { flex: 1, padding: 16 },
    empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
    emptyTitle: { fontSize: 16, fontWeight: '800', color: T.textSecondary },
    emptyDesc: { fontSize: 12, color: T.textMuted, textAlign: 'center', maxWidth: 280 },
    truckCard: {
      backgroundColor: 'rgba(245,158,11,0.04)', borderRadius: 16,
      borderWidth: 1.5, borderColor: 'rgba(245,158,11,0.2)',
      padding: 14, marginBottom: 16, gap: 12,
    },
    truckHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    truckName: { fontSize: 15, fontWeight: '900', color: '#e2e8f0' },
    truckDriver: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
    statusBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
    statsRow: { flexDirection: 'row', gap: 8 },
    stat: {
      flex: 1, alignItems: 'center', padding: 8,
      backgroundColor: T.border, borderRadius: 10,
    },
    statLabel: { fontSize: 9, fontWeight: '700', color: T.textMuted, textTransform: 'uppercase' },
    statVal: { fontSize: 14, fontWeight: '900', color: '#e2e8f0', marginTop: 2 },
    repairBtn: {
      backgroundColor: 'rgba(245,158,11,0.12)', borderRadius: 12,
      borderWidth: 2, borderColor: 'rgba(245,158,11,0.4)',
      padding: 14, alignItems: 'center', gap: 4,
    },
    repairBtnTxt: { fontSize: 14, fontWeight: '900', color: '#f59e0b' },
    repairNote: { fontSize: 10, color: '#94a3b8' },
    btnDisabled: { opacity: 0.4 },
    sectionTitle: { fontSize: 13, fontWeight: '800', color: '#e2e8f0', marginTop: 4 },
    upgradesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    upgradeCard: {
      width: '48%', borderRadius: 12, borderWidth: 1.5,
      padding: 10, alignItems: 'center', gap: 4,
      backgroundColor: 'rgba(255,255,255,0.03)',
    },
    upgradeDone: { backgroundColor: 'rgba(74,222,128,0.06)' },
    upgradeName: { fontSize: 12, fontWeight: '800' },
    upgradeDesc: { fontSize: 9, color: '#94a3b8', textAlign: 'center' },
    upgradePrice: { fontSize: 13, fontWeight: '900', marginTop: 2 },
    upgradeDoneTxt: { fontSize: 10, fontWeight: '700', color: '#4ade80', marginTop: 2 },
    releaseBtn: {
      backgroundColor: 'rgba(74,222,128,0.12)', borderRadius: 12,
      borderWidth: 2, borderColor: 'rgba(74,222,128,0.4)',
      padding: 14, alignItems: 'center',
    },
    releaseBtnTxt: { fontSize: 14, fontWeight: '900', color: '#4ade80' },
  });
}

import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Image } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../constants/themes';
import TruckStatsView from './TruckStatsView';

const getTruckImageUri = (id: number): string => {
  const isGame = typeof window !== 'undefined' && (
    window.location.pathname.startsWith('/game') ||
    window.location.pathname.includes('/game/')
  );
  const basePath = isGame ? '/game/assets/TruckPic' : '/assets/TruckPic';
  return `${basePath}/${id}.webp`;
};

const STATUS_LABEL: Record<string, string> = {
  idle: 'Свободен', driving: 'К погрузке', loaded: 'В пути',
  at_pickup: 'Погрузка', at_delivery: 'Разгрузка',
  breakdown: 'Поломка', waiting: 'Ожидание', in_garage: 'В гараже',
};
const STATUS_COLOR: Record<string, string> = {
  idle: '#38bdf8', driving: '#4ade80', loaded: '#4ade80',
  at_pickup: '#fbbf24', at_delivery: '#fbbf24',
  breakdown: '#f87171', waiting: '#fb923c', in_garage: '#f59e0b',
};

const UPGRADES = [
  { id: 'engine', icon: '⚡', label: 'Двигатель', desc: '+10% скорость, +0.5 MPG', cost: 3000, color: '#06b6d4' },
  { id: 'tires', icon: '🛞', label: 'Новые шины', desc: '+10 Safety Score', cost: 1500, color: '#4ade80' },
  { id: 'brakes', icon: '🛑', label: 'Тормоза', desc: '+12 Safety, +5% Compliance', cost: 2000, color: '#f87171' },
  { id: 'apu', icon: '❄️', label: 'APU система', desc: '+0.8 MPG экономия', cost: 4000, color: '#8b5cf6' },
  { id: 'sleeper', icon: '🛏️', label: 'Кабина', desc: '+15 настроение водителя', cost: 2500, color: '#fb923c' },
  { id: 'gps', icon: '📡', label: 'GPS + ELD', desc: '+8% HOS Compliance', cost: 800, color: '#38bdf8' },
];

type Tab = 'fleet' | 'repair' | 'shop';

export default function RepairGarageModal() {
  const T = useTheme();
  const s = useMemo(() => makeStyles(T), [T]);
  const { repairGarageOpen, setRepairGarageOpen, trucks, balance,
    repairTruckInGarage, upgradeTruckInGarage, releaseFromGarage, repairSpecificStat } = useGameStore();
  const setTruckShopOpen = useGameStore(ss => ss.setTruckShopOpen);
  const [tab, setTab] = useState<Tab>('fleet');

  const garageTrucks = trucks.filter(t => t.status === 'in_garage');

  if (!repairGarageOpen) return null;

  return (
    <Modal visible={repairGarageOpen} transparent animationType="slide" onRequestClose={() => setRepairGarageOpen(false)}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setRepairGarageOpen(false)} />
      <View style={s.panel}>
        {/* Header */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>🏗️ Гараж</Text>
            <Text style={s.subtitle}>Баланс: ${balance.toLocaleString()}</Text>
          </View>
          <TouchableOpacity onPress={() => setRepairGarageOpen(false)} style={s.closeBtn}>
            <Text style={s.closeTxt}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={s.tabBar}>
          <TouchableOpacity
            style={[s.tab, tab === 'fleet' && s.tabActive]}
            onPress={() => setTab('fleet')}
            activeOpacity={0.8}
          >
            <Text style={[s.tabText, tab === 'fleet' && s.tabTextActive]}>🚛 Мой флот</Text>
            <View style={[s.tabCount, tab === 'fleet' && s.tabCountActive]}>
              <Text style={[s.tabCountText, tab === 'fleet' && s.tabCountTextActive]}>{trucks.length}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tab, tab === 'repair' && s.tabActive]}
            onPress={() => setTab('repair')}
            activeOpacity={0.8}
          >
            <Text style={[s.tabText, tab === 'repair' && s.tabTextActive]}>🔧 Ремонт</Text>
            {garageTrucks.length > 0 && (
              <View style={[s.tabCount, { backgroundColor: '#f59e0b22', borderColor: '#f59e0b55' }, tab === 'repair' && { backgroundColor: '#f59e0b', borderColor: '#f59e0b' }]}>
                <Text style={[s.tabCountText, { color: '#f59e0b' }, tab === 'repair' && { color: '#fff' }]}>{garageTrucks.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tab, tab === 'shop' && s.tabActive]}
            onPress={() => { setRepairGarageOpen(false); setTruckShopOpen(true); }}
            activeOpacity={0.8}
          >
            <Text style={[s.tabText, tab === 'shop' && s.tabTextActive]}>🏪 Магазин</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={s.body} contentContainerStyle={{ paddingBottom: 30 }}>
          {/* ── TAB: МОЙ ФЛОТ ── */}
          {tab === 'fleet' && (
            <View style={{ gap: 6 }}>
              {trucks.map(truck => {
                const isOld = (truck as any).isOldTruck;
                const imgId = (truck as any).truckImageId;
                const stColor = STATUS_COLOR[truck.status] || '#94a3b8';
                const stLabel = STATUS_LABEL[truck.status] || truck.status;
                return (
                  <View key={truck.id} style={s.fleetRow}>
                    <View style={s.fleetImgWrap}>
                      {imgId ? (
                        <Image source={{ uri: getTruckImageUri(imgId) }} style={{ width: 48, height: 48, borderRadius: 10 } as any} resizeMode="cover" />
                      ) : (
                        <Text style={{ fontSize: 24 }}>{isOld ? '🚚' : '🚛'}</Text>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.fleetName}>{truck.name}</Text>
                      <Text style={s.fleetDriver}>👤 {truck.driver} · 📍 {truck.currentCity || '—'}</Text>
                    </View>
                    <View style={[s.fleetBadge, { borderColor: stColor + '55', backgroundColor: stColor + '12' }]}>
                      <Text style={{ fontSize: 9, fontWeight: '800', color: stColor }}>{stLabel}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* ── TAB: РЕМОНТ ── */}
          {tab === 'repair' && (
            <>
              {garageTrucks.length === 0 ? (
                <View style={s.empty}>
                  <Text style={{ fontSize: 28 }}>🔧</Text>
                  <Text style={s.emptyTitle}>Ремонтная зона пуста</Text>
                  <Text style={s.emptyDesc}>Траки попадают сюда после эвакуации. Здесь можно ремонтировать и улучшать.</Text>
                </View>
              ) : (
                garageTrucks.map(truck => {
                  const repairDone = truck.garageRepairDone;
                  const installed = truck.garageUpgrades || [];
                  const repairCost = truck.isOldTruck ? 2500 : 1200;
                  const canRepair = !repairDone && balance >= repairCost;
                  const imgId = (truck as any).truckImageId;
                  return (
                    <View key={truck.id} style={s.truckCard}>
                      <View style={s.truckHeader}>
                        {imgId ? (
                          <Image source={{ uri: getTruckImageUri(imgId) }} style={{ width: 40, height: 40, borderRadius: 8 } as any} resizeMode="cover" />
                        ) : (
                          <Text style={{ fontSize: 28 }}>🚛</Text>
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={s.truckName}>{truck.name}</Text>
                          <Text style={s.truckDriver}>👤 {truck.driver} • 📍 {truck.garageCity || truck.currentCity}</Text>
                        </View>
                        <View style={[s.statusBadge, { borderColor: repairDone ? '#4ade8055' : '#f59e0b55', backgroundColor: repairDone ? '#4ade8012' : '#f59e0b12' }]}>
                          <Text style={{ fontSize: 10, fontWeight: '800', color: repairDone ? '#4ade80' : '#f59e0b' }}>
                            {repairDone ? '✅ Готов' : '⚠️ Ремонт'}
                          </Text>
                        </View>
                      </View>
                      <View style={s.statsRow}>
                        <View style={s.stat}><Text style={s.statLabel}>Safety</Text><Text style={s.statVal}>{truck.safetyScore || 70}</Text></View>
                        <View style={s.stat}><Text style={s.statLabel}>MPG</Text><Text style={s.statVal}>{(truck.fuelEfficiency || 6.5).toFixed(1)}</Text></View>
                        <View style={s.stat}><Text style={s.statLabel}>Mood</Text><Text style={s.statVal}>{truck.mood || 60}%</Text></View>
                        <View style={s.stat}><Text style={s.statLabel}>HOS</Text><Text style={s.statVal}>{truck.complianceRate || 80}%</Text></View>
                      </View>

                      {/* ── ХАРАКТЕРИСТИКИ ИЗНОСА ── */}
                      <TruckStatsView truck={truck} compact={true} />

                      {!repairDone && (
                        <>
                          {/* Частичный ремонт — по каждому стату */}
                          <Text style={s.sectionTitle}>🔩 Частичный ремонт</Text>
                          <View style={s.partialRepairGrid}>
                            {([
                              { key: 'reliability' as const, icon: '🔧', label: 'Надёжность',    cost: 800,  color: '#f87171' },
                              { key: 'comfort'     as const, icon: '🛋️', label: 'Комфорт',       cost: 400,  color: '#fb923c' },
                              { key: 'legalStatus' as const, icon: '📋', label: 'Тех. состояние', cost: 600,  color: '#fbbf24' },
                              { key: 'performance' as const, icon: '⚡', label: 'Производит.',   cost: 1000, color: '#06b6d4' },
                            ]).map(item => {
                              const val = Math.round((truck as any)[item.key] ?? 100);
                              const isMax = val >= 100;
                              const canBuy = !isMax && balance >= item.cost;
                              return (
                                <TouchableOpacity
                                  key={item.key}
                                  style={[
                                    s.partialBtn,
                                    { borderColor: isMax ? '#4ade8044' : item.color + '44' },
                                    !canBuy && s.btnDisabled,
                                  ]}
                                  onPress={() => canBuy && repairSpecificStat(truck.id, item.key)}
                                  activeOpacity={canBuy ? 0.75 : 1}
                                >
                                  <Text style={{ fontSize: 18 }}>{isMax ? '✅' : item.icon}</Text>
                                  <Text style={[s.partialBtnLabel, { color: isMax ? '#4ade80' : item.color }]}>
                                    {item.label}
                                  </Text>
                                  <Text style={s.partialBtnVal}>{val}/100</Text>
                                  {!isMax && (
                                    <Text style={[s.partialBtnCost, { color: canBuy ? item.color : '#64748b' }]}>
                                      ${item.cost.toLocaleString()}
                                    </Text>
                                  )}
                                </TouchableOpacity>
                              );
                            })}
                          </View>

                          {/* Полный ремонт */}
                          <TouchableOpacity
                            style={[s.repairBtn, !canRepair && s.btnDisabled]}
                            onPress={() => canRepair && repairTruckInGarage(truck.id)}
                            activeOpacity={0.8}
                          >
                            <Text style={s.repairBtnTxt}>🔧 Полный ремонт — ${repairCost.toLocaleString()}</Text>
                            {truck.isOldTruck && <Text style={s.repairNote}>Старый трак → все статы 100%</Text>}
                          </TouchableOpacity>
                        </>
                      )}
                      <Text style={s.sectionTitle}>⬆️ Улучшения</Text>
                      <View style={s.upgradesGrid}>
                        {UPGRADES.map(up => {
                          const done = installed.includes(up.id);
                          const canBuy = !done && balance >= up.cost;
                          return (
                            <TouchableOpacity key={up.id} style={[s.upgradeCard, { borderColor: done ? '#4ade8044' : up.color + '44' }, done && s.upgradeDone]} onPress={() => canBuy && upgradeTruckInGarage(truck.id, up.id)} activeOpacity={done ? 1 : 0.8}>
                              <Text style={{ fontSize: 22 }}>{up.icon}</Text>
                              <Text style={[s.upgradeName, { color: done ? '#4ade80' : up.color }]}>{up.label}</Text>
                              <Text style={s.upgradeDesc}>{up.desc}</Text>
                              {done ? <Text style={s.upgradeDoneTxt}>✅</Text> : <Text style={[s.upgradePrice, { color: canBuy ? up.color : '#64748b' }]}>${up.cost.toLocaleString()}</Text>}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                      <TouchableOpacity style={s.releaseBtn} onPress={() => { releaseFromGarage(truck.id); if (garageTrucks.length <= 1) setRepairGarageOpen(false); }} activeOpacity={0.8}>
                        <Text style={s.releaseBtnTxt}>🚛 Выпустить — готов к работе</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </>
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
      flexDirection: 'row', alignItems: 'center', padding: 14, paddingBottom: 10,
      borderBottomWidth: 0,
    },
    title: { fontSize: 18, fontWeight: '900', color: '#f59e0b' },
    subtitle: { fontSize: 11, color: T.textSecondary, marginTop: 2 },
    closeBtn: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: T.border, alignItems: 'center', justifyContent: 'center',
    },
    closeTxt: { fontSize: 16, color: T.textSecondary },

    // Tabs
    tabBar: {
      flexDirection: 'row', gap: 6,
      paddingHorizontal: 14, paddingBottom: 10,
      borderBottomWidth: 1, borderBottomColor: T.border,
    },
    tab: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
      paddingVertical: 9, borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)',
    },
    tabActive: {
      backgroundColor: 'rgba(245,158,11,0.12)',
      borderColor: 'rgba(245,158,11,0.4)',
    },
    tabText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
    tabTextActive: { color: '#f59e0b', fontWeight: '900' },
    tabCount: {
      minWidth: 20, height: 18, borderRadius: 9,
      alignItems: 'center', justifyContent: 'center',
      paddingHorizontal: 5,
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    },
    tabCountActive: { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
    tabCountText: { fontSize: 10, fontWeight: '900', color: '#94a3b8' },
    tabCountTextActive: { color: '#fff' },

    body: { flex: 1, padding: 14 },
    empty: { alignItems: 'center', paddingVertical: 24, gap: 6 },
    emptyTitle: { fontSize: 14, fontWeight: '800', color: T.textSecondary },
    emptyDesc: { fontSize: 11, color: T.textMuted, textAlign: 'center', maxWidth: 280 },

    // Fleet
    fleetRow: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      padding: 10, borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    fleetImgWrap: {
      width: 48, height: 48, borderRadius: 10,
      backgroundColor: 'rgba(6,182,212,0.08)',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    },
    fleetName: { fontSize: 13, fontWeight: '800', color: '#e2e8f0' },
    fleetDriver: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
    fleetBadge: { borderRadius: 7, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 3 },

    // Repair
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

    // Частичный ремонт
    partialRepairGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
    partialBtn: {
      width: '48%', borderRadius: 12, borderWidth: 1.5,
      padding: 10, alignItems: 'center', gap: 3,
      backgroundColor: 'rgba(255,255,255,0.03)',
    },
    partialBtnLabel: { fontSize: 11, fontWeight: '800', textAlign: 'center' },
    partialBtnVal: { fontSize: 13, fontWeight: '900', color: '#e2e8f0' },
    partialBtnCost: { fontSize: 11, fontWeight: '700', marginTop: 1 },
  });
}

import { useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, ScrollView, useWindowDimensions,
} from 'react-native';
import { useGameStore } from '../store/gameStore';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../constants/themes';

const NEW_TRUCK_PRICE = 15_000;

const TRUCK_CATALOG = [
  {
    id: 'kenworth-t680',
    brand: 'KENWORTH',
    model: 'T680',
    year: '2024',
    price: 15_000,
    badge: 'BESTSELLER',
    badgeColor: '#f97316',
    specs: [
      { icon: '⚡', label: 'Engine', value: 'PACCAR MX-13 455HP' },
      { icon: '⛽', label: 'MPG', value: '6.8 avg' },
      { icon: '📦', label: 'GVW', value: '80,000 lbs' },
      { icon: '🛣️', label: 'Miles', value: '0' },
    ],
    features: ['Auto Trans', 'Sleeper Cab', 'APU', 'GPS'],
    color: '#06b6d4',
  },
  {
    id: 'peterbilt-579',
    brand: 'PETERBILT',
    model: '579',
    year: '2024',
    price: 15_000,
    badge: 'NEW',
    badgeColor: '#4ade80',
    specs: [
      { icon: '⚡', label: 'Engine', value: 'Cummins X15 500HP' },
      { icon: '⛽', label: 'MPG', value: '7.1 avg' },
      { icon: '📦', label: 'GVW', value: '80,000 lbs' },
      { icon: '🛣️', label: 'Miles', value: '0' },
    ],
    features: ['Aerodynamic', 'Large Cab', 'Eco Mode', 'Lane Assist'],
    color: '#8b5cf6',
  },
];

export default function GarageModal() {
  const T = useTheme();
  const { height: screenH } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(T, screenH), [T, screenH]);

  const { garageOpen, setGarageOpen, balance, trucks, buyNewTruck } = useGameStore();

  const canAfford = balance >= NEW_TRUCK_PRICE;
  const progressPct = Math.round(Math.min(1, balance / NEW_TRUCK_PRICE) * 100);
  const currentTruckCount = trucks.length;

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
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setGarageOpen(false)} />

      <View style={styles.panelWrap}>
        <View style={styles.panel}>

          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerLogo}>🏢</Text>
              <View>
                <Text style={styles.headerTitle}>TRUCK DEALER</Text>
                <Text style={styles.headerSub}>Premium Fleet Solutions</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setGarageOpen(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

            {/* WALLET */}
            <View style={styles.walletBar}>
              <View>
                <Text style={styles.walletLabel}>💳 Бюджет</Text>
                <Text style={[styles.walletValue, { color: canAfford ? '#4ade80' : '#f97316' }]}>
                  ${balance.toLocaleString()}
                </Text>
              </View>
              <View style={styles.walletRight}>
                <View style={[styles.walletBadge, { backgroundColor: canAfford ? 'rgba(74,222,128,0.12)' : 'rgba(249,115,22,0.12)', borderColor: canAfford ? 'rgba(74,222,128,0.3)' : 'rgba(249,115,22,0.3)' }]}>
                  <Text style={styles.walletBadgeText}>
                    {canAfford ? '✓ Достаточно' : `Нужно ещё $${(NEW_TRUCK_PRICE - balance).toLocaleString()}`}
                  </Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${progressPct}%` as any }]} />
                </View>
                <Text style={styles.progressLabel}>{progressPct}% накоплено</Text>
              </View>
            </View>

            {/* CATALOG LABEL */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>📋 Каталог</Text>
              <Text style={styles.sectionSub}>{TRUCK_CATALOG.length} модели в наличии</Text>
            </View>

            {/* TRUCK CARDS */}
            {TRUCK_CATALOG.map(truck => (
              <View key={truck.id} style={[styles.truckCard, { borderColor: canAfford ? truck.color + '55' : 'rgba(255,255,255,0.1)' }]}>

                {/* Badge */}
                <View style={[styles.badge, { backgroundColor: truck.badgeColor + '22', borderColor: truck.badgeColor + '55' }]}>
                  <Text style={[styles.badgeText, { color: truck.badgeColor }]}>{truck.badge}</Text>
                </View>

                {/* PHOTO ZONE — место под фото */}
                <View style={[styles.photoZone, { backgroundColor: truck.color + '0d' }]}>
                  {/* Placeholder — заменить на <Image> когда будут фото */}
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlaceholderIcon}>🚛</Text>
                    <Text style={[styles.photoPlaceholderText, { color: truck.color + '88' }]}>PHOTO COMING SOON</Text>
                  </View>
                  {/* Название поверх фото */}
                  <View style={styles.photoOverlay}>
                    <Text style={styles.photoBrand}>{truck.brand}</Text>
                    <Text style={[styles.photoModel, { color: truck.color }]}>{truck.model} · {truck.year}</Text>
                  </View>
                </View>

                {/* SPECS — горизонтальная строка */}
                <View style={styles.specsRow}>
                  {truck.specs.map(s => (
                    <View key={s.label} style={styles.specItem}>
                      <Text style={styles.specIcon}>{s.icon}</Text>
                      <Text style={styles.specLabel}>{s.label}</Text>
                      <Text style={[styles.specValue, { color: truck.color }]}>{s.value}</Text>
                    </View>
                  ))}
                </View>

                {/* FEATURES — компактные чипы */}
                <View style={styles.featuresRow}>
                  {truck.features.map(f => (
                    <View key={f} style={[styles.chip, { borderColor: truck.color + '44' }]}>
                      <Text style={[styles.chipText, { color: truck.color }]}>✓ {f}</Text>
                    </View>
                  ))}
                </View>

                {/* FOOTER — цена + кнопка */}
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.priceLabel}>ЦЕНА</Text>
                    <Text style={styles.priceValue}>${truck.price.toLocaleString()}</Text>
                    <Text style={styles.priceNote}>Финансирование доступно</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.buyBtn, { backgroundColor: canAfford ? truck.color : 'rgba(255,255,255,0.07)' }]}
                    onPress={handleBuy}
                    disabled={!canAfford}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buyBtnText}>
                      {canAfford ? '🛒 Купить' : '🔒 Нет средств'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* MY GARAGE */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>🏠 Мой гараж</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{currentTruckCount} {currentTruckCount === 1 ? 'трак' : 'трака'}</Text>
              </View>
            </View>

            <View style={styles.garageList}>
              {trucks.map(t => {
                const isOld = (t as any).isOldTruck;
                return (
                  <View key={t.id} style={[styles.garageRow, isOld && { backgroundColor: 'rgba(239,68,68,0.04)' }]}>
                    <View style={[styles.garageIcon, { backgroundColor: isOld ? 'rgba(239,68,68,0.1)' : 'rgba(6,182,212,0.1)' }]}>
                      <Text style={{ fontSize: 18 }}>{isOld ? '🚚' : '🚛'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.garageName}>{t.name}</Text>
                      <Text style={styles.garageDriver}>👤 {t.driver}</Text>
                    </View>
                    <View style={[styles.statusBadge, {
                      backgroundColor: isOld ? 'rgba(239,68,68,0.12)' : 'rgba(74,222,128,0.12)',
                      borderColor: isOld ? 'rgba(239,68,68,0.3)' : 'rgba(74,222,128,0.3)',
                    }]}>
                      <Text style={[styles.statusText, { color: isOld ? '#ef4444' : '#4ade80' }]}>
                        {isOld ? '⚠ СТАРЫЙ' : '✓ НОВЫЙ'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(T: ThemeColors, screenH: number) {
  // Панель занимает не более 88% высоты экрана, но не менее 400px
  const panelMaxH = Math.max(400, Math.min(screenH * 0.88, screenH - 60));

  return StyleSheet.create({
    overlay: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.72)',
    },
    panelWrap: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      alignItems: 'center',
    },
    panel: {
      width: '100%',
      maxWidth: 480,
      maxHeight: panelMaxH,
      backgroundColor: '#0a0f1e',
      borderTopLeftRadius: 22, borderTopRightRadius: 22,
      borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)',
      overflow: 'hidden',
    },

    // Header
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 14, paddingVertical: 11,
      borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
      backgroundColor: 'rgba(6,182,212,0.05)',
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 9 },
    headerLogo: { fontSize: 24 },
    headerTitle: { fontSize: 14, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },
    headerSub: { fontSize: 9, color: '#06b6d4', fontWeight: '600', letterSpacing: 0.5 },
    closeBtn: {
      width: 30, height: 30, borderRadius: 15,
      backgroundColor: 'rgba(255,255,255,0.07)',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
      alignItems: 'center', justifyContent: 'center',
    },
    closeBtnText: { fontSize: 13, color: '#94a3b8', fontWeight: '700' },

    scrollContent: { paddingBottom: 8 },

    // Wallet
    walletBar: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      margin: 12, marginBottom: 8, padding: 12,
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    walletLabel: { fontSize: 10, color: '#64748b', fontWeight: '600' },
    walletValue: { fontSize: 22, fontWeight: '900' },
    walletRight: { alignItems: 'flex-end', gap: 4 },
    walletBadge: {
      borderRadius: 7, borderWidth: 1,
      paddingHorizontal: 8, paddingVertical: 3,
    },
    walletBadgeText: { fontSize: 11, fontWeight: '700', color: '#e2e8f0' },
    progressBg: {
      width: 90, height: 3, backgroundColor: 'rgba(255,255,255,0.08)',
      borderRadius: 2, overflow: 'hidden',
    },
    progressFill: { height: '100%', backgroundColor: '#06b6d4', borderRadius: 2 },
    progressLabel: { fontSize: 9, color: '#64748b', fontWeight: '600' },

    // Section row
    sectionRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 12, marginBottom: 8, marginTop: 4,
    },
    sectionTitle: { fontSize: 13, fontWeight: '800', color: '#e2e8f0' },
    sectionSub: { fontSize: 10, color: '#06b6d4', fontWeight: '600' },

    // Truck card
    truckCard: {
      marginHorizontal: 12, marginBottom: 12,
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: 16, borderWidth: 1.5,
      overflow: 'hidden',
    },
    badge: {
      position: 'absolute', top: 10, right: 10, zIndex: 10,
      borderRadius: 5, borderWidth: 1,
      paddingHorizontal: 7, paddingVertical: 2,
    },
    badgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

    // Photo zone — фиксированная высота под фото
    photoZone: {
      height: 130,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    photoPlaceholder: {
      alignItems: 'center', gap: 4,
    },
    photoPlaceholderIcon: { fontSize: 44 },
    photoPlaceholderText: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
    photoOverlay: {
      position: 'absolute', bottom: 8, left: 12,
    },
    photoBrand: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: 2 },
    photoModel: { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },

    // Specs — горизонтально в одну строку
    specsRow: {
      flexDirection: 'row',
      paddingHorizontal: 10, paddingVertical: 8,
      gap: 6,
      borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    },
    specItem: {
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: 8, padding: 7,
      alignItems: 'center',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    specIcon: { fontSize: 11, marginBottom: 1 },
    specLabel: { fontSize: 8, color: '#64748b', fontWeight: '600' },
    specValue: { fontSize: 10, fontWeight: '800', textAlign: 'center' },

    // Features chips
    featuresRow: {
      flexDirection: 'row', flexWrap: 'wrap', gap: 5,
      paddingHorizontal: 10, paddingBottom: 10,
    },
    chip: {
      borderRadius: 20, borderWidth: 1,
      paddingHorizontal: 8, paddingVertical: 3,
      backgroundColor: 'rgba(255,255,255,0.03)',
    },
    chipText: { fontSize: 10, fontWeight: '600' },

    // Card footer
    cardFooter: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 12, paddingVertical: 10,
      borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
      backgroundColor: 'rgba(0,0,0,0.2)',
    },
    priceLabel: { fontSize: 9, color: '#64748b', fontWeight: '700', letterSpacing: 0.8 },
    priceValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
    priceNote: { fontSize: 9, color: '#4ade80', fontWeight: '600' },
    buyBtn: {
      borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10,
      alignItems: 'center', justifyContent: 'center',
      minWidth: 110,
    },
    buyBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' },

    // Garage list
    countBadge: {
      backgroundColor: 'rgba(6,182,212,0.12)', borderRadius: 7,
      borderWidth: 1, borderColor: 'rgba(6,182,212,0.3)',
      paddingHorizontal: 8, paddingVertical: 2,
    },
    countBadgeText: { fontSize: 10, fontWeight: '700', color: '#06b6d4' },
    garageList: {
      marginHorizontal: 12,
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
      overflow: 'hidden',
    },
    garageRow: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      paddingHorizontal: 12, paddingVertical: 10,
      borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    garageIcon: {
      width: 38, height: 38, borderRadius: 10,
      alignItems: 'center', justifyContent: 'center',
    },
    garageName: { fontSize: 12, fontWeight: '700', color: '#e2e8f0' },
    garageDriver: { fontSize: 10, color: '#64748b', marginTop: 1 },
    statusBadge: {
      borderRadius: 7, borderWidth: 1,
      paddingHorizontal: 7, paddingVertical: 3,
    },
    statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },
  });
}

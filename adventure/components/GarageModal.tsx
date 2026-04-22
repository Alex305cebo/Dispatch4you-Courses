import { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { Colors } from '../constants/colors';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../constants/themes';

const NEW_TRUCK_PRICE = 15_000;

// Каталог траков в магазине
const TRUCK_CATALOG = [
  {
    id: 'kenworth-t680',
    brand: 'KENWORTH',
    model: 'T680',
    year: '2024',
    price: 15_000,
    emoji: '🚛',
    badge: 'BESTSELLER',
    badgeColor: '#f97316',
    specs: [
      { icon: '⚡', label: 'Двигатель', value: 'PACCAR MX-13 455HP' },
      { icon: '⛽', label: 'Расход', value: '6.8 mpg avg' },
      { icon: '📦', label: 'Грузоподъёмность', value: '80,000 lbs' },
      { icon: '🛣️', label: 'Пробег', value: '0 miles' },
    ],
    features: ['Автоматическая КПП', 'Спальная кабина', 'APU система', 'Bluetooth + GPS'],
    color: '#06b6d4',
  },
  {
    id: 'peterbilt-579',
    brand: 'PETERBILT',
    model: '579',
    year: '2024',
    price: 15_000,
    emoji: '🚚',
    badge: 'NEW',
    badgeColor: '#4ade80',
    specs: [
      { icon: '⚡', label: 'Двигатель', value: 'Cummins X15 500HP' },
      { icon: '⛽', label: 'Расход', value: '7.1 mpg avg' },
      { icon: '📦', label: 'Грузоподъёмность', value: '80,000 lbs' },
      { icon: '🛣️', label: 'Пробег', value: '0 miles' },
    ],
    features: ['Аэродинамический дизайн', 'Большая кабина', 'Eco-режим', 'Lane Assist'],
    color: '#8b5cf6',
  },
];

export default function GarageModal() {
  const T = useTheme();
  const styles = useMemo(() => makeStyles(T), [T]);
  const { garageOpen, setGarageOpen, balance, trucks, buyNewTruck } = useGameStore();

  const canAfford = balance >= NEW_TRUCK_PRICE;
  const progress = Math.min(1, balance / NEW_TRUCK_PRICE);
  const progressPct = Math.round(progress * 100);
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
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => setGarageOpen(false)}
      />
      <View style={styles.panelWrap}>
      <View style={styles.panel}>

        {/* ── HEADER ── */}
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

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

          {/* ── БАЛАНС ПОКУПАТЕЛЯ ── */}
          <View style={styles.walletBar}>
            <View style={styles.walletLeft}>
              <Text style={styles.walletLabel}>💳 Ваш бюджет</Text>
              <Text style={[styles.walletValue, { color: canAfford ? '#4ade80' : '#f97316' }]}>
                ${balance.toLocaleString()}
              </Text>
            </View>
            <View style={styles.walletRight}>
              {canAfford ? (
                <View style={styles.walletBadgeGreen}>
                  <Text style={styles.walletBadgeText}>✓ Достаточно</Text>
                </View>
              ) : (
                <View style={styles.walletBadgeOrange}>
                  <Text style={styles.walletBadgeText}>Нужно ещё ${(NEW_TRUCK_PRICE - balance).toLocaleString()}</Text>
                </View>
              )}
              {/* Прогресс */}
              <View style={styles.miniProgressBg}>
                <View style={[styles.miniProgressFill, { width: `${progressPct}%` as any }]} />
              </View>
              <Text style={styles.miniProgressLabel}>{progressPct}% накоплено</Text>
            </View>
          </View>

          {/* ── ЗАГОЛОВОК КАТАЛОГА ── */}
          <View style={styles.catalogHeader}>
            <Text style={styles.catalogTitle}>📋 Каталог траков</Text>
            <Text style={styles.catalogSub}>{TRUCK_CATALOG.length} модели в наличии</Text>
          </View>

          {/* ── КАРТОЧКИ ТОВАРОВ ── */}
          {TRUCK_CATALOG.map((truck, idx) => (
            <View key={truck.id} style={[styles.truckCard, { borderColor: canAfford ? truck.color + '55' : 'rgba(255,255,255,0.1)' }]}>

              {/* Бейдж */}
              <View style={[styles.truckBadge, { backgroundColor: truck.badgeColor + '22', borderColor: truck.badgeColor + '66' }]}>
                <Text style={[styles.truckBadgeText, { color: truck.badgeColor }]}>{truck.badge}</Text>
              </View>

              {/* Верх карточки — "фото" трака */}
              <View style={[styles.truckImageArea, { backgroundColor: truck.color + '11' }]}>
                <Text style={styles.truckEmoji}>{truck.emoji}</Text>
                <View style={styles.truckTitleBlock}>
                  <Text style={styles.truckBrand}>{truck.brand}</Text>
                  <Text style={[styles.truckModel, { color: truck.color }]}>{truck.model}</Text>
                  <Text style={styles.truckYear}>{truck.year} · Новый</Text>
                </View>
              </View>

              {/* Характеристики */}
              <View style={styles.specsGrid}>
                {truck.specs.map(s => (
                  <View key={s.label} style={styles.specItem}>
                    <Text style={styles.specIcon}>{s.icon}</Text>
                    <Text style={styles.specLabel}>{s.label}</Text>
                    <Text style={[styles.specValue, { color: truck.color }]}>{s.value}</Text>
                  </View>
                ))}
              </View>

              {/* Фичи */}
              <View style={styles.featuresRow}>
                {truck.features.map(f => (
                  <View key={f} style={[styles.featureChip, { borderColor: truck.color + '44' }]}>
                    <Text style={[styles.featureChipText, { color: truck.color }]}>✓ {f}</Text>
                  </View>
                ))}
              </View>

              {/* Цена + кнопка */}
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.priceLabel}>Цена</Text>
                  <Text style={styles.priceValue}>${truck.price.toLocaleString()}</Text>
                  <Text style={styles.priceNote}>Финансирование доступно</Text>
                </View>
                <TouchableOpacity
                  style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled, { backgroundColor: canAfford ? truck.color : 'rgba(255,255,255,0.08)' }]}
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

          {/* ── МОЙ ГАРАЖ ── */}
          <View style={styles.garageSection}>
            <View style={styles.garageSectionHeader}>
              <Text style={styles.garageSectionTitle}>🏠 Мой гараж</Text>
              <View style={styles.fleetCountBadge}>
                <Text style={styles.fleetCountText}>{currentTruckCount} {currentTruckCount === 1 ? 'трак' : 'трака'}</Text>
              </View>
            </View>

            {trucks.map(t => {
              const isOld = (t as any).isOldTruck;
              return (
                <View key={t.id} style={[styles.garageRow, isOld && styles.garageRowOld]}>
                  <View style={[styles.garageIconWrap, { backgroundColor: isOld ? 'rgba(239,68,68,0.1)' : 'rgba(6,182,212,0.1)' }]}>
                    <Text style={styles.garageIcon}>{isOld ? '🚚' : '🚛'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.garageTruckName}>{t.name}</Text>
                    <Text style={styles.garageTruckDriver}>👤 {t.driver}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: isOld ? 'rgba(239,68,68,0.12)' : 'rgba(74,222,128,0.12)', borderColor: isOld ? 'rgba(239,68,68,0.3)' : 'rgba(74,222,128,0.3)' }]}>
                    <Text style={[styles.statusBadgeText, { color: isOld ? '#ef4444' : '#4ade80' }]}>
                      {isOld ? '⚠ СТАРЫЙ' : '✓ НОВЫЙ'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
      </View>
    </Modal>
  );
}

function makeStyles(T: ThemeColors) {
  return StyleSheet.create({
    overlay: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
    },
    panelWrap: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      alignItems: 'center',
      paddingHorizontal: 0,
    },
    panel: {
      width: '100%',
      maxWidth: 480,
      backgroundColor: '#0a0f1e',
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)',
      maxHeight: '92%',
    },

    // Header
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 16, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
      backgroundColor: 'rgba(6,182,212,0.05)',
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerLogo: { fontSize: 28 },
    headerTitle: { fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },
    headerSub: { fontSize: 10, color: '#06b6d4', fontWeight: '600', letterSpacing: 0.5 },
    closeBtn: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.07)',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
      alignItems: 'center', justifyContent: 'center',
    },
    closeBtnText: { fontSize: 14, color: '#94a3b8', fontWeight: '700' },

    // Wallet bar
    walletBar: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      margin: 14, padding: 14,
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    walletLeft: { gap: 2 },
    walletLabel: { fontSize: 11, color: '#64748b', fontWeight: '600' },
    walletValue: { fontSize: 26, fontWeight: '900' },
    walletRight: { alignItems: 'flex-end', gap: 4 },
    walletBadgeGreen: {
      backgroundColor: 'rgba(74,222,128,0.12)', borderRadius: 8,
      borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)',
      paddingHorizontal: 8, paddingVertical: 3,
    },
    walletBadgeOrange: {
      backgroundColor: 'rgba(249,115,22,0.12)', borderRadius: 8,
      borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)',
      paddingHorizontal: 8, paddingVertical: 3,
    },
    walletBadgeText: { fontSize: 11, fontWeight: '700', color: '#e2e8f0' },
    miniProgressBg: {
      width: 100, height: 4, backgroundColor: 'rgba(255,255,255,0.08)',
      borderRadius: 2, overflow: 'hidden',
    },
    miniProgressFill: { height: '100%', backgroundColor: '#06b6d4', borderRadius: 2 },
    miniProgressLabel: { fontSize: 10, color: '#64748b', fontWeight: '600' },

    // Catalog header
    catalogHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 14, marginBottom: 10,
    },
    catalogTitle: { fontSize: 14, fontWeight: '800', color: '#e2e8f0' },
    catalogSub: { fontSize: 11, color: '#06b6d4', fontWeight: '600' },

    // Truck card
    truckCard: {
      marginHorizontal: 14, marginBottom: 16,
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: 18, borderWidth: 1.5,
      overflow: 'hidden',
    },
    truckBadge: {
      position: 'absolute', top: 12, right: 12, zIndex: 10,
      borderRadius: 6, borderWidth: 1,
      paddingHorizontal: 8, paddingVertical: 3,
    },
    truckBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

    truckImageArea: {
      flexDirection: 'row', alignItems: 'center', gap: 16,
      padding: 20, paddingRight: 60,
    },
    truckEmoji: { fontSize: 52 },
    truckTitleBlock: { flex: 1 },
    truckBrand: { fontSize: 11, fontWeight: '700', color: '#64748b', letterSpacing: 2 },
    truckModel: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
    truckYear: { fontSize: 12, color: '#94a3b8', fontWeight: '600', marginTop: 2 },

    // Specs grid
    specsGrid: {
      flexDirection: 'row', flexWrap: 'wrap',
      paddingHorizontal: 14, paddingBottom: 10,
      gap: 6,
    },
    specItem: {
      width: '47%',
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: 10, padding: 9,
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    specIcon: { fontSize: 13, marginBottom: 2 },
    specLabel: { fontSize: 10, color: '#64748b', fontWeight: '600', marginBottom: 2 },
    specValue: { fontSize: 11, fontWeight: '800' },

    // Features chips
    featuresRow: {
      flexDirection: 'row', flexWrap: 'wrap', gap: 6,
      paddingHorizontal: 14, paddingBottom: 14,
    },
    featureChip: {
      borderRadius: 20, borderWidth: 1,
      paddingHorizontal: 10, paddingVertical: 4,
      backgroundColor: 'rgba(255,255,255,0.03)',
    },
    featureChipText: { fontSize: 11, fontWeight: '600' },

    // Card footer
    cardFooter: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      padding: 14, paddingTop: 12,
      borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
      backgroundColor: 'rgba(0,0,0,0.2)',
    },
    priceLabel: { fontSize: 10, color: '#64748b', fontWeight: '600', letterSpacing: 0.5 },
    priceValue: { fontSize: 22, fontWeight: '900', color: '#fff' },
    priceNote: { fontSize: 10, color: '#4ade80', fontWeight: '600', marginTop: 1 },
    buyBtn: {
      borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12,
      alignItems: 'center', justifyContent: 'center',
      minWidth: 120,
    },
    buyBtnDisabled: {},
    buyBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },

    // Garage section
    garageSection: {
      marginHorizontal: 14, marginTop: 4,
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
      overflow: 'hidden',
    },
    garageSectionHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
      backgroundColor: 'rgba(255,255,255,0.02)',
    },
    garageSectionTitle: { fontSize: 13, fontWeight: '800', color: '#e2e8f0' },
    fleetCountBadge: {
      backgroundColor: 'rgba(6,182,212,0.12)', borderRadius: 8,
      borderWidth: 1, borderColor: 'rgba(6,182,212,0.3)',
      paddingHorizontal: 8, paddingVertical: 3,
    },
    fleetCountText: { fontSize: 11, fontWeight: '700', color: '#06b6d4' },

    garageRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    garageRowOld: { backgroundColor: 'rgba(239,68,68,0.03)' },
    garageIconWrap: {
      width: 44, height: 44, borderRadius: 12,
      alignItems: 'center', justifyContent: 'center',
    },
    garageIcon: { fontSize: 22 },
    garageTruckName: { fontSize: 13, fontWeight: '700', color: '#e2e8f0' },
    garageTruckDriver: { fontSize: 11, color: '#64748b', marginTop: 2 },
    statusBadge: {
      borderRadius: 8, borderWidth: 1,
      paddingHorizontal: 8, paddingVertical: 4,
    },
    statusBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  });
}

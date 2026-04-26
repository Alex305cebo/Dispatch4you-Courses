import { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, ScrollView, useWindowDimensions, Animated, Image,
} from 'react-native';
import { useGameStore } from '../store/gameStore';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../constants/themes';

const NEW_TRUCK_PRICE = 15_000;

// Функция для получения пути к картинке трака
const getTruckImageUri = (id: number): string => {
  const isGame = typeof window !== 'undefined' && (
    window.location.pathname.startsWith('/game') ||
    window.location.pathname.includes('/game/')
  );
  const basePath = isGame ? '/game/assets/TruckPic' : '/assets/TruckPic';
  return `${basePath}/${id}.webp`;
};

const TRUCKS = [
  {
    id: 'kenworth-t680',
    brand: 'KENWORTH', model: 'T680', year: '2024',
    price: 15_000, badge: 'BESTSELLER', badgeColor: '#f97316',
    emoji: '🚛', color: '#06b6d4',
    tagline: 'Лучший выбор для дальних рейсов',
    specs: [
      { icon: '⚡', label: 'Engine', value: 'PACCAR MX-13 455HP' },
      { icon: '⛽', label: 'MPG', value: '6.8 avg' },
      { icon: '📦', label: 'GVW', value: '80,000 lbs' },
      { icon: '🛣️', label: 'Miles', value: '0' },
      { icon: '🔧', label: 'Trans', value: 'Automatic' },
      { icon: '🛏️', label: 'Cab', value: 'Sleeper 72"' },
    ],
    features: ['APU система', 'Bluetooth + GPS', 'Lane Assist', 'Collision Warning', 'Idle Shutdown', 'Premium Sound'],
    pros: ['Низкий расход топлива', 'Надёжный двигатель PACCAR', 'Просторная кабина'],
    warranty: '2 года / 200,000 miles',
  },
  {
    id: 'peterbilt-579',
    brand: 'PETERBILT', model: '579', year: '2024',
    price: 15_000, badge: 'NEW', badgeColor: '#4ade80',
    emoji: '🚚', color: '#8b5cf6',
    tagline: 'Аэродинамика и мощность',
    specs: [
      { icon: '⚡', label: 'Engine', value: 'Cummins X15 500HP' },
      { icon: '⛽', label: 'MPG', value: '7.1 avg' },
      { icon: '📦', label: 'GVW', value: '80,000 lbs' },
      { icon: '🛣️', label: 'Miles', value: '0' },
      { icon: '🔧', label: 'Trans', value: 'Automatic' },
      { icon: '🛏️', label: 'Cab', value: 'Sleeper 76"' },
    ],
    features: ['Eco Mode', 'Lane Assist', 'Adaptive Cruise', 'Air Ride Seat', 'Dual Exhaust', 'LED Lights'],
    pros: ['Лучший MPG в классе', 'Аэродинамический дизайн', 'Большая кабина'],
    warranty: '2 года / 200,000 miles',
  },
  {
    id: 'freightliner-cascadia',
    brand: 'FREIGHTLINER', model: 'Cascadia', year: '2024',
    price: 15_000, badge: 'POPULAR', badgeColor: '#06b6d4',
    emoji: '🚛', color: '#0ea5e9',
    tagline: 'Самый продаваемый трак в США',
    specs: [
      { icon: '⚡', label: 'Engine', value: 'Detroit DD15 505HP' },
      { icon: '⛽', label: 'MPG', value: '7.3 avg' },
      { icon: '📦', label: 'GVW', value: '80,000 lbs' },
      { icon: '🛣️', label: 'Miles', value: '0' },
      { icon: '🔧', label: 'Trans', value: 'DT12 Auto' },
      { icon: '🛏️', label: 'Cab', value: 'Sleeper 72"' },
    ],
    features: ['Detroit Assurance 5.0', 'Active Brake Assist', 'Lane Keep', 'Adaptive Cruise', 'Predictive Cruise', 'OTA Updates'],
    pros: ['Лучший MPG среди всех', 'Detroit Assurance Safety', 'OTA обновления'],
    warranty: '2 года / 250,000 miles',
  },
  {
    id: 'volvo-vnl860',
    brand: 'VOLVO', model: 'VNL 860', year: '2024',
    price: 15_000, badge: 'PREMIUM', badgeColor: '#a78bfa',
    emoji: '🚛', color: '#7c3aed',
    tagline: 'Европейский комфорт на американских дорогах',
    specs: [
      { icon: '⚡', label: 'Engine', value: 'Volvo D13 500HP' },
      { icon: '⛽', label: 'MPG', value: '7.0 avg' },
      { icon: '📦', label: 'GVW', value: '80,000 lbs' },
      { icon: '🛣️', label: 'Miles', value: '0' },
      { icon: '🔧', label: 'Trans', value: 'I-Shift Auto' },
      { icon: '🛏️', label: 'Cab', value: 'Sleeper 70"' },
    ],
    features: ['I-See Predictive', 'Volvo Active Driver Assist', 'Dual Bunk', 'Fridge + Microwave', 'Inverter 2000W', 'Premium Interior'],
    pros: ['Максимальный комфорт', 'Умная трансмиссия I-Shift', 'Двухъярусная кабина'],
    warranty: '3 года / 300,000 miles',
  },
  {
    id: 'mack-anthem',
    brand: 'MACK', model: 'Anthem', year: '2024',
    price: 15_000, badge: 'TOUGH', badgeColor: '#ef4444',
    emoji: '🚚', color: '#dc2626',
    tagline: 'Создан для самых тяжёлых грузов',
    specs: [
      { icon: '⚡', label: 'Engine', value: 'Mack MP8 505HP' },
      { icon: '⛽', label: 'MPG', value: '6.5 avg' },
      { icon: '📦', label: 'GVW', value: '80,000 lbs' },
      { icon: '🛣️', label: 'Miles', value: '0' },
      { icon: '🔧', label: 'Trans', value: 'mDRIVE Auto' },
      { icon: '🛏️', label: 'Cab', value: 'Sleeper 70"' },
    ],
    features: ['mDRIVE HD', 'Mack GuardDog Connect', 'Air Disc Brakes', 'Exhaust Brake', 'Hill Start Aid', 'Heavy Haul Ready'],
    pros: ['Максимальная тяга', 'Надёжность Mack', 'Идеален для heavy haul'],
    warranty: '2 года / 200,000 miles',
  },
  {
    id: 'international-lt',
    brand: 'INTERNATIONAL', model: 'LT Series', year: '2024',
    price: 15_000, badge: 'VALUE', badgeColor: '#fbbf24',
    emoji: '🚛', color: '#d97706',
    tagline: 'Лучшее соотношение цена/качество',
    specs: [
      { icon: '⚡', label: 'Engine', value: 'Cummins X15 450HP' },
      { icon: '⛽', label: 'MPG', value: '6.9 avg' },
      { icon: '📦', label: 'GVW', value: '80,000 lbs' },
      { icon: '🛣️', label: 'Miles', value: '0' },
      { icon: '🔧', label: 'Trans', value: 'Eaton Auto' },
      { icon: '🛏️', label: 'Cab', value: 'Sleeper 72"' },
    ],
    features: ['OnCommand Connect', 'Diamond Logic', 'Collision Mitigation', 'Lane Departure', 'Tire Pressure Monitor', 'Remote Diagnostics'],
    pros: ['Доступная цена обслуживания', 'Широкая сеть сервисов', 'Простота в ремонте'],
    warranty: '2 года / 200,000 miles',
  },
  {
    id: 'western-star-49x',
    brand: 'WESTERN STAR', model: '49X', year: '2024',
    price: 15_000, badge: 'LEGEND', badgeColor: '#f59e0b',
    emoji: '🚛', color: '#b45309',
    tagline: 'Легенда американских дорог',
    specs: [
      { icon: '⚡', label: 'Engine', value: 'Detroit DD16 600HP' },
      { icon: '⛽', label: 'MPG', value: '6.2 avg' },
      { icon: '📦', label: 'GVW', value: '80,000 lbs' },
      { icon: '🛣️', label: 'Miles', value: '0' },
      { icon: '🔧', label: 'Trans', value: 'DT12 Auto' },
      { icon: '🛏️', label: 'Cab', value: 'Sleeper 86"' },
    ],
    features: ['600HP DD16', 'Largest Sleeper 86"', 'Chrome Package', 'Air Ride Suspension', 'Detroit Assurance', 'Custom Interior'],
    pros: ['Самый мощный двигатель', 'Огромная кабина 86"', 'Культовый дизайн'],
    warranty: '2 года / 200,000 miles',
  },
  {
    id: 'kenworth-w900',
    brand: 'KENWORTH', model: 'W900', year: '2024',
    price: 15_000, badge: 'CLASSIC', badgeColor: '#94a3b8',
    emoji: '🚚', color: '#475569',
    tagline: 'Классика, проверенная временем',
    specs: [
      { icon: '⚡', label: 'Engine', value: 'PACCAR MX-13 485HP' },
      { icon: '⛽', label: 'MPG', value: '6.4 avg' },
      { icon: '📦', label: 'GVW', value: '80,000 lbs' },
      { icon: '🛣️', label: 'Miles', value: '0' },
      { icon: '🔧', label: 'Trans', value: 'Eaton 18-spd' },
      { icon: '🛏️', label: 'Cab', value: 'Sleeper 86"' },
    ],
    features: ['Long Hood Design', 'Chrome Bumper', 'Air Ride', 'Dual Stacks', 'Classic Interior', 'Manual Option'],
    pros: ['Иконический дизайн', 'Любимец дальнобойщиков', 'Высокая перепродажная стоимость'],
    warranty: '2 года / 200,000 miles',
  },
  {
    id: 'peterbilt-389',
    brand: 'PETERBILT', model: '389', year: '2024',
    price: 15_000, badge: 'ICONIC', badgeColor: '#ec4899',
    emoji: '🚛', color: '#be185d',
    tagline: 'Самый узнаваемый трак в мире',
    specs: [
      { icon: '⚡', label: 'Engine', value: 'Cummins X15 565HP' },
      { icon: '⛽', label: 'MPG', value: '6.1 avg' },
      { icon: '📦', label: 'GVW', value: '80,000 lbs' },
      { icon: '🛣️', label: 'Miles', value: '0' },
      { icon: '🔧', label: 'Trans', value: 'Eaton 18-spd' },
      { icon: '🛏️', label: 'Cab', value: 'Sleeper 63"' },
    ],
    features: ['565HP Cummins', 'Long Hood', 'Chrome Package', 'Dual Exhaust Stacks', 'Custom Paint', 'Show Truck Ready'],
    pros: ['Самый мощный Cummins', 'Культовый внешний вид', 'Высокий статус'],
    warranty: '2 года / 200,000 miles',
  },
];

export default function GarageModal() {
  const { height: screenH } = useWindowDimensions();
  const T = useTheme();
  const styles = useMemo(() => makeStyles(T, screenH), [T, screenH]);
  const { garageOpen, setGarageOpen, balance, trucks, buyNewTruck } = useGameStore();
  const setTruckShopOpen = useGameStore(s => s.setTruckShopOpen);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const canAfford = balance >= NEW_TRUCK_PRICE;
  const progressPct = Math.round(Math.min(1, balance / NEW_TRUCK_PRICE) * 100);

  function handleBuy() {
    if (!canAfford) return;
    const ok = buyNewTruck();
    if (ok) { setExpandedId(null); setGarageOpen(false); }
  }

  function toggleExpand(id: string) {
    setExpandedId(prev => prev === id ? null : id);
  }

  return (
    <Modal visible={garageOpen} transparent animationType="slide" onRequestClose={() => setGarageOpen(false)}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setGarageOpen(false)} />

      <View style={styles.panelWrap}>
        <View style={styles.panel}>

          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerLogo}>🏢</Text>
              <View>
                <Text style={styles.headerTitle}>TRUCK DEALER</Text>
                <Text style={styles.headerSub}>Premium Fleet Solutions · {TRUCKS.length} моделей</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setGarageOpen(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* TRUCK SHOP BANNER */}
          <TouchableOpacity
            style={{
              marginHorizontal: 12, marginTop: 10, marginBottom: 2,
              padding: 11, borderRadius: 12,
              backgroundColor: 'rgba(245,158,11,0.1)',
              borderWidth: 1, borderColor: 'rgba(245,158,11,0.35)',
              flexDirection: 'row', alignItems: 'center', gap: 10,
            }}
            onPress={() => { setGarageOpen(false); setTruckShopOpen(true); }}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 22 }}>🏪</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#fde68a' }}>Truck Shop — Б/У рынок</Text>
              <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>11 лотов · от $12,000 до $210,000</Text>
            </View>
            <Text style={{ fontSize: 18, color: '#f59e0b' }}>→</Text>
          </TouchableOpacity>

          {/* WALLET BAR */}
          <View style={styles.walletBar}>
            <View>
              <Text style={styles.walletLabel}>💳 Бюджет</Text>
              <Text style={[styles.walletValue, { color: canAfford ? '#4ade80' : '#f97316' }]}>
                ${balance.toLocaleString()}
              </Text>
            </View>
            <View style={styles.walletRight}>
              <View style={[styles.walletBadge, {
                backgroundColor: canAfford ? 'rgba(74,222,128,0.12)' : 'rgba(249,115,22,0.12)',
                borderColor: canAfford ? 'rgba(74,222,128,0.3)' : 'rgba(249,115,22,0.3)',
              }]}>
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

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>

            {/* CATALOG LABEL */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>📋 Каталог траков</Text>
              <Text style={styles.sectionSub}>Нажми для деталей</Text>
            </View>

            {/* TRUCK LIST */}
            {TRUCKS.map(truck => {
              const isOpen = expandedId === truck.id;
              return (
                <View key={truck.id} style={[styles.truckCard, { borderColor: isOpen ? truck.color + '88' : 'rgba(255,255,255,0.08)' }]}>

                  {/* ── МИНИ-КАРТОЧКА (всегда видна) ── */}
                  <TouchableOpacity
                    style={styles.truckRow}
                    onPress={() => toggleExpand(truck.id)}
                    activeOpacity={0.75}
                  >
                    {/* Фото-зона */}
                    <View style={[styles.miniPhoto, { backgroundColor: truck.color + '15' }]}>
                      <Text style={styles.miniEmoji}>{truck.emoji}</Text>
                    </View>

                    {/* Инфо */}
                    <View style={styles.miniInfo}>
                      <View style={styles.miniTopRow}>
                        <Text style={styles.miniBrand}>{truck.brand}</Text>
                        <View style={[styles.miniBadge, { backgroundColor: truck.badgeColor + '22', borderColor: truck.badgeColor + '55' }]}>
                          <Text style={[styles.miniBadgeText, { color: truck.badgeColor }]}>{truck.badge}</Text>
                        </View>
                      </View>
                      <Text style={[styles.miniModel, { color: truck.color }]}>{truck.model} <Text style={styles.miniYear}>· {truck.year}</Text></Text>
                      <Text style={styles.miniTagline}>{truck.tagline}</Text>
                    </View>

                    {/* Цена + стрелка */}
                    <View style={styles.miniRight}>
                      <Text style={styles.miniPrice}>${(truck.price / 1000).toFixed(0)}k</Text>
                      <Text style={[styles.miniArrow, { color: truck.color }]}>{isOpen ? '▲' : '▼'}</Text>
                    </View>
                  </TouchableOpacity>

                  {/* ── РАСКРЫТАЯ ДЕТАЛЬНАЯ КАРТОЧКА ── */}
                  {isOpen && (
                    <View style={styles.expandedBody}>

                      {/* Большая фото-зона */}
                      <View style={[styles.photoZone, { backgroundColor: truck.color + '0d' }]}>
                        <Text style={styles.photoEmoji}>{truck.emoji}</Text>
                        <View style={styles.photoOverlay}>
                          <Text style={styles.photoBrand}>{truck.brand}</Text>
                          <Text style={[styles.photoModel, { color: truck.color }]}>{truck.model}</Text>
                          <Text style={styles.photoYear}>{truck.year} · Новый · 0 miles</Text>
                        </View>
                        <View style={[styles.photoPriceBadge, { backgroundColor: truck.color }]}>
                          <Text style={styles.photoPriceText}>${truck.price.toLocaleString()}</Text>
                        </View>
                      </View>

                      {/* Specs 2×3 */}
                      <View style={styles.specsGrid}>
                        {truck.specs.map(s => (
                          <View key={s.label} style={[styles.specItem, { borderColor: truck.color + '33' }]}>
                            <Text style={styles.specIcon}>{s.icon}</Text>
                            <Text style={styles.specLabel}>{s.label}</Text>
                            <Text style={[styles.specValue, { color: truck.color }]}>{s.value}</Text>
                          </View>
                        ))}
                      </View>

                      {/* Плюсы */}
                      <View style={styles.prosRow}>
                        {truck.pros.map(p => (
                          <View key={p} style={[styles.proChip, { borderColor: truck.color + '44', backgroundColor: truck.color + '0d' }]}>
                            <Text style={[styles.proChipText, { color: truck.color }]}>✓ {p}</Text>
                          </View>
                        ))}
                      </View>

                      {/* Фичи */}
                      <View style={styles.featuresWrap}>
                        <Text style={styles.featuresLabel}>Комплектация</Text>
                        <View style={styles.featuresRow}>
                          {truck.features.map(f => (
                            <View key={f} style={styles.featureChip}>
                              <Text style={styles.featureChipText}>• {f}</Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      {/* Гарантия */}
                      <View style={styles.warrantyRow}>
                        <Text style={styles.warrantyIcon}>🛡️</Text>
                        <Text style={styles.warrantyText}>Гарантия: {truck.warranty}</Text>
                      </View>

                      {/* Кнопка купить */}
                      <TouchableOpacity
                        style={[styles.buyBtn, { backgroundColor: canAfford ? truck.color : 'rgba(255,255,255,0.07)' }]}
                        onPress={handleBuy}
                        disabled={!canAfford}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.buyBtnText}>
                          {canAfford
                            ? `🛒 Купить ${truck.brand} ${truck.model} — $${truck.price.toLocaleString()}`
                            : `🔒 Нужно ещё $${(NEW_TRUCK_PRICE - balance).toLocaleString()}`}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}

            {/* МОЙ ГАРАЖ */}
            <View style={[styles.sectionRow, { marginTop: 8 }]}>
              <Text style={styles.sectionTitle}>🏠 Мой гараж</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{trucks.length} {trucks.length === 1 ? 'трак' : 'трака'}</Text>
              </View>
            </View>

            <View style={styles.garageList}>
              {trucks.map(t => {
                const isOld = (t as any).isOldTruck;
                const imgId = (t as any).truckImageId;
                return (
                  <View key={t.id} style={[styles.garageRow, isOld && { backgroundColor: 'rgba(239,68,68,0.04)' }]}>
                    <View style={[styles.garageIconWrap, { backgroundColor: isOld ? 'rgba(239,68,68,0.1)' : 'rgba(6,182,212,0.1)' }]}>
                      {imgId ? (
                        <Image source={{ uri: getTruckImageUri(imgId) }} style={{ width: 42, height: 42, borderRadius: 10 } as any} resizeMode="cover" />
                      ) : (
                        <Text style={{ fontSize: 18 }}>{isOld ? '🚚' : '🚛'}</Text>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.garageName}>{t.name}</Text>
                      <Text style={styles.garageDriver}>👤 {t.driver} · 📍 {t.currentCity || '—'}</Text>
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

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(T: ThemeColors, screenH: number) {
  const panelMaxH = Math.max(420, Math.min(screenH * 0.9, screenH - 50));

  return StyleSheet.create({
    overlay: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.75)',
    },
    panelWrap: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      alignItems: 'center',
    },
    panel: {
      width: '100%', maxWidth: 480, maxHeight: panelMaxH,
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
    headerLogo: { fontSize: 22 },
    headerTitle: { fontSize: 14, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },
    headerSub: { fontSize: 9, color: '#06b6d4', fontWeight: '600' },
    closeBtn: {
      width: 30, height: 30, borderRadius: 15,
      backgroundColor: 'rgba(255,255,255,0.07)',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
      alignItems: 'center', justifyContent: 'center',
    },
    closeBtnText: { fontSize: 13, color: '#94a3b8', fontWeight: '700' },

    // Wallet
    walletBar: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      marginHorizontal: 12, marginVertical: 10, padding: 11,
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    walletLabel: { fontSize: 10, color: '#64748b', fontWeight: '600' },
    walletValue: { fontSize: 20, fontWeight: '900' },
    walletRight: { alignItems: 'flex-end', gap: 4 },
    walletBadge: { borderRadius: 7, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
    walletBadgeText: { fontSize: 10, fontWeight: '700', color: '#e2e8f0' },
    progressBg: { width: 90, height: 3, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#06b6d4', borderRadius: 2 },
    progressLabel: { fontSize: 9, color: '#64748b', fontWeight: '600' },

    // Section
    sectionRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 12, marginBottom: 6,
    },
    sectionTitle: { fontSize: 12, fontWeight: '800', color: '#e2e8f0' },
    sectionSub: { fontSize: 10, color: '#06b6d4', fontWeight: '600' },

    // Truck card wrapper
    truckCard: {
      marginHorizontal: 12, marginBottom: 8,
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: 14, borderWidth: 1.5,
      overflow: 'hidden',
    },

    // Mini row (collapsed)
    truckRow: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      padding: 10,
    },
    miniPhoto: {
      width: 56, height: 56, borderRadius: 10,
      alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    },
    miniEmoji: { fontSize: 30 },
    miniInfo: { flex: 1, gap: 2 },
    miniTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    miniBrand: { fontSize: 9, fontWeight: '700', color: '#64748b', letterSpacing: 1.5 },
    miniBadge: { borderRadius: 4, borderWidth: 1, paddingHorizontal: 5, paddingVertical: 1 },
    miniBadgeText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.3 },
    miniModel: { fontSize: 15, fontWeight: '900' },
    miniYear: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
    miniTagline: { fontSize: 10, color: '#94a3b8', fontWeight: '500' },
    miniRight: { alignItems: 'flex-end', gap: 4, flexShrink: 0 },
    miniPrice: { fontSize: 16, fontWeight: '900', color: '#fff' },
    miniArrow: { fontSize: 10, fontWeight: '700' },

    // Expanded body
    expandedBody: {
      borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
    },

    // Photo zone
    photoZone: {
      height: 140, justifyContent: 'center', alignItems: 'center',
      position: 'relative',
    },
    photoEmoji: { fontSize: 60 },
    photoOverlay: { position: 'absolute', bottom: 8, left: 12 },
    photoBrand: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: 2 },
    photoModel: { fontSize: 20, fontWeight: '900' },
    photoYear: { fontSize: 10, color: '#94a3b8', fontWeight: '600' },
    photoPriceBadge: {
      position: 'absolute', top: 10, right: 10,
      borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    },
    photoPriceText: { fontSize: 13, fontWeight: '900', color: '#fff' },

    // Specs 2×3 grid
    specsGrid: {
      flexDirection: 'row', flexWrap: 'wrap',
      paddingHorizontal: 10, paddingTop: 10, gap: 6,
    },
    specItem: {
      width: '30.5%',
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: 8, padding: 8,
      borderWidth: 1, alignItems: 'center',
    },
    specIcon: { fontSize: 12, marginBottom: 2 },
    specLabel: { fontSize: 8, color: '#64748b', fontWeight: '600' },
    specValue: { fontSize: 10, fontWeight: '800', textAlign: 'center' },

    // Pros
    prosRow: {
      flexDirection: 'row', flexWrap: 'wrap', gap: 5,
      paddingHorizontal: 10, paddingTop: 8,
    },
    proChip: {
      borderRadius: 20, borderWidth: 1,
      paddingHorizontal: 9, paddingVertical: 4,
    },
    proChipText: { fontSize: 10, fontWeight: '700' },

    // Features
    featuresWrap: { paddingHorizontal: 10, paddingTop: 8 },
    featuresLabel: { fontSize: 9, fontWeight: '700', color: '#64748b', letterSpacing: 0.8, marginBottom: 5 },
    featuresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
    featureChip: {
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    featureChipText: { fontSize: 10, color: '#94a3b8', fontWeight: '600' },

    // Warranty
    warrantyRow: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingHorizontal: 10, paddingTop: 8,
    },
    warrantyIcon: { fontSize: 13 },
    warrantyText: { fontSize: 11, color: '#4ade80', fontWeight: '600' },

    // Buy button
    buyBtn: {
      margin: 10, borderRadius: 12, padding: 13,
      alignItems: 'center',
    },
    buyBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' },

    // Garage
    countBadge: {
      backgroundColor: 'rgba(6,182,212,0.12)', borderRadius: 7,
      borderWidth: 1, borderColor: 'rgba(6,182,212,0.3)',
      paddingHorizontal: 8, paddingVertical: 2,
    },
    countBadgeText: { fontSize: 10, fontWeight: '700', color: '#06b6d4' },
    garageList: {
      marginHorizontal: 12,
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
      overflow: 'hidden',
    },
    garageRow: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      paddingHorizontal: 12, paddingVertical: 10,
      borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    garageIconWrap: {
      width: 42, height: 42, borderRadius: 10,
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
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

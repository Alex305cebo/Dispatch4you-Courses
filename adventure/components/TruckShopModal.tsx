import { useMemo, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, ScrollView, useWindowDimensions, Image,
} from 'react-native';
import { useGameStore } from '../store/gameStore';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../constants/themes';

// Функция для получения пути к картинке трака (WebP с fallback на PNG)
const getTruckImage = (id: number) => {
  // Определяем базовый путь в зависимости от окружения
  // Если в URL есть /game/, значит production на Hostinger
  const basePath = typeof window !== 'undefined' && window.location.pathname.includes('/game/') 
    ? '/game/assets/Truck%20Pic' 
    : '/assets/Truck%20Pic';
  
  return { uri: `${basePath}/${id}.webp` };
};

// ─── ДАННЫЕ ЛОТОВ ───────────────────────────────────────────────────────────
const LOTS_BASE = [
  {
    id: 1,
    image: getTruckImage(1),
    name: 'Peterbilt 379 «Old Red»',
    price: 16_200,
    condition: 'Критическое (Salvage)',
    conditionColor: '#ef4444',
    conditionBg: 'rgba(239,68,68,0.12)',
    badge: 'SALVAGE',
    badgeColor: '#ef4444',
    year: '~1998',
    engine: 'Требует полной переборки',
    tagline: 'Для фанатов-реставраторов или на запчасти',
    description: 'Глубокая коррозия, краска сошла пластами. Хром уничтожен временем. Покупается ради легендарной рамы.',
    analytics: 'Лот для фанатов-реставраторов или на запчасти. Покупается ради легендарной рамы.',
    stars: 1,
    isOld: true,
    speedPenalty: 0.30,
    breakdownChance: 4.0,
    mpg: '4.2',
    pros: ['Легендарная рама', 'Дёшево'],
    cons: ['Требует полного ремонта', 'Частые поломки', 'Медленный'],
  },
  {
    id: 2,
    image: getTruckImage(2),
    name: 'Freightliner Century «Day Cab White»',
    price: 25_000,
    condition: 'Плохое',
    conditionColor: '#f97316',
    conditionBg: 'rgba(249,115,22,0.12)',
    badge: 'POOR',
    badgeColor: '#f97316',
    year: '~2001',
    engine: 'Высокий пробег',
    tagline: 'Работяга под забор',
    description: 'Вмятины на дверях, капот в трещинах, грязь, ржавые диски. Короткая база, без спальника.',
    analytics: 'Требует вложений в косметику и ходовую, чтобы выйти на линию.',
    stars: 1,
    isOld: true,
    speedPenalty: 0.25,
    breakdownChance: 3.5,
    mpg: '4.8',
    pros: ['Дешевле рынка', 'Day Cab — манёвренный'],
    cons: ['Нет спальника', 'Косметика убита', 'Ходовая под вопросом'],
  },
  {
    id: 3,
    image: getTruckImage(3),
    name: 'International 9400i «Sandstorm»',
    price: 32_400,
    condition: 'Удовлетворительное',
    conditionColor: '#eab308',
    conditionBg: 'rgba(234,179,8,0.12)',
    badge: 'FAIR',
    badgeColor: '#eab308',
    year: '~2004',
    engine: 'Cummins ISX 15',
    tagline: 'Честная машина за свои деньги',
    description: 'Краска выцвела (окислилась), фары мутные, но геометрия кузова целая. Классическая кабина со спальником.',
    analytics: 'После детейлинга и полировки будет выглядеть на $10к дороже.',
    stars: 2,
    isOld: true,
    speedPenalty: 0.20,
    breakdownChance: 2.8,
    mpg: '5.5',
    pros: ['Целый кузов', 'Cummins ISX надёжен', 'Спальник есть'],
    cons: ['Краска выцвела', 'Мутная оптика'],
  },
  {
    id: 4,
    image: getTruckImage(4),
    name: 'Freightliner FLD 120 «Silver Dust»',
    price: 39_150,
    condition: 'Среднее',
    conditionColor: '#a3e635',
    conditionBg: 'rgba(163,230,53,0.10)',
    badge: 'AVERAGE',
    badgeColor: '#a3e635',
    year: '~2005',
    engine: 'Detroit Diesel 60 серии',
    tagline: 'Идеален для самостоятельного ремонта',
    description: 'Видны потертости, баки и диски потускнели, но следов серьезных ДТП нет. Простая механика.',
    analytics: 'Минимум электроники — максимум ресурса. Идеален для тех, кто чинит своими руками.',
    stars: 2,
    isOld: true,
    speedPenalty: 0.15,
    breakdownChance: 2.2,
    mpg: '5.9',
    pros: ['Простая механика', 'Нет следов ДТП', 'Detroit Diesel надёжен'],
    cons: ['Потёртости', 'Диски тускнеют'],
  },
  {
    id: 5,
    image: getTruckImage(5),
    name: 'Freightliner FLD 120 «Forest Green»',
    price: 47_250,
    condition: 'Крепкое рабочее',
    conditionColor: '#4ade80',
    conditionBg: 'rgba(74,222,128,0.10)',
    badge: 'WORKING',
    badgeColor: '#4ade80',
    year: '~2007',
    engine: 'Обслуженная топливная система',
    tagline: 'Не для выставок — для заработка',
    description: 'Матовая зеленая краска, чистые трубы, за машиной следили технически. Новые АКБ.',
    analytics: 'Трак для работы «в полях» или на лесовозе. Зарабатывает здесь и сейчас.',
    stars: 3,
    isOld: true,
    speedPenalty: 0.10,
    breakdownChance: 1.8,
    mpg: '6.1',
    pros: ['Технически ухожен', 'Новые АКБ', 'Готов к работе'],
    cons: ['Матовая краска', 'Не для шоу'],
  },
  {
    id: 6,
    image: getTruckImage(6),
    name: 'Freightliner FLD 120 «Blue Classic»',
    price: 56_700,
    condition: 'Хорошее',
    conditionColor: '#06b6d4',
    conditionBg: 'rgba(6,182,212,0.10)',
    badge: 'GOOD',
    badgeColor: '#06b6d4',
    year: '~2009',
    engine: 'Ревизия двигателя проведена',
    tagline: 'Полная предпродажная подготовка',
    description: 'Свежее ЛКП, хром отполирован, диски блестят. Выглядит очень бодро для своих лет. Салон перетянут.',
    analytics: 'Лот для олдскульных водителей. Машина прошла полную предпродажную подготовку.',
    stars: 3,
    isOld: false,
    speedPenalty: 0.08,
    breakdownChance: 1.4,
    mpg: '6.3',
    pros: ['Свежее ЛКП', 'Хром отполирован', 'Салон перетянут'],
    cons: ['Возраст машины'],
  },
  {
    id: 7,
    image: getTruckImage(7),
    name: 'Volvo VNL 670 «Burgundy Aero»',
    price: 72_900,
    condition: 'Хорошее',
    conditionColor: '#06b6d4',
    conditionBg: 'rgba(6,182,212,0.10)',
    badge: 'GOOD',
    badgeColor: '#06b6d4',
    year: '~2015',
    engine: 'Volvo D13 + I-Shift АКПП',
    tagline: 'Самый комфортный в среднем сегменте',
    description: 'Цвет металлик сохранил блеск, аэродинамические юбки целые. Высокая кабина.',
    analytics: 'Мягкий ход и низкий расход топлива. Лучший выбор для дальних рейсов.',
    stars: 4,
    isOld: false,
    speedPenalty: 0.05,
    breakdownChance: 1.2,
    mpg: '6.8',
    pros: ['Volvo D13 надёжен', 'I-Shift АКПП', 'Аэродинамика'],
    cons: ['Б/у запчасти дороже'],
  },
  {
    id: 8,
    image: getTruckImage(8),
    name: 'Freightliner Cascadia «Green Emerald»',
    price: 91_800,
    condition: 'Очень хорошее',
    conditionColor: '#4ade80',
    conditionBg: 'rgba(74,222,128,0.10)',
    badge: 'VERY GOOD',
    badgeColor: '#4ade80',
    year: '2018–2019',
    engine: 'Detroit DD15 · Полный электропакет',
    tagline: 'Современный стандарт эффективности',
    description: 'Яркий, сочный цвет. Оптика прозрачная, кузов без сколов. Модель 2018-2019 года.',
    analytics: 'Идеальный вариант для входа в серьезный дальнобой.',
    stars: 4,
    isOld: false,
    speedPenalty: 0.02,
    breakdownChance: 1.0,
    mpg: '7.2',
    pros: ['Detroit DD15', 'Полный электропакет', 'Кузов без сколов'],
    cons: ['Цена выше среднего'],
  },
  {
    id: 9,
    image: getTruckImage(9),
    name: 'Tesla Semi «White Future»',
    price: 209_250,
    condition: 'Идеальное',
    conditionColor: '#a78bfa',
    conditionBg: 'rgba(167,139,250,0.10)',
    badge: 'ELECTRIC',
    badgeColor: '#a78bfa',
    year: '2023',
    engine: 'Электрический · 500 миль запас хода',
    tagline: 'Будущее уже здесь',
    description: 'Состояние нового цифрового устройства. Минималистичный дизайн. Система автопилота.',
    analytics: 'Экономия на топливе колоссальная, но привязка к маршруту. Нужна зарядная станция.',
    stars: 5,
    isOld: false,
    speedPenalty: 0.0,
    breakdownChance: 0.5,
    mpg: '∞ (электро)',
    pros: ['Нет расходов на топливо', 'Автопилот', 'Идеальное состояние'],
    cons: ['Нужна зарядка', 'Привязка к маршруту', 'Высокая цена'],
  },
  {
    id: 10,
    image: getTruckImage(10),
    name: 'Freightliner Cascadia «Blue Evolution»',
    price: 236_250,
    condition: 'Новое',
    conditionColor: '#4ade80',
    conditionBg: 'rgba(74,222,128,0.10)',
    badge: 'NEW',
    badgeColor: '#4ade80',
    year: '2024',
    engine: 'Самый эффективный дизель на рынке',
    tagline: 'Флагманский магистральник',
    description: 'Последнее поколение (Next Gen). Аэродинамические колпаки, светодиодная оптика. Полный набор систем безопасности.',
    analytics: 'Минимальная стоимость владения (TCO) за счет гарантии и экономии ДТ.',
    stars: 5,
    isOld: false,
    speedPenalty: 0.0,
    breakdownChance: 0.3,
    mpg: '7.8',
    pros: ['Гарантия', 'Максимальная экономия ДТ', 'Все системы безопасности'],
    cons: ['Высокая цена'],
  },
  {
    id: 11,
    image: getTruckImage(11),
    name: 'Western Star 57X «Copper King»',
    price: 283_500,
    condition: 'Эксклюзив / Show-truck',
    conditionColor: '#f59e0b',
    conditionBg: 'rgba(245,158,11,0.12)',
    badge: 'EXCLUSIVE',
    badgeColor: '#f59e0b',
    year: '2024',
    engine: 'DD16 — самый мощный в линейке',
    tagline: 'Лучшее что может предложить американский грузопром',
    description: 'Уникальный медный цвет, кастомные детали, топовая комплектация. Премиальный салон «под дерево» и кожу.',
    analytics: 'Самый дорогой и престижный лот. Для тех, кто хочет лучшее.',
    stars: 5,
    isOld: false,
    speedPenalty: 0.0,
    breakdownChance: 0.2,
    mpg: '7.5',
    pros: ['DD16 600HP', 'Кастомный дизайн', 'Премиальный салон', 'Статус'],
    cons: ['Цена топ-сегмента'],
  },
];

// +30% к ценам
const LOTS = LOTS_BASE.map(lot => ({ ...lot, price: Math.round(lot.price * 1.3 / 100) * 100 }));

// ─── КОМПОНЕНТ ──────────────────────────────────────────────────────────────
export default function TruckShopModal() {
  const { height: screenH } = useWindowDimensions();
  const T = useTheme();
  const styles = useMemo(() => makeStyles(T, screenH), [T, screenH]);
  const { truckShopOpen, setTruckShopOpen, balance, trucks, buyTruckFromShop } = useGameStore();

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [boughtId, setBoughtId] = useState<number | null>(null);

  // Проверяем какие траки уже куплены (по truckImageId)
  const ownedLotIds = new Set(trucks.map((t: any) => t.truckImageId).filter(Boolean));

  function handleBuy(lot: typeof LOTS[0]) {
    if (balance < lot.price) return;
    if (ownedLotIds.has(lot.id)) return; // уже куплен
    const ok = buyTruckFromShop(lot.id, lot.price, lot.name, lot.isOld, lot.speedPenalty, lot.breakdownChance);
    if (ok) {
      setBoughtId(lot.id);
      setExpandedId(null);
      setTimeout(() => setBoughtId(null), 3000);
    }
  }

  function renderStars(count: number) {
    return Array.from({ length: 5 }, (_, i) => (
      <Text key={i} style={{ fontSize: 11, color: i < count ? '#f59e0b' : 'rgba(255,255,255,0.15)' }}>★</Text>
    ));
  }

  return (
    <Modal visible={truckShopOpen} transparent animationType="slide" onRequestClose={() => setTruckShopOpen(false)}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setTruckShopOpen(false)} />

      <View style={styles.panelWrap}>
        <View style={styles.panel}>

          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerLogo}>🏪</Text>
              <View>
                <Text style={styles.headerTitle}>TRUCK SHOP</Text>
                <Text style={styles.headerSub}>Б/У и новые траки · {LOTS.length} лотов</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setTruckShopOpen(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* WALLET BAR */}
          <View style={styles.walletBar}>
            <View>
              <Text style={styles.walletLabel}>💳 Баланс</Text>
              <Text style={styles.walletValue}>${balance.toLocaleString()}</Text>
            </View>
            <View style={styles.walletRight}>
              <Text style={styles.walletFleet}>🚛 Флот: {trucks.length} трак{trucks.length === 1 ? '' : trucks.length < 5 ? 'а' : 'ов'}</Text>
              <Text style={styles.walletHint}>Нажми на лот для деталей</Text>
            </View>
          </View>

          {/* SUCCESS TOAST */}
          {boughtId !== null && (
            <View style={styles.successToast}>
              <Text style={styles.successToastText}>🎉 Лот #{boughtId} куплен и добавлен в флот!</Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

            {LOTS.map(lot => {
              const isOpen = expandedId === lot.id;
              const canAfford = balance >= lot.price;
              const alreadyBought = boughtId === lot.id || ownedLotIds.has(lot.id);

              return (
                <View key={lot.id} style={[
                  styles.lotCard,
                  { borderColor: isOpen ? lot.conditionColor + '66' : 'rgba(255,255,255,0.07)' },
                ]}>

                  {/* ── МИНИ-СТРОКА ── */}
                  <TouchableOpacity
                    style={styles.lotRow}
                    onPress={() => setExpandedId(prev => prev === lot.id ? null : lot.id)}
                    activeOpacity={0.75}
                  >
                    {/* Фото */}
                    <View style={styles.miniPhotoWrap}>
                      <Image source={lot.image} style={styles.miniPhoto} resizeMode="cover" />
                      {/* Имя трака */}
                      <View style={styles.truckNameBadge}>
                        <Text style={styles.truckNameText}>{lot.name.match(/«(.+)»/)?.[1] || lot.name.split(' ').pop()}</Text>
                      </View>
                    </View>

                    {/* Инфо */}
                    <View style={styles.miniInfo}>
                      <View style={styles.miniTopRow}>
                        <View style={[styles.condBadge, { backgroundColor: lot.conditionBg, borderColor: lot.conditionColor + '55' }]}>
                          <Text style={[styles.condBadgeText, { color: lot.conditionColor }]}>{lot.badge}</Text>
                        </View>
                        <View style={styles.starsRow}>{renderStars(lot.stars)}</View>
                      </View>
                      <Text style={styles.miniName} numberOfLines={1}>{lot.name}</Text>
                      <Text style={styles.miniTagline} numberOfLines={1}>{lot.tagline}</Text>
                    </View>

                    {/* Цена + стрелка */}
                    <View style={styles.miniRight}>
                      <Text style={[styles.miniPrice, { color: canAfford ? '#4ade80' : '#f97316' }]}>
                        ${(lot.price / 1000).toFixed(0)}k
                      </Text>
                      <Text style={[styles.miniArrow, { color: lot.conditionColor }]}>{isOpen ? '▲' : '▼'}</Text>
                    </View>
                  </TouchableOpacity>

                  {/* ── РАСКРЫТАЯ КАРТОЧКА ── */}
                  {isOpen && (
                    <View style={styles.expandedBody}>

                      {/* Большое фото */}
                      <View style={styles.bigPhotoWrap}>
                        <Image source={lot.image} style={styles.bigPhoto} resizeMode="contain" />
                        {/* Оверлей с инфо — справа внизу */}
                        <View style={styles.bigPhotoOverlay}>
                          <View style={[styles.bigCondBadge, { backgroundColor: lot.conditionColor }]}>
                            <Text style={styles.bigCondText}>{lot.condition}</Text>
                          </View>
                        </View>
                        {/* Цена — справа вверху */}
                        <View style={styles.bigPriceBadge}>
                          <Text style={styles.bigPriceText}>${lot.price.toLocaleString()}</Text>
                        </View>
                      </View>

                      {/* Название и год */}
                      <View style={styles.titleRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.expandedName}>{lot.name}</Text>
                          <Text style={styles.expandedYear}>{lot.year} · {lot.engine}</Text>
                        </View>
                        <View style={styles.starsRowBig}>{renderStars(lot.stars)}</View>
                      </View>

                      {/* Описание */}
                      <Text style={styles.descText}>{lot.description}</Text>

                      {/* Характеристики */}
                      <View style={styles.specsRow}>
                        <View style={styles.specBox}>
                          <Text style={styles.specIcon}>⛽</Text>
                          <Text style={styles.specLabel}>MPG</Text>
                          <Text style={styles.specVal}>{lot.mpg}</Text>
                        </View>
                        <View style={styles.specBox}>
                          <Text style={styles.specIcon}>⚠️</Text>
                          <Text style={styles.specLabel}>Поломки</Text>
                          <Text style={[styles.specVal, { color: lot.breakdownChance > 2 ? '#ef4444' : lot.breakdownChance > 1.2 ? '#f97316' : '#4ade80' }]}>
                            {lot.breakdownChance > 3 ? 'Очень часто' : lot.breakdownChance > 2 ? 'Часто' : lot.breakdownChance > 1.2 ? 'Редко' : 'Почти нет'}
                          </Text>
                        </View>
                        <View style={styles.specBox}>
                          <Text style={styles.specIcon}>🏎️</Text>
                          <Text style={styles.specLabel}>Скорость</Text>
                          <Text style={[styles.specVal, { color: lot.speedPenalty > 0.2 ? '#ef4444' : lot.speedPenalty > 0.1 ? '#f97316' : '#4ade80' }]}>
                            {lot.speedPenalty === 0 ? 'Полная' : `-${Math.round(lot.speedPenalty * 100)}%`}
                          </Text>
                        </View>
                      </View>

                      {/* Плюсы и минусы */}
                      <View style={styles.prosConsRow}>
                        <View style={styles.prosCol}>
                          <Text style={styles.prosLabel}>✅ Плюсы</Text>
                          {lot.pros.map(p => (
                            <Text key={p} style={styles.proItem}>• {p}</Text>
                          ))}
                        </View>
                        <View style={styles.consCol}>
                          <Text style={styles.consLabel}>❌ Минусы</Text>
                          {lot.cons.map(c => (
                            <Text key={c} style={styles.conItem}>• {c}</Text>
                          ))}
                        </View>
                      </View>

                      {/* Аналитика */}
                      <View style={styles.analyticsBox}>
                        <Text style={styles.analyticsIcon}>📊</Text>
                        <Text style={styles.analyticsText}>{lot.analytics}</Text>
                      </View>

                      {/* Кнопка купить */}
                      <TouchableOpacity
                        style={[
                          styles.buyBtn,
                          {
                            backgroundColor: alreadyBought
                              ? 'rgba(74,222,128,0.2)'
                              : canAfford
                                ? lot.conditionColor
                                : 'rgba(255,255,255,0.06)',
                            borderColor: alreadyBought
                              ? '#4ade80'
                              : canAfford
                                ? lot.conditionColor
                                : 'rgba(255,255,255,0.1)',
                          },
                        ]}
                        onPress={() => handleBuy(lot)}
                        disabled={!canAfford || alreadyBought}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.buyBtnText}>
                          {alreadyBought
                            ? '✓ Куплено!'
                            : canAfford
                              ? `🛒 Купить Лот #${lot.id} — $${lot.price.toLocaleString()}`
                              : `🔒 Нужно ещё $${(lot.price - balance).toLocaleString()}`}
                        </Text>
                      </TouchableOpacity>

                    </View>
                  )}
                </View>
              );
            })}

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── СТИЛИ ──────────────────────────────────────────────────────────────────
function makeStyles(T: ThemeColors, screenH: number) {
  const panelMaxH = Math.max(420, Math.min(screenH * 0.75, screenH - 80)); // Уменьшили с 0.92 до 0.75

  return StyleSheet.create({
    overlay: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.78)',
    },
    panelWrap: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      alignItems: 'center',
    },
    panel: {
      width: '100%', maxWidth: 680, maxHeight: panelMaxH,
      backgroundColor: '#080d1a',
      borderTopLeftRadius: 22, borderTopRightRadius: 22,
      borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)',
      overflow: 'hidden',
    },

    // Header
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 18, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
      backgroundColor: 'rgba(245,158,11,0.05)',
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 11 },
    headerLogo: { fontSize: 26 },
    headerTitle: { fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },
    headerSub: { fontSize: 10, color: '#f59e0b', fontWeight: '600' },
    closeBtn: {
      width: 34, height: 34, borderRadius: 17,
      backgroundColor: 'rgba(255,255,255,0.07)',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
      alignItems: 'center', justifyContent: 'center',
    },
    closeBtnText: { fontSize: 15, color: '#94a3b8', fontWeight: '700' },

    // Wallet
    walletBar: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      marginHorizontal: 16, marginVertical: 12, padding: 14,
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    walletLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
    walletValue: { fontSize: 24, fontWeight: '900', color: '#fff' },
    walletRight: { alignItems: 'flex-end', gap: 4 },
    walletFleet: { fontSize: 12, color: '#06b6d4', fontWeight: '700' },
    walletHint: { fontSize: 11, color: '#64748b', fontWeight: '500' },

    // Success toast
    successToast: {
      marginHorizontal: 12, marginBottom: 8,
      backgroundColor: 'rgba(74,222,128,0.15)',
      borderRadius: 10, borderWidth: 1, borderColor: 'rgba(74,222,128,0.4)',
      padding: 10, alignItems: 'center',
    },
    successToastText: { fontSize: 13, fontWeight: '700', color: '#4ade80' },

    // Lot card
    lotCard: {
      marginHorizontal: 16, marginBottom: 10,
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: 14, borderWidth: 1.5,
      overflow: 'hidden',
    },

    // Mini row
    lotRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      padding: 12,
    },
    miniPhotoWrap: {
      width: 84, height: 60, borderRadius: 10,
      overflow: 'hidden', flexShrink: 0, position: 'relative',
    },
    miniPhoto: { width: '100%', height: '100%', transform: [{ scaleX: -1 }] },
    truckNameBadge: {
      position: 'absolute', bottom: 4, left: 0, right: 0,
      alignItems: 'center',
    },
    truckNameText: { 
      fontSize: 10, 
      fontWeight: '800', 
      color: '#fff', 
      textAlign: 'center',
      textShadowColor: 'rgba(0,0,0,1)', 
      textShadowOffset: { width: 0, height: 0 }, 
      textShadowRadius: 8,
    },
    lotNumBadge: {
      position: 'absolute', top: 3, left: 3,
      backgroundColor: 'rgba(0,0,0,0.65)',
      borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1,
    },
    lotNumText: { fontSize: 9, fontWeight: '800', color: '#f59e0b' },
    miniInfo: { flex: 1, gap: 3 },
    miniTopRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    condBadge: {
      borderRadius: 6, borderWidth: 1,
      paddingHorizontal: 7, paddingVertical: 3,
    },
    condBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },
    starsRow: { flexDirection: 'row', gap: 1 },
    miniName: { fontSize: 14, fontWeight: '800', color: '#e2e8f0' },
    miniTagline: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
    miniRight: { alignItems: 'flex-end', gap: 5, flexShrink: 0 },
    miniPrice: { fontSize: 18, fontWeight: '900' },
    miniArrow: { fontSize: 11, fontWeight: '700' },

    // Expanded
    expandedBody: {
      borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
    },

    // Big photo
    bigPhotoWrap: {
      position: 'relative',
      backgroundColor: 'rgba(0,0,0,0.3)',
      width: '100%',
    },
    bigPhoto: { 
      width: '100%', 
      height: 'auto',
      minHeight: 200,
    },
    bigPhotoOverlay: {
      position: 'absolute', bottom: 10, right: 12,
    },
    bigCondBadge: {
      borderRadius: 7, paddingHorizontal: 10, paddingVertical: 4,
    },
    bigCondText: { fontSize: 11, fontWeight: '800', color: '#fff' },
    bigPriceBadge: {
      position: 'absolute', top: 10, right: 10,
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderRadius: 9, paddingHorizontal: 12, paddingVertical: 5,
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    },
    bigPriceText: { fontSize: 16, fontWeight: '900', color: '#fff' },

    // Title row
    titleRow: {
      flexDirection: 'row', alignItems: 'flex-start',
      paddingHorizontal: 12, paddingTop: 10, gap: 8,
    },
    expandedName: { fontSize: 14, fontWeight: '900', color: '#fff' },
    expandedYear: { fontSize: 11, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
    starsRowBig: { flexDirection: 'row', gap: 2, paddingTop: 2 },

    // Description
    descText: {
      fontSize: 12, color: '#e2e8f0', lineHeight: 18,
      paddingHorizontal: 12, paddingTop: 6,
    },

    // Specs
    specsRow: {
      flexDirection: 'row', gap: 8,
      paddingHorizontal: 12, paddingTop: 10,
    },
    specBox: {
      flex: 1, backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: 10, padding: 9, alignItems: 'center',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    specIcon: { fontSize: 14, marginBottom: 3 },
    specLabel: { fontSize: 9, color: '#64748b', fontWeight: '600', marginBottom: 2 },
    specVal: { fontSize: 11, fontWeight: '800', color: '#e2e8f0', textAlign: 'center' },

    // Pros/Cons
    prosConsRow: {
      flexDirection: 'row', gap: 8,
      paddingHorizontal: 12, paddingTop: 10,
    },
    prosCol: { flex: 1 },
    consCol: { flex: 1 },
    prosLabel: { fontSize: 10, fontWeight: '800', color: '#4ade80', marginBottom: 5 },
    consLabel: { fontSize: 10, fontWeight: '800', color: '#ef4444', marginBottom: 5 },
    proItem: { fontSize: 11, color: '#e2e8f0', lineHeight: 17 },
    conItem: { fontSize: 11, color: '#e2e8f0', lineHeight: 17 },

    // Analytics
    analyticsBox: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 7,
      marginHorizontal: 12, marginTop: 10,
      backgroundColor: 'rgba(245,158,11,0.08)',
      borderRadius: 10, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)',
      padding: 10,
    },
    analyticsIcon: { fontSize: 14 },
    analyticsText: { flex: 1, fontSize: 12, color: '#fde68a', lineHeight: 17, fontWeight: '500' },

    // Buy button
    buyBtn: {
      margin: 12, borderRadius: 12, padding: 13,
      alignItems: 'center', borderWidth: 1,
    },
    buyBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  });
}

import { useState, useRef, useEffect, useMemo } from 'react';import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../constants/themes';
import { useGameStore, LoadOffer, ActiveLoad } from '../store/gameStore';
import { cityState, CITY_STATE, CITIES } from '../constants/config';
import NegotiationChat from './NegotiationChat';
import AssignModal from './AssignModal';
import GuideSpotlight from './GuideSpotlight';
import { useGuideStore } from '../store/guideStore';

interface Props {
  onNegotiate: (load: ActiveLoad) => void;
  onAssigned?: (truckId: string) => void;
}

function LoadRow({ load, onCall, isExpanded, onToggle, scrollViewRef, onLayout, rowY }: { 
  load: LoadOffer; 
  onCall: () => void; 
  isExpanded: boolean;
  onToggle: () => void;
  scrollViewRef: React.RefObject<ScrollView>;
  onLayout: (y: number) => void;
  rowY: number;
}) {
  const T = useTheme();
  const styles = useMemo(() => makeStyles(T), [T]);
  const rowRef = useRef<View>(null);
  const { trucks, gameMinute } = useGameStore();
  const activeStep = useGuideStore(s => s.activeStep);
  const availableTrucks = trucks.filter(t => 
    t.status === 'idle' || t.status === 'at_delivery' || t.status === 'at_pickup'
  ).length;

  const rpm = load.postedRate / load.miles;
  const timeLeft = load.expiresAt - gameMinute;
  const isExpiringSoon = timeLeft < 20;
  const rpmColor = rpm >= 2.5 ? T.success : rpm >= 2.0 ? T.warning : T.danger;
  const equipmentIcon = load.equipment === 'Reefer' ? '❄️' : load.equipment === 'Flatbed' ? '🏗️' : '📦';

  function handleToggle() {
    onToggle();
    if (!isExpanded) {
      // Скроллим к карточке сразу
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: Math.max(0, rowY - 8), animated: true });
      }, 50);
      // Второй скролл после рендера деталей (~180px высота деталей)
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: Math.max(0, rowY - 8), animated: true });
      }, 300);
    }
  }

  return (
    <View
      ref={rowRef}
      style={[styles.loadRow, load.isUrgent && styles.loadRowUrgent, isExpanded && styles.loadRowExpanded]}
      onLayout={(e) => onLayout(e.nativeEvent.layout.y)}
    >
      {/* Компактная строка */}
      <TouchableOpacity 
        style={styles.loadHeader}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <View style={styles.loadHeaderLeft}>
          <Text style={styles.loadRoute}>
            {cityState(load.fromCity)} → {cityState(load.toCity)}
          </Text>
          <Text style={styles.loadMeta}>
            {equipmentIcon} {load.miles}mi · {load.commodity}
          </Text>
        </View>
        
        <View style={styles.loadHeaderRight}>
          <Text style={styles.loadRate}>${load.postedRate.toLocaleString()}</Text>
          <Text style={[styles.loadRpm, { color: rpmColor }]}>${rpm.toFixed(2)}/mi</Text>
          <Text style={styles.marketRate}>~${load.marketRate.toLocaleString()} рынок</Text>
        </View>
        
        <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {/* Развёрнутые детали */}
      {isExpanded && (
        <TouchableOpacity style={styles.loadDetails} onPress={handleToggle} activeOpacity={1}>
          {load.isUrgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>🔥 СРОЧНО +$200</Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Груз</Text>
              <Text style={styles.detailValue}>{load.commodity}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Вес</Text>
              <Text style={styles.detailValue}>{(load.weight / 1000).toFixed(0)}K lbs</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Погрузка</Text>
              <Text style={styles.detailValue}>{load.pickupTime}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Доставка</Text>
              <Text style={styles.detailValue}>{load.deliveryTime}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Брокер</Text>
              <Text style={styles.detailValue}>{load.brokerName}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Истекает</Text>
              <Text style={[styles.detailValue, isExpiringSoon && { color: T.danger }]}>
                {Math.round(timeLeft)} мин
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.callBtn, availableTrucks === 0 && styles.callBtnOff]}
            onPress={availableTrucks > 0 ? onCall : undefined}
            activeOpacity={0.8}
            data-onboarding="call-broker"
          >
            <GuideSpotlight
              step={['find_load', 'negotiate']}
              tip="Нажми — начни переговоры!"
              tipPosition="top"
              style={{ borderRadius: 10 }}
            >
              <Text style={availableTrucks > 0 ? styles.callBtnText : styles.callBtnTextOff}>
                {availableTrucks > 0 ? '📞 Позвонить брокеру' : '🚫 Нет свободных траков'}
              </Text>
            </GuideSpotlight>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Все города в виде "City ST"
const ALL_CITIES = Object.entries(CITY_STATE).map(([city, state]) => ({
  city,
  state,
  label: `${city}, ${state}`,
}));

function CitySearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const T = useTheme();
  const searchStyles = useMemo(() => makeSearchStyles(T), [T]);
  const [suggestions, setSuggestions] = useState<typeof ALL_CITIES>([]);
  const [focused, setFocused] = useState(false);

  function handleChange(text: string) {
    onChange(text);
    if (text.length < 1) {
      setSuggestions([]);
      return;
    }
    const q = text.toLowerCase();
    const matches = ALL_CITIES.filter(
      c => c.city.toLowerCase().includes(q) || c.state.toLowerCase().includes(q)
    ).slice(0, 5);
    setSuggestions(matches);
  }

  function selectSuggestion(item: typeof ALL_CITIES[0]) {
    onChange(item.city);
    setSuggestions([]);
  }

  return (
    <View style={searchStyles.wrapper}>
      <TextInput
        style={searchStyles.input}
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.textDim}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setSuggestions([]), 150)}
      />
      {value.length > 0 && (
        <TouchableOpacity style={searchStyles.clearBtn} onPress={() => { onChange(''); setSuggestions([]); }}>
          <Text style={searchStyles.clearText}>✕</Text>
        </TouchableOpacity>
      )}
      {suggestions.length > 0 && (
        <View style={searchStyles.dropdown}>
          {suggestions.map(item => (
            <TouchableOpacity
              key={item.label}
              style={searchStyles.suggestion}
              onPress={() => selectSuggestion(item)}
            >
              <Text style={searchStyles.suggestionText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function LoadBoardPanel({ onNegotiate, onAssigned }: Props) {
  const T = useTheme();
  const styles = useMemo(() => makeStyles(T), [T]);
  const filterStyles = useMemo(() => makeFilterStyles(T), [T]);
  const { availableLoads, trucks, refreshLoadBoard, bookLoad, loadBoardSearchFrom, setLoadBoardSearch } = useGameStore();
  const activeStep = useGuideStore(s => s.activeStep);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const rowPositions = useRef<Record<string, number>>({});
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [deadheadRadius, setDeadheadRadius] = useState<number | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [chatLoad, setChatLoad] = useState<LoadOffer | null>(null);
  const [pendingLoad, setPendingLoad] = useState<ActiveLoad | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<any>(null);

  function handleRefresh() {
    refreshLoadBoard();
    // Показываем анимацию "обновлено" на 2 секунды
    setCountdown(2);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownRef.current);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  // Автоматически раскрыть первый груз при первом входе — ОТКЛЮЧЕНО
  // useEffect(() => {
  //   try {
  //     const isFirstTime = !localStorage.getItem('dispatch-guide-done');
  //     if (isFirstTime && availableLoads.length > 0 && !expandedId) {
  //       setExpandedId(availableLoads[0].id);
  //     }
  //   } catch {}
  // }, [availableLoads, expandedId]);

  // При монтировании — применить предзаполненный поиск из стора
  useEffect(() => {
    if (loadBoardSearchFrom) {
      setSearchFrom(loadBoardSearchFrom);
      setLoadBoardSearch('');
    }
  }, [loadBoardSearchFrom]);

  const availableTrucks = trucks.filter(t =>
    t.status === 'idle' || t.status === 'at_delivery' || t.status === 'at_pickup'
  ).length;
  const totalTrucks = trucks.length;

  function handleCall(load: LoadOffer) {
    setChatLoad(load);
  }

  function handleNegotiationAccepted(agreedRate: number) {
    if (!chatLoad) return;
    const activeLoad: ActiveLoad = {
      ...chatLoad,
      agreedRate,
      truckId: '',
      phase: 'to_pickup',
      detentionMinutes: 0,
      detentionPaid: false,
    };
    bookLoad(activeLoad);
    setPendingLoad(activeLoad);
    setChatLoad(null);
  }

  // Фильтрация по городу/штату + deadhead radius
  const filteredLoads = availableLoads.filter(load => {
    // Deadhead radius — если задан, ищем грузы в радиусе от города (игнорируем fromMatch)
    if (deadheadRadius && searchFrom.trim() !== '') {
      const searchLower = searchFrom.toLowerCase();
      const originCity = Object.keys(CITIES).find(c =>
        c.toLowerCase() === searchLower ||
        c.toLowerCase().includes(searchLower) ||
        searchLower.includes(c.toLowerCase())
      );
      if (originCity && CITIES[load.fromCity]) {
        const [ox, oy] = CITIES[originCity];
        const [fx, fy] = CITIES[load.fromCity];
        const R = 3958.8;
        const dLat = (fy - oy) * Math.PI / 180;
        const dLng = (fx - ox) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(oy * Math.PI / 180) * Math.cos(fy * Math.PI / 180) *
          Math.sin(dLng/2) * Math.sin(dLng/2);
        const distMiles = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        if (distMiles > deadheadRadius) return false;
      }
      // Фильтр "Куда" если задан
      if (searchTo.trim() !== '') {
        const toMatch =
          load.toCity.toLowerCase().includes(searchTo.toLowerCase()) ||
          (CITY_STATE[load.toCity] || '').toLowerCase().includes(searchTo.toLowerCase());
        if (!toMatch) return false;
      }
      return true;
    }

    // Обычный текстовый фильтр без радиуса
    const fromMatch = searchFrom.trim() === '' ||
      load.fromCity.toLowerCase().includes(searchFrom.toLowerCase()) ||
      (CITY_STATE[load.fromCity] || '').toLowerCase().includes(searchFrom.toLowerCase());
    const toMatch = searchTo.trim() === '' ||
      load.toCity.toLowerCase().includes(searchTo.toLowerCase()) ||
      (CITY_STATE[load.toCity] || '').toLowerCase().includes(searchTo.toLowerCase());

    return fromMatch && toMatch;
  });

  const isFiltering = searchFrom.trim() !== '' || searchTo.trim() !== '' || deadheadRadius !== null;

  // Если фильтр дал мало результатов — добавляем похожие грузы из общего пула
  const displayLoads = (() => {
    if (!isFiltering || filteredLoads.length >= 5) return filteredLoads;
    // Добавляем грузы из того же штата или близкие
    const stateCode = searchFrom.trim()
      ? (CITY_STATE[Object.keys(CITIES).find(c => c.toLowerCase().includes(searchFrom.toLowerCase())) || ''] || searchFrom.toUpperCase().slice(0,2))
      : '';
    const nearby = availableLoads.filter(l =>
      !filteredLoads.includes(l) &&
      (stateCode ? (CITY_STATE[l.fromCity] || '') === stateCode : true)
    ).slice(0, 8 - filteredLoads.length);
    return [...filteredLoads, ...nearby];
  })();

  // Количество активных фильтров для бейджа
  const activeFiltersCount = (searchFrom.trim() ? 1 : 0) + (searchTo.trim() ? 1 : 0) + (deadheadRadius ? 1 : 0);

  return (
    <View style={styles.container}>
      {/* ── КОМПАКТНЫЙ HEADER (одна строка) ── */}
      <View style={styles.header}>
        {/* Левая часть: заголовок + счётчик */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.headerTitle}>📋 Load Board</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {isFiltering ? `${filteredLoads.length}/${availableLoads.length}` : availableLoads.length} грузов · {availableTrucks}/{totalTrucks} траков
          </Text>
        </View>

        {/* Правая часть: 3 иконки-кнопки */}
        <View style={styles.headerBtns}>
          {/* Авто */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              const idleTruck = trucks.find(t => t.status === 'idle');
              if (idleTruck && idleTruck.currentCity) {
                setSearchFrom(idleTruck.currentCity);
                setFilterOpen(true);
              }
            }}
          >
            <Text style={styles.iconBtnEmoji}>🚛</Text>
            <Text style={styles.iconBtnLabel}>Авто</Text>
          </TouchableOpacity>

          {/* Фильтр */}
          <TouchableOpacity
            style={[styles.iconBtn, filterOpen && styles.iconBtnActive, activeFiltersCount > 0 && styles.iconBtnFiltered]}
            onPress={() => setFilterOpen(v => !v)}
          >
            <Text style={styles.iconBtnEmoji}>🔍</Text>
            <Text style={[styles.iconBtnLabel, (filterOpen || activeFiltersCount > 0) && { color: '#06b6d4' }]}>Фильтр</Text>
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeTxt}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Обновить */}
          <TouchableOpacity style={[styles.iconBtn, styles.iconBtnRefresh]} onPress={handleRefresh}>
            <Text style={styles.iconBtnEmojiRefresh}>{countdown !== null ? `${countdown}` : '🔄'}</Text>
            <Text style={styles.iconBtnLabelRefresh}>Обновить</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── КОЛЛАПСИРУЕМАЯ ПАНЕЛЬ ФИЛЬТРОВ ── */}
      {filterOpen && (
        <View style={styles.filterPanel}>
          <View style={filterStyles.row}>
            <View style={{ flex: 1 }}>
              <CitySearchInput
                value={searchFrom}
                onChange={setSearchFrom}
                placeholder="🔍 Откуда"
              />
            </View>
            <View style={{ flex: 1 }}>
              <CitySearchInput
                value={searchTo}
                onChange={setSearchTo}
                placeholder="🔍 Куда"
              />
            </View>
          </View>
          <View style={filterStyles.deadheadRow}>
            <Text style={filterStyles.label}>📍</Text>
            {[100, 150, 200].map(r => (
              <TouchableOpacity
                key={r}
                style={[filterStyles.dhBtn, deadheadRadius === r && filterStyles.dhBtnActive]}
                onPress={() => setDeadheadRadius(deadheadRadius === r ? null : r)}
              >
                <Text style={[filterStyles.dhTxt, deadheadRadius === r && filterStyles.dhTxtActive]}>
                  {r}mi
                </Text>
              </TouchableOpacity>
            ))}
            {activeFiltersCount > 0 && (
              <TouchableOpacity
                style={filterStyles.clearAll}
                onPress={() => { setSearchFrom(''); setSearchTo(''); setDeadheadRadius(null); }}
              >
                <Text style={filterStyles.clearAllTxt}>✕ Сброс</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {availableTrucks === 0 && availableLoads.length > 0 && (
        <View style={styles.allBusy}>
          <Text style={styles.allBusyText}>⏳ Все траки заняты</Text>
        </View>
      )}

      {filteredLoads.length === 0 && displayLoads.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>{isFiltering ? '🔍' : '📭'}</Text>
          <Text style={styles.emptyTitle}>{isFiltering ? 'Ничего не найдено' : 'Нет грузов'}</Text>
          <Text style={styles.emptySub}>{isFiltering ? 'Попробуй другой город' : 'Нажми 🔄 чтобы обновить'}</Text>
        </View>
      ) : (
        <ScrollView ref={scrollViewRef} style={styles.list} showsVerticalScrollIndicator={false}>
          {/* Подсказка гайда */}
          {(activeStep === 'find_load' || activeStep === 'negotiate') && (
            <View style={{
              margin: 10, marginBottom: 4,
              padding: 10, borderRadius: 10,
              backgroundColor: 'rgba(0,122,255,0.08)',
              borderWidth: 1, borderColor: 'rgba(0,122,255,0.3)',
              flexDirection: 'row', alignItems: 'center', gap: 8,
            }}>
              <Text style={{ fontSize: 18 }}>👆</Text>
              <Text style={{ fontSize: 12, color: '#007aff', fontWeight: '700', flex: 1 }}>
                {activeStep === 'find_load'
                  ? 'Нажми на любой груз ▶ чтобы раскрыть детали'
                  : 'Нажми «📞 Позвонить брокеру» чтобы начать переговоры'}
              </Text>
            </View>
          )}
          {displayLoads.map(load => (
            <LoadRow
              key={load.id}
              load={load}
              onCall={() => handleCall(load)}
              isExpanded={expandedId === load.id}
              onToggle={() => setExpandedId(expandedId === load.id ? null : load.id)}
              scrollViewRef={scrollViewRef}
              onLayout={(y) => { rowPositions.current[load.id] = y; }}
              rowY={rowPositions.current[load.id] ?? 0}
            />
          ))}
        </ScrollView>
      )}

      {/* Чат-переговоры */}
      <NegotiationChat
        visible={!!chatLoad}
        load={chatLoad}
        onClose={() => setChatLoad(null)}
        onAccepted={handleNegotiationAccepted}
      />

      {/* Назначение трака после сделки */}
      {pendingLoad && (
        <AssignModal
          load={pendingLoad}
          onClose={() => setPendingLoad(null)}
          onAssigned={(truckId) => {
            setPendingLoad(null);
            onAssigned?.(truckId);
          }}
        />
      )}
    </View>
  );
}

function makeFilterStyles(T: ThemeColors) {
  return StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  deadheadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 13,
    color: T.textDim,
  },
  dhBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: T.bgCard,
  },
  dhBtnActive: {
    borderColor: T.primary,
    backgroundColor: 'rgba(6,182,212,0.15)',
  },
  dhTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: T.textDim,
  },
  dhTxtActive: {
    color: T.primary,
  },
  clearAll: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
    backgroundColor: 'rgba(239,68,68,0.1)',
    marginLeft: 2,
  },
  clearAllTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ef4444',
  },
  });
}

function makeSearchStyles(T: ThemeColors) {
  return StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 5,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  wrapper: {
    position: 'relative',
    zIndex: 10,
  },
  input: {
    backgroundColor: T.bgCard,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
    color: T.text,
    paddingRight: 24,
  },
  clearBtn: {
    position: 'absolute',
    right: 6,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  clearText: {
    fontSize: 11,
    color: T.textDim,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: T.bgCard,
    borderWidth: 1,
    borderColor: T.primary,
    borderRadius: 8,
    zIndex: 999,
    overflow: 'hidden',
    marginTop: 2,
  },
  suggestion: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  suggestionText: {
    fontSize: 13,
    color: T.text,
    fontWeight: '600',
  },
  });
}

function makeStyles(T: ThemeColors) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
    gap: 8,
  },
  headerTitle: { fontSize: 14, fontWeight: '900', color: T.text },
  headerSub: { fontSize: 10, color: T.textDim, marginTop: 1 },

  headerBtns: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    flexShrink: 0,
  },
  iconBtn: {
    width: 52,
    height: 48,
    borderRadius: 10,
    backgroundColor: T.bgCardHover,
    borderWidth: 1,
    borderColor: T.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconBtnActive: {
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderColor: 'rgba(0,122,255,0.4)',
  },
  iconBtnFiltered: {
    backgroundColor: 'rgba(0,122,255,0.15)',
    borderColor: T.primary,
  },
  iconBtnRefresh: {
    width: 72,
    height: 48,
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderColor: T.primary,
    borderWidth: 1.5,
  },
  iconBtnEmoji: { fontSize: 17 },
  iconBtnLabel: { fontSize: 10, color: T.textMuted, fontWeight: '600', lineHeight: 12 },
  iconBtnEmojiRefresh: { fontSize: 20 },
  iconBtnLabelRefresh: { fontSize: 11, color: T.primary, fontWeight: '700', lineHeight: 13 },

  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: T.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeTxt: { fontSize: 9, fontWeight: '900', color: '#fff' },

  filterPanel: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
    backgroundColor: 'rgba(0,122,255,0.04)',
  },

  // старые стили кнопок (оставляем для совместимости, но не используются)
  refreshBtn: { height: 36, paddingHorizontal: 10, borderRadius: 10, backgroundColor: 'rgba(6,182,212,0.15)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.5)', justifyContent: 'center', alignItems: 'center', gap: 2 },
  refreshIcon: { fontSize: 16 },
  refreshCountdown: { fontSize: 10, fontWeight: '900', color: '#06b6d4' },
  autoSearchBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(74,222,128,0.12)', borderWidth: 1, borderColor: 'rgba(74,222,128,0.45)', justifyContent: 'center', alignItems: 'center', gap: 2 },
  autoSearchIcon: { fontSize: 16 },
  autoSearchText: { fontSize: 9, fontWeight: '900', color: '#4ade80' },

  allBusy: {
    margin: 10,
    padding: 10,
    backgroundColor: 'rgba(251,146,60,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.3)',
  },
  allBusyText: { fontSize: 12, fontWeight: '700', color: T.warning, textAlign: 'center' },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 8,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: T.text },
  emptySub: { fontSize: 12, color: T.textDim, textAlign: 'center' },

  list: { flex: 1 },

  loadRow: {
    marginHorizontal: 10,
    marginVertical: 4,
    backgroundColor: T.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.border,
    overflow: 'hidden',
  },
  loadRowUrgent: {
    borderColor: 'rgba(249,115,22,0.3)',
    backgroundColor: 'rgba(249,115,22,0.04)',
  },
  loadRowExpanded: {
    borderColor: 'rgba(0,122,255,0.4)',
    borderWidth: 2,
    backgroundColor: 'rgba(0,122,255,0.03)',
  },

  loadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  loadHeaderLeft: {
    flex: 1,
  },
  loadRoute: {
    fontSize: 14,
    fontWeight: '700',
    color: T.text,
    marginBottom: 2,
  },
  loadMeta: {
    fontSize: 11,
    color: T.textDim,
  },
  loadHeaderRight: {
    alignItems: 'flex-end',
  },
  loadRate: {
    fontSize: 15,
    fontWeight: '900',
    color: T.success,
    marginBottom: 2,
  },
  loadRpm: {
    fontSize: 10,
    fontWeight: '700',
  },
  marketRate: {
    fontSize: 10,
    fontWeight: '600',
    color: T.textMuted,
    marginTop: 1,
  },
  expandIcon: {
    fontSize: 12,
    color: T.primary,
    marginLeft: 8,
  },

  loadDetails: {
    padding: 12,
    paddingTop: 0,
    paddingBottom: 14,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: T.border,
  },

  urgentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(249,115,22,0.2)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.4)',
  },
  urgentText: { fontSize: 10, fontWeight: '800', color: '#f97316' },

  detailRow: {
    flexDirection: 'row',
    gap: 10,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: T.textDim,
    fontWeight: '600',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    color: T.text,
    fontWeight: '600',
  },

  callBtn: {
    backgroundColor: T.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  callBtnOff: {
    backgroundColor: T.bgCardHover,
    borderWidth: 1,
    borderColor: T.border,
  },
  callBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  callBtnTextOff: {
    fontSize: 14,
    fontWeight: '700',
    color: T.textMuted,
  },
  });
}

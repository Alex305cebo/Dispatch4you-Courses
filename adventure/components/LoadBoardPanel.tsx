import { useState, useRef, useEffect } from 'react';import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
} from 'react-native';
import { Colors } from '../constants/colors';
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

function LoadRow({ load, onCall, isExpanded, onToggle, scrollViewRef }: { 
  load: LoadOffer; 
  onCall: () => void; 
  isExpanded: boolean;
  onToggle: () => void;
  scrollViewRef: React.RefObject<ScrollView>;
}) {
  const rowRef = useRef<View>(null);
  const { trucks, gameMinute } = useGameStore();
  const activeStep = useGuideStore(s => s.activeStep);
  // Включаем траки которые скоро освободятся (at_delivery, at_pickup)
  const availableTrucks = trucks.filter(t => 
    t.status === 'idle' || t.status === 'at_delivery' || t.status === 'at_pickup'
  ).length;

  const rpm = load.postedRate / load.miles;
  const timeLeft = load.expiresAt - gameMinute;
  const isExpiringSoon = timeLeft < 20;
  const rpmColor = rpm >= 2.5 ? Colors.success : rpm >= 2.0 ? Colors.warning : Colors.danger;
  const equipmentIcon = load.equipment === 'Reefer' ? '❄️' : load.equipment === 'Flatbed' ? '🏗️' : '📦';

  return (
    <View ref={rowRef} style={[styles.loadRow, load.isUrgent && styles.loadRowUrgent]}>
      {/* Компактная строка */}
      <TouchableOpacity 
        style={styles.loadHeader}
        onPress={() => {
          onToggle();
          // Если раскрываем — скроллим чтобы кнопка была видна
          if (!isExpanded) {
            setTimeout(() => {
              if (rowRef.current && scrollViewRef.current) {
                rowRef.current.measureLayout(
                  scrollViewRef.current as any,
                  (_x, y, _w, h) => {
                    // Скроллим так чтобы вся раскрытая карточка была видна
                    (scrollViewRef.current as any).scrollTo({ y: y, animated: true });
                  },
                  () => {}
                );
              }
            }, 100);
            // Второй скролл — после рендера деталей, чтобы кнопка "Позвонить" была видна
            setTimeout(() => {
              if (rowRef.current && scrollViewRef.current) {
                rowRef.current.measureLayout(
                  scrollViewRef.current as any,
                  (_x, y, _w, h) => {
                    (scrollViewRef.current as any).scrollTo({ y: y + h - 200, animated: true });
                  },
                  () => {}
                );
              }
            }, 350);
          }
        }}
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
        <View style={styles.loadDetails}>
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
              <Text style={[styles.detailValue, isExpiringSoon && { color: Colors.danger }]}>
                {Math.round(timeLeft)} мин
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.callBtn, availableTrucks === 0 && styles.callBtnOff]}
            onPress={availableTrucks > 0 ? onCall : undefined}
            activeOpacity={0.8}
          >
            <GuideSpotlight
              step={['find_load', 'negotiate']}
              tip="Нажми — начни переговоры!"
              tipPosition="top"
              style={{ borderRadius: 10 }}
            >
              <Text style={styles.callBtnText}>
                {availableTrucks > 0 ? '📞 Позвонить брокеру' : '🚫 Нет свободных траков'}
              </Text>
            </GuideSpotlight>
          </TouchableOpacity>
        </View>
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

const deadheadStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 11,
    color: Colors.textDim,
    fontWeight: '600',
    marginRight: 2,
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  btnActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(6,182,212,0.15)',
  },
  btnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDim,
  },
  btnTextActive: {
    color: Colors.primary,
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
    backgroundColor: 'rgba(239,68,68,0.1)',
    marginLeft: 4,
  },
  clearText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ef4444',
  },
});

function CitySearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
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
  const { availableLoads, trucks, refreshLoadBoard, bookLoad, loadBoardSearchFrom, setLoadBoardSearch } = useGameStore();
  const activeStep = useGuideStore(s => s.activeStep);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [deadheadRadius, setDeadheadRadius] = useState<number | null>(null);
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
    const fromMatch = searchFrom.trim() === '' ||
      load.fromCity.toLowerCase().includes(searchFrom.toLowerCase()) ||
      (CITY_STATE[load.fromCity] || '').toLowerCase().includes(searchFrom.toLowerCase());
    const toMatch = searchTo.trim() === '' ||
      load.toCity.toLowerCase().includes(searchTo.toLowerCase()) ||
      (CITY_STATE[load.toCity] || '').toLowerCase().includes(searchTo.toLowerCase());

    // Deadhead radius фильтр — ищем грузы в радиусе от города поиска
    let radiusMatch = true;
    if (deadheadRadius && searchFrom.trim() !== '') {
      const originCity = Object.keys(CITIES).find(c =>
        c.toLowerCase().includes(searchFrom.toLowerCase())
      );
      if (originCity && CITIES[originCity] && CITIES[load.fromCity]) {
        const [ox, oy] = CITIES[originCity];
        const [fx, fy] = CITIES[load.fromCity];
        // 1 градус ≈ 69 миль
        const distMiles = Math.round(Math.hypot(fx - ox, fy - oy) * 69);
        radiusMatch = distMiles <= deadheadRadius;
      }
    }

    return fromMatch && toMatch && radiusMatch;
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📋 Load Board</Text>
          <Text style={styles.headerSub}>
            {isFiltering ? `${filteredLoads.length} из ${availableLoads.length}` : availableLoads.length} грузов · {availableTrucks}/{totalTrucks} доступно
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          {/* Авто-поиск для свободного трака */}
          <TouchableOpacity
            style={styles.autoSearchBtn}
            onPress={() => {
              const idleTruck = trucks.find(t => t.status === 'idle');
              if (idleTruck && idleTruck.currentCity) {
                setSearchFrom(idleTruck.currentCity);
              }
            }}
          >
            <Text style={styles.autoSearchIcon}>🚛</Text>
            <Text style={styles.autoSearchText}>Авто</Text>
          </TouchableOpacity>
          {/* Обновить */}
          <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
            <Text style={styles.refreshIcon}>🔄</Text>
            <Text style={styles.refreshCountdown}>{countdown !== null ? `${countdown}s` : 'Обновить'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Поиск */}
      <View style={searchStyles.container}>
        <CitySearchInput
          value={searchFrom}
          onChange={setSearchFrom}
          placeholder="🔍 Откуда (город или штат)"
        />
        <CitySearchInput
          value={searchTo}
          onChange={setSearchTo}
          placeholder="🔍 Куда (город или штат)"
        />
      </View>

      {/* Deadhead radius фильтр */}
      <View style={deadheadStyles.row}>
        <Text style={deadheadStyles.label}>📍 Deadhead:</Text>
        {[100, 150, 200].map(r => (
          <TouchableOpacity
            key={r}
            style={[deadheadStyles.btn, deadheadRadius === r && deadheadStyles.btnActive]}
            onPress={() => setDeadheadRadius(deadheadRadius === r ? null : r)}
          >
            <Text style={[deadheadStyles.btnText, deadheadRadius === r && deadheadStyles.btnTextActive]}>
              {r}mi
            </Text>
          </TouchableOpacity>
        ))}
        {deadheadRadius !== null && (
          <TouchableOpacity style={deadheadStyles.clearBtn} onPress={() => setDeadheadRadius(null)}>
            <Text style={deadheadStyles.clearText}>✕ Сброс</Text>
          </TouchableOpacity>
        )}
      </View>

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
              backgroundColor: 'rgba(6,182,212,0.1)',
              borderWidth: 1, borderColor: 'rgba(6,182,212,0.4)',
              flexDirection: 'row', alignItems: 'center', gap: 8,
            }}>
              <Text style={{ fontSize: 18 }}>👆</Text>
              <Text style={{ fontSize: 12, color: '#67e8f9', fontWeight: '700', flex: 1 }}>
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

const searchStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  wrapper: {
    position: 'relative',
    zIndex: 10,
  },
  input: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: '#fff',
    paddingRight: 28,
  },
  clearBtn: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  clearText: {
    fontSize: 11,
    color: Colors.textDim,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#1e2535',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    zIndex: 999,
    overflow: 'hidden',
    marginTop: 2,
  },
  suggestion: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  suggestionText: {
    fontSize: 13,
    color: '#e2e8f0',
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 15, fontWeight: '900', color: '#fff' },
  headerSub: { fontSize: 11, color: Colors.textDim, marginTop: 2 },
  refreshBtn: {
    height: 46,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(6,182,212,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(6,182,212,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  refreshIcon: { fontSize: 18 },
  refreshCountdown: {
    fontSize: 11,
    fontWeight: '900',
    color: '#06b6d4',
  },
  autoSearchBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: 'rgba(74,222,128,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(74,222,128,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  autoSearchIcon: { fontSize: 18 },
  autoSearchText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#4ade80',
  },

  allBusy: {
    margin: 10,
    padding: 10,
    backgroundColor: 'rgba(251,146,60,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.3)',
  },
  allBusyText: { fontSize: 12, fontWeight: '700', color: Colors.warning, textAlign: 'center' },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 8,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
  emptySub: { fontSize: 12, color: Colors.textDim, textAlign: 'center' },

  list: { flex: 1 },

  loadRow: {
    marginHorizontal: 10,
    marginVertical: 4,
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  loadRowUrgent: {
    borderColor: 'rgba(249,115,22,0.4)',
    backgroundColor: 'rgba(249,115,22,0.05)',
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
    color: '#fff',
    marginBottom: 2,
  },
  loadMeta: {
    fontSize: 11,
    color: Colors.textDim,
  },
  loadHeaderRight: {
    alignItems: 'flex-end',
  },
  loadRate: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.success,
    marginBottom: 2,
  },
  loadRpm: {
    fontSize: 10,
    fontWeight: '700',
  },
  marketRate: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 1,
  },
  expandIcon: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 8,
  },

  loadDetails: {
    padding: 12,
    paddingTop: 0,
    paddingBottom: 14,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
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
    color: Colors.textDim,
    fontWeight: '600',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },

  callBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  callBtnOff: {
    backgroundColor: Colors.bgCardHover,
  },
  callBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
});

// Карточки траков поверх карты — без фона, только карточки
// При выборе: карточка выделяется, под ней выпадает панель с событиями/действиями
import React, { memo, useRef, useEffect, useState, useMemo } from 'react';
import { useGameStore, GameEvent, DeliveryResult } from '../store/gameStore';
import { useThemeStore } from '../store/themeStore';
import { CITY_STATE, CITIES } from '../constants/config';
import { getDriverAvatar } from '../utils/driverAvatars';
import { SERVICE_VEHICLE_CONFIGS } from '../types/serviceVehicle';
import DayEndBanner from './DayEndPopup';
import ShiftEndBanner from './ShiftEndPopup';
import TruckStatsView from './TruckStatsView';
import { UnifiedChatUI } from './UnifiedChatUI';

const FLUENT = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis';
const STATUS_COLOR: Record<string, string> = {
  idle: '#38bdf8', driving: '#818cf8', loaded: '#34d399',
  at_pickup: '#fbbf24', at_delivery: '#a78bfa',
  breakdown: '#f87171', waiting: '#fb923c', in_garage: '#f59e0b',
};
const STATUS_LABEL: Record<string, string> = {
  idle: 'Свободен', driving: 'К погрузке', loaded: 'В пути',
  at_pickup: 'Погрузка', at_delivery: 'Разгрузка',
  breakdown: 'Поломка', waiting: 'Detention', in_garage: 'В гараже',
};

function getStatusMessage(truck: any): string {
  if (truck.onNightStop) return '🌙 Ночёвка';
  if (truck.hosRestUntilMinute > 0) return '😴 HOS отдых';
  if (truck.onMandatoryBreak) return '☕ 30-мин перерыв';
  if (truck.status === 'breakdown') return '🔧 Поломка!';
  if (truck.status === 'waiting') return '⏳ Detention';
  if (truck.status === 'at_pickup') {
    const city = truck.currentCity ? truck.currentCity.split(',')[0] : '';
    return `📦 Грузится`;
  }
  if (truck.status === 'at_delivery') {
    return `🏁 Разгрузка`;
  }
  if (truck.status === 'driving') {
    const city = truck.destinationCity ? truck.destinationCity.split(',')[0] : '';
    return city ? `🚛 К ${city}` : '🚛 К погрузке';
  }
  if (truck.status === 'loaded') {
    const city = truck.destinationCity ? truck.destinationCity.split(',')[0] : '';
    return city ? `📦 → ${city}` : '📦 В пути';
  }
  if (truck.status === 'idle') {
    const w = truck.idleWarningLevel ?? 0;
    if (w === 3) return '🔴 Нужен груз!';
    if (w === 2) return '🟠 Нужен груз';
    if (w === 1) return '🟡 Ищем груз';
    return '✅ Свободен';
  }
  if (truck.status === 'in_garage') return '🔩 В гараже';
  return '—';
}

const URGENCY_COLOR: Record<string, string> = {
  low: '#94a3b8', medium: '#f59e0b', high: '#f97316', critical: '#ef4444',
};
const URGENCY_ICON: Record<string, string> = {
  low: '📋', medium: '⚠️', high: '🔥', critical: '🚨',
};

function getTruckColor(truck: any): string {
  if (truck.onNightStop || truck.onMandatoryBreak) return '#64748b';
  if (truck.status === 'waiting') return '#64748b';
  if (truck.status === 'breakdown') return '#f87171';
  if (truck.status === 'idle') {
    const w = truck.idleWarningLevel ?? 0;
    if (w === 3) return '#ef4444';
    if (w === 2) return '#fb923c';
    if (w === 1) return '#fbbf24';
  }
  return STATUS_COLOR[truck.status] || '#38bdf8';
}

function getMoodEmoji(mood: number, status: string, truck: any): string {
  const seed = truck?.id ? parseInt(truck.id.replace(/\D/g, '')) || 0 : 0;
  const EMOJIS: Record<string, string[]> = {
    sleeping: [`${FLUENT}/Smilies/Zzz.png`],
    explode:  [`${FLUENT}/Smilies/Exploding%20Head.png`],
    tired:    [`${FLUENT}/Smilies/Tired%20Face.png`],
    happy:    [`${FLUENT}/Smilies/Partying%20Face.png`, `${FLUENT}/Smilies/Grinning%20Face.png`, `${FLUENT}/Smilies/Star-Struck.png`],
    good:     [`${FLUENT}/Smilies/Winking%20Face.png`, `${FLUENT}/Smilies/Smiling%20Face%20with%20Sunglasses.png`, `${FLUENT}/Smilies/Cowboy%20Hat%20Face.png`],
    neutral:  [`${FLUENT}/Smilies/Thinking%20Face.png`, `${FLUENT}/Smilies/Hushed%20Face.png`],
    bad:      [`${FLUENT}/Smilies/Worried%20Face.png`, `${FLUENT}/Smilies/Unamused%20Face.png`],
    rage:     [`${FLUENT}/Smilies/Enraged%20Face.png`],
  };
  const pick = (arr: string[]) => arr[seed % arr.length];
  if (truck?.onNightStop || truck?.hosRestUntilMinute > 0) return pick(EMOJIS.sleeping);
  if (status === 'breakdown') return pick(EMOJIS.explode);
  if (status === 'waiting')   return pick(EMOJIS.tired);
  if (mood >= 75) return pick(EMOJIS.happy);
  if (mood >= 55) return pick(EMOJIS.good);
  if (mood >= 35) return pick(EMOJIS.neutral);
  if (mood >= 15) return pick(EMOJIS.bad);
  return pick(EMOJIS.rage);
}

interface Props {
  onTruckClick: (truck: any) => void;
  selectedTruckId: string | null;
}

/** Познавательные факты для диспетчеров — показываются в dropdown */
const ROUTE_FACTS = [
  { icon: '🛣️', title: 'Interstate System', text: 'Чётные номера I-хайвеев идут с запада на восток, нечётные — с юга на север' },
  { icon: '⛽', title: 'Fuel Stop', text: 'Средний трак расходует 6-8 MPG. На 1000 миль нужно ~150 галлонов ($500+)' },
  { icon: '📋', title: 'BOL важен', text: 'Bill of Lading — главный документ груза. Без него груз не примут на разгрузке' },
  { icon: '⚖️', title: 'Весовые станции', text: 'Макс. вес трака в США — 80,000 lbs. Перегруз = штраф до $10,000' },
  { icon: '🌡️', title: 'Reefer грузы', text: 'Температура в рефрижераторе должна быть точной. Отклонение на 2°F = claim' },
  { icon: '💰', title: 'Rate per mile', text: 'Хороший RPM для dry van: $2.50+. Ниже $2.00 — убыточный рейс' },
  { icon: '📱', title: 'ELD обязателен', text: 'С 2019 года ELD обязателен для всех CMV. Штраф за отсутствие — $16,000' },
  { icon: '🔄', title: 'Deadhead', text: 'Пустой пробег (deadhead) — главный враг прибыли. Идеал: менее 10% от общего' },
  { icon: '🏢', title: 'Factoring', text: 'Factoring компании платят 97% ставки сразу. Брокеры платят через 30-45 дней' },
  { icon: '⏱️', title: 'Detention', text: 'После 2ч ожидания можно требовать detention pay: $50-75/час — это стандарт' },
  { icon: '🗺️', title: 'Truck Stops', text: 'В США ~5,000 truck stops. Pilot/Flying J и Love\'s — крупнейшие сети' },
  { icon: '🔧', title: 'Pre-trip', text: 'Pre-trip inspection обязателен перед каждым рейсом. Занимает 15-30 минут' },
  { icon: '📊', title: 'CSA Score', text: 'CSA Score влияет на страховку и доступ к грузам. Ниже 50 — отлично' },
  { icon: '🌙', title: 'HOS правила', text: '11ч вождения, 14ч на смену, 10ч отдых. 30-мин перерыв после 8ч' },
  { icon: '💼', title: 'Broker vs Shipper', text: 'Прямые грузы от shipper платят на 15-20% больше чем через брокера' },
  { icon: '🚛', title: 'Flatbed', text: 'Flatbed грузы платят больше, но требуют tarps и straps. Загрузка дольше' },
  { icon: '📦', title: 'LTL vs FTL', text: 'FTL (Full Truck Load) — один груз на весь трак. LTL — несколько грузов' },
  { icon: '🏗️', title: 'Oversize', text: 'Негабаритные грузы требуют спец. разрешения и escort. Ставки x2-x3' },
];

const LOADING_FACTS = [
  { icon: '📦', title: 'Погрузка', text: 'Стандартное время погрузки — 2 часа. Всё что дольше — detention' },
  { icon: '🔍', title: 'Проверь BOL', text: 'Сверь количество паллет, вес и адрес доставки с Rate Con' },
  { icon: '📸', title: 'Фото груза', text: 'Всегда фотографируй груз при погрузке — защита от damage claims' },
  { icon: '⚖️', title: 'Вес важен', text: 'Попроси shipper указать точный вес. Перегруз на весовой = задержка' },
  { icon: '🔒', title: 'Seal number', text: 'Запиши номер пломбы (seal) в BOL. Без него груз могут не принять' },
  { icon: '🏁', title: 'Разгрузка', text: 'Получи подпись на POD (Proof of Delivery) — без него не получишь оплату' },
  { icon: '📋', title: 'POD = деньги', text: 'Отправь POD брокеру в тот же день. Чем быстрее — тем быстрее оплата' },
  { icon: '⏰', title: 'Appointment', text: 'Опоздание на appointment может стоить $200-500 штрафа или отказ в приёме' },
];

function getDispatchFact(load: any, truck: any, seed: number) {
  return ROUTE_FACTS[Math.abs(seed) % ROUTE_FACTS.length];
}

function getLoadingFact(load: any, truck: any, isPU: boolean, seed: number) {
  const facts = isPU ? LOADING_FACTS.slice(0, 5) : LOADING_FACTS.slice(5);
  return facts[Math.abs(seed) % facts.length];
}

/** HUD-плашка с вкладками — Route / Stats / Load / Связь */
function TruckHUD({ truck, isDark, ps }: { truck: any; isDark: boolean; ps: any }) {
  const [activeTab, setActiveTab] = useState<'route' | 'stats' | 'load' | 'chat' | 'deal'>('route');
  const collapsed = false; // Всегда развёрнуто
  const gameMinute = useGameStore(s => s.gameMinute);
  const negotiation = useGameStore(s => s.negotiation);
  const makeOffer = useGameStore(s => s.makeOffer);
  const closeNegotiation = useGameStore(s => s.closeNegotiation);
  const assignLoadToTruck = useGameStore(s => s.assignLoadToTruck);
  const sessionName = useGameStore(s => s.sessionName);
  const unreadChatCount = useGameStore(s =>
    s.notifications.filter((n: any) => ['email','pod_ready','rate_con','detention','missed_call','voicemail','text','urgent'].includes(n.type) && !n.read).length
  );
  const color = getTruckColor(truck);

  // Локальное состояние переговоров внутри HUD
  const [dealMessages, setDealMessages] = useState<Array<{ from: 'broker' | 'me'; text: string }>>([]);
  const [dealDone, setDealDone] = useState<'accepted' | 'rejected' | null>(null);
  const [dealAgreedRate, setDealAgreedRate] = useState(0);
  const [dealCurrentOffer, setDealCurrentOffer] = useState(0);
  const [isAssigning, setIsAssigning] = useState(false);
  // Сохраняем груз локально — negotiation.load сбрасывается после makeOffer('accepted')
  const [savedLoad, setSavedLoad] = useState<any>(null);

  // Когда открываются переговоры — переключаемся на вкладку Deal и инициализируем
  const prevNegOpen = React.useRef(false);
  useEffect(() => {
    if (negotiation.open && negotiation.load) {
      // Инициализируем только если это новый груз (другой id) или первое открытие
      if (!prevNegOpen.current || (savedLoad && savedLoad.id !== negotiation.load.id)) {
        setActiveTab('deal');
        setSavedLoad(negotiation.load);
        setDealMessages([{
          from: 'broker',
          text: `Hey! I've got a load for you: ${negotiation.load.fromCity} → ${negotiation.load.toCity}, ${negotiation.load.miles} miles, ${negotiation.load.commodity}. I'm posting at $${negotiation.load.postedRate.toLocaleString()}. Interested?`,
        }]);
        setDealDone(null);
        setDealAgreedRate(0);
        setDealCurrentOffer(negotiation.load.postedRate);
      }
    }
    prevNegOpen.current = negotiation.open;
  }, [negotiation.open, negotiation.load?.id]);

  // Активный груз для переговоров — либо текущий из store, либо сохранённый
  const activeDealLoad = negotiation.load || savedLoad;

  function handleDealOffer(amount: number) {
    if (!activeDealLoad || dealDone) return;
    const load = activeDealLoad;
    setDealMessages(prev => [...prev, {
      from: 'me',
      text: `I can do $${amount.toLocaleString()} for this load. That's ${load.miles} mi at $${(amount / load.miles).toFixed(2)}/mi.`,
    }]);
    const result = makeOffer(amount);
    const neg = useGameStore.getState().negotiation;
    if (result === 'accepted') {
      setDealDone('accepted');
      setDealAgreedRate(amount);
      setDealMessages(prev => [...prev, { from: 'broker', text: `Deal! $${amount.toLocaleString()} works for me. Sending Rate Con now! 🤝` }]);
    } else if (result === 'rejected') {
      setDealDone('rejected');
      setDealMessages(prev => [...prev, { from: 'broker', text: `Sorry, that's too low. I'll find another carrier.` }]);
    } else {
      const counter = neg.currentOffer;
      setDealCurrentOffer(counter);
      setDealMessages(prev => [...prev, { from: 'broker', text: `I can't go that low. Best I can do is $${counter.toLocaleString()}. Deal?` }]);
    }
  }

  async function handleConfirmDeal() {
    if (!activeDealLoad || dealAgreedRate === 0 || isAssigning) return;
    setIsAssigning(true);
    // Ищем груз в bookedLoads (makeOffer уже добавил его туда)
    const bookedLoads = useGameStore.getState().bookedLoads;
    const bookedLoad = bookedLoads.find((l: any) => l.id === activeDealLoad.id && (!l.truckId || l.truckId === ''));
    if (bookedLoad) {
      try {
        await assignLoadToTruck(bookedLoad, truck.id);
        setSavedLoad(null);
        setDealDone(null);
        setDealMessages([]);
        setActiveTab('route');
      } catch { setIsAssigning(false); }
    } else {
      // Груз уже назначен или не найден — просто закрываем
      setSavedLoad(null);
      setDealDone(null);
      setDealMessages([]);
      setActiveTab('route');
    }
    setIsAssigning(false);
  }

  function handleTabClick(key: 'route' | 'stats' | 'load' | 'chat' | 'deal') {
    setActiveTab(key);
  }

  // ── Статус ──
  const statusLabel: Record<string, string> = {
    idle: 'Available', driving: 'To Pickup', at_pickup: 'Loading',
    loaded: 'In Transit', at_delivery: 'Unloading', breakdown: 'Breakdown',
    waiting: 'Detention', in_garage: 'In Garage',
  };
  const statusEmoji: Record<string, string> = {
    idle: '⚪', driving: '🔵', at_pickup: '🟡', loaded: '🟢',
    at_delivery: '🟣', breakdown: '🔴', waiting: '🟠', in_garage: '🔧',
  };
  const sLabel = statusLabel[truck.status] || truck.status;
  const sEmoji = statusEmoji[truck.status] || '⚪';

  // ── Сообщение водителя ──
  let driverMessage = '';
  switch (truck.status) {
    case 'driving': driverMessage = `On my way to ${truck.destinationCity || 'pickup'}! 🚛`; break;
    case 'at_pickup': driverMessage = 'At the warehouse, loading up... 📦'; break;
    case 'loaded': driverMessage = `Hauling to ${truck.destinationCity || 'delivery'}, all good! 👍`; break;
    case 'at_delivery': driverMessage = 'Unloading now, almost done! 📦'; break;
    case 'breakdown': driverMessage = 'Boss, truck broke down! Need help ASAP 🔧'; break;
    case 'waiting': driverMessage = 'Still waiting here... detention clock ticking ⏰'; break;
    case 'idle': driverMessage = 'Ready for the next load, boss! 👍'; break;
    case 'in_garage': driverMessage = 'In the shop, getting fixed up 🔧'; break;
    default: driverMessage = 'Everything good, boss! 👍';
  }
  if (truck.onNightStop) driverMessage = 'Parked for the night, getting rest 💤';
  if (truck.onMandatoryBreak) driverMessage = 'Taking my 30-min break ☕';

  // ── Расстояние и ETA ──
  let distance = 0, etaH = 0, etaM = 0, hasRoute = false;
  if (truck.destinationCity && CITIES[truck.destinationCity]) {
    hasRoute = true;
    const dc = CITIES[truck.destinationCity];
    const [lat1, lon1, lat2, lon2] = [truck.position[1], truck.position[0], dc[1], dc[0]];
    const R = 3959;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    distance = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    etaH = Math.floor(distance / 55);
    etaM = Math.round((distance / 55 - etaH) * 60);
  }

  // ── HOS ──
  const hosH = Math.floor(truck.hoursLeft);
  const hosM = Math.round((truck.hoursLeft - hosH) * 60);
  const hosColor = truck.hoursLeft < 2 ? '#f87171' : truck.hoursLeft < 4 ? '#fbbf24' : '#4ade80';

  // ── Mood ──
  const mood = truck.mood ?? 75;
  const moodRounded = Math.round(mood);
  const moodColor = mood >= 70 ? '#4ade80' : mood >= 40 ? '#fbbf24' : '#f87171';
  const moodLabel = mood >= 70 ? 'Happy' : mood >= 40 ? 'Neutral' : 'Unhappy';

  // ── Load ──
  const load = truck.currentLoad;
  const progress = Math.round((truck.progress || 0) * 100);

  const tabs: Array<{ key: typeof activeTab; icon: string; label: string; badge?: boolean }> = [
    { key: 'route', icon: '🛣️', label: 'Route' },
    { key: 'stats', icon: '📊', label: 'Stats' },
    { key: 'load', icon: '📦', label: 'Load' },
    { key: 'chat', icon: '💬', label: 'Связь', badge: unreadChatCount > 0 },
    ...(activeDealLoad ? [{ key: 'deal' as const, icon: '🤝', label: 'Груз', badge: dealDone !== 'accepted' && dealDone !== 'rejected' }] : []),
  ];

  const row = (label: string, value: string, valueColor?: string): React.ReactNode => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
      <span style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#6b7280' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: valueColor || (isDark ? '#e2e8f0' : '#1f2937') }}>{value}</span>
    </div>
  );

  const divider = <div style={{ height: 1, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', margin: '4px 0' }} />;

  return (
    <div style={{ ...ps, padding: 0, overflow: 'visible' }} onClick={e => e.stopPropagation()}>

      {/* ── ТАБЫ ── */}
      <div style={{
        display: 'flex',
        background: isDark ? 'rgba(13,17,23,0.97)' : 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderRadius: '12px 12px 0 0',
        border: isDark ? '2px solid rgba(255,255,255,0.08)' : '2px solid rgba(0,0,0,0.08)',
        borderBottom: 'none',
      }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => handleTabClick(t.key)}
            style={{
              flex: 1, padding: '8px 4px',
              border: 'none', cursor: 'pointer',
              background: 'transparent',
              borderRadius: 0,
              borderBottom: `2px solid ${activeTab === t.key ? '#06b6d4' : 'transparent'}`,
              color: activeTab === t.key ? '#06b6d4' : (isDark ? '#64748b' : '#9ca3af'),
              fontSize: 11, fontWeight: 600,
              transition: 'color 0.2s, border-color 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
              whiteSpace: 'nowrap',
              position: 'relative',
            }}
          >
            <span style={{ fontSize: 12 }}>{t.icon}</span>
            {t.label}
            {(t as any).badge && (
              <span style={{
                position: 'absolute', top: 4, right: 4,
                width: 7, height: 7, borderRadius: '50%',
                background: '#f59e0b',
                boxShadow: '0 0 6px #f59e0b',
                animation: 'trackingDot 1.2s ease-in-out infinite',
              }} />
            )}
          </button>
        ))}
      </div>

      {/* ── КОНТЕНТ ── */}
      <div style={{
        position: 'relative', minHeight: 80,
        background: isDark ? 'rgba(13,17,23,0.97)' : 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderRadius: '0 0 12px 12px',
        border: isDark ? '2px solid rgba(255,255,255,0.08)' : '2px solid rgba(0,0,0,0.08)',
        borderTop: 'none',
        overflow: 'hidden',
      }}>
        {/* ROUTE */}
        <div style={{
          padding: '10px 12px',
          opacity: activeTab === 'route' ? 1 : 0,
          position: activeTab === 'route' ? 'relative' : 'absolute',
          top: 0, left: 0, width: '100%',
          transition: 'opacity 0.3s ease',
          pointerEvents: activeTab === 'route' ? 'auto' : 'none',
        }}>
          {hasRoute ? (<>
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: isDark ? '#94a3b8' : '#6b7280', marginBottom: 3 }}>
                <span>{truck.currentCity || '—'}</span>
                <span>{truck.destinationCity || '—'}</span>
              </div>
              <div style={{ height: 5, background: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg,#06b6d4,#818cf8)', width: `${progress}%`, transition: 'width 0.5s ease' }} />
              </div>
            </div>
            {row('Distance left', `${distance} mi`, '#06b6d4')}
            {row('ETA', `${etaH}h ${etaM}m`)}
          </>) : (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>🅿️</div>
              <div style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#6b7280' }}>No active route</div>
              <div style={{ fontSize: 10, color: isDark ? '#64748b' : '#9ca3af', marginTop: 2 }}>📍 {truck.currentCity || 'Unknown'}</div>
            </div>
          )}
          {divider}
          {row('HOS Remaining', `${hosH}h ${hosM}m`, hosColor)}
        </div>

        {/* STATS */}
        <div style={{
          padding: '10px 12px',
          opacity: activeTab === 'stats' ? 1 : 0,
          position: activeTab === 'stats' ? 'relative' : 'absolute',
          top: 0, left: 0, width: '100%',
          transition: 'opacity 0.3s ease',
          pointerEvents: activeTab === 'stats' ? 'auto' : 'none',
        }}>
          {row('Total Miles', (truck.totalMiles || 0).toLocaleString())}
          {row('Deliveries', String(truck.totalDeliveries || 0))}
          {row('On-Time Rate', `${truck.onTimeRate || 0}%`)}
          {row('Safety Score', `${truck.safetyScore || 0}/100`)}
          {row('Fuel', `${truck.fuelEfficiency || 0} MPG`)}
          {divider}
          {row(`Mood — ${moodLabel}`, `${moodRounded}%`, moodColor)}
          <div style={{ height: 4, background: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb', borderRadius: 2, overflow: 'hidden', marginTop: 3 }}>
            <div style={{ height: '100%', borderRadius: 2, background: moodColor, width: `${moodRounded}%`, transition: 'width 0.5s ease' }} />
          </div>
          {/* Износ трака — компактный вид */}
          <div style={{ marginTop: 8 }}>
            <TruckStatsView truck={truck} compact={true} />
          </div>
        </div>

        {/* LOAD */}
        <div style={{
          padding: '10px 12px',
          opacity: activeTab === 'load' ? 1 : 0,
          position: activeTab === 'load' ? 'relative' : 'absolute',
          top: 0, left: 0, width: '100%',
          transition: 'opacity 0.3s ease',
          pointerEvents: activeTab === 'load' ? 'auto' : 'none',
        }}>
          {load ? (<>
            {row('Commodity', load.commodity)}
            {row('Route', `${load.fromCity} → ${load.toCity}`)}
            {row('Rate', `$${load.agreedRate.toLocaleString()}`, '#06b6d4')}
            {row('Miles', `${load.miles} mi`)}
            {row('Rate/Mile', load.miles > 0 ? `$${(load.agreedRate / load.miles).toFixed(2)}/mi` : '—')}
            {divider}
            {row('Equipment', load.equipment)}
            {row('Weight', `${(load.weight || 0).toLocaleString()} lbs`)}
            {row('Broker', load.brokerCompany || '—')}
          </>) : (
            <div style={{ textAlign: 'center', padding: '14px 0' }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>📭</div>
              <div style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#6b7280' }}>No load assigned</div>
            </div>
          )}
        </div>

        {/* СВЯЗЬ — чат с брокерами и водителями */}
        <div style={{
          opacity: activeTab === 'chat' ? 1 : 0,
          position: activeTab === 'chat' ? 'relative' : 'absolute',
          top: 0, left: 0, width: '100%',
          transition: 'opacity 0.3s ease',
          pointerEvents: activeTab === 'chat' ? 'auto' : 'none',
          height: activeTab === 'chat' ? 'auto' : 0,
          overflow: 'hidden',
          minHeight: activeTab === 'chat' ? 280 : 0,
        }}>
          <UnifiedChatUI nickname={sessionName || 'player'} />
        </div>

        {/* DEAL — переговоры с брокером */}
        {activeDealLoad && (
          <div style={{
            opacity: activeTab === 'deal' ? 1 : 0,
            position: activeTab === 'deal' ? 'relative' : 'absolute',
            top: 0, left: 0, width: '100%',
            transition: 'opacity 0.3s ease',
            pointerEvents: activeTab === 'deal' ? 'auto' : 'none',
            display: 'flex', flexDirection: 'column',
          }}>
            {(() => {
              const load = activeDealLoad;
              const broker = load.brokerName || 'Broker';
              const brokerCompany = load.brokerCompany || '';
              const tiles = [
                { val: Math.round(load.postedRate * 1.05), tag: '+5%' },
                { val: Math.round(load.postedRate * 1.10), tag: '+10%' },
                { val: Math.round(load.postedRate * 1.15), tag: '+15%' },
                { val: Math.round(load.marketRate), tag: 'Market', isMarket: true },
              ];
              return (
                <>
                  {/* Заголовок брокера */}
                  <div style={{ padding: '8px 12px 6px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 20 }}>👩‍💼</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: isDark ? '#e2e8f0' : '#111827' }}>{broker}</div>
                          <div style={{ fontSize: 10, color: isDark ? '#64748b' : '#9ca3af' }}>{brokerCompany}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#06b6d4' }}>{load.fromCity} → {load.toCity}</div>
                        <div style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#6b7280' }}>{load.miles} mi · ${load.postedRate.toLocaleString()} (${(load.postedRate/load.miles).toFixed(2)}/mi)</div>
                        <div style={{ fontSize: 10, color: '#4ade80' }}>Market: ${load.marketRate.toLocaleString()} (${(load.marketRate/load.miles).toFixed(2)}/mi)</div>
                      </div>
                    </div>
                  </div>

                  {/* Чат */}
                  <div style={{ padding: '6px 12px', maxHeight: 110, overflowY: 'auto' as any, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {dealMessages.map((msg, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start', gap: 5 }}>
                        {msg.from === 'broker' && <span style={{ fontSize: 14, flexShrink: 0 }}>👩‍💼</span>}
                        <div style={{
                          maxWidth: '80%', padding: '5px 9px', borderRadius: msg.from === 'me' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                          background: msg.from === 'me' ? 'rgba(6,182,212,0.2)' : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'),
                          border: msg.from === 'me' ? '1px solid rgba(6,182,212,0.3)' : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                        }}>
                          <span style={{ fontSize: 11, color: isDark ? '#e2e8f0' : '#374151', lineHeight: 1.4 }}>{msg.text}</span>
                        </div>
                      </div>
                    ))}
                    {dealDone === 'accepted' && (
                      <div style={{ textAlign: 'center', padding: '4px 0', fontSize: 12, fontWeight: 800, color: '#4ade80' }}>
                        🤝 Deal at ${dealAgreedRate.toLocaleString()}!
                      </div>
                    )}
                    {dealDone === 'rejected' && (
                      <div style={{ textAlign: 'center', padding: '4px 0', fontSize: 12, fontWeight: 800, color: '#f87171' }}>
                        ❌ No deal. Broker walked away.
                      </div>
                    )}
                  </div>

                  {/* Кнопки предложений */}
                  {!dealDone && (
                    <div style={{ padding: '6px 12px 10px' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: isDark ? '#64748b' : '#9ca3af', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Твоё предложение:</div>
                      <div style={{ display: 'flex', gap: 5 }}>
                        {tiles.map((t, i) => (
                          <button key={i} onClick={() => handleDealOffer(t.val)} style={{
                            flex: 1, padding: '6px 4px', borderRadius: 8, cursor: 'pointer',
                            background: t.isMarket ? 'rgba(74,222,128,0.12)' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                            border: t.isMarket ? '1.5px solid rgba(74,222,128,0.4)' : `1.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            transition: 'all 0.15s ease',
                          }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = t.isMarket ? 'rgba(74,222,128,0.22)' : 'rgba(6,182,212,0.12)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = t.isMarket ? 'rgba(74,222,128,0.12)' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'); }}
                          >
                            <div style={{ fontSize: 11, fontWeight: 900, color: t.isMarket ? '#4ade80' : (isDark ? '#e2e8f0' : '#111827') }}>{t.val.toLocaleString()}</div>
                            <div style={{ fontSize: 9, fontWeight: 700, color: t.isMarket ? '#4ade80' : '#06b6d4' }}>{t.tag}</div>
                          </button>
                        ))}
                      </div>
                      {negotiation.round > 0 && !dealDone && dealCurrentOffer > 0 && (
                        <button onClick={() => handleDealOffer(dealCurrentOffer)} style={{
                          width: '100%', marginTop: 5, padding: '6px', borderRadius: 8, cursor: 'pointer',
                          background: 'rgba(74,222,128,0.1)', border: '1.5px solid rgba(74,222,128,0.35)',
                          fontSize: 11, fontWeight: 800, color: '#4ade80',
                        }}>
                          ✅ Принять ${dealCurrentOffer.toLocaleString()}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Подтверждение сделки */}
                  {dealDone === 'accepted' && (
                    <div style={{ padding: '6px 12px 10px', display: 'flex', gap: 6 }}>
                      <button onClick={closeNegotiation} style={{
                        flex: 1, padding: '7px', borderRadius: 8, cursor: 'pointer',
                        background: 'transparent', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
                        fontSize: 11, fontWeight: 700, color: isDark ? '#94a3b8' : '#6b7280',
                      }}>Отмена</button>
                      <button onClick={handleConfirmDeal} disabled={isAssigning} style={{
                        flex: 2, padding: '7px', borderRadius: 8, cursor: isAssigning ? 'default' : 'pointer',
                        background: isAssigning ? 'rgba(74,222,128,0.1)' : 'rgba(74,222,128,0.2)',
                        border: '1.5px solid rgba(74,222,128,0.5)',
                        fontSize: 11, fontWeight: 800, color: '#4ade80',
                      }}>
                        {isAssigning ? '⏳ Назначаем...' : `✅ Назначить на ${truck.driver?.split(' ')[0] || 'трак'}`}
                      </button>
                    </div>
                  )}

                  {dealDone === 'rejected' && (
                    <div style={{ padding: '6px 12px 10px' }}>
                      <button onClick={closeNegotiation} style={{
                        width: '100%', padding: '7px', borderRadius: 8, cursor: 'pointer',
                        background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                        fontSize: 11, fontWeight: 700, color: '#f87171',
                      }}>Закрыть</button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>

    </div>
  );
}

/** Выпадающая панель под выбранной карточкой — богатый интерактивный контент */
function TruckDropdown({ truck, events, isDark }: { truck: any; events: GameEvent[]; isDark: boolean }) {
  const resolveEvent = useGameStore(s => s.resolveEvent);
  const repairBreakdown = useGameStore(s => s.repairBreakdown);
  const gameMinute = useGameStore(s => s.gameMinute);
  const serviceVehicles = useGameStore(s => s.serviceVehicles);
  const negotiationOpen = useGameStore(s => s.negotiation.open);
  const color = getTruckColor(truck);
  const hos = Math.max(0, truck.hoursLeft);
  const mood = truck.mood ?? 80;
  const isBreakdown = truck.status === 'breakdown';
  const awaitingRepair = truck.awaitingRepairChoice;
  const isWaiting = truck.status === 'waiting';
  const isIdle = truck.status === 'idle';
  const isMoving = truck.status === 'driving' || truck.status === 'loaded';
  const onRest = truck.onNightStop || truck.onMandatoryBreak || (truck.hosRestUntilMinute && truck.hosRestUntilMinute > gameMinute);

  const actionBtn = (btnColor: string, large = false): any => ({
    flex: 1, minWidth: large ? 100 : 70, padding: large ? '7px 8px' : '5px 8px',
    background: btnColor + '15', border: `1.5px solid ${btnColor}55`, borderRadius: 10,
    cursor: 'pointer', transition: 'all 0.15s ease',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
  });
  const ps: any = {
    marginTop: 6, padding: '8px 10px',
    background: isDark ? 'rgba(15,20,35,0.95)' : 'rgba(255,255,255,0.97)',
    backdropFilter: 'blur(14px)',
    border: `2px solid ${isBreakdown ? '#f8717188' : isWaiting ? '#fb923c88' : color + '44'}`,
    borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 6,
    maxWidth: 340, width: '100%',
    boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.15)',
  };
  // ps для TruckHUD — прозрачный, без фона (HUD сам рисует стекло)
  const psHUD: any = {
    marginTop: 6,
    maxWidth: 340, width: '100%',
  };
  const hov = (el: HTMLElement, c: string, on: boolean) => {
    el.style.background = c + (on ? '30' : '15');
    el.style.transform = on ? 'scale(1.02)' : 'scale(1)';
  };

  // ═══ ПОЛОМКА — ожидает решения ═══
  if (isBreakdown && awaitingRepair) {
    const cR = truck.breakdownCostRoadside || 0;
    const cT = truck.breakdownCostTow || 0;
    const dR = truck.breakdownDelayRoadside || 90;
    const dT = truck.breakdownDelayTow || 240;
    const bd = truck.breakdownType || 'Поломка';
    return (
      <div style={ps} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 20 }}>🚨</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#f87171' }}>{bd}</div>
            <div style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#6b7280', marginTop: 1 }}>📍 {truck.currentCity} • Водитель ждёт решения</div>
          </div>
        </div>
        <div style={{ background: isDark ? 'rgba(248,113,113,0.08)' : 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '6px 10px' }}>
          <p style={{ fontSize: 11, color: isDark ? '#e2e8f0' : '#374151', margin: 0, lineHeight: 1.4 }}>
            Трак остановился. Выберите ремонт — от этого зависит стоимость и время простоя.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => repairBreakdown(truck.id, 'roadside')} style={actionBtn('#4ade80', true)}
            onMouseEnter={e => hov(e.currentTarget as HTMLElement, '#4ade80', true)}
            onMouseLeave={e => hov(e.currentTarget as HTMLElement, '#4ade80', false)}>
            <span style={{ fontSize: 18 }}>🔧</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: isDark ? '#4ade80' : '#16a34a' }}>На месте</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#f87171' }}>−${cR.toLocaleString()}</span>
            <span style={{ fontSize: 9, color: isDark ? '#94a3b8' : '#6b7280' }}>⏱ ~{dR} мин</span>
          </button>
          {cT > 0 && (
            <button onClick={() => repairBreakdown(truck.id, 'tow')} style={actionBtn('#fb923c', true)}
              onMouseEnter={e => hov(e.currentTarget as HTMLElement, '#fb923c', true)}
              onMouseLeave={e => hov(e.currentTarget as HTMLElement, '#fb923c', false)}>
              <span style={{ fontSize: 18 }}>🚛</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: isDark ? '#fb923c' : '#c2410c' }}>Эвакуатор</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#f87171' }}>−${cT.toLocaleString()}</span>
              <span style={{ fontSize: 9, color: isDark ? '#94a3b8' : '#6b7280' }}>⏱ ~{dT} мин</span>
            </button>
          )}
        </div>
      </div>
    );
  }
  // ═══ ПОЛОМКА — ремонт в процессе ═══
  if (isBreakdown && !awaitingRepair) {
    // Ищем активную сервисную машину для этого трака
    const activeService = serviceVehicles.find(v => v.targetTruckId === truck.id && v.status !== 'completed' && v.status !== 'cancelled');
    
    if (activeService) {
      // Сервисная машина вызвана — показываем карточку слежения
      const config = SERVICE_VEHICLE_CONFIGS[activeService.type];
      const isEnRoute = activeService.status === 'en_route' || activeService.status === 'dispatched';
      const isRepairing = activeService.status === 'repairing';
      const isArrived = activeService.status === 'arrived';
      const isTowingBack = (activeService.status as string) === 'towing_back';
      const towReturnProgress = (activeService as any).returnProgress || 0;
      const towReturnPct = Math.round(towReturnProgress * 100);
      const progressPct = isTowingBack ? towReturnPct : Math.round(activeService.progress * 100);
      const etaLeft = isTowingBack
        ? Math.max(0, Math.round(((activeService as any).returnEta || activeService.eta) * (1 - towReturnProgress)))
        : Math.max(0, Math.round(activeService.eta * (1 - activeService.progress)));
      const repairLeft = isRepairing && activeService.repairStartedAt
        ? Math.max(0, (activeService.repairStartedAt + activeService.repairDuration) - gameMinute)
        : activeService.repairDuration;
      
      const statusColor = isTowingBack ? '#fb923c' : isRepairing ? '#fbbf24' : isArrived ? '#a78bfa' : '#06b6d4';
      const statusText = isTowingBack ? '🚛 Везём в гараж' : isRepairing ? '⚙️ Идёт ремонт' : isArrived ? '🔧 На месте — начинаем' : '🚗 Едет к траку';
      const subText = isTowingBack
        ? `→ ${activeService.fromCity} • ETA ~${etaLeft} мин`
        : isRepairing
          ? `Осталось ~${repairLeft} мин`
          : isArrived
            ? 'Механик осматривает трак'
            : `ETA ~${etaLeft} мин • ${Math.round(activeService.progress * activeService.eta)} / ${activeService.eta} мин`;
      
      const handleFollowService = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Включаем непрерывное слежение за сервисной машиной
        window.dispatchEvent(new CustomEvent('followServiceVehicle', {
          detail: { serviceId: activeService.id, lng: activeService.position[0], lat: activeService.position[1] }
        }));
      };
      
      return (
        <div style={ps} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 20 }}>🚨</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#f87171' }}>{truck.breakdownType || 'Поломка'}</div>
              <div style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#6b7280', marginTop: 1 }}>📍 {truck.currentCity} • Помощь в пути</div>
            </div>
          </div>
          
          {/* Карточка сервисной машины — кликабельная */}
          <div
            onClick={handleFollowService}
            style={{
              background: isDark ? `${statusColor}12` : `${statusColor}08`,
              border: `2px solid ${statusColor}55`,
              borderRadius: 14,
              padding: '10px 12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden',
            } as any}
            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
              (e.currentTarget as HTMLElement).style.background = isDark ? `${statusColor}22` : `${statusColor}15`;
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 16px ${statusColor}33`;
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
              (e.currentTarget as HTMLElement).style.background = isDark ? `${statusColor}12` : `${statusColor}08`;
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            {/* Иконка слежения */}
            <div style={{
              position: 'absolute', top: 6, right: 8,
              display: 'flex', alignItems: 'center', gap: 3,
              background: isDark ? 'rgba(15,20,35,0.8)' : 'rgba(255,255,255,0.9)',
              borderRadius: 6, padding: '2px 6px',
              border: `1px solid ${statusColor}44`,
            } as any}>
              <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: statusColor,
                animation: 'trackingDot 1s ease-in-out infinite',
              }} />
              <span style={{ fontSize: 8, fontWeight: 800, color: statusColor }}>СЛЕДИТЬ</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${statusColor}20`,
                border: `1.5px solid ${statusColor}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, flexShrink: 0,
              } as any}>
                {config.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: statusColor }}>{statusText}</div>
                <div style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#6b7280', marginTop: 2 }}>{config.label} из {activeService.fromCity}</div>
                <div style={{ fontSize: 10, color: isDark ? '#cbd5e1' : '#4b5563', marginTop: 1 }}>{subText}</div>
              </div>
            </div>
            
            {/* Прогресс-бар */}
            {(isEnRoute || isTowingBack) && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: isDark ? '#64748b' : '#9ca3af' }}>Прогресс</span>
                  <span style={{ fontSize: 9, fontWeight: 800, color: statusColor }}>{progressPct}%</span>
                </div>
                <div style={{ height: 5, background: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    background: `linear-gradient(90deg, ${statusColor}88, ${statusColor})`,
                    width: `${Math.max(3, progressPct)}%`,
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            )}
            
            {/* Прогресс ремонта */}
            {isRepairing && activeService.repairStartedAt != null && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: isDark ? '#64748b' : '#9ca3af' }}>Ремонт</span>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#fbbf24' }}>~{repairLeft} мин</span>
                </div>
                <div style={{ height: 5, background: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    background: 'linear-gradient(90deg, #fbbf24, #4ade80)',
                    width: `${Math.max(5, ((gameMinute - activeService.repairStartedAt) / activeService.repairDuration) * 100)}%`,
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            )}
            
            <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: isDark ? '#94a3b8' : '#6b7280', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', borderRadius: 6, padding: '2px 7px' }}>
                💰 ${activeService.cost.toLocaleString()}
              </span>
              <span style={{ fontSize: 9, fontWeight: 700, color: isDark ? '#94a3b8' : '#6b7280', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', borderRadius: 6, padding: '2px 7px' }}>
                🔧 ~{activeService.repairDuration} мин ремонт
              </span>
            </div>
          </div>
        </div>
      );
    }
    
    // Нет активной сервисной машины — показываем кнопки выбора ремонта
    const outUntil = truck.outOfOrderUntil || 0;
    const minsLeft = Math.max(0, outUntil - gameMinute);
    const totalDelay = truck.breakdownDelayTow || truck.breakdownDelayRoadside || 120;
    // Если outOfOrderUntil не установлен или уже прошёл — показываем кнопки ремонта
    if (!outUntil || minsLeft <= 0) {
      const cR = truck.breakdownCostRoadside || 0;
      const cT = truck.breakdownCostTow || 0;
      const dR = truck.breakdownDelayRoadside || 90;
      const dT = truck.breakdownDelayTow || 240;
      const bd = truck.breakdownType || 'Поломка';
      return (
        <div style={ps} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 20 }}>🚨</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#f87171' }}>{bd}</div>
              <div style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#6b7280', marginTop: 1 }}>📍 {truck.currentCity} • Требуется ремонт</div>
            </div>
          </div>
          {cR > 0 && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => repairBreakdown(truck.id, 'roadside')} style={actionBtn('#4ade80', true)}
                onMouseEnter={e => hov(e.currentTarget as HTMLElement, '#4ade80', true)}
                onMouseLeave={e => hov(e.currentTarget as HTMLElement, '#4ade80', false)}>
                <span style={{ fontSize: 18 }}>🔧</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: isDark ? '#4ade80' : '#16a34a' }}>На месте</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#f87171' }}>−${cR.toLocaleString()}</span>
                <span style={{ fontSize: 9, color: isDark ? '#94a3b8' : '#6b7280' }}>⏱ ~{dR} мин</span>
              </button>
              {cT > 0 && (
                <button onClick={() => repairBreakdown(truck.id, 'tow')} style={actionBtn('#fb923c', true)}
                  onMouseEnter={e => hov(e.currentTarget as HTMLElement, '#fb923c', true)}
                  onMouseLeave={e => hov(e.currentTarget as HTMLElement, '#fb923c', false)}>
                  <span style={{ fontSize: 18 }}>🚛</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: isDark ? '#fb923c' : '#c2410c' }}>Эвакуатор</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#f87171' }}>−${cT.toLocaleString()}</span>
                  <span style={{ fontSize: 9, color: isDark ? '#94a3b8' : '#6b7280' }}>⏱ ~{dT} мин</span>
                </button>
              )}
            </div>
          )}
        </div>
      );
    }
    return (
      <div style={ps} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 20 }}>⏳</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#fbbf24' }}>{truck.breakdownType || 'Ремонт'}</div>
            <div style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#6b7280', marginTop: 1 }}>📍 {truck.currentCity} • Осталось ~{minsLeft} мин</div>
          </div>
        </div>
        <div style={{ height: 6, background: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #fbbf24, #4ade80)', width: `${Math.max(5, (1 - minsLeft / totalDelay) * 100)}%`, transition: 'width 1s ease' }} />
        </div>
      </div>
    );
  }
  // ═══ В ГАРАЖЕ ═══
  if (truck.status === 'in_garage') {
    const repairDone = truck.garageRepairDone;
    const city = truck.garageCity || truck.currentCity;
    const handleOpenGarage = (e: React.MouseEvent) => {
      e.stopPropagation();
      useGameStore.getState().setRepairGarageOpen(true);
    };
    return (
      <div style={ps} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 20 }}>🏗️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#f59e0b' }}>В гараже</div>
            <div style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#6b7280', marginTop: 1 }}>📍 {city} • {repairDone ? 'Ремонт завершён' : 'Ожидает ремонта'}</div>
          </div>
        </div>
        <button
          onClick={handleOpenGarage}
          style={{
            width: '100%', padding: '10px 12px',
            background: isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.08)',
            border: '2px solid rgba(245,158,11,0.4)',
            borderRadius: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.15s ease',
          } as any}
          onMouseEnter={(e: any) => { e.currentTarget.style.background = isDark ? 'rgba(245,158,11,0.22)' : 'rgba(245,158,11,0.15)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
          onMouseLeave={(e: any) => { e.currentTarget.style.background = isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.08)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <span style={{ fontSize: 18 }}>🔧</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f59e0b' }}>Открыть гараж</span>
        </button>
      </div>
    );
  }
  // ═══ DETENTION ═══
  if (isWaiting && truck.currentLoad) {
    const dm = truck.currentLoad.detentionMinutes || 0;
    return (
      <div style={ps} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 20 }}>⏱️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#fb923c' }}>Detention — {dm} мин</div>
            <div style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#6b7280', marginTop: 1 }}>📍 {truck.currentCity} • Ожидание {truck.currentLoad.phase === 'loading' ? 'погрузки' : 'разгрузки'}</div>
          </div>
        </div>
        {dm >= 120 && (
          <div style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.25)', borderRadius: 8, padding: '6px 10px' }}>
            <p style={{ fontSize: 11, color: isDark ? '#fbbf24' : '#92400e', margin: 0, lineHeight: 1.4 }}>⚠️ Detention &gt; 2ч. Подайте claim через чат.</p>
          </div>
        )}
      </div>
    );
  }
  // ═══ ОТДЫХ ═══
  if (onRest) {
    const mL = Math.max(0, (truck.hosRestUntilMinute || 0) - gameMinute);
    const lbl = truck.onNightStop ? '🌙 Ночёвка' : truck.onMandatoryBreak ? '☕ Перерыв 30м' : '😴 HOS отдых';
    return (
      <div style={ps} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 20 }}>{truck.onNightStop ? '🌙' : '😴'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: isDark ? '#94a3b8' : '#6b7280' }}>{lbl}</div>
            <div style={{ fontSize: 10, color: isDark ? '#64748b' : '#9ca3af', marginTop: 1 }}>📍 {truck.hosStopName || truck.nightStopName || truck.currentCity} • ~{mL} мин</div>
          </div>
        </div>
      </div>
    );
  }
  // ═══ IDLE ═══
  if (isIdle) {
    const wl = truck.idleWarningLevel ?? 0;
    const wc = wl >= 3 ? '#ef4444' : wl >= 2 ? '#fb923c' : wl >= 1 ? '#fbbf24' : '#38bdf8';
    const bookedLoads = useGameStore.getState().bookedLoads;
    const unbookedLoad = bookedLoads.find((l: any) => !l.truckId || l.truckId === '');

    const handleOpenLoadBoard = (e: React.MouseEvent) => {
      e.stopPropagation();
      const store = useGameStore.getState();
      store.setLoadBoardSearch(truck.currentCity);
      try { localStorage.setItem('dispatch-active-tab', 'loadboard'); } catch {}
      window.dispatchEvent(new CustomEvent('switchTab', { detail: { tab: 'loadboard' } }));
    };

    const handleAssignLoad = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!unbookedLoad) return;
      useGameStore.getState().assignLoadToTruck(unbookedLoad, truck.id);
      try { localStorage.setItem('dispatch-active-tab', 'map'); } catch {}
      window.dispatchEvent(new CustomEvent('switchTab', { detail: { tab: 'map' } }));
      window.dispatchEvent(new CustomEvent('followTruckFromCard', {
        detail: { truckId: truck.id, lng: truck.position[0], lat: truck.position[1] }
      }));
    };

    const actionPill = (accentColor: string): React.CSSProperties => ({
      width: '100%',
      padding: '10px 14px',
      background: isDark ? `${accentColor}15` : `${accentColor}10`,
      border: `1.5px solid ${accentColor}44`,
      borderRadius: 12,
      cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 8,
      transition: 'all 0.15s ease',
    });

    const pillHoverOn = (el: HTMLElement, color: string) => {
      el.style.transform = 'scale(1.02)';
      el.style.boxShadow = `0 4px 16px ${color}33`;
    };
    const pillHoverOff = (el: HTMLElement) => {
      el.style.transform = 'scale(1)';
      el.style.boxShadow = 'none';
    };

    // Если есть активные переговоры — показываем HUD с вкладкой Deal
    if (negotiationOpen) {
      return <TruckHUD truck={truck} isDark={isDark} ps={psHUD} />;
    }

    return (
      <div style={ps} onClick={e => e.stopPropagation()}>
        {/* Статус */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 16 }}>{wl >= 2 ? '😴' : '📋'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: wc }}>{wl >= 2 ? 'Долгий простой!' : 'Свободен'}</div>
            <div style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#6b7280' }}>📍 {truck.currentCity} • HOS: {hos.toFixed(1)}h</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* 🚛 Назначить трак — если есть забуканный груз */}
          {unbookedLoad && (
            <div
              onClick={handleAssignLoad}
              style={actionPill('#fb923c')}
              onMouseEnter={e => pillHoverOn(e.currentTarget as HTMLElement, '#fb923c')}
              onMouseLeave={e => pillHoverOff(e.currentTarget as HTMLElement)}
            >
              <span style={{ fontSize: 18 }}>🚛</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: isDark ? '#fb923c' : '#c2410c' }}>Назначить груз</div>
                <div style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#6b7280' }}>{unbookedLoad.fromCity} → {unbookedLoad.toCity} • ${unbookedLoad.agreedRate.toLocaleString()}</div>
              </div>
              <span style={{ fontSize: 14, color: isDark ? '#fb923c' : '#c2410c', opacity: 0.6 }}>✓</span>
            </div>
          )}

          {/* 📦 Найти груз */}
          <div
            onClick={handleOpenLoadBoard}
            style={actionPill('#38bdf8')}
            onMouseEnter={e => pillHoverOn(e.currentTarget as HTMLElement, '#38bdf8')}
            onMouseLeave={e => pillHoverOff(e.currentTarget as HTMLElement)}
          >
            <span style={{ fontSize: 18 }}>📦</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: isDark ? '#38bdf8' : '#0284c7' }}>Найти груз</div>
              <div style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#6b7280' }}>из {truck.currentCity}</div>
            </div>
            <span style={{ fontSize: 14, color: isDark ? '#38bdf8' : '#0284c7', opacity: 0.6 }}>→</span>
          </div>
        </div>
      </div>
    );
  }
  // ═══ В ПУТИ / ПОГРУЗКА / РАЗГРУЗКА / ВСЁ ОК → HUD-плашка с вкладками ═══
  return <TruckHUD truck={truck} isDark={isDark} ps={psHUD} />;
}

/** Результат доставки — инлайн под карточкой трака */
function DeliveryInlineResult({ result, isDark, onDismiss }: { result: DeliveryResult; isDark: boolean; onDismiss: () => void }) {
  const [tab, setTab] = useState<'pnl' | 'chat'>('pnl');
  const [msgs, setMsgs] = useState<Array<{text: string; isMe: boolean}>>([
    { text: `Hey! Driver confirmed delivery in ${result.toCity}. BOL signed. Rate Con was $${result.agreedRate.toLocaleString()} all-in. I'll process the invoice today.`, isMe: false },
  ]);

  const profitColor = result.netProfit >= 0 ? '#4ade80' : '#f87171';
  const rpmColor = result.ratePerMile >= 2.5 ? '#4ade80' : result.ratePerMile >= 2.0 ? '#fbbf24' : '#f87171';

  const BG     = isDark ? 'rgba(13,17,23,0.97)' : 'rgba(255,255,255,0.97)';
  const SURF   = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const BORDER = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const TEXT1  = isDark ? '#e2e8f0' : '#111827';
  const TEXT2  = isDark ? '#94a3b8' : '#6b7280';

  const QUICK = ['Thanks! Send invoice.', 'Confirm detention.', 'POD attached.', 'Great work!'];

  function sendMsg(text: string) {
    setMsgs(prev => [...prev, { text, isMe: true }]);
    setTimeout(() => {
      setMsgs(prev => [...prev, {
        text: text.includes('invoice') ? 'Invoice will be processed in 30 days.' : text.includes('detention') ? 'Detention approved!' : 'Got it, thanks!',
        isMe: false,
      }]);
    }, 700);
  }

  return (
    <div style={{
      marginTop: 6, width: '100%',
      background: BG,
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      border: `2px solid ${profitColor}44`,
      borderRadius: 14,
      overflow: 'hidden',
      animation: 'dropdownSlide 0.3s ease',
      boxShadow: isDark ? `0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px ${profitColor}22` : `0 4px 16px rgba(0,0,0,0.12)`,
    } as any} onClick={e => e.stopPropagation()}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 10px',
        background: `${profitColor}12`,
        borderBottom: `1px solid ${profitColor}22`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>🎉</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: TEXT1 }}>Доставка завершена!</div>
            <div style={{ fontSize: 10, color: TEXT2 }}>{result.fromCity} → {result.toCity} · {result.miles} mi</div>
          </div>
        </div>
        <button onClick={onDismiss} style={{
          width: 22, height: 22, borderRadius: '50%',
          background: SURF, border: `1px solid ${BORDER}`,
          cursor: 'pointer', fontSize: 12, color: TEXT2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>
      </div>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 10px', borderBottom: `1px solid ${BORDER}` }}>
        {[
          { label: 'GROSS', val: `$${result.grossRevenue.toLocaleString()}`, color: '#38bdf8' },
          { label: 'РАСХОДЫ', val: `-$${result.totalExpenses.toLocaleString()}`, color: '#f87171' },
          { label: 'NET', val: `${result.netProfit >= 0 ? '+' : ''}$${result.netProfit.toLocaleString()}`, color: profitColor },
          { label: '$/MILE', val: result.ratePerMile.toFixed(2), color: rpmColor },
        ].map(c => (
          <div key={c.label} style={{
            flex: 1, background: SURF, border: `1px solid ${BORDER}`,
            borderRadius: 8, padding: '5px 4px', textAlign: 'center',
          } as any}>
            <div style={{ fontSize: 8, color: TEXT2, fontWeight: 700, letterSpacing: 0.3, marginBottom: 2 }}>{c.label}</div>
            <div style={{ fontSize: 12, fontWeight: 900, color: c.color }}>{c.val}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${BORDER}` }}>
        {[{ key: 'pnl', label: '💰 P&L' }, { key: 'chat', label: '📧 Брокер' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)} style={{
            flex: 1, padding: '7px 4px', border: 'none', cursor: 'pointer',
            background: 'transparent',
            borderBottom: `2px solid ${tab === t.key ? '#06b6d4' : 'transparent'}`,
            color: tab === t.key ? '#06b6d4' : TEXT2,
            fontSize: 11, fontWeight: 700,
          }}>{t.label}</button>
        ))}
      </div>

      {/* P&L */}
      {tab === 'pnl' && (
        <div style={{ padding: '8px 10px', maxHeight: 200, overflowY: 'auto' as any }}>
          {[
            { label: 'Agreed Rate', val: result.agreedRate, color: '#4ade80' },
            result.detentionPay > 0 && { label: 'Detention Pay', val: result.detentionPay, color: '#fbbf24' },
            { label: 'Топливо', val: -result.fuelCost, color: '#f87171' },
            { label: 'Водитель', val: -result.driverPay, color: '#f87171' },
            { label: 'Dispatch Fee (8%)', val: -result.dispatchFee, color: '#f87171' },
            { label: 'Factoring (3%)', val: -result.factoringFee, color: '#f87171' },
            { label: 'Truck Payment', val: -result.truckPayment, color: '#f87171' },
            result.lumperCost > 0 && { label: 'Lumper', val: -result.lumperCost, color: '#f87171' },
          ].filter(Boolean).map((row: any, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '3px 0', borderBottom: `1px solid ${BORDER}`,
            }}>
              <span style={{ fontSize: 11, color: TEXT2 }}>{row.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: row.color }}>
                {row.val >= 0 ? '+' : ''}${Math.abs(row.val).toLocaleString()}
              </span>
            </div>
          ))}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 6, padding: '6px 8px',
            background: `${profitColor}15`, border: `1px solid ${profitColor}33`, borderRadius: 8,
          }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: TEXT1 }}>NET PROFIT</span>
            <span style={{ fontSize: 16, fontWeight: 900, color: profitColor }}>
              {result.netProfit >= 0 ? '+' : ''}${result.netProfit.toLocaleString()}
            </span>
          </div>
          <div style={{ fontSize: 11, color: profitColor, textAlign: 'center', marginTop: 6, fontWeight: 700 } as any}>
            {result.profitPerMile >= 1.0 ? '⭐ Отличная поездка!' : result.profitPerMile >= 0.5 ? '👍 Нормально' : '⚠️ Слабая маржа'}
          </div>
        </div>
      )}

      {/* Chat */}
      {tab === 'chat' && (
        <div style={{ padding: '8px 10px' }}>
          <div style={{ maxHeight: 120, overflowY: 'auto' as any, marginBottom: 8 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: m.isMe ? 'flex-end' : 'flex-start',
                marginBottom: 4,
              }}>
                <div style={{
                  maxWidth: '80%', padding: '5px 8px', borderRadius: 8, fontSize: 11,
                  background: m.isMe ? 'rgba(6,182,212,0.15)' : SURF,
                  border: `1px solid ${m.isMe ? 'rgba(6,182,212,0.3)' : BORDER}`,
                  color: m.isMe ? '#bae6fd' : TEXT1,
                  lineHeight: 1.4,
                }}>{m.text}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap' as any, gap: 4 }}>
            {QUICK.map(q => (
              <button key={q} onClick={() => sendMsg(q)} style={{
                padding: '4px 8px', borderRadius: 6, cursor: 'pointer',
                background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)',
                color: '#38bdf8', fontSize: 10, fontWeight: 600,
              }}>{q}</button>
            ))}
          </div>
        </div>
      )}

      {/* Close button */}
      <button onClick={onDismiss} style={{
        width: '100%', padding: '8px 0', border: 'none', cursor: 'pointer',
        background: 'rgba(6,182,212,0.08)',
        borderTop: `1px solid ${BORDER}`,
        color: '#38bdf8', fontSize: 12, fontWeight: 700,
      }}>✓ Закрыть и найти следующий груз</button>
    </div>
  );
}


const TruckCardOverlay = memo(function TruckCardOverlay({ onTruckClick, selectedTruckId }: Props) {
  const trucksRaw = useGameStore(s => s.trucks);
  const activeEvents = useGameStore(s => s.activeEvents);
  const deliveryResults = useGameStore(s => s.deliveryResults);
  const dismissDeliveryResult = useGameStore(s => s.dismissDeliveryResult);
  const { mode: themeMode } = useThemeStore();
  const isDark = themeMode === 'dark';
  const scrollRef = useRef<HTMLDivElement>(null);

  // Порядок карточек как state — изменение вызывает ре-рендер
  const [order, setOrder] = useState<string[]>([]);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null);

  // Инициализация и синхронизация состава траков
  useEffect(() => {
    setOrder(prev => {
      const rawIds = trucksRaw.map(t => t.id);
      if (prev.length === 0) return rawIds;
      const added = rawIds.filter(id => !prev.includes(id));
      const filtered = prev.filter(id => rawIds.includes(id));
      if (added.length === 0 && filtered.length === prev.length) return prev; // без изменений
      return [...filtered, ...added];
    });
  }, [trucksRaw.map(t => t.id).join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  // Сортируем траки по order
  const trucks = useMemo(() => {
    if (!order.length) return trucksRaw;
    return [...trucksRaw].sort((a, b) => {
      const ai = order.indexOf(a.id), bi = order.indexOf(b.id);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [trucksRaw, order]);

  // Сбрасываем анимацию
  useEffect(() => {
    if (!animationDirection) return;
    const t = setTimeout(() => setAnimationDirection(null), 400);
    return () => clearTimeout(t);
  }, [animationDirection]);

  // ← : последний трак становится первым
  const handlePrevTruck = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (trucksRaw.length <= 1) return;
    setOrder(prev => {
      if (prev.length < 2) return prev;
      const last = prev[prev.length - 1];
      const truck = trucksRaw.find(t => t.id === last);
      if (truck) onTruckClick(truck);
      return [last, ...prev.slice(0, -1)];
    });
    setAnimationDirection('left');
  };

  // → : первый трак уходит в конец
  const handleNextTruck = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (trucksRaw.length <= 1) return;
    setOrder(prev => {
      if (prev.length < 2) return prev;
      const [first, ...rest] = prev;
      const nextId = rest[0];
      const truck = trucksRaw.find(t => t.id === nextId);
      if (truck) onTruckClick(truck);
      return [...rest, first];
    });
    setAnimationDirection('right');
  };

  // Клик по карточке — перемещаем на первое место
  const handleTruckCardClick = (truck: any) => {
    if (order[0] === truck.id) {
      onTruckClick(truck);
      return;
    }
    const idx = order.indexOf(truck.id);
    setOrder(prev => [truck.id, ...prev.filter(id => id !== truck.id)]);
    setAnimationDirection(idx > order.length / 2 ? 'left' : 'right');
    onTruckClick(truck);
  };

  // Авто-скролл к первой карточке (выбранной) при изменении выбора
  useEffect(() => {
    if (!selectedTruckId || !scrollRef.current) return;
    // Выбранная карточка теперь всегда первая, скроллим к началу
    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
  }, [selectedTruckId]);

  // Авто-скролл к карточке трака при появлении результата доставки
  useEffect(() => {
    if (deliveryResults.length === 0 || !scrollRef.current) return;
    const result = deliveryResults[0];
    const idx = trucks.findIndex(t => t.id === result.truckId);
    if (idx < 0) return;
    const container = scrollRef.current;
    const cards = container.querySelectorAll('[data-truck-card]');
    const card = cards[idx] as HTMLElement;
    if (!card) return;
    const cardLeft = card.offsetLeft;
    const cardWidth = card.offsetWidth;
    const containerWidth = container.clientWidth;
    const target = cardLeft - (containerWidth / 2) + (cardWidth / 2);
    container.scrollTo({ left: target, behavior: 'smooth' });
  }, [deliveryResults.length]);

  // Блокируем всплытие touch-событий к карте
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let startX = 0;
    let startScrollLeft = 0;
    let isScrolling = false;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startScrollLeft = el.scrollLeft;
      isScrolling = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dx = Math.abs(e.touches[0].clientX - startX);
      if (dx > 5) {
        isScrolling = true;
        e.stopPropagation();
        // Скроллим вручную
        el.scrollLeft = startScrollLeft - (e.touches[0].clientX - startX);
      }
    };
    const onTouchEnd = () => { isScrolling = false; };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true, capture: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove, true);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <>
      <style>{`
        .truck-card-scroll::-webkit-scrollbar{display:none}
        .truck-card-scroll { touch-action: pan-x !important; }
        .truck-card-scroll * { touch-action: pan-x !important; }
        @keyframes dropdownSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes trackingDot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes slideInFromLeft {
          from { 
            opacity: 0;
            transform: translateX(-100px) scale(0.9);
          }
          to { 
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes slideInFromRight {
          from { 
            opacity: 0;
            transform: translateX(100px) scale(0.9);
          }
          to { 
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes slideOutToLeft {
          from { 
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to { 
            opacity: 0;
            transform: translateX(-100px) scale(0.9);
          }
        }
        @keyframes slideOutToRight {
          from { 
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to { 
            opacity: 0;
            transform: translateX(100px) scale(0.9);
          }
        }
        .truck-card-animate {
          animation: slideInFromRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .truck-card-animate-left {
          animation: slideInFromLeft 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .truck-scroll-btn {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(13,17,23,0.85);
          border: 1px solid rgba(56,189,248,0.35);
          color: #38bdf8; font-size: 14px; font-weight: 900;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          z-index: 10; transition: all 0.15s ease;
          backdrop-filter: blur(8px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          user-select: none;
        }
        .truck-scroll-btn:hover {
          background: rgba(56,189,248,0.2);
          border-color: rgba(56,189,248,0.7);
          box-shadow: 0 0 12px rgba(56,189,248,0.3);
          transform: translateY(-50%) scale(1.1);
        }
        .truck-scroll-btn-left { left: 2px; }
        .truck-scroll-btn-right { right: 2px; }
      `}</style>
      {/* Скролл-контейнер — pointerEvents:none чтобы не блокировать карту, auto на карточках */}
      <div ref={scrollRef} className="truck-card-scroll" style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 8,
        padding: '14px 4px 6px 36px',
        overflowX: 'auto',
        overflowY: 'visible',
        background: 'transparent',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-x',
        alignItems: 'flex-start',
        pointerEvents: 'none', // Пропускаем клики к карте
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      } as any}
      onTouchStart={e => e.stopPropagation()}
      onTouchMove={e => e.stopPropagation()}
      >
        {trucks.map((truck, index) => {
          const color = getTruckColor(truck);
          const isSelected = selectedTruckId === truck.id;
          const isMoving = truck.status === 'driving' || truck.status === 'loaded';
          const progressPct = Math.round(truck.progress * 100);
          const mood = truck.mood ?? 80;
          const moodEmoji = getMoodEmoji(mood, truck.status, truck);
          const idNum = parseInt(truck.id.replace(/\D/g, '')) || 1;
          const truckNum = String(((idNum * 317 + 100) % 900) + 100);
          const trailerNum = String(((idNum * 491 + 200) % 900) + 100);
          const driverName = truck.driver || truck.name;
          const fromSt = CITY_STATE[truck.currentCity] || '';
          const toSt = truck.destinationCity ? (CITY_STATE[truck.destinationCity] || '') : '';
          const fromLabel = fromSt ? `${truck.currentCity}, ${fromSt}` : truck.currentCity;
          const toLabel = toSt ? `${truck.destinationCity}, ${toSt}` : (truck.destinationCity || '');
          const statusLabel = getStatusMessage(truck);

          // События для этого трака
          const truckEvents = activeEvents.filter(e => e.truckId === truck.id);
          const hasUrgent = truckEvents.some(e => e.urgency === 'critical' || e.urgency === 'high');

          // Результат доставки для этого трака
          const deliveryResult = deliveryResults.find(r => r.truckId === truck.id) || null;

          return (
            <div key={truck.id} data-truck-card 
              className={index === 0 && animationDirection ? (animationDirection === 'left' ? 'truck-card-animate-left' : 'truck-card-animate') : ''}
              onClick={(e) => {
                console.log('WRAPPER onClick сработал!', truck.id);
                e.stopPropagation();
                e.preventDefault();
                handleTruckCardClick(truck);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              style={{
              flexShrink: 0, width: 250,
              display: 'flex', flexDirection: 'column',
              position: 'relative',
              pointerEvents: 'auto', // Включаем клики на карточке
              cursor: 'pointer',
              zIndex: 20,
            } as any}>

              {/* Стрелки навигации — на выбранной карточке, или на первой если ничего не выбрано. Только если траков > 1 */}
              {trucks.length > 1 && (truck.id === selectedTruckId || (!selectedTruckId && index === 0)) && (
                <>
                  <button
                    onClick={handlePrevTruck}
                    style={{
                      position: 'absolute', left: -32, top: '50%', transform: 'translateY(-50%)',
                      zIndex: 30, width: 28, height: 28, borderRadius: '50%',
                      background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(56,189,248,0.35)',
                      color: '#38bdf8', fontSize: 18, fontWeight: 900, lineHeight: 1,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                      transition: 'all 0.15s ease',
                    } as any}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(56,189,248,0.2)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(56,189,248,0.7)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(13,17,23,0.85)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(56,189,248,0.35)'; }}
                  >‹</button>
                  <button
                    onClick={handleNextTruck}
                    style={{
                      position: 'absolute', right: -32, top: '50%', transform: 'translateY(-50%)',
                      zIndex: 30, width: 28, height: 28, borderRadius: '50%',
                      background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(56,189,248,0.35)',
                      color: '#38bdf8', fontSize: 18, fontWeight: 900, lineHeight: 1,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                      transition: 'all 0.15s ease',
                    } as any}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(56,189,248,0.2)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(56,189,248,0.7)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(13,17,23,0.85)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(56,189,248,0.35)'; }}
                  >›</button>
                </>
              )}
              {/* Карточка трака */}
              <div
                style={{
                  width: '100%',
                  borderRadius: 16,
                  border: `2px solid ${color}66`,
                  background: isDark ? 'rgba(15,20,35,0.92)' : 'rgba(255,255,255,0.94)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'row',
                  overflow: 'visible',
                  fontFamily: 'sans-serif',
                  boxShadow: isDark
                    ? '-10px -2px 20px rgba(0,0,0,0.22), -4px -1px 10px rgba(0,0,0,0.14)'
                    : '-10px -2px 20px rgba(0,0,0,0.09), -4px -1px 10px rgba(0,0,0,0.05)',
                  transform: 'translateY(-3px)',
                  transition: 'border 0.2s, transform 0.15s, box-shadow 0.25s',
                  position: 'relative',
                  '--pulse-color': color + '55',
                } as any}
                onMouseEnter={e => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = isDark
                      ? '-12px -3px 26px rgba(0,0,0,0.28), -5px -1px 12px rgba(0,0,0,0.18)'
                      : '-12px -3px 26px rgba(0,0,0,0.11), -5px -1px 12px rgba(0,0,0,0.06)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = isDark
                      ? '-10px -2px 20px rgba(0,0,0,0.22), -4px -1px 10px rgba(0,0,0,0.14)'
                      : '-10px -2px 20px rgba(0,0,0,0.09), -4px -1px 10px rgba(0,0,0,0.05)';
                  }
                }}
              >
                {/* Индикатор слежения — снизу карточки, поверх таба */}
                {isSelected && (
                  <div style={{
                    position: 'absolute', bottom: -16, left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: isDark ? 'rgba(10,15,30,0.85)' : 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(16px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                    border: `1.5px solid ${color}`,
                    borderRadius: 10, padding: '3px 10px',
                    zIndex: 10,
                    whiteSpace: 'nowrap',
                    boxShadow: `0 4px 16px ${color}55, 0 1px 4px rgba(0,0,0,0.25)`,
                  } as any}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: hasUrgent ? '#ef4444' : '#4ade80',
                      boxShadow: hasUrgent ? '0 0 5px #ef4444' : '0 0 5px #4ade80',
                      animation: 'trackingDot 1.2s ease-in-out infinite',
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 10, fontWeight: 800, color: isDark ? '#e2e8f0' : '#111827' }}>
                      {hasUrgent ? '⚠️ Проблема' : '🎯 Слежение'}
                    </span>
                  </div>
                )}

                {/* Бейдж количества событий */}
                {truckEvents.length > 0 && !isSelected && (
                  <div style={{
                    position: 'absolute', top: -6, right: -6,
                    width: 20, height: 20, borderRadius: '50%',
                    background: hasUrgent ? '#ef4444' : '#f59e0b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 2,
                    boxShadow: `0 0 8px ${hasUrgent ? '#ef444488' : '#f59e0b88'}`,
                    animation: hasUrgent ? 'selectedPulse 1.5s ease-in-out infinite' : 'none',
                    '--pulse-color': hasUrgent ? '#ef444466' : '#f59e0b66',
                  } as any}>
                    <span style={{ fontSize: 10, fontWeight: 900, color: '#fff' }}>
                      {truckEvents.length > 9 ? '!' : truckEvents.length}
                    </span>
                  </div>
                )}

                <div style={{ display:'flex', flexDirection:'row', width:'100%', borderRadius:12, overflow:'hidden', pointerEvents: 'none' } as any}>
                  {/* ЛЕВЫЙ БЛОК — аватар */}
                  <div style={{
                    width: 62, flexShrink: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 2, padding: '5px 3px',
                    borderRight: `1px solid ${color}33`,
                    position: 'relative',
                    pointerEvents: 'none',
                  } as any}>
                    <img src={moodEmoji} width={16} height={16}
                      style={{ position: 'absolute', top: 3, right: 2 } as any} />
                    <img src={getDriverAvatar(truck.driver || truck.id)} width={40} height={40}
                      style={{ display: 'block', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' } as any} />
                    <div style={{
                      fontSize: 8, fontWeight: 700, color,
                      border: `1px solid ${color}44`, borderRadius: 4,
                      padding: '1px 4px', whiteSpace: 'nowrap', maxWidth: 58,
                      overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center',
                    } as any}>{statusLabel}</div>
                  </div>

                  {/* ПРАВЫЙ БЛОК — инфо */}
                  <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    padding: '5px 8px', gap: 1, minWidth: 0,
                    pointerEvents: 'none',
                  } as any}>
                    {/* Строка 1: Имя + TRK/TRL */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as any}>
                      <span style={{ fontSize: 12, fontWeight: 900, color: isDark ? '#ffffff' : '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80 } as any}>
                        {driverName}
                      </span>
                      <div style={{ display: 'flex', gap: 2, flexShrink: 0 } as any}>
                        <span style={{ fontSize: 8, fontWeight: 700, color: isDark ? '#38bdf8' : '#007aff', border: `1px solid ${isDark ? 'rgba(56,189,248,0.3)' : 'rgba(0,122,255,0.3)'}`, borderRadius: 3, padding: '0px 3px' } as any}>TRK {truckNum}</span>
                        <span style={{ fontSize: 8, fontWeight: 700, color: isDark ? '#94a3b8' : '#6b7280', border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`, borderRadius: 3, padding: '0px 3px' } as any}>TRL {trailerNum}</span>
                      </div>
                    </div>

                    {/* Строка 2: Маршрут */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 } as any}>
                      <span style={{ fontSize: 9 } as any}>📍</span>
                      {truck.destinationCity ? (
                        <span style={{ fontSize: 10, fontWeight: 800, color: isDark ? '#e2e8f0' : '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as any}>
                          {fromLabel}
                          <span style={{ color: isDark ? '#475569' : '#9ca3af', margin: '0 3px' } as any}>→</span>
                          <span style={{ color: isDark ? '#38bdf8' : '#007aff' } as any}>{toLabel}</span>
                        </span>
                      ) : (
                        <span style={{ fontSize: 10, fontWeight: 800, color: isDark ? '#94a3b8' : '#6b7280' } as any}>{fromLabel}</span>
                      )}
                    </div>

                    {/* Строка 3: Прогресс рейса + ставка */}
                    {isMoving && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 } as any}>
                        <div style={{ flex: 1 } as any}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 } as any}>
                            <span style={{ fontSize: 8, color: isDark ? '#64748b' : '#6b7280', fontWeight: 600 } as any}>Рейс</span>
                            <span style={{ fontSize: 8, fontWeight: 800, color } as any}>{progressPct}%</span>
                          </div>
                          <div style={{ height: 3, background: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb', borderRadius: 2, overflow: 'hidden' } as any}>
                            <div style={{ height: '100%', width: `${progressPct}%`, background: `linear-gradient(90deg,${color}88,${color})`, borderRadius: 2, transition: 'width 0.8s ease' } as any} />
                          </div>
                        </div>
                        {truck.currentLoad ? (
                          <div style={{ flexShrink: 0, border: `1px solid ${isDark ? 'rgba(74,222,128,0.35)' : 'rgba(52,199,89,0.35)'}`, borderRadius: 5, padding: '0px 5px' } as any}>
                            <span style={{ fontSize: 11, fontWeight: 900, color: isDark ? '#4ade80' : '#16a34a' } as any}>${truck.currentLoad.agreedRate.toLocaleString()}</span>
                          </div>
                        ) : (
                          <div style={{ flexShrink: 0, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, borderRadius: 5, padding: '0px 5px' } as any}>
                            <span style={{ fontSize: 9, fontWeight: 700, color: isDark ? '#475569' : '#9ca3af' } as any}>Нет груза</span>
                          </div>
                        )}
                      </div>
                    )}
                    {!isMoving && truck.currentLoad && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end' } as any}>
                        <div style={{ border: `1px solid ${isDark ? 'rgba(74,222,128,0.35)' : 'rgba(52,199,89,0.35)'}`, borderRadius: 5, padding: '0px 5px' } as any}>
                          <span style={{ fontSize: 11, fontWeight: 900, color: isDark ? '#4ade80' : '#16a34a' } as any}>${truck.currentLoad.agreedRate.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    {/* Строка 4: 3 мини прогресс-бара */}
                    {(() => {
                      const techVal = Math.round(Math.max(0, Math.min(100, (truck as any).reliability ?? 80)));
                      const moodVal = Math.round(Math.max(0, Math.min(100, truck.mood ?? 80)));
                      const perfVal = Math.round(Math.max(0, Math.min(100, (truck as any).performance ?? 80)));
                      const techColor = techVal >= 70 ? '#34d399' : techVal >= 40 ? '#fbbf24' : '#f87171';
                      const moodColor = moodVal >= 70 ? '#34d399' : moodVal >= 40 ? '#fbbf24' : '#f87171';
                      const perfColor = perfVal >= 70 ? '#818cf8' : perfVal >= 40 ? '#fbbf24' : '#f87171';
                      const bars = [
                        { icon: '🚛', label: 'Состояние', val: techVal, color: techColor },
                        { icon: '😊', label: 'Настроение', val: moodVal, color: moodColor },
                        { icon: '⚡', label: 'Скорость',   val: perfVal, color: perfColor },
                      ];
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 3 } as any}>
                          {bars.map(b => (
                            <div key={b.icon} style={{ display: 'flex', alignItems: 'center', gap: 4 } as any}>
                              <span style={{ fontSize: 10, lineHeight: 1, flexShrink: 0 } as any}>{b.icon}</span>
                              <span style={{ fontSize: 10, fontWeight: 700, color: isDark ? '#e2e8f0' : '#374151', flexShrink: 0, width: 60, lineHeight: 1 } as any}>{b.label}</span>
                              <div style={{ flex: 1, maxWidth: 70, height: 5, background: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb', borderRadius: 3, overflow: 'hidden', flexShrink: 0 } as any}>
                                <div style={{ height: '100%', width: `${b.val}%`, background: b.color, borderRadius: 3, transition: 'width 0.8s ease' } as any} />
                              </div>
                              <span style={{ fontSize: 10, fontWeight: 800, color: b.color, lineHeight: 1, flexShrink: 0 } as any}>{b.val}%</span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* TruckDropdown — панель под выбранной карточкой */}
              {isSelected && (
                <TruckDropdown
                  truck={truck}
                  events={truckEvents}
                  isDark={isDark}
                />
              )}

              {/* Результат доставки — под карточкой */}
              {deliveryResult && (
                <DeliveryInlineResult
                  result={deliveryResult}
                  isDark={isDark}
                  onDismiss={() => dismissDeliveryResult(deliveryResult.loadId)}
                />
              )}
            </div>
          );
        })}

        {/* Купить трак */}
        <div 
          onClick={() => {
            useGameStore.getState().setTruckShopOpen(true);
          }}
          style={{
            flexShrink: 0, width: 72, borderRadius: 12,
            border: `2px dashed ${isDark ? 'rgba(56,189,248,0.35)' : 'rgba(0,122,255,0.4)'}`,
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 4, padding: '8px 4px', cursor: 'pointer',
            boxShadow: isDark
              ? '-10px -2px 20px rgba(0,0,0,0.22), -4px -1px 10px rgba(0,0,0,0.14)'
              : '0 2px 12px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)',
            transform: 'translateY(-3px)',
            transition: 'background 0.2s, transform 0.15s, box-shadow 0.15s',
            pointerEvents: 'auto', // Включаем клики на кнопке
          } as any}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(6,182,212,0.08)' : 'rgba(235,245,255,0.98)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.92)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
          }}
        >
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: isDark ? 'rgba(56,189,248,0.12)' : 'rgba(0,122,255,0.1)', border: `1.5px solid ${isDark ? 'rgba(56,189,248,0.35)' : 'rgba(0,122,255,0.5)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: isDark ? '#38bdf8' : '#007aff' } as any}>+</div>
          <span style={{ fontSize: 9, fontWeight: 700, color: isDark ? '#38bdf8' : '#007aff', textAlign: 'center', lineHeight: 1.3 } as any}>Купить{'\n'}трак</span>
        </div>

      </div>{/* конец скролл-контейнера */}

      {/* Баннер итогов дня — под strip карточек */}
      <DayEndBanner isDark={isDark} />
      {/* Баннер итогов недели — под strip карточек */}
      <ShiftEndBanner isDark={isDark} />
    </>
  );
});

export default TruckCardOverlay;

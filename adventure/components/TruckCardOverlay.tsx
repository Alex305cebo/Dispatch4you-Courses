// Карточки траков поверх карты — без фона, только карточки
// При выборе: карточка выделяется, под ней выпадает панель с событиями/действиями
import React, { memo, useRef, useEffect, useState } from 'react';
import { useGameStore, GameEvent, DeliveryResult } from '../store/gameStore';
import { useThemeStore } from '../store/themeStore';
import { CITY_STATE, CITIES } from '../constants/config';
import { getDriverAvatar } from '../utils/driverAvatars';
import { SERVICE_VEHICLE_CONFIGS } from '../types/serviceVehicle';
import DayEndBanner from './DayEndPopup';
import ShiftEndBanner from './ShiftEndPopup';
import TruckStatsView from './TruckStatsView';

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

/** Обёртка dropdown с анимацией сворачивания/разворачивания */
function AnimatedDropdown({ truck, events, isDark, isSelected }: { truck: any; events: GameEvent[]; isDark: boolean; isSelected: boolean }) {
  const [expanded, setExpanded] = useState(true);
  const [visible, setVisible] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentH, setContentH] = useState(0);

  // При выборе трака — открываем
  useEffect(() => {
    if (isSelected) {
      setVisible(true);
      setExpanded(true);
    } else {
      setExpanded(false);
      const t = setTimeout(() => setVisible(false), 250);
      return () => clearTimeout(t);
    }
  }, [isSelected]);

  // Измеряем высоту контента
  useEffect(() => {
    if (contentRef.current && visible && expanded) {
      const h = contentRef.current.scrollHeight;
      if (h > 0) setContentH(h);
    }
  });

  if (!visible) return null;

  const color = getTruckColor(truck);

  return (
    <div>
      {/* Контент с анимацией */}
      <div style={{
        overflow: 'hidden',
        maxHeight: expanded ? (contentH || 500) : 0,
        opacity: expanded ? 1 : 0,
        transition: 'max-height 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease',
        // Когда expanded — даём overflow visible чтобы не обрезать углы таба
        ...(expanded ? { overflow: 'visible' } : {}),
      }}>
        <div ref={contentRef}>
          <TruckDropdown truck={truck} events={events} isDark={isDark} />
        </div>
      </div>

      {/* Ручка сворачивания — снизу */}
      <div
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 4, padding: '3px 0 1px', cursor: 'pointer',
          opacity: 0.35, transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.35'; }}
      >
        <div style={{
          width: 24, height: 3, borderRadius: 2,
          background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
        }} />
        <span style={{
          fontSize: 8, color: isDark ? '#475569' : '#9ca3af',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          lineHeight: 1,
        }}>▼</span>
      </div>
    </div>
  );
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

/** HUD-плашка с вкладками — Route / Stats / Load / Radio */
function TruckHUD({ truck, isDark, ps }: { truck: any; isDark: boolean; ps: any }) {
  const [activeTab, setActiveTab] = useState<'route' | 'stats' | 'load' | 'radio'>('route');
  const [collapsed, setCollapsed] = useState(false);
  const collapseTimerRef = React.useRef<any>(null);
  const gameMinute = useGameStore(s => s.gameMinute);
  const color = getTruckColor(truck);

  // Автосворачивание через 4 секунды после открытия
  React.useEffect(() => {
    collapseTimerRef.current = setTimeout(() => setCollapsed(true), 4000);
    return () => clearTimeout(collapseTimerRef.current);
  }, []);

  // При смене вкладки — разворачиваем и сбрасываем таймер
  function handleTabClick(key: typeof activeTab) {
    setActiveTab(key);
    setCollapsed(false);
    clearTimeout(collapseTimerRef.current);
    collapseTimerRef.current = setTimeout(() => setCollapsed(true), 4000);
  }

  // При ручном разворачивании — тоже сбрасываем таймер
  function handleToggleCollapse(e: React.MouseEvent) {
    e.stopPropagation();
    const next = !collapsed;
    setCollapsed(next);
    clearTimeout(collapseTimerRef.current);
    if (!next) {
      collapseTimerRef.current = setTimeout(() => setCollapsed(true), 4000);
    }
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

  const tabs: Array<{ key: typeof activeTab; icon: string; label: string }> = [
    { key: 'route', icon: '🛣️', label: 'Route' },
    { key: 'stats', icon: '📊', label: 'Stats' },
    { key: 'load', icon: '📦', label: 'Load' },
    { key: 'radio', icon: '📻', label: 'Radio' },
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

      {/* ── SUMMARY CHIPS — только когда развёрнуто ── */}
      {!collapsed && (
        <div style={{ display: 'flex', gap: 6, padding: '8px 10px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, background: isDark ? 'rgba(13,17,23,0.97)' : 'rgba(255,255,255,0.97)' }}>
          {[
            { label: 'HOS', val: `${Math.floor(truck.hoursLeft)}h ${Math.round((truck.hoursLeft - Math.floor(truck.hoursLeft)) * 60)}m`, color: truck.hoursLeft < 2 ? '#f87171' : truck.hoursLeft < 4 ? '#fbbf24' : '#4ade80' },
            { label: 'MOOD', val: `${Math.round(truck.mood ?? 75)}%`, color: (truck.mood ?? 75) >= 70 ? '#4ade80' : (truck.mood ?? 75) >= 40 ? '#fbbf24' : '#f87171' },
            { label: 'РЕЙС', val: `${Math.round((truck.progress || 0) * 100)}%`, color: '#38bdf8' },
            { label: 'СТАТУС', val: { idle: 'Свободен', driving: 'К погрузке', at_pickup: 'Погрузка', loaded: 'В пути', at_delivery: 'Разгрузка', breakdown: 'Поломка', waiting: 'Detention', in_garage: 'Гараж' }[truck.status as string] || truck.status, color },
          ].map(c => (
            <div key={c.label} style={{ flex: 1, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, borderRadius: 8, padding: '5px 4px', textAlign: 'center' } as any}>
              <div style={{ fontSize: 8, color: isDark ? '#94a3b8' : '#6b7280', fontWeight: 700, letterSpacing: 0.3, marginBottom: 2 }}>{c.label}</div>
              <div style={{ fontSize: 11, fontWeight: 900, color: c.color }}>{c.val}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── ТАБЫ — всегда видны ── */}
      <div style={{
        display: 'flex',
        ...(collapsed ? {
          // СВЁРНУТЫЙ: стеклянная таблетка
          background: isDark ? 'rgba(10,15,30,0.55)' : 'rgba(255,255,255,0.45)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderRadius: 14,
          border: isDark
            ? '1px solid rgba(255,255,255,0.18)'
            : '1px solid rgba(255,255,255,0.6)',
          boxShadow: isDark
            ? '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.10)'
            : '0 4px 20px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
          padding: '2px',
        } : {
          // РАЗВЁРНУТЫЙ: строка табов — часть общего блока в стиле P&L
          background: isDark ? 'rgba(13,17,23,0.97)' : 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderRadius: '12px 12px 0 0',
          border: isDark
            ? '2px solid rgba(255,255,255,0.08)'
            : '2px solid rgba(0,0,0,0.08)',
          borderBottom: 'none',
        }),
      }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => handleTabClick(t.key)}
            style={{
              flex: 1, padding: collapsed ? '8px 4px' : '8px 4px',
              border: 'none', cursor: 'pointer',
              background: collapsed && activeTab === t.key
                ? (isDark ? 'rgba(6,182,212,0.18)' : 'rgba(6,182,212,0.15)')
                : 'transparent',
              borderRadius: collapsed ? 10 : 0,
              borderBottom: collapsed ? 'none' : `2px solid ${activeTab === t.key ? '#06b6d4' : 'transparent'}`,
              color: collapsed
                ? (activeTab === t.key ? '#06b6d4' : (isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.45)'))
                : (activeTab === t.key ? '#06b6d4' : (isDark ? '#64748b' : '#9ca3af')),
              fontSize: 11, fontWeight: 600,
              transition: 'color 0.2s, border-color 0.2s, background 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: collapsed ? 16 : 12, opacity: collapsed ? (activeTab === t.key ? 1 : 0.7) : 1, filter: collapsed && activeTab === t.key ? 'drop-shadow(0 0 4px #06b6d4)' : 'none' }}>{t.icon}</span>
            {!collapsed && t.label}
          </button>
        ))}
      </div>

      {/* ── КОНТЕНТ — только когда развёрнуто ── */}
      {!collapsed && (
        <div style={{
          position: 'relative', minHeight: 80,
          background: isDark ? 'rgba(13,17,23,0.97)' : 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderRadius: '0 0 12px 12px',
          border: isDark
            ? '2px solid rgba(255,255,255,0.08)'
            : '2px solid rgba(0,0,0,0.08)',
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

        {/* RADIO */}
        <div style={{
          padding: '10px 12px',
          opacity: activeTab === 'radio' ? 1 : 0,
          position: activeTab === 'radio' ? 'relative' : 'absolute',
          top: 0, left: 0, width: '100%',
          transition: 'opacity 0.3s ease',
          pointerEvents: activeTab === 'radio' ? 'auto' : 'none',
        }}>
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px',
            background: isDark ? 'rgba(6,182,212,0.06)' : 'rgba(6,182,212,0.04)',
            border: `1px solid ${isDark ? 'rgba(6,182,212,0.15)' : 'rgba(6,182,212,0.12)'}`,
            borderRadius: 8,
          }}>
            <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>📻</span>
            <div>
              <div style={{ fontSize: 9, color: '#06b6d4', fontWeight: 700, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>Last transmission</div>
              <div style={{ fontSize: 12, color: isDark ? '#e2e8f0' : '#374151', lineHeight: 1.5, fontStyle: 'italic' }}>"{driverMessage}"</div>
            </div>
          </div>
          {divider}
          {row('Driver', truck.driver)}
          {row('Location', `📍 ${truck.currentCity || 'En route'}`)}
          {row('Status', `${sEmoji} ${sLabel}`)}
          {truck.isOldTruck && row('Truck Condition', '⚠️ Old truck')}
        </div>
      </div>
      )}

      {/* Кнопка сворачивания/разворачивания — только когда развёрнуто */}
      {!collapsed && (
      <div
        onClick={handleToggleCollapse}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, padding: '6px 0', cursor: 'pointer',
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          background: isDark ? 'rgba(10,15,30,0.45)' : 'rgba(255,255,255,0.35)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderRadius: '0 0 12px 12px',
          border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.5)',
          borderTop: 'none',
          transition: 'all 0.2s ease',
        } as any}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(10,15,30,0.6)' : 'rgba(255,255,255,0.5)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(10,15,30,0.45)' : 'rgba(255,255,255,0.35)'; }}
      >
        <span style={{ fontSize: 10, color: isDark ? '#64748b' : '#9ca3af', fontWeight: 700, lineHeight: 1 }}>▼</span>
        <div style={{ width: 32, height: 3, borderRadius: 2, background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }} />
      </div>
      )}
    </div>
  );
}

/** Выпадающая панель под выбранной карточкой — богатый интерактивный контент */
function TruckDropdown({ truck, events, isDark }: { truck: any; events: GameEvent[]; isDark: boolean }) {
  const resolveEvent = useGameStore(s => s.resolveEvent);
  const repairBreakdown = useGameStore(s => s.repairBreakdown);
  const gameMinute = useGameStore(s => s.gameMinute);
  const serviceVehicles = useGameStore(s => s.serviceVehicles);
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
    const negotiation = useGameStore.getState().negotiation;
    const bookedLoads = useGameStore.getState().bookedLoads;
    const unbookedLoad = bookedLoads.find(l => !l.truckId || l.truckId === '');
    const hasNegotiation = negotiation.open && negotiation.load;
    
    const handleOpenLoadBoard = (e: React.MouseEvent) => {
      e.stopPropagation();
      const store = useGameStore.getState();
      store.setLoadBoardSearch(truck.currentCity);
      try { localStorage.setItem('dispatch-active-tab', 'loadboard'); } catch {}
      window.dispatchEvent(new CustomEvent('switchTab', { detail: { tab: 'loadboard' } }));
    };

    const handleOpenNegotiation = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Переключаем на loadboard где открыт чат переговоров
      try { localStorage.setItem('dispatch-active-tab', 'loadboard'); } catch {}
      window.dispatchEvent(new CustomEvent('switchTab', { detail: { tab: 'loadboard' } }));
    };

    const handleAssignLoad = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!unbookedLoad) return;
      useGameStore.getState().assignLoadToTruck(unbookedLoad, truck.id);
      // Переключаем на карту и включаем слежение за траком
      try { localStorage.setItem('dispatch-active-tab', 'map'); } catch {}
      window.dispatchEvent(new CustomEvent('switchTab', { detail: { tab: 'map' } }));
      window.dispatchEvent(new CustomEvent('followTruckFromCard', {
        detail: { truckId: truck.id, lng: truck.position[0], lat: truck.position[1] }
      }));
    };

    // Стиль action-pill кнопки
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

        {/* Action-табы */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

          {/* 📞 Брокер — когда идут переговоры */}
          {hasNegotiation && negotiation.load && (
            <div
              onClick={handleOpenNegotiation}
              style={actionPill('#4ade80')}
              onMouseEnter={e => pillHoverOn(e.currentTarget as HTMLElement, '#4ade80')}
              onMouseLeave={e => pillHoverOff(e.currentTarget as HTMLElement)}
            >
              <div style={{ position: 'relative' }}>
                <span style={{ fontSize: 18 }}>📞</span>
                <div style={{
                  position: 'absolute', top: -2, right: -4,
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#4ade80',
                  animation: 'trackingDot 1.2s ease-in-out infinite',
                  boxShadow: '0 0 6px #4ade80',
                }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: isDark ? '#4ade80' : '#16a34a' }}>Переговоры</div>
                <div style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#6b7280' }}>
                  {negotiation.load.brokerName} • {negotiation.load.fromCity} → {negotiation.load.toCity} • ${negotiation.load.postedRate.toLocaleString()}
                </div>
              </div>
              <span style={{ fontSize: 14, color: isDark ? '#4ade80' : '#16a34a', opacity: 0.6 }}>→</span>
            </div>
          )}

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

          {/* 📦 Найти груз — всегда для idle */}
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
  const trucks = useGameStore(s => s.trucks);
  const activeEvents = useGameStore(s => s.activeEvents);
  const deliveryResults = useGameStore(s => s.deliveryResults);
  const dismissDeliveryResult = useGameStore(s => s.dismissDeliveryResult);
  const { mode: themeMode } = useThemeStore();
  const isDark = themeMode === 'dark';
  const scrollRef = useRef<HTMLDivElement>(null);

  // Авто-скролл к выбранной карточке
  useEffect(() => {
    if (!selectedTruckId || !scrollRef.current) return;
    const idx = trucks.findIndex(t => t.id === selectedTruckId);
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
  }, [selectedTruckId, trucks]);

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
      `}</style>
      <div ref={scrollRef} className="truck-card-scroll" style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 8,
        padding: '14px 10px 6px',
        overflowX: 'auto',
        overflowY: 'visible',
        background: 'transparent',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-x',
        alignItems: 'flex-start',
      } as any}
      onTouchStart={e => e.stopPropagation()}
      onTouchMove={e => e.stopPropagation()}
      >
        {trucks.map(truck => {
          const color = getTruckColor(truck);
          const hos = Math.max(0, truck.hoursLeft);
          const hosColor = hos < 2 ? '#f87171' : hos < 4 ? '#fbbf24' : '#34d399';
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
          const statusLabel = truck.onNightStop ? '🌙 Ночёвка' 
            : (truck.status === 'waiting' && (truck as any).hosRestStartMinute !== undefined) ? '😴 HOS отдых'
            : STATUS_LABEL[truck.status] || truck.status;

          // События для этого трака
          const truckEvents = activeEvents.filter(e => e.truckId === truck.id);
          const hasUrgent = truckEvents.some(e => e.urgency === 'critical' || e.urgency === 'high');

          // Результат доставки для этого трака
          const deliveryResult = deliveryResults.find(r => r.truckId === truck.id) || null;

          return (
            <div key={truck.id} data-truck-card style={{
              flexShrink: 0, width: 250,
              display: 'flex', flexDirection: 'column',
              position: 'relative',
            } as any}>
              {/* Карточка трака */}
              <div
                onClick={() => onTruckClick(truck)}
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

                <div style={{ display:'flex', flexDirection:'row', width:'100%', borderRadius:12, overflow:'hidden' } as any}>
                  {/* ЛЕВЫЙ БЛОК — аватар */}
                  <div style={{
                    width: 62, flexShrink: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 3, padding: '6px 3px',
                    borderRight: `1px solid ${color}33`,
                    position: 'relative',
                  } as any}>
                    <img src={moodEmoji} width={16} height={16}
                      style={{ position: 'absolute', top: 3, right: 2 } as any} />
                    <img src={getDriverAvatar(truck.driver || truck.id)} width={40} height={40}
                      style={{ display: 'block' } as any} />
                    <div style={{
                      fontSize: 8, fontWeight: 700, color,
                      border: `1px solid ${color}44`, borderRadius: 4,
                      padding: '1px 4px', whiteSpace: 'nowrap',
                    } as any}>{statusLabel}</div>
                  </div>

                  {/* ПРАВЫЙ БЛОК — инфо */}
                  <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    padding: '5px 8px', gap: 2, minWidth: 0,
                  } as any}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as any}>
                      <span style={{ fontSize: 11, fontWeight: 900, color: isDark ? '#ffffff' : '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80 } as any}>
                        {driverName}
                      </span>
                      <div style={{ display: 'flex', gap: 2, flexShrink: 0 } as any}>
                        <span style={{ fontSize: 8, fontWeight: 700, color: isDark ? '#38bdf8' : '#007aff', border: `1px solid ${isDark ? 'rgba(56,189,248,0.3)' : 'rgba(0,122,255,0.3)'}`, borderRadius: 3, padding: '0px 3px' } as any}>TRK {truckNum}</span>
                        <span style={{ fontSize: 8, fontWeight: 700, color: isDark ? '#94a3b8' : '#6b7280', border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`, borderRadius: 3, padding: '0px 3px' } as any}>TRL {trailerNum}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 } as any}>
                      <span style={{ fontSize: 9 } as any}>📍</span>
                      {truck.destinationCity ? (
                        <span style={{ fontSize: 9, fontWeight: 700, color: isDark ? '#e2e8f0' : '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as any}>
                          {fromLabel}
                          <span style={{ color: isDark ? '#475569' : '#9ca3af', margin: '0 3px' } as any}>→</span>
                          <span style={{ color: isDark ? '#38bdf8' : '#007aff' } as any}>{toLabel}</span>
                        </span>
                      ) : (
                        <span style={{ fontSize: 9, fontWeight: 700, color: isDark ? '#94a3b8' : '#6b7280' } as any}>{fromLabel}</span>
                      )}
                    </div>

                    {isMoving && (
                      <div style={{ marginTop: 1 } as any}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 } as any}>
                          <span style={{ fontSize: 8, color: isDark ? '#64748b' : '#6b7280', fontWeight: 600 } as any}>Рейс</span>
                          <span style={{ fontSize: 8, fontWeight: 800, color } as any}>{progressPct}%</span>
                        </div>
                        <div style={{ height: 3, background: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb', borderRadius: 2, overflow: 'hidden' } as any}>
                          <div style={{ height: '100%', width: `${progressPct}%`, background: `linear-gradient(90deg,${color}88,${color})`, borderRadius: 2, transition: 'width 0.8s ease' } as any} />
                        </div>
                      </div>
                    )}

                    {/* Стандартная строка HOS/mood/ставка */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 } as any}>
                      <div style={{ border: `1px solid ${hosColor}44`, borderRadius: 5, padding: '0px 4px', display: 'flex', alignItems: 'baseline', gap: 1 } as any}>
                        <span style={{ fontSize: 10, fontWeight: 900, color: hosColor } as any}>{hos.toFixed(1)}</span>
                        <span style={{ fontSize: 8, color: hosColor, opacity: 0.8 } as any}>h</span>
                      </div>
                      <span style={{ fontSize: 9 } as any}>😊</span>
                      <span style={{ fontSize: 9, fontWeight: 800, color: mood >= 60 ? (isDark ? '#34d399' : '#16a34a') : mood >= 35 ? '#fbbf24' : '#f87171' } as any}>{Math.round(mood)}%</span>
                      {truck.currentLoad ? (
                        <div style={{ marginLeft: 'auto', border: `1px solid ${isDark ? 'rgba(74,222,128,0.35)' : 'rgba(52,199,89,0.35)'}`, borderRadius: 5, padding: '0px 5px' } as any}>
                          <span style={{ fontSize: 11, fontWeight: 900, color: isDark ? '#4ade80' : '#16a34a' } as any}>${truck.currentLoad.agreedRate.toLocaleString()}</span>
                        </div>
                      ) : (
                        <div style={{ marginLeft: 'auto', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, borderRadius: 5, padding: '0px 5px' } as any}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: isDark ? '#475569' : '#9ca3af' } as any}>Нет груза</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Выпадающая панель — marginTop даёт место плашке Слежение */}
              <div style={{ marginTop: 2 }}>
                <AnimatedDropdown truck={truck} events={truckEvents} isDark={isDark} isSelected={isSelected} />
              </div>

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
      </div>

      {/* Баннер итогов дня — под strip карточек */}
      <DayEndBanner isDark={isDark} />
      {/* Баннер итогов недели — под strip карточек */}
      <ShiftEndBanner isDark={isDark} />
    </>
  );
});

export default TruckCardOverlay;

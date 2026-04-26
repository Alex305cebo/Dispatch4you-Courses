// Карточки траков поверх карты — без фона, только карточки
// При выборе: карточка выделяется, под ней выпадает панель с событиями/действиями
import React, { memo, useRef, useEffect } from 'react';
import { useGameStore, GameEvent } from '../store/gameStore';
import { useThemeStore } from '../store/themeStore';
import { CITY_STATE } from '../constants/config';
import { getDriverAvatar } from '../utils/driverAvatars';

const FLUENT = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis';
const STATUS_COLOR: Record<string, string> = {
  idle: '#38bdf8', driving: '#818cf8', loaded: '#34d399',
  at_pickup: '#fbbf24', at_delivery: '#a78bfa',
  breakdown: '#f87171', waiting: '#fb923c',
};
const STATUS_LABEL: Record<string, string> = {
  idle: 'Свободен', driving: 'К погрузке', loaded: 'В пути',
  at_pickup: 'Погрузка', at_delivery: 'Разгрузка',
  breakdown: 'Поломка', waiting: 'Detention',
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

/** Выпадающая панель под выбранной карточкой — богатый интерактивный контент */
function TruckDropdown({ truck, events, isDark }: { truck: any; events: GameEvent[]; isDark: boolean }) {
  const resolveEvent = useGameStore(s => s.resolveEvent);
  const repairBreakdown = useGameStore(s => s.repairBreakdown);
  const gameMinute = useGameStore(s => s.gameMinute);
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
    flex: 1, minWidth: large ? 120 : 80, padding: large ? '10px 12px' : '7px 10px',
    background: btnColor + '15', border: `2px solid ${btnColor}55`, borderRadius: 12,
    cursor: 'pointer', transition: 'all 0.15s ease',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
  });
  const ps: any = {
    marginTop: 6, padding: '10px 12px',
    background: isDark ? 'rgba(15,20,35,0.95)' : 'rgba(255,255,255,0.97)',
    backdropFilter: 'blur(14px)',
    border: `2px solid ${isBreakdown ? '#f8717188' : isWaiting ? '#fb923c88' : color + '44'}`,
    borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 8,
    maxWidth: 340, width: '100%', animation: 'dropdownSlide 0.2s ease-out',
    boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.15)',
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
        <div style={{ background: isDark ? 'rgba(248,113,113,0.08)' : 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '8px 10px' }}>
          <p style={{ fontSize: 11, color: isDark ? '#e2e8f0' : '#374151', margin: 0, lineHeight: 1.5 }}>
            Трак остановился. Выберите ремонт — от этого зависит стоимость и время простоя.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => repairBreakdown(truck.id, 'roadside')} style={actionBtn('#4ade80', true)}
            onMouseEnter={e => hov(e.currentTarget as HTMLElement, '#4ade80', true)}
            onMouseLeave={e => hov(e.currentTarget as HTMLElement, '#4ade80', false)}>
            <span style={{ fontSize: 22 }}>🔧</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: isDark ? '#4ade80' : '#16a34a' }}>Ремонт на месте</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#f87171' }}>−${cR.toLocaleString()}</span>
            <span style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#6b7280' }}>⏱ ~{dR} мин</span>
          </button>
          {cT > 0 && (
            <button onClick={() => repairBreakdown(truck.id, 'tow')} style={actionBtn('#fb923c', true)}
              onMouseEnter={e => hov(e.currentTarget as HTMLElement, '#fb923c', true)}
              onMouseLeave={e => hov(e.currentTarget as HTMLElement, '#fb923c', false)}>
              <span style={{ fontSize: 22 }}>🚛</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: isDark ? '#fb923c' : '#c2410c' }}>Эвакуатор</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f87171' }}>−${cT.toLocaleString()}</span>
              <span style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#6b7280' }}>⏱ ~{dT} мин</span>
            </button>
          )}
        </div>
      </div>
    );
  }
  // ═══ ПОЛОМКА — ремонт в процессе ═══
  if (isBreakdown && !awaitingRepair) {
    const outUntil = truck.outOfOrderUntil || 0;
    const minsLeft = Math.max(0, outUntil - gameMinute);
    const totalDelay = truck.breakdownDelayTow || truck.breakdownDelayRoadside || 120;
    return (
      <div style={ps} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 20 }}>⏳</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#fbbf24' }}>{truck.breakdownType || 'Ремонт'}</div>
            <div style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#6b7280', marginTop: 1 }}>📍 {truck.currentCity} • Осталось ~{minsLeft} мин</div>
          </div>
        </div>
        {outUntil > 0 && (
          <div style={{ height: 6, background: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #fbbf24, #4ade80)', width: `${Math.max(5, (1 - minsLeft / totalDelay) * 100)}%`, transition: 'width 1s ease' }} />
          </div>
        )}
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
    return (
      <div style={ps} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 20 }}>{wl >= 2 ? '😴' : '📋'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: wc }}>{wl >= 2 ? 'Долгий простой!' : 'Свободен — ищем груз'}</div>
            <div style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#6b7280', marginTop: 1 }}>📍 {truck.currentCity} • HOS: {hos.toFixed(1)}h</div>
          </div>
        </div>
        {wl >= 2 && (
          <div style={{ background: `${wc}12`, border: `1px solid ${wc}33`, borderRadius: 8, padding: '6px 10px' }}>
            <p style={{ fontSize: 11, color: isDark ? '#e2e8f0' : '#374151', margin: 0, lineHeight: 1.4 }}>💡 Откройте Load Board — найдите груз из {truck.currentCity}</p>
          </div>
        )}
      </div>
    );
  }
  // ═══ В ПУТИ ═══
  if (isMoving && truck.currentLoad) {
    const pp = Math.round(truck.progress * 100);
    const ld = truck.currentLoad;
    return (
      <div style={ps} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 20 }}>{truck.status === 'loaded' ? '🚚' : '🚛'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: isDark ? '#34d399' : '#16a34a' }}>{truck.status === 'loaded' ? 'Везёт груз' : 'К погрузке'} — {pp}%</div>
            <div style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#6b7280', marginTop: 1 }}>{ld.commodity} • {ld.miles} mi • ${ld.agreedRate.toLocaleString()}</div>
          </div>
        </div>
        <div style={{ height: 5, background: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${color}88, ${color})`, width: `${pp}%`, transition: 'width 0.8s ease' }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: isDark ? '#94a3b8' : '#6b7280', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', borderRadius: 6, padding: '2px 8px' }}>🏢 {ld.brokerCompany}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: isDark ? '#94a3b8' : '#6b7280', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', borderRadius: 6, padding: '2px 8px' }}>📦 {ld.equipment}</span>
        </div>
      </div>
    );
  }
  // ═══ ПОГРУЗКА / РАЗГРУЗКА ═══
  if (truck.status === 'at_pickup' || truck.status === 'at_delivery') {
    const isPU = truck.status === 'at_pickup';
    return (
      <div style={ps} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 20 }}>{isPU ? '📦' : '🏁'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: isPU ? '#fbbf24' : '#a78bfa' }}>{isPU ? 'На погрузке' : 'На разгрузке'}</div>
            <div style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#6b7280', marginTop: 1 }}>📍 {truck.currentCity}{truck.currentLoad ? ` • ${truck.currentLoad.commodity}` : ''}</div>
          </div>
        </div>
      </div>
    );
  }
  // ═══ СОБЫТИЯ (fallback) ═══
  if (events.length > 0) {
    return (
      <div style={ps} onClick={e => e.stopPropagation()}>
        {events.map(ev => (
          <div key={ev.id} style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: `1px solid ${URGENCY_COLOR[ev.urgency]}44`, borderRadius: 10, padding: '8px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
              <span style={{ fontSize: 14 }}>{URGENCY_ICON[ev.urgency]}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: isDark ? '#fff' : '#111827', flex: 1 }}>{ev.title}</span>
            </div>
            <p style={{ fontSize: 11, color: isDark ? '#cbd5e1' : '#4b5563', margin: '0 0 8px', lineHeight: 1.4 }}>{ev.message}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {ev.options.map(opt => {
                const bc = opt.outcome.isCorrect ? '#4ade80' : opt.outcome.moneyDelta >= 0 ? '#38bdf8' : '#f87171';
                return (
                  <button key={opt.id} onClick={e => { e.stopPropagation(); resolveEvent(ev.id, opt.id); }} style={actionBtn(bc)}
                    onMouseEnter={e => hov(e.currentTarget as HTMLElement, bc, true)}
                    onMouseLeave={e => hov(e.currentTarget as HTMLElement, bc, false)}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#e2e8f0' : '#1f2937', textAlign: 'center', lineHeight: 1.3 }}>{opt.text}</span>
                    {opt.outcome.moneyDelta !== 0 && <span style={{ fontSize: 10, fontWeight: 800, color: opt.outcome.moneyDelta > 0 ? '#4ade80' : '#f87171' }}>{opt.outcome.moneyDelta > 0 ? '+' : ''}{opt.outcome.moneyDelta.toLocaleString()}$</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }
  // ═══ ВСЁ ОК ═══
  return (
    <div style={{ ...ps, border: `1px solid ${color}44` }} onClick={e => e.stopPropagation()}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 14 }}>✅</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#4ade80' : '#16a34a' }}>Всё в порядке — следим за траком</span>
        <span style={{ fontSize: 14 }}>🎯</span>
      </div>
    </div>
  );
}

const TruckCardOverlay = memo(function TruckCardOverlay({ onTruckClick, selectedTruckId }: Props) {
  const trucks = useGameStore(s => s.trucks);
  const activeEvents = useGameStore(s => s.activeEvents);
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

  return (
    <>
      <style>{`
        .truck-card-scroll::-webkit-scrollbar{display:none}
        @keyframes dropdownSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes selectedPulse {
          0%, 100% { box-shadow: 0 0 0 0 var(--pulse-color); }
          50% { box-shadow: 0 0 12px 3px var(--pulse-color); }
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
      } as any}>
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

          return (
            <div key={truck.id} data-truck-card style={{
              flexShrink: 0, width: 300,
              display: 'flex', flexDirection: 'column',
            } as any}>
              {/* Карточка трака */}
              <div
                onClick={() => onTruckClick(truck)}
                style={{
                  width: '100%',
                  borderRadius: 16,
                  border: isSelected
                    ? `2.5px solid ${color}`
                    : `2px solid ${color}66`,
                  background: isDark ? 'rgba(15,20,35,0.92)' : 'rgba(255,255,255,0.94)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'row',
                  overflow: 'visible',
                  fontFamily: 'sans-serif',
                  boxShadow: isSelected
                    ? `0 0 16px ${color}44, -10px -2px 20px rgba(0,0,0,0.22)`
                    : isDark
                      ? '-10px -2px 20px rgba(0,0,0,0.22), -4px -1px 10px rgba(0,0,0,0.14)'
                      : '-10px -2px 20px rgba(0,0,0,0.09), -4px -1px 10px rgba(0,0,0,0.05)',
                  transform: isSelected ? 'translateY(-5px)' : 'translateY(-3px)',
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
                {/* Индикатор слежения */}
                {isSelected && (
                  <div style={{
                    position: 'absolute', top: -8, right: 10,
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: isDark ? 'rgba(15,20,35,0.95)' : 'rgba(255,255,255,0.95)',
                    border: `1.5px solid ${color}`,
                    borderRadius: 8, padding: '2px 8px',
                    zIndex: 2,
                  } as any}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: hasUrgent ? '#ef4444' : '#4ade80',
                      animation: 'trackingDot 1.2s ease-in-out infinite',
                    }} />
                    <span style={{ fontSize: 9, fontWeight: 800, color: isDark ? '#e2e8f0' : '#111827' }}>
                      {hasUrgent ? '⚠️ ВНИМАНИЕ' : '🎯 СЛЕЖЕНИЕ'}
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

                <div style={{ display:'flex', flexDirection:'row', width:'100%', borderRadius:14, overflow:'hidden' } as any}>
                  {/* ЛЕВЫЙ БЛОК — аватар */}
                  <div style={{
                    width: 80, flexShrink: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 4, padding: '8px 4px',
                    borderRight: `1px solid ${color}33`,
                    position: 'relative',
                  } as any}>
                    <img src={moodEmoji} width={20} height={20}
                      style={{ position: 'absolute', top: 4, right: 4 } as any} />
                    <img src={getDriverAvatar(truck.driver || truck.id)} width={52} height={52}
                      style={{ display: 'block' } as any} />
                    <div style={{
                      fontSize: 9, fontWeight: 700, color,
                      border: `1px solid ${color}44`, borderRadius: 5,
                      padding: '1px 5px', whiteSpace: 'nowrap',
                    } as any}>{statusLabel}</div>
                  </div>

                  {/* ПРАВЫЙ БЛОК — инфо */}
                  <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    padding: '7px 10px', gap: 3, minWidth: 0,
                  } as any}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as any}>
                      <span style={{ fontSize: 13, fontWeight: 900, color: isDark ? '#ffffff' : '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100 } as any}>
                        {driverName}
                      </span>
                      <div style={{ display: 'flex', gap: 3, flexShrink: 0 } as any}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: isDark ? '#38bdf8' : '#007aff', border: `1px solid ${isDark ? 'rgba(56,189,248,0.3)' : 'rgba(0,122,255,0.3)'}`, borderRadius: 4, padding: '1px 4px' } as any}>TRK {truckNum}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: isDark ? '#94a3b8' : '#6b7280', border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`, borderRadius: 4, padding: '1px 4px' } as any}>TRL {trailerNum}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 } as any}>
                      <span style={{ fontSize: 10 } as any}>📍</span>
                      {truck.destinationCity ? (
                        <span style={{ fontSize: 10, fontWeight: 700, color: isDark ? '#e2e8f0' : '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as any}>
                          {fromLabel}
                          <span style={{ color: isDark ? '#475569' : '#9ca3af', margin: '0 3px' } as any}>→</span>
                          <span style={{ color: isDark ? '#38bdf8' : '#007aff' } as any}>{toLabel}</span>
                        </span>
                      ) : (
                        <span style={{ fontSize: 10, fontWeight: 700, color: isDark ? '#94a3b8' : '#6b7280' } as any}>{fromLabel}</span>
                      )}
                    </div>

                    {isMoving && (
                      <div style={{ marginTop: 1 } as any}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 } as any}>
                          <span style={{ fontSize: 9, color: isDark ? '#64748b' : '#6b7280', fontWeight: 600 } as any}>Прогресс рейса</span>
                          <span style={{ fontSize: 9, fontWeight: 800, color } as any}>{progressPct}%</span>
                        </div>
                        <div style={{ height: 4, background: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb', borderRadius: 2, overflow: 'hidden' } as any}>
                          <div style={{ height: '100%', width: `${progressPct}%`, background: `linear-gradient(90deg,${color}88,${color})`, borderRadius: 2, transition: 'width 0.8s ease' } as any} />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 } as any}>
                      <div style={{ border: `1px solid ${hosColor}44`, borderRadius: 6, padding: '1px 6px', display: 'flex', alignItems: 'baseline', gap: 2 } as any}>
                        <span style={{ fontSize: 12, fontWeight: 900, color: hosColor } as any}>{hos.toFixed(1)}</span>
                        <span style={{ fontSize: 9, color: hosColor, opacity: 0.8 } as any}>h drive</span>
                      </div>
                      <span style={{ fontSize: 10 } as any}>😊</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: mood >= 60 ? (isDark ? '#34d399' : '#16a34a') : mood >= 35 ? '#fbbf24' : '#f87171' } as any}>{mood}%</span>
                      {truck.currentLoad ? (
                        <div style={{ marginLeft: 'auto', border: `1px solid ${isDark ? 'rgba(74,222,128,0.35)' : 'rgba(52,199,89,0.35)'}`, borderRadius: 6, padding: '1px 7px' } as any}>
                          <span style={{ fontSize: 13, fontWeight: 900, color: isDark ? '#4ade80' : '#16a34a' } as any}>${truck.currentLoad.agreedRate.toLocaleString()}</span>
                        </div>
                      ) : (
                        <div style={{ marginLeft: 'auto', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, borderRadius: 6, padding: '1px 7px' } as any}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: isDark ? '#475569' : '#9ca3af' } as any}>Нет груза</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Выпадающая панель под выбранной карточкой */}
              {isSelected && (
                <TruckDropdown truck={truck} events={truckEvents} isDark={isDark} />
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
    </>
  );
});

export default TruckCardOverlay;

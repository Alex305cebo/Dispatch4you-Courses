import React, { useRef, useEffect, memo } from 'react';
import { useGameStore } from '../store/gameStore';
import { CITY_STATE } from '../constants/config';

const FLUENT = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis';
const E = {
  pilot:     `${FLUENT}/People/Pilot.png`,
  sleeping:  `${FLUENT}/Smilies/Zzz.png`,
  explode:   `${FLUENT}/Smilies/Exploding%20Head.png`,
  tired:     `${FLUENT}/Smilies/Tired%20Face.png`,
  biceps:    `${FLUENT}/Smilies/Smiling%20Face%20with%20Sunglasses.png`,
  strstruck: `${FLUENT}/Smilies/Star-Struck.png`,
  happy:     `${FLUENT}/Smilies/Beaming%20Face%20with%20Smiling%20Eyes.png`,
  smile:     `${FLUENT}/Smilies/Slightly%20Smiling%20Face.png`,
  neutral:   `${FLUENT}/Smilies/Neutral%20Face.png`,
  worried:   `${FLUENT}/Smilies/Worried%20Face.png`,
  angry:     `${FLUENT}/Smilies/Angry%20Face.png`,
  rage:      `${FLUENT}/Smilies/Enraged%20Face.png`,
};

function getMoodEmoji(mood: number, status: string, truck?: any): string {
  if (truck && ((truck as any).onNightStop || (truck as any).hosRestUntilMinute > 0)) return E.sleeping;
  if (status === 'breakdown')   return E.explode;
  if (status === 'waiting')     return E.tired;
  if (status === 'at_pickup')   return E.biceps;
  if (status === 'at_delivery') return E.strstruck;
  if (mood >= 90) return E.strstruck;
  if (mood >= 75) return E.happy;
  if (mood >= 60) return E.smile;
  if (mood >= 45) return E.neutral;
  if (mood >= 30) return E.worried;
  if (mood >= 15) return E.angry;
  return E.rage;
}

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

function getTruckColor(truck: any): string {
  if ((truck as any).onNightStop || (truck as any).onMandatoryBreak) return '#64748b';
  if (truck.status === 'waiting') return '#64748b';
  if (truck.status === 'breakdown') return '#f87171';
  if (truck.status === 'idle') {
    const w = (truck as any).idleWarningLevel ?? 0;
    if (w === 3) return '#ef4444';
    if (w === 2) return '#fb923c';
    if (w === 1) return '#fbbf24';
  }
  return STATUS_COLOR[truck.status] || '#38bdf8';
}

interface Props {
  isWide: boolean;
  scrollPosRef: React.MutableRefObject<number>;
  onTruckClick: (truck: any) => void;
  selectedTruckId: string | null;
  indicatorNotifications: Record<string, { text: string }>;
  gameMinute: number;
}

const TruckStripComponent = memo(function TruckStripComponent({
  isWide, scrollPosRef, onTruckClick, selectedTruckId, indicatorNotifications, gameMinute,
}: Props) {
  const trucks = useGameStore(s => s.trucks);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftRef = useRef(0);
  const isTouchDragging = useRef(false);

  // Restore scroll position
  useEffect(() => {
    if (scrollRef.current && scrollPosRef.current > 0) {
      scrollRef.current.scrollLeft = scrollPosRef.current;
    }
  });

  // Touch events (passive: false for preventDefault)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let sx = 0, sl = 0;
    const onTouchStart = (e: TouchEvent) => { isTouchDragging.current = false; sx = e.touches[0].clientX; sl = el.scrollLeft; };
    const onTouchMove = (e: TouchEvent) => {
      const dx = sx - e.touches[0].clientX;
      if (Math.abs(dx) > 5) { isTouchDragging.current = true; e.preventDefault(); el.scrollLeft = sl + dx; scrollPosRef.current = el.scrollLeft; }
    };
    const onTouchEnd = () => setTimeout(() => { isTouchDragging.current = false; }, 50);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => { el.removeEventListener('touchstart', onTouchStart); el.removeEventListener('touchmove', onTouchMove); el.removeEventListener('touchend', onTouchEnd); };
  }, []);

  return (
    <div
      ref={scrollRef}
      style={{
        display: 'flex', overflowX: 'auto', gap: 8,
        padding: isWide ? '8px 10px' : '7px 10px',
        background: 'transparent', borderBottom: 'none',
        scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-x', msOverflowStyle: 'none',
        cursor: 'grab', overscrollBehavior: 'contain',
      } as any}
      onMouseDown={e => {
        if (!scrollRef.current) return;
        isDragging.current = true;
        startX.current = e.pageX - scrollRef.current.offsetLeft;
        scrollLeftRef.current = scrollRef.current.scrollLeft;
        scrollRef.current.style.cursor = 'grabbing';
      }}
      onMouseMove={e => {
        if (!isDragging.current || !scrollRef.current) return;
        e.preventDefault();
        const walk = (e.pageX - scrollRef.current.offsetLeft - startX.current) * 2;
        scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
        scrollPosRef.current = scrollRef.current.scrollLeft;
      }}
      onMouseUp={() => { isDragging.current = false; if (scrollRef.current) scrollRef.current.style.cursor = 'grab'; }}
      onMouseLeave={() => { isDragging.current = false; if (scrollRef.current) scrollRef.current.style.cursor = 'grab'; }}
    >
      {trucks.map(truck => {
        const color = getTruckColor(truck);
        const hos = Math.max(0, truck.hoursLeft);
        const hosColor = hos < 2 ? '#f87171' : hos < 4 ? '#fbbf24' : '#34d399';
        const isSelected = selectedTruckId === truck.id;
        const isMoving = truck.status === 'driving' || truck.status === 'loaded';
        const isAlert = (truck as any).idleWarningLevel > 0 || truck.status === 'breakdown';
        const progressPct = Math.round(truck.progress * 100);
        const mood = truck.mood ?? 80;
        const moodEmoji = getMoodEmoji(mood, truck.status, truck);
        const idNum = parseInt(truck.id.replace(/\D/g, '')) || 1;
        const truckNum = String(((idNum * 317 + 100) % 900) + 100);
        const trailerNum = String(((idNum * 491 + 200) % 900) + 100);
        const driverFullName = truck.driver || truck.name;
        const fromSt = CITY_STATE[truck.currentCity] || '';
        const toSt = truck.destinationCity ? (CITY_STATE[truck.destinationCity] || '') : '';
        const fromLabel = fromSt ? `${truck.currentCity}, ${fromSt}` : truck.currentCity;
        const toLabel = toSt ? `${truck.destinationCity}, ${toSt}` : (truck.destinationCity || '');
        const statusLabel = (truck as any).onNightStop ? '🌙 Ночёвка' : (truck as any).hosRestUntilMinute > 0 ? '😴 HOS отдых' : STATUS_LABEL[truck.status];
        const CARD_H = isWide ? 120 : 100;
        const AVATAR_W = isWide ? 90 : 76;
        const r = parseInt(color.slice(1,3),16), g = parseInt(color.slice(3,5),16), b = parseInt(color.slice(5,7),16);

        return (
          <div key={truck.id} style={{ position: 'relative', flexShrink: 0 } as any}>
            {indicatorNotifications[truck.id] && (
              <div style={{
                position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                marginBottom: 6, zIndex: 10, background: 'rgba(15,23,42,0.95)',
                border: '1px solid rgba(6,182,212,0.5)', borderRadius: 8, padding: '4px 8px',
                fontSize: 11, fontWeight: 700, color: '#67e8f9', whiteSpace: 'nowrap',
                pointerEvents: 'none', boxShadow: '0 2px 12px rgba(6,182,212,0.25)',
              } as any}>{indicatorNotifications[truck.id].text}</div>
            )}
            <div
              onClick={() => { if (!isDragging.current && !isTouchDragging.current) onTruckClick(truck); }}
              style={{
                width: isWide ? 360 : 290, height: CARD_H, borderRadius: 16,
                background: isSelected ? `linear-gradient(135deg,rgba(${r},${g},${b},0.14),rgba(8,14,28,0.98))` : 'rgba(8,14,28,0.95)',
                border: `2px solid ${isSelected ? color : isAlert ? color+'99' : 'rgba(255,255,255,0.1)'}`,
                boxShadow: isSelected ? `0 0 0 1px ${color}44,0 8px 32px rgba(0,0,0,0.6)` : '0 4px 20px rgba(0,0,0,0.5)',
                cursor: 'pointer', fontFamily: 'sans-serif',
                display: 'flex', flexDirection: 'row', overflow: 'hidden', transition: 'border 0.2s',
              } as any}
            >
              {/* ЛЕВЫЙ БЛОК */}
              <div style={{
                width: AVATAR_W, flexShrink: 0,
                background: `linear-gradient(180deg,rgba(${r},${g},${b},0.2),rgba(4,8,20,0.95))`,
                borderRight: `1px solid ${color}33`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 4, position: 'relative',
              } as any}>
                <div style={{ position: 'absolute', top: 5, right: 5 } as any}>
                  <img src={moodEmoji} width={22} height={22} style={{ display: 'block' } as any} />
                </div>
                <img src={E.pilot} width={isWide ? 62 : 52} height={isWide ? 62 : 52}
                  style={{ imageRendering: 'auto', display: 'block', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' } as any} />
                <div style={{
                  fontSize: isWide ? 10 : 9, fontWeight: 700, color, background: `${color}22`,
                  border: `1px solid ${color}44`, borderRadius: 5, padding: '1px 6px', whiteSpace: 'nowrap',
                } as any}>{statusLabel}</div>
              </div>

              {/* ПРАВЫЙ БЛОК */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: isWide ? '8px 12px' : '6px 10px', gap: 0, minWidth: 0 } as any}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 } as any}>
                  <span style={{ fontSize: isWide ? 15 : 13, fontWeight: 900, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as any}>{driverFullName}</span>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 6 } as any}>
                    <span style={{ fontSize: isWide ? 10 : 9, fontWeight: 700, color: '#38bdf8', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 4, padding: '1px 5px' } as any}>TRK {truckNum}</span>
                    <span style={{ fontSize: isWide ? 10 : 9, fontWeight: 700, color: '#94a3b8', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, padding: '1px 5px' } as any}>TRL {trailerNum}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '3px 7px', marginBottom: 4 } as any}>
                  <span style={{ fontSize: 10, color: '#64748b', flexShrink: 0 } as any}>📍</span>
                  {truck.destinationCity ? (
                    <span style={{ fontSize: isWide ? 11 : 10, fontWeight: 700, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as any}>
                      {fromLabel}<span style={{ color: '#475569', margin: '0 4px' } as any}>→</span><span style={{ color: '#38bdf8' } as any}>{toLabel}</span>
                    </span>
                  ) : (
                    <span style={{ fontSize: isWide ? 11 : 10, fontWeight: 700, color: '#94a3b8' } as any}>{fromLabel}</span>
                  )}
                </div>
                <div style={{ marginBottom: 4 } as any}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 } as any}>
                    <span style={{ fontSize: 9, color: '#64748b', fontWeight: 600 } as any}>
                      {isMoving ? 'Прогресс рейса' : truck.status === 'at_pickup' ? 'Погрузка' : truck.status === 'at_delivery' ? 'Разгрузка' : 'Ожидание'}
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 800, color: isMoving ? color : '#64748b' } as any}>{isMoving ? `${progressPct}%` : '—'}</span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' } as any}>
                    <div style={{ height: '100%', width: isMoving ? `${progressPct}%` : '0%', background: `linear-gradient(90deg,${color}66,${color})`, borderRadius: 3, transition: 'width 0.8s ease' } as any} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 } as any}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, background: `${hosColor}15`, border: `1px solid ${hosColor}44`, borderRadius: 6, padding: '2px 6px' } as any}>
                    <span style={{ fontSize: isWide ? 13 : 12, fontWeight: 900, color: hosColor, lineHeight: 1 } as any}>{hos.toFixed(1)}</span>
                    <span style={{ fontSize: 9, fontWeight: 600, color: hosColor, opacity: 0.8 } as any}>h drive</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 } as any}>
                    <span style={{ fontSize: 11 } as any}>😊</span>
                    <span style={{ fontSize: isWide ? 12 : 11, fontWeight: 800, color: mood >= 60 ? '#34d399' : mood >= 35 ? '#fbbf24' : '#f87171' } as any}>{mood}%</span>
                  </div>
                  {truck.currentLoad ? (
                    <div style={{ marginLeft: 'auto', flexShrink: 0, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 6, padding: '2px 7px' } as any}>
                      <span style={{ fontSize: isWide ? 14 : 13, fontWeight: 900, color: '#4ade80' } as any}>${truck.currentLoad.agreedRate.toLocaleString()}</span>
                    </div>
                  ) : (
                    <div style={{ marginLeft: 'auto', flexShrink: 0, background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 6, padding: '2px 7px' } as any}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#475569' } as any}>Нет груза</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Купить трак */}
      <div
        onClick={() => {}}
        style={{ minWidth: isWide ? 90 : 78, flexShrink: 0, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(56,189,248,0.25)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } as any}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(6,182,212,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(56,189,248,0.6)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(56,189,248,0.25)'; }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 6px' } as any}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(56,189,248,0.12)', border: '1.5px solid rgba(56,189,248,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#38bdf8' } as any}>+</div>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#38bdf8', textAlign: 'center', lineHeight: 1.3 } as any}>Купить{'\n'}трак</span>
        </div>
      </div>
    </div>
  );
});

export default TruckStripComponent;

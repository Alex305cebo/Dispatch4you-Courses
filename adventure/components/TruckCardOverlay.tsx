// Карточки траков поверх карты — без фона, только карточки
import React, { memo } from 'react';
import { useGameStore } from '../store/gameStore';
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

const TruckCardOverlay = memo(function TruckCardOverlay({ onTruckClick, selectedTruckId }: Props) {
  const trucks = useGameStore(s => s.trucks);
  const { mode: themeMode } = useThemeStore();
  const isDark = themeMode === 'dark';

  return (
    <div className="truck-card-scroll" style={{
      display: 'flex',
      flexDirection: 'row',
      gap: 8,
      padding: '6px 10px',
      overflowX: 'auto',
      overflowY: 'hidden',
      background: 'transparent',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      WebkitOverflowScrolling: 'touch',
      touchAction: 'pan-x',
    } as any}>
      <style>{`.truck-card-scroll::-webkit-scrollbar{display:none}`}</style>
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
        const statusLabel = truck.onNightStop ? '🌙 Ночёвка' : STATUS_LABEL[truck.status] || truck.status;

        return (
          <div
            key={truck.id}
            onClick={() => onTruckClick(truck)}
            style={{
              flexShrink: 0,
              width: 300,
              borderRadius: 16,
              border: `2px solid ${isSelected ? color : color + '66'}`,
              background: isDark ? 'rgba(15,20,35,0.92)' : 'rgba(255,255,255,0.94)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'row',
              overflow: 'hidden',
              fontFamily: 'sans-serif',
              boxShadow: isSelected
                ? `0 0 16px ${color}55`
                : isDark ? '0 2px 12px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'border 0.2s, box-shadow 0.2s',
            } as any}
          >
            {/* ЛЕВЫЙ БЛОК — аватар */}
            <div style={{
              width: 80, flexShrink: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 4, padding: '8px 4px',
              borderRight: `1px solid ${color}33`,
              position: 'relative',
            } as any}>
              {/* Эмодзи настроения */}
              <img src={moodEmoji} width={20} height={20}
                style={{ position: 'absolute', top: 4, right: 4 } as any} />
              {/* Аватар */}
              <img src={getDriverAvatar(truck.id)} width={52} height={52}
                style={{ display: 'block', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))' } as any} />
              {/* Статус */}
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
              {/* Имя + номера */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as any}>
                <span style={{ fontSize: 13, fontWeight: 900, color: isDark ? '#ffffff' : '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100 } as any}>
                  {driverName}
                </span>
                <div style={{ display: 'flex', gap: 3, flexShrink: 0 } as any}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: isDark ? '#38bdf8' : '#007aff', border: `1px solid ${isDark ? 'rgba(56,189,248,0.3)' : 'rgba(0,122,255,0.3)'}`, borderRadius: 4, padding: '1px 4px' } as any}>TRK {truckNum}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: isDark ? '#94a3b8' : '#6b7280', border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`, borderRadius: 4, padding: '1px 4px' } as any}>TRL {trailerNum}</span>
                </div>
              </div>

              {/* Маршрут */}
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

              {/* Прогресс */}
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

              {/* HOS + настроение + ставка */}
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
        );
      })}

      {/* Купить трак */}
      <div style={{
        flexShrink: 0, width: 72, borderRadius: 12,
        border: `2px dashed ${isDark ? 'rgba(56,189,248,0.25)' : 'rgba(0,122,255,0.25)'}`,
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,122,255,0.04)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 4, padding: '8px 4px', cursor: 'pointer',
      } as any}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(6,182,212,0.08)' : 'rgba(0,122,255,0.1)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,122,255,0.04)'; }}
      >
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: isDark ? 'rgba(56,189,248,0.12)' : 'rgba(0,122,255,0.1)', border: `1.5px solid ${isDark ? 'rgba(56,189,248,0.35)' : 'rgba(0,122,255,0.35)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: isDark ? '#38bdf8' : '#007aff' } as any}>+</div>
        <span style={{ fontSize: 9, fontWeight: 700, color: isDark ? '#38bdf8' : '#007aff', textAlign: 'center', lineHeight: 1.3 } as any}>Купить{'\n'}трак</span>
      </div>
    </div>
  );
});

export default TruckCardOverlay;

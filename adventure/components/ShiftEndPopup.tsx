import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useThemeStore } from '../store/themeStore';

function calcGrade(profit: number, truckCount: number) {
  const perTruck = truckCount > 0 ? profit / truckCount : 0;
  if (perTruck >= 4000) return { grade: 'S', color: '#fbbf24', emoji: '🏆', label: 'Легенда!' };
  if (perTruck >= 2500) return { grade: 'A', color: '#4ade80', emoji: '🥇', label: 'Отличная работа!' };
  if (perTruck >= 1500) return { grade: 'B', color: '#38bdf8', emoji: '🥈', label: 'Хороший результат.' };
  if (perTruck >= 500)  return { grade: 'C', color: '#fb923c', emoji: '🥉', label: 'Неплохо, но можно лучше.' };
  return { grade: 'D', color: '#f87171', emoji: '📚', label: 'Нужна практика.' };
}

/** Итоги недели — инлайн под strip карточек траков, в стиле DeliveryInlineResult */
export default function ShiftEndPopup({ isDark: isDarkProp }: { isDark?: boolean }) {
  const { mode } = useThemeStore();
  const isDark = isDarkProp ?? mode === 'dark';

  const {
    phase, totalEarned, totalLost, reputation, financeLog,
    trucks, score, sessionName, day, endShift,
  } = useGameStore();

  const [show, setShow] = useState(false);
  const [tab, setTab] = useState<'stats' | 'trucks'>('stats');

  useEffect(() => {
    if (phase === 'shift_end') {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [phase]);

  if (!show) return null;

  const profit = totalEarned - totalLost;
  const truckCount = trucks.length;
  const { grade, color, emoji, label } = calcGrade(profit, truckCount);
  const perTruck = truckCount > 0 ? Math.round(profit / truckCount) : 0;
  const deliveries = financeLog.filter(f => f.type === 'income' && f.description.includes('Delivery')).length;
  const totalMiles = trucks.reduce((sum, t) => sum + (t.totalMiles || 0), 0);

  const BG     = isDark ? 'rgba(13,17,23,0.97)' : 'rgba(255,255,255,0.97)';
  const SURF   = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const BORDER = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const TEXT1  = isDark ? '#e2e8f0' : '#111827';
  const TEXT2  = isDark ? '#94a3b8' : '#6b7280';

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        marginTop: 6, width: '100%',
        background: BG,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: `2px solid ${color}44`,
        borderRadius: 14,
        overflow: 'hidden',
        animation: 'dropdownSlide 0.3s ease',
        boxShadow: isDark ? `0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px ${color}22` : '0 4px 16px rgba(0,0,0,0.12)',
      } as any}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 10px',
        background: `${color}12`,
        borderBottom: `1px solid ${color}22`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 18 }}>{emoji}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: TEXT1 }}>Неделя завершена!</div>
            <div style={{ fontSize: 10, color: TEXT2 }}>{sessionName || 'Сессия'} · Неделя {Math.ceil(day / 7)} · {truckCount} траков</div>
          </div>
        </div>
        {/* Grade badge */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          border: `2px solid ${color}`,
          background: `${color}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 12px ${color}33`,
        }}>
          <span style={{ fontSize: 14, fontWeight: 900, color }}>{grade}</span>
        </div>
      </div>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 10px', borderBottom: `1px solid ${BORDER}` }}>
        {[
          { label: 'ДОХОД',    val: `$${totalEarned.toLocaleString()}`,  color: '#38bdf8' },
          { label: 'РАСХОДЫ',  val: `-$${totalLost.toLocaleString()}`,   color: '#f87171' },
          { label: 'НА ТРАК',  val: `$${perTruck.toLocaleString()}`,     color },
          { label: 'РЕПУТАЦИЯ', val: `${reputation}%`, color: reputation > 70 ? '#4ade80' : '#fbbf24' },
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

      {/* Profit bar */}
      <div style={{
        margin: '0 10px 0', padding: '6px 8px',
        background: profit >= 0 ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
        border: `1px solid ${profit >= 0 ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
        borderRadius: 8, marginTop: 8,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      } as any}>
        <span style={{ fontSize: 11, fontWeight: 800, color: TEXT1 }}>💰 Чистая прибыль</span>
        <span style={{ fontSize: 15, fontWeight: 900, color: profit >= 0 ? '#4ade80' : '#f87171' }}>
          {profit >= 0 ? '+' : ''}${profit.toLocaleString()}
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${BORDER}`, marginTop: 8 }}>
        {[{ key: 'stats', label: '📊 Итоги' }, { key: 'trucks', label: '🚛 Траки' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)} style={{
            flex: 1, padding: '6px 4px', border: 'none', cursor: 'pointer',
            background: 'transparent',
            borderBottom: `2px solid ${tab === t.key ? '#06b6d4' : 'transparent'}`,
            color: tab === t.key ? '#06b6d4' : TEXT2,
            fontSize: 11, fontWeight: 700,
          }}>{t.label}</button>
        ))}
      </div>

      {/* Stats tab */}
      {tab === 'stats' && (
        <div style={{ padding: '8px 10px' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { label: 'Очки',      val: score.toString(),              color: '#38bdf8' },
              { label: 'Доставки',  val: deliveries.toString(),         color: '#5ac8fa' },
              { label: 'Мили',      val: totalMiles.toLocaleString(),   color: '#a78bfa' },
            ].map(c => (
              <div key={c.label} style={{
                flex: 1, background: SURF, border: `1px solid ${BORDER}`,
                borderRadius: 8, padding: '5px 4px', textAlign: 'center',
              } as any}>
                <div style={{ fontSize: 8, color: TEXT2, fontWeight: 700, marginBottom: 2 }}>{c.label}</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: c.color }}>{c.val}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color, textAlign: 'center', marginTop: 8, fontWeight: 700 } as any}>
            {label}
          </div>
        </div>
      )}

      {/* Trucks tab */}
      {tab === 'trucks' && (
        <div style={{ padding: '6px 10px', maxHeight: 140, overflowY: 'auto' as any }}>
          {trucks.map(truck => (
            <div key={truck.id} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 6px', marginBottom: 3,
              background: SURF, border: `1px solid ${BORDER}`, borderRadius: 8,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: TEXT1 }}>{truck.name}</div>
                <div style={{ fontSize: 9, color: TEXT2 }}>{truck.driver}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: TEXT2, fontWeight: 700 }}>{(truck.totalMiles || 0).toLocaleString()} mi</div>
                <div style={{ fontSize: 9, color: TEXT2 }}>{truck.totalDeliveries || 0} доставок</div>
              </div>
              <div style={{
                padding: '2px 5px', borderRadius: 5,
                background: (truck.safetyScore || 100) >= 90 ? 'rgba(74,222,128,0.15)' : 'rgba(251,191,36,0.15)',
              }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: (truck.safetyScore || 100) >= 90 ? '#4ade80' : '#fbbf24' }}>
                  {truck.safetyScore || 100}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 10px' }}>
        <button onClick={endShift} style={{
          flex: 2, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #4ade80, #16a34a)',
          color: '#fff', fontSize: 12, fontWeight: 900,
          boxShadow: '0 2px 8px rgba(74,222,128,0.35)',
        }}>🔄 Новая неделя</button>
        <button onClick={() => { useGameStore.getState().clearSave(); window.location.href = '/game/'; }} style={{
          flex: 1, padding: '8px 0', borderRadius: 8, cursor: 'pointer',
          background: SURF, border: `1px solid ${BORDER}`,
          color: TEXT2, fontSize: 11, fontWeight: 700,
        }}>🏠 Меню</button>
      </div>
    </div>
  );
}

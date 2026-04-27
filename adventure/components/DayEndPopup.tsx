import React, { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useTheme } from '../hooks/useTheme';

/** Итоги дня — инлайн под strip карточек траков, в стиле DeliveryInlineResult */
export default function DayEndPopup({ isDark }: { isDark: boolean }) {
  const T = useTheme();
  const {
    phase, reputation, financeLog, trucks, sessionName, day, endShift,
  } = useGameStore();

  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (phase === 'day_end') {
      setFading(false);
      setVisible(true);
      timerRef.current = setTimeout(() => {
        setFading(true);
        fadeRef.current = setTimeout(() => setVisible(false), 500);
      }, 4000);
    } else {
      setVisible(false);
      setFading(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (fadeRef.current)  clearTimeout(fadeRef.current);
    };
  }, [phase]);

  function handleContinue() {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (fadeRef.current)  clearTimeout(fadeRef.current);
    setFading(true);
    fadeRef.current = setTimeout(() => {
      setVisible(false);
      endShift();
    }, 300);
  }

  if (!visible) return null;

  const todayFinance = financeLog.filter(f => f.minute >= (day - 1) * 720 && f.minute < day * 720);
  const todayIncome  = todayFinance.filter(f => f.type === 'income').reduce((s, f) => s + f.amount, 0);
  const todayExpense = todayFinance.filter(f => f.type === 'expense').reduce((s, f) => s + f.amount, 0);
  const todayProfit  = todayIncome - todayExpense;
  const profitColor  = todayProfit >= 0 ? '#4ade80' : '#f87171';
  const daysLeft     = 7 - day;

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
        border: `2px solid rgba(6,182,212,0.35)`,
        borderRadius: 14,
        overflow: 'hidden',
        animation: 'dropdownSlide 0.3s ease',
        boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(6,182,212,0.15)' : '0 4px 16px rgba(0,0,0,0.12)',
        opacity: fading ? 0 : 1,
        transform: fading ? 'translateY(-6px) scale(0.98)' : 'translateY(0) scale(1)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        pointerEvents: fading ? 'none' : 'auto',
      } as any}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 10px',
        background: 'rgba(6,182,212,0.1)',
        borderBottom: `1px solid rgba(6,182,212,0.2)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>🌙</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: TEXT1 }}>Рабочий день завершён!</div>
            <div style={{ fontSize: 10, color: TEXT2 }}>День {day} · {sessionName || 'Сессия'} · {trucks.length} траков</div>
          </div>
        </div>
        {/* Таймер-кольцо */}
        <div style={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
          <svg width="28" height="28" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
            <circle cx="14" cy="14" r="11" fill="none" stroke="#06b6d4" strokeWidth="2.5"
              strokeDasharray={`${2 * Math.PI * 11}`} strokeDashoffset="0" strokeLinecap="round"
              style={{ animation: fading ? 'none' : 'timerDrain4s 4s linear forwards' }} />
          </svg>
          <span style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 8, fontWeight: 800, color: '#06b6d4',
          }}>4s</span>
        </div>
      </div>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 10px', borderBottom: `1px solid ${BORDER}` }}>
        {[
          { label: 'ДОХОД',    val: `$${todayIncome.toLocaleString()}`,  color: '#38bdf8' },
          { label: 'РАСХОДЫ',  val: `-$${todayExpense.toLocaleString()}`, color: '#f87171' },
          { label: 'ПРИБЫЛЬ',  val: `${todayProfit >= 0 ? '+' : ''}$${todayProfit.toLocaleString()}`, color: profitColor },
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

      {/* Trucks row */}
      <div style={{ padding: '6px 10px', borderBottom: `1px solid ${BORDER}` }}>
        {trucks.map(truck => {
          const miles = (truck.totalMiles || 0) - ((truck as any).yesterdayMiles || 0);
          return (
            <div key={truck.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: TEXT1, flex: 1 }}>{truck.name}</span>
              <span style={{ fontSize: 9, color: TEXT2 }}>{miles.toLocaleString()} mi</span>
              <div style={{
                padding: '1px 5px', borderRadius: 5,
                background: (truck.safetyScore || 100) >= 90 ? 'rgba(74,222,128,0.15)' : 'rgba(251,191,36,0.15)',
              }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: (truck.safetyScore || 100) >= 90 ? '#4ade80' : '#fbbf24' }}>
                  {truck.safetyScore || 100}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px' }}>
        <span style={{ flex: 1, fontSize: 10, color: '#06b6d4', fontWeight: 600 }}>
          💡 До конца смены: {daysLeft} {daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}
        </span>
        <button onClick={handleContinue} style={{
          padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
          color: '#fff', fontSize: 12, fontWeight: 800,
          boxShadow: '0 2px 8px rgba(6,182,212,0.35)', flexShrink: 0,
        }}>✅ Продолжить</button>
      </div>

      <style>{`
        @keyframes timerDrain4s {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: ${2 * Math.PI * 11}; }
        }
      `}</style>
    </div>
  );
}

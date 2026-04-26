import React from 'react';
import { useGameStore } from '../store/gameStore';
import { useTheme } from '../hooks/useTheme';

/** Компактный баннер итогов дня — рендерится под карточками траков */
export default function DayEndPopup({ isDark }: { isDark: boolean }) {
  const T = useTheme();
  const {
    phase, reputation, financeLog, trucks, sessionName, day,
  } = useGameStore();

  if (phase !== 'day_end') return null;

  const todayFinance = financeLog.filter(f => f.minute >= (day - 1) * 720 && f.minute < day * 720);
  const todayIncome = todayFinance.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
  const todayExpense = todayFinance.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);
  const todayProfit = todayIncome - todayExpense;
  const profitColor = todayProfit >= 0 ? T.success : T.danger;

  const BG     = isDark ? 'rgba(13,17,23,0.97)' : 'rgba(255,255,255,0.97)';
  const BORDER = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const TEXT1  = isDark ? '#e2e8f0' : '#111827';
  const TEXT2  = isDark ? '#94a3b8' : '#6b7280';

  return (
    <div style={{
      margin: '6px 0 4px',
      background: BG,
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      border: `2px solid rgba(6,182,212,0.3)`,
      borderRadius: 16,
      overflow: 'hidden',
      animation: 'dropdownSlide 0.4s ease',
      boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.12)',
    } as any}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(14,165,233,0.06))',
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🌙</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: TEXT1 }}>Рабочий день завершён!</div>
            <div style={{ fontSize: 11, color: TEXT2 }}>Итоги дня {day} · {sessionName || 'Сессия'} · {trucks.length} траков</div>
          </div>
        </div>
      </div>

      {/* Stats — 2 ряда по 2 карточки как в ремонте */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        padding: '12px 14px',
        borderBottom: `1px solid ${BORDER}`,
      } as any}>
        {/* Доход */}
        <div style={{
          background: `${T.success}12`,
          border: `1px solid ${T.success}30`,
          borderRadius: 12,
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          minHeight: 70,
        } as any}>
          <div style={{
            fontSize: 11,
            color: TEXT2,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>Доход</div>
          <div style={{
            fontSize: 20,
            fontWeight: 900,
            color: T.success,
            lineHeight: 1,
          }}>${todayIncome.toLocaleString()}</div>
        </div>

        {/* Расходы */}
        <div style={{
          background: `${T.danger}12`,
          border: `1px solid ${T.danger}30`,
          borderRadius: 12,
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          minHeight: 70,
        } as any}>
          <div style={{
            fontSize: 11,
            color: TEXT2,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>Расходы</div>
          <div style={{
            fontSize: 20,
            fontWeight: 900,
            color: T.danger,
            lineHeight: 1,
          }}>-${todayExpense.toLocaleString()}</div>
        </div>

        {/* Прибыль */}
        <div style={{
          background: `${profitColor}12`,
          border: `1px solid ${profitColor}30`,
          borderRadius: 12,
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          minHeight: 70,
        } as any}>
          <div style={{
            fontSize: 11,
            color: TEXT2,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>Прибыль</div>
          <div style={{
            fontSize: 20,
            fontWeight: 900,
            color: profitColor,
            lineHeight: 1,
          }}>{todayProfit >= 0 ? '+' : ''}${todayProfit.toLocaleString()}</div>
        </div>

        {/* Репутация */}
        <div style={{
          background: reputation > 70 ? `${T.success}12` : `${T.warning}12`,
          border: reputation > 70 ? `1px solid ${T.success}30` : `1px solid ${T.warning}30`,
          borderRadius: 12,
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          minHeight: 70,
        } as any}>
          <div style={{
            fontSize: 11,
            color: TEXT2,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>Репутация</div>
          <div style={{
            fontSize: 20,
            fontWeight: 900,
            color: reputation > 70 ? T.success : T.warning,
            lineHeight: 1,
          }}>{reputation}%</div>
        </div>
      </div>

      {/* Trucks */}
      <div style={{ padding: '8px 14px', borderBottom: `1px solid ${BORDER}` }}>
        {trucks.map(truck => {
          const miles = (truck.totalMiles || 0) - ((truck as any).yesterdayMiles || 0);
          return (
            <div key={truck.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '4px 0',
            }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: TEXT1 }}>{truck.name}</span>
                <span style={{ fontSize: 10, color: TEXT2, marginLeft: 6 }}>{truck.driver}</span>
              </div>
              <span style={{ fontSize: 10, color: TEXT2 }}>{miles.toLocaleString()} mi</span>
              <div style={{
                padding: '2px 6px', borderRadius: 6,
                background: (truck.safetyScore || 100) >= 90 ? 'rgba(74,222,128,0.15)' : 'rgba(251,191,36,0.15)',
              }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: (truck.safetyScore || 100) >= 90 ? T.success : T.warning }}>
                  {truck.safetyScore || 100}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info + Button */}
      <div style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, fontSize: 11, color: '#06b6d4', fontWeight: 600 }}>
          💡 Смена завершится через {7 - day} {7 - day === 1 ? 'день' : 'дней'}
        </div>
        <button
          onClick={() => useGameStore.getState().endShift()}
          style={{
            padding: '8px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            color: '#fff', fontSize: 13, fontWeight: 800,
            boxShadow: '0 3px 12px rgba(6,182,212,0.35)',
            flexShrink: 0,
          }}
        >✅ Продолжить</button>
      </div>
    </div>
  );
}

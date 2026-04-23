import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Colors } from '../constants/colors';
import { useTheme } from '../hooks/useTheme';

/* ── Дневной отчёт (конец рабочего дня) ── */
export default function DayEndPopup() {
  const T = useTheme();
  const {
    phase, balance, totalEarned, totalLost, reputation, financeLog,
    trucks, score, sessionName, day, gameMinute,
  } = useGameStore();

  const [show, setShow] = useState(false);
  const [animStage, setAnimStage] = useState(0);

  useEffect(() => {
    if (phase === 'day_end') {
      setShow(true);
      setTimeout(() => setAnimStage(1), 50);
      setTimeout(() => setAnimStage(2), 200);
      setTimeout(() => setAnimStage(3), 500);
    } else {
      setAnimStage(0);
      setTimeout(() => setShow(false), 400);
    }
  }, [phase]);

  if (!show) return null;

  // Подсчёт реальных данных за день
  const todayFinance = financeLog.filter(f => f.minute >= (day - 1) * 720 && f.minute < day * 720);
  const todayIncome = todayFinance.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
  const todayExpense = todayFinance.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);
  const todayProfit = todayIncome - todayExpense;

  // Доставки за день — считаем по financeLog с описанием "Delivery payment"
  const todayDeliveries = todayFinance.filter(f => 
    f.type === 'income' && f.description.includes('Delivery')
  ).length;

  // Мили за день — считаем по трекам (разница между текущими и вчерашними)
  const todayMiles = trucks.reduce((sum, t) => {
    const yesterdayMiles = (t as any).yesterdayMiles || 0;
    const currentMiles = t.totalMiles || 0;
    return sum + (currentMiles - yesterdayMiles);
  }, 0);

  const handleContinue = () => {
    useGameStore.getState().endShift();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>

      {/* BACKDROP */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        opacity: animStage >= 1 ? 1 : 0,
        transition: 'opacity 0.4s ease',
      } as any} />

      {/* CARD */}
      <div style={{
        position: 'relative',
        width: '90%', maxWidth: 420,
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#ffffff',
        border: '1px solid rgba(6,182,212,0.3)',
        borderRadius: 24,
        boxShadow: '0 0 40px rgba(6,182,212,0.2), 0 20px 60px rgba(0,0,0,0.15)',
        opacity: animStage >= 2 ? 1 : 0,
        transform: animStage >= 2 ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(30px)',
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        scrollbarWidth: 'none',
      } as any}>

        {/* Glow top */}
        <div style={{
          position: 'absolute', top: -1, left: '10%', right: '10%', height: 2,
          background: 'linear-gradient(90deg, transparent, #06b6d4, transparent)',
          borderRadius: 2,
        } as any} />

        <div style={{ padding: '20px 20px 16px' }}>

          {/* ── HEADER ── */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            opacity: animStage >= 3 ? 1 : 0,
            transform: animStage >= 3 ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease 0.1s',
          } as any}>
            <div style={{ fontSize: 36, marginBottom: 6, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>🌙</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#111827', marginBottom: 3 }}>
              Рабочий день завершён!
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>
              Итоги дня {day}
            </div>
            <div style={{
              fontSize: 11, color: '#007aff', fontWeight: 700,
              background: 'rgba(0,122,255,0.08)', padding: '3px 12px', borderRadius: 10,
              border: '1px solid rgba(0,122,255,0.2)',
            }}>
              {sessionName || 'Сессия'} · {trucks.length} траков
            </div>
          </div>

          {/* ── MAIN STATS GRID ── */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            gap: 6, marginTop: 12,
            opacity: animStage >= 3 ? 1 : 0,
            transform: animStage >= 3 ? 'translateY(0)' : 'translateY(15px)',
            transition: 'all 0.5s ease 0.3s',
          } as any}>
            {[
              { label: 'Доход', value: `$${todayIncome.toLocaleString()}`, clr: T.success },
              { label: 'Расходы', value: `-$${todayExpense.toLocaleString()}`, clr: T.danger },
              { label: 'Прибыль', value: `$${todayProfit.toLocaleString()}`, clr: todayProfit >= 0 ? T.success : T.danger },
            ].map((s, i) => (
              <div key={i} style={{
                background: `${s.clr}0a`, border: `1px solid ${s.clr}22`,
                borderRadius: 12, padding: '8px 6px', textAlign: 'center',
              } as any}>
                <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: s.clr }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* ── SECONDARY STATS ── */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            gap: 5, marginTop: 8,
            opacity: animStage >= 3 ? 1 : 0,
            transition: 'all 0.5s ease 0.45s',
          } as any}>
            {[
              { label: 'Доставки', value: todayDeliveries.toString(), clr: '#5ac8fa' },
              { label: 'Мили', value: todayMiles.toLocaleString(), clr: T.purple },
              { label: 'Репутация', value: `${reputation}%`, clr: reputation > 70 ? T.success : T.warning },
            ].map((s, i) => (
              <div key={i} style={{
                background: '#f9fafb', border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: 8, padding: '6px 3px', textAlign: 'center',
              } as any}>
                <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 600, marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: s.clr }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* ── TRUCK STATS ── */}
          <div style={{
            marginTop: 10,
            opacity: animStage >= 3 ? 1 : 0,
            transition: 'all 0.5s ease 0.5s',
          } as any}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#6b7280', marginBottom: 6 }}>🚛 Траки</div>
            {trucks.map((truck) => {
              const yesterdayMiles = (truck as any).yesterdayMiles || 0;
              const todayTruckMiles = (truck.totalMiles || 0) - yesterdayMiles;
              return (
                <div key={truck.id} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 8px', marginBottom: 3,
                  background: '#f9fafb',
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 8,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#111827' }}>{truck.name}</div>
                    <div style={{ fontSize: 9, color: '#9ca3af' }}>{truck.driver}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 700 }}>
                      {todayTruckMiles.toLocaleString()} mi
                    </div>
                    <div style={{ fontSize: 9, color: '#9ca3af' }}>
                      сегодня
                    </div>
                  </div>
                  <div style={{
                    padding: '3px 6px', borderRadius: 6,
                    background: (truck.safetyScore || 100) >= 90 ? 'rgba(48,209,88,0.12)' : 'rgba(255,159,10,0.12)',
                  }}>
                    <span style={{
                      fontSize: 11, fontWeight: 900,
                      color: (truck.safetyScore || 100) >= 90 ? T.success : T.warning,
                    }}>{truck.safetyScore || 100}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── INFO ── */}
          <div style={{
            marginTop: 12,
            padding: '10px 12px',
            background: 'rgba(6,182,212,0.08)',
            border: '1px solid rgba(6,182,212,0.25)',
            borderRadius: 12,
            opacity: animStage >= 3 ? 1 : 0,
            transition: 'all 0.5s ease 0.55s',
          } as any}>
            <div style={{ fontSize: 12, color: '#0e7490', fontWeight: 700, marginBottom: 3 }}>
              💡 Завтра новый день
            </div>
            <div style={{ fontSize: 11, color: '#164e63', lineHeight: 1.4 }}>
              Смена завершится через {7 - day} {7 - day === 1 ? 'день' : 'дней'}. В конце недели получишь полный отчёт и оценку.
            </div>
          </div>

          {/* ── BUTTON ── */}
          <div style={{
            marginTop: 14,
            opacity: animStage >= 3 ? 1 : 0,
            transition: 'all 0.5s ease 0.6s',
          } as any}>
            <button onClick={handleContinue} style={{
              width: '100%',
              padding: '12px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
              color: '#fff', fontSize: 14, fontWeight: 900,
              boxShadow: '0 4px 20px rgba(6,182,212,0.3)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}>
              ✅ Продолжить
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

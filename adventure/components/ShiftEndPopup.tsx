import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Colors } from '../constants/colors';
import { useTheme } from '../hooks/useTheme';

/* ── Грейд по прибыли на трак ── */
function calcGrade(profit: number, truckCount: number) {
  const perTruck = truckCount > 0 ? profit / truckCount : 0;
  if (perTruck >= 4000) return { grade: 'S', color: '#fbbf24', emoji: '🏆', label: 'Легенда!' };
  if (perTruck >= 2500) return { grade: 'A', color: '#30d158', emoji: '🥇', label: 'Отличная работа!' };
  if (perTruck >= 1500) return { grade: 'B', color: '#0a84ff', emoji: '🥈', label: 'Хороший результат.' };
  if (perTruck >= 500)  return { grade: 'C', color: '#ff9f0a', emoji: '🥉', label: 'Неплохо, но можно лучше.' };
  return { grade: 'D', color: '#ff453a', emoji: '📚', label: 'Нужна практика.' };
}

export default function ShiftEndPopup() {
  const T = useTheme();
  const {
    phase, balance, totalEarned, totalLost, reputation, financeLog,
    trucks, score, sessionName, day, startShift, endShift,
  } = useGameStore();

  const [show, setShow] = useState(false);
  const [animStage, setAnimStage] = useState(0); // 0=hidden, 1=backdrop, 2=card, 3=content

  useEffect(() => {
    if (phase === 'shift_end') {
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

  const profit = totalEarned - totalLost;
  const truckCount = trucks.length;
  const { grade, color, emoji, label } = calcGrade(profit, truckCount);
  const perTruck = truckCount > 0 ? Math.round(profit / truckCount) : 0;
  
  // Реальные данные
  const deliveries = financeLog.filter(f => 
    f.type === 'income' && f.description.includes('Delivery')
  ).length;
  const totalMiles = trucks.reduce((sum, t) => sum + (t.totalMiles || 0), 0);

  const incomes = financeLog.filter(f => f.type === 'income');
  const expenses = financeLog.filter(f => f.type === 'expense');

  const handleNewShift = () => {
    endShift();
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
        width: '90%', maxWidth: 480,
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#ffffff',
        border: `1px solid ${color}33`,
        borderRadius: 24,
        boxShadow: `0 0 40px ${color}18, 0 20px 60px rgba(0,0,0,0.15)`,
        opacity: animStage >= 2 ? 1 : 0,
        transform: animStage >= 2 ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(30px)',
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        scrollbarWidth: 'none',
      } as any}>

        {/* Glow top */}
        <div style={{
          position: 'absolute', top: -1, left: '10%', right: '10%', height: 2,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          borderRadius: 2,
        } as any} />

        <div style={{ padding: '20px 20px 16px' }}>

          {/* ── GRADE BADGE ── */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            opacity: animStage >= 3 ? 1 : 0,
            transform: animStage >= 3 ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease 0.1s',
          } as any}>
            <div style={{ fontSize: 36, marginBottom: 6, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>{emoji}</div>
            <div style={{
              width: 56, height: 56, borderRadius: 28,
              border: `3px solid ${color}`,
              background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 30px ${color}33, inset 0 0 20px ${color}11`,
              marginBottom: 8,
            }}>
              <span style={{ fontSize: 28, fontWeight: 900, color, textShadow: `0 0 20px ${color}88` }}>{grade}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#111827', marginBottom: 3 }}>
              Неделя завершена!
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{label}</div>
            <div style={{
              fontSize: 11, color: '#007aff', fontWeight: 700,
              background: 'rgba(0,122,255,0.08)', padding: '3px 12px', borderRadius: 10,
              border: '1px solid rgba(0,122,255,0.2)',
            }}>
              {sessionName || 'Сессия'} · Неделя {Math.ceil(day / 7)} · {truckCount} траков
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
              { label: 'Доход', value: `$${totalEarned.toLocaleString()}`, clr: T.success },
              { label: 'Расходы', value: `-$${totalLost.toLocaleString()}`, clr: T.danger },
              { label: 'На трак', value: `$${perTruck.toLocaleString()}`, clr: color },
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

          {/* ── PROFIT BAR ── */}
          <div style={{
            marginTop: 10, padding: '10px 14px',
            background: profit >= 0
              ? 'rgba(52,199,89,0.08)'
              : 'rgba(255,59,48,0.08)',
            border: `1px solid ${profit >= 0 ? 'rgba(52,199,89,0.25)' : 'rgba(255,59,48,0.25)'}`,
            borderRadius: 14,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            opacity: animStage >= 3 ? 1 : 0,
            transition: 'all 0.5s ease 0.4s',
          } as any}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>💰 Чистая прибыль</span>
            <span style={{
              fontSize: 18, fontWeight: 900,
              color: profit >= 0 ? T.success : T.danger,
              textShadow: `0 0 20px ${profit >= 0 ? T.successGlow : T.dangerGlow}`,
            }}>{profit >= 0 ? '+' : ''}${profit.toLocaleString()}</span>
          </div>

          {/* ── SECONDARY STATS ── */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
            gap: 5, marginTop: 8,
            opacity: animStage >= 3 ? 1 : 0,
            transition: 'all 0.5s ease 0.45s',
          } as any}>
            {[
              { label: 'Репутация', value: `${reputation}%`, clr: reputation > 70 ? T.success : T.warning },
              { label: 'Очки', value: score.toString(), clr: T.primary },
              { label: 'Доставки', value: deliveries.toString(), clr: '#5ac8fa' },
              { label: 'Мили', value: totalMiles.toLocaleString(), clr: T.purple },
            ].map((s, i) => (
              <div key={i} style={{
                background: '#f9fafb', border: `1px solid rgba(0,0,0,0.06)`,
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
            {trucks.map((truck, i) => (
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
                    {(truck.totalMiles || 0).toLocaleString()} mi
                  </div>
                  <div style={{ fontSize: 9, color: '#9ca3af' }}>
                    {truck.totalDeliveries || 0} доставок
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
            ))}
          </div>

          {/* ── FINANCE DETAILS (collapsible) ── */}
          {(incomes.length > 0 || expenses.length > 0) && (
            <div style={{
              marginTop: 10,
              opacity: animStage >= 3 ? 1 : 0,
              transition: 'all 0.5s ease 0.55s',
            } as any}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#6b7280', marginBottom: 6 }}>📊 Детали</div>

              {incomes.length > 0 && (
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: T.success, marginBottom: 3 }}>Доходы</div>
                  {incomes.map((f, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', padding: '3px 6px',
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                    }}>
                      <span style={{ fontSize: 10, color: '#374151', flex: 1 }}>{f.description}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: T.success }}>+${f.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {expenses.length > 0 && (
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: T.danger, marginBottom: 3 }}>Расходы</div>
                  {expenses.map((f, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', padding: '3px 6px',
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                    }}>
                      <span style={{ fontSize: 10, color: '#374151', flex: 1 }}>{f.description}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: T.danger }}>-${f.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── BUTTONS ── */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14,
            opacity: animStage >= 3 ? 1 : 0,
            transition: 'all 0.5s ease 0.6s',
          } as any}>
            <button onClick={handleNewShift} style={{
              padding: '12px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: `linear-gradient(135deg, ${T.success}, ${T.successDark})`,
              color: '#fff', fontSize: 14, fontWeight: 900,
              boxShadow: `0 4px 20px ${T.successGlow}`,
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}>
              🔄 Новая неделя
            </button>
            <button onClick={() => {
              useGameStore.getState().clearSave();
              window.location.href = '/game/';
            }} style={{
              padding: '10px 0', borderRadius: 12, cursor: 'pointer',
              background: '#f3f4f6',
              border: '1px solid rgba(0,0,0,0.08)',
              color: '#6b7280', fontSize: 12, fontWeight: 700,
              transition: 'all 0.15s',
            }}>
              🏠 Главное меню
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes shiftEndPulse {
          0%, 100% { box-shadow: 0 0 30px ${color}22; }
          50% { box-shadow: 0 0 50px ${color}33; }
        }
      `}</style>
    </div>
  );
}

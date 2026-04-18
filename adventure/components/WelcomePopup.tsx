import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useGuideStore, GuideStep } from '../store/guideStore';

const STORAGE_KEY = 'dispatch-guide-done';

interface Props {
  nickname: string;
  truckCount: number;
  onSwitchTab: (tab: string) => void;
  onAllDone?: () => void;
  forceStep?: number | null;
  onStepChange?: (step: number) => void; // колбэк при смене раскрытого шага
}

interface StepDef {
  id: GuideStep;
  icon: string;
  title: string;
  hint: string;
  desc: string;
  tab: string;
  cta: string;
  done: boolean;
  doneLabel: string;
}

export default function GuidePanel({ nickname, truckCount, onSwitchTab, onAllDone, forceStep, onStepChange }: Props) {
  const [expandedStep, setExpandedStep] = useState<number | null>(forceStep ?? 0);
  const isForcedRef = useRef(false);

  function setExpanded(i: number | null) {
    setExpandedStep(i);
    if (i !== null) onStepChange?.(i);
  }

  const gameMinute     = useGameStore(s => s.gameMinute);

  // Посещение вкладок — сохраняем в localStorage, но сбрасываем при новой игре
  const [emailVisited, setEmailVisited] = useState(false);
  const [mapVisited, setMapVisited] = useState(false);

  // Читаем из localStorage только если игра уже шла (не первые минуты)
  useEffect(() => {
    if (gameMinute > 5) {
      try {
        if (localStorage.getItem('guide-email-visited')) setEmailVisited(true);
        if (localStorage.getItem('guide-map-visited')) setMapVisited(true);
      } catch {}
    }
  }, []);

  const activeLoads    = useGameStore(s => s.activeLoads);
  const bookedLoads    = useGameStore(s => s.bookedLoads);
  const trucks         = useGameStore(s => s.trucks);
  const totalEarned    = useGameStore(s => s.totalEarned);
  const notifications  = useGameStore(s => s.notifications);
  const resolvedEvents = useGameStore(s => s.resolvedEvents);
  const activeEvents   = useGameStore(s => s.activeEvents);

  const setGuideStep   = useGuideStore(s => s.setStep);
  const clearGuideStep = useGuideStore(s => s.clearStep);
  const triggerBubble  = useGuideStore(s => s.triggerBubble);

  const hasTruckMoving  = trucks.some(t => ['loaded','driving','at_pickup','at_delivery'].includes(t.status));
  // Только грузы назначенные игроком (не начальные INIT-)
  const playerAssignedLoad = activeLoads.some(l => !l.id.startsWith('INIT-'));
  const hasAssignedLoad = playerAssignedLoad || bookedLoads.length > 0;
  const hasEarned       = totalEarned > 0;
  const shiftGoal       = truckCount * 2500;
  const goalReached     = totalEarned >= shiftGoal;

  // Почта: открыл вкладку ИЛИ есть хоть одно прочитанное
  const emailDone = emailVisited || notifications.some(n => n.read);

  // События: решено хоть одно ИЛИ нет активных событий вообще (спокойная смена)
  const eventsDone = (resolvedEvents?.length ?? 0) > 0 || (activeEvents?.length ?? 0) === 0;

  const steps: StepDef[] = [
    {
      id: 'find_load',
      icon: '📋',
      title: 'Найди груз',
      hint: 'Вкладка «Грузы»',
      desc: 'Открой «Грузы» → нажми на рейс ▶ чтобы раскрыть детали → нажми «📞 Позвонить брокеру» → в чате выбери фразы и согласуй ставку.',
      tab: 'loadboard',
      cta: '→ Открыть Грузы',
      done: hasAssignedLoad,
      doneLabel: 'Груз найден и сделка заключена',
    },
    {
      id: 'assign_truck',
      icon: '🚛',
      title: 'Назначь трак',
      hint: 'После переговоров',
      desc: 'После сделки появится окно выбора трака. Нажми на свободный трак — он сразу отправится на погрузку.',
      tab: 'trucks',
      cta: '→ Открыть Траки',
      done: playerAssignedLoad,
      doneLabel: 'Трак в пути',
    },
    {
      id: 'watch_map',
      icon: '🗺',
      title: 'Следи за картой',
      hint: 'Вкладка «Карта»',
      desc: 'Переключись на карту. Трак едет по реальным дорогам США. Кликни на иконку трака — увидишь статус, HOS и маршрут.',
      tab: 'map',
      cta: '→ Открыть Карту',
      done: mapVisited,
      doneLabel: 'Карта просмотрена',
    },
    {
      id: 'check_email',
      icon: '📧',
      title: 'Проверь почту',
      hint: 'Вкладка «Почта»',
      desc: 'Брокеры и водители пишут тебе. Открой «Почту» → нажми на любое письмо → прочитай. Используй плитки-фразы для быстрого ответа.',
      tab: 'email',
      cta: '→ Открыть Почту',
      done: emailDone,
      doneLabel: 'Почта открыта',
    },
    {
      id: 'get_paid',
      icon: '💰',
      title: 'Получи оплату',
      hint: 'Автоматически при доставке',
      desc: 'При доставке деньги зачисляются автоматически — появится попап с результатом. Следи за балансом в шапке.',
      tab: 'map',
      cta: '→ Смотреть на карте',
      done: hasEarned,
      doneLabel: `Заработано $${totalEarned.toLocaleString()}`,
    },
    {
      id: 'end_shift',
      icon: '🏁',
      title: 'Закрой смену',
      hint: `Цель: $${shiftGoal.toLocaleString()}+`,
      desc: `Заработай $${shiftGoal.toLocaleString()}+ и нажми «Завершить смену» в меню (☰ в шапке). Получишь оценку и P&L отчёт.`,
      tab: 'trucks',
      cta: '→ Открыть меню ☰',
      done: goalReached,
      doneLabel: `Цель достигнута — $${totalEarned.toLocaleString()}`,
    },
  ];

  const completedCount = steps.filter(s => s.done).length;
  const allDone = completedCount === steps.length;

  // Авто-раскрываем первый невыполненный шаг — только если пользователь не навигирует вручную
  const didAutoExpand = useRef(false);
  useEffect(() => {
    if (isForcedRef.current) return;
    const firstPending = steps.findIndex(s => !s.done);
    if (firstPending !== -1) {
      setExpanded(firstPending);
      setGuideStep(steps[firstPending].id);
    }
    didAutoExpand.current = true;
  }, [completedCount]);

  // Принудительный шаг от кнопки ↺ — блокируем авто-переключение
  useEffect(() => {
    if (forceStep !== null && forceStep !== undefined) {
      isForcedRef.current = true;
      setExpanded(forceStep);
      setGuideStep(steps[forceStep]?.id ?? null);
    } else {
      isForcedRef.current = false;
    }
  }, [forceStep]);

  // Когда все выполнены
  useEffect(() => {
    if (allDone) {
      clearGuideStep();
      try {
        localStorage.setItem(STORAGE_KEY, '1');
        localStorage.removeItem('guide-email-visited');
        localStorage.removeItem('guide-map-visited');
      } catch {}
      onAllDone?.();
    }
  }, [allDone]);

  useEffect(() => () => clearGuideStep(), []);

  function handleStepClick(i: number) {
    isForcedRef.current = false;
    if (expandedStep === i) { setExpanded(null); return; }
    setExpanded(i);
    setGuideStep(steps[i].id);
  }

  function handleCTA(s: StepDef) {
    setGuideStep(s.id);
    triggerBubble(s.id);  // показываем bubble на целевой вкладке
    // Отмечаем посещение вкладки
    if (s.tab === 'email') {
      setEmailVisited(true);
      try { localStorage.setItem('guide-email-visited', '1'); } catch {}
    }
    if (s.tab === 'map') {
      setMapVisited(true);
      try { localStorage.setItem('guide-map-visited', '1'); } catch {}
    }
    onSwitchTab(s.tab);
  }

  return (
    <div style={{
      height: '100%', overflowY: 'auto',
      background: 'linear-gradient(160deg, #1e2d4a 0%, #192338 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      padding: '16px 14px 32px',
    }}>

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#7dd3fc', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 } as any}>
          🎮 Dispatch Office · Гайд
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9', lineHeight: 1.2 }}>
          Добро пожаловать,{' '}
          <span style={{
            background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          } as any}>{nickname}!</span>
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
          Ты — диспетчер грузовых перевозок США.<br />
          <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{truckCount} трака ждут тебя в Knoxville, TN.</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>
            {allDone ? '🎉 Все шаги выполнены!' : 'Прогресс обучения'}
          </span>
          <span style={{ fontSize: 12, fontWeight: 900, color: allDone ? '#4ade80' : '#38bdf8' }}>
            {completedCount}/{steps.length}
          </span>
        </div>
        <div style={{ height: 7, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${(completedCount / steps.length) * 100}%`,
            background: allDone ? 'linear-gradient(90deg, #4ade80, #22c55e)' : 'linear-gradient(90deg, #38bdf8, #818cf8)',
            borderRadius: 4,
            transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
            boxShadow: allDone ? '0 0 10px rgba(74,222,128,0.5)' : '0 0 8px rgba(56,189,248,0.5)',
          }} />
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 } as any}>
        {steps.map((s, i) => {
          const isExpanded = expandedStep === i;
          const isDone = s.done;
          const isForced = isExpanded && isForcedRef.current; // принудительно активный через ↺
          const isActive = isForced || (!isDone && steps.slice(0, i).every(prev => prev.done));

          return (
            <div key={i} style={{ borderRadius: 12, overflow: 'hidden' }}>
              <div
                onClick={() => handleStepClick(i)}
                style={{
                  display: 'flex', gap: 10, alignItems: 'center',
                  padding: '10px 12px', cursor: 'pointer',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(56,189,248,0.18), rgba(129,140,248,0.12))'
                    : isDone
                      ? 'linear-gradient(135deg, rgba(74,222,128,0.14), rgba(34,197,94,0.08))'
                      : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${isActive ? 'rgba(56,189,248,0.5)' : isDone ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: isExpanded ? '12px 12px 0 0' : 12,
                  transition: 'all 0.2s',
                  boxShadow: isActive ? '0 0 16px rgba(56,189,248,0.15)' : 'none',
                } as any}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: isActive ? 'rgba(56,189,248,0.22)' : isDone ? 'rgba(74,222,128,0.22)' : 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17,
                  boxShadow: isActive ? '0 0 10px rgba(56,189,248,0.35)' : isDone ? '0 0 8px rgba(74,222,128,0.35)' : 'none',
                  transition: 'all 0.3s',
                } as any}>
                  {isActive ? s.icon : isDone ? '✅' : s.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } as any}>
                    <span style={{ fontSize: 10, fontWeight: 900, color: isActive ? '#38bdf8' : isDone ? '#4ade80' : '#64748b' }}>
                      {i + 1}.
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: isActive ? '#f1f5f9' : isDone ? '#4ade80' : '#94a3b8' }}>
                      {s.title}
                    </span>
                    {isActive && (
                      <span style={{
                        fontSize: 9, fontWeight: 800, color: '#38bdf8',
                        background: 'rgba(56,189,248,0.18)',
                        padding: '1px 6px', borderRadius: 20,
                        animation: 'guidePulse 1.6s ease-in-out infinite',
                      } as any}>СЕЙЧАС</span>
                    )}
                    {isDone && !isActive && (
                      <span style={{
                        fontSize: 9, fontWeight: 800, color: '#4ade80',
                        background: 'rgba(74,222,128,0.15)',
                        padding: '1px 6px', borderRadius: 20,
                        marginLeft: 'auto',
                      } as any}>ГОТОВО</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, marginTop: 1, color: isActive ? '#bae6fd' : isDone ? '#86efac' : '#64748b' }}>
                    {isDone && !isActive ? s.doneLabel : s.hint}
                  </div>
                </div>

                <div style={{
                  fontSize: 12,
                  color: isActive ? '#38bdf8' : isDone ? '#4ade80' : '#64748b',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s', flexShrink: 0,
                }}>▾</div>
              </div>

              {isExpanded && (
                <div style={{
                  background: isActive ? 'rgba(56,189,248,0.08)' : isDone ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isActive ? 'rgba(56,189,248,0.3)' : isDone ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.08)'}`,
                  borderTop: 'none',
                  borderRadius: '0 0 12px 12px',
                  padding: '12px 14px 14px',
                }}>
                  <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.65, margin: '0 0 12px 0' }}>
                    {s.desc}
                  </p>
                  {(isActive || !isDone) && (
                    <button
                      onClick={() => handleCTA(s)}
                      style={{
                        width: '100%', padding: '10px 0',
                        background: 'linear-gradient(135deg, rgba(6,182,212,0.25), rgba(14,165,233,0.15))',
                        border: '1.5px solid rgba(6,182,212,0.6)',
                        borderRadius: 10, cursor: 'pointer',
                        fontSize: 13, fontWeight: 800, color: '#67e8f9',
                        letterSpacing: 0.3, transition: 'all 0.15s',
                        animation: isActive ? 'ctaPulse 2s ease-in-out infinite' : 'none',
                      } as any}
                      onMouseEnter={e => {
                        (e.target as HTMLElement).style.background = 'linear-gradient(135deg, rgba(6,182,212,0.4), rgba(14,165,233,0.25))';
                        (e.target as HTMLElement).style.boxShadow = '0 0 16px rgba(6,182,212,0.4)';
                      }}
                      onMouseLeave={e => {
                        (e.target as HTMLElement).style.background = 'linear-gradient(135deg, rgba(6,182,212,0.25), rgba(14,165,233,0.15))';
                        (e.target as HTMLElement).style.boxShadow = 'none';
                      }}
                    >
                      {s.cta}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Goal card */}
      <div style={{
        marginTop: 14, padding: '12px 14px', borderRadius: 12,
        background: goalReached ? 'linear-gradient(135deg, rgba(74,222,128,0.15), rgba(34,197,94,0.08))' : 'rgba(74,222,128,0.08)',
        border: `1px solid ${goalReached ? 'rgba(74,222,128,0.45)' : 'rgba(74,222,128,0.22)'}`,
        display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.3s',
      } as any}>
        <span style={{ fontSize: 22 }}>{goalReached ? '🎉' : '🏆'}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#4ade80' }}>Цель смены</div>
          <div style={{ fontSize: 11, color: '#86efac', marginTop: 2 }}>
            {goalReached
              ? `Цель достигнута! Заработано $${totalEarned.toLocaleString()} ✓`
              : `Заработай $${shiftGoal.toLocaleString()}+ · Оценка A или выше`}
          </div>
        </div>
        {totalEarned > 0 && !goalReached && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#fbbf24' }}>${totalEarned.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>из ${shiftGoal.toLocaleString()}</div>
          </div>
        )}
      </div>

      {allDone && (
        <div style={{
          marginTop: 12, padding: '12px 14px', borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(129,140,248,0.15), rgba(99,102,241,0.08))',
          border: '1px solid rgba(129,140,248,0.35)', textAlign: 'center',
        }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#c7d2fe', marginBottom: 4 }}>🎓 Обучение завершено!</div>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
            Ты прошёл все шаги. Кнопка 📖 исчезнет.<br />
            Продолжай работать — впереди ещё много рейсов!
          </div>
        </div>
      )}

      <style>{`
        @keyframes guidePulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @keyframes ctaPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(6,182,212,0); }
          50%      { box-shadow: 0 0 0 4px rgba(6,182,212,0.25); }
        }
      `}</style>
    </div>
  );
}

export function shouldShowGuide(): boolean {
  try { return !localStorage.getItem(STORAGE_KEY); } catch { return true; }
}

export function shouldShowWelcome(): boolean {
  return shouldShowGuide();
}

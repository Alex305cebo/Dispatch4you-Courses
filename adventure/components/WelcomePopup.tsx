import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useGuideStore } from '../store/guideStore';

const STORAGE_KEY = 'dispatch-guide-done';

interface Props {
  nickname: string;
  truckCount: number;
  onSwitchTab: (tab: string) => void;
  onAllDone?: () => void;
}

interface StepDef {
  id: number;
  icon: string;
  title: string;
  subtitle: string;
  dialog: string;
  character: string;
  characterAvatar: string;
  tab?: string;
  action?: {
    label: string;
    tab: string;
  };
  checkDone: () => boolean;
}

export default function GuidePanel({ nickname, truckCount, onSwitchTab, onAllDone }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showDialog, setShowDialog] = useState(true);
  const [autoMode, setAutoMode] = useState(true);

  const gameMinute = useGameStore(s => s.gameMinute);
  const activeLoads = useGameStore(s => s.activeLoads);
  const bookedLoads = useGameStore(s => s.bookedLoads);
  const totalEarned = useGameStore(s => s.totalEarned);
  const notifications = useGameStore(s => s.notifications);
  const resolvedEvents = useGameStore(s => s.resolvedEvents);
  const activeEvents = useGameStore(s => s.activeEvents);

  const [emailVisited, setEmailVisited] = useState(false);
  const [mapVisited, setMapVisited] = useState(false);

  useEffect(() => {
    if (gameMinute > 5) {
      try {
        if (localStorage.getItem('guide-email-visited')) setEmailVisited(true);
        if (localStorage.getItem('guide-map-visited')) setMapVisited(true);
      } catch {}
    }
  }, [gameMinute]);

  const playerAssignedLoad = activeLoads.some(l => !l.id.startsWith('INIT-'));
  const hasAssignedLoad = playerAssignedLoad || bookedLoads.length > 0;
  const hasEarned = totalEarned > 0;
  const shiftGoal = truckCount * 2500;
  const goalReached = totalEarned >= shiftGoal;
  const emailDone = emailVisited || notifications.some(n => n.read);
  const eventsDone = (resolvedEvents?.length ?? 0) > 0 || (activeEvents?.length ?? 0) === 0;

  const steps: StepDef[] = [
    {
      id: 1,
      icon: '📦',
      title: 'Найди груз',
      subtitle: 'Вкладка «Грузы»',
      dialog: `Привет, ${nickname}! Я Майк, старший диспетчер. Сегодня твой первый день.\n\n${truckCount === 1 ? '1 трак ждёт' : `${truckCount} трака ждут`} тебя в Knoxville, TN. Давай начнём с простого — найди груз.`,
      character: 'Майк',
      characterAvatar: '👨🏻‍💼',
      tab: 'loadboard',
      action: {
        label: '→ Открыть Грузы',
        tab: 'loadboard',
      },
      checkDone: () => hasAssignedLoad,
    },
    {
      id: 2,
      icon: '🚛',
      title: 'Назначь трак',
      subtitle: 'После переговоров',
      dialog: 'Отлично! Теперь выбери груз, нажми «📞 Позвонить брокеру», договорись о ставке и назначь трак. Это основа работы диспетчера.',
      character: 'Майк',
      characterAvatar: '👨🏻‍💼',
      tab: 'loadboard',
      checkDone: () => playerAssignedLoad,
    },
    {
      id: 3,
      icon: '🗺️',
      title: 'Следи за картой',
      subtitle: 'Вкладка «Карта»',
      dialog: 'Траки всегда в движении. Открой карту и посмотри где едет твой трак. Следи за HOS — часами вождения. Если HOS закончится — трак встанет.',
      character: 'Майк',
      characterAvatar: '👨🏻‍💼',
      tab: 'map',
      action: {
        label: '→ Открыть Карту',
        tab: 'map',
      },
      checkDone: () => mapVisited,
    },
    {
      id: 4,
      icon: '📧',
      title: 'Проверь почту',
      subtitle: 'Вкладка «Почта»',
      dialog: 'Брокеры присылают документы — Rate Con, POD, detention claims. Проверяй почту регулярно, там важная инфа о твоих грузах.',
      character: 'Майк',
      characterAvatar: '👨🏻‍💼',
      tab: 'email',
      action: {
        label: '→ Открыть Почту',
        tab: 'email',
      },
      checkDone: () => emailDone,
    },
    {
      id: 5,
      icon: '⚡',
      title: 'Реши проблему',
      subtitle: 'Колокольчик 🔔',
      dialog: 'В реальной жизни всегда что-то идёт не так — поломки, detention, задержки. Нажми на колокольчик 🔔 и реши проблему.',
      character: 'Майк',
      characterAvatar: '👨🏻‍💼',
      checkDone: () => eventsDone,
    },
    {
      id: 6,
      icon: '💰',
      title: 'Получи оплату',
      subtitle: 'Автоматически при доставке',
      dialog: 'Когда трак доставит груз — ты получишь деньги. Следи за балансом и расходами. Твой P&L — твой рейтинг.',
      character: 'Майк',
      characterAvatar: '👨🏻‍💼',
      checkDone: () => hasEarned,
    },
  ];

  const completedSteps = steps.filter(s => s.checkDone());
  const progress = completedSteps.length / steps.length;
  const step = steps[currentStep];

  // Автопереход к следующему шагу
  useEffect(() => {
    if (!autoMode) return;
    if (step.checkDone() && currentStep < steps.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setShowDialog(true);
      }, 800);
    }
  }, [step.checkDone(), currentStep, autoMode]);

  // Проверка завершения всех шагов
  useEffect(() => {
    if (completedSteps.length === steps.length) {
      try {
        localStorage.setItem(STORAGE_KEY, '1');
      } catch {}
      if (onAllDone) {
        setTimeout(() => onAllDone(), 1500);
      }
    }
  }, [completedSteps.length]);

  function handleAction(tab: string) {
    onSwitchTab(tab);
    if (tab === 'email') {
      try { localStorage.setItem('guide-email-visited', '1'); } catch {}
      setEmailVisited(true);
    }
    if (tab === 'map') {
      try { localStorage.setItem('guide-map-visited', '1'); } catch {}
      setMapVisited(true);
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    } as any}>
      <div style={{
        width: '100%', maxWidth: 480, maxHeight: '90%',
        background: 'linear-gradient(170deg, #0f1729, #0a0f1e)',
        borderRadius: 24, border: '2px solid rgba(6,182,212,0.3)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
      } as any}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 16, borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(6,182,212,0.05)',
        } as any}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 } as any}>
            <span style={{ fontSize: 24 }}>📚</span>
            <div>
              <div style={{
                fontSize: 11, fontWeight: 800, color: '#06b6d4',
                letterSpacing: 0.5,
              } as any}>
                DISPATCH OFFICE · ГАЙД
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 } as any}>
                Добро пожаловать, {nickname}!
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 } as any}>
            <button
              onClick={() => setAutoMode(!autoMode)}
              style={{
                padding: '6px 10px', borderRadius: 8,
                background: autoMode ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${autoMode ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.1)'}`,
                color: autoMode ? '#06b6d4' : '#64748b',
                fontSize: 11, fontWeight: 700, cursor: 'pointer',
              } as any}
              title={autoMode ? 'Автопереход включён' : 'Автопереход выключен'}
            >
              {autoMode ? '⚡' : '⏸'}
            </button>
          </div>
        </div>

        {/* Progress */}
        <div style={{
          padding: 16, borderBottom: '1px solid rgba(255,255,255,0.08)',
        } as any}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: '#64748b',
            textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
          } as any}>
            Прогресс обучения
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 } as any}>
            <div style={{
              flex: 1, height: 8, background: 'rgba(255,255,255,0.06)',
              borderRadius: 4, overflow: 'hidden',
            } as any}>
              <div style={{
                height: '100%', width: `${progress * 100}%`,
                background: '#06b6d4', borderRadius: 4,
                transition: 'width 0.5s ease',
              } as any} />
            </div>
            <div style={{
              fontSize: 12, fontWeight: 800, color: '#06b6d4', width: 40,
            } as any}>
              {completedSteps.length}/{steps.length}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: 16,
        } as any}>
          {showDialog ? (
            <>
              {/* Character */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(255,255,255,0.04)', borderRadius: 12,
                padding: 10, marginBottom: 12,
              } as any}>
                <div style={{
                  width: 40, height: 40, borderRadius: 20,
                  background: 'rgba(6,182,212,0.15)',
                  border: '2px solid rgba(6,182,212,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                } as any}>
                  {step.characterAvatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#e2e8f0' }}>
                    {step.character}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                    Старший диспетчер
                  </div>
                </div>
              </div>

              {/* Dialog */}
              <div style={{
                background: 'rgba(6,182,212,0.1)',
                border: '1px solid rgba(6,182,212,0.25)',
                borderRadius: 16, padding: 14, marginBottom: 16,
              } as any}>
                <div style={{
                  fontSize: 14, color: '#e2e8f0', lineHeight: 1.5,
                  whiteSpace: 'pre-line',
                } as any}>
                  {step.dialog}
                </div>
              </div>

              {/* Current step card */}
              <div style={{
                background: step.checkDone()
                  ? 'rgba(52,211,153,0.08)'
                  : 'rgba(6,182,212,0.08)',
                border: `2px solid ${step.checkDone() ? 'rgba(52,211,153,0.4)' : 'rgba(6,182,212,0.4)'}`,
                borderRadius: 16, padding: 14, marginBottom: 12,
              } as any}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 } as any}>
                  <span style={{ fontSize: 28 }}>{step.checkDone() ? '✓' : step.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      alignSelf: 'flex-start',
                      background: step.checkDone()
                        ? 'rgba(52,211,153,0.2)'
                        : 'rgba(6,182,212,0.2)',
                      borderRadius: 6, padding: '2px 6px', marginBottom: 4,
                      display: 'inline-block',
                    } as any}>
                      <span style={{
                        fontSize: 9, fontWeight: 800,
                        color: step.checkDone() ? '#34d399' : '#06b6d4',
                        letterSpacing: 0.5,
                      } as any}>
                        {step.checkDone() ? '✓ ГОТОВО' : 'СЕЙЧАС'}
                      </span>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#e2e8f0', marginBottom: 2 }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                      {step.subtitle}
                    </div>
                  </div>
                </div>

                {/* Action button */}
                {step.action && !step.checkDone() && (
                  <button
                    onClick={() => handleAction(step.action!.tab)}
                    style={{
                      width: '100%', padding: 12, borderRadius: 12,
                      background: '#06b6d4', border: 'none',
                      fontSize: 14, fontWeight: 800, color: '#fff',
                      cursor: 'pointer',
                    } as any}
                  >
                    {step.action.label}
                  </button>
                )}
              </div>

              {/* Show all steps */}
              <button
                onClick={() => setShowDialog(false)}
                style={{
                  width: '100%', padding: 10, borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: 13, fontWeight: 700, color: '#64748b',
                  cursor: 'pointer',
                } as any}
              >
                Показать все шаги →
              </button>
            </>
          ) : (
            <>
              {/* All steps */}
              {steps.map((st, i) => (
                <button
                  key={st.id}
                  onClick={() => {
                    setCurrentStep(i);
                    setShowDialog(true);
                  }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: 12, borderRadius: 14, marginBottom: 8,
                    background: st.checkDone()
                      ? 'rgba(52,211,153,0.08)'
                      : i === currentStep
                      ? 'rgba(6,182,212,0.08)'
                      : 'rgba(255,255,255,0.04)',
                    border: st.checkDone()
                      ? '1px solid rgba(52,211,153,0.25)'
                      : i === currentStep
                      ? '2px solid rgba(6,182,212,0.4)'
                      : '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer', textAlign: 'left',
                  } as any}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: st.checkDone()
                      ? 'rgba(52,211,153,0.2)'
                      : 'rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18,
                  } as any}>
                    {st.checkDone() ? '✓' : st.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 700,
                      color: st.checkDone() ? '#34d399' : '#e2e8f0',
                      marginBottom: 2,
                    } as any}>
                      {st.id}. {st.title}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      {st.subtitle}
                    </div>
                  </div>
                  {i === currentStep && !st.checkDone() && (
                    <div style={{
                      width: 24, height: 24, borderRadius: 12,
                      background: 'rgba(6,182,212,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: '#06b6d4',
                    } as any}>
                      ▶
                    </div>
                  )}
                </button>
              ))}

              {/* Back */}
              <button
                onClick={() => setShowDialog(true)}
                style={{
                  width: '100%', padding: 10, borderRadius: 12, marginTop: 8,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: 13, fontWeight: 700, color: '#64748b',
                  cursor: 'pointer',
                } as any}
              >
                ← Вернуться к диалогу
              </button>
            </>
          )}
        </div>

        {/* Goal */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: 14,
          background: goalReached
            ? 'rgba(52,211,153,0.08)'
            : 'rgba(251,191,36,0.08)',
          borderTop: `1px solid ${goalReached ? 'rgba(52,211,153,0.25)' : 'rgba(251,191,36,0.25)'}`,
        } as any}>
          <span style={{ fontSize: 24 }}>{goalReached ? '🎉' : '🏆'}</span>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 12, fontWeight: 800,
              color: goalReached ? '#34d399' : '#fbbf24',
              marginBottom: 2,
            } as any}>
              {goalReached ? 'Цель достигнута!' : 'Цель смены'}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              {goalReached
                ? `Заработано $${totalEarned.toLocaleString()} · Отличная работа!`
                : `Заработай $${shiftGoal.toLocaleString()}+ · Оценка A или выше`
              }
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Хелперы для проверки показа гайда
export function shouldShowGuide(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return true;
    return !localStorage.getItem(STORAGE_KEY);
  } catch {
    return true;
  }
}

export function shouldShowWelcome(): boolean {
  return shouldShowGuide();
}

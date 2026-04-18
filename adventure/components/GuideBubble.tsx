/**
 * GuideBubble — всплывающая подсказка снизу экрана.
 * Показывается когда пользователь переходит на вкладку по кнопке из гайда.
 * Автоматически исчезает через 12 секунд или по нажатию.
 */
import { useState, useEffect, useRef } from 'react';
import { useGuideStore, GuideStep } from '../store/guideStore';

interface BubbleConfig {
  step: GuideStep;
  emoji: string;
  title: string;
  lines: string[];          // пошаговые инструкции
  highlight?: string;       // что именно нажать (выделяется)
  autoHide?: number;        // секунд до автоскрытия (default 12)
}

const BUBBLES: BubbleConfig[] = [
  {
    step: 'find_load',
    emoji: '📋',
    title: 'Как найти груз',
    lines: [
      '1. Видишь список рейсов? Нажми на любой ▶',
      '2. Раскроются детали — маршрут, ставка, брокер',
      '3. Нажми «📞 Позвонить брокеру»',
      '4. Начнутся переговоры в чате',
    ],
    highlight: '📞 Позвонить брокеру',
  },
  {
    step: 'negotiate',
    emoji: '💬',
    title: 'Как договориться',
    lines: [
      '1. Брокер предложит ставку',
      '2. Выбери фразы-плитки внизу чата',
      '3. Нажми «Отправить» ↗',
      '4. Когда договоришься — появится кнопка «Назначить трак»',
    ],
    highlight: 'фразы-плитки',
  },
  {
    step: 'assign_truck',
    emoji: '🚛',
    title: 'Как назначить трак',
    lines: [
      '1. Появилось окно выбора трака',
      '2. Нажми на свободный трак (статус «Свободен»)',
      '3. Трак сразу отправится на погрузку',
      '4. Ты увидишь его на карте',
    ],
    highlight: 'свободный трак',
  },
  {
    step: 'watch_map',
    emoji: '🗺',
    title: 'Что делать на карте',
    lines: [
      '1. Видишь цветные точки? Это твои траки',
      '2. Нажми на точку трака — появится карточка',
      '3. Там статус, HOS, маршрут и груз',
      '4. Зелёный = везёт груз, синий = едет к погрузке',
    ],
    highlight: 'Нажми на точку трака',
    autoHide: 15,
  },
  {
    step: 'check_email',
    emoji: '📧',
    title: 'Как читать почту',
    lines: [
      '1. Видишь список писем? Нажми на любое',
      '2. Откроется чат с брокером или водителем',
      '3. Выбери фразы-плитки для ответа',
      '4. Нажми ↗ чтобы отправить',
    ],
    highlight: 'Нажми на письмо',
  },
  {
    step: 'resolve_event',
    emoji: '⚡',
    title: 'Как реагировать на события',
    lines: [
      '1. Нажми на 🔔 в шапке вверху',
      '2. Откроется список уведомлений',
      '3. Нажми на уведомление с ⚠️ или 🚨',
      '4. Выбери действие — реши ситуацию',
    ],
    highlight: '🔔 в шапке',
  },
  {
    step: 'get_paid',
    emoji: '💰',
    title: 'Как получить оплату',
    lines: [
      '1. Трак доедет до точки доставки',
      '2. Автоматически появится попап с результатом',
      '3. Деньги зачислятся на баланс в шапке',
      '4. Ищи следующий груз пока трак едет!',
    ],
    highlight: 'попап с результатом',
    autoHide: 15,
  },
  {
    step: 'end_shift',
    emoji: '🏁',
    title: 'Как завершить смену',
    lines: [
      '1. Нажми ☰ (гамбургер) в правом верхнем углу',
      '2. Выбери «Завершить смену»',
      '3. Получишь оценку A/B/C и P&L отчёт',
      `4. Цель: заработать как можно больше!`,
    ],
    highlight: '☰ в правом углу',
  },
];

export default function GuideBubble() {
  const bubbleStep = useGuideStore(s => s.bubbleStep);
  const clearBubble = useGuideStore(s => s.clearBubble);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<any>(null);
  const progressRef = useRef<any>(null);
  const prevStepRef = useRef<GuideStep>(null);

  const config = BUBBLES.find(b => b.step === bubbleStep) ?? null;
  const autoHide = config?.autoHide ?? 12;

  // Показываем bubble когда bubbleStep меняется
  useEffect(() => {
    if (bubbleStep && bubbleStep !== prevStepRef.current) {
      prevStepRef.current = bubbleStep;
      setVisible(false);
      setProgress(100);
      const showTimer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(showTimer);
    }
    if (!bubbleStep) setVisible(false);
  }, [bubbleStep]);

  // Авто-скрытие с прогресс-баром
  useEffect(() => {
    if (!visible) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);

    const totalMs = autoHide * 1000;
    const startTime = Date.now();

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / totalMs) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(progressRef.current);
    }, 100);

    timerRef.current = setTimeout(() => {
      setVisible(false);
      clearBubble();
    }, totalMs);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(progressRef.current);
    };
  }, [visible, autoHide]);

  function dismiss() {
    setVisible(false);
    clearBubble();
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  }

  if (!config || !visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 80,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 8000,
      width: 'min(92vw, 360px)',
      maxWidth: 360,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      animation: 'bubbleSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)',
    } as any}>

      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)',
        border: '1.5px solid rgba(56,189,248,0.5)',
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06), 0 0 20px rgba(56,189,248,0.15)',
        overflow: 'hidden',
      }}>

        {/* Progress bar сверху */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.08)' }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
            transition: 'width 0.1s linear',
            borderRadius: 3,
          }} />
        </div>

        <div style={{ padding: '10px 12px 12px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16 }}>{config.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#e2e8f0' }}>{config.title}</span>
            </div>
            <button
              onClick={dismiss}
              style={{
                width: 22, height: 22, borderRadius: 11,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                cursor: 'pointer', fontSize: 10, color: '#64748b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, flexShrink: 0,
              } as any}
            >✕</button>
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 } as any}>
            {config.lines.map((line, i) => {
              const isHighlight = config.highlight && line.includes(config.highlight);
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 6,
                  padding: '5px 8px',
                  background: isHighlight
                    ? 'linear-gradient(135deg, rgba(56,189,248,0.18), rgba(129,140,248,0.1))'
                    : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isHighlight ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 8,
                  boxShadow: isHighlight ? '0 0 8px rgba(56,189,248,0.12)' : 'none',
                }}>
                  <span style={{
                    fontSize: 10, fontWeight: 900, flexShrink: 0, marginTop: 1,
                    color: isHighlight ? '#38bdf8' : '#64748b',
                    minWidth: 12,
                  }}>{i + 1}.</span>
                  <span style={{
                    fontSize: 12,
                    color: isHighlight ? '#e2e8f0' : '#94a3b8',
                    fontWeight: isHighlight ? 700 : 500,
                    lineHeight: 1.4,
                  }}>
                    {config.highlight && line.includes(config.highlight)
                      ? <>
                          {line.split(config.highlight)[0]}
                          <span style={{
                            color: '#38bdf8', fontWeight: 800,
                            background: 'rgba(56,189,248,0.15)',
                            padding: '0 3px', borderRadius: 3,
                          }}>{config.highlight}</span>
                          {line.split(config.highlight)[1]}
                        </>
                      : line
                    }
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer hint */}
          <div style={{
            marginTop: 8, textAlign: 'center',
            fontSize: 10, color: '#475569', fontWeight: 600,
          }}>
            👆 Нажми чтобы закрыть · {Math.ceil(progress * autoHide / 100)}с
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bubbleSlideUp {
          0%   { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.95); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

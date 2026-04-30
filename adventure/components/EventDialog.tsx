// ═══════════════════════════════════════════════════════════════════════════
// EVENT DIALOG — Интерактивный popup-диалог для игровых событий
// Появляется по центру экрана, мини-чат с персонажами + выбор ответов
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react';
import {
  EventDialogScenario, DialogStep, DialogMessage, DialogChoice,
  getCharacter, CHARACTERS,
} from '../data/eventDialogs';

interface Props {
  scenario: EventDialogScenario;
  onComplete: (stars: number, totalStars: number) => void;
  onClose: () => void;
  driverName?: string;
  truckName?: string;
  truckNum?: string;    // Номер трака (например "517")
  trailerNum?: string;  // Номер трейлера (например "791")
}

export default function EventDialog({ scenario, onComplete, onClose, driverName, truckName, truckNum, trailerNum }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showChoices, setShowChoices] = useState(false);
  const [showAfterCorrect, setShowAfterCorrect] = useState(false);
  const [stars, setStars] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  const step = scenario.steps[currentStep];
  const allMessages = step?.messages ?? [];
  const afterMessages = step?.afterCorrect ?? [];

  // Анимация появления сообщений по одному
  useEffect(() => {
    setVisibleMessages(0);
    setShowChoices(false);
    setSelectedChoice(null);
    setShowAfterCorrect(false);
    setShowFeedback(null);
    setAttempts(0);

    let idx = 0;
    const showNext = () => {
      if (idx < allMessages.length) {
        idx++;
        setVisibleMessages(idx);
        scrollToBottom();
        const delay = allMessages[idx]?.delay ?? 600;
        timerRef.current = setTimeout(showNext, delay);
      } else {
        // Все сообщения показаны — показываем варианты
        if (step?.choices) {
          setTimeout(() => setShowChoices(true), 400);
        }
      }
    };
    timerRef.current = setTimeout(showNext, allMessages[0]?.delay ?? 500);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentStep]);

  function scrollToBottom() {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 100);
  }

  function handleChoice(idx: number) {
    if (selectedChoice !== null && step?.choices?.[selectedChoice]?.isCorrect) return; // уже правильный выбран

    const choice = step?.choices?.[idx];
    if (!choice) return;

    setSelectedChoice(idx);
    setAttempts(prev => prev + 1);
    setShowFeedback({ text: choice.feedback, isCorrect: choice.isCorrect });
    scrollToBottom();

    if (choice.isCorrect) {
      // Считаем звёзды: 1 попытка = 3⭐, 2 = 2⭐, 3+ = 1⭐
      const stepStars = attempts === 0 ? 3 : attempts === 1 ? 2 : 1;
      setStars(prev => prev + stepStars);

      // Показываем afterCorrect сообщения
      setTimeout(() => {
        setShowAfterCorrect(true);
        setShowChoices(false);
        scrollToBottom();
      }, 1500);
    } else {
      // Неправильный — разрешаем выбрать снова через 2 сек
      setTimeout(() => {
        setSelectedChoice(null);
        setShowFeedback(null);
      }, 3000);
    }
  }

  function handleNextStep() {
    if (currentStep < scenario.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setCompleted(true);
      onComplete(stars, scenario.totalStars * 3);
    }
  }

  // Заменяем плейсхолдеры в тексте
  function replaceVars(text: string): string {
    return text
      .replace(/\{driver\}/g, driverName ?? 'John')
      .replace(/\{truck\}/g, truckName ?? 'Truck 517')
      .replace(/\{truckNum\}/g, truckNum ?? '517')
      .replace(/\{trailerNum\}/g, trailerNum ?? '791')
      // Заменяем старые жёстко заданные номера на динамические
      .replace(/Truck 517/g, `TRK ${truckNum ?? '517'}`)
      .replace(/Truck 834/g, `TRK ${truckNum ?? '834'}`);
  }

  const isDark = true; // всегда тёмная тема в игре

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(460px, calc(100% - 32px))',
          maxHeight: 'min(600px, calc(100vh - 80px))',
          background: 'rgba(13,17,23,0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
          overflow: 'hidden',
        }}
      >
        {/* ── HEADER ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>{scenario.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#e2e8f0' }}>{scenario.title}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                Шаг {currentStep + 1} из {scenario.steps.length}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Звёзды */}
            <div style={{ display: 'flex', gap: 2 }}>
              {Array.from({ length: scenario.totalStars }).map((_, i) => (
                <span key={i} style={{ fontSize: 14, opacity: i < Math.ceil(stars / 3) ? 1 : 0.2 }}>⭐</span>
              ))}
            </div>
            <button onClick={onClose} style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(255,255,255,0.06)', border: 'none',
              color: '#64748b', fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          </div>
        </div>

        {/* ── PROGRESS BAR ── */}
        <div style={{ display: 'flex', gap: 3, padding: '8px 18px 4px' }}>
          {scenario.steps.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i < currentStep ? '#4ade80' : i === currentStep ? '#06b6d4' : 'rgba(255,255,255,0.08)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {/* ── CHAT AREA ── */}
        <div ref={scrollRef} style={{
          flex: 1, overflowY: 'auto', padding: '12px 18px',
          display: 'flex', flexDirection: 'column', gap: 10,
          scrollBehavior: 'smooth',
        }}>
          {/* Сообщения текущего шага */}
          {allMessages.slice(0, visibleMessages).map((msg, i) => (
            <MessageBubble key={`msg-${i}`} msg={msg} replaceVars={replaceVars} />
          ))}

          {/* Feedback */}
          {showFeedback && (
            <div style={{
              padding: '10px 14px', borderRadius: 12, margin: '4px 0',
              background: showFeedback.isCorrect ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
              border: `1px solid ${showFeedback.isCorrect ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
              fontSize: 12, lineHeight: 1.6,
              color: showFeedback.isCorrect ? '#4ade80' : '#fca5a5',
              animation: 'fadeSlideIn 0.3s ease',
            }}>
              {showFeedback.text}
            </div>
          )}

          {/* After correct messages */}
          {showAfterCorrect && afterMessages.map((msg, i) => (
            <MessageBubble key={`after-${i}`} msg={msg} replaceVars={replaceVars} />
          ))}
        </div>

        {/* ── CHOICES ── */}
        {showChoices && step?.choices && !showAfterCorrect && (
          <div style={{
            padding: '10px 18px 14px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
              Твой ответ:
            </div>
            {step.choices.map((choice, i) => {
              const isSelected = selectedChoice === i;
              const isCorrectChoice = choice.isCorrect;
              const wasWrong = isSelected && !isCorrectChoice;
              return (
                <button
                  key={i}
                  onClick={() => handleChoice(i)}
                  disabled={wasWrong}
                  style={{
                    padding: '10px 14px',
                    background: isSelected
                      ? (isCorrectChoice ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.1)')
                      : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${
                      isSelected
                        ? (isCorrectChoice ? 'rgba(74,222,128,0.5)' : 'rgba(248,113,113,0.4)')
                        : 'rgba(255,255,255,0.08)'
                    }`,
                    borderRadius: 12,
                    color: isSelected
                      ? (isCorrectChoice ? '#4ade80' : '#fca5a5')
                      : '#e2e8f0',
                    fontSize: 12, fontWeight: 600, lineHeight: 1.5,
                    cursor: wasWrong ? 'default' : 'pointer',
                    textAlign: 'left',
                    opacity: wasWrong ? 0.4 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {replaceVars(choice.text)}
                </button>
              );
            })}
          </div>
        )}

        {/* ── NEXT BUTTON ── */}
        {showAfterCorrect && (
          <div style={{ padding: '10px 18px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={handleNextStep}
              style={{
                width: '100%', padding: '12px',
                background: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
                border: 'none', borderRadius: 12,
                color: '#fff', fontSize: 14, fontWeight: 800,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {currentStep < scenario.steps.length - 1 ? 'Далее →' : '✅ Завершить'}
            </button>
          </div>
        )}

        {/* ── COMPLETION SCREEN ── */}
        {completed && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(13,17,23,0.97)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 16, padding: 32, borderRadius: 20,
          }}>
            <div style={{ fontSize: 48 }}>🎉</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#e2e8f0' }}>Ситуация решена!</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: scenario.totalStars }).map((_, i) => (
                <span key={i} style={{ fontSize: 28, opacity: i < Math.ceil(stars / 3) ? 1 : 0.2 }}>⭐</span>
              ))}
            </div>
            <div style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center' }}>
              +{scenario.rewards.xp} XP
              {scenario.rewards.money ? ` • +$${scenario.rewards.money}` : ''}
            </div>
            <button
              onClick={onClose}
              style={{
                marginTop: 8, padding: '12px 32px',
                background: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
                border: 'none', borderRadius: 12,
                color: '#fff', fontSize: 14, fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Закрыть
            </button>
          </div>
        )}

        <style>{`
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}

// ── MESSAGE BUBBLE ─────────────────────────────────────────────────────────

function MessageBubble({ msg, replaceVars }: { msg: DialogMessage; replaceVars: (t: string) => string }) {
  const char = getCharacter(msg.characterId);
  const isDispatcher = msg.characterId === 'dispatcher';

  return (
    <div style={{
      display: 'flex',
      flexDirection: isDispatcher ? 'row-reverse' : 'row',
      gap: 8, alignItems: 'flex-start',
      animation: 'fadeSlideIn 0.4s ease',
    }}>
      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: `${char.color}15`,
        border: `1.5px solid ${char.color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <img src={char.avatar} width={28} height={28} style={{ display: 'block' }} />
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: '80%' }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: char.color,
          marginBottom: 3,
        }}>
          {char.name} <span style={{ fontWeight: 500, color: '#64748b' }}>• {char.role}</span>
        </div>
        <div style={{
          padding: '10px 14px',
          background: isDispatcher ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${isDispatcher ? 'rgba(6,182,212,0.25)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: isDispatcher ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
          fontSize: 13, lineHeight: 1.6, color: '#e2e8f0',
        }}>
          {replaceVars(msg.text)}
        </div>
      </div>
    </div>
  );
}

/**
 * DialogBubbleInline — Glassmorphism карточка для онбординга
 * ЭТАЛОННАЯ СИСТЕМА #3
 * 
 * Spotlight: вырезает "дырку" в оверлее вокруг подсвеченного элемента
 */
import React, { useEffect, useState, useRef } from 'react';
import { OnboardingStep } from '../data/onboardingData';

interface Props {
  step: OnboardingStep;
  onNext: () => void;
  onSkip: () => void;
  currentStepIndex: number;
  totalSteps: number;
  progress: number;
}

export default function DialogBubbleInline({
  step, onNext, onSkip, currentStepIndex, totalSteps, progress,
}: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    setIsVisible(false);
    setSpotlightRect(null);
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Найти и замерить подсвеченный элемент
      if (step.highlightElement) {
        const el = document.querySelector(step.highlightElement) as HTMLElement;
        if (el) {
          setSpotlightRect(el.getBoundingClientRect());
        }
      }
    }, step.delay || 300);
    return () => clearTimeout(timer);
  }, [step]);

  // Обновляем позицию spotlight при скролле/ресайзе
  useEffect(() => {
    if (!step.highlightElement || !isVisible) return;
    const update = () => {
      const el = document.querySelector(step.highlightElement!) as HTMLElement;
      if (el) setSpotlightRect(el.getBoundingClientRect());
    };
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    const poll = setInterval(update, 300);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      clearInterval(poll);
    };
  }, [step.highlightElement, isVisible]);

  const isManualNext = step.requiredAction === 'manual_next';
  const PAD = 6; // padding вокруг spotlight

  // Позиция карточки
  const getPosition = (): React.CSSProperties => {
    // Если есть spotlight — позиционируем карточку рядом с ним
    if (spotlightRect) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cardW = Math.min(vw * 0.9, step.position === 'center' ? 600 : 400);

      // Карточка снизу от spotlight если он в верхней половине, иначе сверху
      if (spotlightRect.top < vh / 2) {
        return {
          top: spotlightRect.bottom + PAD + 12,
          left: Math.max(12, Math.min(vw - cardW - 12, spotlightRect.left + spotlightRect.width / 2 - cardW / 2)),
        };
      } else {
        return {
          bottom: vh - spotlightRect.top + PAD + 12,
          left: Math.max(12, Math.min(vw - cardW - 12, spotlightRect.left + spotlightRect.width / 2 - cardW / 2)),
        };
      }
    }

    switch (step.position) {
      case 'top':
        return { top: 80, left: '50%', transform: 'translateX(-50%)' };
      case 'bottom':
        return { bottom: 80, left: '50%', transform: 'translateX(-50%)' };
      case 'left':
        return { left: 24, top: '50%', transform: 'translateY(-50%)' };
      case 'right':
        return { right: 24, top: '50%', transform: 'translateY(-50%)' };
      case 'center':
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  // Генерируем CSS clip-path для "дырки" в оверлее
  const getClipPath = (): string | undefined => {
    if (!spotlightRect) return undefined;
    const t = Math.max(0, spotlightRect.top - PAD);
    const l = Math.max(0, spotlightRect.left - PAD);
    const b = spotlightRect.bottom + PAD;
    const r = spotlightRect.right + PAD;
    const rad = 12;
    // Polygon: внешний прямоугольник (весь экран) + внутренний прямоугольник (дырка)
    // Используем evenodd для вырезания
    return undefined; // clip-path не поддерживает скругление, используем box-shadow вместо
  };

  return (
    <>
      {/* Overlay — лёгкое затемнение, игра видна за ним */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.35)',
        zIndex: 9998,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.4s ease',
        // На шагах с действием — пропускаем клики через оверлей
        pointerEvents: isVisible ? (isManualNext ? 'auto' : 'none') : 'none',
      }} />

      {/* Spotlight — рамка вокруг элемента (fixed div, не зависит от stacking context) */}
      {spotlightRect && isVisible && (
        <>
          {/* Рамка — яркая, пульсирующая, поверх всего */}
          <div style={{
            position: 'fixed',
            top: spotlightRect.top - PAD,
            left: spotlightRect.left - PAD,
            width: spotlightRect.width + PAD * 2,
            height: spotlightRect.height + PAD * 2,
            zIndex: 10001,
            borderRadius: 16,
            border: '3px solid #06b6d4',
            boxShadow: '0 0 20px rgba(6,182,212,0.6), 0 0 40px rgba(6,182,212,0.3), inset 0 0 20px rgba(6,182,212,0.1)',
            animation: 'onbFramePulse 1.5s ease-in-out infinite',
            pointerEvents: 'none',
            transition: 'all 0.3s ease',
          }} />
          {/* Стрелка от рамки к карточке диалога */}
          {spotlightRect.top < window.innerHeight / 2 && (
            <div style={{
              position: 'fixed',
              top: spotlightRect.bottom + PAD + 2,
              left: spotlightRect.left + spotlightRect.width / 2 - 8,
              width: 0, height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '10px solid #06b6d4',
              zIndex: 10001,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 2px 4px rgba(6,182,212,0.5))',
            }} />
          )}
        </>
      )}

      {/* Карточка */}
      <div style={{
        position: 'fixed',
        zIndex: 10000,
        ...getPosition(),
        maxWidth: step.position === 'center' ? 600 : 400,
        width: '90%',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {/* Glassmorphism Card */}
        <div style={{
          position: 'relative',
          borderRadius: 16,
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.37)',
        }}>
          {/* Progress Bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 4,
            background: 'rgba(255,255,255,0.1)',
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #06b6d4, #3b82f6)',
              transition: 'width 0.5s ease',
            }} />
          </div>

          {/* Content */}
          <div style={{ padding: '24px 24px 20px', paddingTop: 32 }}>
            {/* Header: Avatar + Name */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16,
            }}>
              <div style={{
                flexShrink: 0, width: 64, height: 64, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36,
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.3)',
              }}>
                {step.avatar}
              </div>
              <div>
                <div style={{
                  fontSize: 20, fontWeight: 800, color: '#fff',
                }}>{step.title}</div>
                <div style={{
                  fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 2,
                }}>
                  Шаг {currentStepIndex + 1} из {totalSteps}
                </div>
              </div>
            </div>

            {/* Message Text */}
            <div style={{
              marginBottom: 24, padding: 16, borderRadius: 12,
              color: 'rgba(255,255,255,0.9)',
              fontSize: 15, lineHeight: 1.7, fontWeight: 500,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              {step.text}
            </div>

            {/* Action Hint */}
            {!isManualNext && (
              <div style={{
                marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 14, color: '#67e8f9',
              }}>
                <span style={{ animation: 'onbPulseText 2s ease-in-out infinite' }}>👆</span>
                <span>Выполните действие для продолжения...</span>
              </div>
            )}

            {/* Buttons */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            }}>
              <button onClick={onSkip} style={{
                padding: '8px 16px', borderRadius: 8,
                fontSize: 14, fontWeight: 600,
                color: 'rgba(255,255,255,0.7)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                Пропустить обучение
              </button>

              {isManualNext && (
                <button onClick={onNext} style={{
                  padding: '12px 24px', borderRadius: 8,
                  fontWeight: 800, fontSize: 15, color: '#fff',
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(6,182,212,0.4)',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {currentStepIndex === totalSteps - 1 ? 'Начать игру! 🚀' : 'Далее →'}
                </button>
              )}
            </div>
          </div>

          {/* Decorative Glow */}
          <div style={{
            position: 'absolute', top: -80, right: -80,
            width: 160, height: 160, borderRadius: '50%',
            opacity: 0.3, filter: 'blur(48px)',
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            pointerEvents: 'none',
          }} />
        </div>
      </div>

      <style>{`
        @keyframes onbFramePulse {
          0%, 100% {
            border-color: #06b6d4;
            box-shadow: 0 0 20px rgba(6,182,212,0.6), 0 0 40px rgba(6,182,212,0.3), inset 0 0 20px rgba(6,182,212,0.1);
          }
          50% {
            border-color: #22d3ee;
            box-shadow: 0 0 30px rgba(6,182,212,0.8), 0 0 60px rgba(6,182,212,0.4), inset 0 0 30px rgba(6,182,212,0.15);
          }
        }
        @keyframes onbPulseText {
          0%, 100% { opacity: 1; transform: translateY(0); }
          50% { opacity: 0.6; transform: translateY(-3px); }
        }
      `}</style>
    </>
  );
}

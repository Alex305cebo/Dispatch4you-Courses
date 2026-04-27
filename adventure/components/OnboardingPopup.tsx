/**
 * OnboardingPopup — glassmorphism-карточка с инструкцией шага онбординга.
 *
 * Содержит: аватар + имя персонажа, иконку + заголовок, текст (прямая речь),
 * Step_Indicator "N/12", кнопку "Пропустить".
 */
import { useState, useEffect, useRef } from 'react';
import type { OnboardingStepConfig } from '../data/onboardingConfig';
import { CHARACTER_AVATARS, CHARACTER_ROLE_LABEL } from '../data/onboardingConfig';

export interface OnboardingPopupProps {
  step: OnboardingStepConfig;
  currentStep: number;
  totalSteps: number;
  onSkip: () => void;
  visible: boolean;
  position: { top: number; left: number };
}

export default function OnboardingPopup({
  step,
  currentStep,
  totalSteps,
  onSkip,
  visible,
  position,
}: OnboardingPopupProps) {
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState<'in' | 'out' | null>(null);
  const prevVisible = useRef(visible);

  useEffect(() => {
    if (visible && !prevVisible.current) {
      setMounted(true);
      setAnimating('in');
      const t = setTimeout(() => setAnimating(null), 280);
      prevVisible.current = visible;
      return () => clearTimeout(t);
    }
    if (!visible && prevVisible.current) {
      setAnimating('out');
      const t = setTimeout(() => {
        setMounted(false);
        setAnimating(null);
      }, 180);
      prevVisible.current = visible;
      return () => clearTimeout(t);
    }
    if (visible && !mounted) {
      setMounted(true);
      setAnimating('in');
      const t = setTimeout(() => setAnimating(null), 280);
      prevVisible.current = visible;
      return () => clearTimeout(t);
    }
    prevVisible.current = visible;
  }, [visible]);

  if (!mounted && !visible) return null;

  const avatar = CHARACTER_AVATARS[step.character] ?? { emoji: '👤', color: '#94a3b8', animatedUrl: '' };
  const roleLabel = CHARACTER_ROLE_LABEL[step.character] ?? step.character;

  const animStyle: React.CSSProperties =
    animating === 'in'
      ? { animation: 'onbPopupIn 280ms cubic-bezier(0.34,1.56,0.64,1) forwards' }
      : animating === 'out'
        ? { animation: 'onbPopupOut 180ms ease-in forwards' }
        : {};

  return (
    <div
      data-testid="onboarding-popup"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 10002,
        width: 'min(92vw, 340px)',
        maxWidth: 340,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        pointerEvents: 'auto',
        ...animStyle,
      }}
    >
      {/* Glassmorphism card */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.93) 0%, rgba(30,58,95,0.89) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1.5px solid ${avatar.color}55`,
          borderRadius: 16,
          boxShadow: `0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06), 0 0 24px ${avatar.color}22`,
          overflow: 'hidden',
        }}
      >
        {/* Цветная полоска сверху — цвет персонажа */}
        <div style={{
          height: 3,
          background: `linear-gradient(90deg, ${avatar.color}, ${avatar.color}44)`,
        }} />

        <div style={{ padding: '12px 16px 12px' }}>

          {/* ── ПЕРСОНАЖ: аватар + имя + роль ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 12,
            paddingBottom: 10,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            {/* Аватар-эмодзи в кружке */}
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: `${avatar.color}22`,
              border: `2px solid ${avatar.color}66`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              flexShrink: 0,
              boxShadow: `0 0 12px ${avatar.color}33`,
            }}>
              {avatar.animatedUrl ? (
                <img src={avatar.animatedUrl} width={32} height={32} style={{ objectFit: 'contain' }} alt={step.characterName} />
              ) : (
                avatar.emoji
              )}
            </div>

            {/* Имя + роль */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 14,
                fontWeight: 800,
                color: avatar.color,
                lineHeight: 1.2,
              }}>
                {step.characterName}
              </div>
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#64748b',
                marginTop: 1,
              }}>
                {roleLabel}
              </div>
            </div>

            {/* Step indicator */}
            <span
              data-testid="step-indicator"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#94a3b8',
                background: 'rgba(255,255,255,0.07)',
                padding: '3px 8px',
                borderRadius: 8,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {currentStep}/{totalSteps}
            </span>
          </div>

          {/* ── ЗАГОЛОВОК: иконка + title ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            marginBottom: 8,
          }}>
            <span style={{ fontSize: 18 }}>{step.icon}</span>
            <span style={{
              fontSize: 14,
              fontWeight: 800,
              color: '#e2e8f0',
              lineHeight: 1.3,
            }}>
              {step.title}
            </span>
          </div>

          {/* ── ТЕКСТ (прямая речь) ── */}
          <p style={{
            fontSize: 13,
            color: '#cbd5e1',
            lineHeight: 1.6,
            margin: '0 0 14px 0',
            fontWeight: 500,
            fontStyle: 'italic',
          }}>
            «{step.text}»
          </p>

          {/* ── FOOTER: кнопка пропустить ── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              data-testid="skip-button"
              onClick={onSkip}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: 600,
                color: '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.color = '#64748b';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              Пропустить
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes onbPopupIn {
          0%   { opacity: 0; transform: scale(0.92) translateY(6px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes onbPopupOut {
          0%   { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(0.92) translateY(6px); }
        }
      `}</style>
    </div>
  );
}

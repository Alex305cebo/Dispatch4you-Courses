/**
 * OnboardingPopup — glassmorphism-карточка с инструкцией шага онбординга.
 *
 * Содержит: иконку + заголовок, текст инструкции, Step_Indicator "N/12",
 * кнопку "Пропустить". НЕ содержит Action_Button (она отдельно).
 *
 * Анимация: scale+opacity appear (200–300ms), disappear (150–200ms).
 */
import { useState, useEffect, useRef } from 'react';
import type { OnboardingStepConfig } from '../data/onboardingConfig';

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

  // Handle appear / disappear animation
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
          background: 'linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(30,58,95,0.88) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(6,182,212,0.45)',
          borderRadius: 16,
          boxShadow:
            '0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06), 0 0 24px rgba(6,182,212,0.2)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '14px 16px 12px' }}>
          {/* Header: icon + title + step indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>{step.icon}</span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: '#e2e8f0',
                  lineHeight: 1.3,
                }}
              >
                {step.title}
              </span>
            </div>

            {/* Step indicator */}
            <span
              data-testid="step-indicator"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#94a3b8',
                background: 'rgba(255,255,255,0.08)',
                padding: '3px 8px',
                borderRadius: 8,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {currentStep}/{totalSteps}
            </span>
          </div>

          {/* Instruction text */}
          <p
            style={{
              fontSize: 13,
              color: '#e2e8f0',
              lineHeight: 1.55,
              margin: '0 0 14px 0',
              fontWeight: 500,
            }}
          >
            {step.text}
          </p>

          {/* Footer: skip button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              data-testid="skip-button"
              onClick={onSkip}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: 600,
                color: '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Пропустить
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes onbPopupIn {
          0%   { opacity: 0; transform: scale(0.92); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes onbPopupOut {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.92); }
        }
      `}</style>
    </div>
  );
}

/**
 * DialogBubble Component
 * Glassmorphism-стиль диалоговое окно для системы обучения
 */

import React, { useEffect, useState } from 'react';
import { OnboardingStep } from '../data/onboardingData';

interface DialogBubbleProps {
  step: OnboardingStep;
  onNext: () => void;
  onSkip: () => void;
  currentStepIndex: number;
  totalSteps: number;
  progress: number;
}

export const DialogBubble: React.FC<DialogBubbleProps> = ({
  step,
  onNext,
  onSkip,
  currentStepIndex,
  totalSteps,
  progress,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Анимация появления с задержкой
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsVisible(true);
      setIsAnimating(false);
    }, step.delay || 300);

    return () => clearTimeout(timer);
  }, [step]);

  // Определяем позицию диалога
  const getPositionStyles = () => {
    switch (step.position) {
      case 'top':
        return 'top-20 left-1/2 -translate-x-1/2';
      case 'bottom':
        return 'bottom-20 left-1/2 -translate-x-1/2';
      case 'left':
        return 'left-6 top-1/2 -translate-y-1/2';
      case 'right':
        return 'right-6 top-1/2 -translate-y-1/2';
      case 'center':
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  const isManualNext = step.requiredAction === 'manual_next';

  return (
    <>
      {/* Overlay с затемнением */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transition-opacity duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
      />

      {/* Диалоговое окно */}
      <div
        className={`fixed z-[9999] ${getPositionStyles()} transition-all duration-500 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          maxWidth: step.position === 'center' ? '600px' : '400px',
          width: '90%',
        }}
      >
        {/* Glassmorphism Card */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          }}
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-6 pt-8">
            {/* Header: Avatar + Name */}
            <div className="flex items-center gap-4 mb-4">
              <div
                className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-4xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                {step.avatar}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{step.speakerName}</h3>
                <p className="text-sm text-white/70">
                  Шаг {currentStepIndex + 1} из {totalSteps}
                </p>
              </div>
            </div>

            {/* Message Text */}
            <div
              className="mb-6 p-4 rounded-xl text-white/90 leading-relaxed"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {step.text}
            </div>

            {/* Action Hint */}
            {!isManualNext && (
              <div className="mb-4 flex items-center gap-2 text-sm text-cyan-300">
                <span className="animate-pulse">⏳</span>
                <span>Выполните действие для продолжения...</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-between gap-3">
              {/* Skip Button */}
              <button
                onClick={onSkip}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white/70 hover:text-white transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                Пропустить обучение
              </button>

              {/* Next Button (только для manual_next) */}
              {isManualNext && (
                <button
                  onClick={onNext}
                  className="px-6 py-3 rounded-lg font-bold text-white transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                    boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)',
                  }}
                >
                  {currentStepIndex === totalSteps - 1 ? 'Начать игру! 🚀' : 'Далее →'}
                </button>
              )}
            </div>
          </div>

          {/* Decorative Glow */}
          <div
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-30 blur-3xl"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            }}
          />
        </div>

        {/* Pointer Arrow (для non-center позиций) */}
        {step.position !== 'center' && (
          <div
            className="absolute w-4 h-4 bg-white/10 backdrop-blur-lg rotate-45"
            style={{
              ...(step.position === 'top' && { bottom: '-8px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' }),
              ...(step.position === 'bottom' && { top: '-8px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' }),
              ...(step.position === 'left' && { right: '-8px', top: '50%', transform: 'translateY(-50%) rotate(45deg)' }),
              ...(step.position === 'right' && { left: '-8px', top: '50%', transform: 'translateY(-50%) rotate(45deg)' }),
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          />
        )}
      </div>

      {/* Highlight Element (если указан) */}
      {step.highlightElement && (
        <style>{`
          ${step.highlightElement} {
            position: relative;
            z-index: 9999 !important;
            animation: onboarding-pulse 2s ease-in-out infinite;
            box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.5), 0 0 20px rgba(6, 182, 212, 0.3) !important;
            border-radius: 12px;
          }
          
          @keyframes onboarding-pulse {
            0%, 100% {
              box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.5), 0 0 20px rgba(6, 182, 212, 0.3);
            }
            50% {
              box-shadow: 0 0 0 8px rgba(6, 182, 212, 0.3), 0 0 30px rgba(6, 182, 212, 0.5);
            }
          }
        `}</style>
      )}
    </>
  );
};

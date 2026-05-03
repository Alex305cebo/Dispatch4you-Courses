/**
 * OnboardingWrapper Component
 * Обёртка для интеграции системы обучения в игру
 * Использование: оберните главный компонент игры этим компонентом
 */

import React, { useEffect } from 'react';
import { useOnboarding } from '../hooks/useOnboarding';
import DialogBubbleInline from './DialogBubbleInline';

interface OnboardingWrapperProps {
  children: React.ReactNode;
  isNewGame: boolean;
  onActionTrigger?: (action: string) => void; // Callback для внешних триггеров
}

export const OnboardingWrapper: React.FC<OnboardingWrapperProps> = ({
  children,
  isNewGame,
  onActionTrigger,
}) => {
  const {
    currentStep,
    isOnboardingActive,
    isOnboardingComplete,
    currentStepIndex,
    totalSteps,
    progress,
    triggerAction,
    skipOnboarding,
    goToNextStep,
  } = useOnboarding(isNewGame);

  // Экспортируем triggerAction наружу через callback
  useEffect(() => {
    if (onActionTrigger && isOnboardingActive) {
      // Передаём функцию триггера родительскому компоненту
      (window as any).__onboardingTrigger = triggerAction;
    }

    return () => {
      delete (window as any).__onboardingTrigger;
    };
  }, [triggerAction, isOnboardingActive, onActionTrigger]);

  // Блокировка определённых функций во время обучения
  const isFeatureBlocked = (featureName: string): boolean => {
    if (!isOnboardingActive) return false;

    // Логика блокировки в зависимости от текущего шага
    const blockedFeatures: Record<string, string[]> = {
      'welcome': ['load_board', 'chat', 'settings'],
      'explain_goal': ['load_board', 'chat', 'settings'],
      'show_load_board': ['chat', 'settings'],
      'select_first_load': ['chat', 'settings'],
      // Добавьте свои правила блокировки
    };

    const currentStepId = currentStep?.id || '';
    return blockedFeatures[currentStepId]?.includes(featureName) || false;
  };

  // Экспортируем функцию проверки блокировки
  useEffect(() => {
    (window as any).__isFeatureBlocked = isFeatureBlocked;
  }, [isOnboardingActive, currentStep]);

  return (
    <>
      {children}

      {/* Показываем диалог только если обучение активно */}
      {isOnboardingActive && currentStep && (
        <DialogBubbleInline
          step={currentStep}
          onNext={goToNextStep}
          onSkip={skipOnboarding}
          currentStepIndex={currentStepIndex}
          totalSteps={totalSteps}
          progress={progress}
        />
      )}

      {/* Overlay для блокировки кликов вне подсвеченных элементов */}
      {isOnboardingActive && currentStep?.highlightElement && (
        <div
          className="fixed inset-0 z-[9997]"
          style={{
            pointerEvents: 'auto',
            background: 'transparent',
          }}
          onClick={(e) => {
            // Блокируем клики вне подсвеченного элемента
            const target = e.target as HTMLElement;
            const highlightedElement = document.querySelector(currentStep.highlightElement!);
            
            if (highlightedElement && !highlightedElement.contains(target)) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        />
      )}
    </>
  );
};

// Хелпер-функция для триггера действий из любого места приложения
export const triggerOnboardingAction = (action: string) => {
  const trigger = (window as any).__onboardingTrigger;
  if (trigger && typeof trigger === 'function') {
    trigger(action);
  }
};

// Хелпер-функция для проверки блокировки функций
export const isFeatureBlockedByOnboarding = (featureName: string): boolean => {
  const checker = (window as any).__isFeatureBlocked;
  if (checker && typeof checker === 'function') {
    return checker(featureName);
  }
  return false;
};

/**
 * useOnboarding Hook
 * Управление состоянием системы обучения
 */

import { useState, useEffect, useCallback } from 'react';
import { onboardingSteps, OnboardingStep, OnboardingActionType, isLastStep } from '../data/onboardingData';

interface UseOnboardingReturn {
  currentStep: OnboardingStep | null;
  isOnboardingActive: boolean;
  isOnboardingComplete: boolean;
  currentStepIndex: number;
  totalSteps: number;
  progress: number; // 0-100
  triggerAction: (action: OnboardingActionType) => void;
  skipOnboarding: () => void;
  restartOnboarding: () => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

export const useOnboarding = (isNewGame: boolean = false): UseOnboardingReturn => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isOnboardingActive, setIsOnboardingActive] = useState<boolean>(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean>(false);

  // Инициализация обучения для новых игроков
  useEffect(() => {
    // Проверяем localStorage - прошёл ли игрок обучение ранее
    const hasCompletedOnboarding = localStorage.getItem('dispatch-onboarding-completed');
    
    if (isNewGame && !hasCompletedOnboarding) {
      setIsOnboardingActive(true);
      setCurrentStepIndex(0);
      setIsOnboardingComplete(false);
    } else if (hasCompletedOnboarding) {
      setIsOnboardingComplete(true);
      setIsOnboardingActive(false);
    }
  }, [isNewGame]);

  const currentStep = isOnboardingActive && currentStepIndex < onboardingSteps.length
    ? onboardingSteps[currentStepIndex]
    : null;

  const totalSteps = onboardingSteps.length;
  const progress = totalSteps > 0 ? Math.round((currentStepIndex / totalSteps) * 100) : 0;

  // Переход к следующему шагу
  const goToNextStep = useCallback(() => {
    if (currentStepIndex < onboardingSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Обучение завершено
      setIsOnboardingComplete(true);
      setIsOnboardingActive(false);
      localStorage.setItem('dispatch-onboarding-completed', 'true');
      
      // Опционально: отправить аналитику
      console.log('✅ Onboarding completed!');
    }
  }, [currentStepIndex]);

  // Переход к предыдущему шагу
  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  // Триггер действия (когда игрок выполняет требуемое действие)
  const triggerAction = useCallback((action: OnboardingActionType) => {
    if (!currentStep) return;

    // Проверяем, соответствует ли действие требуемому
    if (currentStep.requiredAction === action) {
      console.log(`✅ Action completed: ${action}`);
      
      // Автоматический переход к следующему шагу
      setTimeout(() => {
        goToNextStep();
      }, 300); // Небольшая задержка для плавности
    }
  }, [currentStep, goToNextStep]);

  // Пропустить обучение
  const skipOnboarding = useCallback(() => {
    setIsOnboardingActive(false);
    setIsOnboardingComplete(true);
    localStorage.setItem('dispatch-onboarding-completed', 'true');
    console.log('⏭️ Onboarding skipped');
  }, []);

  // Перезапустить обучение
  const restartOnboarding = useCallback(() => {
    setCurrentStepIndex(0);
    setIsOnboardingActive(true);
    setIsOnboardingComplete(false);
    localStorage.removeItem('dispatch-onboarding-completed');
    console.log('🔄 Onboarding restarted');
  }, []);

  return {
    currentStep,
    isOnboardingActive,
    isOnboardingComplete,
    currentStepIndex,
    totalSteps,
    progress,
    triggerAction,
    skipOnboarding,
    restartOnboarding,
    goToNextStep,
    goToPreviousStep,
  };
};

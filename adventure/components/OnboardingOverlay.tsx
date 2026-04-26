/**
 * OnboardingOverlay — полноэкранный координатор онбординга.
 *
 * - Тёмный оверлей rgba(0,0,0,0.6) с spotlight cutout вокруг целевого элемента
 * - Клик по оверлею = hidePopup() (НЕ продвижение шага)
 * - useEffect cleanup для reappear таймера
 * - Находит target через querySelector('[data-onboarding="..."]')
 * - Fallback: нет target → попап по центру, нет spotlight
 * - Координирует рендер OnboardingPopup и OnboardingActionButton
 * - Читает step из onboardingStore и config из onboardingConfig
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useOnboardingStore } from '../store/onboardingStore';
import { ONBOARDING_STEPS, calcPopupPosition } from '../data/onboardingConfig';
import OnboardingPopup from './OnboardingPopup';
import OnboardingActionButton from './OnboardingActionButton';

const TOTAL_STEPS = 12;
const POPUP_SIZE = { width: 340, height: 220 }; // estimated for calcPopupPosition
const SPOTLIGHT_PADDING = 8; // px around target element

export default function OnboardingOverlay() {
  const step = useOnboardingStore(s => s.step);
  const isActive = useOnboardingStore(s => s.isActive);
  const popupVisible = useOnboardingStore(s => s.popupVisible);
  const reappearTimerId = useOnboardingStore(s => s.reappearTimerId);
  const hidePopup = useOnboardingStore(s => s.hidePopup);
  const nextStep = useOnboardingStore(s => s.nextStep);
  const skip = useOnboardingStore(s => s.skip);

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Current step config
  const stepConfig = ONBOARDING_STEPS.find(s => s.id === step) ?? ONBOARDING_STEPS[0];

  // Find target element and track its position
  useEffect(() => {
    if (!isActive || !stepConfig.targetSelector) {
      setTargetRect(null);
      return;
    }

    function updateRect() {
      const el = document.querySelector(stepConfig.targetSelector!);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    }

    // Initial find (small delay for autoSwitch to take effect)
    const initTimer = setTimeout(updateRect, 100);

    // Re-measure on scroll/resize
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    // Poll briefly in case element appears after autoSwitch
    const pollTimer = setInterval(updateRect, 500);
    const stopPoll = setTimeout(() => clearInterval(pollTimer), 3000);

    return () => {
      clearTimeout(initTimer);
      clearTimeout(stopPoll);
      clearInterval(pollTimer);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [isActive, step, stepConfig.targetSelector]);

  // Cleanup reappear timer on unmount
  useEffect(() => {
    return () => {
      if (reappearTimerId !== null) {
        clearTimeout(reappearTimerId);
      }
    };
  }, [reappearTimerId]);

  // Calculate popup position
  const viewport = {
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  };
  const popupPosition = calcPopupPosition(
    targetRect,
    POPUP_SIZE,
    viewport,
    stepConfig.popupPosition,
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      // Клик по оверлею НЕ скрывает попап — попап всегда видим
      // Продвижение только через Action_Button
    },
    [],
  );

  const handleNextStep = useCallback(() => {
    nextStep();
  }, [nextStep]);

  const handleSkip = useCallback(() => {
    skip();
  }, [skip]);

  if (!isActive) return null;

  // Spotlight cutout via box-shadow trick
  const spotlightStyle: React.CSSProperties = targetRect
    ? {
        position: 'fixed',
        top: targetRect.top - SPOTLIGHT_PADDING,
        left: targetRect.left - SPOTLIGHT_PADDING,
        width: targetRect.width + SPOTLIGHT_PADDING * 2,
        height: targetRect.height + SPOTLIGHT_PADDING * 2,
        borderRadius: 12,
        boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
        zIndex: 10000,
        pointerEvents: 'none',
        border: '2px solid rgba(6,182,212,0.5)',
        animation: 'onbSpotlightPulse 1.8s ease-in-out infinite',
      }
    : {};

  const hasTarget = !!targetRect;

  const content = (
    <div
      ref={overlayRef}
      data-testid="onboarding-overlay"
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: targetRect ? 'transparent' : 'rgba(0,0,0,0.6)',
        pointerEvents: popupVisible ? 'auto' : 'none',
      }}
    >
      {targetRect && <div style={spotlightStyle} />}

      <OnboardingPopup
        step={stepConfig}
        currentStep={step}
        totalSteps={TOTAL_STEPS}
        onSkip={handleSkip}
        visible={popupVisible}
        position={popupPosition}
      />

      {!hasTarget && popupVisible && (
        <div
          style={{
            position: 'fixed',
            top: popupPosition.top + POPUP_SIZE.height - 50,
            left: popupPosition.left,
            width: POPUP_SIZE.width,
            zIndex: 10003,
            pointerEvents: 'auto',
          }}
        >
          <OnboardingActionButton
            text={stepConfig.actionButtonText}
            onClick={handleNextStep}
            targetRect={null}
            visible={true}
          />
        </div>
      )}

      {hasTarget && (
        <OnboardingActionButton
          text={stepConfig.actionButtonText}
          onClick={handleNextStep}
          targetRect={targetRect}
          visible={true}
        />
      )}

      <style>{`
        @keyframes onbSpotlightPulse {
          0%, 100% {
            border-color: rgba(6,182,212,0.5);
            box-shadow: 0 0 0 9999px rgba(0,0,0,0.6), 0 0 16px rgba(6,182,212,0.3);
          }
          50% {
            border-color: rgba(6,182,212,0.8);
            box-shadow: 0 0 0 9999px rgba(0,0,0,0.6), 0 0 28px rgba(6,182,212,0.5);
          }
        }
      `}</style>
    </div>
  );

  // Render via Portal to document.body — avoids React Native View/div conflict
  if (typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }
  return null;
}

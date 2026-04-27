/**
 * OnboardingStore — Property Tests
 *
 * Property 1: Переход шага с очисткой таймера
 *   Для любого step ∈ [1..11] и reappearTimerId → nextStep() →
 *   step+1, popupVisible=true, reappearTimerId=null
 *
 * Property 3: Пропуск завершает онбординг из любого шага
 *   Для любого step ∈ [1..12] → skip() →
 *   isCompleted=true, isActive=false
 */

import * as fc from 'fast-check';
import { useOnboardingStore } from './onboardingStore';

// ── Мокаем window для node-окружения ──────────────────────────────────────
beforeAll(() => {
  if (typeof global.window === 'undefined') {
    (global as any).window = {
      setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms),
      clearTimeout: (id: any) => clearTimeout(id),
    };
  }
  // Мокаем localStorage
  if (typeof global.localStorage === 'undefined') {
    const store: Record<string, string> = {};
    (global as any).localStorage = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    };
  }
});

// Сбрасываем стор перед каждым тестом
beforeEach(() => {
  useOnboardingStore.setState({
    step: 1,
    isActive: false,
    popupVisible: false,
    isCompleted: false,
    reappearTimerId: null,
    nickname: 'test-player',
  });
});

// ── PROPERTY 1: Переход шага с очисткой таймера ────────────────────────────
test('Property 1: nextStep() increments step, sets popupVisible=true, clears reappearTimerId', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 11 }),
      fc.option(fc.integer({ min: 1, max: 9999 }), { nil: null }),
      (currentStep, timerId) => {
        // Устанавливаем состояние
        useOnboardingStore.setState({
          step: currentStep,
          isActive: true,
          popupVisible: false,
          isCompleted: false,
          reappearTimerId: timerId,
        });

        useOnboardingStore.getState().nextStep();

        const state = useOnboardingStore.getState();

        // step должен увеличиться на 1
        expect(state.step).toBe(currentStep + 1);
        // попап должен стать видимым
        expect(state.popupVisible).toBe(true);
        // таймер должен быть очищен
        expect(state.reappearTimerId).toBeNull();
      },
    ),
    { numRuns: 50 },
  );
});

// ── PROPERTY 3: Пропуск завершает онбординг из любого шага ────────────────
test('Property 3: skip() sets isCompleted=true and isActive=false from any step', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 12 }),
      (currentStep) => {
        useOnboardingStore.setState({
          step: currentStep,
          isActive: true,
          isCompleted: false,
          nickname: 'test-player',
        });

        useOnboardingStore.getState().skip();

        const state = useOnboardingStore.getState();

        expect(state.isCompleted).toBe(true);
        expect(state.isActive).toBe(false);
        expect(state.popupVisible).toBe(false);
      },
    ),
    { numRuns: 50 },
  );
});

// ── БОНУС: Guard от двойных кликов ────────────────────────────────────────
test('nextStep() is a no-op when isActive=false', () => {
  useOnboardingStore.setState({ step: 5, isActive: false });
  useOnboardingStore.getState().nextStep();
  expect(useOnboardingStore.getState().step).toBe(5);
});

// ── БОНУС: Последний шаг вызывает complete() ──────────────────────────────
test('nextStep() on step 12 calls complete() → isCompleted=true', () => {
  useOnboardingStore.setState({
    step: 12,
    isActive: true,
    isCompleted: false,
    nickname: 'test-player',
  });
  useOnboardingStore.getState().nextStep();
  const state = useOnboardingStore.getState();
  expect(state.isCompleted).toBe(true);
  expect(state.isActive).toBe(false);
});

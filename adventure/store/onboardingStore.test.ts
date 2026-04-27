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
import { ONBOARDING_STEPS, calcPopupPosition } from '../data/onboardingConfig';

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

// ── PROPERTY 2: Скрытие попапа сохраняет активное состояние ──────────────
test('Property 2: hidePopup() sets popupVisible=false but keeps isActive=true', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 12 }),
      (currentStep) => {
        useOnboardingStore.setState({
          step: currentStep,
          isActive: true,
          popupVisible: true,
        });

        useOnboardingStore.getState().hidePopup();

        const state = useOnboardingStore.getState();
        expect(state.popupVisible).toBe(false);
        expect(state.isActive).toBe(true);
        expect(state.step).toBe(currentStep);
      }
    )
  );
});

// ── PROPERTY 4: Полнота конфигурации шагов ────────────────────────────────
test('Property 4: All ONBOARDING_STEPS have required narrative fields', () => {
  expect(ONBOARDING_STEPS.length).toBe(12);
  ONBOARDING_STEPS.forEach(step => {
    expect(step.id).toBeGreaterThan(0);
    expect(step.character).toBeDefined();
    expect(step.characterName).toBeTruthy();
    expect(step.text).toContain('«'); // Проверка стиля прямой речи
    expect(step.text).toContain('»');
    expect(step.actionButtonText).toBeTruthy();
  });
});

// ── PROPERTY 5: Попап всегда остаётся в пределах Viewport ─────────────────
test('Property 5: calcPopupPosition always keeps popup within viewport padding', () => {
  const PADDING = 12;
  
  fc.assert(
    fc.property(
      // Генерируем случайный viewport
      fc.record({
        width: fc.integer({ min: 320, max: 2560 }),
        height: fc.integer({ min: 480, max: 1440 })
      }),
      // Генерируем случайный размер попапа
      fc.record({
        width: fc.integer({ min: 200, max: 400 }),
        height: fc.integer({ min: 100, max: 300 })
      }),
      // Генерируем случайный targetRect (может быть null)
      fc.option(fc.record({
        top: fc.integer({ min: -100, max: 2000 }),
        left: fc.integer({ min: -100, max: 3000 }),
        width: fc.integer({ min: 10, max: 500 }),
        height: fc.integer({ min: 10, max: 500 }),
        bottom: fc.integer({ min: 0, max: 2500 }),
        right: fc.integer({ min: 0, max: 3500 })
      }), { nil: null }),
      // Случайная предпочтительная позиция
      fc.constantFrom('center', 'top', 'bottom', 'left', 'right' as const),
      (viewport, popupSize, targetRect, prefPos) => {
        const pos = calcPopupPosition(
          targetRect as DOMRect | null,
          popupSize,
          viewport,
          prefPos
        );

        // Проверка левой границы
        expect(pos.left).toBeGreaterThanOrEqual(PADDING);
        // Проверка верхней границы
        expect(pos.top).toBeGreaterThanOrEqual(PADDING);
        // Проверка правой границы
        expect(pos.left + popupSize.width).toBeLessThanOrEqual(viewport.width - PADDING);
        // Проверка нижней границы
        expect(pos.top + popupSize.height).toBeLessThanOrEqual(viewport.height - PADDING);
      }
    )
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

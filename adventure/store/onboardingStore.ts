import { create } from 'zustand';

// ═══════════════════════════════════════════════════════════════════════════
// ONBOARDING STORE — Управление пошаговым онбордингом (попапы)
// ═══════════════════════════════════════════════════════════════════════════

const REAPPEAR_DELAY = 3000; // 3 секунды до повторного появления попапа
const TOTAL_STEPS = 12;

/** Ключ localStorage — совместим со старой системой */
function storageKey(nickname: string): string {
  return `onboarding-complete-${nickname}`;
}

export interface OnboardingState {
  // ── Состояние ──
  step: number;                    // 1–12, текущий шаг
  isActive: boolean;               // онбординг запущен
  popupVisible: boolean;           // попап видим (false при временном скрытии)
  isCompleted: boolean;            // онбординг завершён
  reappearTimerId: number | null;  // ID таймера повторного появления
  nickname: string;                // никнейм для localStorage

  // ── Действия ──
  init: () => void;
  nextStep: () => void;
  hidePopup: () => void;
  showPopup: () => void;
  skip: () => void;
  complete: () => void;
  checkCompleted: (nickname: string) => boolean;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  step: 1,
  isActive: false,
  popupVisible: false,
  isCompleted: false,
  reappearTimerId: null,
  nickname: '',

  /** Запуск онбординга — step=1, isActive=true */
  init: () => {
    const { reappearTimerId } = get();
    if (reappearTimerId !== null) {
      clearTimeout(reappearTimerId);
    }
    set({
      step: 1,
      isActive: true,
      popupVisible: true,
      isCompleted: false,
      reappearTimerId: null,
    });
  },

  /** Переход к следующему шагу (guard от двойных кликов) */
  nextStep: () => {
    const state = get();
    if (!state.isActive || state.isCompleted) return;

    // Очистить reappear таймер
    if (state.reappearTimerId !== null) {
      clearTimeout(state.reappearTimerId);
    }

    // Последний шаг → завершение
    if (state.step >= TOTAL_STEPS) {
      get().complete();
      return;
    }

    set({
      step: state.step + 1,
      popupVisible: true,
      reappearTimerId: null,
    });
  },

  /** Временное скрытие попапа + запуск Reappear_Timer */
  hidePopup: () => {
    const state = get();
    if (!state.isActive) return;

    // Очистить предыдущий таймер если есть
    if (state.reappearTimerId !== null) {
      clearTimeout(state.reappearTimerId);
    }

    const timerId = window.setTimeout(() => {
      const current = get();
      if (current.isActive && !current.popupVisible) {
        set({ popupVisible: true, reappearTimerId: null });
      }
    }, REAPPEAR_DELAY);

    set({
      popupVisible: false,
      reappearTimerId: timerId as unknown as number,
    });
  },

  /** Повторное появление попапа */
  showPopup: () => {
    const state = get();
    if (!state.isActive) return;

    if (state.reappearTimerId !== null) {
      clearTimeout(state.reappearTimerId);
    }

    set({ popupVisible: true, reappearTimerId: null });
  },

  /** Пропуск всего онбординга */
  skip: () => {
    const state = get();

    // Очистить таймер
    if (state.reappearTimerId !== null) {
      clearTimeout(state.reappearTimerId);
    }

    // Сохранить в localStorage
    if (state.nickname) {
      try {
        localStorage.setItem(storageKey(state.nickname), '1');
      } catch { /* приватный режим */ }
    }

    set({
      isActive: false,
      popupVisible: false,
      isCompleted: true,
      reappearTimerId: null,
    });
  },

  /** Завершение онбординга (после шага 12) */
  complete: () => {
    const state = get();

    // Очистить таймер
    if (state.reappearTimerId !== null) {
      clearTimeout(state.reappearTimerId);
    }

    // Сохранить в localStorage
    if (state.nickname) {
      try {
        localStorage.setItem(storageKey(state.nickname), '1');
      } catch { /* приватный режим */ }
    }

    set({
      isActive: false,
      popupVisible: false,
      isCompleted: true,
      reappearTimerId: null,
    });
  },

  /** Проверка завершённости онбординга по localStorage */
  checkCompleted: (nickname: string) => {
    set({ nickname });
    try {
      return localStorage.getItem(storageKey(nickname)) === '1';
    } catch {
      return false;
    }
  },
}));

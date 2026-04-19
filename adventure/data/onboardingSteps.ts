// ═══════════════════════════════════════════════════════════════════════════
// ONBOARDING STEPS — Пошаговый туториал через чат
// ═══════════════════════════════════════════════════════════════════════════

import { InteractiveButton, QuickReply } from '../store/unifiedChatStore';

export interface OnboardingStep {
  id: string;
  from: 'system' | 'driver' | 'broker' | 'owner';
  fromName: string;
  text: string;
  delay?: number; // задержка перед показом (мс)
  
  // Интерактивность
  buttons?: InteractiveButton[];
  quickReplies?: QuickReply[];
  
  // Условия показа
  condition?: () => boolean;
  
  // Действие после завершения
  onComplete?: () => void;
  
  // Подсветка элементов UI
  spotlight?: {
    target: string; // селектор элемента
    message: string;
  };
}

// ═══ ШАГИ ОНБОРДИНГА ═══

export const ONBOARDING_STEPS: OnboardingStep[] = [
  // ─── ШАГ 1: ПРИВЕТСТВИЕ ───────────────────────────────────────────────
  {
    id: 'welcome',
    from: 'system',
    fromName: '🎮 Dispatch Office',
    text: '👋 Добро пожаловать в Dispatch Office!\n\nЯ твой помощник. Через этот чат ты будешь управлять всем: общаться с водителями, брокерами, получать уведомления.\n\nГотов начать?',
    buttons: [
      {
        id: 'start',
        text: '🚀 Начать обучение',
        action: 'start_tutorial',
        style: 'primary',
      },
      {
        id: 'skip',
        text: 'Пропустить',
        action: 'skip_tutorial',
        style: 'secondary',
      },
    ],
  },
  
  // ─── ШАГ 2: ЗНАКОМСТВО С ФЛОТОМ ──────────────────────────────────────
  {
    id: 'fleet_intro',
    from: 'system',
    fromName: '🎮 Dispatch Office',
    text: '🚛 У тебя есть флот траков. Сейчас они в разных местах США.\n\nТвоя задача — найти для них грузы, договориться о ставках и доставить вовремя.',
    delay: 1000,
    buttons: [
      {
        id: 'show_trucks',
        text: '👀 Показать траки',
        action: 'show_trucks',
        style: 'primary',
        icon: '🚛',
      },
    ],
    spotlight: {
      target: '[data-tab="trucks"]',
      message: 'Здесь ты можешь посмотреть все свои траки',
    },
  },
  
  // ─── ШАГ 3: ПЕРВЫЙ ВОДИТЕЛЬ ──────────────────────────────────────────
  {
    id: 'first_driver',
    from: 'driver',
    fromName: 'John Martinez',
    text: '👋 Привет, босс! Я John, водитель трака T-001.\n\nЯ сейчас в Knoxville, TN. Только что разгрузился. Готов к новому рейсу!\n\nНайдёшь мне груз?',
    delay: 2000,
    quickReplies: [
      {
        text: '👍 Ищу груз',
        action: 'find_load',
        value: 'Ищу груз для тебя, жди!',
        icon: '🔍',
      },
      {
        text: '⏰ Подожди',
        action: 'wait',
        value: 'Подожди немного, скоро найду',
        icon: '⏰',
      },
    ],
  },
  
  // ─── ШАГ 4: LOAD BOARD ────────────────────────────────────────────────
  {
    id: 'loadboard_intro',
    from: 'system',
    fromName: '🎮 Dispatch Office',
    text: '📋 Load Board — это доска с доступными грузами.\n\nЗдесь ты можешь найти грузы для своих траков. Смотри на ставку, расстояние и направление.',
    delay: 1500,
    buttons: [
      {
        id: 'open_loadboard',
        text: '📋 Открыть Load Board',
        action: 'open_loadboard',
        style: 'primary',
        icon: '📋',
      },
    ],
    spotlight: {
      target: '[data-tab="loadboard"]',
      message: 'Нажми сюда чтобы открыть Load Board',
    },
  },
  
  // ─── ШАГ 5: ПЕРВЫЙ ГРУЗ ───────────────────────────────────────────────
  {
    id: 'first_load_offer',
    from: 'broker',
    fromName: 'Tom Wilson',
    text: '📧 Привет! У меня есть груз для тебя:\n\n📍 Knoxville, TN → Atlanta, GA\n💰 $1,850\n📏 215 miles\n📦 Machinery parts, 42,000 lbs\n\nПогрузка завтра в 8:00 AM. Интересно?',
    delay: 3000,
    buttons: [
      {
        id: 'accept',
        text: '✅ Принять груз',
        action: 'accept_load',
        style: 'success',
        icon: '✅',
      },
      {
        id: 'negotiate',
        text: '💬 Договориться',
        action: 'negotiate',
        style: 'warning',
        icon: '💬',
      },
      {
        id: 'decline',
        text: '❌ Отказаться',
        action: 'decline_load',
        style: 'danger',
        icon: '❌',
      },
    ],
  },
  
  // ─── ШАГ 6: ГРУЗ ПРИНЯТ ───────────────────────────────────────────────
  {
    id: 'load_accepted',
    from: 'system',
    fromName: '🎮 Dispatch Office',
    text: '✅ Отлично! Груз принят.\n\nТеперь нужно назначить его на трак. John Martinez в Knoxville — идеальный кандидат!',
    delay: 1000,
    buttons: [
      {
        id: 'assign',
        text: '🚛 Назначить на John',
        action: 'assign_load',
        style: 'primary',
        icon: '🚛',
      },
    ],
  },
  
  // ─── ШАГ 7: ВОДИТЕЛЬ ПОДТВЕРЖДАЕТ ────────────────────────────────────
  {
    id: 'driver_confirms',
    from: 'driver',
    fromName: 'John Martinez',
    text: '👍 Получил! Knoxville → Atlanta, $1,850.\n\nЗавтра в 8:00 буду на погрузке. Держу тебя в курсе!',
    delay: 2000,
    quickReplies: [
      {
        text: '👍 Отлично',
        action: 'acknowledge',
        value: 'Отлично, жду обновлений!',
        icon: '👍',
      },
      {
        text: '📞 Позвони перед погрузкой',
        action: 'call_before',
        value: 'Позвони мне перед погрузкой',
        icon: '📞',
      },
    ],
  },
  
  // ─── ШАГ 8: КАРТА ─────────────────────────────────────────────────────
  {
    id: 'map_intro',
    from: 'system',
    fromName: '🎮 Dispatch Office',
    text: '🗺️ На карте ты можешь видеть где находятся твои траки в реальном времени.\n\nОни постоянно движутся, как в реальной жизни.',
    delay: 1500,
    buttons: [
      {
        id: 'show_map',
        text: '🗺️ Показать карту',
        action: 'show_map',
        style: 'primary',
        icon: '🗺️',
      },
    ],
    spotlight: {
      target: '[data-tab="map"]',
      message: 'Здесь ты можешь следить за траками',
    },
  },
  
  // ─── ШАГ 9: ВРЕМЯ ИДЁТ ────────────────────────────────────────────────
  {
    id: 'time_intro',
    from: 'system',
    fromName: '🎮 Dispatch Office',
    text: '⏰ Время в игре идёт быстро. Смена длится 8 часов игрового времени.\n\nТы можешь ускорить время (×1, ×2, ×5) или поставить на паузу.\n\nВодители будут писать тебе, брокеры предлагать грузы, могут случиться проблемы.',
    delay: 2000,
    buttons: [
      {
        id: 'understood',
        text: '✅ Понятно',
        action: 'time_understood',
        style: 'primary',
      },
    ],
  },
  
  // ─── ШАГ 10: ЗАВЕРШЕНИЕ ОБУЧЕНИЯ ─────────────────────────────────────
  {
    id: 'tutorial_complete',
    from: 'system',
    fromName: '🎮 Dispatch Office',
    text: '🎉 Обучение завершено!\n\nТеперь ты знаешь основы. Управляй флотом, зарабатывай деньги, решай проблемы.\n\nВсе события будут приходить в этот чат. Удачи! 🚀',
    delay: 1500,
    buttons: [
      {
        id: 'start_game',
        text: '🚀 Начать игру',
        action: 'start_game',
        style: 'success',
        icon: '🚀',
      },
    ],
  },
];

// ═══ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ═══

export function getNextStep(currentStepId: string | null): OnboardingStep | null {
  if (!currentStepId) {
    return ONBOARDING_STEPS[0];
  }
  
  const currentIndex = ONBOARDING_STEPS.findIndex(s => s.id === currentStepId);
  if (currentIndex === -1 || currentIndex === ONBOARDING_STEPS.length - 1) {
    return null;
  }
  
  return ONBOARDING_STEPS[currentIndex + 1];
}

export function isOnboardingComplete(nickname: string): boolean {
  try {
    const key = `onboarding-complete-${nickname}`;
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

export function markOnboardingComplete(nickname: string): void {
  try {
    const key = `onboarding-complete-${nickname}`;
    localStorage.setItem(key, '1');
  } catch {}
}

export function resetOnboarding(nickname: string): void {
  try {
    const key = `onboarding-complete-${nickname}`;
    localStorage.removeItem(key);
  } catch {}
}

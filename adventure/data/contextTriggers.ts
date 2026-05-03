/**
 * CONTEXT TRIGGERS — Слой 2
 * Маппинг игровых событий → ID уроков
 * Когда в игре происходит событие, показываем релевантный квиз
 */

export interface ContextTrigger {
  /** Уникальный ключ триггера */
  event: string;
  /** ID урока из duolingoDialogs */
  lessonId: string;
  /** Текст приглашения от Майка */
  prompt: string;
  /** Приоритет (чем выше — тем важнее) */
  priority: number;
}

/**
 * Все контекстные триггеры.
 * Ключ event совпадает с тем, что проверяется в game.tsx
 */
export const CONTEXT_TRIGGERS: ContextTrigger[] = [
  // ── HOS ──
  {
    event: 'hos_low',
    lessonId: 'm3-l1-11-hour-rule',
    prompt: 'У водителя заканчиваются часы HOS. Знаешь правило 11 часов?',
    priority: 9,
  },
  {
    event: 'hos_14hr_warning',
    lessonId: 'm3-l2-14-hour-window',
    prompt: '14-часовое окно скоро закроется! Помнишь как оно работает?',
    priority: 8,
  },
  {
    event: 'hos_break_needed',
    lessonId: 'm3-l3-30-min-break',
    prompt: 'Водитель едет уже 8 часов. Пора делать перерыв!',
    priority: 7,
  },

  // ── BREAKDOWN ──
  {
    event: 'breakdown',
    lessonId: 'm10-l2-breakdown-handling',
    prompt: 'Трак сломался! Знаешь протокол действий при поломке?',
    priority: 10,
  },

  // ── LOAD BOARD ──
  {
    event: 'loadboard_opened',
    lessonId: 'm4-l1-what-is-load-board',
    prompt: 'Ты открыл Load Board. Давай разберёмся как он работает!',
    priority: 5,
  },
  {
    event: 'loadboard_search',
    lessonId: 'm4-l3-reading-load-posting',
    prompt: 'Ищешь груз? Давай научимся читать объявления правильно.',
    priority: 6,
  },

  // ── NEGOTIATION ──
  {
    event: 'negotiation_started',
    lessonId: 'm5-l1-first-call-to-broker',
    prompt: 'Первый звонок брокеру! Знаешь как правильно представиться?',
    priority: 8,
  },
  {
    event: 'negotiation_counter',
    lessonId: 'm5-l2-rate-negotiation',
    prompt: 'Брокер предложил ставку. Как правильно торговаться?',
    priority: 7,
  },

  // ── DELIVERY ──
  {
    event: 'first_delivery',
    lessonId: 'm9-l1-calculating-profitability',
    prompt: 'Первая доставка! Давай посчитаем прибыльность рейса.',
    priority: 8,
  },
  {
    event: 'delivery_complete',
    lessonId: 'm9-l2-rpm-analysis',
    prompt: 'Доставка завершена! Знаешь что такое Rate Per Mile?',
    priority: 5,
  },

  // ── DETENTION ──
  {
    event: 'detention_started',
    lessonId: 'm10-l3-weather-delays',
    prompt: 'Водитель ждёт на погрузке. Знаешь про detention pay?',
    priority: 7,
  },

  // ── WEATHER ──
  {
    event: 'weather_alert',
    lessonId: 'm10-l3-weather-delays',
    prompt: 'Опасная погода на маршруте! Что делать?',
    priority: 9,
  },

  // ── ACCIDENT ──
  {
    event: 'accident',
    lessonId: 'm10-l1-accident-protocol',
    prompt: 'Авария! Знаешь протокол действий?',
    priority: 10,
  },

  // ── IDLE TRUCK ──
  {
    event: 'truck_idle_long',
    lessonId: 'm7-l4-deadhead-minimization',
    prompt: 'Трак простаивает. Знаешь как минимизировать deadhead?',
    priority: 6,
  },

  // ── ASSIGN LOAD ──
  {
    event: 'load_assigned',
    lessonId: 'm6-l2-hos-check',
    prompt: 'Назначаешь груз? Не забудь проверить HOS водителя!',
    priority: 7,
  },

  // ── BROKER CHECK ──
  {
    event: 'broker_new',
    lessonId: 'm5-l3-checking-broker-credit',
    prompt: 'Новый брокер! Знаешь как проверить его надёжность?',
    priority: 8,
  },

  // ── CARGO THEFT ──
  {
    event: 'cargo_theft',
    lessonId: 'm10-l4-cargo-theft',
    prompt: 'Кража груза! Знаешь первые действия?',
    priority: 10,
  },

  // ── GAME START (first session) ──
  {
    event: 'game_start',
    lessonId: 'm1-l1-what-is-dispatcher',
    prompt: 'Добро пожаловать! Давай разберёмся кто такой диспетчер.',
    priority: 3,
  },

  // ── ELD ──
  {
    event: 'eld_check',
    lessonId: 'm11-l2-eld-mandate',
    prompt: 'Проверяешь ELD? Знаешь зачем он нужен?',
    priority: 4,
  },

  // ── FACTORING ──
  {
    event: 'factoring_offer',
    lessonId: 'm9-l3-factoring-basics',
    prompt: 'Предложение факторинга! Знаешь как это работает?',
    priority: 6,
  },
];

/**
 * Найти триггер по событию
 */
export function getTriggerForEvent(event: string): ContextTrigger | undefined {
  return CONTEXT_TRIGGERS.find(t => t.event === event);
}

/**
 * Найти все триггеры, отсортированные по приоритету
 */
export function getTriggersByPriority(): ContextTrigger[] {
  return [...CONTEXT_TRIGGERS].sort((a, b) => b.priority - a.priority);
}

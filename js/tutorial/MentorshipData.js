/**
 * MentorshipData.js
 * 
 * Data Layer для системы наставничества.
 * Хранит диалоги ментора, задачи и подсказки.
 * Легко редактируется без изменения логики.
 * 
 * Архитектура: Чистые данные в JSON-подобной структуре.
 */

export const MENTOR_CHARACTER = {
  name: 'Майк',
  role: 'Старший диспетчер',
  avatar: '👨‍💼',
  personality: 'Опытный наставник с 15-летним стажем. Говорит прямо, но по делу.'
};

/**
 * Структура шага обучения
 * @typedef {Object} TutorialStep
 * @property {string} id - Уникальный ID шага
 * @property {string} title - Заголовок шага
 * @property {string} mentorDialog - Текст наставника
 * @property {string} task - Задача для игрока
 * @property {Object} ui - UI-подсказки (что подсветить, куда указать)
 * @property {Object} validation - Условия завершения шага
 * @property {Array<string>} nextSteps - Возможные следующие шаги
 */

export const TUTORIAL_STEPS = [
  // ═══════════════════════════════════════════════════════════
  // ЭТАП 1: ПРИВЕТСТВИЕ И ЗНАКОМСТВО С ОФИСОМ
  // ═══════════════════════════════════════════════════════════
  {
    id: 'STEP_1_WELCOME',
    title: 'Добро пожаловать в офис',
    mentorDialog: `
      Привет! Я Майк, старший диспетчер. Сегодня твой первый день.
      
      Я покажу тебе как работает настоящий диспетчер грузоперевозок.
      Никаких скучных лекций — только реальные задачи.
      
      Готов начать?
    `,
    task: 'Нажми "Начать смену" чтобы приступить к работе',
    ui: {
      highlight: '#start-shift-btn',
      position: 'bottom',
      arrow: true
    },
    validation: {
      type: 'button_click',
      target: '#start-shift-btn'
    },
    nextSteps: ['STEP_2_MORNING_BRIEFING']
  },

  // ═══════════════════════════════════════════════════════════
  // ЭТАП 2: УТРЕННИЙ БРИФИНГ
  // ═══════════════════════════════════════════════════════════
  {
    id: 'STEP_2_MORNING_BRIEFING',
    title: 'Утренний брифинг',
    mentorDialog: `
      Каждое утро диспетчер начинает с проверки флота.
      
      Посмотри на карту — у нас 3 трака. Один уже на доставке в Чикаго,
      второй едет в Даллас, третий только что разгрузился в Атланте.
      
      Твоя задача — проверить статус каждого трака.
    `,
    task: 'Кликни на каждый трак на карте чтобы проверить его статус',
    ui: {
      highlight: '.truck-marker',
      position: 'top',
      pulse: true
    },
    validation: {
      type: 'custom',
      check: (context) => {
        // Проверяем что игрок кликнул на все 3 трака
        return context.clickedTrucks && context.clickedTrucks.size >= 3;
      }
    },
    nextSteps: ['STEP_3_INBOX_CHECK']
  },

  // ═══════════════════════════════════════════════════════════
  // ЭТАП 3: ПРОВЕРКА ПОЧТЫ
  // ═══════════════════════════════════════════════════════════
  {
    id: 'STEP_3_INBOX_CHECK',
    title: 'Проверка входящей почты',
    mentorDialog: `
      Отлично! Теперь проверим почту.
      
      У тебя 2 новых письма от брокеров. Одно — Rate Confirmation на новый груз,
      второе — запрос POD по вчерашней доставке.
      
      Начнём с Rate Con — это самый важный документ.
    `,
    task: 'Открой письмо с темой "Rate Confirmation - Load #12345"',
    ui: {
      highlight: '.email-item[data-subject*="Rate Confirmation"]',
      position: 'right',
      arrow: true
    },
    validation: {
      type: 'element_click',
      target: '.email-item[data-subject*="Rate Confirmation"]'
    },
    nextSteps: ['STEP_4_RATE_CON_REVIEW']
  },

  // ═══════════════════════════════════════════════════════════
  // ЭТАП 4: ПРОВЕРКА RATE CONFIRMATION
  // ═══════════════════════════════════════════════════════════
  {
    id: 'STEP_4_RATE_CON_REVIEW',
    title: 'Проверка Rate Confirmation',
    mentorDialog: `
      Rate Confirmation — это твой контракт с брокером.
      
      Здесь указана ставка, маршрут, даты погрузки и разгрузки.
      Ошибка в Rate Con может стоить тебе денег.
      
      Проверь основные поля: ставку, pickup/delivery даты, адреса.
    `,
    task: 'Проверь все ключевые поля в Rate Confirmation',
    ui: {
      highlight: '#doc-ratecon',
      position: 'left',
      tooltip: 'Кликай на поля документа чтобы увидеть подсказки'
    },
    validation: {
      type: 'custom',
      check: (context) => {
        // Проверяем что игрок кликнул на минимум 5 полей документа
        return context.checkedFields && context.checkedFields.size >= 5;
      }
    },
    nextSteps: ['STEP_5_RATE_CON_ACCEPT']
  },

  // ═══════════════════════════════════════════════════════════
  // ЭТАП 5: ПРИНЯТИЕ ГРУЗА
  // ═══════════════════════════════════════════════════════════
  {
    id: 'STEP_5_RATE_CON_ACCEPT',
    title: 'Принятие груза',
    mentorDialog: `
      Всё выглядит хорошо. Ставка $2,800, маршрут 850 миль, pickup завтра утром.
      
      У нас есть свободный трак в Атланте — идеально подходит.
      
      Теперь нужно подтвердить груз брокеру и назначить трак.
    `,
    task: 'Нажми "Принять груз" и назначь трак #3',
    ui: {
      highlight: '#accept-load-btn',
      position: 'bottom',
      arrow: true
    },
    validation: {
      type: 'custom',
      check: (context) => {
        return context.loadAccepted && context.assignedTruck === 'truck_3';
      }
    },
    nextSteps: ['STEP_6_DRIVER_DISPATCH']
  },

  // ═══════════════════════════════════════════════════════════
  // ЭТАП 6: ОТПРАВКА ЗАДАНИЯ ВОДИТЕЛЮ
  // ═══════════════════════════════════════════════════════════
  {
    id: 'STEP_6_DRIVER_DISPATCH',
    title: 'Отправка задания водителю',
    mentorDialog: `
      Груз принят, трак назначен. Теперь нужно отправить задание водителю.
      
      Водитель должен получить:
      - Адрес и время pickup
      - Адрес и время delivery
      - Контакты грузоотправителя и получателя
      - Rate Confirmation
      
      Отправь dispatch через систему.
    `,
    task: 'Отправь dispatch водителю трака #3',
    ui: {
      highlight: '#send-dispatch-btn',
      position: 'bottom'
    },
    validation: {
      type: 'button_click',
      target: '#send-dispatch-btn'
    },
    nextSteps: ['STEP_7_MONITOR_PROGRESS']
  },

  // ═══════════════════════════════════════════════════════════
  // ЭТАП 7: МОНИТОРИНГ ПРОГРЕССА
  // ═══════════════════════════════════════════════════════════
  {
    id: 'STEP_7_MONITOR_PROGRESS',
    title: 'Мониторинг прогресса',
    mentorDialog: `
      Отлично! Водитель получил задание и выехал на pickup.
      
      Теперь твоя задача — следить за прогрессом.
      Проверяй статус трака, отвечай на вопросы водителя, решай проблемы.
      
      Посмотри на карту — трак уже движется к точке погрузки.
    `,
    task: 'Следи за траком на карте. Жди следующего события.',
    ui: {
      highlight: '.truck-marker[data-truck="truck_3"]',
      position: 'top',
      pulse: true
    },
    validation: {
      type: 'time_based',
      duration: 5000 // 5 секунд для демонстрации
    },
    nextSteps: ['STEP_8_DRIVER_QUESTION']
  },

  // ═══════════════════════════════════════════════════════════
  // ЭТАП 8: ВОПРОС ОТ ВОДИТЕЛЯ
  // ═══════════════════════════════════════════════════════════
  {
    id: 'STEP_8_DRIVER_QUESTION',
    title: 'Вопрос от водителя',
    mentorDialog: `
      Водитель прислал SMS: "Приехал на pickup, но склад закрыт. Что делать?"
      
      Это типичная ситуация. Нужно:
      1. Проверить время работы склада в Rate Con
      2. Позвонить на склад
      3. Связаться с брокером если проблема
      
      Как ты поступишь?
    `,
    task: 'Выбери правильное действие',
    ui: {
      highlight: '#driver-message-panel',
      position: 'right',
      options: [
        { id: 'call_warehouse', text: 'Позвонить на склад' },
        { id: 'call_broker', text: 'Сразу звонить брокеру' },
        { id: 'wait', text: 'Сказать водителю ждать' }
      ]
    },
    validation: {
      type: 'choice',
      correctChoice: 'call_warehouse'
    },
    nextSteps: ['STEP_9_PROBLEM_SOLVED']
  },

  // ═══════════════════════════════════════════════════════════
  // ЭТАП 9: ПРОБЛЕМА РЕШЕНА
  // ═══════════════════════════════════════════════════════════
  {
    id: 'STEP_9_PROBLEM_SOLVED',
    title: 'Проблема решена',
    mentorDialog: `
      Правильно! Ты позвонил на склад — оказалось они открываются в 8:00, а не в 7:00.
      
      Водитель подождал час, загрузился и поехал на delivery.
      
      Это нормальная ситуация. Главное — не паниковать и действовать по порядку.
    `,
    task: 'Продолжить мониторинг',
    ui: {
      highlight: null,
      message: 'Трак в пути. Ожидаемое время доставки: завтра 14:00'
    },
    validation: {
      type: 'button_click',
      target: '#continue-btn'
    },
    nextSteps: ['STEP_10_DELIVERY_COMPLETE']
  },

  // ═══════════════════════════════════════════════════════════
  // ЭТАП 10: ДОСТАВКА ЗАВЕРШЕНА
  // ═══════════════════════════════════════════════════════════
  {
    id: 'STEP_10_DELIVERY_COMPLETE',
    title: 'Доставка завершена',
    mentorDialog: `
      Отлично! Водитель доставил груз и получил подписанный BOL.
      
      Теперь самое важное — отправить POD (Proof of Delivery) брокеру.
      Без POD ты не получишь оплату.
      
      У тебя есть 24 часа чтобы отправить POD.
    `,
    task: 'Отправь POD брокеру',
    ui: {
      highlight: '#send-pod-btn',
      position: 'bottom',
      arrow: true
    },
    validation: {
      type: 'button_click',
      target: '#send-pod-btn'
    },
    nextSteps: ['STEP_11_TUTORIAL_COMPLETE']
  },

  // ═══════════════════════════════════════════════════════════
  // ЭТАП 11: ОБУЧЕНИЕ ЗАВЕРШЕНО
  // ═══════════════════════════════════════════════════════════
  {
    id: 'STEP_11_TUTORIAL_COMPLETE',
    title: 'Обучение завершено',
    mentorDialog: `
      Поздравляю! Ты успешно завершил свою первую смену.
      
      Ты научился:
      ✓ Проверять статус флота
      ✓ Работать с Rate Confirmation
      ✓ Назначать траки на грузы
      ✓ Решать проблемы водителей
      ✓ Отправлять POD
      
      Теперь ты готов к настоящей работе. Удачи!
    `,
    task: 'Начать полноценную игру',
    ui: {
      highlight: '#start-game-btn',
      position: 'center'
    },
    validation: {
      type: 'button_click',
      target: '#start-game-btn'
    },
    nextSteps: []
  }
];

/**
 * Подсказки для UI элементов (используются в 2-колоночных документах)
 */
export const UI_HINTS = {
  ratecon: {
    rate: 'Ставка за перевозку. Проверь что она соответствует договорённости.',
    pickup_date: 'Дата и время погрузки. Убедись что водитель успеет приехать.',
    delivery_date: 'Дата и время разгрузки. Рассчитай время в пути + запас на HOS.',
    pickup_address: 'Адрес погрузки. Проверь что он полный и правильный.',
    delivery_address: 'Адрес разгрузки. Убедись что нет ошибок.',
    commodity: 'Тип груза. Важно для выбора оборудования.',
    weight: 'Вес груза. Не должен превышать 45,000 lbs для сухого фургона.'
  },
  bol: {
    shipper_signature: 'Подпись грузоотправителя. Без неё BOL недействителен.',
    pieces: 'Количество мест. Проверь при погрузке.',
    weight_actual: 'Фактический вес. Может отличаться от заявленного в Rate Con.'
  },
  pod: {
    receiver_signature: 'Подпись получателя. Главное доказательство доставки.',
    delivery_time: 'Время доставки. Важно для расчёта detention.',
    condition: 'Состояние груза. Если есть повреждения — нужен Damage Report.'
  }
};

/**
 * Контекстные подсказки для разных ситуаций
 */
export const CONTEXTUAL_TIPS = {
  first_load: 'Первый груз всегда самый волнительный. Не спеши, проверяй всё дважды.',
  detention: 'Detention — это плата за простой. Фиксируй время прибытия и убытия.',
  tonu: 'TONU (Truck Ordered Not Used) — груз отменён. Требуй компенсацию от брокера.',
  breakdown: 'Поломка трака — кошмар диспетчера. Сразу ищи замену и уведоми брокера.',
  hos_violation: 'Нарушение HOS может стоить $1000+ штрафа. Следи за часами водителя.'
};

export default {
  MENTOR_CHARACTER,
  TUTORIAL_STEPS,
  UI_HINTS,
  CONTEXTUAL_TIPS
};

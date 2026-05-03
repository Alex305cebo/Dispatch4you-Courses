/**
 * DUOLINGO-STYLE TUTORIAL DIALOGS
 * Микро-обучение на основе 12 модулей курса диспетчера
 * 
 * Структура: короткие интерактивные диалоги (30-120 секунд)
 * с вопросами с множественным выбором и немедленной обратной связью
 */

export interface DuolingoDialog {
  id: string;
  module: string; // Модуль курса (1-12)
  topic: string; // Тема урока
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xp: number; // Опыт за прохождение
  estimatedTime: number; // Секунды
  dialogs: DuolingoDialogStep[];
}

export interface DuolingoDialogStep {
  character: 'mentor' | 'broker' | 'driver' | 'player';
  avatar: string;
  text: string;
  question?: {
    text: string;
    options: DuolingoOption[];
    correctAnswer: number; // Индекс правильного ответа
    explanation: string; // Объяснение после ответа
  };
}

export interface DuolingoOption {
  text: string;
  isCorrect: boolean;
  feedback?: string; // Обратная связь при выборе
}

// ============================================
// МОДУЛЬ 1: ОСНОВЫ ДИСПЕТЧЕРСТВА
// ============================================

export const module1Dialogs: DuolingoDialog[] = [
  {
    id: 'm1-l1-what-is-dispatcher',
    module: 'Модуль 1',
    topic: 'Кто такой диспетчер?',
    difficulty: 'beginner',
    xp: 10,
    estimatedTime: 45,
    dialogs: [
      {
        character: 'mentor',
        avatar: '👨‍💼',
        text: 'Привет! Я Майк, твой наставник. Начнём с самого важного вопроса...',
      },
      {
        character: 'mentor',
        avatar: '👨‍💼',
        text: 'Диспетчер грузоперевозок — это связующее звено между водителями и клиентами.',
        question: {
          text: 'Что НЕ входит в обязанности диспетчера?',
          options: [
            { text: 'Поиск грузов для водителей', isCorrect: false },
            { text: 'Ремонт траков', isCorrect: true, feedback: 'Верно! Ремонт — это работа механика, не диспетчера.' },
            { text: 'Переговоры о ставках', isCorrect: false },
            { text: 'Планирование маршрутов', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'Диспетчер координирует перевозки, но не занимается техническим обслуживанием траков.',
        },
      },
      {
        character: 'mentor',
        avatar: '👨‍💼',
        text: 'Отлично! Диспетчер — это мозг операции, а не руки. Твоя работа — планировать и координировать.',
      },
    ],
  },

  {
    id: 'm1-l2-industry-size',
    module: 'Модуль 1',
    topic: 'Масштаб индустрии',
    difficulty: 'beginner',
    xp: 10,
    estimatedTime: 40,
    dialogs: [
      {
        character: 'mentor',
        avatar: '📊',
        text: 'Знаешь ли ты, насколько огромна индустрия грузоперевозок в США?',
      },
      {
        character: 'mentor',
        avatar: '📊',
        text: 'Индустрия грузоперевозок США — крупнейшая в мире!',
        question: {
          text: 'Какой годовой оборот индустрии грузоперевозок США?',
          options: [
            { text: '$100 миллиардов', isCorrect: false },
            { text: '$875 миллиардов', isCorrect: true, feedback: 'Точно! Почти триллион долларов!' },
            { text: '$50 миллиардов', isCorrect: false },
            { text: '$1.5 триллиона', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'Индустрия грузоперевозок США генерирует более $875 миллиардов ежегодно и перевозит 72% всех грузов страны.',
        },
      },
      {
        character: 'mentor',
        avatar: '💪',
        text: 'Ты входишь в одну из крупнейших индустрий Америки. Возможности здесь огромные!',
      },
    ],
  },

  {
    id: 'm1-l3-mc-dot-basics',
    module: 'Модуль 1',
    topic: 'MC и DOT номера',
    difficulty: 'beginner',
    xp: 15,
    estimatedTime: 60,
    dialogs: [
      {
        character: 'mentor',
        avatar: '🔢',
        text: 'Каждая транспортная компания в США должна иметь специальные номера для работы.',
      },
      {
        character: 'mentor',
        avatar: '🔢',
        text: 'MC Number — это разрешение на перевозку грузов за плату. DOT Number — регистрация в Департаменте Транспорта.',
        question: {
          text: 'Что такое MC Number?',
          options: [
            { text: 'Номер водительских прав', isCorrect: false },
            { text: 'Motor Carrier Authority — разрешение на коммерческие перевозки', isCorrect: true, feedback: 'Правильно! Без MC нельзя легально возить грузы за деньги.' },
            { text: 'Номер трака', isCorrect: false },
            { text: 'Медицинский сертификат', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'MC Number выдаётся FMCSA и подтверждает право компании заниматься коммерческими грузоперевозками.',
        },
      },
      {
        character: 'mentor',
        avatar: '✅',
        text: 'Запомни: всегда проверяй MC и DOT брокеров перед работой! Это защитит тебя от мошенников.',
      },
    ],
  },
];

// ============================================
// МОДУЛЬ 2: FMCSA И DOT
// ============================================

export const module2Dialogs: DuolingoDialog[] = [
  {
    id: 'm2-l1-fmcsa-intro',
    module: 'Модуль 2',
    topic: 'Что такое FMCSA?',
    difficulty: 'beginner',
    xp: 10,
    estimatedTime: 45,
    dialogs: [
      {
        character: 'mentor',
        avatar: '🏛️',
        text: 'FMCSA — это главное агентство, которое регулирует грузоперевозки в США.',
      },
      {
        character: 'mentor',
        avatar: '🏛️',
        text: 'Federal Motor Carrier Safety Administration следит за безопасностью на дорогах.',
        question: {
          text: 'За что отвечает FMCSA?',
          options: [
            { text: 'Ремонт дорог', isCorrect: false },
            { text: 'Безопасность коммерческих грузоперевозок', isCorrect: true, feedback: 'Верно! FMCSA устанавливает правила для траков и водителей.' },
            { text: 'Продажу траков', isCorrect: false },
            { text: 'Цены на топливо', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'FMCSA создаёт и контролирует правила безопасности для всех коммерческих траков в США.',
        },
      },
    ],
  },

  {
    id: 'm2-l2-dot-inspection',
    module: 'Модуль 2',
    topic: 'DOT инспекции',
    difficulty: 'intermediate',
    xp: 15,
    estimatedTime: 60,
    dialogs: [
      {
        character: 'driver',
        avatar: '🚛',
        text: 'Майк, меня остановили на весовой! Говорят DOT inspection. Что делать?',
      },
      {
        character: 'mentor',
        avatar: '👨‍💼',
        text: 'Спокойно! DOT инспекции — это обычная проверка. Офицер проверит документы, трак и логбук.',
        question: {
          text: 'Что проверяют во время DOT inspection?',
          options: [
            { text: 'Только документы водителя', isCorrect: false },
            { text: 'Документы, техническое состояние трака и HOS логи', isCorrect: true, feedback: 'Точно! Полная проверка безопасности.' },
            { text: 'Только вес груза', isCorrect: false },
            { text: 'Только скорость движения', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'DOT inspection включает проверку CDL, medical card, HOS logs, тормозов, шин, огней и других систем безопасности.',
        },
      },
      {
        character: 'mentor',
        avatar: '✅',
        text: 'Скажи водителю быть вежливым и предоставить все документы. Если всё в порядке — отпустят за 30-60 минут.',
      },
    ],
  },
];

// ============================================
// МОДУЛЬ 3: HOURS OF SERVICE (HOS)
// ============================================

export const module3Dialogs: DuolingoDialog[] = [
  {
    id: 'm3-l1-11-hour-rule',
    module: 'Модуль 3',
    topic: 'Правило 11 часов',
    difficulty: 'beginner',
    xp: 15,
    estimatedTime: 50,
    dialogs: [
      {
        character: 'mentor',
        avatar: '⏰',
        text: 'HOS — Hours of Service — это правила рабочего времени водителей. Самое важное правило...',
      },
      {
        character: 'mentor',
        avatar: '⏰',
        text: 'Водитель может ехать максимум 11 часов после 10 часов отдыха.',
        question: {
          text: 'Водитель отдыхал 10 часов. Сколько он может ехать?',
          options: [
            { text: '8 часов', isCorrect: false },
            { text: '11 часов', isCorrect: true, feedback: 'Правильно! 11-hour driving limit.' },
            { text: '14 часов', isCorrect: false },
            { text: 'Сколько угодно', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'После 10 часов отдыха водитель может ехать максимум 11 часов. Это федеральное правило FMCSA.',
        },
      },
      {
        character: 'driver',
        avatar: '🚛',
        text: 'Понял! Значит после 11 часов вождения я должен отдохнуть 10 часов.',
      },
    ],
  },

  {
    id: 'm3-l2-14-hour-window',
    module: 'Модуль 3',
    topic: '14-часовое окно',
    difficulty: 'intermediate',
    xp: 20,
    estimatedTime: 70,
    dialogs: [
      {
        character: 'mentor',
        avatar: '⏰',
        text: 'Есть ещё одно важное правило — 14-hour window. Это рабочее окно.',
      },
      {
        character: 'mentor',
        avatar: '⏰',
        text: 'С момента начала смены у водителя есть 14 часов на всё: вождение, погрузку, ожидание.',
        question: {
          text: 'Водитель начал смену в 06:00. Во сколько он ОБЯЗАН закончить работу?',
          options: [
            { text: '17:00 (11 часов спустя)', isCorrect: false },
            { text: '20:00 (14 часов спустя)', isCorrect: true, feedback: 'Верно! 14-hour window не продлевается.' },
            { text: '22:00 (16 часов спустя)', isCorrect: false },
            { text: 'Когда захочет', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: '14-hour window начинается с момента начала смены и НЕ останавливается. Даже если водитель отдыхал 2 часа, окно продолжает идти.',
        },
      },
      {
        character: 'driver',
        avatar: '😰',
        text: 'Ого! Значит если я начал в 6 утра, то в 8 вечера я ОБЯЗАН остановиться, даже если ехал только 8 часов?',
      },
      {
        character: 'mentor',
        avatar: '✅',
        text: 'Именно! Поэтому важно планировать маршруты с учётом времени на погрузку, разгрузку и пробки.',
      },
    ],
  },

  {
    id: 'm3-l3-30-min-break',
    module: 'Модуль 3',
    topic: '30-минутный перерыв',
    difficulty: 'beginner',
    xp: 10,
    estimatedTime: 40,
    dialogs: [
      {
        character: 'driver',
        avatar: '🚛',
        text: 'Майк, я еду уже 8 часов. Нужно ли мне останавливаться?',
      },
      {
        character: 'mentor',
        avatar: '⏰',
        text: 'Да! После 8 часов вождения обязателен 30-минутный перерыв.',
        question: {
          text: 'Когда водитель ОБЯЗАН сделать 30-минутный перерыв?',
          options: [
            { text: 'После 6 часов вождения', isCorrect: false },
            { text: 'После 8 часов вождения', isCorrect: true, feedback: 'Правильно! 30-minute break rule.' },
            { text: 'После 10 часов вождения', isCorrect: false },
            { text: 'Перерыв не обязателен', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'Федеральное правило требует минимум 30 минут отдыха после 8 часов вождения. Это может быть обед, заправка или просто отдых.',
        },
      },
      {
        character: 'driver',
        avatar: '☕',
        text: 'Отлично! Как раз время для кофе и обеда.',
      },
    ],
  },
];

// ============================================
// МОДУЛЬ 4: LOAD BOARDS
// ============================================

export const module4Dialogs: DuolingoDialog[] = [
  {
    id: 'm4-l1-what-is-load-board',
    module: 'Модуль 4',
    topic: 'Что такое Load Board?',
    difficulty: 'beginner',
    xp: 10,
    estimatedTime: 45,
    dialogs: [
      {
        character: 'mentor',
        avatar: '📋',
        text: 'Load Board — это онлайн-платформа, где брокеры публикуют доступные грузы.',
      },
      {
        character: 'mentor',
        avatar: '📋',
        text: 'Это как доска объявлений, но для грузоперевозок. Тысячи грузов каждый день!',
        question: {
          text: 'Что такое Load Board?',
          options: [
            { text: 'Сайт для продажи траков', isCorrect: false },
            { text: 'Платформа для поиска грузов', isCorrect: true, feedback: 'Верно! Здесь диспетчеры находят работу для траков.' },
            { text: 'Приложение для навигации', isCorrect: false },
            { text: 'Программа для учёта топлива', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'Load Board — это маркетплейс грузов. Брокеры публикуют грузы, а диспетчеры их бронируют.',
        },
      },
    ],
  },

  {
    id: 'm4-l2-dat-vs-truckstop',
    module: 'Модуль 4',
    topic: 'DAT vs Truckstop',
    difficulty: 'intermediate',
    xp: 15,
    estimatedTime: 60,
    dialogs: [
      {
        character: 'mentor',
        avatar: '🏆',
        text: 'Две главные Load Boards в США — DAT и Truckstop.com.',
      },
      {
        character: 'mentor',
        avatar: '🏆',
        text: 'DAT — крупнейшая платформа с 1.5+ миллионами грузов ежедневно.',
        question: {
          text: 'Какая Load Board самая большая в США?',
          options: [
            { text: 'Truckstop.com', isCorrect: false },
            { text: 'DAT Load Board', isCorrect: true, feedback: 'Точно! DAT — индустриальный лидер.' },
            { text: '123Loadboard', isCorrect: false },
            { text: 'Uber Freight', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'DAT (Dial-A-Truck) — крупнейшая Load Board с 1978 года. Более 1.5 миллиона грузов ежедневно.',
        },
      },
      {
        character: 'mentor',
        avatar: '💡',
        text: 'Профессионалы используют обе платформы одновременно для максимального выбора грузов.',
      },
    ],
  },

  {
    id: 'm4-l3-reading-load-posting',
    module: 'Модуль 4',
    topic: 'Чтение объявления о грузе',
    difficulty: 'intermediate',
    xp: 20,
    estimatedTime: 80,
    dialogs: [
      {
        character: 'mentor',
        avatar: '📄',
        text: 'Давай научимся читать объявление о грузе. Вот пример:',
      },
      {
        character: 'mentor',
        avatar: '📄',
        text: '"Chicago, IL → Dallas, TX | 1,000 mi | $2,500 | 53ft Dry Van | Pickup: 03/15 08:00"',
        question: {
          text: 'Сколько платят за этот груз?',
          options: [
            { text: '$1,000', isCorrect: false },
            { text: '$2,500', isCorrect: true, feedback: 'Правильно! Это общая ставка за рейс.' },
            { text: '$2.50 за милю', isCorrect: false },
            { text: '$3,500', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: '$2,500 — это total rate за весь рейс. Чтобы узнать rate per mile: $2,500 / 1,000 миль = $2.50/миля.',
        },
      },
      {
        character: 'mentor',
        avatar: '🧮',
        text: 'Всегда считай rate per mile (RPM). Это ключевая метрика прибыльности!',
      },
    ],
  },
];

// ============================================
// МОДУЛЬ 5: КОММУНИКАЦИЯ С БРОКЕРАМИ
// ============================================

export const module5Dialogs: DuolingoDialog[] = [
  {
    id: 'm5-l1-first-call-to-broker',
    module: 'Модуль 5',
    topic: 'Первый звонок брокеру',
    difficulty: 'beginner',
    xp: 15,
    estimatedTime: 60,
    dialogs: [
      {
        character: 'mentor',
        avatar: '📞',
        text: 'Ты нашёл груз на Load Board. Теперь нужно позвонить брокеру.',
      },
      {
        character: 'mentor',
        avatar: '📞',
        text: 'Профессиональное приветствие важно! Вот правильный скрипт:',
        question: {
          text: 'Как правильно начать разговор с брокером?',
          options: [
            { text: '"Привет, есть груз?"', isCorrect: false },
            { text: '"Hi, this is [Name] from [Company], calling about load #12345"', isCorrect: true, feedback: 'Отлично! Профессионально и по делу.' },
            { text: '"Yo, груз ещё доступен?"', isCorrect: false },
            { text: 'Молча ждать', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'Всегда представляйтесь: имя, компания, номер груза. Это показывает профессионализм.',
        },
      },
      {
        character: 'broker',
        avatar: '💼',
        text: 'Yes, it\'s still available. What\'s your MC number?',
      },
      {
        character: 'mentor',
        avatar: '✅',
        text: 'Отлично! Брокер спросит твой MC number. Всегда имей его под рукой.',
      },
    ],
  },

  {
    id: 'm5-l2-rate-negotiation',
    module: 'Модуль 5',
    topic: 'Переговоры о ставке',
    difficulty: 'intermediate',
    xp: 20,
    estimatedTime: 90,
    dialogs: [
      {
        character: 'broker',
        avatar: '💼',
        text: 'The rate is $2,000 for this load.',
      },
      {
        character: 'mentor',
        avatar: '💰',
        text: 'Брокер предложил $2,000. Но ты можешь попросить больше!',
        question: {
          text: 'Что сказать, чтобы попросить выше ставку?',
          options: [
            { text: '"Нет, это мало!"', isCorrect: false },
            { text: '"Can you do $2,300? We have a truck nearby and can pick up today"', isCorrect: true, feedback: 'Отлично! Обоснование + конкретная цифра.' },
            { text: '"Я хочу $5,000"', isCorrect: false },
            { text: 'Согласиться сразу', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'Всегда начинайте на 10-15% выше. Обоснуйте: близкий трак, быстрая погрузка, опытный водитель.',
        },
      },
      {
        character: 'broker',
        avatar: '💼',
        text: 'I can do $2,200. That\'s my best price.',
      },
      {
        character: 'mentor',
        avatar: '🤝',
        text: 'Брокер поднял до $2,200. Это хороший результат! Ты заработал дополнительные $200.',
      },
    ],
  },

  {
    id: 'm5-l3-checking-broker-credit',
    module: 'Модуль 5',
    topic: 'Проверка брокера',
    difficulty: 'advanced',
    xp: 25,
    estimatedTime: 70,
    dialogs: [
      {
        character: 'mentor',
        avatar: '🔍',
        text: 'ВАЖНО! Перед работой с брокером ВСЕГДА проверяй его надёжность.',
      },
      {
        character: 'mentor',
        avatar: '🔍',
        text: 'Используй RTS Pro или Carrier411 для проверки credit score брокера.',
        question: {
          text: 'С каким credit score брокера безопасно работать?',
          options: [
            { text: 'F (самый низкий)', isCorrect: false },
            { text: 'A, B, C (высокий и средний)', isCorrect: true, feedback: 'Правильно! Избегай D, E, F.' },
            { text: 'Любой, не важно', isCorrect: false },
            { text: 'Только A+', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'Брокеры с рейтингом A, B, C платят вовремя. D, E, F — высокий риск задержки оплаты или мошенничества.',
        },
      },
      {
        character: 'mentor',
        avatar: '⚠️',
        text: 'Если брокер новый (MC меньше 6 месяцев) или рейтинг D-F — требуй предоплату или откажись!',
      },
    ],
  },
];

// (helpers и финальный экспорт — в конце файла)

// ============================================
// МОДУЛЬ 6: РАБОТА С ВОДИТЕЛЯМИ
// ============================================

export const module6Dialogs: DuolingoDialog[] = [
  {
    id: 'm6-l1-driver-info',
    module: 'Модуль 6',
    topic: 'Информация о водителе',
    difficulty: 'beginner',
    xp: 15,
    estimatedTime: 60,
    dialogs: [
      {
        character: 'mentor',
        avatar: '👨‍💼',
        text: 'Перед назначением груза нужно собрать информацию о водителе.',
      },
      {
        character: 'mentor',
        avatar: '📋',
        text: 'CDL License, Medical Card, опыт вождения, HOS статус, текущая локация.',
        question: {
          text: 'Что ОБЯЗАТЕЛЬНО нужно проверить у водителя перед рейсом?',
          options: [
            { text: 'Любимый цвет', isCorrect: false },
            { text: 'CDL License и Medical Card', isCorrect: true, feedback: 'Верно! Без этих документов водить нельзя.' },
            { text: 'Семейное положение', isCorrect: false },
            { text: 'Хобби', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'CDL (Commercial Driver License) и Medical Card — обязательные документы для всех коммерческих водителей в США.',
        },
      },
      {
        character: 'driver',
        avatar: '🚛',
        text: 'Мой CDL Class A, Medical Card действителен до 2026 года. Готов к работе!',
      },
    ],
  },

  {
    id: 'm6-l2-hos-check',
    module: 'Модуль 6',
    topic: 'Проверка HOS перед назначением',
    difficulty: 'intermediate',
    xp: 20,
    estimatedTime: 70,
    dialogs: [
      {
        character: 'mentor',
        avatar: '⏰',
        text: 'Перед назначением груза ВСЕГДА проверяй HOS водителя!',
      },
      {
        character: 'driver',
        avatar: '🚛',
        text: 'У меня осталось 6 часов вождения. Груз на 500 миль.',
      },
      {
        character: 'mentor',
        avatar: '🧮',
        text: '500 миль / 50 mph = 10 часов в пути. У водителя только 6 часов!',
        question: {
          text: 'Что делать в этой ситуации?',
          options: [
            { text: 'Назначить груз, пусть нарушает HOS', isCorrect: false },
            { text: 'Отказаться от груза или найти другого водителя', isCorrect: true, feedback: 'Правильно! Нарушение HOS = штрафы.' },
            { text: 'Попросить водителя ехать быстрее', isCorrect: false },
            { text: 'Игнорировать HOS', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'Нарушение HOS грозит штрафами до $16,000 для компании и $2,750 для водителя. Никогда не стоит рисковать!',
        },
      },
      {
        character: 'mentor',
        avatar: '✅',
        text: 'Всегда планируй маршруты с учётом доступных HOS часов водителя.',
      },
    ],
  },

  {
    id: 'm6-l3-driver-motivation',
    module: 'Модуль 6',
    topic: 'Мотивация водителей',
    difficulty: 'intermediate',
    xp: 15,
    estimatedTime: 60,
    dialogs: [
      {
        character: 'driver',
        avatar: '😞',
        text: 'Майк, я устал от длинных рейсов. Хочу чаще быть дома...',
      },
      {
        character: 'mentor',
        avatar: '💭',
        text: 'Мотивация водителей — ключ к успеху. Нужно учитывать их желания.',
        question: {
          text: 'Как правильно мотивировать водителя?',
          options: [
            { text: 'Игнорировать его просьбы', isCorrect: false },
            { text: 'Предлагать прибыльные грузы и учитывать home time', isCorrect: true, feedback: 'Отлично! Баланс работы и личной жизни важен.' },
            { text: 'Давать только дальние рейсы', isCorrect: false },
            { text: 'Угрожать увольнением', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'Счастливые водители = продуктивные водители. Учитывайте их желание быть дома, предлагайте хорошие ставки и относитесь с уважением.',
        },
      },
      {
        character: 'mentor',
        avatar: '🏠',
        text: 'Давай найдём тебе груз поближе к дому. Заслужил отдых с семьёй!',
      },
    ],
  },
];

// ============================================
// МОДУЛЬ 7: МАРШРУТИЗАЦИЯ
// ============================================

export const module7Dialogs: DuolingoDialog[] = [
  {
    id: 'm7-l1-route-planning-tools',
    module: 'Модуль 7',
    topic: 'Инструменты маршрутизации',
    difficulty: 'beginner',
    xp: 10,
    estimatedTime: 50,
    dialogs: [
      {
        character: 'mentor',
        avatar: '🗺️',
        text: 'Для планирования маршрутов траков используются специальные инструменты.',
      },
      {
        character: 'mentor',
        avatar: '🗺️',
        text: 'Google Maps хорош для легковых авто, но для траков нужны truck-specific маршруты.',
        question: {
          text: 'Какой инструмент лучше для планирования маршрутов траков?',
          options: [
            { text: 'Google Maps (обычный)', isCorrect: false },
            { text: 'PC Miler или Trucker Path', isCorrect: true, feedback: 'Верно! Они учитывают ограничения для траков.' },
            { text: 'Яндекс.Карты', isCorrect: false },
            { text: 'Бумажная карта', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'PC Miler и Trucker Path учитывают высоту мостов, вес ограничения, truck stops и запрещённые для траков дороги.',
        },
      },
    ],
  },

  {
    id: 'm7-l2-calculating-drive-time',
    module: 'Модуль 7',
    topic: 'Расчёт времени в пути',
    difficulty: 'intermediate',
    xp: 20,
    estimatedTime: 80,
    dialogs: [
      {
        character: 'mentor',
        avatar: '⏱️',
        text: 'Новички часто ошибаются в расчёте времени. Траки едут НЕ 65-70 mph!',
      },
      {
        character: 'mentor',
        avatar: '🧮',
        text: 'Средняя скорость трака с учётом остановок — 50-55 mph.',
        question: {
          text: 'Сколько времени займёт рейс на 500 миль?',
          options: [
            { text: '7 часов (500/70)', isCorrect: false },
            { text: '10 часов (500/50)', isCorrect: true, feedback: 'Правильно! Всегда считай по 50 mph.' },
            { text: '5 часов (500/100)', isCorrect: false },
            { text: '8 часов (500/60)', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'Формула: Мили / 50 mph = Часы. Плюс добавь время на топливо (30 мин), обед (30 мин), 30-min break.',
        },
      },
      {
        character: 'driver',
        avatar: '🚛',
        text: 'Точно! Плюс мне нужно заправиться и пообедать. Реально 10-11 часов.',
      },
    ],
  },

  {
    id: 'm7-l3-time-zones',
    module: 'Модуль 7',
    topic: 'Часовые пояса США',
    difficulty: 'intermediate',
    xp: 15,
    estimatedTime: 60,
    dialogs: [
      {
        character: 'mentor',
        avatar: '🌍',
        text: 'США имеет 4 основных часовых пояса. Это важно для планирования!',
      },
      {
        character: 'mentor',
        avatar: '🕐',
        text: 'Eastern (ET), Central (CT), Mountain (MT), Pacific (PT). Каждый на 1 час разницы.',
        question: {
          text: 'Водитель выехал из Нью-Йорка (ET) в 10:00. Во сколько он прибудет в Чикаго (CT) через 12 часов?',
          options: [
            { text: '22:00 CT', isCorrect: false },
            { text: '21:00 CT', isCorrect: true, feedback: 'Верно! 10:00 ET + 12 часов = 22:00 ET = 21:00 CT' },
            { text: '23:00 CT', isCorrect: false },
            { text: '20:00 CT', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'Central Time на 1 час позади Eastern Time. 22:00 ET = 21:00 CT.',
        },
      },
      {
        character: 'mentor',
        avatar: '💡',
        text: 'Всегда уточняй часовой пояс при назначении времени погрузки и доставки!',
      },
    ],
  },

  {
    id: 'm7-l4-deadhead-minimization',
    module: 'Модуль 7',
    topic: 'Минимизация deadhead',
    difficulty: 'advanced',
    xp: 25,
    estimatedTime: 90,
    dialogs: [
      {
        character: 'mentor',
        avatar: '📉',
        text: 'Deadhead — это пустой пробег без груза. Он не приносит дохода!',
      },
      {
        character: 'mentor',
        avatar: '💰',
        text: 'Груз платит $2,500 за 500 миль. Но deadhead 100 миль до погрузки.',
        question: {
          text: 'Какой реальный RPM (rate per mile) с учётом deadhead?',
          options: [
            { text: '$5.00/mile (2500/500)', isCorrect: false },
            { text: '$4.17/mile (2500/600)', isCorrect: true, feedback: 'Верно! Deadhead снижает прибыльность.' },
            { text: '$2.50/mile', isCorrect: false },
            { text: '$3.00/mile', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'Всегда включай deadhead в расчёт: $2,500 / (500 миль груза + 100 миль deadhead) = $4.17/mile.',
        },
      },
      {
        character: 'mentor',
        avatar: '🎯',
        text: 'Цель: deadhead меньше 50 миль. Больше 150 миль — плохо для прибыли.',
      },
    ],
  },
];

// ============================================
// МОДУЛЬ 8: ТИПЫ ГРУЗОВ
// ============================================

export const module8Dialogs: DuolingoDialog[] = [
  {
    id: 'm8-l1-dry-van-basics',
    module: 'Модуль 8',
    topic: 'Dry Van грузы',
    difficulty: 'beginner',
    xp: 10,
    estimatedTime: 50,
    dialogs: [
      {
        character: 'mentor',
        avatar: '🚛',
        text: 'Dry Van — самый распространённый тип трейлера в США.',
      },
      {
        character: 'mentor',
        avatar: '📦',
        text: '53 фута длина, 26 паллет вместимость, максимум 45,000 lbs груза.',
        question: {
          text: 'Какие грузы перевозят в Dry Van?',
          options: [
            { text: 'Замороженные продукты', isCorrect: false },
            { text: 'Розничные товары, электроника, одежда', isCorrect: true, feedback: 'Правильно! Всё что не требует температурного контроля.' },
            { text: 'Жидкости', isCorrect: false },
            { text: 'Живые животные', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'Dry Van — это закрытый трейлер без температурного контроля. Идеален для упакованных товаров.',
        },
      },
    ],
  },

  {
    id: 'm8-l2-reefer-vs-dry-van',
    module: 'Модуль 8',
    topic: 'Reefer vs Dry Van',
    difficulty: 'intermediate',
    xp: 15,
    estimatedTime: 60,
    dialogs: [
      {
        character: 'broker',
        avatar: '💼',
        text: 'У меня груз мяса из Техаса во Флориду. Какой трейлер нужен?',
      },
      {
        character: 'mentor',
        avatar: '❄️',
        text: 'Мясо требует холода! Нужен Reefer (рефрижератор).',
        question: {
          text: 'Чем Reefer отличается от Dry Van?',
          options: [
            { text: 'Ничем, это одно и то же', isCorrect: false },
            { text: 'Reefer имеет температурный контроль (-20°F до +70°F)', isCorrect: true, feedback: 'Верно! Reefer = холодильник на колёсах.' },
            { text: 'Reefer больше по размеру', isCorrect: false },
            { text: 'Reefer дешевле', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'Reefer перевозит мясо, молочку, фрукты, овощи, фармацевтику. Ставки выше ($2.00-3.50/mile), но расход топлива больше.',
        },
      },
      {
        character: 'mentor',
        avatar: '💰',
        text: 'Reefer грузы платят на 20-30% больше, но требуют больше топлива.',
      },
    ],
  },

  {
    id: 'm8-l3-hazmat-requirements',
    module: 'Модуль 8',
    topic: 'HAZMAT грузы',
    difficulty: 'advanced',
    xp: 25,
    estimatedTime: 80,
    dialogs: [
      {
        character: 'broker',
        avatar: '💼',
        text: 'Груз химикатов, требуется HAZMAT endorsement.',
      },
      {
        character: 'mentor',
        avatar: '☢️',
        text: 'HAZMAT — опасные материалы. Требуют специальной подготовки!',
        question: {
          text: 'Что нужно водителю для перевозки HAZMAT?',
          options: [
            { text: 'Обычный CDL достаточно', isCorrect: false },
            { text: 'CDL с H endorsement и специальная страховка', isCorrect: true, feedback: 'Правильно! Плюс background check от TSA.' },
            { text: 'Только желание', isCorrect: false },
            { text: 'Медицинская справка', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'HAZMAT требует: CDL с H endorsement, TSA background check, страховка минимум $5M, специальные placards на траке.',
        },
      },
      {
        character: 'mentor',
        avatar: '💰',
        text: 'HAZMAT платит $3.00-5.00/mile, но риски и требования высокие.',
      },
    ],
  },
];

// ============================================
// МОДУЛЬ 9: ФИНАНСЫ
// ============================================

export const module9Dialogs: DuolingoDialog[] = [
  {
    id: 'm9-l1-calculating-profitability',
    module: 'Модуль 9',
    topic: 'Расчёт прибыльности',
    difficulty: 'intermediate',
    xp: 20,
    estimatedTime: 90,
    dialogs: [
      {
        character: 'mentor',
        avatar: '💰',
        text: 'Диспетчер должен уметь быстро считать прибыльность груза!',
      },
      {
        character: 'mentor',
        avatar: '🧮',
        text: 'Груз $2,500 за 1,000 миль. Топливо: (1000/6.5 MPG) × $3.50 = $538.',
        question: {
          text: 'Какая чистая прибыль после вычета топлива?',
          options: [
            { text: '$2,500', isCorrect: false },
            { text: '$1,962', isCorrect: true, feedback: 'Верно! $2,500 - $538 = $1,962' },
            { text: '$2,000', isCorrect: false },
            { text: '$1,500', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'Всегда вычитай расходы: топливо, tolls, lumper fees, factoring. Чистая прибыль = Валовая выручка - Все расходы.',
        },
      },
      {
        character: 'mentor',
        avatar: '📊',
        text: 'Хорошая маржа — 60-70%. Меньше 50% — груз невыгодный.',
      },
    ],
  },

  {
    id: 'm9-l2-rpm-analysis',
    module: 'Модуль 9',
    topic: 'Rate Per Mile анализ',
    difficulty: 'intermediate',
    xp: 20,
    estimatedTime: 70,
    dialogs: [
      {
        character: 'mentor',
        avatar: '📈',
        text: 'RPM (Rate Per Mile) — главная метрика прибыльности.',
      },
      {
        character: 'broker',
        avatar: '💼',
        text: 'Предлагаю $1,800 за 1,200 миль.',
        question: {
          text: 'Какой RPM у этого груза?',
          options: [
            { text: '$1.80/mile', isCorrect: false },
            { text: '$1.50/mile', isCorrect: true, feedback: 'Правильно! $1,800 / 1,200 = $1.50/mile' },
            { text: '$2.00/mile', isCorrect: false },
            { text: '$1.20/mile', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'Формула RPM: Общая ставка / Мили = Rate Per Mile. Для Dry Van минимум $1.50/mile, лучше $1.80-2.50/mile.',
        },
      },
      {
        character: 'mentor',
        avatar: '⚠️',
        text: '$1.50/mile — это минимум для Dry Van. Попробуй договориться на $2,000!',
      },
    ],
  },

  {
    id: 'm9-l3-factoring-basics',
    module: 'Модуль 9',
    topic: 'Факторинг',
    difficulty: 'beginner',
    xp: 15,
    estimatedTime: 60,
    dialogs: [
      {
        character: 'mentor',
        avatar: '💳',
        text: 'Брокеры обычно платят через 30-45 дней. Это долго!',
      },
      {
        character: 'mentor',
        avatar: '⚡',
        text: 'Factoring — это продажа инвойсов для быстрой оплаты в 24-48 часов.',
        question: {
          text: 'Сколько стоит факторинг?',
          options: [
            { text: 'Бесплатно', isCorrect: false },
            { text: '2-5% от суммы инвойса', isCorrect: true, feedback: 'Верно! За скорость платишь комиссию.' },
            { text: '50% от суммы', isCorrect: false },
            { text: '$100 фиксированная плата', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'Factoring берёт 2-5% комиссии. Груз $2,500 × 3% = $75. Ты получаешь $2,425 через 1-2 дня вместо ожидания месяц.',
        },
      },
      {
        character: 'mentor',
        avatar: '💡',
        text: 'Факторинг полезен для новых компаний с проблемами cash flow.',
      },
    ],
  },
];

// (промежуточный экспорт удалён — финальный в конце файла)

// ============================================
// МОДУЛЬ 10: КРИТИЧЕСКИЕ СИТУАЦИИ
// ============================================

export const module10Dialogs: DuolingoDialog[] = [
  {
    id: 'm10-l1-accident-protocol',
    module: 'Модуль 10',
    topic: 'Протокол при аварии',
    difficulty: 'advanced',
    xp: 25,
    estimatedTime: 90,
    dialogs: [
      {
        character: 'driver',
        avatar: '🚨',
        text: 'МАЙК! Я попал в аварию! Что делать?!',
      },
      {
        character: 'mentor',
        avatar: '👨‍💼',
        text: 'Спокойно! Первое — безопасность. Ты ранен?',
      },
      {
        character: 'driver',
        avatar: '🚛',
        text: 'Нет, я в порядке. Но трак повреждён.',
      },
      {
        character: 'mentor',
        avatar: '📞',
        text: 'Отлично! Теперь действуй по протоколу:',
        question: {
          text: 'Что делать ПЕРВЫМ после аварии?',
          options: [
            { text: 'Уехать с места аварии', isCorrect: false },
            { text: 'Вызвать 911 и остаться на месте', isCorrect: true, feedback: 'Правильно! Покидать место аварии — преступление.' },
            { text: 'Позвонить брокеру', isCorrect: false },
            { text: 'Сделать селфи', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'Протокол: 1) Вызвать 911, 2) Остаться на месте, 3) Сделать фото, 4) Обменяться информацией, 5) Дождаться полицию.',
        },
      },
      {
        character: 'mentor',
        avatar: '📸',
        text: 'Сделай фото повреждений, номеров других машин, места аварии. Это важно для страховой!',
      },
    ],
  },

  {
    id: 'm10-l2-breakdown-handling',
    module: 'Модуль 10',
    topic: 'Поломка трака',
    difficulty: 'intermediate',
    xp: 20,
    estimatedTime: 70,
    dialogs: [
      {
        character: 'driver',
        avatar: '🔧',
        text: 'Трак сломался посреди дороги. Двигатель перегрелся.',
      },
      {
        character: 'mentor',
        avatar: '🚨',
        text: 'Поломки случаются. Главное — действовать быстро!',
        question: {
          text: 'Что делать при поломке трака?',
          options: [
            { text: 'Продолжать ехать', isCorrect: false },
            { text: 'Остановиться в безопасном месте и вызвать Roadside Assistance', isCorrect: true, feedback: 'Верно! Безопасность превыше всего.' },
            { text: 'Бросить трак', isCorrect: false },
            { text: 'Ждать помощи на середине дороги', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'При поломке: 1) Остановись безопасно, 2) Вызови Roadside Assistance, 3) Уведоми брокера о задержке, 4) Требуй layover pay.',
        },
      },
      {
        character: 'mentor',
        avatar: '💰',
        text: 'Если ремонт займёт больше 2 часов — требуй layover pay от брокера!',
      },
    ],
  },

  {
    id: 'm10-l3-weather-delays',
    module: 'Модуль 10',
    topic: 'Экстремальная погода',
    difficulty: 'intermediate',
    xp: 15,
    estimatedTime: 60,
    dialogs: [
      {
        character: 'driver',
        avatar: '🌨️',
        text: 'Майк, снежная буря! Видимость нулевая. Продолжать?',
      },
      {
        character: 'mentor',
        avatar: '⚠️',
        text: 'НЕТ! Безопасность водителя важнее доставки!',
        question: {
          text: 'Что делать при опасной погоде?',
          options: [
            { text: 'Продолжать ехать любой ценой', isCorrect: false },
            { text: 'Остановиться в безопасном месте и уведомить всех', isCorrect: true, feedback: 'Правильно! Safety first!' },
            { text: 'Ехать быстрее, чтобы успеть', isCorrect: false },
            { text: 'Игнорировать погоду', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'При опасной погоде: 1) Остановись на truck stop, 2) Уведоми брокера и получателя, 3) Жди улучшения. Никакой груз не стоит жизни!',
        },
      },
      {
        character: 'mentor',
        avatar: '✅',
        text: 'Брокеры понимают задержки из-за погоды. Это force majeure.',
      },
    ],
  },

  {
    id: 'm10-l4-cargo-theft',
    module: 'Модуль 10',
    topic: 'Кража груза',
    difficulty: 'advanced',
    xp: 25,
    estimatedTime: 80,
    dialogs: [
      {
        character: 'driver',
        avatar: '😱',
        text: 'МАЙК! Трейлер украли со стоянки!',
      },
      {
        character: 'mentor',
        avatar: '🚨',
        text: 'Это серьёзно! Немедленно действуй!',
        question: {
          text: 'Первые действия при краже груза?',
          options: [
            { text: 'Искать трейлер самому', isCorrect: false },
            { text: 'Вызвать 911 и уведомить страховую компанию', isCorrect: true, feedback: 'Правильно! Это преступление, нужна полиция.' },
            { text: 'Ничего не делать', isCorrect: false },
            { text: 'Скрыть кражу', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'При краже: 1) Вызвать 911, 2) Получить police report, 3) Уведомить cargo insurance, 4) Уведомить брокера. Cargo theft — убытки $500M+ ежегодно в США.',
        },
      },
      {
        character: 'mentor',
        avatar: '🔒',
        text: 'Профилактика: паркуйся только на охраняемых стоянках, используй GPS трекеры и качественные замки!',
      },
    ],
  },
];

// ============================================
// МОДУЛЬ 11: ТЕХНОЛОГИИ
// ============================================

export const module11Dialogs: DuolingoDialog[] = [
  {
    id: 'm11-l1-tms-basics',
    module: 'Модуль 11',
    topic: 'Что такое TMS?',
    difficulty: 'beginner',
    xp: 10,
    estimatedTime: 50,
    dialogs: [
      {
        character: 'mentor',
        avatar: '🖥️',
        text: 'TMS — Transportation Management System. Это мозг операции!',
      },
      {
        character: 'mentor',
        avatar: '📊',
        text: 'TMS автоматизирует dispatch, accounting, документы, отчёты.',
        question: {
          text: 'Что делает TMS система?',
          options: [
            { text: 'Только GPS трекинг', isCorrect: false },
            { text: 'Управление грузами, водителями, финансами', isCorrect: true, feedback: 'Верно! TMS — это всё в одном.' },
            { text: 'Только бухгалтерия', isCorrect: false },
            { text: 'Ничего полезного', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'TMS объединяет: dispatch, load tracking, invoicing, driver management, reporting. Популярные: McLeod, Axon, TMW.',
        },
      },
    ],
  },

  {
    id: 'm11-l2-eld-mandate',
    module: 'Модуль 11',
    topic: 'ELD устройства',
    difficulty: 'intermediate',
    xp: 15,
    estimatedTime: 60,
    dialogs: [
      {
        character: 'mentor',
        avatar: '📱',
        text: 'С 2017 года все траки ОБЯЗАНЫ иметь ELD устройства.',
      },
      {
        character: 'mentor',
        avatar: '⏰',
        text: 'ELD (Electronic Logging Device) автоматически записывает HOS.',
        question: {
          text: 'Зачем нужен ELD?',
          options: [
            { text: 'Для музыки в траке', isCorrect: false },
            { text: 'Автоматический учёт Hours of Service', isCorrect: true, feedback: 'Правильно! Никаких бумажных логбуков.' },
            { text: 'Для игр', isCorrect: false },
            { text: 'Для навигации', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'ELD автоматически записывает время вождения, отдыха, on-duty. Это предотвращает нарушения HOS и подделку логбуков.',
        },
      },
      {
        character: 'driver',
        avatar: '🚛',
        text: 'Мой ELD показывает, что у меня осталось 7 часов вождения.',
      },
    ],
  },

  {
    id: 'm11-l3-gps-tracking',
    module: 'Модуль 11',
    topic: 'GPS мониторинг',
    difficulty: 'intermediate',
    xp: 15,
    estimatedTime: 60,
    dialogs: [
      {
        character: 'mentor',
        avatar: '📍',
        text: 'GPS tracking позволяет видеть траки в реальном времени.',
      },
      {
        character: 'mentor',
        avatar: '🛰️',
        text: 'Samsara, Motive, Geotab — популярные GPS системы.',
        question: {
          text: 'Зачем нужен GPS трекинг?',
          options: [
            { text: 'Только для красоты', isCorrect: false },
            { text: 'Мониторинг местоположения, скорости, маршрута', isCorrect: true, feedback: 'Верно! Полный контроль над флотом.' },
            { text: 'Для прослушки водителей', isCorrect: false },
            { text: 'Не нужен', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'GPS даёт: real-time location, speed monitoring, route history, geofencing alerts, fuel tracking, maintenance alerts.',
        },
      },
      {
        character: 'mentor',
        avatar: '💡',
        text: 'GPS помогает давать точные ETA клиентам и быстро реагировать на проблемы.',
      },
    ],
  },
];

// ============================================
// МОДУЛЬ 12: КАРЬЕРА
// ============================================

export const module12Dialogs: DuolingoDialog[] = [
  {
    id: 'm12-l1-salary-expectations',
    module: 'Модуль 12',
    topic: 'Зарплата диспетчера',
    difficulty: 'beginner',
    xp: 10,
    estimatedTime: 50,
    dialogs: [
      {
        character: 'mentor',
        avatar: '💰',
        text: 'Зарплата диспетчера зависит от опыта и количества траков.',
      },
      {
        character: 'mentor',
        avatar: '📊',
        text: 'Junior: $35-45K, Mid-level: $45-65K, Senior: $65-85K+',
        question: {
          text: 'Сколько зарабатывает опытный диспетчер?',
          options: [
            { text: '$20,000/год', isCorrect: false },
            { text: '$65,000-85,000/год', isCorrect: true, feedback: 'Правильно! Плюс бонусы и комиссии.' },
            { text: '$150,000/год', isCorrect: false },
            { text: '$10,000/год', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'Зарплата растёт с опытом. Топ-диспетчеры (10+ траков) могут зарабатывать $80-100K+ с бонусами.',
        },
      },
    ],
  },

  {
    id: 'm12-l2-career-path',
    module: 'Модуль 12',
    topic: 'Карьерный рост',
    difficulty: 'intermediate',
    xp: 15,
    estimatedTime: 60,
    dialogs: [
      {
        character: 'mentor',
        avatar: '📈',
        text: 'Карьера диспетчера имеет чёткий путь роста.',
      },
      {
        character: 'mentor',
        avatar: '🎯',
        text: 'Junior → Senior → Lead → Manager → Operations Director',
        question: {
          text: 'Какая следующая позиция после Senior Dispatcher?',
          options: [
            { text: 'Водитель', isCorrect: false },
            { text: 'Lead Dispatcher или Dispatch Manager', isCorrect: true, feedback: 'Верно! Управление командой диспетчеров.' },
            { text: 'Механик', isCorrect: false },
            { text: 'Охранник', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'Карьерный путь: Junior (1-2 трака) → Senior (5-10 траков) → Lead (управление командой) → Manager (весь офис).',
        },
      },
      {
        character: 'mentor',
        avatar: '💼',
        text: 'Многие диспетчеры открывают свои транспортные компании через 3-5 лет!',
      },
    ],
  },

  {
    id: 'm12-l3-starting-own-company',
    module: 'Модуль 12',
    topic: 'Открытие своей компании',
    difficulty: 'advanced',
    xp: 25,
    estimatedTime: 90,
    dialogs: [
      {
        character: 'mentor',
        avatar: '🚀',
        text: 'Мечтаешь о своей транспортной компании? Это реально!',
      },
      {
        character: 'mentor',
        avatar: '📋',
        text: 'Нужно: LLC регистрация, MC Authority, страховка, траки.',
        question: {
          text: 'Что ОБЯЗАТЕЛЬНО нужно для открытия транспортной компании?',
          options: [
            { text: 'Только желание', isCorrect: false },
            { text: 'MC Authority и страховка минимум $75,000', isCorrect: true, feedback: 'Правильно! Без MC нельзя работать легально.' },
            { text: 'Только траки', isCorrect: false },
            { text: 'Ничего особенного', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'Для старта нужно: 1) Зарегистрировать LLC, 2) Получить MC Authority ($300), 3) Купить страховку ($75K-1M), 4) Получить EIN, 5) Купить/арендовать траки.',
        },
      },
      {
        character: 'mentor',
        avatar: '💰',
        text: 'Стартовый капитал: $15,000-50,000. Но можно начать с лизинга траков!',
      },
    ],
  },

  {
    id: 'm12-l4-interview-tips',
    module: 'Модуль 12',
    topic: 'Собеседование диспетчера',
    difficulty: 'intermediate',
    xp: 15,
    estimatedTime: 60,
    dialogs: [
      {
        character: 'mentor',
        avatar: '🎤',
        text: 'Готовишься к собеседованию на позицию диспетчера?',
      },
      {
        character: 'mentor',
        avatar: '💼',
        text: 'Работодатели спрашивают о знании HOS, Load Boards, TMS.',
        question: {
          text: 'Какой вопрос часто задают на собеседовании?',
          options: [
            { text: 'Твой любимый цвет?', isCorrect: false },
            { text: 'Объясни правило 11/14 hours HOS', isCorrect: true, feedback: 'Верно! Знание HOS — обязательно.' },
            { text: 'Умеешь ли ты готовить?', isCorrect: false },
            { text: 'Какая у тебя машина?', isCorrect: false },
          ],
          correctAnswer: 1,
          explanation: 'Типичные вопросы: HOS правила, опыт с Load Boards, как рассчитать RPM, как решать конфликты с водителями, знание TMS систем.',
        },
      },
      {
        character: 'mentor',
        avatar: '✅',
        text: 'Покажи знание индустрии, энтузиазм и готовность учиться — и работа твоя!',
      },
    ],
  },
];

// Финальное обновление экспорта
export const allDuolingoDialogs: DuolingoDialog[] = [
  ...module1Dialogs,
  ...module2Dialogs,
  ...module3Dialogs,
  ...module4Dialogs,
  ...module5Dialogs,
  ...module6Dialogs,
  ...module7Dialogs,
  ...module8Dialogs,
  ...module9Dialogs,
  ...module10Dialogs,
  ...module11Dialogs,
  ...module12Dialogs,
];

// Хелперы
export const getDialogById = (id: string): DuolingoDialog | undefined => {
  return allDuolingoDialogs.find(d => d.id === id);
};

export const getDialogsByModule = (module: string): DuolingoDialog[] => {
  return allDuolingoDialogs.filter(d => d.module === module);
};

export const getDialogsByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced'): DuolingoDialog[] => {
  return allDuolingoDialogs.filter(d => d.difficulty === difficulty);
};

export const getTotalXP = (): number => {
  return allDuolingoDialogs.reduce((sum, d) => sum + d.xp, 0);
};

// Статистика
export const getModuleStats = () => {
  const stats = {
    totalModules: 12,
    totalLessons: allDuolingoDialogs.length,
    totalXP: getTotalXP(),
    totalEstimatedTime: allDuolingoDialogs.reduce((sum, d) => sum + d.estimatedTime, 0),
    byDifficulty: {
      beginner: allDuolingoDialogs.filter(d => d.difficulty === 'beginner').length,
      intermediate: allDuolingoDialogs.filter(d => d.difficulty === 'intermediate').length,
      advanced: allDuolingoDialogs.filter(d => d.difficulty === 'advanced').length,
    },
  };
  return stats;
};

console.log('📚 Duolingo Tutorial System загружен!');
console.log(`✅ ${allDuolingoDialogs.length} уроков готовы`);
console.log(`🏆 Всего ${getTotalXP()} XP доступно`);
console.log(`⏱️ Общее время обучения: ${Math.round(allDuolingoDialogs.reduce((sum, d) => sum + d.estimatedTime, 0) / 60)} минут`);

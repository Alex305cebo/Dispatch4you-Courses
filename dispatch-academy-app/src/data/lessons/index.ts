export const DAY_MANIFEST = [
  { dayId: 1, weekId: 1, title: "Знакомство с индустрией грузоперевозок", estimatedMinutes: 40 },
  { dayId: 2, weekId: 1, title: "Типы траков и трейлеров", estimatedMinutes: 35 },
  { dayId: 3, weekId: 1, title: "DOT и FMCSA: регуляции и безопасность", estimatedMinutes: 45 },
  { dayId: 4, weekId: 1, title: "Базовая терминология диспетчера", estimatedMinutes: 35 },
  { dayId: 5, weekId: 1, title: "Структура рынка и участники", estimatedMinutes: 40 },
  { dayId: 6, weekId: 2, title: "Load Boards: поиск грузов", estimatedMinutes: 40 },
  { dayId: 7, weekId: 2, title: "Переговоры о ставках с брокерами", estimatedMinutes: 45 },
  { dayId: 8, weekId: 2, title: "Rate Confirmation: анализ и подписание", estimatedMinutes: 45 },
  { dayId: 9, weekId: 2, title: "Процесс диспетчеризации: от загрузки до доставки", estimatedMinutes: 45 },
  { dayId: 10, weekId: 2, title: "HOS и ELD: правила рабочего времени водителя", estimatedMinutes: 45 },
  { dayId: 11, weekId: 3, title: "Invoicing: выставление счетов", estimatedMinutes: 40 },
  { dayId: 12, weekId: 3, title: "Factoring: ускоренное получение оплаты", estimatedMinutes: 40 },
  { dayId: 13, weekId: 3, title: "Бухгалтерия и финансы перевозчика", estimatedMinutes: 45 },
  { dayId: 14, weekId: 3, title: "Работа с брокерами: отношения и репутация", estimatedMinutes: 40 },
  { dayId: 15, weekId: 3, title: "Клиентский сервис и коммуникации", estimatedMinutes: 40 },
  { dayId: 16, weekId: 4, title: "Кризисные ситуации: поломки и аварии", estimatedMinutes: 45 },
  { dayId: 17, weekId: 4, title: "Управление флотом и планирование", estimatedMinutes: 45 },
  { dayId: 18, weekId: 4, title: "Технологии в диспетчерстве: TMS, GPS, ELD", estimatedMinutes: 40 },
  { dayId: 19, weekId: 4, title: "Сложные ситуации: TONU, Detention, Claims", estimatedMinutes: 45 },
  { dayId: 20, weekId: 4, title: "Итоговая подготовка: всё вместе", estimatedMinutes: 50 },
] as const;

export type DayManifestEntry = (typeof DAY_MANIFEST)[number];

export const WEEK_THEMES = [
  { weekId: 1, theme: "Industry Foundations", titleRu: "Основы индустрии" },
  { weekId: 2, theme: "Operations", titleRu: "Операционная деятельность" },
  { weekId: 3, theme: "Business Skills", titleRu: "Бизнес-навыки" },
  { weekId: 4, theme: "Advanced & Certification", titleRu: "Продвинутый уровень" },
] as const;

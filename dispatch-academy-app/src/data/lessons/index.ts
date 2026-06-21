export const DAY_MANIFEST = [
  // Map 1: Основы (Week 1-3)
  { dayId: 1, weekId: 1, title: "Базовые термины грузоперевозок", estimatedMinutes: 15 },
  { dayId: 2, weekId: 1, title: "Роли в грузоперевозках", estimatedMinutes: 15 },
  { dayId: 3, weekId: 1, title: "Документы грузоперевозок", estimatedMinutes: 15 },
  { dayId: 4, weekId: 1, title: "Load Boards — поиск грузов", estimatedMinutes: 15 },
  { dayId: 5, weekId: 2, title: "Расчёты: RPM, топливо, прибыль", estimatedMinutes: 18 },
  { dayId: 6, weekId: 2, title: "Переговоры с брокерами", estimatedMinutes: 18 },
  { dayId: 7, weekId: 2, title: "HOS — правила рабочего времени", estimatedMinutes: 18 },
  { dayId: 8, weekId: 2, title: "Планирование маршрутов", estimatedMinutes: 18 },
  { dayId: 9, weekId: 3, title: "Кризисные ситуации", estimatedMinutes: 20 },
  { dayId: 10, weekId: 3, title: "Финансы: invoicing, factoring, claims", estimatedMinutes: 20 },
  { dayId: 11, weekId: 3, title: "Комплексный тест — всё вместе", estimatedMinutes: 22 },
  // Map 2: Профессиональный диспетчинг (Week 4-6)
  { dayId: 12, weekId: 4, title: "Работа с несколькими траками одновременно", estimatedMinutes: 22 },
  { dayId: 13, weekId: 4, title: "Типы прицепов и требования к грузам", estimatedMinutes: 22 },
  { dayId: 14, weekId: 4, title: "Продвинутые переговоры", estimatedMinutes: 24 },
  { dayId: 15, weekId: 5, title: "ELD и электронные логи", estimatedMinutes: 24 },
  { dayId: 16, weekId: 5, title: "Detention, Layover, TONU — claims и споры", estimatedMinutes: 24 },
  { dayId: 17, weekId: 5, title: "Страхование и ответственность", estimatedMinutes: 22 },
  { dayId: 18, weekId: 5, title: "Owner-operators vs Company drivers", estimatedMinutes: 22 },
  { dayId: 19, weekId: 5, title: "Сезонность и рыночные циклы", estimatedMinutes: 24 },
  { dayId: 20, weekId: 6, title: "Комплексные multi-step кейсы", estimatedMinutes: 28 },
  { dayId: 21, weekId: 6, title: "Аудит и compliance (FMCSA, CSA scores)", estimatedMinutes: 26 },
  { dayId: 22, weekId: 6, title: "Финальный тест Карты 2", estimatedMinutes: 30 },
  { dayId: 23, weekId: 6, title: "Бонусный уровень — экспертные ситуации", estimatedMinutes: 25 },
] as const;

export type DayManifestEntry = (typeof DAY_MANIFEST)[number];

export const WEEK_THEMES = [
  // Map 1
  { weekId: 1, theme: "Basics", titleRu: "Основы тракинга" },
  { weekId: 2, theme: "Operations", titleRu: "Операционная работа" },
  { weekId: 3, theme: "Advanced", titleRu: "Продвинутый уровень" },
  // Map 2
  { weekId: 4, theme: "Multi-Truck", titleRu: "Управление флотом" },
  { weekId: 5, theme: "Professional", titleRu: "Профессиональный диспетчинг" },
  { weekId: 6, theme: "Mastery", titleRu: "Мастерство и compliance" },
] as const;

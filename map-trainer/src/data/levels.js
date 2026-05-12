// ═══════════════════════════════════════════════════════════
//  СИСТЕМА УРОВНЕЙ — USA Map Trainer
//  8 уровней от простого к сложному
// ═══════════════════════════════════════════════════════════

export const LEVELS = [
  {
    id: 1,
    title: "Штаты на карте",
    subtitle: "Найди штат по названию",
    icon: "🗺️",
    color: "#8b5cf6",
    colorRgb: "139,92,246",
    mode: "find-state",
    questions: 50,
    timePerQ: null,       // без таймера на первом уровне
    unlockPct: 60,
    xpReward: 100,
    description: "Название штата появляется — кликни на карте. Начинаем с крупных, потом мелкие на востоке.",
  },
  {
    id: 2,
    title: "Назови штат",
    subtitle: "Кликни на штат — выбери название",
    icon: "✏️",
    color: "#f97316",
    colorRgb: "249,115,22",
    mode: "name-state",
    questions: 50,
    timePerQ: 20,
    unlockPct: 65,
    xpReward: 150,
    description: "Штат подсвечивается на карте — выбери правильное название из 4 вариантов.",
  },
  {
    id: 3,
    title: "Регионы США",
    subtitle: "С чего начинают все диспетчеры",
    icon: "🌎",
    color: "#06b6d4",
    colorRgb: "6,182,212",
    mode: "regions-intro",
    questions: 50,
    timePerQ: 25,
    unlockPct: 65,
    xpReward: 200,
    description: "Узнай 6 регионов США — Northeast, Southeast, Midwest, South, Southwest, West. Основа для всего остального.",
  },
  {
    id: 4,
    title: "Временные зоны",
    subtitle: "Eastern, Central, Mountain, Pacific...",
    icon: "🕐",
    color: "#22c55e",
    colorRgb: "34,197,94",
    mode: "timezone",
    questions: 50,
    timePerQ: 15,
    unlockPct: 70,
    xpReward: 300,
    description: "Критично для диспетчера. Знать часовой пояс = правильно рассчитать pickup window и HOS.",
  },
  {
    id: 5,
    title: "Столицы штатов",
    subtitle: "Какая столица у этого штата?",
    icon: "🏛️",
    color: "#f59e0b",
    colorRgb: "245,158,11",
    mode: "capitals",
    questions: 50,
    timePerQ: 15,
    unlockPct: 70,
    xpReward: 300,
    description: "Столицы штатов — часто встречаются в документах и адресах доставки.",
  },
  {
    id: 6,
    title: "Города диспетчера",
    subtitle: "Найди город на карте",
    icon: "🏙️",
    color: "#ec4899",
    colorRgb: "236,72,153",
    mode: "find-city",
    questions: 30,
    timePerQ: 20,
    unlockPct: 70,
    xpReward: 350,
    description: "Dallas, Memphis, Chicago, Atlanta — главные freight хабы. Диспетчер должен знать их как свои пять пальцев.",
  },
  {
    id: 7,
    title: "Регионы перевозок",
    subtitle: "Midwest, Sun Belt, Southeast...",
    icon: "📦",
    color: "#14b8a6",
    colorRgb: "20,184,166",
    mode: "region",
    questions: 50,
    timePerQ: 12,
    unlockPct: 75,
    xpReward: 400,
    description: "Регионы определяют freight lanes, ставки и спрос. Sun Belt — самый горячий рынок.",
  },
  {
    id: 8,
    title: "Dispatcher Pro",
    subtitle: "Финальный экзамен",
    icon: "🚛",
    color: "#ef4444",
    colorRgb: "239,68,68",
    mode: "pro-mix",
    questions: 50,
    timePerQ: 12,
    unlockPct: 80,
    xpReward: 600,
    description: "Микс всего: штаты, города, зоны, регионы. На время. Только для тех кто прошёл все уровни.",
    isFinal: true,
  },
];

// Общий максимум XP
export const MAX_XP = LEVELS.reduce((sum, l) => sum + l.xpReward, 0);

// Ранги по XP
export const RANKS = [
  { minXp: 0,    title: "Стажёр",       icon: "🟤", color: "#92400e" },
  { minXp: 200,  title: "Помощник",     icon: "⚪", color: "#94a3b8" },
  { minXp: 500,  title: "Диспетчер",    icon: "🟡", color: "#f59e0b" },
  { minXp: 900,  title: "Старший",      icon: "🔵", color: "#3b82f6" },
  { minXp: 1500, title: "Профи",        icon: "🟣", color: "#8b5cf6" },
  { minXp: 2100, title: "Dispatcher Pro", icon: "🔴", color: "#ef4444" },
];

export function getRank(xp) {
  return [...RANKS].reverse().find((r) => xp >= r.minXp) || RANKS[0];
}

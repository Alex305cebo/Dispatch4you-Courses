import type { TaskResult, DayStatus, FlashcardReviewState } from '../types/progress';

/**
 * Achievement system — pure, fully testable.
 *
 * Definitions are evaluated against a derived stats snapshot so the rest of
 * the app only has to feed in raw progress state. Newly satisfied
 * achievements are surfaced by comparing against the set already unlocked.
 */

export interface AchievementStats {
  totalXP: number;
  level: number;
  currentStreak: number;
  completedTasks: number;
  perfectTasks: number;
  daysCompleted: number;
  miniExamsPassed: number;
  finalExamPassed: boolean;
  flashcardsReviewed: number;
}

export interface AchievementDef {
  id: string;
  icon: string;
  title: string;
  description: string;
  /** True when the achievement's condition is met. */
  isUnlocked: (s: AchievementStats) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-steps',
    icon: '🎯',
    title: 'Первые шаги',
    description: 'Выполните первое задание',
    isUnlocked: (s) => s.completedTasks >= 1,
  },
  {
    id: 'warming-up',
    icon: '💪',
    title: 'Разогрев',
    description: 'Выполните 10 заданий',
    isUnlocked: (s) => s.completedTasks >= 10,
  },
  {
    id: 'hard-worker',
    icon: '🏗️',
    title: 'Трудяга',
    description: 'Выполните 50 заданий',
    isUnlocked: (s) => s.completedTasks >= 50,
  },
  {
    id: 'perfectionist',
    icon: '💎',
    title: 'Перфекционист',
    description: '10 заданий на 100%',
    isUnlocked: (s) => s.perfectTasks >= 10,
  },
  {
    id: 'first-week',
    icon: '📅',
    title: 'Первая неделя',
    description: 'Пройдите 5 дней',
    isUnlocked: (s) => s.daysCompleted >= 5,
  },
  {
    id: 'marathon',
    icon: '🏃',
    title: 'Марафонец',
    description: 'Пройдите 10 дней',
    isUnlocked: (s) => s.daysCompleted >= 10,
  },
  {
    id: 'streak-3',
    icon: '🌊',
    title: 'На волне',
    description: '3 дня подряд',
    isUnlocked: (s) => s.currentStreak >= 3,
  },
  {
    id: 'streak-7',
    icon: '🔥',
    title: 'Несокрушимый',
    description: '7 дней подряд',
    isUnlocked: (s) => s.currentStreak >= 7,
  },
  {
    id: 'xp-1000',
    icon: '💰',
    title: 'Тысячник',
    description: 'Наберите 1000 XP',
    isUnlocked: (s) => s.totalXP >= 1000,
  },
  {
    id: 'level-5',
    icon: '⭐',
    title: 'Помощник',
    description: 'Достигните 5 уровня',
    isUnlocked: (s) => s.level >= 5,
  },
  {
    id: 'level-10',
    icon: '👑',
    title: 'Профи',
    description: 'Достигните 10 уровня',
    isUnlocked: (s) => s.level >= 10,
  },
  {
    id: 'exam-ace',
    icon: '📝',
    title: 'Экзаменатор',
    description: 'Сдайте недельный экзамен',
    isUnlocked: (s) => s.miniExamsPassed >= 1,
  },
  {
    id: 'graduate',
    icon: '🎓',
    title: 'Выпускник',
    description: 'Сдайте финальный экзамен',
    isUnlocked: (s) => s.finalExamPassed,
  },
  {
    id: 'card-master',
    icon: '📚',
    title: 'Знаток терминов',
    description: 'Повторите 50 карточек',
    isUnlocked: (s) => s.flashcardsReviewed >= 50,
  },
];

/** Raw progress slices needed to derive achievement stats. */
export interface AchievementSources {
  totalXP: number;
  level: number;
  currentStreak: number;
  taskScores: Record<string, TaskResult>;
  dayStatuses: Record<number, DayStatus>;
  miniExamPassed: Record<number, boolean>;
  finalExamPassed: boolean;
  flashcardStates: Record<string, FlashcardReviewState>;
}

/** Derives the achievement stats snapshot from raw progress state. */
export function deriveStats(src: AchievementSources): AchievementStats {
  const scores = Object.values(src.taskScores);
  return {
    totalXP: src.totalXP,
    level: src.level,
    currentStreak: src.currentStreak,
    completedTasks: scores.length,
    perfectTasks: scores.filter((s) => s.score === 100).length,
    daysCompleted: Object.values(src.dayStatuses).filter((st) => st === 'completed').length,
    miniExamsPassed: Object.values(src.miniExamPassed).filter(Boolean).length,
    finalExamPassed: src.finalExamPassed,
    flashcardsReviewed: Object.keys(src.flashcardStates).length,
  };
}

/** Returns the ids of all achievements currently satisfied by the stats. */
export function evaluateUnlocked(stats: AchievementStats): string[] {
  return ACHIEVEMENTS.filter((a) => a.isUnlocked(stats)).map((a) => a.id);
}

/**
 * Returns achievement ids that are satisfied now but were not in the
 * previously-unlocked set (i.e. newly earned this check).
 */
export function findNewlyUnlocked(
  stats: AchievementStats,
  alreadyUnlocked: string[]
): string[] {
  const owned = new Set(alreadyUnlocked);
  return evaluateUnlocked(stats).filter((id) => !owned.has(id));
}

/** Lookup helper for rendering. */
export function getAchievementById(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

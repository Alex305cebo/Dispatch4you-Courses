import { describe, it, expect } from 'vitest';
import {
  ACHIEVEMENTS,
  deriveStats,
  evaluateUnlocked,
  findNewlyUnlocked,
  getAchievementById,
  type AchievementSources,
  type AchievementStats,
} from './achievements';
import type { TaskResult } from '../types/progress';

const emptyStats: AchievementStats = {
  totalXP: 0,
  level: 1,
  currentStreak: 0,
  completedTasks: 0,
  perfectTasks: 0,
  daysCompleted: 0,
  miniExamsPassed: 0,
  finalExamPassed: false,
  flashcardsReviewed: 0,
};

const task = (id: string, score: number): TaskResult => ({
  taskId: id,
  score,
  correct: score >= 50,
  timeSpentSeconds: 1,
  attempts: 1,
});

describe('achievements definitions', () => {
  it('all achievements have unique ids', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('getAchievementById finds a known achievement', () => {
    expect(getAchievementById('first-steps')?.title).toBe('Первые шаги');
    expect(getAchievementById('does-not-exist')).toBeUndefined();
  });
});

describe('deriveStats', () => {
  it('derives counts from raw progress slices', () => {
    const src: AchievementSources = {
      totalXP: 1200,
      level: 6,
      currentStreak: 4,
      taskScores: {
        a: task('a', 100),
        b: task('b', 80),
        c: task('c', 100),
      },
      dayStatuses: { 1: 'completed', 2: 'completed', 3: 'available' },
      miniExamPassed: { 1: true, 2: false },
      finalExamPassed: false,
      flashcardStates: { x: {} as any, y: {} as any },
    };
    const stats = deriveStats(src);
    expect(stats.completedTasks).toBe(3);
    expect(stats.perfectTasks).toBe(2);
    expect(stats.daysCompleted).toBe(2);
    expect(stats.miniExamsPassed).toBe(1);
    expect(stats.flashcardsReviewed).toBe(2);
  });
});

describe('evaluateUnlocked', () => {
  it('returns nothing for a brand-new student', () => {
    expect(evaluateUnlocked(emptyStats)).toEqual([]);
  });

  it('unlocks first-steps after a single task', () => {
    expect(evaluateUnlocked({ ...emptyStats, completedTasks: 1 })).toContain('first-steps');
  });

  it('unlocks streak and level badges at thresholds', () => {
    const unlocked = evaluateUnlocked({
      ...emptyStats,
      currentStreak: 7,
      level: 10,
      totalXP: 1000,
    });
    expect(unlocked).toEqual(
      expect.arrayContaining(['streak-3', 'streak-7', 'level-5', 'level-10', 'xp-1000'])
    );
  });
});

describe('findNewlyUnlocked', () => {
  it('returns only achievements not already owned', () => {
    const stats = { ...emptyStats, completedTasks: 10 };
    const newly = findNewlyUnlocked(stats, ['first-steps']);
    expect(newly).toContain('warming-up');
    expect(newly).not.toContain('first-steps');
  });

  it('returns empty when nothing new is earned', () => {
    const stats = { ...emptyStats, completedTasks: 1 };
    expect(findNewlyUnlocked(stats, ['first-steps'])).toEqual([]);
  });
});

import type { TaskType } from '../types/index';

const SIMULATION_TYPES: TaskType[] = [
  'email-sim',
  'phone-dialog',
  'crisis',
  'calculator',
  'map-routing',
  'document-review',
];

/**
 * Returns base XP for completing a task.
 * Only awards XP on first completion.
 * Standard tasks: 10 XP, Simulation tasks: 20 XP.
 */
export function getBaseXPForTask(taskType: TaskType, isFirstCompletion: boolean): number {
  if (!isFirstCompletion) return 0;
  return SIMULATION_TYPES.includes(taskType) ? 20 : 10;
}

/**
 * Returns bonus XP for a perfect score on first attempt.
 * +5 XP if score is exactly 100 and it's the first attempt.
 */
export function getPerfectScoreBonus(score: number, isFirstAttempt: boolean): number {
  return score === 100 && isFirstAttempt ? 5 : 0;
}

/**
 * Returns bonus XP if ALL tasks in a day scored 100%.
 * +10 XP for a perfect day.
 */
export function getDayPerfectBonus(taskScores: number[]): number {
  if (taskScores.length === 0) return 0;
  return taskScores.every((s) => s === 100) ? 10 : 0;
}

/**
 * Returns XP awarded for passing an exam.
 * Mini exam: 50 XP, Final exam: 100 XP.
 */
export function getExamXP(examType: 'mini' | 'final'): number {
  return examType === 'mini' ? 50 : 100;
}

import { describe, it, expect } from 'vitest';
import {
  calculateDayMeanScore,
  shouldUnlockNextDay,
  shouldUnlockMiniExam,
  shouldUnlockFinalExam,
} from './unlock';
import type { TaskResult, DayStatus } from '../types/progress';

function makeTaskResult(score: number, taskId = 'task-1'): TaskResult {
  return {
    taskId,
    score,
    correct: score >= 70,
    timeSpentSeconds: 30,
    attempts: 1,
  };
}

describe('calculateDayMeanScore', () => {
  it('returns 0 for an empty array', () => {
    expect(calculateDayMeanScore([])).toBe(0);
  });

  it('returns the single score for a one-element array', () => {
    expect(calculateDayMeanScore([makeTaskResult(85)])).toBe(85);
  });

  it('calculates the arithmetic mean of multiple scores', () => {
    const scores = [makeTaskResult(60), makeTaskResult(80), makeTaskResult(100)];
    expect(calculateDayMeanScore(scores)).toBe(80);
  });

  it('handles all-zero scores', () => {
    const scores = [makeTaskResult(0), makeTaskResult(0)];
    expect(calculateDayMeanScore(scores)).toBe(0);
  });
});

describe('shouldUnlockNextDay', () => {
  it('returns false if not all tasks are completed', () => {
    const scores = [makeTaskResult(90), makeTaskResult(80)];
    expect(shouldUnlockNextDay(scores, 3)).toBe(false);
  });

  it('returns false if all tasks completed but mean < 70', () => {
    const scores = [makeTaskResult(50), makeTaskResult(60), makeTaskResult(60)];
    expect(shouldUnlockNextDay(scores, 3)).toBe(false);
  });

  it('returns true if all tasks completed and mean === 70', () => {
    const scores = [makeTaskResult(60), makeTaskResult(70), makeTaskResult(80)];
    expect(shouldUnlockNextDay(scores, 3)).toBe(true);
  });

  it('returns true if all tasks completed and mean > 70', () => {
    const scores = [makeTaskResult(90), makeTaskResult(100)];
    expect(shouldUnlockNextDay(scores, 2)).toBe(true);
  });

  it('returns false for empty scores with totalTasksInDay > 0', () => {
    expect(shouldUnlockNextDay([], 3)).toBe(false);
  });

  it('returns false for empty scores with totalTasksInDay = 0 (mean is 0, below threshold)', () => {
    // Edge case: day with no tasks — length matches but mean is 0, not ≥ 70
    expect(shouldUnlockNextDay([], 0)).toBe(false);
  });
});

describe('shouldUnlockMiniExam', () => {
  it('returns true when all 5 days are completed', () => {
    const statuses: DayStatus[] = ['completed', 'completed', 'completed', 'completed', 'completed'];
    expect(shouldUnlockMiniExam(statuses)).toBe(true);
  });

  it('returns false if any day is not completed', () => {
    const statuses: DayStatus[] = ['completed', 'completed', 'in-progress', 'completed', 'completed'];
    expect(shouldUnlockMiniExam(statuses)).toBe(false);
  });

  it('returns false if array has fewer than 5 elements', () => {
    const statuses: DayStatus[] = ['completed', 'completed', 'completed'];
    expect(shouldUnlockMiniExam(statuses)).toBe(false);
  });

  it('returns false for all locked statuses', () => {
    const statuses: DayStatus[] = ['locked', 'locked', 'locked', 'locked', 'locked'];
    expect(shouldUnlockMiniExam(statuses)).toBe(false);
  });
});

describe('shouldUnlockFinalExam', () => {
  it('returns true when all 4 mini exams are passed', () => {
    expect(shouldUnlockFinalExam({ 1: true, 2: true, 3: true, 4: true })).toBe(true);
  });

  it('returns false if any mini exam is not passed', () => {
    expect(shouldUnlockFinalExam({ 1: true, 2: true, 3: false, 4: true })).toBe(false);
  });

  it('returns false if a key is missing', () => {
    expect(shouldUnlockFinalExam({ 1: true, 2: true, 4: true })).toBe(false);
  });

  it('returns false for an empty record', () => {
    expect(shouldUnlockFinalExam({})).toBe(false);
  });

  it('ignores extra keys beyond 1-4', () => {
    expect(shouldUnlockFinalExam({ 1: true, 2: true, 3: true, 4: true, 5: true })).toBe(true);
  });
});

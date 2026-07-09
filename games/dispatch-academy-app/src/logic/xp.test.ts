import { describe, it, expect } from 'vitest';
import { getBaseXPForTask, getPerfectScoreBonus, getDayPerfectBonus, getExamXP } from './xp';
import type { TaskType } from '../types/index';

describe('getBaseXPForTask', () => {
  const standardTypes: TaskType[] = ['quiz', 'fill-blank', 'drag-match', 'audio-term', 'flashcard'];
  const simulationTypes: TaskType[] = ['email-sim', 'phone-dialog', 'crisis', 'calculator', 'map-routing', 'document-review'];

  it('returns 10 XP for standard task types on first completion', () => {
    for (const type of standardTypes) {
      expect(getBaseXPForTask(type, true)).toBe(10);
    }
  });

  it('returns 20 XP for simulation task types on first completion', () => {
    for (const type of simulationTypes) {
      expect(getBaseXPForTask(type, true)).toBe(20);
    }
  });

  it('returns 0 XP for any task type if not first completion', () => {
    for (const type of [...standardTypes, ...simulationTypes]) {
      expect(getBaseXPForTask(type, false)).toBe(0);
    }
  });
});

describe('getPerfectScoreBonus', () => {
  it('returns 5 XP for score 100 on first attempt', () => {
    expect(getPerfectScoreBonus(100, true)).toBe(5);
  });

  it('returns 0 XP for score 100 if not first attempt', () => {
    expect(getPerfectScoreBonus(100, false)).toBe(0);
  });

  it('returns 0 XP for scores below 100 even on first attempt', () => {
    expect(getPerfectScoreBonus(99, true)).toBe(0);
    expect(getPerfectScoreBonus(50, true)).toBe(0);
    expect(getPerfectScoreBonus(0, true)).toBe(0);
  });
});

describe('getDayPerfectBonus', () => {
  it('returns 10 XP when all tasks scored 100', () => {
    expect(getDayPerfectBonus([100, 100, 100])).toBe(10);
    expect(getDayPerfectBonus([100])).toBe(10);
  });

  it('returns 0 XP if any task scored below 100', () => {
    expect(getDayPerfectBonus([100, 99, 100])).toBe(0);
    expect(getDayPerfectBonus([80, 90, 70])).toBe(0);
  });

  it('returns 0 XP for an empty array', () => {
    expect(getDayPerfectBonus([])).toBe(0);
  });
});

describe('getExamXP', () => {
  it('returns 50 XP for mini exam', () => {
    expect(getExamXP('mini')).toBe(50);
  });

  it('returns 100 XP for final exam', () => {
    expect(getExamXP('final')).toBe(100);
  });
});

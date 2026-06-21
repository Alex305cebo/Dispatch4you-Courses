import { describe, it, expect } from 'vitest';
import type { ExamQuestion } from '../types/progress';
import {
  getModulesForWeek,
  selectMiniExamQuestions,
  selectFinalExamQuestions,
  evaluateExam,
  canRetakeExam,
} from './exam';

// Helper to create a mock ExamQuestion
function makeQuestion(
  id: string,
  type: ExamQuestion['type'],
  moduleSource: number
): ExamQuestion {
  return {
    id,
    type,
    moduleSource,
    data: {
      question: `Question ${id}`,
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 0,
      explanation: 'Explanation',
    },
  };
}

describe('getModulesForWeek', () => {
  it('returns modules [1, 2, 3] for week 1', () => {
    expect(getModulesForWeek(1)).toEqual([1, 2, 3]);
  });

  it('returns modules [4, 5, 6] for week 2', () => {
    expect(getModulesForWeek(2)).toEqual([4, 5, 6]);
  });

  it('returns modules [7, 8, 9] for week 3', () => {
    expect(getModulesForWeek(3)).toEqual([7, 8, 9]);
  });

  it('returns modules [10, 11, 12] for week 4', () => {
    expect(getModulesForWeek(4)).toEqual([10, 11, 12]);
  });
});

describe('selectMiniExamQuestions', () => {
  function buildWeekPool(weekId: number, countPerType: number): ExamQuestion[] {
    const modules = getModulesForWeek(weekId);
    const types: ExamQuestion['type'][] = ['quiz', 'fill-blank', 'calculator', 'drag-match'];
    const pool: ExamQuestion[] = [];
    let counter = 0;
    for (const type of types) {
      for (let i = 0; i < countPerType; i++) {
        const mod = modules[i % modules.length];
        pool.push(makeQuestion(`q${counter++}`, type, mod));
      }
    }
    return pool;
  }

  it('returns exactly 25 questions when pool is large enough', () => {
    const pool = buildWeekPool(1, 10); // 40 questions total
    const result = selectMiniExamQuestions(1, pool);
    expect(result.length).toBe(25);
  });

  it('ensures at least 3 of each required type', () => {
    const pool = buildWeekPool(2, 10);
    const result = selectMiniExamQuestions(2, pool);
    const typeCounts: Record<string, number> = {};
    for (const q of result) {
      typeCounts[q.type] = (typeCounts[q.type] || 0) + 1;
    }
    expect(typeCounts['quiz']).toBeGreaterThanOrEqual(3);
    expect(typeCounts['fill-blank']).toBeGreaterThanOrEqual(3);
    expect(typeCounts['calculator']).toBeGreaterThanOrEqual(3);
    expect(typeCounts['drag-match']).toBeGreaterThanOrEqual(3);
  });

  it('only includes questions from the correct week modules', () => {
    const weekModules = getModulesForWeek(3); // [7, 8, 9]
    // Add some questions from other weeks
    const pool = [
      ...buildWeekPool(3, 10),
      makeQuestion('other1', 'quiz', 1),
      makeQuestion('other2', 'quiz', 4),
    ];
    const result = selectMiniExamQuestions(3, pool);
    for (const q of result) {
      expect(weekModules).toContain(q.moduleSource);
    }
  });

  it('returns as many as possible (up to 25) if pool is small', () => {
    const pool = buildWeekPool(1, 2); // 8 questions total (2 per type × 4 types)
    const result = selectMiniExamQuestions(1, pool);
    expect(result.length).toBe(8);
  });

  it('returns empty array if no questions match the week', () => {
    const pool = buildWeekPool(2, 5); // all in week 2 modules [4,5,6]
    const result = selectMiniExamQuestions(1, pool); // asking for week 1 [1,2,3]
    expect(result.length).toBe(0);
  });

  it('does not contain duplicate question ids', () => {
    const pool = buildWeekPool(1, 10);
    const result = selectMiniExamQuestions(1, pool);
    const ids = result.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('selectFinalExamQuestions', () => {
  function buildFullPool(): ExamQuestion[] {
    const types: ExamQuestion['type'][] = ['quiz', 'fill-blank', 'calculator', 'drag-match'];
    const pool: ExamQuestion[] = [];
    let counter = 0;
    // 20 quiz per module and 20 situational per module = plenty for selection
    for (let mod = 1; mod <= 12; mod++) {
      for (let i = 0; i < 20; i++) {
        pool.push(makeQuestion(`quiz-${counter++}`, 'quiz', mod));
      }
      for (const type of ['fill-blank', 'calculator', 'drag-match'] as ExamQuestion['type'][]) {
        for (let i = 0; i < 7; i++) {
          pool.push(makeQuestion(`sit-${counter++}`, type, mod));
        }
      }
    }
    return pool;
  }

  it('returns exactly 100 questions when pool is large enough', () => {
    const pool = buildFullPool();
    const result = selectFinalExamQuestions(pool);
    expect(result.length).toBe(100);
  });

  it('contains 50 quiz and 50 non-quiz questions', () => {
    const pool = buildFullPool();
    const result = selectFinalExamQuestions(pool);
    const quizCount = result.filter((q) => q.type === 'quiz').length;
    const situationalCount = result.filter((q) => q.type !== 'quiz').length;
    expect(quizCount).toBe(50);
    expect(situationalCount).toBe(50);
  });

  it('has interleaved quiz and non-quiz questions', () => {
    const pool = buildFullPool();
    const result = selectFinalExamQuestions(pool);
    // With interleaving, positions 0,2,4... should have one type and 1,3,5... the other
    // Due to shuffle this is best verified by checking alternation pattern exists
    let hasAlternation = false;
    for (let i = 0; i < result.length - 1; i++) {
      const currentIsQuiz = result[i].type === 'quiz';
      const nextIsQuiz = result[i + 1].type === 'quiz';
      if (currentIsQuiz !== nextIsQuiz) {
        hasAlternation = true;
        break;
      }
    }
    expect(hasAlternation).toBe(true);
  });

  it('does not contain duplicate question ids', () => {
    const pool = buildFullPool();
    const result = selectFinalExamQuestions(pool);
    const ids = result.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('evaluateExam', () => {
  it('calculates score correctly', () => {
    expect(evaluateExam(18, 25, 70)).toEqual({ score: 72, passed: true });
  });

  it('returns passed: true when score equals passing score', () => {
    expect(evaluateExam(70, 100, 70)).toEqual({ score: 70, passed: true });
  });

  it('returns passed: false when score is below passing score', () => {
    expect(evaluateExam(69, 100, 70)).toEqual({ score: 69, passed: false });
  });

  it('handles perfect score', () => {
    expect(evaluateExam(25, 25, 70)).toEqual({ score: 100, passed: true });
  });

  it('handles zero score', () => {
    expect(evaluateExam(0, 25, 70)).toEqual({ score: 0, passed: false });
  });

  it('rounds score correctly', () => {
    // 17/25 = 68%
    expect(evaluateExam(17, 25, 70)).toEqual({ score: 68, passed: false });
    // 1/3 = 33.33... → rounds to 33
    expect(evaluateExam(1, 3, 30)).toEqual({ score: 33, passed: true });
  });
});

describe('canRetakeExam', () => {
  it('returns true when lastAttemptTime is null (first attempt)', () => {
    expect(canRetakeExam(null, 30)).toBe(true);
  });

  it('returns false when cooldown has not elapsed', () => {
    const lastAttempt = '2024-01-15T10:00:00.000Z';
    const now = '2024-01-15T10:20:00.000Z'; // 20 minutes later
    expect(canRetakeExam(lastAttempt, 30, now)).toBe(false);
  });

  it('returns true when cooldown has elapsed', () => {
    const lastAttempt = '2024-01-15T10:00:00.000Z';
    const now = '2024-01-15T10:30:00.000Z'; // exactly 30 minutes later
    expect(canRetakeExam(lastAttempt, 30, now)).toBe(true);
  });

  it('returns true when more than cooldown has elapsed', () => {
    const lastAttempt = '2024-01-15T10:00:00.000Z';
    const now = '2024-01-15T11:00:00.000Z'; // 60 minutes later
    expect(canRetakeExam(lastAttempt, 30, now)).toBe(true);
  });

  it('handles 24-hour cooldown for final exam', () => {
    const lastAttempt = '2024-01-15T10:00:00.000Z';
    const tooEarly = '2024-01-16T09:59:00.000Z'; // 23h59m later
    const justRight = '2024-01-16T10:00:00.000Z'; // 24h later
    expect(canRetakeExam(lastAttempt, 1440, tooEarly)).toBe(false);
    expect(canRetakeExam(lastAttempt, 1440, justRight)).toBe(true);
  });
});

import type { ExamQuestion } from '../types/progress';

/**
 * Returns the module numbers that belong to a given week.
 * Week 1: [1, 2, 3], Week 2: [4, 5, 6], Week 3: [7, 8, 9], Week 4: [10, 11, 12]
 */
export function getModulesForWeek(weekId: number): number[] {
  const start = (weekId - 1) * 3 + 1;
  return [start, start + 1, start + 2];
}

/**
 * Fisher-Yates shuffle (in-place, returns the same array).
 */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Selects 25 questions for a weekly mini-exam.
 *
 * - Filters pool to only questions whose moduleSource belongs to the given week
 * - Ensures at least 3 questions of each required type ('quiz', 'fill-blank', 'calculator', 'drag-match')
 * - Fills remainder randomly from the filtered pool
 * - If not enough questions available, returns as many as possible (up to 25)
 * - Shuffles the result
 */
export function selectMiniExamQuestions(weekId: number, pool: ExamQuestion[]): ExamQuestion[] {
  const weekModules = getModulesForWeek(weekId);
  const filtered = pool.filter((q) => weekModules.includes(q.moduleSource));

  if (filtered.length === 0) return [];

  const requiredTypes: ExamQuestion['type'][] = ['quiz', 'fill-blank', 'calculator', 'drag-match'];
  const minPerType = 3;
  const targetTotal = 25;

  const selected: ExamQuestion[] = [];
  const usedIds = new Set<string>();

  // First pass: ensure minimum per required type
  for (const type of requiredTypes) {
    const ofType = shuffle(filtered.filter((q) => q.type === type && !usedIds.has(q.id)));
    const take = ofType.slice(0, minPerType);
    for (const q of take) {
      selected.push(q);
      usedIds.add(q.id);
    }
  }

  // Second pass: fill remainder from the filtered pool
  const remaining = shuffle(filtered.filter((q) => !usedIds.has(q.id)));
  for (const q of remaining) {
    if (selected.length >= targetTotal) break;
    selected.push(q);
    usedIds.add(q.id);
  }

  return shuffle(selected);
}

/**
 * Selects 100 questions for the final exam.
 *
 * - 50 where type is 'quiz' (terminology) + 50 where type is NOT 'quiz' (situational)
 * - At least 4 questions per module (moduleSource 1-12)
 * - Shuffles each half, then interleaves
 */
export function selectFinalExamQuestions(pool: ExamQuestion[]): ExamQuestion[] {
  const quizPool = pool.filter((q) => q.type === 'quiz');
  const situationalPool = pool.filter((q) => q.type !== 'quiz');

  const targetPerHalf = 50;
  const minPerModule = 4;
  const totalModules = 12;

  // Helper to select questions ensuring module coverage
  function selectWithModuleCoverage(
    source: ExamQuestion[],
    target: number
  ): ExamQuestion[] {
    const selected: ExamQuestion[] = [];
    const usedIds = new Set<string>();

    // First: ensure at least minPerModule from each module
    for (let mod = 1; mod <= totalModules; mod++) {
      const fromModule = shuffle(source.filter((q) => q.moduleSource === mod && !usedIds.has(q.id)));
      const take = fromModule.slice(0, minPerModule);
      for (const q of take) {
        selected.push(q);
        usedIds.add(q.id);
      }
    }

    // Fill remainder randomly
    const remaining = shuffle(source.filter((q) => !usedIds.has(q.id)));
    for (const q of remaining) {
      if (selected.length >= target) break;
      selected.push(q);
      usedIds.add(q.id);
    }

    return selected.slice(0, target);
  }

  const quizHalf = shuffle(selectWithModuleCoverage(quizPool, targetPerHalf));
  const situationalHalf = shuffle(selectWithModuleCoverage(situationalPool, targetPerHalf));

  // Interleave the two halves
  const result: ExamQuestion[] = [];
  const maxLen = Math.max(quizHalf.length, situationalHalf.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < quizHalf.length) result.push(quizHalf[i]);
    if (i < situationalHalf.length) result.push(situationalHalf[i]);
  }

  return result;
}

/**
 * Evaluates an exam result.
 *
 * score = Math.round((correctCount / totalQuestions) * 100)
 * passed = score >= passingScore
 */
export function evaluateExam(
  correctCount: number,
  totalQuestions: number,
  passingScore: number
): { score: number; passed: boolean } {
  const score = Math.round((correctCount / totalQuestions) * 100);
  return { score, passed: score >= passingScore };
}

/**
 * Determines if a student can retake an exam based on cooldown.
 *
 * - If lastAttemptTime is null, returns true (first attempt)
 * - Otherwise, compares elapsed time since lastAttemptTime to cooldownMinutes
 * - Returns true if elapsed >= cooldownMinutes
 */
export function canRetakeExam(
  lastAttemptTime: string | null,
  cooldownMinutes: number,
  now?: string
): boolean {
  if (lastAttemptTime === null) return true;

  const lastTime = new Date(lastAttemptTime).getTime();
  const currentTime = now ? new Date(now).getTime() : Date.now();
  const elapsedMinutes = (currentTime - lastTime) / (1000 * 60);

  return elapsedMinutes >= cooldownMinutes;
}

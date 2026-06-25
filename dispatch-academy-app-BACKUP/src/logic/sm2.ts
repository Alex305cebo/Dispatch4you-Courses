import type { FlashcardReviewState, SM2Rating } from '../types/progress';

/**
 * Adds a number of days to a given date string (YYYY-MM-DD) and returns the result as YYYY-MM-DD.
 */
function addDaysToDate(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates the next review state for a flashcard using the SM-2 spaced repetition algorithm.
 *
 * Rating effects:
 * - 'again': reset interval to 1 day, decrease EF by 0.2 (min 1.3), reset repetitions to 0
 * - 'hard': multiply interval by 1.2 (ceil), decrease EF by 0.15 (min 1.3), increment repetitions
 * - 'good': rep=0 → interval=1, rep=1 → interval=6, else ceil(interval × EF). No EF change. Increment repetitions.
 * - 'easy': rep=0 → interval=1, rep=1 → interval=6, else ceil(interval × EF × 1.3). Increase EF by 0.15. Increment repetitions.
 *
 * Interval capped at 365 days max.
 * nextReviewDate = today + interval days.
 *
 * @param card - Current flashcard review state
 * @param rating - Student's self-assessment rating
 * @param today - Optional ISO date string (YYYY-MM-DD) representing today's date. Defaults to actual today.
 * @returns Updated FlashcardReviewState
 */
export function calculateSM2(
  card: FlashcardReviewState,
  rating: SM2Rating,
  today?: string
): FlashcardReviewState {
  let { easeFactor, interval, repetitions } = card;

  switch (rating) {
    case 'again':
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      repetitions = 0;
      break;

    case 'hard':
      interval = Math.ceil(interval * 1.2);
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      repetitions += 1;
      break;

    case 'good':
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.ceil(interval * easeFactor);
      }
      repetitions += 1;
      break;

    case 'easy':
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.ceil(interval * easeFactor * 1.3);
      }
      easeFactor += 0.15;
      repetitions += 1;
      break;
  }

  // Cap interval at 365 days max
  interval = Math.min(interval, 365);

  const todayStr = today ?? new Date().toISOString().split('T')[0]!;
  const nextReviewDate = addDaysToDate(todayStr, interval);

  return {
    ...card,
    easeFactor,
    interval,
    repetitions,
    nextReviewDate,
    lastRating: rating,
  };
}

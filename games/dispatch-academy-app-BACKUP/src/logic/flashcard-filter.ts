import type { FlashcardReviewState } from '../types/progress';

/**
 * Returns cards that are due for review (nextReviewDate ≤ today),
 * sorted by overdue time (most overdue first).
 *
 * @param cards - Array of flashcard review states
 * @param today - ISO date string (YYYY-MM-DD) representing today's date
 * @returns Array of due cards sorted most overdue first
 */
export function getDueCards(
  cards: FlashcardReviewState[],
  today: string
): FlashcardReviewState[] {
  return cards
    .filter((card) => card.nextReviewDate <= today)
    .sort((a, b) => {
      // Most overdue first = earliest nextReviewDate first
      if (a.nextReviewDate < b.nextReviewDate) return -1;
      if (a.nextReviewDate > b.nextReviewDate) return 1;
      return 0;
    });
}

/**
 * Returns the earliest nextReviewDate from cards that are NOT yet due,
 * or null if all cards are due (or the array is empty).
 *
 * @param cards - Array of flashcard review states
 * @param today - ISO date string (YYYY-MM-DD) representing today's date
 * @returns Earliest future review date as ISO string, or null
 */
export function getNextReviewDate(
  cards: FlashcardReviewState[],
  today: string
): string | null {
  const futureDates = cards
    .filter((card) => card.nextReviewDate > today)
    .map((card) => card.nextReviewDate);

  if (futureDates.length === 0) return null;

  futureDates.sort();
  return futureDates[0] ?? null;
}

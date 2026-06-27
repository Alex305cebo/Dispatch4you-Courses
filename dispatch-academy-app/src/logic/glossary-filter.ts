import type { Flashcard } from '../types/index';

/**
 * Pure filtering for the glossary screen: free-text search across the term and
 * definition plus an optional category filter. Kept separate from the view so
 * it can be unit-tested.
 */

export const ALL_CATEGORIES = 'all';

export function getCategories(cards: Flashcard[]): string[] {
  const seen = new Set<string>();
  for (const c of cards) seen.add(c.category);
  return Array.from(seen).sort((a, b) => a.localeCompare(b, 'ru'));
}

export function filterGlossary(
  cards: Flashcard[],
  query: string,
  category: string = ALL_CATEGORIES
): Flashcard[] {
  const q = query.trim().toLowerCase();
  return cards.filter((c) => {
    if (category !== ALL_CATEGORIES && c.category !== category) return false;
    if (!q) return true;
    return (
      c.term.toLowerCase().includes(q) ||
      c.definition.toLowerCase().includes(q) ||
      c.example.toLowerCase().includes(q)
    );
  });
}

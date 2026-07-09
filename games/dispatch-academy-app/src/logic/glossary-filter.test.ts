import { describe, it, expect } from 'vitest';
import { filterGlossary, getCategories, ALL_CATEGORIES } from './glossary-filter';
import type { Flashcard } from '../types/index';

const card = (over: Partial<Flashcard>): Flashcard => ({
  id: 'x',
  category: 'Термины',
  difficulty: 'easy',
  term: 'Deadhead',
  definition: 'Пустой пробег без груза',
  example: 'The deadhead is 120 miles',
  ...over,
});

const cards: Flashcard[] = [
  card({
    id: 'c1',
    term: 'Deadhead',
    category: 'Маршруты',
    definition: 'Пустой пробег без груза',
    example: 'The deadhead is 120 miles',
  }),
  card({
    id: 'c2',
    term: 'MC Number',
    category: 'Документы',
    definition: 'Номер перевозчика',
    example: 'Provide your MC number please',
  }),
  card({
    id: 'c3',
    term: 'Detention',
    category: 'Финансы',
    definition: 'Простой за ожидание',
    example: 'Detention starts after two hours',
  }),
];

describe('getCategories', () => {
  it('returns unique sorted categories', () => {
    expect(getCategories(cards)).toEqual(['Документы', 'Маршруты', 'Финансы']);
  });
});

describe('filterGlossary', () => {
  it('returns all cards with empty query and no category', () => {
    expect(filterGlossary(cards, '')).toHaveLength(3);
  });

  it('matches by term (case-insensitive)', () => {
    const res = filterGlossary(cards, 'deadhead');
    expect(res).toHaveLength(1);
    expect(res[0]!.id).toBe('c1');
  });

  it('matches by definition', () => {
    const res = filterGlossary(cards, 'перевозчика');
    expect(res.map((c) => c.id)).toEqual(['c2']);
  });

  it('matches by example text', () => {
    const res = filterGlossary(cards, '120 miles');
    expect(res.map((c) => c.id)).toEqual(['c1']);
  });

  it('filters by category', () => {
    const res = filterGlossary(cards, '', 'Финансы');
    expect(res.map((c) => c.id)).toEqual(['c3']);
  });

  it('combines category and query', () => {
    expect(filterGlossary(cards, 'detention', 'Маршруты')).toHaveLength(0);
    expect(filterGlossary(cards, 'detention', 'Финансы')).toHaveLength(1);
  });

  it('ALL_CATEGORIES does not restrict', () => {
    expect(filterGlossary(cards, '', ALL_CATEGORIES)).toHaveLength(3);
  });
});

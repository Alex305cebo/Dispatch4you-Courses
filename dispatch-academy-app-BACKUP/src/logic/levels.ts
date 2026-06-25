import type { LevelDefinition } from '../types/progress';

/**
 * Level progression table.
 * Each level requires cumulative XP to reach.
 */
export const LEVELS: LevelDefinition[] = [
  { level: 1, title: 'Наблюдатель', xpThreshold: 0 },
  { level: 2, title: 'Стажёр', xpThreshold: 100 },
  { level: 3, title: 'Новичок', xpThreshold: 250 },
  { level: 4, title: 'Ученик', xpThreshold: 500 },
  { level: 5, title: 'Помощник', xpThreshold: 1000 },
  { level: 6, title: 'Диспетчер', xpThreshold: 1500 },
  { level: 7, title: 'Специалист', xpThreshold: 2000 },
  { level: 8, title: 'Эксперт', xpThreshold: 2500 },
  { level: 9, title: 'Мастер', xpThreshold: 3000 },
  { level: 10, title: 'Профи', xpThreshold: 4000 },
];

/**
 * Returns the highest level whose xpThreshold is ≤ the given XP.
 */
export function getLevelForXP(xp: number): LevelDefinition {
  return LEVELS.reduce((acc, lvl) => (xp >= lvl.xpThreshold ? lvl : acc));
}

/**
 * Returns true if the student leveled up (new XP puts them at a higher level than previous XP).
 */
export function didLevelUp(previousXP: number, newXP: number): boolean {
  return getLevelForXP(newXP).level > getLevelForXP(previousXP).level;
}

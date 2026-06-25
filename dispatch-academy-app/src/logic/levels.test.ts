import { describe, it, expect } from 'vitest';
import { LEVELS, getLevelForXP, didLevelUp } from './levels';

describe('LEVELS constant', () => {
  it('contains exactly 10 levels', () => {
    expect(LEVELS).toHaveLength(10);
  });

  it('starts at level 1 with threshold 0', () => {
    expect(LEVELS[0]).toEqual({ level: 1, title: 'Наблюдатель', xpThreshold: 0 });
  });

  it('ends at level 10 with threshold 4000', () => {
    expect(LEVELS[9]).toEqual({ level: 10, title: 'Профи', xpThreshold: 4000 });
  });

  it('has thresholds in ascending order', () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i]?.xpThreshold).toBeGreaterThan(LEVELS[i - 1]?.xpThreshold ?? 0);
    }
  });
});

describe('getLevelForXP', () => {
  it('returns level 1 for 0 XP', () => {
    expect(getLevelForXP(0)).toEqual({ level: 1, title: 'Наблюдатель', xpThreshold: 0 });
  });

  it('returns level 1 for 99 XP (just below level 2)', () => {
    expect(getLevelForXP(99).level).toBe(1);
  });

  it('returns level 2 for exactly 100 XP', () => {
    expect(getLevelForXP(100).level).toBe(2);
  });

  it('returns level 10 for 4000+ XP', () => {
    expect(getLevelForXP(4000).level).toBe(10);
    expect(getLevelForXP(9999).level).toBe(10);
  });

  it('returns correct levels at each threshold boundary', () => {
    for (const lvl of LEVELS) {
      expect(getLevelForXP(lvl.xpThreshold).level).toBe(lvl.level);
    }
  });
});

describe('didLevelUp', () => {
  it('returns true when crossing a level threshold', () => {
    expect(didLevelUp(99, 100)).toBe(true);   // Level 1 → 2
    expect(didLevelUp(249, 250)).toBe(true);   // Level 2 → 3
    expect(didLevelUp(3999, 4000)).toBe(true); // Level 9 → 10
  });

  it('returns false when staying in the same level', () => {
    expect(didLevelUp(50, 99)).toBe(false);    // both Level 1
    expect(didLevelUp(100, 200)).toBe(false);  // both Level 2
    expect(didLevelUp(4000, 5000)).toBe(false); // both Level 10
  });

  it('returns true when jumping multiple levels', () => {
    expect(didLevelUp(0, 4000)).toBe(true);    // Level 1 → 10
    expect(didLevelUp(99, 500)).toBe(true);    // Level 1 → 4
  });

  it('returns false when XP does not change', () => {
    expect(didLevelUp(100, 100)).toBe(false);
  });
});

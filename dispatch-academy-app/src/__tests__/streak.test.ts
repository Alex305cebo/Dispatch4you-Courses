import { describe, it, expect } from 'vitest';
import { calculateStreak, checkMilestone, getYesterday } from '../logic/streak';

describe('getYesterday', () => {
  it('returns the previous day for a normal date', () => {
    expect(getYesterday('2024-03-15')).toBe('2024-03-14');
  });

  it('handles month boundaries', () => {
    expect(getYesterday('2024-03-01')).toBe('2024-02-29'); // 2024 is leap year
    expect(getYesterday('2023-03-01')).toBe('2023-02-28'); // non-leap year
  });

  it('handles year boundaries', () => {
    expect(getYesterday('2024-01-01')).toBe('2023-12-31');
  });
});

describe('calculateStreak', () => {
  it('returns newStreak=1 for first ever activity (null lastActivityDate)', () => {
    const result = calculateStreak(null, 0, '2024-03-15');
    expect(result).toEqual({ newStreak: 1, streakBroken: false });
  });

  it('keeps streak unchanged if lastActivityDate is today', () => {
    const result = calculateStreak('2024-03-15', 5, '2024-03-15');
    expect(result).toEqual({ newStreak: 5, streakBroken: false });
  });

  it('increments streak by 1 if lastActivityDate is yesterday', () => {
    const result = calculateStreak('2024-03-14', 5, '2024-03-15');
    expect(result).toEqual({ newStreak: 6, streakBroken: false });
  });

  it('resets streak to 1 if gap > 1 day', () => {
    const result = calculateStreak('2024-03-12', 5, '2024-03-15');
    expect(result).toEqual({ newStreak: 1, streakBroken: true });
  });

  it('resets streak to 1 for a 2-day gap', () => {
    const result = calculateStreak('2024-03-13', 10, '2024-03-15');
    expect(result).toEqual({ newStreak: 1, streakBroken: true });
  });

  it('handles month boundary correctly for consecutive days', () => {
    const result = calculateStreak('2024-02-29', 3, '2024-03-01');
    expect(result).toEqual({ newStreak: 4, streakBroken: false });
  });
});

describe('checkMilestone', () => {
  it('returns 3 for streak of 3', () => {
    expect(checkMilestone(3)).toBe(3);
  });

  it('returns 7 for streak of 7', () => {
    expect(checkMilestone(7)).toBe(7);
  });

  it('returns 14 for streak of 14', () => {
    expect(checkMilestone(14)).toBe(14);
  });

  it('returns 30 for streak of 30', () => {
    expect(checkMilestone(30)).toBe(30);
  });

  it('returns null for non-milestone values', () => {
    expect(checkMilestone(1)).toBeNull();
    expect(checkMilestone(2)).toBeNull();
    expect(checkMilestone(4)).toBeNull();
    expect(checkMilestone(10)).toBeNull();
    expect(checkMilestone(15)).toBeNull();
    expect(checkMilestone(29)).toBeNull();
    expect(checkMilestone(31)).toBeNull();
  });
});

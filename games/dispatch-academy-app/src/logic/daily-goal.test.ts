import { describe, it, expect } from 'vitest';
import { addDailyXp, xpTodayForDate, dailyGoalPercent } from './daily-goal';
import { shouldRemindStreak } from './streak-reminder';

describe('addDailyXp', () => {
  it('accumulates within the same day', () => {
    const r = addDailyXp('2026-06-27', 10, 5, '2026-06-27', 30);
    expect(r.xpToday).toBe(15);
    expect(r.xpTodayDate).toBe('2026-06-27');
    expect(r.reachedGoalNow).toBe(false);
  });

  it('rolls over to zero on a new day', () => {
    const r = addDailyXp('2026-06-26', 40, 10, '2026-06-27', 30);
    expect(r.xpToday).toBe(10);
    expect(r.xpTodayDate).toBe('2026-06-27');
  });

  it('flags the moment the goal is first reached', () => {
    const r = addDailyXp('2026-06-27', 25, 10, '2026-06-27', 30);
    expect(r.xpToday).toBe(35);
    expect(r.reachedGoalNow).toBe(true);
  });

  it('does not re-flag once already past the goal', () => {
    const r = addDailyXp('2026-06-27', 35, 10, '2026-06-27', 30);
    expect(r.reachedGoalNow).toBe(false);
  });

  it('null previous date starts a fresh day', () => {
    const r = addDailyXp(null, 0, 30, '2026-06-27', 30);
    expect(r.xpToday).toBe(30);
    expect(r.reachedGoalNow).toBe(true);
  });
});

describe('xpTodayForDate', () => {
  it('returns stored xp only when the date matches today', () => {
    expect(xpTodayForDate('2026-06-27', 20, '2026-06-27')).toBe(20);
    expect(xpTodayForDate('2026-06-26', 20, '2026-06-27')).toBe(0);
    expect(xpTodayForDate(null, 20, '2026-06-27')).toBe(0);
  });
});

describe('dailyGoalPercent', () => {
  it('clamps to 0–100', () => {
    expect(dailyGoalPercent(0, 30)).toBe(0);
    expect(dailyGoalPercent(15, 30)).toBe(50);
    expect(dailyGoalPercent(45, 30)).toBe(100);
    expect(dailyGoalPercent(5, 0)).toBe(0);
  });
});

describe('shouldRemindStreak', () => {
  it('reminds when a streak exists and today is not yet done', () => {
    expect(shouldRemindStreak(3, '2026-06-26', '2026-06-27')).toBe(true);
  });

  it('does not remind when already active today', () => {
    expect(shouldRemindStreak(3, '2026-06-27', '2026-06-27')).toBe(false);
  });

  it('does not remind without a streak', () => {
    expect(shouldRemindStreak(0, null, '2026-06-27')).toBe(false);
  });
});

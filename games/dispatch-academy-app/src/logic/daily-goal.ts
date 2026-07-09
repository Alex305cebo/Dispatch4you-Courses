/**
 * Daily XP goal tracking — pure and testable. The store keeps the XP earned
 * "today" together with the date it belongs to so it can roll over at midnight,
 * and we detect the moment the goal is first reached to celebrate it once.
 */

export const DEFAULT_DAILY_GOAL = 30;
export const DAILY_GOAL_OPTIONS = [10, 20, 30, 50, 100];

export interface DailyXpResult {
  xpToday: number;
  xpTodayDate: string;
  reachedGoalNow: boolean;
}

/**
 * Adds XP to today's tally, rolling over to zero when the stored date is not
 * today. Reports whether this addition is the one that first reaches the goal.
 */
export function addDailyXp(
  prevDate: string | null,
  prevXpToday: number,
  amount: number,
  today: string,
  goal: number
): DailyXpResult {
  const sameDay = prevDate === today;
  const before = sameDay ? prevXpToday : 0;
  const after = before + amount;
  const reachedGoalNow = goal > 0 && before < goal && after >= goal;
  return { xpToday: after, xpTodayDate: today, reachedGoalNow };
}

/** Returns today's XP relative to the active date (0 if it belongs to a past day). */
export function xpTodayForDate(
  storedDate: string | null,
  storedXp: number,
  today: string
): number {
  return storedDate === today ? storedXp : 0;
}

/** Progress toward the goal as a 0–100 percentage. */
export function dailyGoalPercent(xpToday: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((xpToday / goal) * 100));
}

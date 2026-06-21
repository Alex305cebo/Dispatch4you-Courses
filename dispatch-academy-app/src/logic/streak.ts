/**
 * Streak calculation engine.
 * All dates are ISO format "YYYY-MM-DD". No timezone handling —
 * caller provides today in the student's local timezone.
 */

export interface StreakResult {
  newStreak: number;
  streakBroken: boolean;
}

/**
 * Returns the ISO date string for the day before `today`.
 */
export function getYesterday(today: string): string {
  const date = new Date(today + 'T00:00:00');
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates the new streak value based on the last activity date.
 *
 * - If lastActivityDate is null (first ever activity): newStreak = 1, streakBroken = false
 * - If lastActivityDate === today: streak unchanged (already counted today)
 * - If lastActivityDate is yesterday: streak incremented by 1
 * - Otherwise (gap > 1 day): streak reset to 1, streakBroken = true
 */
export function calculateStreak(
  lastActivityDate: string | null,
  currentStreak: number,
  today: string
): StreakResult {
  // First ever activity
  if (lastActivityDate === null) {
    return { newStreak: 1, streakBroken: false };
  }

  // Already counted today
  if (lastActivityDate === today) {
    return { newStreak: currentStreak, streakBroken: false };
  }

  // Last activity was yesterday — extend streak
  const yesterday = getYesterday(today);
  if (lastActivityDate === yesterday) {
    return { newStreak: currentStreak + 1, streakBroken: false };
  }

  // Gap > 1 day — reset streak (still 1 because we have activity today)
  return { newStreak: 1, streakBroken: true };
}

/**
 * Checks if the current streak hits a milestone.
 * Returns the milestone number (3, 7, 14, or 30) if exact match, otherwise null.
 */
export function checkMilestone(streak: number): number | null {
  const milestones = [3, 7, 14, 30];
  return milestones.includes(streak) ? streak : null;
}

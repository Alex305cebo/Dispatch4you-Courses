/**
 * Pure helper deciding whether to nudge the learner to keep their streak.
 * We remind when there is an active streak that has not yet been extended today.
 */
export function shouldRemindStreak(
  currentStreak: number,
  lastActivityDate: string | null,
  today: string
): boolean {
  return currentStreak > 0 && lastActivityDate !== today;
}

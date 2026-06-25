import type { TaskResult, DayStatus } from '../types/progress';

/**
 * Returns the arithmetic mean of all task scores.
 * Returns 0 if the array is empty.
 */
export function calculateDayMeanScore(taskScores: TaskResult[]): number {
  if (taskScores.length === 0) return 0;
  const sum = taskScores.reduce((acc, t) => acc + t.score, 0);
  return sum / taskScores.length;
}

/**
 * Returns true iff:
 * a) All tasks in the day are completed (taskScores.length === totalTasksInDay)
 * b) The arithmetic mean of all task scores is ≥ 70
 */
export function shouldUnlockNextDay(
  taskScores: TaskResult[],
  totalTasksInDay: number
): boolean {
  if (taskScores.length !== totalTasksInDay) return false;
  return calculateDayMeanScore(taskScores) >= 70;
}

/**
 * Returns true iff ALL 5 day statuses in the week are 'completed'.
 */
export function shouldUnlockMiniExam(weekDayStatuses: DayStatus[]): boolean {
  return weekDayStatuses.length === 5 && weekDayStatuses.every((s) => s === 'completed');
}

/**
 * Returns true iff keys 1, 2, 3, 4 all exist and are true
 * (all 4 mini exams must be passed).
 */
export function shouldUnlockFinalExam(miniExamPassed: Record<number, boolean>): boolean {
  return (
    miniExamPassed[1] === true &&
    miniExamPassed[2] === true &&
    miniExamPassed[3] === true &&
    miniExamPassed[4] === true
  );
}

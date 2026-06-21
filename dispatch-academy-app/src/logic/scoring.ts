/**
 * Scoring logic for Calculator tasks and Document Review tasks.
 *
 * Calculator tolerance: ±2% relative for non-zero answers, exact match for zero.
 * Document review: penalty-based scoring with incorrect taps and missed errors.
 */

/**
 * Validates a calculator task answer against the correct value with ±2% tolerance.
 *
 * - If the correct answer is 0, the input must be exactly 0.
 * - Otherwise, the relative error must be ≤ 2%: |input - correct| / |correct| ≤ 0.02
 *
 * @param input - The student's numeric input
 * @param correct - The correct numeric answer
 * @returns true if the answer is within tolerance
 */
export function validateCalculatorAnswer(input: number, correct: number): boolean {
  if (correct === 0) {
    return input === 0;
  }
  return Math.abs(input - correct) / Math.abs(correct) <= 0.02;
}

/**
 * Calculates the score for a Document Review task.
 *
 * Formula: max(0, 100 - (incorrectTaps × 10) - (missedErrors / totalErrors × 100))
 *
 * - If totalErrors is 0 (no errors to find), returns 100 (perfect score).
 * - Result is always between 0 and 100 inclusive.
 * - Result is rounded to the nearest integer.
 *
 * @param totalErrors - Total number of errors in the document
 * @param incorrectTaps - Number of taps on non-erroneous fields
 * @param missedErrors - Number of errors the student failed to tap
 * @returns Score from 0 to 100 (rounded integer)
 */
export function calculateDocReviewScore(
  totalErrors: number,
  incorrectTaps: number,
  missedErrors: number
): number {
  if (totalErrors === 0) {
    return 100;
  }

  const rawScore = 100 - (incorrectTaps * 10) - (missedErrors / totalErrors * 100);
  const clampedScore = Math.max(0, Math.min(100, rawScore));
  return Math.round(clampedScore);
}

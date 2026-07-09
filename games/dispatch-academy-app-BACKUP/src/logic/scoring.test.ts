import { describe, it, expect } from 'vitest';
import { validateCalculatorAnswer, calculateDocReviewScore } from './scoring';

describe('validateCalculatorAnswer', () => {
  it('returns true when input equals correct answer exactly', () => {
    expect(validateCalculatorAnswer(100, 100)).toBe(true);
  });

  it('returns true when input is within 2% tolerance', () => {
    // 2% of 100 = 2, so 98 to 102 should be valid
    expect(validateCalculatorAnswer(98, 100)).toBe(true);
    expect(validateCalculatorAnswer(102, 100)).toBe(true);
  });

  it('returns false when input exceeds 2% tolerance', () => {
    // 2% of 100 = 2, so 97 should be invalid
    expect(validateCalculatorAnswer(97, 100)).toBe(false);
    expect(validateCalculatorAnswer(103, 100)).toBe(false);
  });

  it('returns true only for exact 0 when correct is 0', () => {
    expect(validateCalculatorAnswer(0, 0)).toBe(true);
    expect(validateCalculatorAnswer(0.001, 0)).toBe(false);
    expect(validateCalculatorAnswer(-0.001, 0)).toBe(false);
  });

  it('works with negative correct answers', () => {
    // 2% of |-50| = 1, so -51 to -49 should be valid
    expect(validateCalculatorAnswer(-50, -50)).toBe(true);
    expect(validateCalculatorAnswer(-49, -50)).toBe(true);
    expect(validateCalculatorAnswer(-51, -50)).toBe(true);
    expect(validateCalculatorAnswer(-47, -50)).toBe(false);
  });

  it('works with decimal values', () => {
    // 2% of 2.50 = 0.05
    expect(validateCalculatorAnswer(2.50, 2.50)).toBe(true);
    expect(validateCalculatorAnswer(2.55, 2.50)).toBe(true);
    expect(validateCalculatorAnswer(2.45, 2.50)).toBe(true);
    expect(validateCalculatorAnswer(2.56, 2.50)).toBe(false);
  });
});

describe('calculateDocReviewScore', () => {
  it('returns 100 when totalErrors is 0', () => {
    expect(calculateDocReviewScore(0, 0, 0)).toBe(100);
    expect(calculateDocReviewScore(0, 5, 0)).toBe(100);
  });

  it('returns 100 when no penalties (all errors found, no incorrect taps)', () => {
    expect(calculateDocReviewScore(3, 0, 0)).toBe(100);
  });

  it('applies 10% penalty per incorrect tap', () => {
    // 100 - (2 * 10) - (0 / 3 * 100) = 80
    expect(calculateDocReviewScore(3, 2, 0)).toBe(80);
  });

  it('applies missed errors penalty', () => {
    // 100 - (0 * 10) - (2 / 4 * 100) = 100 - 50 = 50
    expect(calculateDocReviewScore(4, 0, 2)).toBe(50);
  });

  it('applies both penalties together', () => {
    // 100 - (1 * 10) - (1 / 3 * 100) = 100 - 10 - 33.33 = 56.67 → 57
    expect(calculateDocReviewScore(3, 1, 1)).toBe(57);
  });

  it('never returns below 0', () => {
    // 100 - (20 * 10) - (5 / 5 * 100) = 100 - 200 - 100 = -200 → 0
    expect(calculateDocReviewScore(5, 20, 5)).toBe(0);
  });

  it('never returns above 100', () => {
    expect(calculateDocReviewScore(3, 0, 0)).toBe(100);
  });

  it('rounds to nearest integer', () => {
    // 100 - (0 * 10) - (1 / 3 * 100) = 100 - 33.33... = 66.67 → 67
    expect(calculateDocReviewScore(3, 0, 1)).toBe(67);
  });
});

const fc = require('fast-check');
const { prepareActivityChartData } = require('../pages/users-stats-logic');

// Feature: users-statistics-page, Property 3: Корректность данных графика активности
// **Validates: Requirements 4.1**

const DAY_MS = 864e5;

/**
 * Arbitrary: generates a processed user object with a random lastActivity date.
 * lastActivity is one of: within the period, outside the period, or null.
 */
function userArbitrary(now) {
  return fc.record({
    // offset in days from now: 0..60 days ago
    lastActivityKind: fc.constantFrom('within-period', 'outside', 'null'),
    dayOffset: fc.integer({ min: 0, max: 59 }),
    hourOffset: fc.integer({ min: 0, max: 23 }),
    minuteOffset: fc.integer({ min: 0, max: 59 })
  }).map(({ lastActivityKind, dayOffset, hourOffset, minuteOffset }) => {
    let lastActivity = null;
    if (lastActivityKind !== 'null') {
      const d = new Date(now);
      d.setDate(d.getDate() - dayOffset);
      d.setHours(hourOffset, minuteOffset, 0, 0);
      lastActivity = d;
    }
    return {
      name: 'User',
      email: 'user@test.com',
      xp: 0,
      loginStreak: 0,
      courseProgress: 0,
      moduleProgress: 0,
      caseProgress: 0,
      cardProgress: 0,
      lastActivity
    };
  });
}

describe('Property 3: Корректность данных графика активности', () => {
  it('prepareActivityChartData returns correct labels/data length and non-negative integer counts with sum ≤ users in period', () => {
    const now = new Date('2025-06-15T12:00:00Z');

    fc.assert(
      fc.property(
        fc.array(userArbitrary(now), { minLength: 0, maxLength: 50 }),
        fc.constantFrom(7, 30),
        (users, period) => {
          const result = prepareActivityChartData(users, period, now);

          // labels and data arrays have length equal to the period
          expect(result.labels).toHaveLength(period);
          expect(result.data).toHaveLength(period);

          // All data values are non-negative integers
          for (const val of result.data) {
            expect(Number.isInteger(val)).toBe(true);
            expect(val).toBeGreaterThanOrEqual(0);
          }

          // Each data[i] is the count of users whose lastActivity falls on that specific day
          for (let i = 0; i < period; i++) {
            const d = new Date(now);
            d.setDate(d.getDate() - (period - 1 - i));
            const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
            const dayEnd = dayStart + DAY_MS;
            const expectedCount = users.filter(
              u => u.lastActivity && u.lastActivity.getTime() >= dayStart && u.lastActivity.getTime() < dayEnd
            ).length;
            expect(result.data[i]).toBe(expectedCount);
          }

          // Sum of all data values ≤ total users with lastActivity in the selected period
          const totalInPeriod = users.filter(u => {
            if (!u.lastActivity) return false;
            const periodStart = new Date(now);
            periodStart.setDate(periodStart.getDate() - (period - 1));
            const periodStartMs = new Date(periodStart.getFullYear(), periodStart.getMonth(), periodStart.getDate()).getTime();
            const periodEndMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() + DAY_MS;
            return u.lastActivity.getTime() >= periodStartMs && u.lastActivity.getTime() < periodEndMs;
          }).length;
          const dataSum = result.data.reduce((s, v) => s + v, 0);
          expect(dataSum).toBeLessThanOrEqual(totalInPeriod);
        }
      ),
      { numRuns: 100 }
    );
  });
});

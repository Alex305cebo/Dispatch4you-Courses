const fc = require('fast-check');
const { calcOverviewStats } = require('../pages/users-stats-logic');

// Feature: users-statistics-page, Property 2: Корректность расчёта overview-статистик
// **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

const DAY_MS = 864e5;

/**
 * Arbitrary: generates a processed user object with random fields relevant to overview stats.
 * lastActivity is one of: within 7 days, within 30 days, older than 30 days, or null.
 */
function userArbitrary(now) {
  return fc.record({
    xp: fc.integer({ min: 0, max: 10000 }),
    loginStreak: fc.integer({ min: 0, max: 365 }),
    courseProgress: fc.integer({ min: 0, max: 15 }),
    lastActivityKind: fc.constantFrom('within7d', 'within30d', 'older', 'null')
  }).map(({ xp, loginStreak, courseProgress, lastActivityKind }) => {
    let lastActivity = null;
    if (lastActivityKind === 'within7d') {
      // 0 to just under 7 days ago
      const offset = Math.floor(Math.random() * 7 * DAY_MS);
      lastActivity = new Date(now - offset);
    } else if (lastActivityKind === 'within30d') {
      // 7 days to just under 30 days ago
      const offset = 7 * DAY_MS + Math.floor(Math.random() * 23 * DAY_MS);
      lastActivity = new Date(now - offset);
    } else if (lastActivityKind === 'older') {
      // 30 to 90 days ago
      const offset = 30 * DAY_MS + Math.floor(Math.random() * 60 * DAY_MS);
      lastActivity = new Date(now - offset);
    }
    return { xp, loginStreak, courseProgress, lastActivity };
  });
}

describe('Property 2: Корректность расчёта overview-статистик', () => {
  it('calcOverviewStats returns correct totalUsers, activeUsers7d, activeUsers30d, avgXP, avgCourseProgress, avgStreak', () => {
    // Use a fixed "now" so the test is deterministic with respect to time boundaries
    const now = new Date('2025-06-15T12:00:00Z').getTime();

    fc.assert(
      fc.property(
        fc.array(userArbitrary(now), { minLength: 1, maxLength: 100 }),
        (users) => {
          const result = calcOverviewStats(users, now);

          // 3.1: totalUsers equals array length
          expect(result.totalUsers).toBe(users.length);

          // 3.2: activeUsers7d — users with lastActivity within 7 days
          const expected7d = users.filter(u => u.lastActivity && (now - u.lastActivity.getTime()) < 7 * DAY_MS).length;
          expect(result.activeUsers7d).toBe(expected7d);

          // 3.3: activeUsers30d — users with lastActivity within 30 days
          const expected30d = users.filter(u => u.lastActivity && (now - u.lastActivity.getTime()) < 30 * DAY_MS).length;
          expect(result.activeUsers30d).toBe(expected30d);

          // 3.4: avgXP = Math.round(sum(xp) / count)
          const expectedAvgXP = Math.round(users.reduce((s, u) => s + u.xp, 0) / users.length);
          expect(result.avgXP).toBe(expectedAvgXP);

          // 3.5: avgCourseProgress = Math.round(sum(courseProgress/15*100) / count)
          const expectedAvgProg = Math.round(users.reduce((s, u) => s + (u.courseProgress / 15 * 100), 0) / users.length);
          expect(result.avgCourseProgress).toBe(expectedAvgProg);

          // 3.6: avgStreak = parseFloat((sum(loginStreak) / count).toFixed(1))
          const expectedAvgStreak = parseFloat((users.reduce((s, u) => s + u.loginStreak, 0) / users.length).toFixed(1));
          expect(result.avgStreak).toBe(expectedAvgStreak);
        }
      ),
      { numRuns: 100 }
    );
  });
});

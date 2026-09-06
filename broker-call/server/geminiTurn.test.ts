import { describe, expect, it } from 'vitest'

import { cooldownUntil } from './geminiTurn'

// Бесплатный тариф Gemini даёт два разных 429, и лечатся они по-разному:
// минутный ждёт секунды, суточный — до полуночи по тихоокеанскому времени.
// Раньше оба ждали минуту, и суточно-исчерпанная модель весь день заново
// попадала в перебор: лишний поход в сеть на каждой реплике звонка.
describe('cooldownUntil', () => {
  const now = Date.parse('2026-09-06T12:00:00Z')

  it('суточная квота — до полуночи, а не на минуту', () => {
    const body = JSON.stringify({
      error: {
        details: [{ violations: [{ quotaId: 'GenerateRequestsPerDayPerProjectPerModel-FreeTier' }] }],
      },
    })
    const until = cooldownUntil(body, now)
    expect(until - now).toBeGreaterThan(60 * 60 * 1000)
    expect(until - now).toBeLessThan(36 * 60 * 60 * 1000)
  })

  it('минутная — столько, сколько просит Google, но не меньше 20 секунд', () => {
    expect(cooldownUntil('{"retryDelay":"38s"}', now) - now).toBe(38_000)
    expect(cooldownUntil('{"retryDelay":"0s"}', now) - now).toBe(20_000)
  })

  it('без подсказок — прежняя минута', () => {
    expect(cooldownUntil('503 high demand', now) - now).toBe(60_000)
  })
})

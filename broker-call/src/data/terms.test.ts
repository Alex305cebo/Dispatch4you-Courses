import { describe, expect, it } from 'vitest'
import { normalizeTranscript } from './terms'

/**
 * Отраслевые слова распознавание калечит одинаково у обоих провайдеров.
 * Случаи ниже приехали из живых звонков, а не выдуманы.
 */
describe('починка расшифровки', () => {
  it('возвращает длину трейлера, приехавшую буквой', () => {
    // Живой звонок: студент сказал «53», на экране появилось «C-3».
    expect(normalizeTranscript('Termin, C-3.')).toContain('53')
    expect(normalizeTranscript('see three foot')).toContain('53')
    expect(normalizeTranscript('fifty-three')).toContain('53')
  })

  it('чинит типы трейлеров', () => {
    expect(normalizeTranscript('we run flat bad')).toBe('we run flatbed')
    expect(normalizeTranscript('step tech')).toBe('step deck')
    expect(normalizeTranscript('drop deck')).toBe('step deck')
    expect(normalizeTranscript('dry fan')).toBe('dry van')
    expect(normalizeTranscript('try van')).toBe('dry van')
    expect(normalizeTranscript('reaper')).toBe('reefer')
  })

  it('не трогает «refer», когда это обычный глагол', () => {
    // Иначе «refer to the rate con» превращалось бы в «reefer to the rate con».
    expect(normalizeTranscript('refer to the rate con')).toBe('refer to the rate con')
    expect(normalizeTranscript('we pull a refer')).toBe('we pull a reefer')
  })

  it('оставляет уже правильный текст как есть', () => {
    const clean = 'MC 445566, we run 53-foot dry van, all-in rate please'
    expect(normalizeTranscript(clean)).toBe(clean)
  })
})

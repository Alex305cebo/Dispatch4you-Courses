import { describe, expect, it } from 'vitest'
import { normalizeTranscript, isWhisperPhantom } from './terms'

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

describe('фантомы Whisper', () => {
  it('отбрасывает то, что Whisper выдумывает на тишине и эхе', () => {
    // Живой звонок с сайта 05.09.2026: два «Thank you.» подряд перебили брокера.
    expect(isWhisperPhantom('Thank you.')).toBe(true)
    expect(isWhisperPhantom(' you')).toBe(true)
    expect(isWhisperPhantom('Bye.')).toBe(true)
    expect(isWhisperPhantom('')).toBe(true)
  })

  it('живую речь не трогает, даже короткую', () => {
    expect(isWhisperPhantom('MC 445566')).toBe(false)
    expect(isWhisperPhantom('Dry van.')).toBe(false)
    expect(isWhisperPhantom('Thank you, send the rate con to dispatch at star transport dot com')).toBe(false)
  })
})

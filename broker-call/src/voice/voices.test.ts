import { describe, expect, it } from 'vitest'
import {
  DEFAULT_VOICE,
  ORPHEUS_VOICES,
  directionForStyle,
  isFemaleVoice,
  normalizeVoice,
  voiceForBroker,
} from './voices'
import { BROKERS } from '../data/brokers'

describe('голоса Orpheus', () => {
  it('каждому брокеру достаётся голос из набора Groq', () => {
    // Ровно на этом тренажёр немел на боевом: в коде были имена оригинального
    // Orpheus (zac, tara, leo…), которых у Groq нет, и каждый запрос падал в 400.
    for (const broker of BROKERS) {
      expect(ORPHEUS_VOICES).toContain(voiceForBroker(broker.id))
    }
  })

  it('разным брокерам достаются разные голоса', () => {
    const used = BROKERS.map((b) => voiceForBroker(b.id))
    expect(new Set(used).size).toBe(BROKERS.length)
  })

  it('не содержит имён оригинального Orpheus от Canopy Labs', () => {
    for (const wrong of ['zac', 'tara', 'leo', 'dan', 'jess', 'leah', 'mia', 'zoe']) {
      expect(ORPHEUS_VOICES).not.toContain(wrong)
    }
  })

  it('незнакомый брокер получает голос по умолчанию, а не пустую строку', () => {
    expect(voiceForBroker('нет-такого')).toBe(DEFAULT_VOICE)
  })

  it('неизвестный голос подменяется, а не уходит провайдеру', () => {
    expect(normalizeVoice('zac')).toBe(DEFAULT_VOICE)
    expect(normalizeVoice('')).toBe(DEFAULT_VOICE)
    expect(normalizeVoice(undefined)).toBe(DEFAULT_VOICE)
    expect(normalizeVoice(null)).toBe(DEFAULT_VOICE)
  })

  it('известный голос проходит как есть, регистр не мешает', () => {
    expect(normalizeVoice('daniel')).toBe('daniel')
    expect(normalizeVoice('  Diana ')).toBe('diana')
  })

  it('различает мужские и женские голоса для запасного синтеза', () => {
    expect(isFemaleVoice('diana')).toBe(true)
    expect(isFemaleVoice('hannah')).toBe(true)
    expect(isFemaleVoice('austin')).toBe(false)
    expect(isFemaleVoice('troy')).toBe(false)
    // Неизвестное имя нормализуется в мужской голос по умолчанию.
    expect(isFemaleVoice('zac')).toBe(false)
  })
})

describe('вокальные ремарки', () => {
  it('у каждого стиля брокера есть своя подача', () => {
    const styles = [...new Set(BROKERS.map((b) => b.style))]
    for (const style of styles) {
      expect(directionForStyle(style)).toBeTruthy()
    }
  })

  it('разные характеры звучат по-разному', () => {
    expect(directionForStyle('rushed')).not.toBe(directionForStyle('stressed'))
  })

  it('неизвестный стиль не ломает озвучку', () => {
    expect(directionForStyle('нет-такого')).toBeUndefined()
  })
})

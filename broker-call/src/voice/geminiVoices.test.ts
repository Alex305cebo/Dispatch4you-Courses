import { describe, expect, it } from 'vitest'
import { BROKERS } from '../data/brokers'
import { voiceForBroker, ORPHEUS_VOICES } from './voices'
import {
  GEMINI_VOICES,
  GEMINI_DEFAULT_VOICE,
  geminiVoiceForBroker,
  normalizeGeminiVoice,
  isFemaleGeminiVoice,
  orpheusVoiceIsFemale,
} from './geminiVoices'

/**
 * Имя голоса, которого у провайдера нет, — это не «голос по умолчанию», это
 * 400 на каждый запрос и звонок без звука. Один раз мы это уже прошли на
 * голосах Orpheus. Здесь то же самое проверяется до деплоя.
 */
describe('голоса Gemini', () => {
  it('у каждого брокера голос из набора Gemini', () => {
    for (const broker of BROKERS) {
      expect(GEMINI_VOICES, broker.id).toContain(geminiVoiceForBroker(broker.id))
    }
  })

  it('незнакомый брокер получает голос по умолчанию, а не пустую строку', () => {
    expect(geminiVoiceForBroker('никого-такого-нет')).toBe(GEMINI_DEFAULT_VOICE)
  })

  it('пол голоса не меняется при переходе с Orpheus на Gemini', () => {
    for (const broker of BROKERS) {
      const orpheus = voiceForBroker(broker.id)
      expect(isFemaleGeminiVoice(geminiVoiceForBroker(broker.id)), broker.id).toBe(
        orpheusVoiceIsFemale(orpheus),
      )
    }
  })

  it('каждому голосу Orpheus есть пара в Gemini — новый брокер не свалится в дефолт молча', () => {
    for (const voice of ORPHEUS_VOICES) {
      const broker = BROKERS.find((b) => voiceForBroker(b.id) === voice)
      if (!broker) continue
      expect(geminiVoiceForBroker(broker.id)).not.toBe(undefined)
    }
  })

  it('имена голосов Groq в набор Gemini не попадают', () => {
    for (const voice of ORPHEUS_VOICES) {
      expect(GEMINI_VOICES.map((v) => v.toLowerCase())).not.toContain(voice)
    }
  })

  it('нормализация возвращает каноническое написание', () => {
    expect(normalizeGeminiVoice('charon')).toBe('Charon')
    expect(normalizeGeminiVoice('  KORE ')).toBe('Kore')
  })

  it('неизвестное имя подменяется, а не уходит провайдеру', () => {
    expect(normalizeGeminiVoice('austin')).toBe(GEMINI_DEFAULT_VOICE)
    expect(normalizeGeminiVoice('')).toBe(GEMINI_DEFAULT_VOICE)
    expect(normalizeGeminiVoice(undefined)).toBe(GEMINI_DEFAULT_VOICE)
    expect(normalizeGeminiVoice(null)).toBe(GEMINI_DEFAULT_VOICE)
  })
})

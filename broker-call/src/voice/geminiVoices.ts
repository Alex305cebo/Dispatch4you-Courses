import { FEMALE_VOICES, voiceForBroker } from './voices'

/**
 * Голоса Gemini Live.
 *
 * Отдельный файл, а не ещё одна секция в voices.ts: тот отвечает за Orpheus и
 * сейчас работает. Набор имён у провайдеров не пересекается ни одним голосом,
 * и попытка держать оба списка в одной таблице кончится тем же, чем кончилась
 * прошлая — уехавшим в чужой API именем и звонком без звука.
 *
 * Характер брокера берётся из voices.ts, чтобы Рэй оставался Рэем в обоих
 * транспортах: один источник правды на «кто как звучит», два набора имён.
 */

export const GEMINI_MALE_VOICES = ['Puck', 'Charon', 'Fenrir', 'Orus'] as const
export const GEMINI_FEMALE_VOICES = ['Kore', 'Aoede', 'Leda', 'Zephyr'] as const

export const GEMINI_VOICES: readonly string[] = [...GEMINI_MALE_VOICES, ...GEMINI_FEMALE_VOICES]

export const GEMINI_DEFAULT_VOICE = 'Puck'

/** Orpheus → Gemini. Тембр и пол сохраняются, меняется только чей это API. */
const FROM_ORPHEUS: Record<string, string> = {
  austin: 'Puck', // ровный, дружелюбный
  daniel: 'Charon', // ниже и суше — Рэй с двадцатью годами на деске
  troy: 'Fenrir', // подвижный, вечно на бегу
  diana: 'Kore', // собранная, процедурная
  hannah: 'Leda', // выше и живее — Нина, у которой горит груз
  autumn: 'Aoede',
}

/**
 * Голос Orpheus -> голос Gemini с сохранением пола и тембра. Неизвестное имя
 * раньше молча превращалось в Puck — и Sarah с Diana говорили мужским голосом.
 */
export function geminiVoiceFromOrpheus(voice: string | undefined | null): string {
  const mapped = FROM_ORPHEUS[(voice ?? '').trim().toLowerCase()]
  return normalizeGeminiVoice(mapped ?? voice)
}

export function geminiVoiceForBroker(brokerId: string): string {
  return FROM_ORPHEUS[voiceForBroker(brokerId)] ?? GEMINI_DEFAULT_VOICE
}

/**
 * Неизвестное имя подменяется, а не уходит провайдеру. Сравнение без учёта
 * регистра, но наружу отдаётся каноническое написание: Gemini ждёт `Charon`, а
 * не `charon`.
 */
export function normalizeGeminiVoice(voice: string | undefined | null): string {
  const clean = (voice ?? '').trim().toLowerCase()
  return GEMINI_VOICES.find((v) => v.toLowerCase() === clean) ?? GEMINI_DEFAULT_VOICE
}

export function isFemaleGeminiVoice(voice: string): boolean {
  return (GEMINI_FEMALE_VOICES as readonly string[]).includes(normalizeGeminiVoice(voice))
}

/** Пол голоса сохраняется при переходе между провайдерами. */
export function orpheusVoiceIsFemale(voice: string): boolean {
  return (FEMALE_VOICES as readonly string[]).includes(voice)
}

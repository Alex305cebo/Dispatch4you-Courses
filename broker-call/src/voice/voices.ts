/**
 * Голоса Groq Orpheus (`canopylabs/orpheus-v1-english`).
 *
 * Внимание: это НЕ те же имена, что у оригинального Orpheus от Canopy Labs
 * (tara, leah, jess, leo, dan, mia, zac, zoe). У Groq в хостинге набор свой, и
 * именно на этом тренажёр немел: запрос уходил с голосом `zac`, Groq отвечал
 * 400, озвучка падала, а на экране оставался текст без звука.
 */

export const MALE_VOICES = ['austin', 'daniel', 'troy'] as const
export const FEMALE_VOICES = ['autumn', 'diana', 'hannah'] as const

export const ORPHEUS_VOICES: readonly string[] = [...MALE_VOICES, ...FEMALE_VOICES]

/** Если голоса нет в наборе — берём этот, а не роняем звонок. */
export const DEFAULT_VOICE = 'austin'

/** Тембр под характер брокера. */
const BY_BROKER: Record<string, string> = {
  'mike-apex': 'austin', // ровный, дружелюбный
  'ray-atlas': 'daniel', // жёсткий, двадцать лет на деске
  'dave-lonestar': 'troy', // вечно на бегу
  'sarah-midwest': 'diana', // процедурная, обстоятельная
  'nina-summit': 'hannah', // на нервах из-за груза
}

export function voiceForBroker(brokerId: string): string {
  return BY_BROKER[brokerId] ?? DEFAULT_VOICE
}

/**
 * Приводит голос к поддерживаемому. Одна опечатка не должна снова обесточить
 * звонок, поэтому неизвестное имя подменяется, а не улетает провайдеру.
 */
export function normalizeVoice(voice: string | undefined | null): string {
  const clean = (voice ?? '').trim().toLowerCase()
  return ORPHEUS_VOICES.includes(clean) ? clean : DEFAULT_VOICE
}

export function isFemaleVoice(voice: string): boolean {
  return (FEMALE_VOICES as readonly string[]).includes(normalizeVoice(voice))
}

/**
 * Вокальная ремарка Orpheus под характер брокера. Модель понимает пометки в
 * квадратных скобках и меняет подачу — Дэйв на бегу и Нина, у которой горит
 * груз, звучат по-разному, хотя текст пишет одна и та же модель.
 */
const DIRECTION_BY_STYLE: Record<string, string> = {
  friendly: 'warm',
  bureaucratic: 'measured',
  rushed: 'brisk',
  tough: 'firm',
  stressed: 'tense',
}

export function directionForStyle(style: string): string | undefined {
  return DIRECTION_BY_STYLE[style]
}

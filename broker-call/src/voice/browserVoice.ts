import { isFemaleVoice } from './voices'

/**
 * Запасная озвучка средствами браузера.
 *
 * Вторая ступень после Groq Orpheus. Звучит заметно хуже, но брокер, который
 * молчит, — это сломанный тренажёр, а брокер синтетическим голосом — просто
 * тренажёр похуже. Приоритетный список голосов перенесён из старой страницы
 * pages/ai-broker-chat.html: он собран по живым браузерам, а не из документации.
 */

const MALE_PRIORITY = [
  'Google UK English Male',
  'Microsoft George Online (Natural)',
  'Microsoft George',
  'Microsoft Ryan Online (Natural)',
  'Microsoft Ryan',
  'Microsoft Andrew Online (Natural)',
  'Microsoft Guy Online (Natural)',
  'Google US English',
]

const FEMALE_PRIORITY = [
  'Google UK English Female',
  'Microsoft Sonia Online (Natural)',
  'Microsoft Libby Online (Natural)',
  'Microsoft Aria Online (Natural)',
  'Microsoft Jenny Online (Natural)',
  'Google US English',
]

// Отсев по имени: если брокер мужчина, женский голос ломает впечатление
// сильнее, чем плохое качество синтеза.
const FEMALE_NAMES =
  /female|zira|samantha|karen|moira|fiona|tessa|victoria|susan|hazel|jenny|aria|sara|shelley|sandy|allison|ava|sonia|libby|mia|michelle|nancy/i

let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null

/**
 * Список голосов часть браузеров заполняет асинхронно: первый getVoices()
 * возвращает пустой массив, и без ожидания мы молча свалимся на голос по
 * умолчанию, хотя через мгновение доступен нормальный.
 */
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (voicesReady) return voicesReady
  const synth = window.speechSynthesis
  if (!synth) return Promise.resolve([])

  voicesReady = new Promise((resolve) => {
    const existing = synth.getVoices()
    if (existing.length) {
      resolve(existing)
      return
    }
    const onChange = () => {
      const list = synth.getVoices()
      if (list.length) {
        synth.removeEventListener('voiceschanged', onChange)
        resolve(list)
      }
    }
    synth.addEventListener('voiceschanged', onChange)
    // voiceschanged приходит не во всех браузерах — вечно не ждём.
    window.setTimeout(() => {
      synth.removeEventListener('voiceschanged', onChange)
      resolve(synth.getVoices())
    }, 1000)
  })
  return voicesReady
}

function pickVoice(list: SpeechSynthesisVoice[], female: boolean): SpeechSynthesisVoice | null {
  const priority = female ? FEMALE_PRIORITY : MALE_PRIORITY
  for (const name of priority) {
    const match = list.find(
      (v) =>
        v.name.toLowerCase().includes(name.toLowerCase()) &&
        (female || !FEMALE_NAMES.test(v.name)),
    )
    if (match) return match
  }
  const byLang = list.find(
    (v) => v.lang.startsWith('en') && (female || !FEMALE_NAMES.test(v.name)),
  )
  return byLang ?? list.find((v) => v.lang.startsWith('en')) ?? null
}

export interface BrowserSpeech {
  /** Реальная длительность неизвестна заранее — отдаём оценку для раскрытия слов. */
  estimatedMs: number
  done: Promise<void>
  cancel(): void
}

/** Возвращает null, если синтез недоступен — тогда остаётся только текст. */
export function speakInBrowser(text: string, orpheusVoice: string): BrowserSpeech | null {
  const synth = window.speechSynthesis
  if (!synth) return null

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 1.05
  utterance.volume = 1

  let settle: () => void = () => undefined
  const done = new Promise<void>((resolve) => {
    settle = resolve
  })

  void loadVoices().then((list) => {
    const voice = pickVoice(list, isFemaleVoice(orpheusVoice))
    if (voice) utterance.voice = voice
    utterance.onend = () => settle()
    utterance.onerror = () => settle()
    synth.cancel()
    synth.speak(utterance)
  })

  return {
    estimatedMs: estimateDurationMs(text),
    done,
    cancel: () => {
      synth.cancel()
      settle()
    },
  }
}

/** Примерно 165 слов в минуту — темп делового телефонного разговора. */
export function estimateDurationMs(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(900, (words / 165) * 60000)
}

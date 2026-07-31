/**
 * Разблокировка звука жестом.
 *
 * iOS отдаёт звук только тому, что стартовало внутри обработчика касания.
 * Всё, что случается после первого `await`, система считает самодеятельностью
 * страницы и глушит — молча, без ошибки. Поэтому и аудиоконтекст, и синтез
 * речи поднимаются здесь, синхронно в момент нажатия «Ответить», а не позже,
 * когда до них дойдёт очередь.
 *
 * Контекст один на страницу: несколько контекстов пришлось бы разблокировать
 * по отдельности, и второй уже остался бы немым.
 */

let shared: AudioContext | null = null
let speechPrimed = false

/** Вызывать СИНХРОННО из обработчика касания, до любых await. */
export function unlockAudio(): void {
  try {
    const ctx = getSharedAudioContext()
    void ctx.resume()
  } catch {
    // Контекст не создался — звонок пойдёт молча, но не упадёт.
  }

  // Первое произнесение обязано случиться в жесте, иначе iOS не выдаст голос
  // до конца жизни страницы. Пустая фраза на нулевой громкости этого и добивается.
  try {
    const synth = window.speechSynthesis
    if (synth && !speechPrimed) {
      const silent = new SpeechSynthesisUtterance(' ')
      silent.volume = 0
      synth.speak(silent)
      speechPrimed = true
    }
  } catch {
    // Синтеза нет — останется текст на экране.
  }
}

export function getSharedAudioContext(): AudioContext {
  if (!shared) {
    // iOS считает Web Audio фоновым звуком и глушит переключателем «без
    // звука»; playback переводит его в категорию воспроизведения медиа.
    const session = (navigator as NavigatorWithAudioSession).audioSession
    if (session) {
      try {
        session.type = 'playback'
      } catch {
        // Свойство нестандартное и не везде доступно на запись.
      }
    }
    shared = new AudioContext()
  }
  return shared
}

/** Живой ли синтез речи — по нему решаем, показывать ли предупреждение. */
export function hasSpeechSynthesis(): boolean {
  return typeof window !== 'undefined' && Boolean(window.speechSynthesis)
}

interface NavigatorWithAudioSession extends Navigator {
  audioSession?: { type: string }
}

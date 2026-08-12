/**
 * PCM16 ↔ Float32 и base64.
 *
 * Gemini Live гоняет по вебсокету сырой звук: от нас 16 кГц PCM16 моно, к нам
 * 24 кГц PCM16 моно, всё в base64. Ошибка тут не даёт ни исключения, ни кода
 * ответа — она даёт шум в трубке или тишину, и искать её потом приходится
 * ушами. Поэтому преобразования вынесены сюда и покрыты тестами.
 *
 * Порядок байтов — little-endian: так его пишут и Web Audio, и Gemini.
 */

/** Float32 −1…1 → base64 от PCM16. Значения за пределами обрезаются, а не заворачиваются. */
export function floatToPcm16Base64(samples: Float32Array): string {
  const buffer = new ArrayBuffer(samples.length * 2)
  const view = new DataView(buffer)
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i] ?? 0))
    // Асимметрия не случайна: у 16 бит диапазон −32768…32767, и умножать
    // отрицательные на 32767 значит терять полную громкость на пиках.
    view.setInt16(i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true)
  }
  return bytesToBase64(new Uint8Array(buffer))
}

/** base64 от PCM16 → Float32 −1…1. */
export function base64ToPcm16Float(base64: string): Float32Array {
  const bytes = base64ToBytes(base64)
  // Нечётная длина означает обрезанный на границе кадр — берём целые отсчёты
  // и молчим: рвать звонок из-за одного байта незачем.
  const count = Math.floor(bytes.length / 2)
  const view = new DataView(bytes.buffer, bytes.byteOffset, count * 2)
  const out = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const value = view.getInt16(i * 2, true)
    out[i] = value < 0 ? value / 0x8000 : value / 0x7fff
  }
  return out
}

export function bytesToBase64(bytes: Uint8Array): string {
  // По кускам: String.fromCharCode(...длинный массив) переполняет стек
  // аргументов на секунде звука и падает «RangeError: too many arguments».
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

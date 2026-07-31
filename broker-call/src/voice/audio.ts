/** Whisper ждёт 16 кГц моно — на этой частоте он и обучался. */
export const TARGET_SAMPLE_RATE = 16000

/**
 * Линейная передискретизация. Для речи её достаточно: Whisper устойчив к
 * артефактам куда сильнее, чем к неправильной частоте дискретизации.
 */
export function resample(input: Float32Array, from: number, to: number): Float32Array {
  if (from === to) return input
  const ratio = from / to
  const length = Math.round(input.length / ratio)
  const out = new Float32Array(length)
  for (let i = 0; i < length; i++) {
    const pos = i * ratio
    const left = Math.floor(pos)
    const right = Math.min(left + 1, input.length - 1)
    const frac = pos - left
    out[i] = (input[left] ?? 0) * (1 - frac) + (input[right] ?? 0) * frac
  }
  return out
}

/** WAV 16-bit PCM. Groq принимает его без вопросов, в отличие от webm/opus. */
export function encodeWav(samples: Float32Array, sampleRate = TARGET_SAMPLE_RATE): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)

  writeAscii(view, 0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeAscii(view, 8, 'WAVE')
  writeAscii(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // размер fmt-блока
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // моно
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true) // байт в секунду
  view.setUint16(32, 2, true) // выравнивание блока
  view.setUint16(34, 16, true) // бит на отсчёт
  writeAscii(view, 36, 'data')
  view.setUint32(40, samples.length * 2, true)

  let offset = 44
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i] ?? 0))
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true)
    offset += 2
  }

  return new Blob([buffer], { type: 'audio/wav' })
}

function writeAscii(view: DataView, offset: number, text: string): void {
  for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i))
}

export function rms(frame: Float32Array): number {
  let sum = 0
  for (let i = 0; i < frame.length; i++) {
    const v = frame[i] ?? 0
    sum += v * v
  }
  return Math.sqrt(sum / frame.length)
}

/** Длительность речи в секундах — нужна, чтобы отбрасывать случайные щелчки. */
export function durationSeconds(samples: Float32Array, sampleRate = TARGET_SAMPLE_RATE): number {
  return samples.length / sampleRate
}

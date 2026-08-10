import { describe, expect, it } from 'vitest'
import { floatToPcm16Base64, base64ToPcm16Float, bytesToBase64, base64ToBytes } from './pcm'

/**
 * Ошибка в преобразовании звука не даёт ни исключения, ни кода ответа — она
 * даёт шум в трубке. Найти её потом можно только ушами, и то не сразу: «плохо
 * слышно» звучит как проблема связи, а не как перепутанный порядок байтов.
 */
describe('PCM16 и base64', () => {
  it('туда и обратно — форма сигнала сохраняется', () => {
    const original = new Float32Array(1000)
    for (let i = 0; i < original.length; i++) {
      original[i] = Math.sin((i / 1000) * Math.PI * 8) * 0.7
    }
    const restored = base64ToPcm16Float(floatToPcm16Base64(original))

    expect(restored.length).toBe(original.length)
    for (let i = 0; i < original.length; i++) {
      // Шаг квантования 16 бит — примерно 3e-5; допуск с запасом.
      expect(Math.abs((restored[i] ?? 0) - (original[i] ?? 0))).toBeLessThan(1e-4)
    }
  })

  it('громкость за пределами обрезается, а не заворачивается в противофазу', () => {
    const restored = base64ToPcm16Float(floatToPcm16Base64(new Float32Array([2, -2, 1, -1])))
    expect(restored[0]).toBeCloseTo(1, 3)
    expect(restored[1]).toBeCloseTo(-1, 3)
    expect(restored[2]).toBeCloseTo(1, 3)
    expect(restored[3]).toBeCloseTo(-1, 3)
  })

  it('тишина остаётся тишиной', () => {
    const restored = base64ToPcm16Float(floatToPcm16Base64(new Float32Array(64)))
    expect(restored.length).toBe(64)
    expect(Array.from(restored).every((v) => v === 0)).toBe(true)
  })

  it('пустой вход не роняет и не выдумывает отсчёты', () => {
    expect(floatToPcm16Base64(new Float32Array(0))).toBe('')
    expect(base64ToPcm16Float('').length).toBe(0)
  })

  it('порядок байтов little-endian — как у Web Audio и у Gemini', () => {
    // 0x0100 little-endian = 256 → 256/32767 ≈ 0.0078
    const restored = base64ToPcm16Float(bytesToBase64(new Uint8Array([0x00, 0x01])))
    expect(restored[0]).toBeCloseTo(256 / 0x7fff, 5)
  })

  it('нечётная длина не роняет звонок — берём целые отсчёты', () => {
    const restored = base64ToPcm16Float(bytesToBase64(new Uint8Array([0x00, 0x01, 0x7f])))
    expect(restored.length).toBe(1)
  })

  it('секунда звука кодируется без переполнения стека аргументов', () => {
    // 24 000 отсчётов — 48 КБ. Наивный fromCharCode(...массив) здесь падает.
    const second = new Float32Array(24000)
    for (let i = 0; i < second.length; i++) second[i] = (i % 100) / 200
    expect(() => floatToPcm16Base64(second)).not.toThrow()
    expect(base64ToPcm16Float(floatToPcm16Base64(second)).length).toBe(24000)
  })

  it('байты переживают base64 без потерь', () => {
    const bytes = new Uint8Array(513)
    for (let i = 0; i < bytes.length; i++) bytes[i] = i % 256
    expect(Array.from(base64ToBytes(bytesToBase64(bytes)))).toEqual(Array.from(bytes))
  })
})

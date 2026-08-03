import { describe, expect, it, vi } from 'vitest'
import { Backchannel } from './backchannel'

// jsdom не умеет Web Audio, а проверять нужно не звук, а поведение: когда
// отклик звучит, когда молчит и не повторяется ли он подряд. Заглушки ровно
// на те методы, которыми пользуется класс.
function fakeContext() {
  const started: unknown[] = []
  const ctx = {
    createBufferSource: () => ({
      buffer: null as unknown,
      connect: () => undefined,
      start: () => started.push(1),
    }),
    decodeAudioData: async () => ({ duration: 0.5 }) as unknown as AudioBuffer,
  }
  return { ctx: ctx as unknown as AudioContext, started }
}

const destination = {} as AudioNode

/** Наполняет отклики, минуя сеть. */
function withClips(bc: Backchannel, count = 3) {
  const clips = Array.from({ length: count }, () => ({ duration: 0.5 }) as AudioBuffer)
  Object.assign(bc, { acks: clips, fillers: clips, ready: true })
}

describe('короткие отклики брокера', () => {
  it('молчит, пока отклики не готовы — звонок не ждёт синтеза', () => {
    const { ctx } = fakeContext()
    const bc = new Backchannel(ctx, 'austin', 'friendly')
    expect(bc.ack(destination)).toBe(0)
  })

  it('отзывается на первую же реплику', () => {
    const { ctx, started } = fakeContext()
    const bc = new Backchannel(ctx, 'austin', 'friendly')
    withClips(bc)
    expect(bc.ack(destination)).toBeGreaterThan(0)
    expect(started.length).toBe(1)
  })

  it('не отзывается два раза подряд — иначе это тик робота', () => {
    const { ctx } = fakeContext()
    const bc = new Backchannel(ctx, 'austin', 'friendly')
    withClips(bc)
    expect(bc.ack(destination)).toBeGreaterThan(0)
    expect(bc.ack(destination)).toBe(0)
    expect(bc.ack(destination)).toBeGreaterThan(0)
  })

  it('перебирает реплики по кругу, а не твердит одну', () => {
    const { ctx } = fakeContext()
    const bc = new Backchannel(ctx, 'austin', 'friendly')
    const clips = [
      { duration: 0.4 },
      { duration: 0.6 },
      { duration: 0.8 },
    ] as unknown as AudioBuffer[]
    Object.assign(bc, { acks: clips, ready: true })

    const spoken: number[] = []
    for (let i = 0; i < 6; i++) {
      const ms = bc.ack(destination)
      if (ms > 0) spoken.push(ms)
    }
    // Три прозвучавших отклика должны быть разными по длительности,
    // то есть разными репликами.
    expect(new Set(spoken).size).toBe(3)
  })

  it('реплика перед обращением к системе звучит без пропусков', () => {
    // В отличие от «угу», её пропускать нельзя: иначе брокер молча уходит
    // в себя, и это читается как зависание.
    const { ctx } = fakeContext()
    const bc = new Backchannel(ctx, 'austin', 'rushed')
    withClips(bc)
    expect(bc.filler(destination)).toBeGreaterThan(0)
    expect(bc.filler(destination)).toBeGreaterThan(0)
  })

  it('неизвестный характер не оставляет брокера без откликов', async () => {
    const { ctx } = fakeContext()
    const bc = new Backchannel(ctx, 'austin', 'нет-такого' as never)
    // Синтез замокан: проверяем, что подбор реплик не падает на чужом стиле.
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) }),
    )
    await expect(bc.prepare()).resolves.toBeUndefined()
    expect(bc.ack(destination)).toBeGreaterThan(0)
    vi.unstubAllGlobals()
  })
})

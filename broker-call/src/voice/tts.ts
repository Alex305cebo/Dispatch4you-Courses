import { endpoint } from '../api'

/**
 * Синтез речи брокера. Вынесен из PipelineTransport, потому что им пользуется
 * ещё и предсинтез коротких откликов (backchannel.ts) — тот работает во время
 * гудков, когда до первой реплики брокера ещё далеко.
 */
export async function synthesize(text: string, voice: string): Promise<ArrayBuffer> {
  const r = await fetch(endpoint('tts'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Только чистый текст. Раньше спереди приклеивалась вокальная ремарка
    // Orpheus вида «[warm] …» — Gemini TTS такие пометки не понимает и
    // ЧИТАЛ их: шёпоты и скрипы в начале каждой реплики были ровно этим.
    body: JSON.stringify({ text, voice }),
  })
  if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 160)}`)
  return r.arrayBuffer()
}

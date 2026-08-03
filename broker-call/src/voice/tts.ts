import { endpoint } from '../api'

/**
 * Синтез речи брокера. Вынесен из PipelineTransport, потому что им пользуется
 * ещё и предсинтез коротких откликов (backchannel.ts) — тот работает во время
 * гудков, когда до первой реплики брокера ещё далеко.
 */
export async function synthesize(
  text: string,
  voice: string,
  direction?: string,
): Promise<ArrayBuffer> {
  const r = await fetch(endpoint('tts'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Вокальная ремарка уходит провайдеру, но на экран не попадает.
    body: JSON.stringify({ text: direction ? `[${direction}] ${text}` : text, voice }),
  })
  if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 160)}`)
  return r.arrayBuffer()
}

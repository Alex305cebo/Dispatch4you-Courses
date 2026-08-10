/**
 * Протокол Gemini Live: разбор входящих сообщений и сборка исходящих.
 *
 * Вынесено из транспорта отдельно и намеренно без единого обращения к
 * браузеру — это чистые функции над строками. Причина простая: ошибки формата
 * не дают ни исключения, ни кода ответа. Разговор просто не начинается, и
 * различить «модель молчит», «мы шлём не то» и «мы не понимаем ответ» по виду
 * экрана невозможно. Ровно так у нас однажды молчал брокер из-за пустого
 * properties в схеме инструмента.
 *
 * Здесь это проверяется тестами до деплоя.
 */

export type GeminiServerEvent =
  | { kind: 'setup_complete' }
  /** Кусок голоса брокера: base64 от PCM16 и частота из mimeType. */
  | { kind: 'audio'; base64: string; sampleRate: number }
  /** Расшифровка речи студента — то, что появляется на экране. */
  | { kind: 'input_transcript'; text: string }
  /** Расшифровка речи брокера. */
  | { kind: 'output_transcript'; text: string }
  /** Студент заговорил поверх — всё, что не проиграно, надо выбросить. */
  | { kind: 'interrupted' }
  | { kind: 'turn_complete' }
  | { kind: 'tool_call'; calls: { id: string; name: string; args: unknown }[] }
  /** Инструменты отменены: отвечать на них уже не нужно. */
  | { kind: 'tool_cancel'; ids: string[] }
  /** Сессию скоро закроют на стороне провайдера. */
  | { kind: 'go_away'; leftMs: number }
  | { kind: 'error'; message: string }

/** Частота по умолчанию, если провайдер не указал её в mimeType. */
export const GEMINI_OUTPUT_RATE = 24000
/** Что провайдер ждёт от нас. */
export const GEMINI_INPUT_RATE = 16000

/**
 * Одно сообщение вебсокета может нести сразу несколько событий (кусок звука
 * и расшифровку в одном serverContent), поэтому наружу отдаётся список.
 * Непонятное сообщение даёт пустой список — это не ошибка, протокол растёт.
 */
export function parseServerMessage(raw: string): GeminiServerEvent[] {
  let message: Record<string, unknown>
  try {
    message = JSON.parse(raw) as Record<string, unknown>
  } catch {
    return []
  }
  if (!message || typeof message !== 'object') return []

  const events: GeminiServerEvent[] = []

  if (message.setupComplete !== undefined) events.push({ kind: 'setup_complete' })

  const content = asObject(message.serverContent)
  if (content) {
    const modelTurn = asObject(content.modelTurn)
    const parts = Array.isArray(modelTurn?.parts) ? modelTurn.parts : []
    for (const part of parts) {
      const inline = asObject(asObject(part)?.inlineData)
      const data = inline?.data
      if (typeof data === 'string' && data.length > 0) {
        events.push({ kind: 'audio', base64: data, sampleRate: rateFromMime(inline?.mimeType) })
      }
    }

    const input = asObject(content.inputTranscription)
    if (typeof input?.text === 'string' && input.text.length > 0) {
      events.push({ kind: 'input_transcript', text: input.text })
    }
    const output = asObject(content.outputTranscription)
    if (typeof output?.text === 'string' && output.text.length > 0) {
      events.push({ kind: 'output_transcript', text: output.text })
    }

    if (content.interrupted === true) events.push({ kind: 'interrupted' })
    if (content.turnComplete === true) events.push({ kind: 'turn_complete' })
  }

  const toolCall = asObject(message.toolCall)
  if (toolCall) {
    const incoming = Array.isArray(toolCall.functionCalls) ? toolCall.functionCalls : []
    const calls: { id: string; name: string; args: unknown }[] = []
    incoming.forEach((item, index) => {
      const call = asObject(item)
      const name = typeof call?.name === 'string' ? call.name : ''
      if (!name) return
      calls.push({
        // Свой id провайдер присылает не всегда, а ответ обязан лечь на
        // конкретный вызов — иначе модель ждёт его вечно.
        id: typeof call?.id === 'string' && call.id ? call.id : `${name}-${index}`,
        name,
        args: call?.args ?? {},
      })
    })
    if (calls.length > 0) events.push({ kind: 'tool_call', calls })
  }

  const cancellation = asObject(message.toolCallCancellation)
  if (cancellation) {
    const ids = Array.isArray(cancellation.ids) ? cancellation.ids.map(String) : []
    events.push({ kind: 'tool_cancel', ids })
  }

  const goAway = asObject(message.goAway)
  if (goAway) {
    events.push({ kind: 'go_away', leftMs: durationMs(goAway.timeLeft) })
  }

  const error = asObject(message.error)
  if (error) {
    const text = typeof error.message === 'string' ? error.message : 'gemini error'
    events.push({ kind: 'error', message: text })
  }

  return events
}

/**
 * Первое сообщение. Настройки заперты токеном на сервере, поэтому здесь
 * пусто: всё, что клиент мог бы прислать, всё равно было бы проигнорировано,
 * а прислать лишнее — способ получить отказ на ровном месте.
 */
export function setupMessage(): string {
  return JSON.stringify({ setup: {} })
}

/** Кусок микрофона. Уходит непрерывно, паузы режет провайдер. */
export function audioChunkMessage(base64: string, sampleRate = GEMINI_INPUT_RATE): string {
  return JSON.stringify({
    realtimeInput: { audio: { mimeType: `audio/pcm;rate=${sampleRate}`, data: base64 } },
  })
}

/** Текстовая реплика от лица студента. Ей же брокера просят снять трубку. */
export function textTurnMessage(text: string): string {
  return JSON.stringify({
    clientContent: { turns: [{ role: 'user', parts: [{ text }] }], turnComplete: true },
  })
}

/** Результаты инструментов. Без них модель ждёт и молчит. */
export function toolResponseMessage(
  responses: { id: string; name: string; result: unknown }[],
): string {
  return JSON.stringify({
    toolResponse: {
      functionResponses: responses.map((r) => ({
        id: r.id,
        name: r.name,
        // Провайдер ждёт объект. Число или строка в этом месте — отказ.
        response: isPlainObject(r.result) ? r.result : { result: r.result },
      })),
    },
  })
}

// ── Мелочи ──────────────────────────────────────────────────────────────────

function asObject(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** «audio/pcm;rate=24000» → 24000. Нет частоты — берём заявленную в документации. */
function rateFromMime(mime: unknown): number {
  if (typeof mime !== 'string') return GEMINI_OUTPUT_RATE
  const match = mime.match(/rate=(\d+)/)
  const rate = match ? Number(match[1]) : NaN
  return Number.isFinite(rate) && rate > 0 ? rate : GEMINI_OUTPUT_RATE
}

/** Длительность у Google приходит строкой вида «10s» или «1.5s». */
function durationMs(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return 0
  const match = value.match(/^([\d.]+)s$/)
  return match ? Math.round(Number(match[1]) * 1000) : 0
}

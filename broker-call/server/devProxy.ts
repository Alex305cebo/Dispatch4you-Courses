import type { Connect, Plugin, ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { buildSystemPrompt } from '../src/call/prompt'
import { TOOL_SCHEMAS } from '../src/call/toolSchemas'
import { buildDebriefPrompt } from '../src/call/debriefPrompt'
import { normalizeVoice } from '../src/voice/voices'

/**
 * Дев-сервер, который держит ключи у себя.
 *
 * Браузер ходит только сюда; ключи Groq/Cerebras/OpenAI читаются из .env.local
 * и подставляются здесь. В бандл фронта не попадает ни ключ, ни системный
 * промпт, ни схемы инструментов — они импортируются только этим файлом.
 *
 * Контракт эндпоинтов намеренно простой, чтобы при переезде на сайт его
 * один в один повторил PHP, а фронт не поменялся ни строкой.
 */
export function brokerApi(env: Record<string, string>): Plugin {
  const groqKey = env.GROQ_API_KEY ?? ''
  const cerebrasKey = env.CEREBRAS_API_KEY ?? ''
  const openaiKey = env.OPENAI_API_KEY ?? ''
  const transport = env.BROKER_CALL_TRANSPORT === 'realtime' ? 'realtime' : 'pipeline'

  // Списки, а не одиночные имена: провайдеры снимают модели с бесплатного
  // тарифа без предупреждения. Groq объявил llama-3.3-70b-versatile устаревшей
  // 17.06.2026 — с одним именем в коде это положило бы весь звонок.
  const CEREBRAS_MODELS = split(env.CEREBRAS_MODELS) ?? ['llama-3.3-70b']
  const GROQ_MODELS = split(env.GROQ_MODELS) ?? [
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'llama-3.3-70b-versatile',
  ]
  const TTS_MODEL = env.GROQ_TTS_MODEL ?? 'canopylabs/orpheus-v1-english'

  return {
    name: 'broker-call-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/config', json(async () => ({
        transport,
        ready: {
          llm: Boolean(cerebrasKey || groqKey),
          stt: Boolean(groqKey),
          tts: Boolean(groqKey),
          realtime: Boolean(openaiKey),
        },
      })))

      // ── Ход разговора ─────────────────────────────────────────────────────
      // Клиент шлёт только историю: системный промпт и инструменты
      // приклеиваются здесь, поэтому подменить характер брокера или потолок
      // ставки со стороны браузера нельзя.
      server.middlewares.use('/api/turn', json(async (req) => {
        const body = await readJson<TurnRequest>(req)
        const messages = [
          { role: 'system', content: buildSystemPrompt(body.scenarioId) },
          ...body.messages,
        ]
        const payload = {
          messages,
          tools: TOOL_SCHEMAS,
          tool_choice: 'auto',
          temperature: 0.85,
          max_tokens: 220,
        }

        // Cerebras первым: щедрый бесплатный лимит. Имя модели у провайдеров
        // РАЗНОЕ — старый код слал груповское имя в Cerebras и молча падал на
        // фолбэк при каждом вызове.
        const attempts: Attempt[] = []
        if (cerebrasKey) {
          for (const model of CEREBRAS_MODELS) {
            attempts.push({
              name: 'cerebras',
              url: 'https://api.cerebras.ai/v1/chat/completions',
              key: cerebrasKey,
              model,
            })
          }
        }
        if (groqKey) {
          for (const model of GROQ_MODELS) {
            attempts.push({
              name: 'groq',
              url: 'https://api.groq.com/openai/v1/chat/completions',
              key: groqKey,
              model,
            })
          }
        }
        if (attempts.length === 0) throw new HttpError(503, 'no LLM key configured')

        let lastError = ''
        for (const attempt of attempts) {
          try {
            const r = await fetch(attempt.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${attempt.key}`,
              },
              body: JSON.stringify(shapePayload(payload, attempt.model)),
            })
            if (!r.ok) {
              lastError = `${attempt.name}/${attempt.model} ${r.status}: ${(await r.text()).slice(0, 300)}`
              continue
            }
            const data = (await r.json()) as ChatCompletion
            const choice = data.choices?.[0]?.message
            return {
              provider: attempt.name,
              model: attempt.model,
              // Сырое сообщение уходит обратно клиенту, чтобы он дописал его в
              // историю ровно в том виде, в каком его ждёт провайдер на
              // следующем ходу — вместе с tool_calls и их id.
              message: choice ?? { role: 'assistant', content: '' },
              content: choice?.content ?? '',
              toolCalls: (choice?.tool_calls ?? []).map((c) => ({
                id: c.id,
                name: c.function.name,
                arguments: safeParse(c.function.arguments),
              })),
            }
          } catch (e) {
            lastError = `${attempt.name}: ${(e as Error).message}`
          }
        }
        throw new HttpError(502, lastError || 'all providers failed')
      }))

      // ── Распознавание речи ────────────────────────────────────────────────
      server.middlewares.use('/api/stt', raw(async (req, res) => {
        if (!groqKey) throw new HttpError(503, 'GROQ_API_KEY is not set')
        const body = await readBuffer(req)
        const r = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groqKey}`,
            'Content-Type': req.headers['content-type'] ?? 'multipart/form-data',
          },
          body,
        })
        const text = await r.text()
        res.statusCode = r.status
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.end(text)
      }))

      // ── Озвучка ───────────────────────────────────────────────────────────
      // Orpheus, а не playai-tts: Groq объявил playai устаревшим 23.12.2025.
      server.middlewares.use('/api/tts', raw(async (req, res) => {
        if (!groqKey) throw new HttpError(503, 'GROQ_API_KEY is not set')
        const body = await readJson<{ text: string; voice?: string }>(req)
        const r = await fetch('https://api.groq.com/openai/v1/audio/speech', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: TTS_MODEL,
            // Белый список: неизвестное имя подменяется, а не улетает в Groq.
            // Ровно на этом тренажёр немел — голос `zac` из оригинального
            // Orpheus у Groq не существует, и каждый запрос падал в 400.
            voice: normalizeVoice(body.voice),
            input: body.text,
            response_format: 'wav',
          }),
        })
        if (!r.ok) {
          throw new HttpError(r.status, (await r.text()).slice(0, 300))
        }
        res.statusCode = 200
        res.setHeader('Content-Type', 'audio/wav')
        res.end(Buffer.from(await r.arrayBuffer()))
      }))

      // ── Разбор звонка ─────────────────────────────────────────────────────
      server.middlewares.use('/api/debrief', json(async (req) => {
        const body = await readJson<DebriefRequest>(req)
        const key = cerebrasKey || groqKey
        if (!key) throw new HttpError(503, 'no LLM key configured')
        const useCerebras = Boolean(cerebrasKey)

        const r = await fetch(
          useCerebras
            ? 'https://api.cerebras.ai/v1/chat/completions'
            : 'https://api.groq.com/openai/v1/chat/completions',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
            body: JSON.stringify({
              ...shapePayload({}, (useCerebras ? CEREBRAS_MODELS[0] : GROQ_MODELS[0]) ?? 'openai/gpt-oss-120b'),
              messages: buildDebriefPrompt(body),
              temperature: 0.3,
              max_tokens: 700,
              response_format: { type: 'json_object' },
            }),
          },
        )
        if (!r.ok) throw new HttpError(502, (await r.text()).slice(0, 300))
        const data = (await r.json()) as ChatCompletion
        return safeParse(data.choices?.[0]?.message?.content ?? '{}')
      }))

      // ── Эфемерный ключ Realtime (этап 5) ──────────────────────────────────
      server.middlewares.use('/api/realtime-session', json(async (req) => {
        if (!openaiKey) throw new HttpError(503, 'OPENAI_API_KEY is not set')
        const body = await readJson<{ scenarioId: string; voice?: string }>(req)
        const r = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
          body: JSON.stringify({
            session: {
              type: 'realtime',
              model: env.OPENAI_REALTIME_MODEL ?? 'gpt-realtime-mini',
              instructions: buildSystemPrompt(body.scenarioId),
              audio: {
                input: { turn_detection: { type: 'semantic_vad', interrupt_response: true } },
                output: { voice: body.voice ?? 'ash' },
              },
              tools: TOOL_SCHEMAS.map((t) => ({
                type: 'function',
                name: t.function.name,
                description: t.function.description,
                parameters: t.function.parameters,
              })),
            },
          }),
        })
        if (!r.ok) throw new HttpError(r.status, (await r.text()).slice(0, 300))
        return await r.json()
      }))
    },
  }
}

// ── Мелочи вокруг http ──────────────────────────────────────────────────────

interface Attempt {
  name: string
  url: string
  key: string
  model: string
}

/**
 * Подгоняет тело под конкретную модель.
 *
 * gpt-oss — рассуждающие модели, они НЕ принимают max_tokens и отвечают
 * ошибкой на весь запрос. Ровно на этом звонок падал с «LLM 502».
 * reasoning_effort=low заодно держит задержку низкой: брокеру в трубке надо
 * отвечать, а не рассуждать.
 */
function shapePayload(payload: Record<string, unknown>, model: string): Record<string, unknown> {
  const shaped: Record<string, unknown> = { ...payload, model }
  if (model.includes('gpt-oss')) {
    if ('max_tokens' in shaped) {
      shaped.max_completion_tokens = shaped.max_tokens
      delete shaped.max_tokens
    }
    shaped.reasoning_effort = 'low'
  }
  return shaped
}

/** "a, b" → ["a","b"]; пусто → undefined, чтобы сработал дефолт. */
function split(value: string | undefined): string[] | undefined {
  const items = (value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return items.length ? items : undefined
}

interface TurnRequest {
  scenarioId: string
  messages: { role: string; content: string; [k: string]: unknown }[]
}

export interface DebriefRequest {
  scenarioId: string
  transcript: { role: string; text: string }[]
  facts: unknown
  metrics: unknown
}

interface ChatCompletion {
  choices?: {
    message?: {
      content?: string
      tool_calls?: { id: string; function: { name: string; arguments: string } }[]
    }
  }[]
}

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

/** Обработчик, который возвращает JSON и сам приводит ошибки к нормальному ответу. */
function json(handler: (req: IncomingMessage) => Promise<unknown>): Connect.NextHandleFunction {
  return (req, res, next) => {
    if (req.method !== 'POST' && req.method !== 'GET') return next()
    handler(req)
      .then((data) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify(data))
      })
      .catch((e: unknown) => sendError(res, e))
  }
}

function raw(
  handler: (req: IncomingMessage, res: ServerResponse) => Promise<void>,
): Connect.NextHandleFunction {
  return (req, res, next) => {
    if (req.method !== 'POST') return next()
    handler(req, res).catch((e: unknown) => sendError(res, e))
  }
}

function sendError(res: ServerResponse, e: unknown): void {
  const status = e instanceof HttpError ? e.status : 500
  const message = e instanceof Error ? e.message : String(e)
  console.error('[broker-api]', status, message)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify({ error: message }))
}

async function readBuffer(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks)
}

async function readJson<T>(req: IncomingMessage): Promise<T> {
  const buf = await readBuffer(req)
  if (buf.length === 0) return {} as T
  return JSON.parse(buf.toString('utf8')) as T
}

function safeParse(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    // Модели иногда заворачивают JSON в ```json — вытаскиваем первый объект.
    const match = raw.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0]) as Record<string, unknown>
      } catch {
        /* пусто — вернём {} ниже */
      }
    }
    return {}
  }
}

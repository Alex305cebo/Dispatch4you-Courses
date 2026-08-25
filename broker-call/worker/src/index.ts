import { makeCallSetup } from '../../src/call/makeCall'
import { buildSystemPrompt } from '../../src/call/prompt'
import { toGeminiTools } from '../../src/call/geminiTools'
import { pickLiveModel, type ModelInfo } from '../../src/call/geminiModels'
import { TOOL_SCHEMAS } from '../../src/call/toolSchemas'
import { normalizeGeminiVoice, geminiVoiceFromOrpheus } from '../../src/voice/geminiVoices'
import { voiceForBroker } from '../../src/voice/voices'

/**
 * Вебсокет-мост Gemini Live для боевого сайта.
 *
 * Повторяет ровно то, что делает дев-прокси локально: выдаёт одноразовую
 * сессию, поднимает сокет к Google со своей стороны (ключ не покидает Worker)
 * и гоняет байты в обе стороны. Промпт и набор звонка собираются ЗДЕСЬ из тех
 * же исходников, что у дев-сервера, — генератор детерминированный, поэтому
 * браузерная CallMachine видит тот же груз и того же брокера.
 *
 * Сессия без хранилища: Worker бесплатного тарифа не имеет общей памяти между
 * запросами, поэтому токен — это HMAC-подпись (seed, голос, срок) на ключе.
 * Проверка не требует ничего помнить, а подделать токен без ключа нельзя.
 */

interface Env {
  GEMINI_API_KEY: string
}

const GEMINI_HOST = 'generativelanguage.googleapis.com'
const GEMINI_WS_PATH = '/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent'
/** Сколько живёт выданная сессия: звонок начинают сразу или никогда. */
const SESSION_TTL_MS = 2 * 60_000

/** Отвечаем только своему сайту и локальной разработке. */
const ALLOWED_ORIGINS = ['https://dispatch4you.com', 'http://localhost:5180']

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') return withCors(new Response(null, { status: 204 }), request)

    if (url.pathname === '/api/gemini-session' && request.method === 'POST') {
      // Причина отказа обязана выйти наружу текстом: голый «error 1101»
      // Cloudflare не говорит ничего, и искать его приходится вслепую.
      try {
        return withCors(await mintSession(request, env), request)
      } catch (e) {
        return withCors(
          Response.json({ error: `bridge: ${(e as Error).message}`.slice(0, 300) }, { status: 502 }),
          request,
        )
      }
    }
    if (url.pathname === '/api/gemini-ws') {
      return proxyLive(request, env)
    }
    if (url.pathname === '/api/health') {
      return withCors(Response.json({ ok: true, role: 'gemini-live-bridge' }), request)
    }
    return withCors(new Response('not found', { status: 404 }), request)
  },
}

// ── Сессия ──────────────────────────────────────────────────────────────────

async function mintSession(request: Request, env: Env): Promise<Response> {
  if (!env.GEMINI_API_KEY) return Response.json({ error: 'GEMINI_API_KEY is not set' }, { status: 503 })

  const body = (await request.json().catch(() => ({}))) as { seed?: string; voice?: string }
  const seed = typeof body.seed === 'string' ? body.seed.trim() : ''
  if (!seed || seed.length > 64 || !/^[\w.-]+$/.test(seed)) {
    return Response.json({ error: `bad seed: ${seed.slice(0, 40)}` }, { status: 400 })
  }

  const models = await geminiModels(env.GEMINI_API_KEY)
  const model = pickLiveModel(models)
  if (!model) {
    return Response.json({ error: 'no Gemini model with bidiGenerateContent' }, { status: 503 })
  }

  const voice = geminiVoiceFromOrpheus(body.voice)
  const exp = Date.now() + SESSION_TTL_MS
  const payload = [seed, voice, model, exp].join("|")
  const token = payload + "|" + (await sign(payload, env.GEMINI_API_KEY))

  const wsUrl = `wss://${new URL(request.url).host}/api/gemini-ws`
  return Response.json({ token, model, wsUrl, setup: { locked: true } })
}

// ── Мост ────────────────────────────────────────────────────────────────────

async function proxyLive(request: Request, env: Env): Promise<Response> {
  if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
    return new Response('expected websocket', { status: 426 })
  }

  const token = new URL(request.url).searchParams.get('access_token') ?? ''
  const parts = token.split('|')
  if (parts.length !== 5) return new Response('bad token', { status: 403 })
  const [seed, voice, model, expRaw, mac] = parts as [string, string, string, string, string]
  const payload = [seed, voice, model, expRaw].join("|")
  if (mac !== (await sign(payload, env.GEMINI_API_KEY))) return new Response('bad token', { status: 403 })
  if (Number(expRaw) < Date.now()) return new Response('token expired', { status: 403 })

  // Наверх — обычный fetch с Upgrade: так Worker открывает исходящий вебсокет.
  const upstreamResp = await fetch(
    `https://${GEMINI_HOST}${GEMINI_WS_PATH}?key=${encodeURIComponent(env.GEMINI_API_KEY)}`,
    { headers: { Upgrade: 'websocket' } },
  )
  const upstream = upstreamResp.webSocket
  if (!upstream) return new Response(`upstream refused: ${upstreamResp.status}`, { status: 502 })
  upstream.accept()

  // Настройки собираются здесь и запираются: браузер шлёт пустой setup и
  // подменить промпт, голос или список инструментов не может.
  upstream.send(JSON.stringify({ setup: buildSetup(seed, voice, model) }))

  const pair = new WebSocketPair()
  const client = pair[1]
  client.accept()

  // Кадры пересылаются как есть в обе стороны. relay() не даёт кадру уйти
  // строкой «[object Blob]»: локальный wrangler отдаёт бинарные кадры Blob'ом,
  // а send() молча приводит его к строке — на том конце это мусор.
  client.addEventListener('message', (e) => {
    if (isEmptySetup(e.data)) return
    void relay(upstream, e.data)
  })
  upstream.addEventListener('message', (e) => {
    void relay(client, e.data)
  })
  client.addEventListener('close', () => upstream.close())
  upstream.addEventListener('close', (e) => {
    const code = e.code >= 1000 && e.code <= 4999 && e.code !== 1005 && e.code !== 1006 ? e.code : 1011
    try {
      client.close(code, (e.reason || '').slice(0, 120))
    } catch {
      /* уже закрыт */
    }
  })

  return new Response(null, { status: 101, webSocket: pair[0] })
}

function buildSetup(seed: string, voice: string, model: string) {
  const { broker } = makeCallSetup(seed)
  return {
    model: `models/${model}`,
    generationConfig: {
      responseModalities: ['AUDIO'],
      temperature: 0.85,
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: normalizeGeminiVoice(voice || voiceForBroker(broker.id)),
          },
        },
      },
    },
    systemInstruction: { parts: [{ text: buildSystemPrompt(seed) }] },
    tools: toGeminiTools(TOOL_SCHEMAS),
    inputAudioTranscription: {},
    outputAudioTranscription: {},
    realtimeInputConfig: { automaticActivityDetection: {} },
  }
}

// ── Мелочи ──────────────────────────────────────────────────────────────────

let modelCache: { at: number; models: ModelInfo[] } | null = null

async function geminiModels(key: string): Promise<ModelInfo[]> {
  if (modelCache && Date.now() - modelCache.at < 10 * 60_000) return modelCache.models
  const r = await fetch(`https://${GEMINI_HOST}/v1beta/models?pageSize=1000&key=${encodeURIComponent(key)}`)
  if (!r.ok) throw new Error(`models.list ${r.status}: ${(await r.text()).slice(0, 160)}`)
  const data = (await r.json()) as { models?: ModelInfo[] }
  modelCache = { at: Date.now(), models: data.models ?? [] }
  return modelCache.models
}

async function relay(target: WebSocket, data: unknown): Promise<void> {
  try {
    if (typeof data === 'string') target.send(data)
    else if (data instanceof ArrayBuffer) target.send(data)
    else if (data && typeof (data as Blob).arrayBuffer === 'function') {
      target.send(await (data as Blob).arrayBuffer())
    }
  } catch {
    /* сокет уже закрыт */
  }
}

function isEmptySetup(data: unknown): boolean {
  if (typeof data !== 'string') return false
  try {
    const parsed = JSON.parse(data) as { setup?: Record<string, unknown> }
    return Boolean(parsed.setup) && Object.keys(parsed.setup ?? {}).length === 0
  } catch {
    return false
  }
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function withCors(response: Response, request: Request): Response {
  const origin = request.headers.get('Origin') ?? ''
  const allowed = ALLOWED_ORIGINS.find((o) => origin.startsWith(o)) ?? ALLOWED_ORIGINS[0]!
  const out = new Response(response.body, response)
  out.headers.set('Access-Control-Allow-Origin', allowed)
  out.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  out.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return out
}

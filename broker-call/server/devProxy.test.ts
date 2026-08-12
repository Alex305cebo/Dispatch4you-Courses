import { describe, expect, it } from 'vitest'
import type { ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { brokerApi } from './devProxy'
import { SCENARIOS } from '../src/data/scenarios'

const FIRST_SCENARIO = SCENARIOS[0]?.id ?? ''

/**
 * Дев-сервер держит ключи и контракт, который на боевом сайте один в один
 * повторяет api/broker-call.php. Проверять его вручную значит поднимать Vite,
 * открывать браузер и смотреть глазами — а ломается он в местах, которых
 * глазами не видно: опечатка в имени ручки, исключение в обработчике,
 * разошедшийся набор полей.
 *
 * Здесь обработчики вызываются напрямую, без сервера и без сети: тесты идут
 * с пустым окружением, поэтому ни один запрос наружу не уходит.
 */

type Handler = (req: IncomingMessage, res: ServerResponse, next: () => void) => void

/** Поднимает плагин и собирает зарегистрированные им ручки. */
function routes(env: Record<string, string> = {}): Map<string, Handler> {
  const registered = new Map<string, Handler>()
  const server = {
    middlewares: {
      use: (path: string, handler: Handler) => {
        registered.set(path, handler)
      },
    },
  } as unknown as ViteDevServer

  const plugin = brokerApi(env)
  ;(plugin.configureServer as (s: ViteDevServer) => void)(server)
  return registered
}

/** Вызывает ручку и возвращает код и разобранное тело. */
async function call(
  handler: Handler,
  method = 'GET',
  payload?: unknown,
): Promise<{ status: number; body: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    const chunks: string[] = []
    const res = {
      statusCode: 200,
      setHeader: () => undefined,
      end: (data?: string) => {
        if (data) chunks.push(data)
        try {
          resolve({ status: res.statusCode, body: JSON.parse(chunks.join('')) as Record<string, unknown> })
        } catch (e) {
          reject(e as Error)
        }
      },
    } as unknown as ServerResponse & { statusCode: number }

    const body = payload === undefined ? null : Buffer.from(JSON.stringify(payload))
    const req = {
      method,
      headers: {},
      // Обработчики читают тело как поток. Без payload поток пустой — на нём
      // readJson возвращает {}.
      [Symbol.asyncIterator]: async function* () {
        if (body) yield body
      },
    } as unknown as IncomingMessage

    handler(req, res, () => reject(new Error('ручка не взяла запрос')))
  })
}

describe('ручки дев-сервера', () => {
  it('регистрирует весь контракт, который знает фронт', () => {
    const paths = [...routes().keys()]
    for (const path of [
      '/api/config',
      '/api/health',
      '/api/turn',
      '/api/stt',
      '/api/tts',
      '/api/debrief',
      '/api/realtime-session',
      '/api/gemini-session',
    ]) {
      expect(paths, path).toContain(path)
    }
  })

  it('config без ключей честно говорит, что ничего не готово', async () => {
    const handler = routes().get('/api/config')
    const { status, body } = await call(handler!)
    expect(status).toBe(200)
    expect(body.transport).toBe('pipeline')
    expect(body.ready).toEqual({
      llm: false,
      stt: false,
      tts: false,
      realtime: false,
      gemini: false,
    })
  })

  it('config поднимает флаг gemini ровно при наличии ключа', async () => {
    const handler = routes({ GEMINI_API_KEY: 'x' }).get('/api/config')
    const { body } = await call(handler!)
    expect((body.ready as { gemini: boolean }).gemini).toBe(true)
  })

  it('health отвечает без ключей и не падает — именно в таком виде его и открывают, когда всё сломалось', async () => {
    const handler = routes().get('/api/health')
    const { status, body } = await call(handler!)

    expect(status).toBe(200)
    expect(body.keys).toEqual({ groq: false, cerebras: false, openai: false, gemini: false })

    // Каждая проба обязана отчитаться. Отсутствующий раздел читается как
    // «работает», и именно так пропускают поломку.
    const probe = body.probe as Record<string, { ok: boolean; error?: string }>
    for (const name of ['chat', 'tts', 'stt', 'gemini']) {
      expect(probe[name], name).toBeDefined()
      expect(probe[name]?.ok, name).toBe(false)
      expect(probe[name]?.error, name).toBeTruthy()
    }
  })

  /**
   * Форма ответа должна совпадать с api/broker-call.php?action=health.
   * Открывают то локальный, то боевой; разные названия полей в одинаковых
   * отчётах заставляют переводить одно в другое ровно тогда, когда некогда.
   */
  it('health по форме совпадает с боевым PHP', async () => {
    const handler = routes().get('/api/health')
    const { body } = await call(handler!)
    const config = body.config as Record<string, unknown>
    expect(Object.keys(config).sort()).toEqual(['scenarios', 'tools', 'tts_model', 'voices'])
    expect(config.tools).toBeGreaterThan(0)
    expect(config.scenarios).toBeGreaterThan(0)
    expect(config.tts_model).toBeTruthy()
    expect(Array.isArray(config.voices)).toBe(true)
  })

  it('gemini-session без ключа отвечает 503, а не молчанием', async () => {
    const handler = routes().get('/api/gemini-session')
    const { status, body } = await call(handler!, 'POST')
    expect(status).toBe(503)
    expect(String(body.error)).toContain('GEMINI_API_KEY')
  })

  /**
   * 400, а не 500. Разница не косметическая: 500 читается как «сломался
   * сервер», и чинить идут туда, хотя кривой был запрос. Боевой PHP на
   * неизвестный сценарий отвечает 400 — контракт обязан совпадать, иначе
   * фронт ведёт себя локально и на сайте по-разному.
   */
  it.each(['/api/turn', '/api/debrief', '/api/realtime-session', '/api/gemini-session'])(
    '%s на неизвестный сценарий отвечает 400, а не 500',
    async (path) => {
      const handler = routes({
        // Ключи нужны, иначе ручка отвалится раньше на «нет ключа» и проверять
        // будет нечего.
        GROQ_API_KEY: 'x',
        OPENAI_API_KEY: 'x',
        GEMINI_API_KEY: 'x',
      }).get(path)
      const { status, body } = await call(handler!, 'POST')
      expect(status).toBe(400)
      expect(String(body.error)).toContain('unknown scenario')
    },
  )

  it('turn с настоящим сценарием, но без ключей — 503 с внятной причиной', async () => {
    const handler = routes().get('/api/turn')
    const { status, body } = await call(handler!, 'POST', { scenarioId: FIRST_SCENARIO, messages: [] })
    expect(status).toBe(503)
    expect(String(body.error)).toContain('no LLM key')
  })
})

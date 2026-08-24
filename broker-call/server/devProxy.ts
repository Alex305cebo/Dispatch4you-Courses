import type { Connect, Plugin, ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { randomUUID } from 'node:crypto'
import { WebSocketServer, WebSocket as UpstreamSocket, type RawData } from 'ws'
import { buildSystemPrompt } from '../src/call/prompt'
import { TOOL_SCHEMAS } from '../src/call/toolSchemas'
import { buildDebriefPrompt } from '../src/call/debriefPrompt'
import { toGeminiTools } from '../src/call/geminiTools'
import { pickLiveModel, pickTextModel, rankModels, type ModelInfo } from '../src/call/geminiModels'
import { geminiTurn } from './geminiTurn'
import { normalizeVoice, DEFAULT_VOICE, ORPHEUS_VOICES } from '../src/voice/voices'
import { normalizeGeminiVoice } from '../src/voice/geminiVoices'
import { encodeWav, TARGET_SAMPLE_RATE } from '../src/voice/audio'
import { CALL_SEEDS } from '../src/call/seeds'


/** Любой звонок: пробе важно, что сокет поднимается, а не кому мы звоним. */
const PROBE_SEED = 'health-probe'

/**
 * Сид звонка. По нему и клиент, и сервер собирают одного и того же брокера с
 * одним и тем же грузом — генератор общий и детерминированный.
 *
 * Проверяем форму до всякой работы: без этого мусор в теле уходил бы вглубь и
 * возвращался 500 «сервер сломался» вместо 400 «запрос кривой». Боевой PHP
 * отвечает так же — контракт обязан совпадать.
 */
function requireSeed(value: unknown): string {
  const seed = typeof value === 'string' ? value.trim() : ''
  if (!seed || seed.length > 64 || !/^[\w.-]+$/.test(seed)) {
    throw new HttpError(400, `bad seed: ${String(value).slice(0, 40)}`)
  }
  return seed
}

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
  const geminiKey = env.GEMINI_API_KEY ?? ''
  const transport = env.BROKER_CALL_TRANSPORT === 'realtime' ? 'realtime' : 'pipeline'

  // Списки, а не одиночные имена: провайдеры снимают модели с бесплатного
  // тарифа без предупреждения. Groq объявил llama-3.3-70b-versatile устаревшей
  // 17.06.2026 — с одним именем в коде это положило бы весь звонок.
  const CEREBRAS_MODELS = split(env.CEREBRAS_MODELS) ?? ['llama-3.3-70b']
  // llama-3.3-70b-versatile убрана 16.08.2026: Groq вернул на неё
  // «404 model_not_found — does not exist or you do not have access». Она стояла
  // последней в цепочке, поэтому падало ровно тогда, когда до неё доходило.
  const GROQ_MODELS = split(env.GROQ_MODELS) ?? ['openai/gpt-oss-120b', 'openai/gpt-oss-20b']

  /**
   * Распознавание речи. Список, а не имя, и решает его СЕРВЕР.
   *
   * `large-v3` точнее, чем `turbo`, и разница слышна именно там, где она нам
   * важна: акцент и отраслевые слова. Turbo быстрее, поэтому остаётся вторым.
   * Раньше имя модели лежало в клиенте (`PipelineTransport`), то есть менялось
   * только пересборкой фронта — при том что снимают модели с тарифа без
   * предупреждения, и мы на этом горели уже трижды.
   */
  const STT_MODELS = split(env.GROQ_STT_MODELS) ?? ['whisper-large-v3', 'whisper-large-v3-turbo']
  const TTS_MODEL = env.GROQ_TTS_MODEL ?? 'canopylabs/orpheus-v1-english'

  /**
   * Кого и в каком порядке спрашивать. Один список на разговор и на
   * диагностику: разойдись они — и health показывал бы зелёное там, где
   * звонок падает. Ровно это и случилось на боевом сервере.
   *
   * Cerebras первым: щедрый бесплатный лимит. Имена моделей у провайдеров
   * РАЗНЫЕ — старый ai-broker-chat.html слал груповское имя в Cerebras, тот
   * отвечал ошибкой, и каждый вызов молча уходил на запасного.
   */
  function buildAttempts(): Attempt[] {
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
    return attempts
  }

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
          // Ключа нет — фронт даже не пробует Gemini и работает как работал.
          gemini: Boolean(geminiKey),
        },
        // Имя модели распознавания приходит с сервера, а не лежит в бандле:
        // сменить его должно быть можно без пересборки фронта.
        sttModel: STT_MODELS[0],
      })))

      // ── Диагностика ───────────────────────────────────────────────────────
      // Живые пробы, а не догадки: короткий запрос к каждому сервису и текст
      // ошибки провайдера как есть. Открывается по /api/health.
      //
      // Проба обязана идти ТЕМ ЖЕ путём, что и звонок. На боевом сервере
      // прежняя версия слала голый ping без инструментов и светилась зелёным,
      // пока настоящий разговор падал с 502. Поэтому здесь тот же список
      // моделей, та же подгонка тела и те же схемы инструментов.
      server.middlewares.use('/api/health', json(async () => {
        const probe: Record<string, unknown> = {}

        // Диалог.
        const attempts = buildAttempts()
        if (attempts.length === 0) {
          probe.chat = { ok: false, error: 'no LLM key' }
        } else {
          for (const attempt of attempts) {
            const started = Date.now()
            const result = await tryChat(attempt)
            probe.chat = result.ok
              ? { ok: true, provider: attempt.name, model: attempt.model, ms: Date.now() - started }
              : {
                  ok: false,
                  provider: attempt.name,
                  model: attempt.model,
                  status: result.status,
                  error: result.error,
                }
            if (result.ok) break
          }
        }

        // Озвучка проверяется ТЕМ ЖЕ путём, каким идёт звонок: сперва Gemini,
        // и только если ключа нет — Groq. Иначе проба показывала бы отказ
        // Orpheus там, где брокер на самом деле говорит.
        if (geminiKey) {
          const started = Date.now()
          try {
            const wav = await geminiSpeak(geminiKey, 'Okay, got it.', DEFAULT_VOICE)
            probe.tts = { ok: true, provider: 'gemini', bytes: wav.length, ms: Date.now() - started }
          } catch (e) {
            probe.tts = { ok: false, provider: 'gemini', error: (e as Error).message.slice(0, 200) }
          }
        } else if (groqKey) {
          probe.tts = await probeTts(groqKey, TTS_MODEL)
        } else {
          probe.tts = { ok: false, error: 'no TTS key' }
        }

        probe.stt = groqKey
          ? await probeStt(groqKey, STT_MODELS[0] ?? 'whisper-large-v3')
          : { ok: false, error: 'no GROQ_API_KEY' }

        // Gemini: каталог, выбор модели, выпуск токена — весь путь целиком.
        probe.gemini = geminiKey ? await probeGemini(geminiKey) : { ok: false, error: 'no GEMINI_API_KEY' }

        return {
          keys: {
            groq: Boolean(groqKey),
            cerebras: Boolean(cerebrasKey),
            openai: Boolean(openaiKey),
            gemini: Boolean(geminiKey),
          },
          // Форма ответа один в один как у api/broker-call.php?action=health.
          // Открывают то одну, то другую; разные названия полей в одинаковых
          // отчётах заставляют переводить одно в другое ровно тогда, когда
          // некогда.
          config: {
            // Сколько разных звонков в наборе. Раньше здесь было число
            // сценариев, записанных руками.
            calls: CALL_SEEDS.length,
            tools: TOOL_SCHEMAS.length,
            tts_model: TTS_MODEL,
            voices: ORPHEUS_VOICES,
          },
          probe,
        }
      }))

      // ── Сессия Gemini Live ────────────────────────────────────────────────
      // Браузер получает ОДНОРАЗОВЫЙ номер сессии и адрес нашего же сокета.
      // Ключ и настройки остаются здесь: вебсокет открыт со страницы, а
      // страница открыта у студента.
      //
      // Раньше здесь выпускался эфемерный токен Google (`v1alpha/auth_tokens`)
      // и браузер шёл с ним прямо к Google. Токен выпускается, но вебсокет его
      // не принимает: `?access_token=` он не распознаёт вовсе («unregistered
      // callers»), а как `?key=` считает невалидным. Проверено на живом ключе,
      // оба варианта, с префиксом `auth_tokens/` и без. Прямой ключ при этом
      // работает на обеих версиях API — значит дело не в адресе и не в модели,
      // а в самих токенах. Поэтому сокет проксируется через сервер.
      //
      // Имя модели спрашиваем у провайдера в момент запуска. Вписанное в код
      // имя — то, на чём мы горели трижды: оно перестаёт существовать, и всё
      // замолкает разом.
      server.middlewares.use('/api/gemini-session', json(async (req) => {
        if (!geminiKey) throw new HttpError(503, 'GEMINI_API_KEY is not set')
        const body = await readJson<{ seed: string; voice?: string }>(req)
        // Сценарий проверяем ДО похода к провайдеру: ходить за каталогом
        // моделей ради заведомо кривого запроса незачем.
        const seed = requireSeed(body.seed)
        const models = await geminiModels(geminiKey)
        const model = pickLiveModel(models)
        if (!model) {
          throw new HttpError(
            503,
            'no Gemini model with bidiGenerateContent is available on this key',
          )
        }
        const setup = geminiSetup(model, seed, body.voice)
        const token = randomUUID()
        sessions.set(token, { setup, expiresAt: Date.now() + SESSION_TTL_MS })
        // Адрес берём из запроса, а не из константы: с телефона тренажёр
        // открывают по 192.168.x.x, и localhost туда не ведёт.
        const host = req.headers.host ?? `localhost:${server.config.server.port ?? 5180}`
        return { token, model, wsUrl: `ws://${host}${GEMINI_WS_PATH}`, setup: { locked: true } }
      }))

      // Сам проксируемый сокет. Наверх уходит ключ и запертый setup, вниз —
      // всё, что ответил Google, байт в байт.
      const wss = new WebSocketServer({ noServer: true })
      server.httpServer?.on('upgrade', (req, socket, head) => {
        const url = new URL(req.url ?? '', 'http://localhost')
        // Чужие апгрейды не трогаем: по этому же серверу живёт HMR самого Vite.
        if (url.pathname !== GEMINI_WS_PATH) return
        const session = takeSession(url.searchParams.get('access_token') ?? '')
        if (!session || !geminiKey) {
          socket.destroy()
          return
        }
        wss.handleUpgrade(req, socket, head, (client) => {
          pipeToGemini(client, session.setup, geminiKey)
        })
      })

      // ── Ход разговора ─────────────────────────────────────────────────────
      // Клиент шлёт только историю: системный промпт и инструменты
      // приклеиваются здесь, поэтому подменить характер брокера или потолок
      // ставки со стороны браузера нельзя.
      server.middlewares.use('/api/turn', json(async (req) => {
        const body = await readJson<TurnRequest>(req)
        const seed = requireSeed(body.seed)
        // Сводка известных фактов приклеивается к промпту на каждом ходу. Она
        // приходит с клиента: факты лежат в CallMachine, а он исполняется в
        // браузере. Длина ограничена — это не канал для подмены промпта.
        const known = typeof body.known === 'string' ? body.known.slice(0, 1500) : ''
        const prompt = known ? `${buildSystemPrompt(seed)}\n\n${known}` : buildSystemPrompt(seed)
        const messages = [{ role: 'system', content: prompt }, ...(body.messages ?? [])]
        const payload = {
          messages,
          tools: TOOL_SCHEMAS,
          tool_choice: 'auto',
          temperature: 0.85,
          max_tokens: 220,
        }

        // Gemini первым — это основной путь разговора. Groq и Cerebras остаются
        // запасными: у них 8000 токенов в минуту, и звонок встаёт на торге.
        if (geminiKey) {
          try {
            return await geminiTurn(geminiKey, prompt, body.messages ?? [], await geminiModels(geminiKey))
          } catch (e) {
            console.warn(`[broker-call] Gemini не ответил на ход, откат: ${(e as Error).message}`)
          }
        }

        const attempts = buildAttempts()
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
              // Сообщение уходит обратно клиенту, чтобы он дописал его в
              // историю вместе с tool_calls и их id — но очищенным от полей,
              // которые придумал конкретный провайдер.
              message: cleanAssistantMessage(choice),
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
        const body = await readJson<{ text: string; voice?: string }>(req)

        // Gemini первым, когда есть ключ.
        //
        // Orpheus у Groq требует однократного принятия условий в консоли, и
        // пока это не сделано, брокер молчит — голосовой тренажёр без голоса.
        // Gemini TTS работает по обычному HTTP, то есть доступен и боевому PHP,
        // в отличие от Live-вебсокета. Отказ — молча вниз, на Groq.
        if (geminiKey) {
          try {
            const wav = await geminiSpeak(geminiKey, body.text, body.voice)
            res.statusCode = 200
            res.setHeader('Content-Type', 'audio/wav')
            res.end(wav)
            return
          } catch (e) {
            console.warn(`[broker-call] Gemini TTS не ответил, откат на Groq: ${(e as Error).message}`)
          }
        }

        if (!groqKey) throw new HttpError(503, 'no TTS key configured')
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
        requireSeed(body.seed)

        // Gemini первым, когда есть ключ: flash-lite даёт 500 разборов в
        // сутки против двадцати у моделей уровня pro, а разбор — это ровно
        // один запрос на звонок. Имя модели снова не наше: спрашиваем
        // каталог и выбираем по той же политике, что и для разговора.
        //
        // Любой отказ — молча вниз, на прежний путь. Разбор студент видит
        // один раз в конце звонка; уронить его ради нового провайдера
        // означало бы отобрать единственное, ради чего он звонил.
        if (geminiKey) {
          try {
            return await debriefViaGemini(geminiKey, buildDebriefPrompt(body))
          } catch (e) {
            console.warn('[broker-api] разбор через Gemini не вышел, откат:', (e as Error).message)
          }
        }

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
        const body = await readJson<{ seed: string; voice?: string }>(req)
        const seed = requireSeed(body.seed)
        const r = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
          body: JSON.stringify({
            session: {
              type: 'realtime',
              model: env.OPENAI_REALTIME_MODEL ?? 'gpt-realtime-mini',
              instructions: buildSystemPrompt(seed),
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
 * Ответ модели, очищенный от полей конкретного провайдера.
 *
 * Рассуждающие модели Groq (`gpt-oss`) кладут в ответ поле `reasoning`. Оно
 * уходило клиенту, тот дописывал сообщение в историю, а на следующем ходу
 * история попадала к следующей модели цепочки — и `llama-3.3-70b-versatile`
 * отвечал `400: "messages[2].reasoning": reasoning is not supported with this
 * model`. Наружу это выглядело как «брокер не отвечает» ровно в тот момент,
 * когда звонок дошёл до букинга.
 *
 * В историю нужно ровно то, что понимает любая OpenAI-совместимая модель:
 * роль, текст и вызовы инструментов вместе с их id.
 */
function cleanAssistantMessage(choice: ChatCompletionMessage | undefined): Record<string, unknown> {
  if (!choice) return { role: 'assistant', content: '' }
  const clean: Record<string, unknown> = {
    role: choice.role ?? 'assistant',
    content: choice.content ?? '',
  }
  if (choice.tool_calls?.length) clean.tool_calls = choice.tool_calls
  return clean
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

// ── Пробы для /api/health ───────────────────────────────────────────────────
// Каждая ходит тем же путём, что и настоящая работа, и возвращает текст отказа
// провайдера как есть. Обрезанная до кода ошибка не объясняет ничего — это
// выяснилось на «LLM 502», за которым скрывалось «max_tokens не поддержан».

interface ProbeResult {
  ok: boolean
  status?: number
  error?: string
}

async function tryChat(attempt: Attempt): Promise<ProbeResult> {
  try {
    const r = await fetch(attempt.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${attempt.key}` },
      body: JSON.stringify(
        shapePayload(
          {
            messages: [{ role: 'user', content: 'ping' }],
            // Инструменты обязательны в пробе: кривая схема роняет ЗАПРОС
            // ЦЕЛИКОМ, и без них проба этого не увидит.
            tools: TOOL_SCHEMAS,
            tool_choice: 'auto',
            temperature: 0.85,
            max_tokens: 32,
          },
          attempt.model,
        ),
      ),
    })
    if (r.ok) return { ok: true }
    return { ok: false, status: r.status, error: (await r.text()).slice(0, 200) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

async function probeTts(key: string, model: string): Promise<Record<string, unknown>> {
  const started = Date.now()
  try {
    const r = await fetch('https://api.groq.com/openai/v1/audio/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        voice: DEFAULT_VOICE,
        input: 'Apex Freight, this is Mike.',
        response_format: 'wav',
      }),
    })
    if (r.ok) {
      const bytes = (await r.arrayBuffer()).byteLength
      return { ok: true, voice: DEFAULT_VOICE, bytes, ms: Date.now() - started }
    }
    const body = (await r.text()).slice(0, 200)
    const result: Record<string, unknown> = {
      ok: false,
      voice: DEFAULT_VOICE,
      status: r.status,
      error: body,
    }
    // Самый частый отказ — не поломка, а непринятые условия модели. Ответ
    // провайдера обрезан на середине адреса, поэтому ссылку собираем сами.
    if (/terms acceptance/i.test(body)) {
      result.hint = `Модель требует однократного принятия условий: https://console.groq.com/playground?model=${encodeURIComponent(model)}`
    }
    return result
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

async function probeStt(key: string, model: string): Promise<Record<string, unknown>> {
  const started = Date.now()
  try {
    // Полсекунды тишины: нам важен факт приёма файла, а не текст.
    const form = new FormData()
    form.append('file', encodeWav(new Float32Array(TARGET_SAMPLE_RATE / 2)), 'probe.wav')
    form.append('model', model)
    form.append('response_format', 'text')

    const r = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    })
    if (r.ok) return { ok: true, ms: Date.now() - started }
    return { ok: false, status: r.status, error: (await r.text()).slice(0, 200) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

async function probeGemini(key: string): Promise<Record<string, unknown>> {
  const started = Date.now()
  try {
    const models = await geminiModels(key)
    const live = pickLiveModel(models)
    const text = pickTextModel(models)
    if (!live) {
      return {
        ok: false,
        stage: 'pick',
        error: 'на этом ключе нет модели с bidiGenerateContent',
        models: models.length,
      }
    }
    // Поднимаем настоящий сокет с настоящим промптом и инструментами и ждём
    // setupComplete. Проба обязана идти тем же путём, что и звонок: прежняя
    // проверяла выпуск токена, светилась зелёным — а разговор не начинался,
    // потому что ломалось на шаг позже, при подключении к сокету.
    const setup = geminiSetup(live, PROBE_SEED)
    await probeGeminiSocket(key, setup)
    return {
      ok: true,
      live_model: live,
      text_model: text,
      models: models.length,
      ms: Date.now() - started,
    }
  } catch (e) {
    return { ok: false, stage: 'token', error: (e as Error).message }
  }
}

// ── Gemini Live ─────────────────────────────────────────────────────────────

const GEMINI_API = 'https://generativelanguage.googleapis.com'
const GEMINI_WS =
  'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent'

/** Путь нашего сокета. Браузер ходит сюда, а не к Google. */
const GEMINI_WS_PATH = '/api/gemini-ws'

/** Столько живёт номер сессии до подключения. Звонок начинают сразу или никогда. */
const SESSION_TTL_MS = 2 * 60_000

/**
 * Выданные, но ещё не использованные сессии. Здесь лежит запертый setup —
 * системный промпт, голос и список инструментов. Браузер знает только номер,
 * поэтому подменить характер брокера или потолок ставки со своей стороны не
 * может, как и раньше.
 */
const sessions = new Map<string, { setup: unknown; expiresAt: number }>()

/** Сессия одноразовая: взяли — забыли. Заодно подчищаем просроченные. */
function takeSession(token: string): { setup: unknown; expiresAt: number } | null {
  const now = Date.now()
  for (const [key, value] of sessions) {
    if (value.expiresAt < now) sessions.delete(key)
  }
  const session = sessions.get(token)
  if (!session) return null
  sessions.delete(token)
  return session.expiresAt < now ? null : session
}

/**
 * Мост браузер ↔ Google.
 *
 * Наверх сервер сам шлёт настоящий setup, поэтому пустой `{setup:{}}` от
 * браузера сюда не пересылается — иначе Google получил бы вторую настройку и
 * закрыл бы сессию. Всё остальное идёт как есть, в обе стороны.
 */
function pipeToGemini(client: import('ws').WebSocket, setup: unknown, key: string): void {
  const upstream = new UpstreamSocket(`${GEMINI_WS}?key=${encodeURIComponent(key)}`)
  // Кадры микрофона могут прийти раньше, чем откроется верхний сокет. Без
  // очереди первая фраза студента потерялась бы молча.
  const pending: RawData[] = []

  upstream.on('open', () => {
    upstream.send(JSON.stringify({ setup }))
    for (const frame of pending) upstream.send(frame as Buffer)
    pending.length = 0
  })
  upstream.on('message', (data: RawData) => {
    if (client.readyState === client.OPEN) client.send(data as Buffer)
  })
  upstream.on('error', (e: Error) => closeClient(client, 1011, e.message))
  upstream.on('close', (code: number, reason: Buffer) => {
    closeClient(client, code, reason.toString())
  })

  client.on('message', (data: RawData) => {
    if (isEmptySetup(data)) return
    if (upstream.readyState === UpstreamSocket.OPEN) upstream.send(data as Buffer)
    else pending.push(data)
  })
  client.on('close', () => {
    try {
      upstream.close()
    } catch {
      /* уже закрыт */
    }
  })
}

/** Пустая настройка от браузера — та самая, что заменяется серверной. */
function isEmptySetup(data: RawData): boolean {
  try {
    const parsed = JSON.parse(data.toString()) as { setup?: Record<string, unknown> }
    return Boolean(parsed.setup) && Object.keys(parsed.setup ?? {}).length === 0
  } catch {
    return false
  }
}

/** Коды 1005/1006 и служебные закрытием не передаются — подменяем на 1011. */
function closeClient(client: import('ws').WebSocket, code: number, reason: string): void {
  const safe = code >= 1000 && code <= 4999 && code !== 1005 && code !== 1006 ? code : 1011
  try {
    client.close(safe, reason.slice(0, 120))
  } catch {
    /* уже закрыт */
  }
}

let modelCache: { at: number; models: ModelInfo[] } | null = null

/** Каталог моделей ключа. Держим десять минут: он меняется реже, чем звонят. */
async function geminiModels(key: string): Promise<ModelInfo[]> {
  const now = Date.now()
  if (modelCache && now - modelCache.at < 10 * 60_000) return modelCache.models
  const r = await fetch(`${GEMINI_API}/v1beta/models?pageSize=1000&key=${encodeURIComponent(key)}`)
  if (!r.ok) {
    throw new HttpError(r.status, `models.list ${r.status}: ${(await r.text()).slice(0, 300)}`)
  }
  const data = (await r.json()) as { models?: ModelInfo[] }
  const models = data.models ?? []
  modelCache = { at: now, models }
  return models
}

/**
 * Настройки сессии. Уходят вместе с токеном и после этого ЗАПЕРТЫ: браузер
 * не может ни подменить системный промпт, ни расширить список инструментов —
 * он присылает пустой setup и работает с тем, что решил сервер.
 */
function geminiSetup(model: string, seed: string, voice?: string) {
  return {
    model: `models/${model}`,
    generationConfig: {
      responseModalities: ['AUDIO'],
      temperature: 0.85,
      speechConfig: {
        // Язык прибит гвоздями. Без него провайдер определяет его заново на
        // каждой фразе и на акценте срывается: в живом звонке расшифровка
        // выдала «ヒューズ と» и «5000 Oh. Добре. Доллар» вместо английского.
        // Разговор при этом шёл нормально — ломался только текст на экране,
        // то есть ровно то, ради чего тренажёр и нужен.
        languageCode: 'en-US',
        voiceConfig: { prebuiltVoiceConfig: { voiceName: normalizeGeminiVoice(voice) } },
      },
    },
    systemInstruction: { parts: [{ text: buildSystemPrompt(seed) }] },
    tools: toGeminiTools(TOOL_SCHEMAS),
    // Текст обеих сторон нужен экрану: слова на экране — это весь тренажёр.
    inputAudioTranscription: {},
    outputAudioTranscription: {},
    // Паузы режет провайдер: у него это делается по самому аудио, а не по
    // громкости, поэтому в шумной комнате работает лучше нашего детектора.
    realtimeInputConfig: { automaticActivityDetection: {} },
  }
}

/**
 * Разбор звонка через Gemini.
 *
 * Формат у него свой: системная часть отдельным полем, а не первым сообщением,
 * и ответ лежит в candidates[0].content.parts. Просить JSON надо через
 * responseMimeType — без него модель заворачивает его в ```json, и разбор
 * приходится выковыривать регулярками.
 */
async function debriefViaGemini(
  key: string,
  messages: { role: string; content: string }[],
): Promise<Record<string, unknown>> {
  const model = pickTextModel(await geminiModels(key))
  if (!model) throw new Error('нет подходящей текстовой модели на этом ключе')

  const system = messages.find((m) => m.role === 'system')?.content ?? ''
  const user = messages.find((m) => m.role === 'user')?.content ?? ''

  const r = await fetch(
    `${GEMINI_API}/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 900,
          responseMimeType: 'application/json',
        },
      }),
    },
  )
  if (!r.ok) throw new Error(`${model} ${r.status}: ${(await r.text()).slice(0, 200)}`)

  const data = (await r.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
  const parsed = safeParse(text)
  // Пустой объект означает, что разобрать не удалось. Отдавать студенту
  // пустой разбор хуже, чем сходить к прежнему провайдеру.
  if (Object.keys(parsed).length === 0) throw new Error(`${model} вернул неразбираемый ответ`)
  return parsed
}

/** Живая проба сокета: дошли ли до setupComplete. Всё, что до него, — догадки. */
function probeGeminiSocket(key: string, setup: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const ws = new UpstreamSocket(`${GEMINI_WS}?key=${encodeURIComponent(key)}`)
    const done = (error?: Error) => {
      clearTimeout(timer)
      try {
        ws.close()
      } catch {
        /* уже закрыт */
      }
      if (error) reject(error)
      else resolve()
    }
    const timer = setTimeout(() => done(new Error('setupComplete не пришёл за 10 секунд')), 10_000)
    ws.on('open', () => ws.send(JSON.stringify({ setup })))
    ws.on('message', (data: RawData) => {
      if (data.toString().includes('setupComplete')) done()
    })
    ws.on('error', (e: Error) => done(e))
    ws.on('close', (code: number, reason: Buffer) => {
      done(new Error(`сокет закрыт ${code} ${reason.toString().slice(0, 160)}`.trim()))
    })
  })
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
  seed: string
  messages: { role: string; content: string; [k: string]: unknown }[]
  /** Что брокер уже знает — сводка из CallMachine, одной строкой. */
  known?: string
}

export interface DebriefRequest {
  seed: string
  transcript: { role: string; text: string }[]
  facts: unknown
  metrics: unknown
}

interface ChatCompletionMessage {
  role?: string
  content?: string
  tool_calls?: { id: string; function: { name: string; arguments: string } }[]
}

interface ChatCompletion {
  choices?: { message?: ChatCompletionMessage }[]
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

/**
 * Озвучка через Gemini.
 *
 * Модель не вписана: берётся по политике из `MODEL_RULES.tts` из живого
 * каталога. Голос приходит в именах Orpheus (`austin`, `diana`) — переводим в
 * набор Gemini, сохраняя пол и тембр, чтобы брокер звучал одинаково независимо
 * от того, кто сейчас озвучивает.
 *
 * Gemini отдаёт сырой PCM16, а фронт ждёт WAV, поэтому дописываем заголовок.
 */
/** Модели озвучки с выбитой квотой — минуту в них не стучимся. */
const ttsCoolingDown = new Map<string, number>()

async function geminiSpeak(key: string, text: string, voice?: string): Promise<Buffer> {
  // Ремарка Orpheus вида «[warm] …» срезается и здесь: старый бандл фронта из
  // кэша браузера ещё может её слать, а Gemini TTS читает такие пометки вслух —
  // шёпоты в начале реплик были ровно этим.
  const clean = (text ?? '').replace(/^\[[a-z\s-]{2,20}\]\s*/i, '').trim()
  if (!clean) throw new Error('пустой текст')

  // Список, а не одно имя. Превью-модели Gemini регулярно отвечают
  // «503 high demand»: на первом же живом запросе 3.1-flash-tts оказалась
  // занята, и с единственным именем брокер снова остался бы без голоса.
  const candidates = rankModels(await geminiModels(key), 'tts').map((m) => m.id)
  if (candidates.length === 0) throw new Error('на этом ключе нет модели озвучки')

  let lastError = ''
  for (const model of candidates) {
    // Исчерпанную квоту помним: без этого голос прыгал между моделями от
    // реплики к реплике — «брокер отвечает разными голосами».
    if (ttsCoolingDown.get(model)! > Date.now()) continue
    const r = await fetch(
      `${GEMINI_API}/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: clean }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: geminiVoiceFor(voice) } },
            },
          },
        }),
      },
    )
    if (!r.ok) {
      if (r.status === 429) ttsCoolingDown.set(model, Date.now() + 60_000)
      lastError = `${model} ${r.status}: ${(await r.text()).slice(0, 160)}`
      continue
    }

    const data = (await r.json()) as {
      candidates?: { content?: { parts?: { inlineData?: { data?: string; mimeType?: string } }[] } }[]
    }
    const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)
    const base64 = part?.inlineData?.data
    if (!base64) {
      lastError = `${model} вернул ответ без звука`
      continue
    }

    // Частота приезжает в mimeType вида `audio/L16;codec=pcm;rate=24000`.
    const rate = Number(/rate=(\d+)/.exec(part?.inlineData?.mimeType ?? '')?.[1] ?? 24000)
    return wavFromPcm16(Buffer.from(base64, 'base64'), rate)
  }

  throw new Error(lastError || 'все модели озвучки отказали')
}

/** Orpheus → Gemini, с сохранением пола: Рэй остаётся Рэем у обоих провайдеров. */
function geminiVoiceFor(orpheusVoice: string | undefined): string {
  const map: Record<string, string> = {
    austin: 'Puck',
    daniel: 'Charon',
    troy: 'Fenrir',
    diana: 'Kore',
    hannah: 'Leda',
    autumn: 'Aoede',
  }
  return normalizeGeminiVoice(map[normalizeVoice(orpheusVoice)] ?? DEFAULT_GEMINI_VOICE)
}

const DEFAULT_GEMINI_VOICE = 'Puck'

/** Заголовок WAV поверх сырого PCM16 моно. */
function wavFromPcm16(pcm: Buffer, sampleRate: number): Buffer {
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + pcm.length, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20) // PCM
  header.writeUInt16LE(1, 22) // моно
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(sampleRate * 2, 28) // байт в секунду
  header.writeUInt16LE(2, 32) // выравнивание блока
  header.writeUInt16LE(16, 34) // бит на отсчёт
  header.write('data', 36)
  header.writeUInt32LE(pcm.length, 40)
  return Buffer.concat([header, pcm])
}

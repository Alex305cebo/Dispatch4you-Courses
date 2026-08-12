import type { TransportDeps, VoiceTransport } from './types'
import { MicVad } from './vad'
import { TelephonyAudio } from './TelephonyAudio'
import { endpoint } from '../api'
import { floatToPcm16Base64, base64ToPcm16Float } from './pcm'
import {
  parseServerMessage,
  setupMessage,
  audioChunkMessage,
  textTurnMessage,
  toolResponseMessage,
  GEMINI_INPUT_RATE,
} from './geminiProtocol'

/**
 * Разговор целиком внутри одной модели: Gemini Live по вебсокету.
 *
 * Пайплайн (VAD → Whisper → LLM → Orpheus) — это четыре сетевых похода на
 * каждую реплику и четыре места, где всё встаёт. Здесь их ноль: микрофон
 * уходит потоком, голос приходит потоком, паузы режет провайдер по самому
 * аудио, а не по громкости. Так устроены настоящие ИИ-брокеры, которым звонят
 * диспетчеры.
 *
 * Наружу отдаются ровно те же события, что у двух других транспортов, поэтому
 * экран звонка и CallMachine не знают, кто сейчас работает. В этом и был смысл
 * интерфейса VoiceTransport: новый провайдер не должен стоить ни строчки в
 * остальной программе.
 *
 * Ключ в браузер не попадает: сервер выдаёт одноразовый токен и запирает
 * вместе с ним системный промпт, голос и список инструментов.
 */
export class GeminiLiveTransport implements VoiceTransport {
  private readonly deps: TransportDeps
  private readonly telephony = new TelephonyAudio()
  private readonly vad: MicVad

  private ws: WebSocket | null = null
  private ready = false
  /** До снятия трубки микрофон в линию не идёт: брокер не слушает комнату. */
  private streaming = false
  private closed = false

  /** Запланированный к воспроизведению звук — чтобы оборвать его при перебивании. */
  private queued: AudioBufferSourceNode[] = []
  private nextPlayAt = 0
  private receivedMs = 0

  private utterance: { id: string; startedAt: number } | null = null
  private partial = ''
  /** Замеры пауз — уходят в разбор звонка. */
  private readonly latencies: number[] = []
  private silenceAt = 0

  onLevel: ((level: number) => void) | null = null

  constructor(deps: TransportDeps) {
    this.deps = deps
    this.vad = new MicVad({
      // Перебивание делает провайдер; наш детектор нужен только экрану —
      // чтобы шар начинал реагировать в ту же секунду, когда студент открыл рот.
      onSpeechStart: () => this.deps.emit({ type: 'user_speech_start' }),
      onSpeechEnd: () => undefined,
      onSilence: () => {
        this.silenceAt = performance.now()
      },
      onLevel: (level) => this.onLevel?.(level),
      onFrame: (frame) => this.sendFrame(frame),
    })
  }

  async connect(): Promise<void> {
    const session = await this.mintSession()
    await this.telephony.ensureContext()

    // Микрофон до гудков: если студент откажет в доступе, лучше узнать это
    // сразу, а не после десяти секунд ожидания ответа.
    await this.vad.start()

    await this.openSocket(session)
    if (this.closed) return

    const stopRing = await this.telephony.ring()
    await wait(3200)
    if (this.closed) return
    stopRing()
    await this.telephony.pickupClick()
    void this.telephony.startAmbience()

    // Теперь линия открыта в обе стороны.
    this.streaming = true

    // Брокер снимает трубку и говорит первым — как в жизни. Реплику задаём
    // дословно: это визитная карточка компании, её не сочиняют заново.
    this.send(
      textTurnMessage(
        `[The call just connected. Answer the phone with exactly this line and nothing else: "${this.deps.opening}"]`,
      ),
    )
  }

  disconnect(): void {
    this.closed = true
    this.streaming = false
    this.stopQueued(false)
    this.vad.stop()
    try {
      this.ws?.close()
    } catch {
      /* уже закрыт */
    }
    this.ws = null
    void this.telephony.hangUp()
    window.setTimeout(() => this.telephony.dispose(), 1200)
  }

  /**
   * Тихий уход при откате: отпускаем микрофон и сокет, но не играем отбой и
   * не трогаем аудиоконтекст. Сигнал «занято» перед гудками запасного
   * транспорта студент прочитал бы как сломанный звонок.
   */
  abandon(): void {
    this.closed = true
    this.streaming = false
    this.stopQueued(false)
    this.vad.stop()
    try {
      this.ws?.close()
    } catch {
      /* уже закрыт */
    }
    this.ws = null
    this.telephony.stopAmbience()
    this.telephony.dispose()
  }

  getMicStream(): MediaStream | null {
    return this.vad.getStream()
  }

  /** Перебивание встроено в провайдера; это ручной дубль на случай рассинхрона. */
  interrupt(): void {
    this.stopQueued(true)
  }

  getAverageLatencyMs(): number {
    if (this.latencies.length === 0) return 0
    return Math.round(this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length)
  }

  // ── Соединение ────────────────────────────────────────────────────────────

  private async mintSession(): Promise<GeminiSession> {
    const r = await fetch(endpoint('gemini-session'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioId: this.deps.scenarioId, voice: this.deps.voice }),
    })
    if (!r.ok) {
      // Тело несёт причину отказа провайдера. Без него остаётся голый код,
      // по которому нельзя понять ничего — это мы уже проходили.
      const detail = await r.text().catch(() => '')
      throw new Error(`gemini-session ${r.status} ${extractError(detail).slice(0, 220)}`)
    }
    const session = (await r.json()) as GeminiSession
    if (!session.token || !session.wsUrl) throw new Error('gemini-session вернул пустую сессию')
    return session
  }

  private openSocket(session: GeminiSession): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`${session.wsUrl}?access_token=${encodeURIComponent(session.token)}`)
      ws.binaryType = 'arraybuffer'
      this.ws = ws

      // Без срока ожидания молчащий сокет держал бы студента у гудков вечно,
      // и откат на пайплайн никогда бы не случился.
      const timer = window.setTimeout(() => {
        reject(new Error('Gemini Live не ответил на настройку за 10 секунд'))
        try {
          ws.close()
        } catch {
          /* уже закрыт */
        }
      }, 10000)

      const settle = (error?: Error) => {
        window.clearTimeout(timer)
        if (error) reject(error)
        else resolve()
      }

      ws.onopen = () => ws.send(setupMessage())

      ws.onmessage = (event: MessageEvent<string | ArrayBuffer | Blob>) => {
        void this.readMessage(event.data, settle)
      }

      ws.onerror = () => {
        if (!this.ready) settle(new Error('вебсокет Gemini Live не открылся'))
      }

      ws.onclose = (event: CloseEvent) => {
        if (!this.ready) {
          // Причина закрытия — единственное, что объясняет отказ. Код 1006
          // без текста означает «до сервера не дошли», всё остальное он пишет.
          settle(new Error(`Gemini Live закрыл соединение: ${event.code} ${event.reason || ''}`.trim()))
          return
        }
        if (!this.closed) {
          this.deps.emit({ type: 'error', message: `error.geminiClosed:${event.code}`, fatal: false })
        }
      }
    })
  }

  private async readMessage(
    data: string | ArrayBuffer | Blob,
    settle: (error?: Error) => void,
  ): Promise<void> {
    // Google шлёт JSON, но заворачивает его в Blob — по вебсокету это
    // законно и ловится не везде одинаково.
    let raw: string
    if (typeof data === 'string') raw = data
    else if (data instanceof ArrayBuffer) raw = new TextDecoder().decode(data)
    else raw = await data.text()

    for (const event of parseServerMessage(raw)) {
      switch (event.kind) {
        case 'setup_complete':
          this.ready = true
          settle()
          break

        case 'audio':
          void this.playChunk(event.base64, event.sampleRate)
          break

        case 'input_transcript':
          // Расшифровка своих слов приходит кусками; на экране это черновик,
          // который закрывается целой фразой, когда брокер начинает отвечать.
          this.partial += event.text
          this.deps.emit({ type: 'user_partial', text: this.partial.trim() })
          break

        case 'output_transcript':
          this.pushAgentText(event.text)
          break

        case 'interrupted':
          this.stopQueued(true)
          break

        case 'turn_complete':
          this.finishUtterance(false)
          break

        case 'tool_call':
          this.runTools(event.calls)
          break

        case 'tool_cancel':
          // Отменённые вызовы отвечать не нужно — модель их уже забыла.
          break

        case 'go_away':
          this.deps.emit({
            type: 'error',
            message: `error.geminiGoAway:${Math.round(event.leftMs / 1000)}s`,
            fatal: false,
          })
          break

        case 'error':
          this.deps.emit({ type: 'error', message: `error.gemini:${event.message}`, fatal: false })
          if (!this.ready) settle(new Error(event.message))
          break
      }
    }
  }

  private send(payload: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(payload)
  }

  private sendFrame(frame: Float32Array): void {
    if (!this.streaming || this.closed) return
    this.send(audioChunkMessage(floatToPcm16Base64(frame), GEMINI_INPUT_RATE))
  }

  // ── Голос брокера ─────────────────────────────────────────────────────────

  /**
   * Куски приходят быстрее, чем играют, поэтому их не «проигрывают», а
   * выстраивают в очередь по времени контекста. Иначе они наложились бы друг
   * на друга и разговор превратился бы в кашу.
   */
  private async playChunk(base64: string, sampleRate: number): Promise<void> {
    if (this.closed) return
    const samples = base64ToPcm16Float(base64)
    if (samples.length === 0) return

    const ctx = await this.telephony.ensureContext()
    if (this.closed) return

    // Буфер объявляем на частоте провайдера — Web Audio пересчитает его сам,
    // и делает это лучше, чем линейная интерполяция.
    const buffer = ctx.createBuffer(1, samples.length, sampleRate)
    buffer.getChannelData(0).set(samples)

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(this.telephony.getLineInput() ?? ctx.destination)

    // Небольшой запас на первый кусок: без него начало реплики щёлкает.
    const startAt = Math.max(ctx.currentTime + 0.02, this.nextPlayAt)
    source.start(startAt)
    this.nextPlayAt = startAt + buffer.duration
    this.receivedMs += buffer.duration * 1000

    this.queued.push(source)
    source.onended = () => {
      this.queued = this.queued.filter((s) => s !== source)
    }

    if (this.silenceAt > 0) {
      this.latencies.push(performance.now() - this.silenceAt)
      this.silenceAt = 0
    }
  }

  private pushAgentText(text: string): void {
    if (!this.utterance) {
      // Первая расшифровка открывает реплику. Длительность заранее неизвестна,
      // поэтому слова проявляет сам поток — как в Realtime.
      this.utterance = { id: `g${++counter}`, startedAt: performance.now() }
      this.deps.emit({
        type: 'agent_utterance_start',
        id: this.utterance.id,
        text: '',
        durationMs: 0,
      })

      // Брокер заговорил — значит фраза студента закончена. Черновик на экране
      // заменяется целой строкой.
      if (this.partial.trim()) {
        this.deps.emit({ type: 'user_final', text: this.partial.trim() })
      }
      this.partial = ''
    }
    this.deps.emit({ type: 'agent_text_delta', id: this.utterance.id, delta: text })
  }

  private finishUtterance(interrupted: boolean): void {
    const current = this.utterance
    if (!current) return
    this.utterance = null
    const spoken = performance.now() - current.startedAt
    const spokenRatio =
      interrupted && this.receivedMs > 0 ? Math.max(0, Math.min(1, spoken / this.receivedMs)) : 1
    this.receivedMs = 0
    this.deps.emit({ type: 'agent_utterance_end', id: current.id, interrupted, spokenRatio })
  }

  /** Выбросить всё, что ещё не прозвучало. Это и есть перебивание. */
  private stopQueued(interrupted: boolean): void {
    for (const source of this.queued) {
      try {
        source.onended = null
        source.stop()
      } catch {
        /* уже отыграл */
      }
    }
    this.queued = []
    this.nextPlayAt = 0
    this.finishUtterance(interrupted)
  }

  // ── Инструменты ───────────────────────────────────────────────────────────

  private runTools(calls: { id: string; name: string; args: unknown }[]): void {
    const responses = calls.map((call) => {
      this.deps.emit({ type: 'tool_start', id: call.id, name: call.name, args: call.args })
      const result = this.deps.runTool(call.name, call.args)
      this.deps.emit({ type: 'tool_end', id: call.id, name: call.name, result })
      return { id: call.id, name: call.name, result }
    })
    // Ответы уходят ОДНИМ сообщением: модель ждёт их все и до тех пор молчит.
    this.send(toolResponseMessage(responses))
  }
}

interface GeminiSession {
  token: string
  model: string
  wsUrl: string
}

let counter = 0

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

/** Вытаскивает человекочитаемую часть из ответа об ошибке. */
function extractError(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as { error?: unknown }
    if (typeof parsed.error === 'string') return parsed.error
  } catch {
    // Не JSON — покажем как есть.
  }
  return raw
}

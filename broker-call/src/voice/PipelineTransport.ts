import type { TransportDeps, VoiceTransport } from './types'
import { MicVad } from './vad'
import { TelephonyAudio } from './TelephonyAudio'
import { encodeWav, durationSeconds } from './audio'
import { WHISPER_PROMPT, looksNonEnglish, normalizeTranscript } from '../data/terms'
import { endpoint } from '../api'
import { estimateDurationMs, speakInBrowser, type BrowserSpeech } from './browserVoice'
import { Backchannel } from './backchannel'
import { synthesize } from './tts'

/**
 * Бесплатный транспорт: VAD → Whisper → LLM → Orpheus.
 *
 * Медленнее Realtime (800–1500 мс против 300–800), но не стоит ничего и
 * работает на тех же ключах, что уже есть у проекта. Наружу отдаёт ровно те же
 * события, что и RealtimeTransport, поэтому экран звонка их не различает.
 */
export class PipelineTransport implements VoiceTransport {
  private readonly deps: TransportDeps
  private readonly telephony = new TelephonyAudio()
  private readonly vad: MicVad

  /** История в формате провайдера. Системный промпт добавляет сервер. */
  private messages: ChatMessage[] = []
  private playing: AudioBufferSourceNode | null = null
  private browserSpeech: BrowserSpeech | null = null
  /** Об отказе озвучки сообщаем один раз за звонок, а не на каждой реплике. */
  private ttsReported = false
  private backchannel: Backchannel | null = null
  /** Замеры пауз — уходят в разбор звонка. */
  private readonly turnLatencies: number[] = []
  private currentUtterance: { id: string; startedAt: number; durationMs: number } | null = null
  private preview: SpeechRecognitionLike | null = null
  private abort: AbortController | null = null
  private holdTimer: number | null = null
  private closed = false
  private busy = false

  onLevel: ((level: number) => void) | null = null

  constructor(deps: TransportDeps) {
    this.deps = deps
    this.vad = new MicVad({
      onSpeechStart: () => this.handleSpeechStart(),
      onSpeechEnd: (audio) => void this.handleSpeechEnd(audio),
      onLevel: (level) => this.onLevel?.(level),
    })
  }

  async connect(): Promise<void> {
    const ctx = await this.telephony.ensureContext()

    // Микрофон запрашиваем ДО гудков: если студент откажет, лучше узнать это
    // сразу, а не после десяти секунд ожидания ответа.
    await this.vad.start()

    // Отклики синтезируются во время гудков — три секунды простоя как раз на
    // это и уходят. БЕЗ await: не успели или провайдер молчит — звонок идёт
    // без них, задерживать разговор ради «угу» бессмысленно.
    this.backchannel = new Backchannel(ctx, this.deps.voice, this.deps.style, this.deps.direction)
    void this.backchannel.prepare()

    const stopRing = await this.telephony.ring()
    await wait(3200)
    if (this.closed) return
    stopRing()
    await this.telephony.pickupClick()
    void this.telephony.startAmbience()

    this.startPreview()

    // Брокер снимает трубку и говорит первым — как в жизни.
    this.messages = [{ role: 'assistant', content: this.deps.opening }]
    await this.speak(this.deps.opening)
  }

  disconnect(): void {
    this.closed = true
    this.abort?.abort()
    this.stopPreview()
    this.stopPlayback(false)
    this.vad.stop()
    void this.telephony.hangUp()
    window.setTimeout(() => this.telephony.dispose(), 1200)
  }

  getMicStream(): MediaStream | null {
    return this.vad.getStream()
  }

  /** Заглушить брокера немедленно. Это и есть перебивание. */
  interrupt(): void {
    this.stopPlayback(true)
  }

  // ── Речь студента ─────────────────────────────────────────────────────────

  private handleSpeechStart(): void {
    this.deps.emit({ type: 'user_speech_start' })
    // Заговорил поверх брокера — брокер замолкает на полуслове, как человек.
    if (this.currentUtterance) this.interrupt()
  }

  private async handleSpeechEnd(audio: Float32Array): Promise<void> {
    if (this.closed) return

    if (durationSeconds(audio) < 0.35) {
      this.deps.emit({ type: 'user_dropped', reason: 'too_short' })
      return
    }

    // Отклик уходит в линию ПЕРВЫМ делом, до распознавания. Пока он звучит,
    // успевают отработать и Whisper, и модель — паузы студент не слышит.
    const line = this.telephony.getLineInput()
    if (line) this.backchannel?.ack(line)

    const startedAt = performance.now()
    this.vad.setPaused(true)
    try {
      const text = await this.transcribe(audio)
      if (!text) {
        this.deps.emit({ type: 'user_dropped', reason: 'empty' })
        return
      }
      if (looksNonEnglish(text)) {
        this.deps.emit({ type: 'user_dropped', reason: 'not_english' })
        return
      }

      const clean = normalizeTranscript(text)
      this.deps.emit({ type: 'user_final', text: clean })
      this.messages.push({ role: 'user', content: clean })
      await this.runTurn()
      // Реальная пауза между «договорил» и «брокер заговорил» — в разбор
      // звонка. Без числа «стало живее» остаётся ощущением.
      this.turnLatencies.push(performance.now() - startedAt)
    } catch (e) {
      this.deps.emit({
        type: 'error',
        message: `error.sttFailed:${(e as Error).message}`,
        fatal: false,
      })
    } finally {
      this.vad.setPaused(false)
    }
  }

  private async transcribe(audio: Float32Array): Promise<string> {
    const form = new FormData()
    form.append('file', encodeWav(audio), 'speech.wav')
    form.append('model', 'whisper-large-v3-turbo')
    form.append('language', 'en')
    form.append('prompt', WHISPER_PROMPT)
    form.append('response_format', 'text')
    form.append('temperature', '0')

    const r = await fetch(endpoint('stt'), { method: 'POST', body: form })
    // Тело ответа несёт причину. Раньше оно отбрасывалось, и на экране
    // оставался голый код — по нему нельзя было понять ничего.
    if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 200)}`)
    return (await r.text()).trim()
  }

  // ── Ход брокера ───────────────────────────────────────────────────────────

  private async runTurn(): Promise<void> {
    if (this.busy) return
    this.busy = true
    this.deps.emit({ type: 'agent_thinking', active: true })

    try {
      // Модель может дёрнуть несколько инструментов подряд (проверить MC, потом
      // открыть груз). Ограничение нужно, чтобы кривой ответ не закрутил цикл.
      for (let hop = 0; hop < 5; hop++) {
        const reply = await this.requestTurn()
        if (this.closed) return

        if (reply.message) this.messages.push(reply.message)

        if (reply.toolCalls.length > 0) {
          this.scheduleHold()
          for (const call of reply.toolCalls) {
            this.deps.emit({ type: 'tool_start', id: call.id, name: call.name, args: call.arguments })
            const result = this.deps.runTool(call.name, call.arguments)
            this.deps.emit({ type: 'tool_end', id: call.id, name: call.name, result })
            this.messages.push({
              role: 'tool',
              tool_call_id: call.id,
              content: JSON.stringify(result),
            })
          }
          // Инструменты отработали — брокеру есть что сказать, идём на новый круг.
          continue
        }

        this.cancelHold()
        if (reply.content.trim()) await this.speak(reply.content.trim())
        return
      }
      this.deps.emit({ type: 'error', message: 'error.llmFailed:tool loop', fatal: false })
    } catch (e) {
      this.deps.emit({
        type: 'error',
        message: `error.llmFailed:${(e as Error).message}`,
        fatal: false,
      })
    } finally {
      this.cancelHold()
      this.busy = false
      this.deps.emit({ type: 'agent_thinking', active: false })
    }
  }

  private async requestTurn(): Promise<TurnReply> {
    this.abort?.abort()
    this.abort = new AbortController()

    const r = await fetch(endpoint('turn'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: this.abort.signal,
      body: JSON.stringify({ scenarioId: this.deps.scenarioId, messages: this.messages }),
    })
    if (!r.ok) {
      // Сервер кладёт сюда дословный ответ провайдера — единственное, что
      // объясняет отказ. «LLM 502» без него не говорит ни о чём.
      const detail = await r.text().catch(() => '')
      throw new Error(`${r.status} ${extractError(detail).slice(0, 220)}`)
    }
    return (await r.json()) as TurnReply
  }

  /**
   * Музыка ожидания включается не сразу: быстрый инструмент отработает за
   * полсекунды, и врубать hold ради этого — хуже, чем промолчать.
   */
  private scheduleHold(): void {
    if (this.holdTimer !== null) return

    // Сначала брокер говорит вслух, что смотрит — так делает живой человек.
    // Музыка ожидания включается только если он копается дольше отклика:
    // включать её сразу значит превращать полусекундную задержку в «вас
    // поставили на удержание».
    const line = this.telephony.getLineInput()
    const spokenMs = line ? (this.backchannel?.filler(line) ?? 0) : 0

    this.holdTimer = window.setTimeout(
      () => void this.telephony.startHold(),
      Math.max(900, spokenMs + 600),
    )
  }

  private cancelHold(): void {
    if (this.holdTimer !== null) {
      clearTimeout(this.holdTimer)
      this.holdTimer = null
    }
    this.telephony.stopHold()
  }

  // ── Голос брокера ─────────────────────────────────────────────────────────

  /**
   * Три ступени: Groq Orpheus → голос браузера → только текст.
   *
   * Раньше ступени было две, и падение провайдера означало немого брокера с
   * бегущей строкой. Именно так тренажёр и вёл себя на боевом: голос `zac` у
   * Groq не существует, каждый запрос отвечал 400, и звонок шёл беззвучно.
   */
  private async speak(text: string): Promise<void> {
    const ctx = await this.telephony.ensureContext()

    let buffer: AudioBuffer | null = null
    try {
      // В провайдер уходит текст с вокальной ремаркой, на экран — чистый.
      buffer = await ctx.decodeAudioData(
        await synthesize(text, this.deps.voice, this.deps.direction),
      )
    } catch (e) {
      // Причину показываем: раньше она уходила в консоль, и «почему молчит»
      // приходилось выяснять чтением исходников. Но один раз за звонок —
      // повторять её на каждой реплике значит превратить полезное сообщение
      // в шум, который перестают читать.
      if (!this.ttsReported) {
        this.ttsReported = true
        this.deps.emit({
          type: 'error',
          message: `error.ttsFailed:${(e as Error).message}`,
          fatal: false,
        })
      }
    }

    if (this.closed) return

    if (buffer) {
      await this.playBuffer(ctx, buffer, text)
      return
    }
    await this.playInBrowser(text)
  }

  private async playBuffer(ctx: AudioContext, buffer: AudioBuffer, text: string): Promise<void> {
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(this.telephony.getLineInput() ?? ctx.destination)

    const id = nextId()
    const durationMs = buffer.duration * 1000
    // Текст известен целиком ДО озвучки — экран раскрывает его по словам ровно
    // за длительность аудио, поэтому слова совпадают с голосом.
    this.deps.emit({ type: 'agent_utterance_start', id, text, durationMs })
    this.currentUtterance = { id, startedAt: performance.now(), durationMs }
    this.playing = source

    await new Promise<void>((resolve) => {
      source.onended = () => resolve()
      source.start()
      // Приостановленный контекст не шлёт onended, и звонок завис бы навсегда.
      // Страховка на четверть секунды длиннее самой реплики.
      window.setTimeout(resolve, durationMs + 250)
    })

    if (this.playing === source) this.finishUtterance(false)
  }

  private async playInBrowser(text: string): Promise<void> {
    const speech = speakInBrowser(text, this.deps.voice)
    const id = nextId()
    const durationMs = speech?.estimatedMs ?? estimateDurationMs(text)

    this.deps.emit({ type: 'agent_utterance_start', id, text, durationMs })
    this.currentUtterance = { id, startedAt: performance.now(), durationMs }
    this.browserSpeech = speech

    if (speech) await Promise.race([speech.done, wait(durationMs + 4000)])
    else await wait(durationMs)

    this.browserSpeech = null
    this.finishUtterance(false)
  }

  /** Средняя пауза между «студент договорил» и «брокер заговорил», в мс. */
  getAverageLatencyMs(): number {
    if (this.turnLatencies.length === 0) return 0
    const sum = this.turnLatencies.reduce((a, b) => a + b, 0)
    return Math.round(sum / this.turnLatencies.length)
  }

  private stopPlayback(interrupted: boolean): void {
    // Перебивание должно затыкать и запасной голос — иначе браузер продолжит
    // договаривать реплику поверх студента.
    if (this.browserSpeech) {
      this.browserSpeech.cancel()
      this.browserSpeech = null
    }
    if (this.playing) {
      try {
        this.playing.onended = null
        this.playing.stop()
      } catch {
        /* уже остановлен */
      }
      this.playing = null
    }
    this.finishUtterance(interrupted)
  }

  private finishUtterance(interrupted: boolean): void {
    const current = this.currentUtterance
    if (!current) return
    this.currentUtterance = null
    this.playing = null
    const spokenRatio = interrupted
      ? Math.min(1, (performance.now() - current.startedAt) / current.durationMs)
      : 1
    this.deps.emit({ type: 'agent_utterance_end', id: current.id, interrupted, spokenRatio })
  }

  // ── Мгновенный черновик своих слов ────────────────────────────────────────

  /**
   * Web Speech API рядом с Whisper. Он менее точен, зато выдаёт слова прямо во
   * время речи — на экране текст появляется без задержки, а через секунду
   * бесшовно заменяется точным результатом Whisper.
   */
  private startPreview(): void {
    const Ctor =
      (window as WindowWithSpeech).SpeechRecognition ??
      (window as WindowWithSpeech).webkitSpeechRecognition
    if (!Ctor) return

    try {
      const recognition = new Ctor()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result && !result.isFinal) interim += result[0]?.transcript ?? ''
        }
        if (interim.trim()) this.deps.emit({ type: 'user_partial', text: interim.trim() })
      }
      // Браузер сам останавливает распознавание — поднимаем обратно, пока идёт звонок.
      recognition.onend = () => {
        if (!this.closed) {
          try {
            recognition.start()
          } catch {
            /* уже запущен */
          }
        }
      }
      recognition.onerror = () => undefined
      recognition.start()
      this.preview = recognition
    } catch {
      // Черновик — приятное дополнение, а не необходимость.
    }
  }

  private stopPreview(): void {
    if (!this.preview) return
    try {
      this.preview.onend = null
      this.preview.stop()
    } catch {
      /* всё равно закрываем */
    }
    this.preview = null
  }
}

// ── Вспомогательное ─────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant' | 'tool' | 'system'
  content: string
  tool_call_id?: string
  tool_calls?: unknown[]
}

interface TurnReply {
  provider: string
  message?: ChatMessage
  content: string
  toolCalls: { id: string; name: string; arguments: unknown }[]
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

let counter = 0
function nextId(): string {
  return `u${++counter}`
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}


interface SpeechRecognitionLike {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: ((event: unknown) => void) | null
  start(): void
  stop(): void
}

interface SpeechRecognitionEventLike {
  resultIndex: number
  results: ArrayLike<{ isFinal: boolean; 0?: { transcript: string } }>
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: new () => SpeechRecognitionLike
  webkitSpeechRecognition?: new () => SpeechRecognitionLike
}

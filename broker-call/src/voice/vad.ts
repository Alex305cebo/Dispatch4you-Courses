import { EnergyDetector } from './energyDetector'
import { TARGET_SAMPLE_RATE, resample, rms } from './audio'

/**
 * Микрофон, открытый на весь звонок, и детектор границ речи над ним.
 *
 * Кнопки микрофона нет — это и есть смысл всей затеи. Никаких «зажми и говори»,
 * никаких «отправить»: студент говорит, детектор понимает где фраза кончилась.
 */
export interface VadCallbacks {
  /** Человек заговорил. Момент, когда надо глушить брокера. */
  onSpeechStart(): void
  /** Фраза закончилась — вот её звук в 16 кГц моно. */
  onSpeechEnd(audio: Float32Array): void
  /** Текущая громкость 0..1 — для живой волны на экране. */
  onLevel(level: number): void
  /**
   * Каждый кадр 16 кГц по мере поступления — для транспортов, которые гонят
   * звук потоком и режут паузы на своей стороне. Пайплайну не нужен, поэтому
   * необязателен.
   */
  onFrame?(frame: Float32Array): void
  /** Фраза кончилась по нашему детектору — момент отсчёта паузы. */
  onSilence?(): void
}

// Кадр 512 отсчётов при 16 кГц ≈ 32 мс — совпадает с frameMs детектора.
const FRAME_SAMPLES = 512
// Секунда до начала фразы: люди начинают говорить чуть раньше, чем детектор
// уверенно срабатывает, и без этого запаса срезается первое слово.
const PREROLL_MS = 300

const WORKLET_SOURCE = `
class TapProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const channel = inputs[0] && inputs[0][0]
    if (channel && channel.length) this.port.postMessage(channel.slice(0))
    return true
  }
}
registerProcessor('mic-tap', TapProcessor)
`

export class MicVad {
  private stream: MediaStream | null = null
  private context: AudioContext | null = null
  private node: AudioWorkletNode | ScriptProcessorNode | null = null
  private source: MediaStreamAudioSourceNode | null = null
  private readonly detector = new EnergyDetector()
  private readonly callbacks: VadCallbacks

  /** Копится, пока человек говорит; в начале лежит преролл. */
  private speech: Float32Array[] = []
  private preroll: Float32Array[] = []
  private prerollSamples = 0
  private collecting = false
  /** На паузе детектор продолжает слушать, но фразы не собирает. */
  private paused = false
  private carry = new Float32Array(0)

  constructor(callbacks: VadCallbacks) {
    this.callbacks = callbacks
  }

  async start(): Promise<MediaStream> {
    // echoCancellation обязателен: без него голос брокера из динамика влетает
    // обратно в микрофон, и детектор считает его речью студента.
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })

    this.context = new AudioContext()
    if (this.context.state === 'suspended') await this.context.resume()
    this.source = this.context.createMediaStreamSource(this.stream)

    try {
      const url = URL.createObjectURL(new Blob([WORKLET_SOURCE], { type: 'application/javascript' }))
      await this.context.audioWorklet.addModule(url)
      URL.revokeObjectURL(url)
      const node = new AudioWorkletNode(this.context, 'mic-tap')
      node.port.onmessage = (e: MessageEvent<Float32Array>) => this.consume(e.data)
      this.node = node
    } catch {
      // Старая мобильная Safari без AudioWorklet — ScriptProcessor устарел,
      // но работает везде, а звонок без микрофона не работает вообще.
      const node = this.context.createScriptProcessor(2048, 1, 1)
      node.onaudioprocess = (e) => this.consume(new Float32Array(e.inputBuffer.getChannelData(0)))
      this.node = node
      // ScriptProcessor не тикает, пока не подключён к выходу; громкость нулевая,
      // чтобы микрофон не пошёл обратно в динамики.
      const silence = this.context.createGain()
      silence.gain.value = 0
      node.connect(silence)
      silence.connect(this.context.destination)
    }

    this.source.connect(this.node)
    return this.stream
  }

  /** Пока брокер говорит, фразы не собираем — но громкость и старт речи ловим. */
  setPaused(paused: boolean): void {
    this.paused = paused
    if (paused) {
      this.collecting = false
      this.speech = []
    }
  }

  stop(): void {
    this.node?.disconnect()
    this.source?.disconnect()
    this.stream?.getTracks().forEach((t) => t.stop())
    void this.context?.close()
    this.node = null
    this.source = null
    this.stream = null
    this.context = null
  }

  getStream(): MediaStream | null {
    return this.stream
  }

  /** Приводит кадры к 16 кГц и режет ровно на FRAME_SAMPLES. */
  private consume(chunk: Float32Array): void {
    const rate = this.context?.sampleRate ?? TARGET_SAMPLE_RATE
    const resampled = resample(chunk, rate, TARGET_SAMPLE_RATE)

    const merged = new Float32Array(this.carry.length + resampled.length)
    merged.set(this.carry, 0)
    merged.set(resampled, this.carry.length)

    let offset = 0
    while (merged.length - offset >= FRAME_SAMPLES) {
      this.handleFrame(merged.subarray(offset, offset + FRAME_SAMPLES))
      offset += FRAME_SAMPLES
    }
    this.carry = merged.slice(offset)
  }

  private handleFrame(frame: Float32Array): void {
    const level = rms(frame)
    this.callbacks.onLevel(Math.min(1, level * 8))
    this.callbacks.onFrame?.(frame)

    const signal = this.detector.push(level)
    if (signal === 'end') this.callbacks.onSilence?.()

    if (this.collecting) this.speech.push(new Float32Array(frame))
    else this.pushPreroll(frame)

    if (signal === 'start') {
      this.callbacks.onSpeechStart()
      if (!this.paused) {
        this.collecting = true
        this.speech = [...this.preroll, new Float32Array(frame)]
      }
      return
    }

    if (signal === 'end' && this.collecting) {
      this.collecting = false
      const audio = concat(this.speech)
      this.speech = []
      this.preroll = []
      this.prerollSamples = 0
      this.callbacks.onSpeechEnd(audio)
    }
  }

  private pushPreroll(frame: Float32Array): void {
    const limit = (PREROLL_MS / 1000) * TARGET_SAMPLE_RATE
    this.preroll.push(new Float32Array(frame))
    this.prerollSamples += frame.length
    while (this.prerollSamples > limit && this.preroll.length > 1) {
      this.prerollSamples -= this.preroll.shift()!.length
    }
  }
}

function concat(chunks: Float32Array[]): Float32Array {
  const total = chunks.reduce((sum, c) => sum + c.length, 0)
  const out = new Float32Array(total)
  let offset = 0
  for (const chunk of chunks) {
    out.set(chunk, offset)
    offset += chunk.length
  }
  return out
}

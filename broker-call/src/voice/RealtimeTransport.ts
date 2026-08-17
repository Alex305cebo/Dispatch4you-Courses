import { PICKUP_CUE, type TransportDeps, type VoiceTransport } from './types'
import { TelephonyAudio } from './TelephonyAudio'
import { endpoint } from '../api'

/**
 * Платный транспорт: OpenAI Realtime по WebRTC.
 *
 * Именно так устроены настоящие AI-брокеры вроде тех, что стоят у Axle
 * Logistics: речь идёт в модель и обратно потоком, без промежуточной остановки
 * на распознавание и синтез. Отсюда задержка 300–800 мс вместо 800–1500 и
 * перебивание, которое не нужно программировать — оно встроено.
 *
 * Ключ в браузер не попадает: сервер выдаёт эфемерный client secret, живущий
 * около минуты, и вместе с ним прошивает системный промпт и схемы
 * инструментов на своей стороне.
 *
 * Включается флагом BROKER_CALL_TRANSPORT=realtime, когда появится ключ.
 */
export class RealtimeTransport implements VoiceTransport {
  private readonly deps: TransportDeps
  private readonly telephony = new TelephonyAudio()
  private pc: RTCPeerConnection | null = null
  private channel: RTCDataChannel | null = null
  private mic: MediaStream | null = null
  private currentId: string | null = null
  private closed = false

  onLevel: ((level: number) => void) | null = null

  constructor(deps: TransportDeps) {
    this.deps = deps
  }

  async connect(): Promise<void> {
    const secret = await this.mintSecret()
    await this.telephony.ensureContext()

    this.mic = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    })

    const pc = new RTCPeerConnection()
    this.pc = pc

    for (const track of this.mic.getAudioTracks()) pc.addTrack(track, this.mic)

    // Голос модели прогоняем через телефонный фильтр — без него он звучит как
    // диктор в наушниках, а не как человек в трубке.
    pc.ontrack = (event) => {
      const stream = event.streams[0]
      if (!stream) return
      void this.routeThroughLine(stream)
    }

    const channel = pc.createDataChannel('oai-events')
    this.channel = channel
    channel.onmessage = (e: MessageEvent<string>) => this.handleEvent(e.data)

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    const model = 'gpt-realtime-mini'
    const r = await fetch(`https://api.openai.com/v1/realtime/calls?model=${model}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/sdp' },
      body: offer.sdp ?? '',
    })
    if (!r.ok) throw new Error(`Realtime handshake ${r.status}`)

    await pc.setRemoteDescription({ type: 'answer', sdp: await r.text() })

    const stopRing = await this.telephony.ring()
    await new Promise((resolve) => window.setTimeout(resolve, 2400))
    stopRing()
    await this.telephony.pickupClick()

    // Брокер снимает трубку и говорит первым — своими словами.
    this.send({ type: 'response.create', response: { instructions: PICKUP_CUE } })
  }

  disconnect(): void {
    this.closed = true
    this.channel?.close()
    this.pc?.close()
    this.mic?.getTracks().forEach((t) => t.stop())
    this.channel = null
    this.pc = null
    this.mic = null
    void this.telephony.hangUp()
    window.setTimeout(() => this.telephony.dispose(), 1200)
  }

  getMicStream(): MediaStream | null {
    return this.mic
  }

  /** Realtime обрывает ответ сам по semantic_vad; это ручной дубль. */
  interrupt(): void {
    this.send({ type: 'response.cancel' })
  }

  private async mintSecret(): Promise<string> {
    const r = await fetch(endpoint('realtime-session'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seed: this.deps.seed, voice: this.deps.voice }),
    })
    if (!r.ok) throw new Error(`realtime-session ${r.status}`)
    const data = (await r.json()) as { value?: string; client_secret?: { value?: string } }
    const secret = data.value ?? data.client_secret?.value
    if (!secret) throw new Error('realtime-session returned no client secret')
    return secret
  }

  private async routeThroughLine(stream: MediaStream): Promise<void> {
    const ctx = await this.telephony.ensureContext()
    const source = ctx.createMediaStreamSource(stream)
    source.connect(this.telephony.getLineInput() ?? ctx.destination)

    // Некоторые браузеры не гонят удалённый трек, пока он не привязан к
    // <audio>. Элемент немой — звук идёт через Web Audio.
    const sink = document.createElement('audio')
    sink.srcObject = stream
    sink.muted = true
    sink.autoplay = true
    void sink.play().catch(() => undefined)
  }

  private send(payload: unknown): void {
    if (this.channel?.readyState === 'open') this.channel.send(JSON.stringify(payload))
  }

  private handleEvent(raw: string): void {
    if (this.closed) return

    let event: RealtimeEvent
    try {
      event = JSON.parse(raw) as RealtimeEvent
    } catch {
      return
    }

    switch (event.type) {
      case 'input_audio_buffer.speech_started':
        this.deps.emit({ type: 'user_speech_start' })
        break

      case 'conversation.item.input_audio_transcription.completed':
        if (event.transcript) this.deps.emit({ type: 'user_final', text: event.transcript.trim() })
        break

      case 'response.output_audio_transcript.delta':
      case 'response.audio_transcript.delta': {
        // Первая дельта открывает реплику; длительность неизвестна, поэтому
        // проявление слов делает сам поток.
        if (!this.currentId) {
          this.currentId = event.response_id ?? `r${Date.now()}`
          this.deps.emit({
            type: 'agent_utterance_start',
            id: this.currentId,
            text: '',
            durationMs: 0,
          })
        }
        if (event.delta) {
          this.deps.emit({ type: 'agent_text_delta', id: this.currentId, delta: event.delta })
        }
        break
      }

      case 'response.output_audio_transcript.done':
      case 'response.audio_transcript.done':
        if (this.currentId) {
          this.deps.emit({
            type: 'agent_utterance_end',
            id: this.currentId,
            interrupted: false,
            spokenRatio: 1,
          })
          this.currentId = null
        }
        break

      case 'response.function_call_arguments.done': {
        const name = event.name ?? ''
        const callId = event.call_id ?? `c${Date.now()}`
        let args: unknown = {}
        try {
          args = event.arguments ? JSON.parse(event.arguments) : {}
        } catch {
          args = {}
        }

        this.deps.emit({ type: 'tool_start', id: callId, name, args })
        const result = this.deps.runTool(name, args)
        this.deps.emit({ type: 'tool_end', id: callId, name, result })

        this.send({
          type: 'conversation.item.create',
          item: {
            type: 'function_call_output',
            call_id: callId,
            output: JSON.stringify(result),
          },
        })
        // Результат сам по себе брокера не разговорит — просим продолжить.
        this.send({ type: 'response.create' })
        break
      }

      case 'error':
        this.deps.emit({
          type: 'error',
          message: event.error?.message ?? 'realtime error',
          fatal: false,
        })
        break
    }
  }
}

interface RealtimeEvent {
  type: string
  transcript?: string
  delta?: string
  response_id?: string
  name?: string
  call_id?: string
  arguments?: string
  error?: { message?: string }
}

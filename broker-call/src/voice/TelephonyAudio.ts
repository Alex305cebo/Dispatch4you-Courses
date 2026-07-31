/**
 * Звук телефонной линии.
 *
 * Всё синтезируется на месте — ни одного аудиофайла в проекте. Частоты взяты
 * настоящие, североамериканские: ringback 440+480 Гц, busy 480+620 Гц,
 * dial tone 350+440 Гц. Именно они делают звонок узнаваемым, даже когда
 * человек не может объяснить, почему это звучит «как телефон».
 *
 * Голос брокера идёт через полосовой фильтр 300–3400 Гц — полоса обычного
 * телефонного канала. Это единственная причина, по которой синтезированная
 * речь перестаёт звучать как диктор в наушниках и начинает — как человек в трубке.
 */
import { getSharedAudioContext } from './audioUnlock'

export class TelephonyAudio {
  private ctx: AudioContext | null = null
  private ringTimer: number | null = null
  private holdNodes: AudioNode[] = []
  private ambienceNodes: AudioNode[] = []
  /** Общий выход для «того, что в трубке» — фильтруется целиком. */
  private lineOut: GainNode | null = null

  async ensureContext(): Promise<AudioContext> {
    if (!this.ctx) {
      // Берём общий контекст, разблокированный жестом в момент нажатия
      // «Ответить». Свой собственный пришлось бы разблокировать отдельно, а
      // жеста к этому моменту уже нет — на iOS он остался бы немым.
      this.ctx = getSharedAudioContext()
      this.lineOut = this.ctx.createGain()
      this.lineOut.gain.value = 1

      // Полоса телефонного канала.
      const highpass = this.ctx.createBiquadFilter()
      highpass.type = 'highpass'
      highpass.frequency.value = 300
      const lowpass = this.ctx.createBiquadFilter()
      lowpass.type = 'lowpass'
      lowpass.frequency.value = 3400
      // Лёгкий подъём в разборчивости — так делает любая телефонная сеть.
      const presence = this.ctx.createBiquadFilter()
      presence.type = 'peaking'
      presence.frequency.value = 1800
      presence.Q.value = 0.8
      presence.gain.value = 4
      // Компрессор: в трубке нет тихих и громких мест, всё выровнено.
      const comp = this.ctx.createDynamicsCompressor()
      comp.threshold.value = -26
      comp.ratio.value = 6
      comp.attack.value = 0.004
      comp.release.value = 0.18

      this.lineOut.connect(highpass)
      highpass.connect(lowpass)
      lowpass.connect(presence)
      presence.connect(comp)
      comp.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume()
    return this.ctx
  }

  /** Куда подключать голос брокера, чтобы он звучал из трубки. */
  getLineInput(): GainNode | null {
    return this.lineOut
  }

  /** Гудки вызова. Возвращает функцию остановки. */
  async ring(): Promise<() => void> {
    const ctx = await this.ensureContext()
    let stopped = false

    const burst = () => {
      if (stopped) return
      this.tone(ctx, [440, 480], 2.0, 0.09)
      this.ringTimer = window.setTimeout(burst, 6000) // 2 с гудок + 4 с пауза
    }
    burst()

    return () => {
      stopped = true
      if (this.ringTimer !== null) {
        clearTimeout(this.ringTimer)
        this.ringTimer = null
      }
    }
  }

  /** Короткий щелчок снятия трубки — граница между «звонит» и «говорим». */
  async pickupClick(): Promise<void> {
    const ctx = await this.ensureContext()
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      // Затухающий шум — звук механического контакта.
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.12)) * 0.35
    }
    const src = ctx.createBufferSource()
    src.buffer = buffer
    src.connect(this.lineOut ?? ctx.destination)
    src.start()
  }

  /** Отбой: два коротких busy-гудка. */
  async hangUp(): Promise<void> {
    const ctx = await this.ensureContext()
    this.stopHold()
    this.stopAmbience()
    this.tone(ctx, [480, 620], 0.35, 0.08)
    window.setTimeout(() => this.tone(ctx, [480, 620], 0.35, 0.08), 500)
  }

  /**
   * Музыка ожидания. Играет, пока брокер «смотрит в системе» — то есть пока
   * выполняется инструмент. Техническая задержка превращается в реализм
   * вместо неловкой тишины.
   */
  async startHold(): Promise<void> {
    const ctx = await this.ensureContext()
    if (this.holdNodes.length) return

    const gain = ctx.createGain()
    gain.gain.value = 0.05
    gain.connect(this.lineOut ?? ctx.destination)

    // Простая петля из трёх нот — ровно настолько убогая, насколько бывает
    // настоящая музыка ожидания.
    const melody = [392, 440, 523.25, 440]
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    const now = ctx.currentTime
    melody.forEach((freq, i) => {
      osc.frequency.setValueAtTime(freq, now + i * 0.6)
    })
    // Зацикливаем вручную: повторяем последовательность вперёд на минуту.
    for (let loop = 1; loop < 25; loop++) {
      melody.forEach((freq, i) => {
        osc.frequency.setValueAtTime(freq, now + loop * melody.length * 0.6 + i * 0.6)
      })
    }
    osc.connect(gain)
    osc.start()
    this.holdNodes = [osc, gain]
  }

  stopHold(): void {
    for (const node of this.holdNodes) {
      if (node instanceof OscillatorNode) {
        try {
          node.stop()
        } catch {
          /* уже остановлен */
        }
      }
      node.disconnect()
    }
    this.holdNodes = []
  }

  /** Еле слышный гул офиса на фоне — брокер сидит не в вакууме. */
  async startAmbience(): Promise<void> {
    const ctx = await this.ensureContext()
    if (this.ambienceNodes.length) return

    const seconds = 4
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let last = 0
    for (let i = 0; i < data.length; i++) {
      // Розовый шум через простой фильтр первого порядка: белый шум звучит
      // как шипение, розовый — как помещение.
      const white = Math.random() * 2 - 1
      last = 0.98 * last + 0.02 * white
      data[i] = last * 3
    }

    const src = ctx.createBufferSource()
    src.buffer = buffer
    src.loop = true

    const band = ctx.createBiquadFilter()
    band.type = 'bandpass'
    band.frequency.value = 900
    band.Q.value = 0.6

    const gain = ctx.createGain()
    gain.gain.value = 0.012

    src.connect(band)
    band.connect(gain)
    gain.connect(this.lineOut ?? ctx.destination)
    src.start()
    this.ambienceNodes = [src, band, gain]
  }

  stopAmbience(): void {
    for (const node of this.ambienceNodes) {
      if (node instanceof AudioBufferSourceNode) {
        try {
          node.stop()
        } catch {
          /* уже остановлен */
        }
      }
      node.disconnect()
    }
    this.ambienceNodes = []
  }

  dispose(): void {
    this.stopHold()
    this.stopAmbience()
    if (this.ringTimer !== null) clearTimeout(this.ringTimer)
    // Контекст общий на всю страницу и разблокирован жестом — закрыть его
    // значит остаться без звука до перезагрузки. Отпускаем только свои узлы.
    this.lineOut?.disconnect()
    this.ctx = null
    this.lineOut = null
  }

  /** Сумма синусов с мягкими фронтами — щелчков на краях быть не должно. */
  private tone(ctx: AudioContext, freqs: number[], seconds: number, volume: number): void {
    const gain = ctx.createGain()
    const now = ctx.currentTime
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume, now + 0.02)
    gain.gain.setValueAtTime(volume, now + seconds - 0.03)
    gain.gain.linearRampToValueAtTime(0, now + seconds)
    gain.connect(this.lineOut ?? ctx.destination)

    for (const freq of freqs) {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      osc.connect(gain)
      osc.start(now)
      osc.stop(now + seconds)
    }
  }
}


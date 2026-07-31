/**
 * Энергетический детектор речи.
 *
 * Задача — понять, когда студент начал и когда закончил говорить, чтобы у него
 * не было кнопки «отправить». Старая версия ждала фиксированные 2.5 секунды
 * тишины и резала фразу на середине задумчивости.
 *
 * Здесь порог не константа, а уровень шума в комнате: детектор постоянно
 * подстраивается под фон, поэтому одинаково работает в тишине и на кухне.
 *
 * Это запасной путь. Основной — Silero (см. vad.ts); если он не загрузился,
 * звонок продолжает работать на этом.
 */
export interface EnergyDetectorOptions {
  /** Длительность одного кадра в миллисекундах. */
  frameMs: number
  /** Во сколько раз громче фона должен быть звук, чтобы считаться речью. */
  startFactor: number
  /** Ниже этого множителя фона речь считается закончившейся. */
  endFactor: number
  /** Сколько кадров подряд должно быть громко, чтобы не ловить щелчки. */
  attackFrames: number
  /** Пауза внутри фразы, которую детектор прощает — человек думает, а не закончил. */
  hangoverMs: number
  /** Короче этого речь не считается речью. */
  minSpeechMs: number
  /** Абсолютный пол: в полной тишине фон не должен уползти в ноль. */
  floorFloor: number
  /**
   * Окно калибровки при старте. Пока оно не прошло, детектор только слушает
   * комнату и молчит. Без него звонок из шумного места начинался с того, что
   * фон принимался за речь — микрофон открывается раньше, чем человек заговорит.
   */
  warmupMs: number
}

export const DEFAULT_ENERGY_OPTIONS: EnergyDetectorOptions = {
  frameMs: 32,
  startFactor: 3.2,
  endFactor: 1.8,
  attackFrames: 2,
  // 700 мс: короче — режем людей на середине фразы, длиннее — брокер начинает
  // отвечать с заметным опозданием и разговор перестаёт быть похожим на звонок.
  hangoverMs: 700,
  minSpeechMs: 320,
  floorFloor: 0.0015,
  warmupMs: 500,
}

export type DetectorSignal = 'start' | 'end' | null

export class EnergyDetector {
  private readonly opts: EnergyDetectorOptions
  private noiseFloor: number
  private speaking = false
  private loudFrames = 0
  private quietMs = 0
  private speechMs = 0
  private elapsedMs = 0

  constructor(options: Partial<EnergyDetectorOptions> = {}) {
    this.opts = { ...DEFAULT_ENERGY_OPTIONS, ...options }
    this.noiseFloor = this.opts.floorFloor
  }

  /** Скармливаем громкость кадра, получаем событие границы речи. */
  push(level: number): DetectorSignal {
    const {
      frameMs,
      startFactor,
      endFactor,
      attackFrames,
      hangoverMs,
      minSpeechMs,
      floorFloor,
      warmupMs,
    } = this.opts

    this.elapsedMs += frameMs

    // Калибровка: быстро подтягиваем фон к реальному уровню комнаты и молчим.
    if (this.elapsedMs <= warmupMs) {
      this.noiseFloor = Math.max(floorFloor, this.noiseFloor * 0.65 + level * 0.35)
      return null
    }

    if (!this.speaking) {
      // Фон подтягивается к текущему уровню медленно вверх и быстро вниз:
      // так внезапный шум не поднимает порог навсегда, а наступившая тишина
      // возвращает чувствительность почти сразу.
      const rate = level > this.noiseFloor ? 0.02 : 0.2
      this.noiseFloor = Math.max(floorFloor, this.noiseFloor * (1 - rate) + level * rate)
    }

    const startThreshold = this.noiseFloor * startFactor
    const endThreshold = this.noiseFloor * endFactor

    if (!this.speaking) {
      if (level > startThreshold) {
        this.loudFrames++
        if (this.loudFrames >= attackFrames) {
          this.speaking = true
          this.loudFrames = 0
          this.quietMs = 0
          this.speechMs = attackFrames * frameMs
          return 'start'
        }
      } else {
        this.loudFrames = 0
      }
      return null
    }

    this.speechMs += frameMs
    if (level > endThreshold) {
      this.quietMs = 0
      return null
    }

    this.quietMs += frameMs
    if (this.quietMs < hangoverMs) return null

    this.speaking = false
    this.loudFrames = 0
    const spoken = this.speechMs - this.quietMs
    this.speechMs = 0
    this.quietMs = 0
    // Слишком коротко — это был не человек, а хлопок двери или щелчок мыши.
    return spoken >= minSpeechMs ? 'end' : null
  }

  get isSpeaking(): boolean {
    return this.speaking
  }

  /** Оценка фона — удобно показывать в отладке, когда микрофон «не слышит». */
  get floor(): number {
    return this.noiseFloor
  }

  reset(): void {
    this.speaking = false
    this.loudFrames = 0
    this.quietMs = 0
    this.speechMs = 0
  }
}

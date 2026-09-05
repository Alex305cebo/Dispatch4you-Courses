import { describe, expect, it } from 'vitest'
import { DEFAULT_ENERGY_OPTIONS, EnergyDetector, type DetectorSignal } from './energyDetector'

const FRAME = DEFAULT_ENERGY_OPTIONS.frameMs

/** Прогоняет через детектор n кадров одной громкости, собирая события. */
function feed(d: EnergyDetector, level: number, ms: number): DetectorSignal[] {
  const events: DetectorSignal[] = []
  for (let t = 0; t < ms; t += FRAME) {
    const signal = d.push(level)
    if (signal) events.push(signal)
  }
  return events
}

/** Тишина, чтобы детектор нашёл уровень фона в комнате. */
function settle(d: EnergyDetector, noise = 0.004): void {
  feed(d, noise, 1500)
}

describe('EnergyDetector', () => {
  it('ловит начало речи и её конец после паузы', () => {
    const d = new EnergyDetector()
    settle(d)
    expect(feed(d, 0.05, 800)).toEqual(['start'])
    expect(feed(d, 0.004, 900)).toEqual(['end'])
  })

  it('не режет фразу на короткой задумчивости', () => {
    // Главная беда старой версии: пауза «эээ...» отправляла половину фразы.
    const d = new EnergyDetector()
    settle(d)
    feed(d, 0.05, 600)
    expect(feed(d, 0.004, DEFAULT_ENERGY_OPTIONS.hangoverMs - 100)).toEqual([])
    expect(feed(d, 0.05, 400)).toEqual([])
    expect(d.isSpeaking).toBe(true)
    expect(feed(d, 0.004, 900)).toEqual(['end'])
  })

  it('игнорирует щелчок — слишком короткий, чтобы быть речью', () => {
    const d = new EnergyDetector()
    settle(d)
    feed(d, 0.05, 64)
    expect(feed(d, 0.004, 900)).toEqual([])
  })

  it('подстраивается под шумную комнату и не считает фон речью', () => {
    const d = new EnergyDetector()
    settle(d, 0.02) // заметный фон: вентилятор, улица
    expect(feed(d, 0.02, 2000)).toEqual([])
    expect(feed(d, 0.2, 800)).toEqual(['start'])
  })

  it('в тишине не теряет чувствительность к тихому голосу', () => {
    const d = new EnergyDetector()
    settle(d, 0.0005) // тише абсолютного пола
    expect(feed(d, 0.01, 700)).toEqual(['start'])
  })

  it('переживает несколько фраз подряд', () => {
    const d = new EnergyDetector()
    settle(d)
    const all: DetectorSignal[] = []
    for (let i = 0; i < 3; i++) {
      all.push(...feed(d, 0.06, 700))
      all.push(...feed(d, 0.004, 900))
    }
    expect(all).toEqual(['start', 'end', 'start', 'end', 'start', 'end'])
  })

  it('укладывается в бюджет паузы — это самое медленное звено звонка', () => {
    // Пауза платится на каждой реплике. Если её тихо поднять «на всякий
    // случай», разговор снова станет похож на автоответчик, и заметить это
    // будет некому — поэтому граница закреплена тестом.
    // Верхняя граница — чтобы её не подняли обратно «с запасом».
    // Нижняя — чтобы не резало живую речь на куски: на 450 мс фразы рвались,
    // на 600 — тоже (живой звонок с сайта 05.09.2026: «текст не пишется
    // полностью»). 900 — пауза на неродном языке прощается.
    expect(DEFAULT_ENERGY_OPTIONS.hangoverMs).toBeLessThanOrEqual(1000)
    expect(DEFAULT_ENERGY_OPTIONS.hangoverMs).toBeGreaterThanOrEqual(800)

    const d = new EnergyDetector()
    settle(d)
    feed(d, 0.05, 700)
    // Речь обязана закончиться в пределах бюджета, а не когда-нибудь.
    expect(feed(d, 0.004, DEFAULT_ENERGY_OPTIONS.hangoverMs + FRAME * 2)).toEqual(['end'])
  })

  it('reset обрывает текущую речь', () => {
    const d = new EnergyDetector()
    settle(d)
    feed(d, 0.05, 500)
    expect(d.isSpeaking).toBe(true)
    d.reset()
    expect(d.isSpeaking).toBe(false)
  })
})

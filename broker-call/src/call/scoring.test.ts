import { describe, expect, it } from 'vitest'
import { CallMachine } from './CallMachine'
import { detectTerms, scoreCall } from './scoring'
import { makeCallSetup } from './makeCall'
import { CALL_SEEDS } from './seeds'

// Звонок собирается генератором, поэтому цифры не пишутся в тест руками —
// берутся из самого набора. Сид фиксированный, значит и цифры фиксированные.
const SETUP =
  CALL_SEEDS.map((seed) => makeCallSetup(seed)).find(
    (s) => s.load.maxRate > s.load.postedRate + 200,
  ) ?? makeCallSetup(CALL_SEEDS[0]!)

const POSTED = SETUP.load.postedRate
const MAX = SETUP.load.maxRate

function played(steps: (m: CallMachine) => void, text = '') {
  const m = new CallMachine(SETUP)
  m.start()
  steps(m)
  return scoreCall({ load: SETUP.load, state: m.getState(), dispatcherText: text })
}

describe('оценка звонка', () => {
  it('ставит ноль по открытию, если MC так и не прозвучал', () => {
    const metrics = played(() => undefined)
    expect(metrics.scores.opening).toBe(0)
    expect(metrics.goalsMissed).toContain('give_mc')
  })

  it('награждает за MC, названный в первых репликах', () => {
    const early = played((m) => {
      m.noteDispatcherTurn()
      m.execute('lookup_carrier', { mc_number: '445566' })
    })
    const late = played((m) => {
      for (let i = 0; i < 6; i++) m.noteDispatcherTurn()
      m.execute('lookup_carrier', { mc_number: '445566' })
    })
    expect(early.scores.opening!).toBeGreaterThan(late.scores.opening!)
  })

  it('десятка за торг, когда брокера дожали до потолка', () => {
    // С первой просьбы максимум не отдают — брокер контрит шагами, и до
    // потолка надо дойти. Это и проверяем: несколько раундов, затем согласие.
    const metrics = played((m) => {
      for (let round = 0; round < 12 && !m.getState().facts.agreedRate; round++) {
        m.execute('propose_rate', { amount: MAX })
      }
    })
    expect(metrics.agreedRate).toBe(MAX)
    expect(metrics.scores.negotiation).toBe(10)
    expect(metrics.leftOnTable).toBe(0)
  })

  it('на первую же просьбу о потолке брокер контрит, а не соглашается', () => {
    const m = new CallMachine(SETUP)
    m.start()
    const result = m.execute('propose_rate', { amount: MAX })
    expect(m.getState().facts.agreedRate).toBeNull()
    expect((result.data as { outcome: string }).outcome).toBe('counter')
  })

  it('считает, сколько денег осталось на столе', () => {
    const metrics = played((m) => {
      m.execute('propose_rate', { amount: POSTED }) // согласился на ставку с борда
    })
    expect(metrics.leftOnTable).toBe(MAX - POSTED)
    expect(metrics.scores.negotiation).toBe(4) // запас не тронут
  })

  it('оценивает все пять сторон звонка, а не выборку под сценарий', () => {
    // Раньше набор метрик зависел от целей сценария. Сценариев нет, работа
    // диспетчера одна и та же — значит и спрос одинаковый.
    const metrics = played(() => undefined)
    expect(Object.keys(metrics.scores).sort()).toEqual([
      'closing',
      'negotiation',
      'opening',
      'qualifying',
      'terminology',
    ])
  })

  it('растёт по закрытию по мере сбора данных', () => {
    const partial = played((m) => m.execute('record_booking_details', { driver_name: 'George' }))
    const full = played((m) => {
      m.execute('record_booking_details', {
        driver_name: 'George',
        truck_number: '482',
        trailer_number: '7719',
        driver_phone: '555-0142',
        email: 'ops@star.com',
      })
      m.execute('send_rate_con', { email: 'ops@star.com' })
    })
    expect(full.scores.closing!).toBeGreaterThan(partial.scores.closing!)
    expect(full.scores.closing).toBe(10)
  })

  it('одинаковый звонок даёт одинаковые баллы', () => {
    // Прошлая версия просила у модели баллы и получала каждый раз разные.
    const run = () =>
      played((m) => m.execute('propose_rate', { amount: POSTED + 50 }), 'MC 445566 dry van')
    expect(run()).toEqual(run())
  })

  it('общий балл — среднее применимых метрик, а не всех подряд', () => {
    const metrics = played((m) => {
      m.noteDispatcherTurn()
      m.execute('lookup_carrier', { mc_number: '445566' })
    })
    const values = Object.values(metrics.scores)
    const expected = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
    expect(metrics.overall).toBe(expected)
  })
})

describe('терминология', () => {
  it('видит профессиональный язык', () => {
    const terms = detectTerms(
      "This is Alex, MC 445566, we run 53-foot dry van. What's the all-in rate? DAT shows $2.05 per mile.",
    )
    expect(terms).toContain('MC number')
    expect(terms).toContain('dry van')
    expect(terms).toContain('all-in')
    expect(terms).toContain('DAT')
  })

  it('на пустой речи не выдумывает терминов', () => {
    expect(detectTerms('')).toEqual([])
    expect(detectTerms('uh, yeah, okay, sure thing')).toEqual([])
  })

  it('переводит количество терминов в балл', () => {
    const rich = played(
      () => undefined,
      'MC number, dry van, deadhead, all-in, rate con, detention, DAT',
    )
    const poor = played(() => undefined, 'yeah okay sure')
    expect(rich.scores.terminology!).toBeGreaterThan(poor.scores.terminology!)
  })
})

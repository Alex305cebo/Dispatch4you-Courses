import { describe, expect, it } from 'vitest'
import { callHints, currentHint, openingAsk, TRAINEE_MC } from './hints'
import { makeCallSetup } from './makeCall'
import { CALL_SEEDS } from './seeds'
import { CallMachine, parseEquipment } from './CallMachine'
import { lookupCarrier } from '../data/carriers'

const setup = makeCallSetup('hints-fixed-seed')

describe('подсказки диспетчеру', () => {
  it('до звонка все шаги открыты, первый — представиться', () => {
    const hints = callHints(setup, null)
    expect(hints.every((h) => !h.done)).toBe(true)
    expect(currentHint(hints)?.id).toBe('intro')
  })

  it('предложенный MC — живая запись FMCSA без блокера', () => {
    const rec = lookupCarrier(TRAINEE_MC)
    expect(rec).not.toBeNull()
    expect(rec!.authority).toBe('active')
    expect(rec!.blocker).toBeUndefined()
  })

  it('названный MC гасит первый шаг и переводит на следующий', () => {
    const machine = new CallMachine(setup)
    machine.execute('lookup_carrier', { mc_number: TRAINEE_MC })
    const hints = callHints(setup, machine.getState())
    expect(hints.find((h) => h.id === 'intro')!.done).toBe(true)
    expect(currentHint(hints)?.id).not.toBe('intro')
  })

  it('фраза про трейлер называет тот тип, который нужен грузу', () => {
    const say = callHints(setup, null).find((h) => h.id === 'equipment')!.say
    expect(say.toLowerCase()).toContain(setup.load.equipment.replace('_', ' '))
  })

  it('стартовая просьба выше и борда, и рынка — торговаться вниз, а не вверх', () => {
    const ask = openingAsk(setup.load)
    expect(ask).toBeGreaterThan(setup.load.postedRate)
    expect(ask).toBeGreaterThan(setup.load.marketRatePerMile * setup.load.miles)
  })
})

describe('слух брокера на отраслевые слова', () => {
  it.each([
    ['53 feet drive and', 'dry_van'],
    ['we run a driving', 'dry_van'],
    ['reaper', 'reefer'],
    ['refer unit', 'reefer'],
    ['step tech', 'step_deck'],
    ['flat', 'flatbed'],
  ])('«%s» распознаётся как %s', (said, expected) => {
    expect(parseEquipment(said)).toBe(expected)
  })

  it('невнятное по-прежнему остаётся невнятным', () => {
    expect(parseEquipment('uhh, the usual')).toBeNull()
  })
})

describe('подсказка не отстаёт от разговора', () => {
  it('показывает шаг по стадии, когда брокер перескочил вперёд', () => {
    // Живой звонок: брокер уже просил данные водителя и почту под rate con,
    // а на панели висело «торгуйтесь» — ставка формально не была записана.
    const hints = callHints(makeCallSetup('call-003'), null)
    expect(currentHint(hints)?.id).toBe('intro')
    expect(currentHint(hints, 'booking')?.id).toBe('booking')
    expect(currentHint(hints, 'capacity')?.id).toBe('driver')
  })

  it('без стадии ведёт себя как раньше — первый невыполненный', () => {
    const hints = callHints(makeCallSetup('call-003'), null)
    expect(currentHint(hints)?.id).toBe(hints[0]?.id)
  })
})

describe('подсказки разные от звонка к звонку', () => {
  it('приветствие не одно и то же во всех звонках', () => {
    const openings = new Set(
      CALL_SEEDS.map((seed) => callHints(makeCallSetup(seed), null)[0]?.say),
    )
    expect(openings.size).toBeGreaterThan(1)
  })

  it('внутри одного звонка формулировка не прыгает', () => {
    const a = callHints(makeCallSetup('call-011'), null)
    const b = callHints(makeCallSetup('call-011'), null)
    expect(a.map((h) => h.say)).toEqual(b.map((h) => h.say))
  })
})

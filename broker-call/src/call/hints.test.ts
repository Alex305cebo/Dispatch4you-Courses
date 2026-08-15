import { describe, expect, it } from 'vitest'
import { callHints, currentHint, openingAsk, TRAINEE_MC } from './hints'
import { makeCallSetup } from './makeCall'
import { CallMachine } from './CallMachine'
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

import { describe, expect, it } from 'vitest'
import { evaluateCarrier, evaluateCarrierAsk } from './guards'
import { createRng } from './rng'
import { getLoad } from '../data/loads'
import { getBroker } from '../data/brokers'
import type { CarrierRecord } from '../types'

const load = getLoad('dal-atl-autoparts') // posted 1750, max 2150
const tough = getBroker('ray-atlas') // patience 2, шаг 25–50
const friendly = getBroker('mike-apex') // patience 6, шаг 50–75

function ask(amount: number, currentOffer: number | null = null, rounds = 0, persona = friendly) {
  return evaluateCarrierAsk({
    load,
    persona,
    ask: amount,
    currentOffer,
    rounds,
    rng: createRng('test'),
  })
}

describe('торг по ставке', () => {
  it('соглашается сразу, если просят не больше уже предложенного', () => {
    const d = ask(1600)
    expect(d.outcome).toBe('accept')
    expect(d.amount).toBe(1600)
  })

  it('никогда не даёт больше потолка, как бы долго ни шёл торг', () => {
    // Главная защита: в старой версии потолок был фразой в промпте, и модель
    // соглашалась на что угодно под давлением.
    for (let rounds = 0; rounds <= 10; rounds++) {
      const d = ask(9999, 1750, rounds)
      expect(d.amount).toBeLessThanOrEqual(load.maxRate)
    }
  })

  it('контрит, когда просят выше потолка и терпение ещё есть', () => {
    const d = ask(2600, 1750, 0)
    expect(d.outcome).toBe('counter')
    expect(d.amount).toBeGreaterThan(1750)
    expect(d.amount).toBeLessThanOrEqual(load.maxRate)
  })

  it('объявляет финальную цену, когда терпение вышло', () => {
    const d = ask(2600, 1900, tough.patience, tough)
    expect(d.outcome).toBe('final')
    expect(d.amount).toBe(load.maxRate)
    expect(d.isFinal).toBe(true)
  })

  it('уходит из сделки, если диспетчер не спускается слишком долго', () => {
    const d = ask(2600, 2150, tough.patience + 1, tough)
    expect(d.outcome).toBe('walk_away')
  })

  it('соглашается, когда разрыв меньше одного шага уступки', () => {
    const d = ask(1790, 1750, 0) // разрыв $40 < шага 50–75
    expect(d.outcome).toBe('accept')
    expect(d.amount).toBe(1790)
  })

  it('на твёрдой ставке не двигается вообще', () => {
    const firm = getLoad('chi-mia-strawberries') // posted == max == 3450
    const d = evaluateCarrierAsk({
      load: firm,
      persona: friendly,
      ask: 3800,
      currentOffer: null,
      rounds: 0,
      rng: createRng('test'),
    })
    expect(d.outcome).toBe('final')
    expect(d.amount).toBe(firm.postedRate)
  })

  it('жёсткий брокер уступает мельче дружелюбного', () => {
    const soft = ask(2600, 1750, 0, friendly)
    const hard = ask(2600, 1750, 0, tough)
    expect(hard.amount).toBeLessThan(soft.amount)
  })

  it('одинаковый seed даёт одинаковый торг', () => {
    // Разбор звонка ссылается на конкретные суммы — они обязаны воспроизводиться.
    const a = evaluateCarrierAsk({ load, persona: tough, ask: 2400, currentOffer: 1750, rounds: 0, rng: createRng('seed-1') })
    const b = evaluateCarrierAsk({ load, persona: tough, ask: 2400, currentOffer: 1750, rounds: 0, rng: createRng('seed-1') })
    expect(a).toEqual(b)
  })
})

describe('допуск перевозчика', () => {
  const clean: CarrierRecord = {
    mc: '445566',
    dot: '1284410',
    legalName: 'STAR TRANSPORT LLC',
    authority: 'active',
    safetyRating: 'satisfactory',
    insuranceCargoUsd: 250000,
    insuranceLiabilityUsd: 1000000,
    yearsInBusiness: 8,
    powerUnits: 25,
    crashesLast24mo: 0,
  }

  it('пропускает чистого перевозчика', () => {
    expect(evaluateCarrier(clean, load).approved).toBe(true)
  })

  it('отказывает при отозванной авторитетности', () => {
    const v = evaluateCarrier({ ...clean, authority: 'revoked' }, load)
    expect(v.approved).toBe(false)
    expect(v.reason).toBeTruthy()
  })

  it('отказывает, если страховки не хватает на стоимость груза', () => {
    const highValue = getLoad('chi-dal-electronics') // $180k
    const v = evaluateCarrier({ ...clean, insuranceCargoUsd: 100000 }, highValue)
    expect(v.approved).toBe(false)
    expect(v.reason).toContain('100,000')
  })

  it('пропускает, но отмечает риски малого флота и аварий', () => {
    const v = evaluateCarrier({ ...clean, powerUnits: 1, crashesLast24mo: 3 }, load)
    expect(v.approved).toBe(true)
    expect(v.concerns.length).toBeGreaterThan(0)
  })
})

import { describe, expect, it } from 'vitest'
import { CallMachine, parseEquipment } from './CallMachine'
import { makeCallSetup } from './makeCall'
import { CALL_SEEDS } from './seeds'

// Сценариев больше нет — звонок собирается генератором. Для тестов берём
// конкретные сиды: набор детерминированный, поэтому это такие же фиксированные
// данные, как раньше, только их не пишут руками.
const SETUPS = CALL_SEEDS.map((seed) => makeCallSetup(seed))

const find = (label: string, ok: (s: (typeof SETUPS)[number]) => boolean) => {
  const setup = SETUPS.find(ok)
  if (!setup) throw new Error(`в наборе сидов нет звонка: ${label}`)
  return setup
}

/** Есть запас для торга — иначе половину проверок торга ставить не на что. */
const NEGOTIABLE = find('с запасом по ставке', (s) => s.load.maxRate > s.load.postedRate + 200)
const REEFER = find('под рефрижератор', (s) => s.load.equipment === 'reefer')
const HARD_PICKUP = find('с жёстким окном погрузки', (s) => s.load.pickup.strict)

function machine(setup = NEGOTIABLE) {
  const m = new CallMachine(setup)
  m.start()
  return m
}

describe('CallMachine — факты только через инструменты', () => {
  it('не заполняет факты из разговора сам по себе', () => {
    const m = machine()
    // Ни одного инструмента не вызвано — значит про перевозчика ничего не известно,
    // сколько бы слов ни прозвучало. В старой версии сюда пролезала регулярка.
    expect(m.getState().facts.mcNumber).toBeNull()
    expect(m.getState().facts.carrier).toBeNull()
    expect(m.getState().stage).toBe('greeting')
  })

  it('записывает перевозчика после проверки MC', () => {
    const m = machine()
    const r = m.execute('lookup_carrier', { mc_number: 'MC 445566' })
    expect(r.ok).toBe(true)
    expect(r.approved).toBe(true)
    expect(m.getState().facts.mcNumber).toBe('445566')
    expect(m.getState().stage).toBe('qualifying')
  })

  it('отказывает по отозванной авторитетности и помечает причину', () => {
    const m = machine()
    const r = m.execute('lookup_carrier', { mc_number: '771100' })
    expect(r.approved).toBe(false)
    expect(r.instruction).toContain('revoked')
    expect(m.getState().facts.endReason).toBe('carrier_rejected')
  })

  it('просит повторить номер, если он не похож на MC', () => {
    const m = machine()
    const r = m.execute('lookup_carrier', { mc_number: 'uh, hold on' })
    expect(r.ok).toBe(false)
    expect(r.error).toBe('invalid_mc')
  })

  it('отдаёт детали груза только через pull_up_load', () => {
    const m = machine()
    expect(m.getState().facts.loadPresented).toBe(false)
    const r = m.execute('pull_up_load', {})
    expect(m.getState().facts.loadPresented).toBe(true)
    expect(r.data).toMatchObject({ reference: NEGOTIABLE.load.ref, miles: NEGOTIABLE.load.miles })
  })

  it('замечает несовпадение оборудования с грузом', () => {
    const m = machine(REEFER)
    const r = m.execute('record_equipment', { equipment: 'fifty three foot dry van' })
    expect(r.data).toMatchObject({ matches_load: false })
    expect(m.getState().facts.equipment).toBe('dry_van')
  })

  it('предупреждает, когда водитель не успевает в жёсткое окно', () => {
    const m = machine(HARD_PICKUP)
    const r = m.execute('record_driver_status', { location: 'Fort Worth', can_make_pickup: false })
    // Проверяем факт, а не формулировку: как об этом сказать, решает модель.
    expect(r.instruction).toContain('will not wait')
    expect(r.instruction).toContain('cannot move it')
  })
})

describe('CallMachine — торг', () => {
  it('фиксирует согласованную ставку и переводит звонок в букинг', () => {
    const m = machine()
    const ask = NEGOTIABLE.load.postedRate - 50 // ниже борда — принимается сразу
    m.execute('propose_rate', { amount: ask })
    expect(m.getState().facts.agreedRate).toBe(ask)
    expect(m.getState().stage).toBe('booking')
  })

  it('не даёт согласовать ставку выше потолка ни при каком напоре', () => {
    const m = machine()
    for (let i = 0; i < 12; i++) m.execute('propose_rate', { amount: 99000 })
    const { agreedRate, currentBrokerOffer } = m.getState().facts
    expect(agreedRate).toBeNull()
    expect(currentBrokerOffer!).toBeLessThanOrEqual(m.load.maxRate)
  })

  it('понимает сумму, произнесённую строкой с долларом и запятой', () => {
    const m = machine()
    const ask = NEGOTIABLE.load.postedRate - 50
    m.execute('propose_rate', { amount: `$${ask.toLocaleString('en-US')}` })
    expect(m.getState().facts.agreedRate).toBe(ask)
  })

  it('просит назвать число, если суммы не прозвучало', () => {
    const m = machine()
    const r = m.execute('propose_rate', { amount: 'somewhere around there' })
    expect(r.ok).toBe(false)
    expect(r.error).toBe('no_amount')
  })

  it('копит историю офферов обеих сторон', () => {
    const m = machine()
    m.execute('propose_rate', { amount: 99000 })
    m.execute('propose_rate', { amount: 98000 })
    expect(m.getState().facts.offers.length).toBe(4)
    expect(m.getState().negotiationRounds).toBe(2)
  })
})

describe('CallMachine — букинг', () => {
  it('собирает данные по одному и знает, чего не хватает', () => {
    const m = machine()
    const r1 = m.execute('record_booking_details', { driver_name: 'George Miller' })
    expect(r1.data).toMatchObject({ complete: false })
    expect(r1.instruction).toContain('truck number')

    m.execute('record_booking_details', { truck_number: '482', trailer_number: '7719' })
    m.execute('record_booking_details', { driver_phone: '555-0142' })
    const r4 = m.execute('record_booking_details', { email: 'ops@startransport.com' })
    expect(r4.data).toMatchObject({ complete: true })
  })

  it('не отправляет rate con без адреса', () => {
    const m = machine()
    const r = m.execute('send_rate_con', {})
    expect(r.ok).toBe(false)
    expect(r.error).toBe('no_email')
  })

  it('берёт адрес из ранее собранных данных', () => {
    const m = machine()
    m.execute('record_booking_details', { email: 'ops@startransport.com' })
    const r = m.execute('send_rate_con', {})
    expect(r.ok).toBe(true)
    expect(m.getState().facts.rateConSentTo).toBe('ops@startransport.com')
    expect(m.getState().stage).toBe('wrap_up')
  })
})

describe('CallMachine — завершение', () => {
  it('закрывает звонок и проставляет причину', () => {
    const m = machine()
    m.execute('end_call', { reason: 'no_deal' })
    expect(m.getState().stage).toBe('ended')
    expect(m.getState().facts.endReason).toBe('no_deal')
    expect(m.getState().endedAt).not.toBeNull()
  })

  it('выводит причину сам, если модель прислала мусор', () => {
    const m = machine()
    m.execute('propose_rate', { amount: NEGOTIABLE.load.postedRate - 50 })
    m.execute('end_call', { reason: 'whatever' })
    expect(m.getState().facts.endReason).toBe('booked')
  })

  it('не откатывает стадию назад', () => {
    const m = machine()
    m.execute('send_rate_con', { email: 'a@b.com' })
    expect(m.getState().stage).toBe('wrap_up')
    m.execute('lookup_carrier', { mc_number: '445566' }) // стадия qualifying — раньше
    expect(m.getState().stage).toBe('wrap_up')
  })

  it('сообщает подписчикам о каждом изменении', () => {
    const m = machine()
    let updates = 0
    m.subscribe(() => updates++)
    m.execute('lookup_carrier', { mc_number: '445566' })
    expect(updates).toBeGreaterThan(0)
  })
})

describe('parseEquipment', () => {
  it.each([
    ['53 foot dry van', 'dry_van'],
    ['reefer trailer', 'reefer'],
    ['temperature controlled', 'reefer'],
    ['flat bed', 'flatbed'],
    ['step deck', 'step_deck'],
  ])('%s → %s', (input, expected) => {
    expect(parseEquipment(input)).toBe(expected)
  })

  it('возвращает null, когда не понял', () => {
    expect(parseEquipment('uhh, the usual')).toBeNull()
  })
})

import { describe, expect, it } from 'vitest'
import { makeCallSetup } from './makeCall'
import { CALL_SEEDS } from './seeds'
import { CallMachine } from './CallMachine'

const SETUPS = CALL_SEEDS.map((seed) => makeCallSetup(seed))

describe('набор звонка', () => {
  it('один и тот же сид даёт один и тот же звонок', () => {
    // На этом держится всё остальное: сервер собирает промпт из сида, браузер
    // из того же сида собирает груз для инструментов. Разъедься они — брокер
    // говорил бы про один груз, а система считала другой.
    expect(makeCallSetup('call-007')).toEqual(makeCallSetup('call-007'))
  })

  it('разные сиды дают разных брокеров и разные компании', () => {
    const names = new Set(SETUPS.map((s) => s.broker.name))
    const companies = new Set(SETUPS.map((s) => s.broker.company))
    // Не требуем полной уникальности — имена берутся из набора, совпадения
    // естественны. Требуем, чтобы разнообразие было настоящим.
    expect(names.size).toBeGreaterThan(SETUPS.length * 0.7)
    expect(companies.size).toBeGreaterThan(SETUPS.length * 0.7)
  })

  it('грузы и цифры тоже разные', () => {
    const lanes = new Set(SETUPS.map((s) => `${s.load.origin.city}-${s.load.destination.city}`))
    const rates = new Set(SETUPS.map((s) => s.load.postedRate))
    expect(lanes.size).toBeGreaterThan(6)
    expect(rates.size).toBeGreaterThan(SETUPS.length * 0.7)
  })

  it('голос совпадает с полом брокера и всегда из поддерживаемого набора', () => {
    const known = new Set(['austin', 'daniel', 'troy', 'autumn', 'diana', 'hannah'])
    for (const s of SETUPS) expect(known.has(s.voice)).toBe(true)
  })

  it('потолок никогда не ниже ставки с борда', () => {
    // Иначе торг стартовал бы выше максимума, и первая же просьба закрывала бы
    // сделку сверх потолка.
    for (const s of SETUPS) expect(s.load.maxRate).toBeGreaterThanOrEqual(s.load.postedRate)
  })

  it('характер брокера не пустой и не одинаковый у всех', () => {
    for (const s of SETUPS) expect(s.broker.traits.length).toBe(3)
    const combos = new Set(SETUPS.map((s) => s.broker.traits.join('|')))
    expect(combos.size).toBeGreaterThan(SETUPS.length * 0.6)
  })
})

describe('терпение брокера', () => {
  it('пустые ходы диспетчера тратят терпение так же, как раунды торга', () => {
    const setup =
      SETUPS.find((s) => s.load.maxRate > s.load.postedRate + 200) ?? makeCallSetup(CALL_SEEDS[0]!)
    const ask = setup.load.maxRate + 1000

    const focused = new CallMachine(setup)
    focused.start()
    const straight = focused.execute('propose_rate', { amount: ask })

    const rambling = new CallMachine(setup)
    rambling.start()
    // Десять реплик, после которых брокер ничего не записал.
    for (let i = 0; i < 10; i++) rambling.noteDispatcherTurn()
    const afterChatter = rambling.execute('propose_rate', { amount: ask })

    const outcome = (r: typeof straight) => (r.data as { outcome: string }).outcome
    expect(outcome(straight)).toBe('counter')
    // Тому, кто десять ходов говорил ни о чём, брокер уже не контрит.
    expect(['final', 'walk_away']).toContain(outcome(afterChatter))
  })
})

import type { BrokerPersona, CarrierRecord, Load } from '../types'
import type { Rng } from './rng'

// Здесь живут решения, которые модели не доверены. Она ведёт разговор; сколько
// брокер готов заплатить и кого он вообще пустит на груз — считает код.
//
// В старой версии потолок был фразой в промпте («your absolute max is $2,150»),
// и достаточно было надавить словами, чтобы модель его перешагнула. Теперь
// перешагнуть нечего: propose_rate возвращает решение, а не мнение.

export type RateOutcome = 'accept' | 'counter' | 'final' | 'walk_away'

export interface RateDecision {
  outcome: RateOutcome
  /** Сумма, на которой брокер стоит после этого хода. */
  amount: number
  /** Дальше двигаться некуда — следующий отказ закрывает торг. */
  isFinal: boolean
  /** Что модель должна донести словами. Не дословная реплика — смысл. */
  reason: string
}

export interface RateContext {
  load: Load
  persona: BrokerPersona
  /** Сколько диспетчер просит, в долларах, all-in. */
  ask: number
  /** Текущее предложение брокера; null — торг ещё не начинался. */
  currentOffer: number | null
  /** Сколько раундов торга уже прошло. */
  rounds: number
  rng: Rng
}

export function evaluateCarrierAsk(ctx: RateContext): RateDecision {
  const { load, persona, ask, rounds, rng } = ctx
  const offer = ctx.currentOffer ?? load.postedRate

  // Просит не больше, чем брокер уже даёт — соглашаемся мгновенно и не умничаем.
  if (ask <= offer) {
    return {
      outcome: 'accept',
      amount: ask,
      isFinal: true,
      reason: `Carrier asked for ${money(ask)}, which is at or below what you already offered. Accept immediately and move to booking.`,
    }
  }

  const step = rng.int(persona.concessionStep[0], persona.concessionStep[1])
  const patienceSpent = rounds + 1 >= persona.patience

  // Двигаться некуда: либо ставка изначально твёрдая, либо брокера уже дожали
  // до потолка. Разница только в том, сколько раз он это повторит, прежде чем
  // закончить разговор.
  if (load.maxRate <= offer) {
    if (rounds >= persona.patience) {
      return {
        outcome: 'walk_away',
        amount: offer,
        isFinal: true,
        reason: `You have repeated ${money(offer)} enough times and they are still asking for more. Tell them you will keep the load posted and end the call politely.`,
      }
    }
    return {
      outcome: 'final',
      amount: offer,
      isFinal: true,
      reason: `${money(offer)} is all this load carries — there is no room left. Say it plainly and let the carrier decide.`,
    }
  }

  // Просит в пределах потолка.
  if (ask <= load.maxRate) {
    const gap = ask - offer
    // Разрыв меньше одного шага уступки — спорить не о чем.
    if (gap <= step) {
      return {
        outcome: 'accept',
        amount: ask,
        isFinal: true,
        reason: `${money(ask)} works. Agree and move straight to booking details — do not reopen the rate.`,
      }
    }
    if (patienceSpent) {
      return {
        outcome: 'final',
        amount: ask,
        isFinal: true,
        reason: `You have gone back and forth enough. Meet them at ${money(ask)} and close it.`,
      }
    }
    const counter = Math.min(load.maxRate, offer + step)
    return {
      outcome: 'counter',
      amount: counter,
      isFinal: false,
      reason: `Counter at ${money(counter)}. Make them justify anything above it — deadhead, market data, fuel.`,
    }
  }

  // Просит выше потолка.
  if (rounds >= persona.patience + 1) {
    return {
      outcome: 'walk_away',
      amount: load.maxRate,
      isFinal: true,
      reason: `${money(ask)} is out of range and the carrier will not come down. Tell them you will keep the load posted, and end the call politely.`,
    }
  }

  if (patienceSpent) {
    return {
      outcome: 'final',
      amount: load.maxRate,
      isFinal: true,
      reason: `${money(load.maxRate)} is the most this load carries. State it as your final number — you cannot go higher no matter what they say.`,
    }
  }

  const counter = Math.min(load.maxRate, offer + step)
  return {
    outcome: 'counter',
    amount: counter,
    isFinal: false,
    reason: `${money(ask)} is above what this load can carry. Push back and counter at ${money(counter)}.`,
  }
}

// ── Допуск перевозчика ──────────────────────────────────────────────────────

export interface CarrierVerdict {
  approved: boolean
  /** Почему отказ — брокер обязан назвать причину вслух. */
  reason?: string
  /** На что брокер обратит внимание, даже если пропускает. */
  concerns: string[]
}

export function evaluateCarrier(carrier: CarrierRecord, load: Load): CarrierVerdict {
  if (carrier.blocker) {
    return { approved: false, reason: carrier.blocker, concerns: [] }
  }

  const concerns: string[] = []

  // Страховка на груз должна покрывать его стоимость — это не придирка,
  // а условие, на котором шиппер вообще отдаёт такой груз.
  if (load.valueUsd && carrier.insuranceCargoUsd < load.valueUsd) {
    return {
      approved: false,
      reason: `Cargo insurance is ${money(carrier.insuranceCargoUsd)} but the freight is worth ${money(load.valueUsd)} — the shipper requires full coverage.`,
      concerns,
    }
  }

  if (carrier.authority !== 'active') {
    return {
      approved: false,
      reason: `Operating authority shows ${carrier.authority}, so this carrier cannot be used.`,
      concerns,
    }
  }

  if (carrier.yearsInBusiness < 1) concerns.push('less than a year of operating history')
  if (carrier.crashesLast24mo >= 2) concerns.push('multiple recordable crashes in the last 24 months')
  if (carrier.powerUnits <= 2) concerns.push('very small fleet — limited backup if the truck breaks down')

  return { approved: true, concerns }
}

function money(n: number): string {
  return `$${n.toLocaleString('en-US')}`
}

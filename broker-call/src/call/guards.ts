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
  /**
   * Позиция брокера и её границы. Не реплика и не следующий шаг: раньше здесь
   * стояло «согласись и переходи к букингу», и одинаковые цифры давали
   * одинаковые слова в каждом звонке. Формулирует модель, решает — код.
   */
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
  /**
   * Ходы диспетчера, ничего не сдвинувшие. Тратят то же терпение, что и раунд
   * торга: до этого болтовня не стоила студенту ничего, и брокер выслушивал
   * что угодно сколько угодно.
   */
  idleTurns?: number
  rng: Rng
}

export function evaluateCarrierAsk(ctx: RateContext): RateDecision {
  const { load, persona, ask, rng } = ctx
  const rounds = ctx.rounds + (ctx.idleTurns ?? 0)
  const offer = ctx.currentOffer ?? load.postedRate

  // Просит не больше, чем брокер уже даёт — соглашаемся мгновенно и не умничаем.
  if (ask <= offer) {
    return {
      outcome: 'accept',
      amount: ask,
      isFinal: true,
      reason: `They asked for ${money(ask)} — at or below what you already offered. This is a yes.`,
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
        reason: `You have repeated ${money(offer)} enough times and they are still asking for more. You are done with this one — the load stays posted.`,
      }
    }
    return {
      outcome: 'final',
      amount: offer,
      isFinal: true,
      reason: `${money(offer)} is all this load carries. There is no room left, whatever they say.`,
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
        reason: `${money(ask)} works. The rate is settled — it does not get reopened.`,
      }
    }
    if (patienceSpent) {
      return {
        outcome: 'final',
        amount: ask,
        isFinal: true,
        reason: `You have gone back and forth enough. ${money(ask)} is where this ends.`,
      }
    }
    const counter = Math.min(load.maxRate, offer + step)
    return {
      outcome: 'counter',
      amount: counter,
      isFinal: false,
      reason: `Your position is ${money(counter)}. Anything above it they have to justify.`,
    }
  }

  // Просит выше потолка.
  if (rounds >= persona.patience + 1) {
    return {
      outcome: 'walk_away',
      amount: load.maxRate,
      isFinal: true,
      reason: `${money(ask)} is out of range and they will not come down. You are done with this one — the load stays posted.`,
    }
  }

  if (patienceSpent) {
    return {
      outcome: 'final',
      amount: load.maxRate,
      isFinal: true,
      reason: `${money(load.maxRate)} is the most this load carries. You cannot go higher, no matter what they say.`,
    }
  }

  const counter = Math.min(load.maxRate, offer + step)
  return {
    outcome: 'counter',
    amount: counter,
    isFinal: false,
    reason: `${money(ask)} is above what this load carries. Your position is ${money(counter)}.`,
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

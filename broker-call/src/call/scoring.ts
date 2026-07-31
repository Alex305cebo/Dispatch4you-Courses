import type { CallState, Scenario, ScenarioGoal } from '../types'
import { getLoad } from '../data/loads'
import { getMarketQuote, rateVsMarket } from '../data/market'

/**
 * Оценка звонка.
 *
 * Считает код, а не модель. В старой версии баллы выставляла LLM одним
 * запросом по сырому транскрипту: она путала суммы, хвалила за несделанное и
 * от прогона к прогону выдавала разные цифры на одном и том же разговоре.
 *
 * Здесь всё выводится из фактов, которые зафиксировал CallMachine. Модели
 * оставлен человеческий разбор поверх уже посчитанных чисел.
 */

export type MetricKey = 'opening' | 'qualifying' | 'negotiation' | 'closing' | 'terminology'

export interface CallMetrics {
  /** 0–10 по каждой применимой к сценарию метрике. */
  scores: Partial<Record<MetricKey, number>>
  overall: number
  /** Сколько брокер был готов доплатить сверх согласованного. */
  leftOnTable: number
  agreedRate: number | null
  marketTotal: number
  durationSec: number
  dispatcherTurns: number
  goalsMet: ScenarioGoal[]
  goalsMissed: ScenarioGoal[]
  termsUsed: string[]
}

export interface ScoreInput {
  scenario: Scenario
  state: CallState
  /** Только реплики диспетчера — по ним считается терминология. */
  dispatcherText: string
}

export function scoreCall({ scenario, state, dispatcherText }: ScoreInput): CallMetrics {
  const load = getLoad(scenario.loadId)
  const facts = state.facts
  const goals = new Set(scenario.goals)

  const scores: Partial<Record<MetricKey, number>> = {}

  // ── Открытие: назвал ли MC и как быстро ──
  if (goals.has('give_mc')) {
    let s = 0
    if (facts.mcNumber) {
      s += 5
      // Индекс хода, на котором брокер получил номер. Профессионал называет
      // его сам в первых двух фразах, а не после третьего вопроса.
      const turnGiven = facts.mcGivenAtTurn ?? 99
      if (turnGiven <= 2) s += 3
      else if (turnGiven <= 4) s += 1.5
      if (facts.carrier && !facts.carrier.blocker) s += 2
    }
    scores.opening = clamp(s)
  }

  // ── Квалификация: собрал ли брокер картину, и без повторов ──
  const qualifyingGoals =
    goals.has('confirm_equipment') || goals.has('get_load_details') || goals.has('confirm_driver')
  if (qualifyingGoals) {
    let s = 0
    if (facts.equipment) s += 3
    if (facts.equipment === load.equipment) s += 1
    if (facts.loadPresented) s += 3
    if (facts.driverLocation) s += 2
    if (facts.driverCanMakePickup === true) s += 1
    scores.qualifying = clamp(s)
  }

  // ── Торг: сколько из доступного запаса забрал ──
  if (goals.has('negotiate_rate')) {
    scores.negotiation = clamp(negotiationScore(state, load.postedRate, load.maxRate))
  }

  // ── Закрытие: данные для букинга и rate con ──
  if (goals.has('book_load') || goals.has('get_rate_con')) {
    const fields = ['driverName', 'truckNumber', 'trailerNumber', 'driverPhone', 'email'] as const
    const filled = fields.filter((f) => facts.booking[f]).length
    let s = filled * 1.5
    if (facts.rateConSentTo) s += 2.5
    scores.closing = clamp(s)
  }

  // ── Терминология: чем именно студент говорил ──
  const termsUsed = detectTerms(dispatcherText)
  scores.terminology = clamp(Math.min(10, termsUsed.length * 1.8))

  const applicable = Object.values(scores)
  const overall = applicable.length
    ? Math.round((applicable.reduce((a, b) => a + b, 0) / applicable.length) * 10) / 10
    : 0

  const market = getMarketQuote(load)
  const money = facts.agreedRate ? rateVsMarket(facts.agreedRate, load) : null

  return {
    scores,
    overall,
    leftOnTable: money?.leftOnTable ?? 0,
    agreedRate: facts.agreedRate,
    marketTotal: market.suggestedTotal,
    durationSec:
      state.startedAt && state.endedAt ? Math.round((state.endedAt - state.startedAt) / 1000) : 0,
    dispatcherTurns: state.turn,
    goalsMet: scenario.goals.filter((g) => isGoalMet(g, state)),
    goalsMissed: scenario.goals.filter((g) => !isGoalMet(g, state)),
    termsUsed,
  }
}

function negotiationScore(state: CallState, posted: number, max: number): number {
  const agreed = state.facts.agreedRate
  if (!agreed) {
    // Сделки нет. Это не всегда провал: уйти от невыгодного груза — навык,
    // но в тренажёре торга цель была договориться.
    return state.facts.endReason === 'no_deal' ? 3 : 0
  }

  const room = max - posted
  if (room <= 0) {
    // Ставка была твёрдой — торговаться было не о чем, важно просто не уронить.
    return agreed >= posted ? 10 : 5
  }

  const captured = (agreed - posted) / room
  // Забрал весь запас — десятка; согласился на ставку с борда — четвёрка.
  return 4 + clamp01(captured) * 6
}

function isGoalMet(goal: ScenarioGoal, state: CallState): boolean {
  const f = state.facts
  switch (goal) {
    case 'give_mc':
      return Boolean(f.mcNumber)
    case 'confirm_equipment':
      return Boolean(f.equipment)
    case 'get_load_details':
      return f.loadPresented
    case 'confirm_driver':
      return Boolean(f.driverLocation)
    case 'negotiate_rate':
      return Boolean(f.agreedRate)
    case 'book_load':
      return Boolean(f.booking.driverName && f.booking.truckNumber)
    case 'get_rate_con':
      return Boolean(f.rateConSentTo)
  }
}

/**
 * Отраслевые термины в речи диспетчера. Не «прозвучало слово», а «использовал
 * профессиональный язык» — по этому брокер за десять секунд понимает, с кем
 * говорит.
 */
const TERM_PATTERNS: readonly [string, RegExp][] = [
  ['MC number', /\bmc\s*(number|#)?\s*\d|\bmc\b/i],
  ['dry van', /\bdry van\b/i],
  ['reefer', /\breefer\b/i],
  ['flatbed', /\bflatbed\b/i],
  ['deadhead', /\bdeadhead\b/i],
  ['all-in', /\ball[\s-]?in\b/i],
  ['rate con', /\brate con\b/i],
  ['RPM', /\brpm\b|\bper mile\b/i],
  ['DAT', /\bdat\b/i],
  ['detention', /\bdetention\b/i],
  ['lumper', /\blumper\b/i],
  ['TONU', /\btonu\b/i],
  ['BOL', /\bbol\b|\bbill of lading\b/i],
  ['POD', /\bpod\b|\bproof of delivery\b/i],
  ['ETA', /\beta\b/i],
  ['factoring', /\bfactoring\b/i],
  ['QuickPay', /\bquick\s?pay\b/i],
  ['drop and hook', /\bdrop and hook\b/i],
  ['safety rating', /\bsafety rating\b/i],
  ['authority', /\bauthority\b/i],
]

export function detectTerms(text: string): string[] {
  if (!text.trim()) return []
  return TERM_PATTERNS.filter(([, pattern]) => pattern.test(text)).map(([name]) => name)
}

function clamp(n: number): number {
  return Math.round(Math.max(0, Math.min(10, n)) * 10) / 10
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n))
}

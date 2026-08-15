import type {
  BrokerPersona,
  CallFacts,
  CallStage,
  CallState,
  CarrierRecord,
  EndReason,
  Equipment,
  Load,
} from '../types'
import type { CallSetup } from './makeCall'
import { laneLabel, ratePerMile } from '../data/loads'
import { lookupCarrier, normalizeMc } from '../data/carriers'
import { getMarketQuote } from '../data/market'
import { evaluateCarrier, evaluateCarrierAsk } from './guards'
import { createRng, type Rng } from './rng'

/**
 * Автомат звонка.
 *
 * Единственный источник правды о том, что произошло в разговоре. Факты сюда
 * попадают ТОЛЬКО через execute() — то есть через вызовы инструментов моделью.
 * Никакого разбора транскрипта регулярками, как в старой версии, где
 * `locationAnswered` срабатывал на слово «ready» в любом контексте, а
 * `bookingDone` — на слово «george».
 *
 * Побочный эффект такой схемы приятный: интерфейс просто рисует состояние,
 * а разбор звонка считается по нему же, а не по пересказу модели.
 */
export class CallMachine {
  readonly setup: CallSetup
  readonly load: Load
  readonly broker: BrokerPersona

  private state: CallState
  private readonly rng: Rng
  private readonly listeners = new Set<(state: CallState) => void>()
  /** Ходы диспетчера, не сдвинувшие звонок. Съедают терпение брокера. */
  private idleTurns = 0
  /** Повторные вопросы — материал для разбора, а не повод падать. */
  private readonly toolCounts = new Map<string, number>()

  constructor(setup: CallSetup) {
    this.setup = setup
    this.load = setup.load
    this.broker = setup.broker
    // Сид звонка, а не сценария: раньше он равнялся id сценария, и поток
    // случайных чисел был одинаков во всех звонках у всех студентов.
    this.rng = createRng(setup.id)
    this.state = initialState(this.broker)
  }

  getState(): CallState {
    return this.state
  }

  subscribe(listener: (state: CallState) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  start(): void {
    this.patch({ stage: 'greeting', startedAt: Date.now() })
  }

  /** Диспетчер сказал реплику — счётчик ходов нужен рубрике оценки. */
  noteDispatcherTurn(): void {
    // Ход, после которого брокер ничего не записал, — это разговор ни о чём.
    // Раньше он не стоил студенту ничего: терпение тратилось только на раунды
    // торга, и двадцать реплик про погоду проходили бесплатно.
    this.idleTurns += 1
    this.patch({ turn: this.state.turn + 1 })
  }

  /**
   * Выполняет инструмент и возвращает результат, который уходит обратно в
   * модель как tool-сообщение. Результат всегда сериализуемый и всегда
   * содержит `instruction` — факты и границы, но не следующий шаг.
   */
  execute(name: string, rawArgs: unknown): ToolResult {
    const args = (rawArgs ?? {}) as Record<string, unknown>
    this.toolCounts.set(name, (this.toolCounts.get(name) ?? 0) + 1)

    switch (name) {
      case 'lookup_carrier':
        return this.lookupCarrier(str(args.mc_number))
      case 'pull_up_load':
        return this.pullUpLoad()
      case 'record_equipment':
        return this.recordEquipment(str(args.equipment))
      case 'record_driver_status':
        return this.recordDriverStatus(str(args.location), bool(args.can_make_pickup))
      case 'check_market_rate':
        return this.checkMarketRate()
      case 'propose_rate':
        return this.proposeRate(num(args.amount))
      case 'record_booking_details':
        return this.recordBookingDetails(args)
      case 'send_rate_con':
        return this.sendRateCon(str(args.email))
      case 'end_call':
        return this.endCall(str(args.reason) as EndReason)
      default:
        return { ok: false, error: `Unknown tool: ${name}` }
    }
  }

  /** Сколько раз модель дёрнула инструмент — повторы видны в разборе. */
  timesCalled(tool: string): number {
    return this.toolCounts.get(tool) ?? 0
  }

  // ── Инструменты ───────────────────────────────────────────────────────────

  private lookupCarrier(rawMc: string): ToolResult {
    const mc = normalizeMc(rawMc)
    const carrier = lookupCarrier(mc)

    if (!carrier) {
      return {
        ok: false,
        error: 'invalid_mc',
        instruction: 'That MC number did not come back as a valid number.',
      }
    }

    const verdict = evaluateCarrier(carrier, this.load)
    // Брокер пробивает номер сразу, как услышал, — значит текущий ход и есть
    // тот, на котором диспетчер его назвал.
    this.patchFacts({
      mcNumber: carrier.mc,
      mcGivenAtTurn: this.state.facts.mcGivenAtTurn ?? Math.max(1, this.state.turn),
      carrier,
    })
    this.advance('qualifying')

    if (!verdict.approved) {
      this.patchFacts({ endReason: 'carrier_rejected' })
      return {
        ok: true,
        data: carrierSummary(carrier),
        approved: false,
        // Единственное, что здесь остаётся приказом: отказ не обсуждается.
        instruction: `This carrier cannot take the load. Reason: ${verdict.reason} Do not offer them the load.`,
      }
    }

    return {
      ok: true,
      data: carrierSummary(carrier),
      approved: true,
      instruction: verdict.concerns.length
        ? `Carrier checks out. Worth noting: ${verdict.concerns.join('; ')}.`
        : 'Carrier checks out.',
    }
  }

  private pullUpLoad(): ToolResult {
    const load = this.load
    this.patchFacts({ loadPresented: true })
    this.advance('load_details')

    return {
      ok: true,
      data: {
        reference: load.ref,
        lane: laneLabel(load),
        miles: load.miles,
        equipment: load.equipmentNote ?? load.equipment,
        commodity: load.commodity,
        weight_lbs: load.weightLbs,
        value_usd: load.valueUsd ?? null,
        pickup: load.pickup.label,
        delivery: load.delivery.label,
        posted_rate: load.postedRate,
        payment_terms: load.paymentTerms,
        notes: load.notes,
      },
      instruction: 'This is what the load record says. Never read it out as a list.',
    }
  }

  private recordEquipment(raw: string): ToolResult {
    const equipment = parseEquipment(raw)
    if (!equipment) {
      return {
        ok: false,
        error: 'unclear_equipment',
        instruction: 'You did not catch what they run.',
      }
    }

    this.patchFacts({ equipment })
    const fits = equipment === this.load.equipment

    if (!fits) {
      return {
        ok: true,
        data: { equipment, matches_load: false, load_requires: this.load.equipment },
        instruction: `They run ${equipment.replace('_', ' ')}, but this load needs ${this.load.equipment.replace('_', ' ')}. It will not go on the wrong trailer.`,
      }
    }

    return {
      ok: true,
      data: { equipment, matches_load: true },
      instruction: 'Equipment fits.',
    }
  }

  private recordDriverStatus(location: string, canMakePickup: boolean | null): ToolResult {
    this.patchFacts({
      driverLocation: location || this.state.facts.driverLocation,
      driverCanMakePickup: canMakePickup,
    })
    this.advance('capacity')

    if (canMakePickup === false) {
      return {
        ok: true,
        data: { location, can_make_pickup: false },
        instruction: `Their driver cannot make ${this.load.pickup.label}. ${
          this.load.pickup.strict
            ? 'This pickup window is hard — the load will not wait, and you cannot move it.'
            : 'This pickup window has some give in it.'
        }`,
      }
    }

    return {
      ok: true,
      data: { location, can_make_pickup: canMakePickup },
      instruction: 'Driver is covered.',
    }
  }

  private checkMarketRate(): ToolResult {
    const quote = getMarketQuote(this.load)
    this.patchFacts({ marketChecked: true })
    return {
      ok: true,
      data: quote,
      instruction:
        'You can see the market, but do not volunteer it. Use it only to push back if their number is out of line.',
    }
  }

  private proposeRate(amount: number): ToolResult {
    if (!Number.isFinite(amount) || amount <= 0) {
      return {
        ok: false,
        error: 'no_amount',
        instruction: 'They did not name a clear number.',
      }
    }

    const facts = this.state.facts
    const decision = evaluateCarrierAsk({
      load: this.load,
      persona: this.broker,
      ask: amount,
      currentOffer: facts.currentBrokerOffer,
      rounds: this.state.negotiationRounds,
      // Пустая болтовня тратит то же терпение, что и раунд торга: у брокера
      // мигают ещё четыре линии, и ему всё равно, на что ушло время.
      idleTurns: this.idleTurns,
      rng: this.rng,
    })

    const offers = [
      ...facts.offers,
      { by: 'dispatcher' as const, amount, atTurn: this.state.turn },
      { by: 'broker' as const, amount: decision.amount, atTurn: this.state.turn },
    ]

    this.patch({ negotiationRounds: this.state.negotiationRounds + 1 })
    this.patchFacts({
      offers,
      currentBrokerOffer: decision.amount,
      agreedRate:
        decision.outcome === 'accept' ? decision.amount : facts.agreedRate,
    })
    this.advance(decision.outcome === 'accept' ? 'booking' : 'negotiation')

    if (decision.outcome === 'walk_away') {
      this.patchFacts({ endReason: 'no_deal' })
    }

    return {
      ok: true,
      data: {
        outcome: decision.outcome,
        broker_position: decision.amount,
        rate_per_mile: ratePerMile(decision.amount, this.load),
        is_final: decision.isFinal,
      },
      instruction: decision.reason,
    }
  }

  private recordBookingDetails(args: Record<string, unknown>): ToolResult {
    const booking = { ...this.state.facts.booking }
    if (str(args.driver_name)) booking.driverName = str(args.driver_name)
    if (str(args.truck_number)) booking.truckNumber = str(args.truck_number)
    if (str(args.trailer_number)) booking.trailerNumber = str(args.trailer_number)
    if (str(args.driver_phone)) booking.driverPhone = str(args.driver_phone)
    if (str(args.email)) booking.email = str(args.email)

    this.patchFacts({ booking })
    this.advance('booking')

    const missing = MISSING_ORDER.filter((field) => !booking[field.key])
    if (missing.length === 0) {
      return {
        ok: true,
        data: { complete: true },
        instruction: 'You have every detail you need. The rate con goes out within 30 minutes.',
      }
    }

    return {
      ok: true,
      data: { complete: false, still_missing: missing.map((m) => m.label) },
      // Порядок выбирает модель — раньше здесь стояло «спроси сейчас вот это»,
      // и все звонки собирали данные водителя в одной и той же последовательности.
      instruction: `Still missing: ${missing.map((m) => m.label).join(', ')}. Never ask for them as a list.`,
    }
  }

  private sendRateCon(email: string): ToolResult {
    const target = email || this.state.facts.booking.email
    if (!target) {
      return {
        ok: false,
        error: 'no_email',
        instruction: 'The rate con cannot go anywhere without an email address.',
      }
    }

    this.patchFacts({ rateConSentTo: target })
    this.advance('wrap_up')

    return {
      ok: true,
      data: {
        sent_to: target,
        reference: this.load.ref,
        rate: this.state.facts.agreedRate ?? this.state.facts.currentBrokerOffer,
        lane: laneLabel(this.load),
      },
      instruction: 'It is on its way and lands within 30 minutes.',
    }
  }

  private endCall(reason: EndReason): ToolResult {
    const endReason: EndReason =
      reason && VALID_END_REASONS.has(reason)
        ? reason
        : this.state.facts.agreedRate
          ? 'booked'
          : 'no_deal'

    this.patchFacts({ endReason })
    this.patch({ stage: 'ended', endedAt: Date.now() })

    return {
      ok: true,
      data: { ended: true, reason: endReason },
      // Единственный шаг, который обязан быть коротким: после прощания говорить
      // уже не с кем — линия закрыта.
      instruction: 'The call is over. Say goodbye in one short line and stop talking.',
    }
  }

  // ── Внутреннее ────────────────────────────────────────────────────────────

  /**
   * Стадия только растёт. Это отметка о том, что уже случилось, — её читают
   * экран и оценка. Порядок вопросов она не диктует: разговор может вернуться
   * к ставке после данных водителя, и это нормально.
   */
  private advance(stage: CallStage): void {
    if (STAGE_ORDER.indexOf(stage) > STAGE_ORDER.indexOf(this.state.stage)) {
      this.patch({ stage })
    }
  }

  private patch(partial: Partial<CallState>): void {
    this.state = { ...this.state, ...partial }
    this.emit()
  }

  private patchFacts(partial: Partial<CallFacts>): void {
    // Записанный факт означает, что звонок сдвинулся: счёт пустых ходов
    // начинается заново. Сброс именно здесь, а не в execute(): решение по
    // ставке читает счётчик ДО того, как запишет результат.
    this.idleTurns = 0
    this.state = { ...this.state, facts: { ...this.state.facts, ...partial } }
    this.emit()
  }

  private emit(): void {
    for (const listener of this.listeners) listener(this.state)
  }
}

export interface ToolResult {
  ok: boolean
  data?: unknown
  error?: string
  approved?: boolean
  /** Что брокеру делать дальше. Уходит в модель вместе с данными. */
  instruction?: string
}

const STAGE_ORDER: readonly CallStage[] = [
  'idle',
  'ringing',
  'greeting',
  'qualifying',
  'load_details',
  'capacity',
  'negotiation',
  'booking',
  'wrap_up',
  'ended',
]

const VALID_END_REASONS = new Set<EndReason>([
  'booked',
  'no_deal',
  'broker_hung_up',
  'carrier_rejected',
  'dispatcher_left',
])

const MISSING_ORDER = [
  { key: 'driverName', label: "driver's full name" },
  { key: 'truckNumber', label: 'truck number' },
  { key: 'trailerNumber', label: 'trailer number' },
  { key: 'driverPhone', label: "driver's cell phone" },
  { key: 'email', label: 'email for the rate con' },
] as const satisfies readonly { key: keyof import('../types').BookingInfo; label: string }[]

function initialState(broker: BrokerPersona): CallState {
  return {
    stage: 'idle',
    negotiationRounds: 0,
    patienceLeft: broker.patience,
    turn: 0,
    startedAt: null,
    endedAt: null,
    facts: {
      mcNumber: null,
      mcGivenAtTurn: null,
      carrier: null,
      equipment: null,
      driverLocation: null,
      driverCanMakePickup: null,
      loadPresented: false,
      marketChecked: false,
      offers: [],
      currentBrokerOffer: null,
      agreedRate: null,
      booking: {},
      rateConSentTo: null,
      endReason: null,
    },
  }
}

function carrierSummary(carrier: CarrierRecord) {
  return {
    mc: carrier.mc,
    dot: carrier.dot,
    legal_name: carrier.legalName,
    authority: carrier.authority,
    safety_rating: carrier.safetyRating,
    cargo_insurance: carrier.insuranceCargoUsd,
    years_in_business: carrier.yearsInBusiness,
    power_units: carrier.powerUnits,
    crashes_24mo: carrier.crashesLast24mo,
  }
}

/** Модель называет оборудование как услышала — приводим к нашему словарю. */
export function parseEquipment(raw: string): Equipment | null {
  const t = raw.toLowerCase()
  if (/reefer|refrigerat|temp\w*[\s-]*control/.test(t)) return 'reefer'
  if (/step\s*deck|stepdeck|drop\s*deck/.test(t)) return 'step_deck'
  if (/flat\s*bed|flatbed/.test(t)) return 'flatbed'
  if (/dry\s*van|van|53/.test(t)) return 'dry_van'
  return null
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

function num(v: unknown): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string') return Number(v.replace(/[^0-9.]/g, ''))
  return NaN
}

function bool(v: unknown): boolean | null {
  if (typeof v === 'boolean') return v
  if (v === 'true') return true
  if (v === 'false') return false
  return null
}

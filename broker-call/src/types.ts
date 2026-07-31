// Доменная модель звонка. Всё, что описывает груз, брокера и перевозчика,
// живёт здесь и в src/data — и НИКОГДА не пересказывается моделью в свободной
// форме. Модель говорит словами, факты берутся отсюда.

export type Equipment = 'dry_van' | 'reefer' | 'flatbed' | 'step_deck'

export type Lang = 'ru' | 'en'

/** Строка, у которой есть перевод. Разговор всегда на английском, интерфейс — нет. */
export type Localized = Record<Lang, string>

export interface Place {
  city: string
  state: string
  /** Адрес нужен только на этапе букинга — брокер диктует его вслух. */
  address?: string
}

export interface TimeWindow {
  /** Человеческим языком, как брокер произносит: "tomorrow 8 AM–12 PM". */
  label: string
  /** Жёсткое окно = опоздание означает отказ в приёмке. */
  strict: boolean
}

export interface Load {
  id: string
  /** Референс груза — брокеры называют его в трубку: "load CH-2847". */
  ref: string
  origin: Place
  destination: Place
  miles: number
  equipment: Equipment
  equipmentNote?: string
  commodity: string
  weightLbs: number
  valueUsd?: number
  pickup: TimeWindow
  delivery: TimeWindow
  /** Ставка на борде — с неё брокер начинает торг. */
  postedRate: number
  /**
   * Потолок брокера. Лежит в коде, а не в промпте: модель не может его
   * «передумать», пересчитать или поддаться на уговоры сверх него.
   */
  maxRate: number
  /** Рынок DAT по лейну — аргумент диспетчера и база для оценки. */
  marketRatePerMile: number
  notes: string[]
  paymentTerms: string
}

export type BrokerStyle = 'rushed' | 'friendly' | 'tough' | 'bureaucratic' | 'stressed'

export interface BrokerPersona {
  id: string
  name: string
  company: string
  style: BrokerStyle
  /** 1 — прощает всё, 4 — бросит трубку за первую же глупость. */
  difficulty: 1 | 2 | 3 | 4
  /** Черты характера — единственное, что уходит в промпт из персоны. */
  traits: string[]
  /** Сколько раундов торга терпит, прежде чем сказать «финальное предложение». */
  patience: number
  /** Шаг уступки в долларах: [минимум, максимум]. */
  concessionStep: [number, number]
  /** 0..1 — насколько вероятно бросит трубку, если разговор идёт плохо. */
  hangUpRisk: number
}

export type Authority = 'active' | 'pending' | 'revoked'
export type SafetyRating = 'satisfactory' | 'conditional' | 'unrated' | 'unsatisfactory'

/** Мок FMCSA — то, что брокер видит, когда пробивает MC номер. */
export interface CarrierRecord {
  mc: string
  dot: string
  legalName: string
  authority: Authority
  safetyRating: SafetyRating
  insuranceCargoUsd: number
  insuranceLiabilityUsd: number
  yearsInBusiness: number
  powerUnits: number
  crashesLast24mo: number
  /** Если заполнено — брокер обязан отказать, и вот почему. */
  blocker?: string
}

export type ScenarioKind =
  | 'inbound_load'
  | 'negotiate'
  | 'book'
  | 'problem'
  | 'cold'
  | 'followup'

export interface Scenario {
  id: string
  kind: ScenarioKind
  title: Localized
  objective: Localized
  brokerId: string
  loadId: string
  difficulty: 1 | 2 | 3 | 4
  /** Что диспетчер обязан сделать, чтобы звонок считался успешным. */
  goals: ScenarioGoal[]
  /** Открывающая реплика брокера — он снимает трубку первым. */
  opening: string
}

export type ScenarioGoal =
  | 'give_mc'
  | 'confirm_equipment'
  | 'get_load_details'
  | 'confirm_driver'
  | 'negotiate_rate'
  | 'book_load'
  | 'get_rate_con'

// ── Состояние звонка ────────────────────────────────────────────────────────

export type CallStage =
  | 'idle'
  | 'ringing'
  | 'greeting'
  | 'qualifying'
  | 'load_details'
  | 'capacity'
  | 'negotiation'
  | 'booking'
  | 'wrap_up'
  | 'ended'

export type EndReason =
  | 'booked'
  | 'no_deal'
  | 'broker_hung_up'
  | 'carrier_rejected'
  | 'dispatcher_left'

export interface RateOffer {
  by: 'broker' | 'dispatcher'
  amount: number
  atTurn: number
}

export interface BookingInfo {
  driverName: string
  truckNumber: string
  trailerNumber: string
  driverPhone: string
  email: string
}

/**
 * Факты звонка. Меняются ТОЛЬКО через вызовы инструментов — никаких регулярок
 * по транскрипту. В старой версии `locationAnswered` срабатывал на слово
 * «ready» в любом контексте; здесь такое невозможно в принципе.
 */
export interface CallFacts {
  mcNumber: string | null
  /** На каком ходу диспетчера прозвучал MC. Профессионал называет его сразу. */
  mcGivenAtTurn: number | null
  carrier: CarrierRecord | null
  equipment: Equipment | null
  driverLocation: string | null
  driverCanMakePickup: boolean | null
  loadPresented: boolean
  marketChecked: boolean
  offers: RateOffer[]
  /** Текущее предложение брокера — от него считается следующий шаг торга. */
  currentBrokerOffer: number | null
  agreedRate: number | null
  booking: Partial<BookingInfo>
  rateConSentTo: string | null
  endReason: EndReason | null
}

export interface CallState {
  stage: CallStage
  facts: CallFacts
  /** Раундов торга позади — от этого зависит, когда брокер скажет «финальная». */
  negotiationRounds: number
  /** Терпение брокера: убывает от повторов, воды и потерянного времени. */
  patienceLeft: number
  turn: number
  startedAt: number | null
  endedAt: number | null
}

// ── Лента разговора ─────────────────────────────────────────────────────────

export type TurnRole = 'broker' | 'dispatcher'

export interface Utterance {
  id: string
  role: TurnRole
  /** Текст, который уже проявлен на экране. Растёт по мере произнесения. */
  text: string
  /** Финальный текст известен целиком (пайплайн знает его до озвучки). */
  final: boolean
  at: number
  /** Реплику оборвали перебиванием — видно в разборе. */
  interrupted?: boolean
}

/** Событие инструмента, которое вклинивается прямо в ленту разговора. */
export interface ToolEvent {
  id: string
  tool: string
  at: number
  status: 'running' | 'done' | 'failed'
  payload?: unknown
}

export type FeedItem =
  | ({ kind: 'utterance' } & Utterance)
  | ({ kind: 'tool' } & ToolEvent)

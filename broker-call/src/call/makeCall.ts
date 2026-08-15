import type { BrokerPersona, BrokerStyle, Equipment, Load, Place } from '../types'
import { createRng, type Rng } from './rng'
import { randomSeed } from './seeds'
import { MALE_VOICES, FEMALE_VOICES } from '../voice/voices'

/**
 * Набор звонка: кому звоним и по какому грузу.
 *
 * Раньше их было восемь штук, записанных руками, и каждый давал один и тот же
 * разговор: тот же брокер, тот же груз, тот же потолок ставки, тот же поток
 * случайных чисел — сид равнялся id сценария. Диспетчер, прошедший «Первый
 * звонок» дважды, второй раз слышал ровно то же самое.
 *
 * Теперь звонок собирается заново каждый раз: другое имя, другая компания,
 * другой голос и характер, другой груз и другие цифры. Сид всё ещё есть — по
 * нему звонок воспроизводится целиком, и на этом держатся тесты и разбор.
 * Меняется только то, что сид больше не берётся из сценария.
 */
export interface CallSetup {
  /** Он же сид: по нему звонок собирается заново байт в байт. */
  id: string
  broker: BrokerPersona
  load: Load
  /** Голос озвучки — выбран под пол и характер, а не привязан к имени в коде. */
  voice: string
}

export function makeCallSetup(seed?: string): CallSetup {
  const id = seed ?? randomSeed()
  const rng = createRng(id)

  const { broker, female } = makeBroker(rng)
  const load = makeLoad(rng)
  const voice = rng.pick(female ? FEMALE_VOICES : MALE_VOICES)

  return { id, broker, load, voice }
}

// ── Брокер ──────────────────────────────────────────────────────────────────

const FIRST_M = [
  'Mike', 'Ray', 'Dave', 'Tony', 'Greg', 'Marcus', 'Vince', 'Chuck', 'Derek', 'Sal',
  'Brett', 'Curtis', 'Hector', 'Randy', 'Wes', 'Omar', 'Trent', 'Doug',
] as const

const FIRST_F = [
  'Sarah', 'Nina', 'Karen', 'Deb', 'Monica', 'Tanya', 'Rachel', 'Gina', 'Priya',
  'Lisa', 'Angie', 'Renee', 'Carla', 'Bree', 'Yvette', 'Dana',
] as const

const LAST = [
  'Harrison', 'Bennett', 'Whitmore', 'Coleman', 'Alvarez', 'Doyle', 'Kaminski',
  'Reyes', 'Patel', 'Novak', 'Brennan', 'Okafor', 'Lindquist', 'Marchetti',
  'Sandoval', 'Duffy', 'Castellano', 'Boyd',
] as const

const COMPANY_HEAD = [
  'Apex', 'Atlas', 'Midwest', 'Lone Star', 'Summit', 'Ironwood', 'Blue Ridge',
  'Cardinal', 'Redline', 'Northbound', 'Keystone', 'Gulf Coast', 'Highpoint',
  'Silver Creek', 'Anchor', 'Tri-State', 'Great Lakes', 'Pinnacle',
] as const

const COMPANY_TAIL = [
  'Freight Solutions', 'Logistics', 'Carrier Group', 'Freight Partners',
  'Transport Services', 'Freight Systems', 'Brokerage', 'Freight Group',
  'Logistics Group', 'Transportation',
] as const

/**
 * Черты характера — единственное, что уходит в промпт из персоны. Берём три из
 * набора под стиль: одинаковый стиль не должен означать одинакового человека.
 */
const TRAITS: Record<BrokerStyle, readonly string[]> = {
  friendly: [
    'You take a second to be human before you get to business',
    'You give a carrier room to think instead of talking over them',
    'You remember who hauled well for you and you say so',
    'You explain your reasoning instead of just saying no',
    'You will nudge a nervous dispatcher back on track rather than hang up',
  ],
  tough: [
    'Twenty years on the desk — you have heard every story',
    'You do not fill silence; you let it sit until they talk',
    'You cut off anything that is not a number or a fact',
    'You respect a dispatcher who pushes back with real reasons',
    'You do not repeat yourself twice for anyone',
  ],
  rushed: [
    'You have four other lines blinking and you sound like it',
    'You hate small talk and you say so',
    'You want the answer before they finish the question',
    'You talk in fragments when you are moving fast',
    'You will end a call that is going nowhere without apologizing',
  ],
  bureaucratic: [
    'You go down your checklist and you do not skip a line',
    'Paperwork is not a formality to you — it is the job',
    'You repeat numbers back to confirm them',
    'You will not move an inch on a requirement that is written down',
    'You ask the same question twice if the first answer was vague',
  ],
  stressed: [
    'Something else on your board is on fire and it leaks into your voice',
    'You are short not because you are rude but because you are behind',
    'You want commitment, not maybes',
    'You get sharper when an answer sounds like a hedge',
    'You soften the moment someone actually solves your problem',
  ],
}

const STYLES: readonly BrokerStyle[] = ['friendly', 'tough', 'rushed', 'bureaucratic', 'stressed']

/** Насколько тяжело с этим стилем и как он торгуется. Внутри — разброс. */
const STYLE_SHAPE: Record<
  BrokerStyle,
  { difficulty: 1 | 2 | 3 | 4; patience: [number, number]; step: [number, number]; hangUp: number }
> = {
  friendly: { difficulty: 1, patience: [5, 7], step: [50, 100], hangUp: 0.02 },
  bureaucratic: { difficulty: 2, patience: [4, 6], step: [40, 75], hangUp: 0.05 },
  stressed: { difficulty: 3, patience: [3, 5], step: [50, 100], hangUp: 0.1 },
  rushed: { difficulty: 3, patience: [2, 4], step: [25, 60], hangUp: 0.15 },
  tough: { difficulty: 4, patience: [2, 3], step: [25, 50], hangUp: 0.3 },
}

function makeBroker(rng: Rng): { broker: BrokerPersona; female: boolean } {
  const style = rng.pick(STYLES)
  const shape = STYLE_SHAPE[style]
  const female = rng.chance(0.42)
  const first = rng.pick(female ? FIRST_F : FIRST_M)
  const name = `${first} ${rng.pick(LAST)}`
  const company = `${rng.pick(COMPANY_HEAD)} ${rng.pick(COMPANY_TAIL)}`

  const stepLow = rng.int(shape.step[0], shape.step[1])

  return {
    female,
    broker: {
      id: `gen-${first.toLowerCase()}-${rng.int(1000, 9999)}`,
      name,
      company,
      style,
      difficulty: shape.difficulty,
      traits: pickSome(rng, TRAITS[style], 3),
      patience: rng.int(shape.patience[0], shape.patience[1]),
      concessionStep: [stepLow, stepLow + rng.int(20, 50)],
      hangUpRisk: shape.hangUp,
    },
  }
}

// ── Груз ────────────────────────────────────────────────────────────────────

interface Lane {
  from: Place
  to: Place
  miles: number
  /** Рынок DAT по этому лейну, доллары за милю. */
  perMile: number
}

const LANES: readonly Lane[] = [
  { from: p('Chicago', 'IL'), to: p('Nashville', 'TN'), miles: 470, perMile: 2.6 },
  { from: p('Chicago', 'IL'), to: p('Dallas', 'TX'), miles: 970, perMile: 2.4 },
  { from: p('Dallas', 'TX'), to: p('Atlanta', 'GA'), miles: 780, perMile: 2.05 },
  { from: p('Atlanta', 'GA'), to: p('Miami', 'FL'), miles: 660, perMile: 2.3 },
  { from: p('Los Angeles', 'CA'), to: p('Phoenix', 'AZ'), miles: 375, perMile: 2.55 },
  { from: p('Los Angeles', 'CA'), to: p('Denver', 'CO'), miles: 1020, perMile: 2.5 },
  { from: p('Houston', 'TX'), to: p('Memphis', 'TN'), miles: 570, perMile: 2.25 },
  { from: p('Phoenix', 'AZ'), to: p('Dallas', 'TX'), miles: 1065, perMile: 1.45 },
  { from: p('Chicago', 'IL'), to: p('Boston', 'MA'), miles: 985, perMile: 2.9 },
  { from: p('Seattle', 'WA'), to: p('Salt Lake City', 'UT'), miles: 830, perMile: 2.15 },
  { from: p('Charlotte', 'NC'), to: p('Newark', 'NJ'), miles: 630, perMile: 2.75 },
  { from: p('Kansas City', 'MO'), to: p('Denver', 'CO'), miles: 600, perMile: 2.1 },
  { from: p('Laredo', 'TX'), to: p('Chicago', 'IL'), miles: 1385, perMile: 2.2 },
  { from: p('Fresno', 'CA'), to: p('Chicago', 'IL'), miles: 2100, perMile: 2.35 },
  { from: p('Columbus', 'OH'), to: p('Orlando', 'FL'), miles: 900, perMile: 2.2 },
  { from: p('Minneapolis', 'MN'), to: p('Detroit', 'MI'), miles: 700, perMile: 2.35 },
]

interface Freight {
  commodity: string
  equipment: Equipment
  weight: [number, number]
  /** Дорогой груз — брокер придирчивее к страховке. */
  value?: [number, number]
  notes?: readonly string[]
  equipmentNote?: string
}

const FREIGHT: readonly Freight[] = [
  { commodity: 'Auto parts, palletized', equipment: 'dry_van', weight: [24000, 38000] },
  { commodity: 'Packaged electronics', equipment: 'dry_van', weight: [14000, 26000], value: [90000, 220000], notes: ['High-value load — carrier insurance gets checked'] },
  { commodity: 'Retail goods, floor loaded', equipment: 'dry_van', weight: [30000, 42000], notes: ['Floor loaded — driver unloads or pays a lumper'] },
  { commodity: 'Paper products', equipment: 'dry_van', weight: [36000, 44000] },
  { commodity: 'Fresh strawberries', equipment: 'reefer', weight: [38000, 42000], notes: ['Continuous at 34°F', 'Temperature download required at delivery'], equipmentNote: 'reefer, continuous 34°F' },
  { commodity: 'Frozen poultry', equipment: 'reefer', weight: [40000, 44000], notes: ['Continuous at -10°F'], equipmentNote: 'reefer, continuous -10°F' },
  { commodity: 'Pharmaceuticals', equipment: 'reefer', weight: [8000, 18000], value: [200000, 600000], notes: ['Sealed trailer, no cross-dock', 'Temperature 36–46°F'], equipmentNote: 'reefer, 36–46°F' },
  { commodity: 'Structural steel', equipment: 'flatbed', weight: [42000, 47000], notes: ['Tarps required', 'Chains and binders, not straps'] },
  { commodity: 'Lumber banded', equipment: 'flatbed', weight: [40000, 46000], notes: ['Tarps required'] },
  { commodity: 'Construction equipment', equipment: 'step_deck', weight: [35000, 44000], notes: ['Ramps needed at pickup'] },
  { commodity: 'Bottled beverages', equipment: 'dry_van', weight: [42000, 45000], notes: ['Heavy load — check your axle weights'] },
  { commodity: 'Medical supplies', equipment: 'dry_van', weight: [10000, 20000], value: [80000, 180000] },
]

const PAYMENT_TERMS = [
  'Net 30, QuickPay at 2% in 2 days',
  'Net 30 standard',
  'Net 21, QuickPay at 3% same day',
  'Net 45, no QuickPay',
] as const

const PICKUP_LABELS = [
  'today 2 PM–6 PM',
  'tomorrow 6 AM sharp',
  'tomorrow 8 AM–12 PM',
  'tomorrow 1 PM–5 PM',
  'Monday first come first served',
  'in the morning, 7 AM appointment',
] as const

const DELIVERY_LABELS = [
  'next day by 5 PM',
  'in two days, 8 AM appointment',
  'in two days, first come first served',
  'Friday before noon',
  'in three days, 10 AM–2 PM',
] as const

function makeLoad(rng: Rng): Load {
  const lane = rng.pick(LANES)
  const freight = rng.pick(FREIGHT)

  // Рынок по лейну гуляет: тот же маршрут на этой неделе стоит не столько же,
  // сколько на прошлой. Без этого все звонки по одному лейну совпадали в цифрах.
  const perMile = round2(lane.perMile * (0.9 + rng.next() * 0.22))
  const market = lane.miles * perMile

  // Брокер вешает на борд ниже рынка — торг начинается с его цифры.
  const posted = round25(market * (0.84 + rng.next() * 0.12))
  // Иногда ставка твёрдая: торговаться не о чем, и это тоже надо уметь узнать.
  const firm = rng.chance(0.18)
  const maxRate = firm ? posted : round25(market * (0.99 + rng.next() * 0.13))

  const weightLbs = round100(rng.int(freight.weight[0], freight.weight[1]))
  const value = freight.value ? round100(rng.int(freight.value[0], freight.value[1])) : undefined

  return {
    id: `gen-${lane.from.city.slice(0, 3).toLowerCase()}-${rng.int(1000, 9999)}`,
    ref: `${lane.from.state}-${rng.int(1000, 9999)}`,
    origin: lane.from,
    destination: lane.to,
    miles: lane.miles,
    equipment: freight.equipment,
    ...(freight.equipmentNote ? { equipmentNote: freight.equipmentNote } : {}),
    commodity: freight.commodity,
    weightLbs,
    ...(value ? { valueUsd: value } : {}),
    pickup: { label: rng.pick(PICKUP_LABELS), strict: rng.chance(0.4) },
    delivery: { label: rng.pick(DELIVERY_LABELS), strict: rng.chance(0.3) },
    postedRate: posted,
    maxRate: Math.max(maxRate, posted),
    marketRatePerMile: perMile,
    notes: [...(freight.notes ?? [])],
    paymentTerms: rng.pick(PAYMENT_TERMS),
  }
}

// ── Мелочи ──────────────────────────────────────────────────────────────────

function p(city: string, state: string): Place {
  return { city, state }
}

function pickSome<T>(rng: Rng, items: readonly T[], count: number): T[] {
  const pool = [...items]
  const out: T[] = []
  for (let i = 0; i < count && pool.length > 0; i++) {
    out.push(pool.splice(rng.int(0, pool.length - 1), 1)[0]!)
  }
  return out
}

function round25(n: number): number {
  return Math.round(n / 25) * 25
}

function round100(n: number): number {
  return Math.round(n / 100) * 100
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

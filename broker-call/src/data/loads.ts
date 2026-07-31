import type { Load } from '../types'

// Грузы перенесены из pages/scenarios-realistic-2026.js и simul-dialogs-database.js
// с одним принципиальным добавлением: maxRate. В старой версии потолок брокера
// был строкой внутри промпта («your absolute max is $2,150»), и модель могла
// его проигнорировать. Здесь это число, по которому считает код.

export const LOADS: readonly Load[] = [
  {
    id: 'chi-nsh-autoparts',
    ref: 'CH-2847',
    origin: { city: 'Chicago', state: 'IL', address: '2450 West Fulton Street' },
    destination: { city: 'Nashville', state: 'TN', address: '1800 Elm Hill Pike' },
    miles: 470,
    equipment: 'dry_van',
    equipmentNote: "53' dry van",
    commodity: 'Auto parts, palletized',
    weightLbs: 38000,
    pickup: { label: 'today 3:00 PM', strict: false },
    delivery: { label: 'tomorrow by 12:00 PM', strict: true },
    postedRate: 1650,
    maxRate: 1900,
    marketRatePerMile: 3.6,
    notes: ['No-touch freight', '24 pallets', 'Driver assist not required'],
    paymentTerms: 'Net 15',
  },
  {
    id: 'dal-atl-autoparts',
    ref: 'DA-5512',
    origin: { city: 'Dallas', state: 'TX', address: '4100 Sunbelt Drive' },
    destination: { city: 'Atlanta', state: 'GA', address: '3300 Fulton Industrial Blvd' },
    miles: 780,
    equipment: 'dry_van',
    equipmentNote: "53' dry van",
    commodity: 'Auto parts, no-touch',
    weightLbs: 42000,
    pickup: { label: 'tomorrow 6:00 AM sharp', strict: true },
    delivery: { label: 'Thursday by 2:00 PM', strict: true },
    postedRate: 1750,
    maxRate: 2150,
    marketRatePerMile: 2.05,
    notes: ['Dock appointment — cannot be late', 'Detention: 2 hours free, then $75/hour'],
    paymentTerms: 'Net 15, repeat shipper',
  },
  {
    id: 'chi-mia-strawberries',
    ref: 'RF-9034',
    origin: { city: 'Chicago', state: 'IL', address: 'Sysco Foods, 2200 W 35th St, dock #7' },
    destination: { city: 'Miami', state: 'FL', address: 'Sysco Miami, 8300 NW 53rd St' },
    miles: 1380,
    equipment: 'reefer',
    equipmentNote: "53' reefer, continuous 34°F",
    commodity: 'Fresh strawberries',
    weightLbs: 38000,
    pickup: { label: 'tomorrow 4:00 AM', strict: true },
    delivery: { label: 'day after tomorrow by 5:00 PM', strict: true },
    postedRate: 3450,
    maxRate: 3450,
    marketRatePerMile: 2.4,
    notes: [
      'Trailer must be pre-cooled to 34°F before arrival',
      'Temperature recorder required',
      'Rate is firm — reefer capacity is tight, broker will not go up',
    ],
    paymentTerms: 'Net 30',
  },
  {
    id: 'chi-dal-electronics',
    ref: 'CD-1190',
    origin: { city: 'Chicago', state: 'IL', address: '2450 West Fulton Street' },
    destination: { city: 'Dallas', state: 'TX', address: '3500 Maple Avenue' },
    miles: 1000,
    equipment: 'dry_van',
    equipmentNote: "53' dry van, sealed",
    commodity: 'Packaged electronics',
    weightLbs: 42000,
    valueUsd: 180000,
    pickup: { label: 'tomorrow 8:00 AM – 12:00 PM', strict: false },
    delivery: { label: 'Thursday 2:00 PM', strict: true },
    postedRate: 2400,
    maxRate: 2750,
    marketRatePerMile: 2.4,
    notes: [
      'High-value cargo — $250K cargo insurance required',
      'No unattended stops, team preferred',
      'Seal must stay intact, photo at pickup and delivery',
    ],
    paymentTerms: 'Net 30, QuickPay 2% available',
  },
  {
    id: 'la-den-electronics',
    ref: 'LD-7781',
    origin: { city: 'Los Angeles', state: 'CA' },
    destination: { city: 'Denver', state: 'CO', address: 'Best Buy DC, closes 5:00 PM sharp' },
    miles: 1020,
    equipment: 'dry_van',
    equipmentNote: "53' dry van",
    commodity: 'Consumer electronics',
    weightLbs: 36000,
    valueUsd: 180000,
    pickup: { label: 'picked up yesterday 8:00 AM', strict: false },
    delivery: { label: 'TODAY by 5:00 PM — receiver closes', strict: true },
    postedRate: 2600,
    maxRate: 2600,
    marketRatePerMile: 2.55,
    notes: [
      'Load is already in transit — this call is about a problem, not a rate',
      'Receiver refuses late deliveries outright',
      'Major account — broker loses the shipper if this misses',
    ],
    paymentTerms: 'Net 15',
  },
  {
    id: 'hou-nsh-retail',
    ref: 'HN-4420',
    origin: { city: 'Houston', state: 'TX' },
    destination: { city: 'Nashville', state: 'TN' },
    miles: 790,
    equipment: 'dry_van',
    equipmentNote: "53' dry van",
    commodity: 'Retail goods',
    weightLbs: 40000,
    pickup: { label: 'Thursday 8:00 AM', strict: false },
    delivery: { label: 'Friday by 3:00 PM', strict: false },
    postedRate: 1900,
    maxRate: 2150,
    marketRatePerMile: 2.3,
    notes: ['Repeat lane', 'Broker wants a carrier he can call again'],
    paymentTerms: 'Net 15',
  },
  {
    id: 'phx-dal-drygoods',
    ref: 'PD-3308',
    origin: { city: 'Phoenix', state: 'AZ' },
    destination: { city: 'Dallas', state: 'TX' },
    miles: 1065,
    equipment: 'dry_van',
    equipmentNote: "53' dry van",
    commodity: 'General freight',
    weightLbs: 32000,
    pickup: { label: 'Friday 10:00 AM', strict: false },
    delivery: { label: 'Saturday by 6:00 PM', strict: false },
    postedRate: 1400,
    maxRate: 1600,
    marketRatePerMile: 1.45,
    notes: ['Soft lane, broker has options', 'Cold call — carrier must earn the conversation'],
    paymentTerms: 'Net 30',
  },
  {
    id: 'chi-bos-medical',
    ref: 'CB-6650',
    origin: { city: 'Chicago', state: 'IL' },
    destination: { city: 'Boston', state: 'MA' },
    miles: 990,
    equipment: 'reefer',
    equipmentNote: "53' reefer, 36–38°F",
    commodity: 'Medical equipment',
    weightLbs: 38000,
    pickup: { label: 'today 6:00 PM', strict: true },
    delivery: { label: 'in 2 days by 10:00 AM', strict: true },
    postedRate: 2475,
    maxRate: 2870,
    marketRatePerMile: 2.9,
    notes: ['Time-critical medical freight', 'Broker is in a hurry and hates small talk'],
    paymentTerms: 'Net 15',
  },
] as const

const BY_ID = new Map(LOADS.map((l) => [l.id, l]))

export function getLoad(id: string): Load {
  const load = BY_ID.get(id)
  // Сценарий, ссылающийся на несуществующий груз, — ошибка данных, а не
  // ситуация времени выполнения. Падаем громко здесь, а не тихо в середине звонка.
  if (!load) throw new Error(`Unknown load: ${id}`)
  return load
}

export function laneLabel(load: Load): string {
  return `${load.origin.city}, ${load.origin.state} → ${load.destination.city}, ${load.destination.state}`
}

export function ratePerMile(amount: number, load: Load): number {
  return Math.round((amount / load.miles) * 100) / 100
}

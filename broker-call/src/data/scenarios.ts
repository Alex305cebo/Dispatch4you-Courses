import type { Scenario } from '../types'

// Сценарии = груз + характер брокера + цель звонка. Порядок в массиве — это и
// есть прогрессия: от дружелюбного Майка к Рэю, который бросает трубку.

export const SCENARIOS: readonly Scenario[] = [
  {
    id: 'first-call',
    kind: 'inbound_load',
    brokerId: 'mike-apex',
    loadId: 'chi-nsh-autoparts',
    difficulty: 1,
    title: { ru: 'Первый звонок', en: 'First call' },
    objective: {
      ru: 'Пройти звонок целиком: представиться, назвать MC, забрать груз и договориться о ставке.',
      en: 'Run a full call: introduce yourself, give your MC, take the load and agree on a rate.',
    },
    goals: ['give_mc', 'confirm_equipment', 'get_load_details', 'confirm_driver', 'negotiate_rate', 'book_load'],
    opening:
      "Thank you for calling Apex Freight Solutions, this is Mike, how can I help you today?",
  },
  {
    id: 'vetting',
    kind: 'inbound_load',
    brokerId: 'sarah-midwest',
    loadId: 'chi-dal-electronics',
    difficulty: 2,
    title: { ru: 'Проверка перевозчика', en: 'Carrier vetting' },
    objective: {
      ru: 'Груз на $180 тысяч. Брокер проверит авторитетность, страховку и историю claims — держи цифры наготове.',
      en: 'A $180K load. The broker will vet authority, insurance and claims history — have your numbers ready.',
    },
    goals: ['give_mc', 'confirm_equipment', 'get_load_details', 'confirm_driver', 'negotiate_rate'],
    opening:
      "Good morning, Midwest Freight Solutions, this is Sarah speaking. What can I do for you?",
  },
  {
    id: 'rate-fight',
    kind: 'negotiate',
    brokerId: 'ray-atlas',
    loadId: 'dal-atl-autoparts',
    difficulty: 4,
    title: { ru: 'Торг', en: 'The rate fight' },
    objective: {
      ru: 'Ставка на борде $1,750, рынок $2.05 за милю. Выторгуй столько, сколько сможешь обосновать.',
      en: 'Posted at $1,750, market is $2.05 a mile. Get every dollar you can actually justify.',
    },
    goals: ['give_mc', 'confirm_equipment', 'negotiate_rate', 'book_load'],
    opening: "Atlas Carrier Group, Ray.",
  },
  {
    id: 'reefer-booking',
    kind: 'book',
    brokerId: 'sarah-midwest',
    loadId: 'chi-mia-strawberries',
    difficulty: 3,
    title: { ru: 'Букинг рефера', en: 'Booking a reefer' },
    objective: {
      ru: 'Ставка твёрдая. Задача — точно снять все требования по температуре и сдать данные водителя без ошибок.',
      en: 'The rate is firm. Your job is to capture every temperature requirement and hand over driver details cleanly.',
    },
    goals: ['give_mc', 'confirm_equipment', 'get_load_details', 'confirm_driver', 'book_load', 'get_rate_con'],
    opening:
      "Midwest Freight Solutions, Sarah. Are you calling on the Chicago to Miami reefer?",
  },
  {
    id: 'load-in-trouble',
    kind: 'problem',
    brokerId: 'nina-summit',
    loadId: 'la-den-electronics',
    difficulty: 3,
    title: { ru: 'Груз опаздывает', en: 'Load in trouble' },
    objective: {
      ru: 'Груз в пути и не успевает. Нужны точное местоположение, честный ETA и конкретный план — без оправданий.',
      en: 'The load is running late. Give an exact location, an honest ETA and a concrete plan — no excuses.',
    },
    goals: ['confirm_driver'],
    opening:
      "Summit Freight, Nina. I've been trying to reach somebody about load LD-7781 — where is my driver right now?",
  },
  {
    id: 'cold-call',
    kind: 'cold',
    brokerId: 'dave-lonestar',
    loadId: 'phx-dal-drygoods',
    difficulty: 3,
    title: { ru: 'Холодный звонок', en: 'Cold call' },
    objective: {
      ru: 'Тебя не ждут. Есть примерно минута, чтобы доказать, что с тобой стоит работать.',
      en: 'Nobody is expecting you. You have about a minute to prove you are worth the time.',
    },
    goals: ['give_mc', 'confirm_equipment', 'get_load_details'],
    opening: "Lone Star Logistics, Dave. Go ahead.",
  },
  {
    id: 'repeat-business',
    kind: 'followup',
    brokerId: 'mike-apex',
    loadId: 'hou-nsh-retail',
    difficulty: 2,
    title: { ru: 'Повторный контакт', en: 'Repeat business' },
    objective: {
      ru: 'Вы уже возили вместе, и всё прошло гладко. Закрепи отношения и забери лейн на постоянку.',
      en: 'You have hauled together and it went well. Lock in the relationship and take the lane long-term.',
    },
    goals: ['confirm_equipment', 'get_load_details', 'negotiate_rate', 'book_load'],
    opening:
      "Apex Freight, this is Mike — hey, good to hear from you again. What have you got available this week?",
  },
  {
    id: 'rush-hour',
    kind: 'inbound_load',
    brokerId: 'dave-lonestar',
    loadId: 'chi-bos-medical',
    difficulty: 4,
    title: { ru: 'Брокер торопится', en: 'The rushed broker' },
    objective: {
      ru: 'Медицинский груз, брокер на бегу. Говори коротко и по делу — иначе он положит трубку.',
      en: 'Medical freight and a broker on the move. Be short and specific or he hangs up.',
    },
    goals: ['give_mc', 'confirm_equipment', 'get_load_details', 'confirm_driver', 'negotiate_rate'],
    opening: "Lone Star, Dave. Make it quick, I'm walking into something.",
  },
]

const BY_ID = new Map(SCENARIOS.map((s) => [s.id, s]))

export function getScenario(id: string): Scenario {
  const scenario = BY_ID.get(id)
  if (!scenario) throw new Error(`Unknown scenario: ${id}`)
  return scenario
}

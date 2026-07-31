import type { BrokerPersona } from '../types'

// Характеры взяты из simul-dialogs-database.js («торопливый», «дружелюбный»,
// «жёсткий») и разложены на числа: терпение, шаг уступки, риск бросить трубку.
// Промпт получает только traits — всё остальное считает код, поэтому характер
// нельзя «уговорить» словами.

export const BROKERS: readonly BrokerPersona[] = [
  {
    id: 'mike-apex',
    name: 'Mike Harrison',
    company: 'Apex Freight Solutions',
    style: 'friendly',
    difficulty: 1,
    traits: [
      'Even-tempered and helpful, gives the carrier room to think',
      'Explains load details clearly without being asked twice',
      'Will nudge a nervous dispatcher back on track',
    ],
    patience: 6,
    concessionStep: [50, 75],
    hangUpRisk: 0.02,
  },
  {
    id: 'sarah-midwest',
    name: 'Sarah Coleman',
    company: 'Midwest Freight Solutions',
    style: 'bureaucratic',
    difficulty: 2,
    traits: [
      'Thorough and procedural — vets the carrier before discussing anything else',
      'Asks about claims history, insurance limits and payment terms',
      'Polite but will not skip a step, no matter how much the carrier pushes',
    ],
    patience: 5,
    concessionStep: [50, 75],
    hangUpRisk: 0.05,
  },
  {
    id: 'dave-lonestar',
    name: 'Dave Whitmore',
    company: 'Lone Star Logistics',
    style: 'rushed',
    difficulty: 3,
    traits: [
      'Always mid-task, speaks in clipped sentences, hates small talk',
      'Cuts off rambling answers and repeats the question',
      'Rewards a dispatcher who leads with MC number and equipment',
    ],
    patience: 3,
    concessionStep: [25, 50],
    hangUpRisk: 0.15,
  },
  {
    id: 'ray-atlas',
    name: 'Ray Bennett',
    company: 'Atlas Carrier Group',
    style: 'tough',
    difficulty: 4,
    traits: [
      'Twenty years on the desk, has heard every negotiation line there is',
      'Pushes back hard on rate, makes the carrier justify every dollar',
      'Openly unimpressed by vague answers, will end the call rather than waste time',
    ],
    patience: 2,
    concessionStep: [25, 50],
    hangUpRisk: 0.3,
  },
  {
    id: 'nina-summit',
    name: 'Nina Alvarez',
    company: 'Summit Freight Partners',
    style: 'stressed',
    difficulty: 3,
    traits: [
      'Handling a load that is running late and a shipper breathing down her neck',
      'Wants exact locations, exact times, and a concrete plan — not excuses',
      'Softens immediately when the dispatcher takes ownership of the problem',
    ],
    patience: 3,
    concessionStep: [50, 100],
    hangUpRisk: 0.1,
  },
]

const BY_ID = new Map(BROKERS.map((b) => [b.id, b]))

export function getBroker(id: string): BrokerPersona {
  const broker = BY_ID.get(id)
  if (!broker) throw new Error(`Unknown broker: ${id}`)
  return broker
}

// ═══════════════════════════════════════════════════════
//  events.ts — генерация случайных событий
//  Механика из Game One: взвешенный пул событий,
//  привязка к конкретному траку, варианты решения
// ═══════════════════════════════════════════════════════
import type { GameEvent, Truck } from '@/types';

interface EventTemplate {
  type: GameEvent['type'];
  weight: number;
  description: (truck: Truck) => string;
  moneyImpact: () => number; // отрицательное = расход
}

const EVENT_POOL: EventTemplate[] = [
  {
    type: 'breakdown',
    weight: 5,
    description: (t) => `${t.number} (${t.driver.firstName}) — поломка на трассе. Нужен roadside assistance.`,
    moneyImpact: () => -(200 + Math.floor(Math.random() * 400)), // $200-600
  },
  {
    type: 'detention',
    weight: 20,
    description: (t) => `${t.number} ждёт на погрузке/разгрузке уже 2+ часа. Detention $75/час.`,
    moneyImpact: () => 75 * (1 + Math.floor(Math.random() * 3)), // $75-300 (доход)
  },
  {
    type: 'tonu',
    weight: 8,
    description: (t) => `Брокер отменил груз для ${t.number}. TONU fee $250.`,
    moneyImpact: () => 250, // доход (штраф брокеру)
  },
  {
    type: 'weather',
    weight: 25,
    description: (t) => `Плохая погода на маршруте ${t.number}. Скорость снижена на 30-50%.`,
    moneyImpact: () => 0,
  },
  {
    type: 'inspection',
    weight: 10,
    description: (t) => `DOT инспекция для ${t.number}. Задержка 30-60 минут.`,
    moneyImpact: () => Math.random() > 0.7 ? -(150 + Math.floor(Math.random() * 350)) : 0,
  },
  {
    type: 'hos',
    weight: 12,
    description: (t) => `${t.driver.firstName} (${t.number}) — HOS заканчивается. Нужна остановка на 10 часов.`,
    moneyImpact: () => 0,
  },
];

let eventIdCounter = 1;

/**
 * Генерирует случайное событие для одного из траков.
 * Вызывается из TickEngine с определённой вероятностью.
 */
export function generateRandomEvent(trucks: Truck[]): GameEvent | null {
  // Только для траков в движении или на погрузке/разгрузке
  const eligibleTrucks = trucks.filter(
    (t) => t.status === 'driving' || t.status === 'at_pickup' || t.status === 'at_delivery'
  );
  if (eligibleTrucks.length === 0) return null;

  // Взвешенный выбор типа события
  const totalWeight = EVENT_POOL.reduce((s, e) => s + e.weight, 0);
  let roll = Math.random() * totalWeight;
  let template: EventTemplate = EVENT_POOL[0];
  for (const t of EVENT_POOL) {
    roll -= t.weight;
    if (roll <= 0) {
      template = t;
      break;
    }
  }

  // Случайный трак
  const truck = eligibleTrucks[Math.floor(Math.random() * eligibleTrucks.length)];
  const money = template.moneyImpact();

  const event: GameEvent = {
    id: `evt_${String(eventIdCounter++).padStart(5, '0')}`,
    type: template.type,
    truckId: truck.id,
    timestamp: Date.now(),
    resolved: false,
    description: template.description(truck),
    impact: { money: money !== 0 ? money : undefined },
  };

  return event;
}

/**
 * Вероятность события за тик.
 * Game One: ~50% шанс каждые 32 игровые минуты = ~1.5% за минуту
 */
export function shouldTriggerEvent(gameTime: number): boolean {
  // Каждые 32 минут — 50% шанс
  if (gameTime % 32 < 1) {
    return Math.random() < 0.5;
  }
  return false;
}

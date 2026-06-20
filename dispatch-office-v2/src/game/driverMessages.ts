// ═══════════════════════════════════════════════════════
//  driverMessages.ts — SMS от водителей во время поездки
//  Добавляет жизни и реализма
// ═══════════════════════════════════════════════════════
import type { Truck } from '@/types';

interface DriverMessage {
  subject: string;
  message: string;
  priority: 'low' | 'medium';
}

const DRIVING_MESSAGES: DriverMessage[] = [
  { subject: '📍 Update', message: 'Making good time. Traffic is light.', priority: 'low' },
  { subject: '⛽ Fuel stop', message: 'Stopping for fuel. 15 min break.', priority: 'low' },
  { subject: '🚧 Traffic', message: 'Hit some traffic. Might be 20 min late.', priority: 'medium' },
  { subject: '☕ Break', message: 'Taking a quick coffee break. Back on road in 10.', priority: 'low' },
  { subject: '📍 Halfway', message: "Passed the halfway point. ETA looks good.", priority: 'low' },
  { subject: '🌧️ Weather', message: 'Rain started. Slowing down a bit for safety.', priority: 'medium' },
  { subject: '📻 Radio', message: 'Heard on CB there\'s a DOT checkpoint ahead. All good on my end.', priority: 'low' },
  { subject: '🛣️ Route', message: 'Taking the bypass to avoid construction zone.', priority: 'low' },
];

const PICKUP_MESSAGES: DriverMessage[] = [
  { subject: '📦 At pickup', message: "I'm at the shipper. Waiting for a dock.", priority: 'low' },
  { subject: '⏳ Loading', message: 'They started loading. Should be done in 30 min.', priority: 'low' },
  { subject: '😤 Waiting', message: "Been waiting 45 min for a dock. This place is slow.", priority: 'medium' },
  { subject: '✅ Loaded', message: 'All loaded up. BOL signed. Ready to roll.', priority: 'low' },
];

const DELIVERY_MESSAGES: DriverMessage[] = [
  { subject: '📍 Arrived', message: "At the receiver. Checking in now.", priority: 'low' },
  { subject: '⏳ Unloading', message: 'They\'re unloading. Looks like 30-45 min.', priority: 'low' },
  { subject: '😤 Detention', message: "Been here over an hour. Can you call the broker about detention?", priority: 'medium' },
];

/**
 * Генерирует случайное SMS от водителя.
 * Вызывается из TickEngine с ~3% шансом за минуту.
 */
export function generateDriverMessage(truck: Truck): DriverMessage | null {
  let pool: DriverMessage[];

  switch (truck.status) {
    case 'driving':
      pool = DRIVING_MESSAGES;
      break;
    case 'at_pickup':
      pool = PICKUP_MESSAGES;
      break;
    case 'at_delivery':
      pool = DELIVERY_MESSAGES;
      break;
    default:
      return null;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

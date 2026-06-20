// ═══════════════════════════════════════════════════════
//  brokers.ts — пул брокеров
// ═══════════════════════════════════════════════════════
import type { Broker } from '@/types';

export const BROKERS: Broker[] = [
  { id: 'brk_1', name: 'Tom Wilson', company: 'FastFreight LLC', phone: '(615) 555-0142', email: 'tom@fastfreight.com', rating: 4.2 },
  { id: 'brk_2', name: 'Sarah Chen', company: 'QuickLoad Inc', phone: '(404) 555-0198', email: 'sarah@quickload.com', rating: 4.5 },
  { id: 'brk_3', name: 'Mike Johnson', company: 'TransConnect', phone: '(312) 555-0267', email: 'mike@transconnect.com', rating: 3.8 },
  { id: 'brk_4', name: 'Lisa Martinez', company: 'CargoLink Pro', phone: '(214) 555-0334', email: 'lisa@cargolink.com', rating: 4.0 },
  { id: 'brk_5', name: 'David Brown', company: 'National Freight', phone: '(713) 555-0411', email: 'david@nationalfreight.com', rating: 4.7 },
  { id: 'brk_6', name: 'Jennifer Lee', company: 'Pacific Logistics', phone: '(213) 555-0489', email: 'jen@pacificlog.com', rating: 3.9 },
  { id: 'brk_7', name: 'Robert Taylor', company: 'Midwest Carriers', phone: '(816) 555-0556', email: 'rob@midwestcarriers.com', rating: 4.1 },
  { id: 'brk_8', name: 'Amanda White', company: 'Southeast Express', phone: '(904) 555-0623', email: 'amanda@seexpress.com', rating: 4.4 },
];

export function randomBroker(): Broker {
  return BROKERS[Math.floor(Math.random() * BROKERS.length)];
}

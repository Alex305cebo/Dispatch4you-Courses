// ═══════════════════════════════════════════════════════
//  fleetGenerator.ts — создание стартового флота
// ═══════════════════════════════════════════════════════
import type { Truck, TruckType } from '@/types';
import { CITIES, randomCity } from './cities';
import { generateDriver } from './drivers';
import { generateRoute } from '@/utils/geo';

const TYPES: TruckType[] = ['dry_van', 'reefer', 'flatbed'];

/**
 * Создаёт стартовый флот согласно правилам:
 * - 1-2 трака на доставке (идут к delivery или стоят на разгрузке)
 * - остальные в пути (близкий/дальний рейс)
 */
export function generateFleet(count: 3 | 4 | 5): Truck[] {
  const trucks: Truck[] = [];

  for (let i = 0; i < count; i++) {
    const driver = generateDriver();
    const type = TYPES[Math.floor(Math.random() * TYPES.length)];
    const startCity = randomCity();
    const endCity = randomCity();

    // Распределение статусов:
    //   i === 0: trucks[0] — на разгрузке (at_delivery)
    //   i === 1: trucks[1] — едет к delivery (driving, прогресс > 50%)
    //   i >= 2: остальные в пути, разный прогресс
    let status: Truck['status'];
    let progress: number;

    if (i === 0) {
      status = 'at_delivery';
      progress = 1.0;
    } else if (i === 1) {
      status = 'driving';
      progress = 0.6 + Math.random() * 0.3;
    } else {
      status = 'driving';
      progress = Math.random() * 0.6;
    }

    const route = generateRoute(startCity.location, endCity.location);

    trucks.push({
      id: `truck_${i + 1}`,
      number: `T-${100 + i + 1}`,
      type,
      driver,
      status,
      location: startCity.location,
      currentCity: startCity.name,
      route,
      routeProgress: progress,
      eta: Date.now() + (1 - progress) * 8 * 3600 * 1000,
      milesDriven: Math.floor(Math.random() * 200000),
      revenue: 0,
      expenses: 0,
    });
  }

  return trucks;
}

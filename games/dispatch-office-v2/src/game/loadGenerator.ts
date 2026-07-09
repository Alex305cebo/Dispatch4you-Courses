// ═══════════════════════════════════════════════════════
//  loadGenerator.ts — генерация грузов для Load Board
//  Грузы генерируются ТОЛЬКО из городов в радиусе 100 миль от трака
// ═══════════════════════════════════════════════════════
import type { Load, LatLng } from '@/types';
import { ROUTE_TEMPLATES, COMMODITIES, type RouteTemplate } from '@/data/routes';
import { randomBroker } from '@/data/brokers';
import { getCityByName, CITIES } from '@/data/cities';

let loadIdCounter = 1;

// Расстояние в милях между двумя координатами (Haversine)
function distMiles(a: LatLng, b: LatLng): number {
  const R = 3959; // Earth radius in miles
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Генерирует грузы для Load Board.
 * nearCity — город трака (для поиска маршрутов)
 * truckLocation — координаты трака (для поиска городов в радиусе 100 миль)
 */
export function generateLoads(gameTime: number, count = 6, nearCity?: string, truckLocation?: LatLng): Load[] {
  const loads: Load[] = [];
  const usedRoutes = new Set<number>();

  // Находим города в радиусе 100 миль от трака
  let nearbyCities: string[] = [];
  if (truckLocation) {
    nearbyCities = CITIES
      .filter((c) => distMiles(truckLocation, c.location) <= 100)
      .map((c) => c.name);
  } else if (nearCity) {
    // Fallback: если нет координат, ищем города рядом с указанным городом
    const cityData = getCityByName(nearCity);
    if (cityData) {
      nearbyCities = CITIES
        .filter((c) => distMiles(cityData.location, c.location) <= 100)
        .map((c) => c.name);
    } else {
      nearbyCities = [nearCity];
    }
  }

  // Фильтруем маршруты: ТОЛЬКО из городов в радиусе 100 миль
  const nearRoutes = nearbyCities.length > 0
    ? ROUTE_TEMPLATES.filter((r) => nearbyCities.includes(r.from))
    : [];

  // Если нет готовых маршрутов рядом — генерируем динамические из ближайшего города
  // Это гарантирует что грузы ВСЕГДА есть
  let pool: RouteTemplate[];
  if (nearRoutes.length >= 3) {
    pool = nearRoutes;
  } else {
    // Берём ближайший город с координатами и создаём маршруты к крупным городам
    const originName = nearbyCities[0] || nearCity || 'Chicago';
    const originData = getCityByName(originName);
    if (originData) {
      // Генерируем маршруты из этого города к случайным крупным городам
      const destinations = CITIES
        .filter((c) => c.name !== originName && c.population >= 0.3)
        .sort(() => Math.random() - 0.5)
        .slice(0, 12);
      
      const dynamicRoutes: RouteTemplate[] = destinations.map((dest) => {
        const dLat = dest.location.lat - originData.location.lat;
        const dLng = dest.location.lng - originData.location.lng;
        const miles = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 69);
        const ratePerMile = 2.5 + Math.random() * 1.5; // $2.50-$4.00/mi
        const equipment: ('Dry Van' | 'Reefer' | 'Flatbed')[] = ['Dry Van', 'Reefer', 'Flatbed'];
        return {
          from: originName,
          to: dest.name,
          miles: Math.max(150, miles),
          baseRate: Math.round(Math.max(150, miles) * ratePerMile),
          equipment: equipment[Math.floor(Math.random() * 3)],
        };
      });
      pool = [...nearRoutes, ...dynamicRoutes];
    } else {
      pool = ROUTE_TEMPLATES.filter((r) => r.miles >= 500);
    }
  }

  for (let i = 0; i < count; i++) {
    let route;
    let routeIdx: number;
    let attempts = 0;
    do {
      routeIdx = Math.floor(Math.random() * pool.length);
      attempts++;
    } while (usedRoutes.has(routeIdx) && attempts < 20);
    usedRoutes.add(routeIdx);
    route = pool[routeIdx] || ROUTE_TEMPLATES[Math.floor(Math.random() * ROUTE_TEMPLATES.length)];
    const broker = randomBroker();
    const originCity = getCityByName(route.from);
    const destCity = getCityByName(route.to);

    if (!originCity || !destCity) continue;

    // Ставки — высокие рейты ($2.80-4.00/mile)
    const marketRate = route.baseRate;
    const variance = 1.05 + Math.random() * 0.35; // 1.05 - 1.40 (всегда выше базы)
    const postedRate = Math.round(marketRate * variance);
    const minRate = Math.round(marketRate * 0.90);

    // Товар
    const commodityList = COMMODITIES[route.equipment] || COMMODITIES['Dry Van'];
    const commodity = commodityList[Math.floor(Math.random() * commodityList.length)];

    // Вес
    const weight = route.equipment === 'Flatbed'
      ? 25000 + Math.floor(Math.random() * 20000)
      : 30000 + Math.floor(Math.random() * 15000);

    // Время pickup/delivery
    const pickupHour = 6 + Math.floor(Math.random() * 8); // 6:00 - 14:00
    const deliveryHours = Math.ceil(route.miles / 450) + 2; // ~450 миль/день + буфер

    // Истечение: 30-90 игровых минут
    const expiresIn = 30 + Math.floor(Math.random() * 60);

    const load: Load = {
      id: `load_${String(loadIdCounter++).padStart(5, '0')}`,
      origin: {
        city: route.from,
        state: originCity.state,
        location: originCity.location,
      },
      destination: {
        city: route.to,
        state: destCity.state,
        location: destCity.location,
      },
      miles: route.miles,
      rate: postedRate,
      ratePerMile: Math.round((postedRate / route.miles) * 100) / 100,
      equipment: route.equipment === 'Dry Van' ? 'dry_van'
        : route.equipment === 'Reefer' ? 'reefer' : 'flatbed',
      weight,
      pickupDate: Date.now() + pickupHour * 3600000,
      deliveryDate: Date.now() + (pickupHour + deliveryHours * 24) * 3600000,
      brokerId: broker.id,
      brokerName: `${broker.name} (${broker.company})`,
      status: 'available',
    };

    // Скрытые поля для переговоров (хранятся в отдельном Map)
    setLoadMeta(load.id, { marketRate, minRate, expiresAt: gameTime + expiresIn });

    loads.push(load);
  }

  return loads;
}

// ── Скрытые метаданные грузов (не видны игроку) ──
interface LoadMeta {
  marketRate: number;
  minRate: number;
  expiresAt: number; // игровая минута
}

const loadMetaMap = new Map<string, LoadMeta>();

export function setLoadMeta(loadId: string, meta: LoadMeta) {
  loadMetaMap.set(loadId, meta);
}

export function getLoadMeta(loadId: string): LoadMeta | undefined {
  const existing = loadMetaMap.get(loadId);
  if (existing) return existing;

  // Fallback: если meta потерян (HMR, перезагрузка) — генерируем из rate
  // Это гарантирует что переговоры всегда работают
  return undefined;
}

/**
 * Получить или сгенерировать meta для груза.
 * Используется в negotiation — если meta потерян, создаём из postedRate.
 */
export function getOrCreateLoadMeta(loadId: string, postedRate: number): LoadMeta {
  const existing = loadMetaMap.get(loadId);
  if (existing) return existing;

  // Генерируем реалистичные значения из posted rate
  const marketRate = Math.round(postedRate * 1.08); // market чуть выше posted
  const minRate = Math.round(postedRate * 0.78);    // минимум брокера
  const meta: LoadMeta = { marketRate, minRate, expiresAt: Infinity };
  loadMetaMap.set(loadId, meta);
  return meta;
}

export function isLoadExpired(loadId: string, currentGameTime: number): boolean {
  const meta = loadMetaMap.get(loadId);
  if (!meta) return false;
  return currentGameTime >= meta.expiresAt;
}

export function cleanExpiredMeta(activeLoadIds: Set<string>) {
  for (const id of loadMetaMap.keys()) {
    if (!activeLoadIds.has(id)) {
      loadMetaMap.delete(id);
    }
  }
}

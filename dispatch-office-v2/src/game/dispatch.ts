// ═══════════════════════════════════════════════════════
//  dispatch.ts — назначение грузов на траки
//  Маршрут строится через OSRM (реальные дороги)
// ═══════════════════════════════════════════════════════
import { useGameStore } from '@/store/gameStore';
import { fetchRoute } from '@/utils/routeService';
import type { LatLng } from '@/types';

/**
 * Назначить груз на трак.
 * Сразу строит маршрут через OSRM (быстрый, ~200ms).
 */
export async function dispatchTruckToLoad(truckId: string, loadId: string, agreedRate: number) {
  const store = useGameStore.getState();
  if (!store.session) return;

  const truck = store.session.trucks.find((t) => t.id === truckId);
  const load = store.session.loads.find((l) => l.id === loadId);
  if (!truck || !load) return;

  const from: LatLng = { lat: truck.location.lat, lng: truck.location.lng };
  const pickupLoc: LatLng = { lat: load.origin.location.lat, lng: load.origin.location.lng };
  const deliveryLoc: LatLng = { lat: load.destination.location.lat, lng: load.destination.location.lng };

  // Проверяем: трак уже в городе pickup? (расстояние < 30 миль)
  const distToPickup = Math.sqrt(Math.pow(from.lat - pickupLoc.lat, 2) + Math.pow(from.lng - pickupLoc.lng, 2)) * 69;
  const alreadyAtPickup = distToPickup < 30;

  // Определяем destination: если уже на pickup — едем сразу к delivery
  const destination = alreadyAtPickup ? deliveryLoc : pickupLoc;
  const phase = alreadyAtPickup ? 'to_delivery' as const : 'to_pickup' as const;

  // 1. Получаем маршрут по дорогам (OSRM с timeout 3 сек)
  let route: LatLng[];
  try {
    const timeout = new Promise<null>((r) => setTimeout(() => r(null), 3000));
    const osrmResult = await Promise.race([fetchRoute(from, destination), timeout]);
    if (osrmResult && osrmResult.path.length >= 3) {
      route = osrmResult.path;
    } else {
      route = buildStraightRoute(from, destination, 20);
    }
  } catch {
    route = buildStraightRoute(from, destination, 20);
  }

  // 2. bookLoad + route + phase — одна атомарная операция
  useGameStore.getState().bookLoad(loadId, truckId, agreedRate);
  useGameStore.getState().updateTruck(truckId, (t) => ({
    ...t,
    route,
    routeProgress: 0,
    deliveryPhase: phase,
    currentCity: alreadyAtPickup ? load.origin.city : t.currentCity,
  }));

  // 3. Закрываем лоудборд и уведомляем
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('close-loadboard'));
  }, 500);

  console.log('[dispatch] ✅', truck.number, '→', load.origin.city, `(${route.length} points)`);
}

/**
 * Построить маршрут для фазы to_delivery (вызывается из TickEngine).
 */
export async function buildDeliveryRoute(truckId: string, from: LatLng, to: LatLng): Promise<LatLng[]> {
  const result = await fetchRoute(from, to);
  if (result && result.path.length >= 3) {
    return result.path;
  }
  return buildStraightRoute(from, to, 15);
}

function buildStraightRoute(from: LatLng, to: LatLng, n: number): LatLng[] {
  const r: LatLng[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    r.push({ lat: from.lat + (to.lat - from.lat) * t, lng: from.lng + (to.lng - from.lng) * t });
  }
  return r;
}

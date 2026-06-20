// ═══════════════════════════════════════════════════════
//  routeService.ts — маршруты по реальным дорогам
//  OSRM (бесплатный, без API key, без лимитов)
// ═══════════════════════════════════════════════════════
import type { LatLng } from '@/types';

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

interface RouteResult {
  path: LatLng[];
  distanceMeters: number;
  durationSeconds: number;
}

const cache = new Map<string, RouteResult>();

function cacheKey(from: LatLng, to: LatLng): string {
  return `${from.lat.toFixed(3)},${from.lng.toFixed(3)}->${to.lat.toFixed(3)},${to.lng.toFixed(3)}`;
}

/**
 * Получить маршрут через OSRM (бесплатный, реальные дороги).
 */
export async function fetchRoute(from: LatLng, to: LatLng): Promise<RouteResult | null> {
  const key = cacheKey(from, to);
  if (cache.has(key)) return cache.get(key)!;

  try {
    const url = `${OSRM_URL}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.[0]) return null;

    const route = data.routes[0];
    const coords = route.geometry.coordinates as [number, number][];

    const path: LatLng[] = coords.map(([lng, lat]) => ({ lat, lng }));

    if (path.length < 2) return null;

    const result: RouteResult = {
      path,
      distanceMeters: route.distance || 0,
      durationSeconds: route.duration || 0,
    };

    cache.set(key, result);
    return result;
  } catch (e) {
    console.warn('[routeService] OSRM failed:', e);
    return null;
  }
}

// ═══════════════════════════════════════════════════════
//  geo.ts — геометрические утилиты
// ═══════════════════════════════════════════════════════
import type { LatLng } from '@/types';

/**
 * Расстояние между двумя точками по формуле Haversine (в милях).
 */
export function distanceMiles(a: LatLng, b: LatLng): number {
  const R = 3958.8; // радиус Земли в милях
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Линейная интерполяция между двумя точками.
 * t: 0..1
 */
export function lerpLatLng(a: LatLng, b: LatLng, t: number): LatLng {
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
  };
}

/**
 * Позиция вдоль маршрута по прогрессу 0..1.
 * Учитывает реальные расстояния между точками (плавное движение).
 */
export function positionAlongRoute(route: LatLng[], progress: number): LatLng {
  if (route.length === 0) return { lat: 0, lng: 0 };
  if (route.length === 1) return route[0];
  if (progress <= 0) return route[0];
  if (progress >= 1) return route[route.length - 1];

  // Считаем длину каждого сегмента
  const segments: number[] = [];
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const d = distanceMiles(route[i], route[i + 1]);
    segments.push(d);
    total += d;
  }

  if (total === 0) return route[0];

  const target = progress * total;
  let accumulated = 0;
  for (let i = 0; i < segments.length; i++) {
    if (accumulated + segments[i] >= target) {
      const segT = (target - accumulated) / segments[i];
      return lerpLatLng(route[i], route[i + 1], segT);
    }
    accumulated += segments[i];
  }
  return route[route.length - 1];
}

/**
 * Генерирует маршрут между двумя точками с добавлением изгибов
 * (имитация реальных дорог — без GraphHopper/OSRM).
 */
export function generateRoute(from: LatLng, to: LatLng, waypoints = 4): LatLng[] {
  const route: LatLng[] = [from];
  for (let i = 1; i <= waypoints; i++) {
    const t = i / (waypoints + 1);
    const base = lerpLatLng(from, to, t);
    // Небольшое случайное отклонение для реалистичности
    const jitter = 0.3;
    route.push({
      lat: base.lat + (Math.random() - 0.5) * jitter,
      lng: base.lng + (Math.random() - 0.5) * jitter,
    });
  }
  route.push(to);
  return route;
}

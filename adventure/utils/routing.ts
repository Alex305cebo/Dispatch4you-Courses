// Утилита для загрузки реальных маршрутов по Interstate через OSRM

const routeCache = new Map<string, Array<[number, number]>>();

export async function fetchRoute(
  from: [number, number],
  to: [number, number],
  cacheKey: string
): Promise<Array<[number, number]> | null> {
  // Проверяем кэш
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)!;
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[0]},${from[1]};${to[0]},${to[1]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.routes && data.routes[0]) {
      const coords = data.routes[0].geometry.coordinates as Array<[number, number]>;
      routeCache.set(cacheKey, coords);
      return coords;
    }
  } catch (err) {
    console.warn('OSRM routing failed:', err);
  }

  return null;
}

// Snap координаты к ближайшей дороге (Interstate)
export async function snapToRoad(
  coords: [number, number]
): Promise<[number, number]> {
  try {
    const url = `https://router.project-osrm.org/nearest/v1/driving/${coords[0]},${coords[1]}?number=1`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.waypoints && data.waypoints[0]) {
      const snapped = data.waypoints[0].location as [number, number];
      return snapped;
    }
  } catch (err) {
    console.warn('OSRM snap failed:', err);
  }
  
  // Fallback: возвращаем оригинальные координаты
  return coords;
}

export function clearRouteCache() {
  routeCache.clear();
}

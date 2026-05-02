/**
 * Прокси для OSRM API с обходом CORS
 * Использует публичные CORS-прокси или альтернативные сервисы
 */

// Список альтернативных routing API (без CORS проблем)
const ROUTING_APIS = [
  // OpenRouteService (требует API ключ, но есть бесплатный tier)
  {
    name: 'openrouteservice',
    url: (from: [number, number], to: [number, number]) => 
      `https://api.openrouteservice.org/v2/directions/driving-car?start=${from[0]},${from[1]}&end=${to[0]},${to[1]}`,
    needsKey: true,
    parseResponse: (data: any) => {
      if (data.features?.[0]?.geometry?.coordinates) {
        return data.features[0].geometry.coordinates;
      }
      return null;
    }
  },
  // MapBox (требует API ключ)
  {
    name: 'mapbox',
    url: (from: [number, number], to: [number, number]) => 
      `https://api.mapbox.com/directions/v5/mapbox/driving/${from[0]},${from[1]};${to[0]},${to[1]}?geometries=geojson&access_token=YOUR_TOKEN`,
    needsKey: true,
    parseResponse: (data: any) => {
      if (data.routes?.[0]?.geometry?.coordinates) {
        return data.routes[0].geometry.coordinates;
      }
      return null;
    }
  },
  // OSRM через CORS прокси (временное решение)
  {
    name: 'osrm-proxy',
    url: (from: [number, number], to: [number, number]) => 
      `https://corsproxy.io/?${encodeURIComponent(`https://router.project-osrm.org/route/v1/driving/${from[0]},${from[1]};${to[0]},${to[1]}?overview=full&geometries=geojson`)}`,
    needsKey: false,
    parseResponse: (data: any) => {
      if (data.routes?.[0]?.geometry?.coordinates) {
        return data.routes[0].geometry.coordinates;
      }
      return null;
    }
  }
];

/**
 * Получить маршрут через доступный API
 */
export async function fetchRouteWithProxy(
  from: [number, number],
  to: [number, number],
  retries = 2
): Promise<Array<[number, number]> | null> {
  
  // Пробуем OSRM через прокси
  const api = ROUTING_APIS[2]; // osrm-proxy
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const url = api.url(from, to);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      const coordinates = api.parseResponse(data);
      
      if (coordinates && coordinates.length > 0) {
        console.log(`✅ Route loaded via ${api.name}: ${coordinates.length} points`);
        return coordinates;
      }
    } catch (err) {
      console.warn(`⚠️ ${api.name} attempt ${attempt + 1} failed:`, err);
      if (attempt === retries) {
        console.error(`❌ All routing attempts failed — using linear movement`);
      }
    }
  }
  
  return null;
}

/**
 * Snap координаты к ближайшей дороге
 */
export async function snapToRoad(
  coords: [number, number]
): Promise<[number, number]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    
    const url = `https://corsproxy.io/?${encodeURIComponent(`https://router.project-osrm.org/nearest/v1/driving/${coords[0]},${coords[1]}?number=1`)}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    
    const data = await res.json();
    if (data.waypoints?.[0]?.location) {
      return data.waypoints[0].location as [number, number];
    }
  } catch (err) {
    console.warn('Snap to road failed:', err);
  }
  
  return coords;
}

// ═══════════════════════════════════════════════════════
//  weather.ts — система погоды (из Game One)
//  Сезонная генерация, влияние на скорость и HOS
// ═══════════════════════════════════════════════════════

export interface WeatherZone {
  id: string;
  event: string;
  states: string[];
  speedMultiplier: number; // 0.4 - 0.9
  hosMultiplier: number;   // 1.05 - 1.45
  endsAt: number;          // игровая минута окончания
}

// Регионы штатов
const NORTH = ['MN', 'WI', 'MI', 'NY', 'VT', 'NH', 'ME', 'ND', 'SD', 'MT', 'WY', 'ID'];
const MIDWEST = ['IL', 'IN', 'OH', 'MO', 'IA', 'KS', 'NE', 'KY'];
const SOUTH = ['TX', 'LA', 'MS', 'AL', 'GA', 'FL', 'SC', 'AR', 'OK', 'TN', 'NC'];
const WEST = ['CA', 'OR', 'WA', 'NV', 'AZ', 'UT', 'CO', 'NM'];
const PLAINS = ['KS', 'NE', 'OK', 'TX', 'SD', 'ND', 'MO', 'IA'];

interface WeatherEvent {
  event: string;
  states: string[];
  speedMult: number;
  hosMult: number;
  weight: number;
}

function getSeasonPool(): WeatherEvent[] {
  const month = new Date().getMonth() + 1;
  const isWinter = month === 12 || month <= 2;
  const isSummer = month >= 6 && month <= 8;

  if (isWinter) {
    return [
      { event: '🌨️ Снегопад', states: NORTH, speedMult: 0.50, hosMult: 1.35, weight: 30 },
      { event: '🧊 Гололёд', states: NORTH, speedMult: 0.40, hosMult: 1.45, weight: 20 },
      { event: '🌨️ Метель', states: PLAINS, speedMult: 0.45, hosMult: 1.40, weight: 20 },
      { event: '🌧️ Зимний дождь', states: SOUTH, speedMult: 0.75, hosMult: 1.10, weight: 15 },
      { event: '🌫️ Туман', states: WEST, speedMult: 0.65, hosMult: 1.15, weight: 15 },
    ];
  }

  if (isSummer) {
    return [
      { event: '🌡️ Жара +100°F', states: SOUTH, speedMult: 0.85, hosMult: 1.20, weight: 25 },
      { event: '⛈️ Летние грозы', states: MIDWEST, speedMult: 0.65, hosMult: 1.15, weight: 25 },
      { event: '🌪️ Торнадо', states: PLAINS, speedMult: 0.50, hosMult: 1.40, weight: 10 },
      { event: '🌧️ Тропический ливень', states: ['FL', 'LA', 'TX'], speedMult: 0.60, hosMult: 1.20, weight: 20 },
      { event: '🌫️ Смог', states: ['CA', 'TX', 'NY'], speedMult: 0.90, hosMult: 1.05, weight: 20 },
    ];
  }

  // Spring/Fall
  return [
    { event: '⛈️ Грозы', states: SOUTH, speedMult: 0.60, hosMult: 1.20, weight: 25 },
    { event: '🌧️ Ливень', states: MIDWEST, speedMult: 0.70, hosMult: 1.10, weight: 25 },
    { event: '🌫️ Густой туман', states: MIDWEST, speedMult: 0.60, hosMult: 1.20, weight: 20 },
    { event: '🌪️ Сильный ветер', states: PLAINS, speedMult: 0.75, hosMult: 1.10, weight: 15 },
    { event: '🌧️ Дожди', states: WEST, speedMult: 0.75, hosMult: 1.10, weight: 15 },
  ];
}

let weatherIdCounter = 1;

/**
 * Генерирует 1-2 погодные зоны.
 * Вызывается при старте смены и каждые ~120 игровых минут.
 */
export function generateWeatherZones(currentGameTime: number): WeatherZone[] {
  const pool = getSeasonPool();
  const totalWeight = pool.reduce((s, e) => s + e.weight, 0);

  function pickWeighted(): WeatherEvent {
    let r = Math.random() * totalWeight;
    for (const e of pool) {
      r -= e.weight;
      if (r <= 0) return e;
    }
    return pool[0];
  }

  const count = Math.random() < 0.35 ? 2 : 1;
  const zones: WeatherZone[] = [];

  for (let i = 0; i < count; i++) {
    const ev = pickWeighted();
    const regionStates = [...ev.states].sort(() => Math.random() - 0.5);
    const stateCount = 1 + Math.floor(Math.random() * Math.min(3, regionStates.length));
    const duration = 90 + Math.floor(Math.random() * 150); // 1.5 - 4 часа

    zones.push({
      id: `weather_${weatherIdCounter++}`,
      event: ev.event,
      states: regionStates.slice(0, stateCount),
      speedMultiplier: ev.speedMult,
      hosMultiplier: ev.hosMult,
      endsAt: currentGameTime + duration,
    });
  }

  return zones;
}

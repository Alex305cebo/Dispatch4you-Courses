export const MAPTILER_KEY = '';
export const MAP_STYLE = 'https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json';

// Бесплатный роутинг по реальным дорогам
export const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

// Город → штат (сокращение)
export const CITY_STATE: Record<string, string> = {
  'Chicago': 'IL', 'St. Louis': 'MO', 'Memphis': 'TN', 'Dallas': 'TX',
  'Houston': 'TX', 'San Antonio': 'TX', 'Los Angeles': 'CA', 'Phoenix': 'AZ',
  'El Paso': 'TX', 'Atlanta': 'GA', 'Charlotte': 'NC', 'New York': 'NY',
  'Miami': 'FL', 'Nashville': 'TN', 'Indianapolis': 'IN', 'Columbus': 'OH',
  'Denver': 'CO', 'Kansas City': 'MO', 'Minneapolis': 'MN', 'Seattle': 'WA',
  'Portland': 'OR', 'San Francisco': 'CA', 'Las Vegas': 'NV', 'Salt Lake City': 'UT',
  'Albuquerque': 'NM', 'Oklahoma City': 'OK', 'Little Rock': 'AR', 'Birmingham': 'AL',
  'Jacksonville': 'FL', 'Tampa': 'FL', 'Baltimore': 'MD', 'Philadelphia': 'PA',
  'Boston': 'MA', 'Detroit': 'MI', 'Cleveland': 'OH', 'Pittsburgh': 'PA',
  'Louisville': 'KY', 'Cincinnati': 'OH', 'St. Paul': 'MN', 'Omaha': 'NE',
  'Tulsa': 'OK', 'Baton Rouge': 'LA', 'New Orleans': 'LA',
};

// Хелпер: "Miami FL" (БЕЗ ЗАПЯТОЙ!)
export function cityState(city: string): string {
  const state = CITY_STATE[city];
  return state ? `${city} ${state}` : city;
}

// Игровое время: 1 реальная секунда = 1 игровая минута (удобно для отображения)
// Это значит 24-часовая смена = 1440 реальных секунд = 24 минуты реального времени
export const TIME_SCALE = 60;
// Длина смены в игровых минутах (24 часа)
export const SHIFT_DURATION = 1440;
// Старт смены: 08:43
export const SHIFT_START_HOUR = 8;
export const SHIFT_START_MINUTE = 43;

// Координаты городов США
export const CITIES: Record<string, [number, number]> = {
  'Chicago':      [-87.6298, 41.8781],
  'St. Louis':    [-90.1994, 38.6270],
  'Memphis':      [-90.0490, 35.1495],
  'Dallas':       [-96.7970, 32.7767],
  'Houston':      [-95.3698, 29.7604],
  'San Antonio':  [-98.4936, 29.4241],
  'Los Angeles':  [-118.2437, 34.0522],
  'Phoenix':      [-112.0740, 33.4484],
  'El Paso':      [-106.4850, 31.7619],
  'Atlanta':      [-84.3880, 33.7490],
  'Charlotte':    [-80.8431, 35.2271],
  'New York':     [-74.0060, 40.7128],
  'Miami':        [-80.1918, 25.7617],
  'Nashville':    [-86.7816, 36.1627],
  'Indianapolis': [-86.1581, 39.7684],
  'Columbus':     [-82.9988, 39.9612],
  'Denver':       [-104.9903, 39.7392],
  'Kansas City':  [-94.5786, 39.0997],
  'Minneapolis':  [-93.2650, 44.9778],
  'Seattle':      [-122.3321, 47.6062],
  'Portland':     [-122.6765, 45.5231],
  'San Francisco':[-122.4194, 37.7749],
  'Las Vegas':    [-115.1398, 36.1699],
  'Salt Lake City':[-111.8910, 40.7608],
  'Albuquerque':  [-106.6504, 35.0844],
  'Oklahoma City':[-97.5164, 35.4676],
  'Little Rock':  [-92.2896, 34.7465],
  'Birmingham':   [-86.8025, 33.5186],
  'Jacksonville': [-81.6557, 30.3322],
  'Tampa':        [-82.4572, 27.9506],
  'Baltimore':    [-76.6122, 39.2904],
  'Philadelphia': [-75.1652, 39.9526],
  'Boston':       [-71.0589, 42.3601],
  'Detroit':      [-83.0458, 42.3314],
  'Cleveland':    [-81.6944, 41.4993],
  'Pittsburgh':   [-79.9959, 40.4406],
  'Louisville':   [-85.7585, 38.2527],
  'Cincinnati':   [-84.5120, 39.1031],
  'St. Paul':     [-93.0900, 44.9537],
  'Omaha':        [-95.9345, 41.2565],
  'Tulsa':        [-95.9928, 36.1540],
  'Baton Rouge':  [-91.1871, 30.4515],
  'New Orleans':  [-90.0715, 29.9511],
};

export const MAPTILER_KEY = '';
export const MAP_STYLE = 'https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json';

// Бесплатный роутинг по реальным дорогам
export const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

// Город → штат (сокращение)
export const CITY_STATE: Record<string, string> = {
  // Уже существующие
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
  // Новые города
  'Montgomery': 'AL', 'Anchorage': 'AK', 'Tucson': 'AZ', 'Flagstaff': 'AZ',
  'Fort Smith': 'AR', 'Sacramento': 'CA', 'San Diego': 'CA', 'Fresno': 'CA',
  'Colorado Springs': 'CO', 'Pueblo': 'CO', 'Bridgeport': 'CT', 'Hartford': 'CT',
  'Wilmington': 'DE', 'Orlando': 'FL', 'Fort Lauderdale': 'FL', 'Pensacola': 'FL',
  'Savannah': 'GA', 'Augusta': 'GA', 'Boise': 'ID', 'Pocatello': 'ID',
  'Springfield': 'IL', 'Rockford': 'IL', 'Fort Wayne': 'IN', 'Evansville': 'IN',
  'Des Moines': 'IA', 'Cedar Rapids': 'IA', 'Wichita': 'KS', 'Topeka': 'KS',
  'Lexington': 'KY', 'Bowling Green': 'KY', 'Shreveport': 'LA', 'Lafayette': 'LA',
  'Portland ME': 'ME', 'Bangor': 'ME', 'Annapolis': 'MD', 'Frederick': 'MD',
  'Worcester': 'MA', 'Springfield MA': 'MA', 'Grand Rapids': 'MI', 'Lansing': 'MI',
  'Duluth': 'MN', 'Rochester MN': 'MN', 'Jackson': 'MS', 'Gulfport': 'MS',
  'Springfield MO': 'MO', 'Billings': 'MT', 'Great Falls': 'MT',
  'Lincoln': 'NE', 'Reno': 'NV', 'Henderson': 'NV', 'Manchester': 'NH',
  'Concord NH': 'NH', 'Newark': 'NJ', 'Trenton': 'NJ', 'Santa Fe': 'NM',
  'Las Cruces': 'NM', 'Buffalo': 'NY', 'Rochester NY': 'NY', 'Albany': 'NY',
  'Raleigh': 'NC', 'Greensboro': 'NC', 'Fargo': 'ND', 'Bismarck': 'ND',
  'Toledo': 'OH', 'Akron': 'OH', 'Dayton': 'OH', 'Tulsa OK': 'OK',
  'Eugene': 'OR', 'Salem': 'OR', 'Allentown': 'PA', 'Erie': 'PA',
  'Providence': 'RI', 'Columbia': 'SC', 'Charleston SC': 'SC',
  'Sioux Falls': 'SD', 'Rapid City': 'SD', 'Knoxville': 'TN', 'Chattanooga': 'TN',
  'Austin': 'TX', 'Fort Worth': 'TX', 'San Antonio TX': 'TX', 'Lubbock': 'TX',
  'Amarillo': 'TX', 'Corpus Christi': 'TX', 'Laredo': 'TX',
  'Provo': 'UT', 'Ogden': 'UT', 'Burlington': 'VT', 'Montpelier': 'VT',
  'Virginia Beach': 'VA', 'Richmond': 'VA', 'Norfolk': 'VA', 'Roanoke': 'VA',
  'Spokane': 'WA', 'Tacoma': 'WA', 'Yakima': 'WA',
  'Charleston WV': 'WV', 'Huntington': 'WV', 'Milwaukee': 'WI', 'Madison': 'WI',
  'Cheyenne': 'WY', 'Casper': 'WY',
};

// Хелпер: "Miami, FL" (С ЗАПЯТОЙ!)
export function cityState(city: string): string {
  const state = CITY_STATE[city];
  return state ? `${city}, ${state}` : city;
}

// Игровое время:
// 1 день = 1440 игровых минут = 24 реальных минуты = 1440 реальных секунд
// 1 тик (1 реальная секунда) = 1440/1440 = 1.0 игровых минуты
export const MINUTES_PER_TICK = 1.0;
// Длина рабочего дня в игровых минутах (12 часов)
export const DAY_DURATION = 720;
// Длина недели (7 дней)
export const WEEK_DURATION = 7;
// Старт смены: 06:00
export const SHIFT_START_HOUR = 6;
export const SHIFT_START_MINUTE = 0;

// Для обратной совместимости
export const SHIFT_DURATION = DAY_DURATION;

// Скорость трака: 10 миль/игровую минуту
export const TRUCK_SPEED_MPM = 10;

// HOS правила (в игровых минутах)
export const HOS_MAX_DRIVE_MINUTES = 660;   // 11 часов = 660 минут вождения
export const HOS_REST_MINUTES = 600;         // 10 часов обязательного отдыха
export const HOS_WINDOW_MINUTES = 840;       // 14-часовое окно (14 * 60)

// Координаты городов США
export const CITIES: Record<string, [number, number]> = {
  // Уже существующие
  'Chicago':        [-87.6298, 41.8781],
  'St. Louis':      [-90.1994, 38.6270],
  'Memphis':        [-90.0490, 35.1495],
  'Dallas':         [-96.7970, 32.7767],
  'Houston':        [-95.3698, 29.7604],
  'San Antonio':    [-98.4936, 29.4241],
  'Los Angeles':    [-118.2437, 34.0522],
  'Phoenix':        [-112.0740, 33.4484],
  'El Paso':        [-106.4850, 31.7619],
  'Atlanta':        [-84.3880, 33.7490],
  'Charlotte':      [-80.8431, 35.2271],
  'New York':       [-74.0060, 40.7128],
  'Miami':          [-80.1918, 25.7617],
  'Nashville':      [-86.7816, 36.1627],
  'Indianapolis':   [-86.1581, 39.7684],
  'Columbus':       [-82.9988, 39.9612],
  'Denver':         [-104.9903, 39.7392],
  'Kansas City':    [-94.5786, 39.0997],
  'Minneapolis':    [-93.2650, 44.9778],
  'Seattle':        [-122.3321, 47.6062],
  'Portland':       [-122.6765, 45.5231],
  'San Francisco':  [-122.4194, 37.7749],
  'Las Vegas':      [-115.1398, 36.1699],
  'Salt Lake City': [-111.8910, 40.7608],
  'Albuquerque':    [-106.6504, 35.0844],
  'Oklahoma City':  [-97.5164, 35.4676],
  'Little Rock':    [-92.2896, 34.7465],
  'Birmingham':     [-86.8025, 33.5186],
  'Jacksonville':   [-81.6557, 30.3322],
  'Tampa':          [-82.4572, 27.9506],
  'Baltimore':      [-76.6122, 39.2904],
  'Philadelphia':   [-75.1652, 39.9526],
  'Boston':         [-71.0589, 42.3601],
  'Detroit':        [-83.0458, 42.3314],
  'Cleveland':      [-81.6944, 41.4993],
  'Pittsburgh':     [-79.9959, 40.4406],
  'Louisville':     [-85.7585, 38.2527],
  'Cincinnati':     [-84.5120, 39.1031],
  'St. Paul':       [-93.0900, 44.9537],
  'Omaha':          [-95.9345, 41.2565],
  'Tulsa':          [-95.9928, 36.1540],
  'Baton Rouge':    [-91.1871, 30.4515],
  'New Orleans':    [-90.0715, 29.9511],
  // Alabama
  'Montgomery':     [-86.2999, 32.3668],
  // Alaska
  'Anchorage':      [-149.9003, 61.2181],
  // Arizona
  'Tucson':         [-110.9265, 32.2226],
  'Flagstaff':      [-111.6513, 35.1983],
  // Arkansas
  'Fort Smith':     [-94.4213, 35.3859],
  // California
  'Sacramento':     [-121.4944, 38.5816],
  'San Diego':      [-117.1611, 32.7157],
  'Fresno':         [-119.7871, 36.7378],
  // Colorado
  'Colorado Springs': [-104.8214, 38.8339],
  'Pueblo':         [-104.6091, 38.2544],
  // Connecticut
  'Bridgeport':     [-73.1952, 41.1865],
  'Hartford':       [-72.6851, 41.7637],
  // Delaware
  'Wilmington':     [-75.5398, 39.7447],
  // Florida
  'Orlando':        [-81.3792, 28.5383],
  'Fort Lauderdale':[-80.1373, 26.1224],
  'Pensacola':      [-87.2169, 30.4213],
  // Georgia
  'Savannah':       [-81.0998, 32.0835],
  'Augusta':        [-81.9748, 33.4735],
  // Idaho
  'Boise':          [-116.2023, 43.6150],
  'Pocatello':      [-112.4455, 42.8713],
  // Illinois
  'Springfield':    [-89.6501, 39.7817],
  'Rockford':       [-89.0940, 42.2711],
  // Indiana
  'Fort Wayne':     [-85.1394, 41.0793],
  'Evansville':     [-87.5711, 37.9716],
  // Iowa
  'Des Moines':     [-93.6091, 41.5868],
  'Cedar Rapids':   [-91.6656, 41.9779],
  // Kansas
  'Wichita':        [-97.3375, 37.6872],
  'Topeka':         [-95.6890, 39.0558],
  // Kentucky
  'Lexington':      [-84.4947, 38.0406],
  'Bowling Green':  [-86.4436, 36.9685],
  // Louisiana
  'Shreveport':     [-93.7502, 32.5252],
  'Lafayette':      [-92.0198, 30.2241],
  // Maine
  'Portland ME':    [-70.2553, 43.6591],
  'Bangor':         [-68.7712, 44.8016],
  // Maryland
  'Annapolis':      [-76.4922, 38.9784],
  'Frederick':      [-77.4105, 39.4143],
  // Massachusetts
  'Worcester':      [-71.8023, 42.2626],
  'Springfield MA': [-72.5898, 42.1015],
  // Michigan
  'Grand Rapids':   [-85.6681, 42.9634],
  'Lansing':        [-84.5555, 42.7325],
  // Minnesota
  'Duluth':         [-92.1005, 46.7867],
  'Rochester MN':   [-92.4802, 44.0121],
  // Mississippi
  'Jackson':        [-90.1848, 32.2988],
  'Gulfport':       [-89.0928, 30.3674],
  // Missouri
  'Springfield MO': [-93.2923, 37.2090],
  // Montana
  'Billings':       [-108.5007, 45.7833],
  'Great Falls':    [-111.3008, 47.5002],
  // Nebraska
  'Lincoln':        [-96.6852, 40.8136],
  // Nevada
  'Reno':           [-119.8138, 39.5296],
  'Henderson':      [-114.9817, 36.0395],
  // New Hampshire
  'Manchester':     [-71.4628, 42.9956],
  'Concord NH':     [-71.5376, 43.2081],
  // New Jersey
  'Newark':         [-74.1724, 40.7357],
  'Trenton':        [-74.7596, 40.2171],
  // New Mexico
  'Santa Fe':       [-105.9378, 35.6870],
  'Las Cruces':     [-106.7893, 32.3199],
  // New York
  'Buffalo':        [-78.8784, 42.8864],
  'Rochester NY':   [-77.6109, 43.1566],
  'Albany':         [-73.7562, 42.6526],
  // North Carolina
  'Raleigh':        [-78.6382, 35.7796],
  'Greensboro':     [-79.7920, 36.0726],
  // North Dakota
  'Fargo':          [-96.7898, 46.8772],
  'Bismarck':       [-100.7837, 46.8083],
  // Ohio
  'Toledo':         [-83.5552, 41.6639],
  'Akron':          [-81.5190, 41.0814],
  'Dayton':         [-84.1916, 39.7589],
  // Oregon
  'Eugene':         [-123.0868, 44.0521],
  'Salem':          [-123.0351, 44.9429],
  // Pennsylvania
  'Allentown':      [-75.4902, 40.6023],
  'Erie':           [-80.0851, 42.1292],
  // Rhode Island
  'Providence':     [-71.4128, 41.8240],
  // South Carolina
  'Columbia':       [-81.0348, 34.0007],
  'Charleston SC':  [-79.9311, 32.7765],
  // South Dakota
  'Sioux Falls':    [-96.7311, 43.5446],
  'Rapid City':     [-103.2310, 44.0805],
  // Tennessee
  'Knoxville':      [-83.9207, 35.9606],
  'Chattanooga':    [-85.3097, 35.0456],
  // Texas
  'Austin':         [-97.7431, 30.2672],
  'Fort Worth':     [-97.3308, 32.7555],
  'Lubbock':        [-101.8552, 33.5779],
  'Amarillo':       [-101.8313, 35.2220],
  'Corpus Christi': [-97.3964, 27.8006],
  'Laredo':         [-99.5075, 27.5306],
  // Utah
  'Provo':          [-111.6585, 40.2338],
  'Ogden':          [-111.9738, 41.2230],
  // Vermont
  'Burlington':     [-73.2121, 44.4759],
  'Montpelier':     [-72.5754, 44.2601],
  // Virginia
  'Virginia Beach': [-75.9780, 36.8529],
  'Richmond':       [-77.4360, 37.5407],
  'Norfolk':        [-76.2859, 36.8508],
  'Roanoke':        [-79.9414, 37.2710],
  // Washington
  'Spokane':        [-117.4260, 47.6588],
  'Tacoma':         [-122.4443, 47.2529],
  'Yakima':         [-120.5059, 46.6021],
  // West Virginia
  'Charleston WV':  [-81.6326, 38.3498],
  'Huntington':     [-82.4452, 38.4192],
  // Wisconsin
  'Milwaukee':      [-87.9065, 43.0389],
  'Madison':        [-89.4012, 43.0731],
  // Wyoming
  'Cheyenne':       [-104.8202, 41.1400],
  'Casper':         [-106.3126, 42.8501],
};

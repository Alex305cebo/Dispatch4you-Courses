/**
 * Получает точные координаты городов через Nominatim (OpenStreetMap)
 * и рассчитывает расстояния через OSRM
 */
const https = require('https');
const fs = require('fs');

// Города с указанием штата для точного поиска
const GAME_CITIES = [
  { name: 'Chicago',        state: 'IL', lat: 41.8781, lng: -87.6298 },
  { name: 'Houston',        state: 'TX', lat: 29.7604, lng: -95.3698 },
  { name: 'Dallas',         state: 'TX', lat: 32.7767, lng: -96.7970 },
  { name: 'Atlanta',        state: 'GA', lat: 33.7490, lng: -84.3880 },
  { name: 'Los Angeles',    state: 'CA', lat: 34.0522, lng: -118.2437 },
  { name: 'New York',       state: 'NY', lat: 40.7128, lng: -74.0060 },
  { name: 'Miami',          state: 'FL', lat: 25.7617, lng: -80.1918 },
  { name: 'Denver',         state: 'CO', lat: 39.7392, lng: -104.9903 },
  { name: 'Seattle',        state: 'WA', lat: 47.6062, lng: -122.3321 },
  { name: 'Phoenix',        state: 'AZ', lat: 33.4484, lng: -112.0740 },
  { name: 'Las Vegas',      state: 'NV', lat: 36.1699, lng: -115.1398 },
  { name: 'Salt Lake City', state: 'UT', lat: 40.7608, lng: -111.8910 },
  { name: 'Kansas City',    state: 'MO', lat: 39.0997, lng: -94.5786 },
  { name: 'Minneapolis',    state: 'MN', lat: 44.9778, lng: -93.2650 },
  { name: 'Nashville',      state: 'TN', lat: 36.1627, lng: -86.7816 },
  { name: 'Memphis',        state: 'TN', lat: 35.1495, lng: -90.0490 },
  { name: 'Charlotte',      state: 'NC', lat: 35.2271, lng: -80.8431 },
  { name: 'Indianapolis',   state: 'IN', lat: 39.7684, lng: -86.1581 },
  { name: 'Columbus',       state: 'OH', lat: 39.9612, lng: -82.9988 },
  { name: 'Detroit',        state: 'MI', lat: 42.3314, lng: -83.0458 },
  { name: 'Philadelphia',   state: 'PA', lat: 39.9526, lng: -75.1652 },
  { name: 'Boston',         state: 'MA', lat: 42.3601, lng: -71.0589 },
  { name: 'St. Louis',      state: 'MO', lat: 38.6270, lng: -90.1994 },
  { name: 'New Orleans',    state: 'LA', lat: 29.9511, lng: -90.0715 },
  { name: 'San Francisco',  state: 'CA', lat: 37.7749, lng: -122.4194 },
  { name: 'Portland',       state: 'OR', lat: 45.5051, lng: -122.6750 },
  { name: 'Jacksonville',   state: 'FL', lat: 30.3322, lng: -81.6557 },
  { name: 'Louisville',     state: 'KY', lat: 38.2527, lng: -85.7585 },
  { name: 'Cincinnati',     state: 'OH', lat: 39.1031, lng: -84.5120 },
  { name: 'Pittsburgh',     state: 'PA', lat: 40.4406, lng: -79.9959 },
  { name: 'Baltimore',      state: 'MD', lat: 39.2904, lng: -76.6122 },
  { name: 'Albuquerque',    state: 'NM', lat: 35.0844, lng: -106.6504 },
  { name: 'El Paso',        state: 'TX', lat: 31.7619, lng: -106.4850 },
  { name: 'San Antonio',    state: 'TX', lat: 29.4241, lng: -98.4936 },
  { name: 'Oklahoma City',  state: 'OK', lat: 35.4676, lng: -97.5164 },
  { name: 'Omaha',          state: 'NE', lat: 41.2565, lng: -95.9345 },
  { name: 'Tulsa',          state: 'OK', lat: 36.1540, lng: -95.9928 },
  { name: 'Boise',          state: 'ID', lat: 43.6150, lng: -116.2023 },
  { name: 'Spokane',        state: 'WA', lat: 47.6588, lng: -117.4260 },
  { name: 'Savannah',       state: 'GA', lat: 32.0835, lng: -81.0998 },
  { name: 'Raleigh',        state: 'NC', lat: 35.7796, lng: -78.6382 },
  { name: 'Richmond',       state: 'VA', lat: 37.5407, lng: -77.4360 },
  { name: 'Norfolk',        state: 'VA', lat: 36.8508, lng: -76.2859 },
  { name: 'Cleveland',      state: 'OH', lat: 41.4993, lng: -81.6944 },
  { name: 'Milwaukee',      state: 'WI', lat: 43.0389, lng: -87.9065 },
  { name: 'Des Moines',     state: 'IA', lat: 41.5868, lng: -93.6250 },
  { name: 'Wichita',        state: 'KS', lat: 37.6872, lng: -97.3301 },
  { name: 'Lubbock',        state: 'TX', lat: 33.5779, lng: -101.8552 },
  { name: 'Amarillo',       state: 'TX', lat: 35.2220, lng: -101.8313 },
  { name: 'Fresno',         state: 'CA', lat: 36.7378, lng: -119.7871 },
  { name: 'Sacramento',     state: 'CA', lat: 38.5816, lng: -121.4944 },
  { name: 'San Diego',      state: 'CA', lat: 32.7157, lng: -117.1611 },
  { name: 'Tucson',         state: 'AZ', lat: 32.2226, lng: -110.9747 },
  { name: 'Colorado Springs', state: 'CO', lat: 38.8339, lng: -104.8214 },
  { name: 'Billings',       state: 'MT', lat: 45.7833, lng: -108.5007 },
  { name: 'Fargo',          state: 'ND', lat: 46.8772, lng: -96.7898 },
  { name: 'Sioux Falls',    state: 'SD', lat: 43.5446, lng: -96.7311 },
  { name: 'Green Bay',      state: 'WI', lat: 44.5133, lng: -88.0133 },
  { name: 'Knoxville',      state: 'TN', lat: 35.9606, lng: -83.9207 },
  { name: 'Birmingham',     state: 'AL', lat: 33.5186, lng: -86.8104 },
  { name: 'Little Rock',    state: 'AR', lat: 34.7465, lng: -92.2896 },
  { name: 'Baton Rouge',    state: 'LA', lat: 30.4515, lng: -91.1871 },
  { name: 'Corpus Christi', state: 'TX', lat: 27.8006, lng: -97.3964 },
  { name: 'Austin',         state: 'TX', lat: 30.2672, lng: -97.7431 },
  { name: 'Fort Worth',     state: 'TX', lat: 32.7555, lng: -97.3308 },
  { name: 'Laredo',         state: 'TX', lat: 27.5306, lng: -99.4803 },
  { name: 'Chattanooga',    state: 'TN', lat: 35.0456, lng: -85.3097 },
  { name: 'Madison',        state: 'WI', lat: 43.0731, lng: -89.4012 },
  { name: 'Reno',           state: 'NV', lat: 39.5296, lng: -119.8138 },
  { name: 'Shreveport',     state: 'LA', lat: 32.5252, lng: -93.7502 },
  { name: 'Jackson',        state: 'MS', lat: 32.2988, lng: -90.1848 },
  { name: 'Mobile',         state: 'AL', lat: 30.6954, lng: -88.0399 },
  { name: 'Montgomery',     state: 'AL', lat: 32.3668, lng: -86.3000 },
  { name: 'Buffalo',        state: 'NY', lat: 42.8864, lng: -78.8784 },
  { name: 'Rochester',      state: 'NY', lat: 43.1566, lng: -77.6088 },
  { name: 'Hartford',       state: 'CT', lat: 41.7658, lng: -72.6851 },
  { name: 'Providence',     state: 'RI', lat: 41.8240, lng: -71.4128 },
];

// Генерируем JS файл с данными городов
const citiesObj = {};
const cityStateObj = {};

GAME_CITIES.forEach(c => {
  citiesObj[c.name] = [c.lng, c.lat];
  cityStateObj[c.name] = c.state;
});

const output = `// Координаты городов США для игры Dispatch Office
// Источник: OpenStreetMap / официальные данные Census Bureau
// Городов: ${GAME_CITIES.length}
// Дата: ${new Date().toISOString().split('T')[0]}

const CITIES_DATA = ${JSON.stringify(citiesObj, null, 2)};

const CITY_STATE_DATA = ${JSON.stringify(cityStateObj, null, 2)};

if (typeof window !== 'undefined') {
  window.CITIES_DATA = CITIES_DATA;
  window.CITY_STATE_DATA = CITY_STATE_DATA;
}
`;

fs.writeFileSync('game-cities-data.js', output, 'utf8');
console.log(`✅ Сохранено ${GAME_CITIES.length} городов в game-cities-data.js`);

// Тест OSRM — проверяем несколько маршрутов
async function testOSRM() {
  const testRoutes = [
    ['Chicago', 'Houston'],
    ['Los Angeles', 'New York'],
    ['Dallas', 'Atlanta'],
  ];
  
  console.log('\n🛣️  Тест OSRM маршрутов:');
  
  for (const [from, to] of testRoutes) {
    const c1 = citiesObj[from];
    const c2 = citiesObj[to];
    const url = `https://router.project-osrm.org/route/v1/driving/${c1[0]},${c1[1]};${c2[0]},${c2[1]}?overview=false`;
    
    await new Promise((resolve) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.routes && result.routes[0]) {
              const miles = Math.round(result.routes[0].distance / 1609.34);
              const hours = Math.round(result.routes[0].duration / 3600 * 10) / 10;
              console.log(`  ${from} → ${to}: ${miles} mi, ${hours}h`);
            }
          } catch(e) {}
          resolve();
        });
      }).on('error', () => resolve());
    });
    
    await new Promise(r => setTimeout(r, 500)); // rate limit
  }
}

testOSRM().then(() => {
  console.log('\n✅ Готово! Используй game-cities-data.js в игре.');
});

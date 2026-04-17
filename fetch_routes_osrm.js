/**
 * Скачивает реальные расстояния для всех маршрутов через OSRM
 * и генерирует обновлённый массив ROUTES для game2.html
 */
const https = require('https');
const fs = require('fs');

const CITIES = {
  'Chicago':[-87.6298,41.8781],'Houston':[-95.3698,29.7604],'Dallas':[-96.7970,32.7767],
  'Atlanta':[-84.3880,33.7490],'Los Angeles':[-118.2437,34.0522],'New York':[-74.0060,40.7128],
  'Miami':[-80.1918,25.7617],'Denver':[-104.9903,39.7392],'Seattle':[-122.3321,47.6062],
  'Phoenix':[-112.0740,33.4484],'Las Vegas':[-115.1398,36.1699],'Salt Lake City':[-111.8910,40.7608],
  'Kansas City':[-94.5786,39.0997],'Minneapolis':[-93.2650,44.9778],'Nashville':[-86.7816,36.1627],
  'Memphis':[-90.0490,35.1495],'Charlotte':[-80.8431,35.2271],'Indianapolis':[-86.1581,39.7684],
  'Columbus':[-82.9988,39.9612],'Detroit':[-83.0458,42.3314],'Philadelphia':[-75.1652,39.9526],
  'Boston':[-71.0589,42.3601],'St. Louis':[-90.1994,38.6270],'New Orleans':[-90.0715,29.9511],
  'San Francisco':[-122.4194,37.7749],'Portland':[-122.6750,45.5051],'Jacksonville':[-81.6557,30.3322],
  'Louisville':[-85.7585,38.2527],'Cincinnati':[-84.5120,39.1031],'Pittsburgh':[-79.9959,40.4406],
  'Baltimore':[-76.6122,39.2904],'Albuquerque':[-106.6504,35.0844],'El Paso':[-106.4850,31.7619],
  'San Antonio':[-98.4936,29.4241],'Oklahoma City':[-97.5164,35.4676],'Omaha':[-95.9345,41.2565],
  'Tulsa':[-95.9928,36.1540],'Boise':[-116.2023,43.6150],'Spokane':[-117.4260,47.6588],
  'Savannah':[-81.0998,32.0835],'Austin':[-97.7431,30.2672],'Fort Worth':[-97.3308,32.7555],
  'San Diego':[-117.1611,32.7157],'Sacramento':[-121.4944,38.5816],'Raleigh':[-78.6382,35.7796],
  'Cleveland':[-81.6944,41.4993],'Milwaukee':[-87.9065,43.0389],'Des Moines':[-93.6250,41.5868],
  'Wichita':[-97.3301,37.6872],'Knoxville':[-83.9207,35.9606],'Birmingham':[-86.8104,33.5186],
  'Little Rock':[-92.2896,34.7465],'Baton Rouge':[-91.1871,30.4515],'Corpus Christi':[-97.3964,27.8006],
  'Chattanooga':[-85.3097,35.0456],'Richmond':[-77.4360,37.5407],'Norfolk':[-76.2859,36.8508],
  'Buffalo':[-78.8784,42.8864],'Jackson':[-90.1848,32.2988],'Mobile':[-88.0399,30.6954],
};

// Все маршруты которые нужно обновить
const ROUTE_PAIRS = [
  ['Chicago','Houston'],['Chicago','Dallas'],['Chicago','Atlanta'],['Chicago','Miami'],
  ['Chicago','Denver'],['Chicago','New York'],['Dallas','Atlanta'],['Dallas','Los Angeles'],
  ['Dallas','Miami'],['Houston','Atlanta'],['Houston','Miami'],['Houston','New York'],
  ['Atlanta','New York'],['Atlanta','Miami'],['New York','Miami'],['New York','Dallas'],
  ['Los Angeles','Chicago'],['Los Angeles','Dallas'],['Los Angeles','Houston'],
  ['Los Angeles','Denver'],['Los Angeles','Seattle'],['Los Angeles','Phoenix'],
  ['Seattle','Denver'],['Seattle','Chicago'],['Seattle','Dallas'],
  ['Denver','Dallas'],['Denver','Atlanta'],['Phoenix','Dallas'],['Phoenix','Denver'],
  ['Phoenix','Chicago'],['Nashville','Chicago'],['Nashville','Atlanta'],
  ['Nashville','Dallas'],['Nashville','New York'],['Kansas City','Chicago'],
  ['Kansas City','Dallas'],['Kansas City','Denver'],['Kansas City','Atlanta'],
  ['Minneapolis','Chicago'],['Minneapolis','Denver'],['Charlotte','Atlanta'],
  ['Charlotte','New York'],['Indianapolis','Chicago'],['Indianapolis','Atlanta'],
  ['Memphis','Chicago'],['Memphis','Atlanta'],['Memphis','Dallas'],
  ['St. Louis','Chicago'],['St. Louis','Dallas'],['Columbus','Chicago'],
  ['Detroit','Chicago'],['Detroit','New York'],['Philadelphia','Chicago'],
  ['Philadelphia','Atlanta'],['Boston','Chicago'],['Boston','Atlanta'],
  ['San Francisco','Los Angeles'],['San Francisco','Seattle'],['San Francisco','Denver'],
  ['San Francisco','Dallas'],['Las Vegas','Los Angeles'],['Las Vegas','Denver'],
  ['Salt Lake City','Los Angeles'],['Salt Lake City','Denver'],
  ['New Orleans','Houston'],['New Orleans','Atlanta'],
  ['Oklahoma City','Dallas'],['Oklahoma City','Kansas City'],
  ['Omaha','Chicago'],['Omaha','Kansas City'],['Louisville','Chicago'],
  ['Louisville','Atlanta'],['Cincinnati','Chicago'],['Cincinnati','Atlanta'],
  ['Pittsburgh','Chicago'],['Pittsburgh','New York'],['Baltimore','New York'],
  ['Baltimore','Atlanta'],['Jacksonville','Atlanta'],['Jacksonville','Miami'],
  ['Savannah','Atlanta'],['Savannah','Miami'],['El Paso','Dallas'],
  ['El Paso','Phoenix'],['San Antonio','Dallas'],['San Antonio','Houston'],
  ['Tulsa','Dallas'],['Tulsa','Kansas City'],['Albuquerque','Dallas'],
  ['Albuquerque','Phoenix'],['Boise','Seattle'],['Boise','Salt Lake City'],
  ['Portland','Seattle'],['Portland','San Francisco'],['Spokane','Seattle'],
  ['Spokane','Boise'],['Austin','Dallas'],['Austin','Houston'],
  ['Fort Worth','Dallas'],['Fort Worth','Oklahoma City'],
  ['San Diego','Los Angeles'],['San Diego','Phoenix'],
  ['Sacramento','San Francisco'],['Sacramento','Los Angeles'],
  ['Raleigh','Atlanta'],['Raleigh','Charlotte'],['Cleveland','Chicago'],
  ['Cleveland','Pittsburgh'],['Milwaukee','Chicago'],['Milwaukee','Minneapolis'],
  ['Des Moines','Chicago'],['Des Moines','Kansas City'],
  ['Wichita','Kansas City'],['Wichita','Dallas'],
  ['Knoxville','Atlanta'],['Knoxville','Nashville'],
  ['Birmingham','Atlanta'],['Birmingham','Nashville'],
  ['Little Rock','Memphis'],['Little Rock','Dallas'],
  ['Baton Rouge','New Orleans'],['Baton Rouge','Houston'],
  ['Corpus Christi','Houston'],['Corpus Christi','San Antonio'],
  ['Chattanooga','Atlanta'],['Chattanooga','Nashville'],
  ['Richmond','Baltimore'],['Richmond','Charlotte'],
  ['Norfolk','Richmond'],['Norfolk','Charlotte'],
  ['Buffalo','New York'],['Buffalo','Cleveland'],
  ['Jackson','Memphis'],['Jackson','New Orleans'],
  ['Mobile','New Orleans'],['Mobile','Atlanta'],
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function fetchRoute(from, to) {
  return new Promise((resolve) => {
    const c1 = CITIES[from], c2 = CITIES[to];
    if (!c1 || !c2) { resolve(null); return; }
    
    const url = `https://router.project-osrm.org/route/v1/driving/${c1[0]},${c1[1]};${c2[0]},${c2[1]}?overview=false`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.routes && result.routes[0]) {
            const miles = Math.round(result.routes[0].distance / 1609.34);
            resolve({ from, to, miles });
          } else {
            resolve(null);
          }
        } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

async function main() {
  console.log(`🛣️  Загружаем ${ROUTE_PAIRS.length} маршрутов через OSRM...`);
  
  const routes = [];
  let done = 0;
  
  // Обрабатываем по 5 за раз
  for (let i = 0; i < ROUTE_PAIRS.length; i += 5) {
    const batch = ROUTE_PAIRS.slice(i, i + 5);
    const results = await Promise.all(batch.map(([f, t]) => fetchRoute(f, t)));
    
    results.forEach(r => {
      if (r) {
        routes.push(r);
        // Добавляем обратный маршрут
        routes.push({ from: r.to, to: r.from, miles: r.miles });
        done++;
      }
    });
    
    process.stdout.write(`\r  Прогресс: ${done}/${ROUTE_PAIRS.length}`);
    await sleep(300); // rate limit
  }
  
  console.log(`\n✅ Загружено маршрутов: ${routes.length}`);
  
  // Генерируем JS
  const routeLines = routes.map(r => 
    `  {from:'${r.from}',to:'${r.to}',miles:${r.miles}}`
  ).join(',\n');
  
  const output = `// Реальные расстояния маршрутов из OSRM (Open Source Routing Machine)
// Источник: https://router.project-osrm.org
// Маршрутов: ${routes.length}
// Дата: ${new Date().toISOString().split('T')[0]}

const ROUTES_DATA = [
${routeLines}
];

if (typeof window !== 'undefined') {
  window.ROUTES_DATA = ROUTES_DATA;
}
`;
  
  fs.writeFileSync('game-routes-data.js', output, 'utf8');
  console.log('✅ Сохранено в game-routes-data.js');
  
  // Показываем несколько примеров
  console.log('\nПримеры:');
  routes.slice(0, 8).forEach(r => console.log(`  ${r.from} → ${r.to}: ${r.miles} mi`));
}

main().catch(console.error);

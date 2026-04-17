/**
 * Скачивает координаты городов США из открытых источников
 * и генерирует game-cities-data.js для game2.html
 */
const https = require('https');
const fs = require('fs');

// Топ-80 городов для игры диспетчера (крупные логистические хабы)
const GAME_CITIES = [
  'Chicago','Houston','Dallas','Atlanta','Los Angeles','New York','Miami',
  'Denver','Seattle','Phoenix','Las Vegas','Salt Lake City','Kansas City',
  'Minneapolis','Nashville','Memphis','Charlotte','Indianapolis','Columbus',
  'Detroit','Philadelphia','Boston','St. Louis','New Orleans','San Francisco',
  'Portland','Jacksonville','Louisville','Cincinnati','Pittsburgh','Baltimore',
  'Albuquerque','El Paso','San Antonio','Oklahoma City','Omaha','Tulsa',
  'Boise','Spokane','Savannah','Raleigh','Richmond','Norfolk','Cleveland',
  'Milwaukee','Madison','Des Moines','Wichita','Lubbock','Amarillo',
  'Fresno','Sacramento','San Diego','San Jose','Oakland','Bakersfield',
  'Tucson','Mesa','Tempe','Scottsdale','Henderson','Reno','Provo',
  'Colorado Springs','Fort Collins','Pueblo','Billings','Missoula',
  'Fargo','Sioux Falls','Rapid City','Bismarck','Green Bay','Duluth',
  'Rochester','Buffalo','Albany','Hartford','Providence','Bridgeport',
  'Knoxville','Chattanooga','Birmingham','Montgomery','Mobile','Jackson',
  'Little Rock','Shreveport','Baton Rouge','Lafayette','Corpus Christi',
  'Austin','Fort Worth','Arlington','Laredo','McAllen'
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  console.log('📥 Скачиваем данные городов...');
  
  // Скачиваем CSV из kelvins/US-Cities-Database
  const csvData = await fetchUrl('https://raw.githubusercontent.com/kelvins/US-Cities-Database/main/csv/us_cities.csv');
  const lines = csvData.split('\n');
  
  // Парсим CSV: ID,STATE_CODE,STATE_NAME,CITY,COUNTY,LATITUDE,LONGITUDE
  const cityMap = {};
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length < 7) continue;
    const stateCode = parts[1].trim();
    const cityName = parts[3].replace(/"/g, '').trim();
    const lat = parseFloat(parts[5]);
    const lng = parseFloat(parts[6]);
    
    // Пропускаем Аляску и Гавайи
    if (stateCode === 'AK' || stateCode === 'HI') continue;
    if (isNaN(lat) || isNaN(lng)) continue;
    
    const key = cityName;
    if (!cityMap[key]) {
      cityMap[key] = { lat, lng, state: stateCode };
    }
  }
  
  console.log(`✅ Загружено городов: ${Object.keys(cityMap).length}`);
  
  // Собираем данные для игровых городов
  const gameCities = {};
  const cityState = {};
  const missing = [];
  
  for (const city of GAME_CITIES) {
    if (cityMap[city]) {
      const { lat, lng, state } = cityMap[city];
      gameCities[city] = [parseFloat(lng.toFixed(4)), parseFloat(lat.toFixed(4))];
      cityState[city] = state;
    } else {
      missing.push(city);
    }
  }
  
  console.log(`✅ Найдено игровых городов: ${Object.keys(gameCities).length}`);
  if (missing.length) console.log(`⚠️  Не найдено: ${missing.join(', ')}`);
  
  // Генерируем JS файл
  const output = `// Автоматически сгенерировано из US Cities Database (kelvins/US-Cities-Database)
// Источник: https://github.com/kelvins/US-Cities-Database
// Дата: ${new Date().toISOString().split('T')[0]}
// Городов: ${Object.keys(gameCities).length}

const CITIES_DATA = ${JSON.stringify(gameCities, null, 2)};

const CITY_STATE_DATA = ${JSON.stringify(cityState, null, 2)};

if (typeof window !== 'undefined') {
  window.CITIES_DATA = CITIES_DATA;
  window.CITY_STATE_DATA = CITY_STATE_DATA;
}
`;
  
  fs.writeFileSync('game-cities-data.js', output, 'utf8');
  console.log('✅ Сохранено в game-cities-data.js');
  
  // Выводим для проверки несколько городов
  console.log('\nПример данных:');
  ['Chicago','Houston','Dallas','Detroit','Miami'].forEach(c => {
    if (gameCities[c]) console.log(`  ${c}: [${gameCities[c]}] (${cityState[c]})`);
  });
}

main().catch(console.error);

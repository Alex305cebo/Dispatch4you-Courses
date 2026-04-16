/**
 * Модуль погоды для Dispatch Office
 * Использует Open-Meteo API (бесплатно, без ключа!)
 * https://open-meteo.com/
 * 
 * Погода влияет на:
 * - Скорость движения траков (-10% до -30%)
 * - Вероятность поломок (+5% при снеге/льду)
 * - Detention (задержки на погрузке/разгрузке)
 * - Ставки (surge pricing при плохой погоде)
 */

const WEATHER_CODES = {
  0:  { label: 'Ясно',           emoji: '☀️',  severity: 0 },
  1:  { label: 'Преимущественно ясно', emoji: '🌤️', severity: 0 },
  2:  { label: 'Переменная облачность', emoji: '⛅', severity: 0 },
  3:  { label: 'Пасмурно',       emoji: '☁️',  severity: 0 },
  45: { label: 'Туман',          emoji: '🌫️',  severity: 1 },
  48: { label: 'Гололёд',        emoji: '🌫️',  severity: 2 },
  51: { label: 'Лёгкая морось',  emoji: '🌦️',  severity: 1 },
  53: { label: 'Морось',         emoji: '🌦️',  severity: 1 },
  55: { label: 'Сильная морось', emoji: '🌧️',  severity: 2 },
  61: { label: 'Лёгкий дождь',   emoji: '🌧️',  severity: 1 },
  63: { label: 'Дождь',          emoji: '🌧️',  severity: 2 },
  65: { label: 'Сильный дождь',  emoji: '🌧️',  severity: 3 },
  71: { label: 'Лёгкий снег',    emoji: '🌨️',  severity: 2 },
  73: { label: 'Снег',           emoji: '❄️',  severity: 3 },
  75: { label: 'Сильный снег',   emoji: '❄️',  severity: 4 },
  77: { label: 'Снежная крупа',  emoji: '🌨️',  severity: 3 },
  80: { label: 'Ливень',         emoji: '⛈️',  severity: 3 },
  85: { label: 'Снегопад',       emoji: '❄️',  severity: 4 },
  95: { label: 'Гроза',          emoji: '⛈️',  severity: 4 },
  99: { label: 'Гроза с градом', emoji: '⛈️',  severity: 5 },
};

// Кэш погоды: { cityName: { code, temp, windspeed, label, emoji, severity, fetchedAt } }
const weatherCache = {};
const CACHE_TTL = 30 * 60 * 1000; // 30 минут

/**
 * Получает погоду для города
 * @param {string} cityName
 * @param {number[]} coords [lng, lat]
 * @param {function} callback (weatherData) => void
 */
function fetchWeather(cityName, coords, callback) {
  const now = Date.now();
  const cached = weatherCache[cityName];
  if (cached && (now - cached.fetchedAt) < CACHE_TTL) {
    callback(cached);
    return;
  }

  const [lng, lat] = coords;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weathercode,windspeed_10m&wind_speed_unit=mph&temperature_unit=fahrenheit&timezone=auto`;

  fetch(url)
    .then(r => r.json())
    .then(data => {
      const current = data.current;
      const code = current.weathercode;
      const info = WEATHER_CODES[code] || { label: 'Неизвестно', emoji: '❓', severity: 0 };
      const weather = {
        cityName,
        code,
        temp: Math.round(current.temperature_2m),
        windspeed: Math.round(current.windspeed_10m),
        label: info.label,
        emoji: info.emoji,
        severity: info.severity,
        fetchedAt: now,
      };
      weatherCache[cityName] = weather;
      callback(weather);
    })
    .catch(() => {
      // Fallback — случайная погода
      const fallback = { cityName, code: 0, temp: 65, windspeed: 10, label: 'Ясно', emoji: '☀️', severity: 0, fetchedAt: now };
      weatherCache[cityName] = fallback;
      callback(fallback);
    });
}

/**
 * Рассчитывает влияние погоды на скорость трака
 * @param {number} severity 0-5
 * @returns {number} множитель скорости (0.5 - 1.0)
 */
function getSpeedMultiplier(severity) {
  const multipliers = [1.0, 0.92, 0.82, 0.70, 0.58, 0.45];
  return multipliers[Math.min(severity, 5)];
}

/**
 * Рассчитывает вероятность задержки из-за погоды
 * @param {number} severity 0-5
 * @returns {number} вероятность 0-1
 */
function getDelayProbability(severity) {
  const probs = [0, 0.05, 0.12, 0.25, 0.40, 0.60];
  return probs[Math.min(severity, 5)];
}

/**
 * Загружает погоду для всех активных городов
 * @param {string[]} cities список городов
 * @param {object} citiesCoords CITIES объект
 */
function loadWeatherForCities(cities, citiesCoords) {
  cities.forEach((city, i) => {
    const coords = citiesCoords[city];
    if (!coords) return;
    setTimeout(() => {
      fetchWeather(city, coords, (w) => {
        console.log(`🌤️ ${city}: ${w.emoji} ${w.label}, ${w.temp}°F, ${w.windspeed}mph`);
      });
    }, i * 200); // задержка между запросами
  });
}

/**
 * Получает погодное событие для отображения в игре
 * @param {object} weather
 * @returns {string|null} текст события или null
 */
function getWeatherEvent(weather) {
  if (!weather || weather.severity < 2) return null;
  const events = {
    2: [`${weather.emoji} ${weather.label} в районе маршрута`, `Возможны небольшие задержки`],
    3: [`${weather.emoji} Плохая погода: ${weather.label}`, `Скорость снижена, возможны задержки`],
    4: [`${weather.emoji} Опасные условия: ${weather.label}`, `Значительное снижение скорости`],
    5: [`${weather.emoji} ЭКСТРЕМАЛЬНАЯ ПОГОДА: ${weather.label}`, `Рекомендуется остановка`],
  };
  const msgs = events[Math.min(weather.severity, 5)];
  return msgs ? msgs[0] : null;
}

if (typeof window !== 'undefined') {
  window.fetchWeather = fetchWeather;
  window.getSpeedMultiplier = getSpeedMultiplier;
  window.getDelayProbability = getDelayProbability;
  window.loadWeatherForCities = loadWeatherForCities;
  window.getWeatherEvent = getWeatherEvent;
  window.weatherCache = weatherCache;
  console.log('✅ Weather module loaded (Open-Meteo API, no key required)');
}

const fs = require('fs');

// Читаем старый файл и извлекаем секцию US_HIGHWAYS
const old = fs.readFileSync('us-map-data.js', 'utf8');
const hwStart = old.indexOf('const US_HIGHWAYS');
const hwEnd = old.indexOf('\nif (typeof window');
const highways = old.substring(hwStart, hwEnd);

// Читаем новые данные штатов
const states = fs.readFileSync('states_clean.js', 'utf8');
// Убираем экспорт из states_clean (он будет в конце)
const statesOnly = states.substring(0, states.indexOf('\nif (typeof window'));

// Собираем финальный файл
const exportBlock = `
if (typeof window !== 'undefined') {
  window.US_HIGHWAYS = US_HIGHWAYS;
  window.US_STATES_ACCURATE = US_STATES_ACCURATE;
  window.US_STATES = US_STATES_ACCURATE;
}
`;

const final = statesOnly + '\n\n' + highways + '\n' + exportBlock;

fs.writeFileSync('us-map-data.js', final, 'utf8');
console.log('us-map-data.js updated! Size:', final.length, 'bytes');

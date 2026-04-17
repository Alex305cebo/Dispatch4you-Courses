const fs = require('fs');

// Читаем новые данные штатов
const states = fs.readFileSync('states_publicamundi.js', 'utf8');

// Читаем старый файл и извлекаем секцию US_HIGHWAYS
const old = fs.readFileSync('us-map-data.js', 'utf8');
const hwStart = old.indexOf('const US_HIGHWAYS');
const hwEnd = old.lastIndexOf('\nif (typeof window');
const highways = old.substring(hwStart, hwEnd);

const exportBlock = `
if (typeof window !== 'undefined') {
  window.US_HIGHWAYS = US_HIGHWAYS;
  window.US_STATES_ACCURATE = US_STATES_ACCURATE;
  window.US_STATES = US_STATES_ACCURATE;
}
`;

const final = states + '\n' + highways + '\n' + exportBlock;

fs.writeFileSync('us-map-data.js', final, 'utf8');
console.log('us-map-data.js rebuilt! Size:', Math.round(final.length/1024), 'KB');
console.log('States count:', (states.match(/^  [A-Z]/gm) || []).length);

const fs = require('fs');
let src = fs.readFileSync('us-map-data.js', 'utf8');
// Извлекаем только часть с US_STATES_ACCURATE
const statesStart = src.indexOf('const US_STATES_ACCURATE');
const statesEnd = src.indexOf('};', statesStart) + 2;
const statesSrc = src.substring(statesStart, statesEnd);
eval(statesSrc);

console.log('Total states:', Object.keys(US_STATES_ACCURATE).length);

Object.entries(US_STATES_ACCURATE).forEach(([abbr, coords]) => {
  if (!Array.isArray(coords) || !Array.isArray(coords[0])) return;
  const outliers = coords.filter(c => c[0] < -130 || c[0] > -60 || c[1] < 24 || c[1] > 50);
  if (outliers.length > 0) {
    console.log(`${abbr}: ${outliers.length} outlier points, first: [${outliers[0]}]`);
  }
  // Также проверяем на NaN
  const nans = coords.filter(c => isNaN(c[0]) || isNaN(c[1]));
  if (nans.length > 0) console.log(`${abbr}: ${nans.length} NaN points!`);
});

// Проверяем хайвеи
const hwStart = src.indexOf('const US_HIGHWAYS');
if (hwStart > 0) {
  const hwEnd = src.indexOf('];', hwStart) + 2;
  const hwSrc = src.substring(hwStart, hwEnd);
  eval(hwSrc);
  console.log('\nHighways:', US_HIGHWAYS.length);
  US_HIGHWAYS.forEach((hw, i) => {
    if (!hw.points) return;
    const outliers = hw.points.filter(c => c[0] < -130 || c[0] > -60 || c[1] < 24 || c[1] > 50);
    if (outliers.length > 0) {
      console.log(`Highway ${hw.name} (#${i}): ${outliers.length} outlier points, first: [${outliers[0]}]`);
    }
  });
}

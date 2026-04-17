const fs = require('fs');
const src = fs.readFileSync('us-map-data.js', 'utf8');
const hwStart = src.indexOf('const US_HIGHWAYS');
const hwEnd = src.lastIndexOf('];') + 2;
const hwSrc = src.substring(hwStart, hwEnd).replace('const US_HIGHWAYS', 'var US_HIGHWAYS');
eval(hwSrc);

console.log('Highway segments:', US_HIGHWAYS.length);

// Filter continental only
const cont = US_HIGHWAYS.filter(h => h.points && h.points[0][0] > -130 && h.points[0][0] < -60);
console.log('Continental segments:', cont.length);

let totalPts = 0;
cont.forEach(h => totalPts += h.points.length);
console.log('Total points:', totalPts);

// Check coverage near key cities
function nearest(lng, lat, label) {
  let best = null, bestD = Infinity;
  cont.forEach(h => {
    h.points.forEach(p => {
      const d = Math.hypot(p[0]-lng, p[1]-lat);
      if (d < bestD) { bestD = d; best = { hw: h.name, pt: p }; }
    });
  });
  console.log(`  ${label}: nearest hw=${best.hw}, dist=${bestD.toFixed(3)}°, at [${best.pt}]`);
}

console.log('\nNearest highway points to cities:');
nearest(-74.006, 40.713, 'New York');
nearest(-84.388, 33.749, 'Atlanta');
nearest(-87.630, 41.878, 'Chicago');
nearest(-95.370, 29.760, 'Houston');
nearest(-96.797, 32.777, 'Dallas');

// Check if route from NY to Atlanta is possible
// Build simple graph
const nodes = [];
const nodeIdx = new Map();
function addN(pt) {
  const k = pt[0].toFixed(3)+','+pt[1].toFixed(3);
  if (nodeIdx.has(k)) return nodeIdx.get(k);
  const i = nodes.length;
  nodes.push(pt);
  nodeIdx.set(k, i);
  return i;
}
const adj = [];
cont.forEach(h => {
  for (let i = 0; i < h.points.length - 1; i++) {
    const a = addN(h.points[i]);
    const b = addN(h.points[i+1]);
    if (!adj[a]) adj[a] = [];
    if (!adj[b]) adj[b] = [];
    adj[a].push(b);
    adj[b].push(a);
  }
});

console.log('\nGraph: nodes=' + nodes.length + ', checking connectivity...');

// BFS from nearest to NY
function nearestIdx(lng, lat) {
  let best = 0, bestD = Infinity;
  nodes.forEach((n, i) => {
    const d = Math.hypot(n[0]-lng, n[1]-lat);
    if (d < bestD) { bestD = d; best = i; }
  });
  return best;
}

const nyIdx = nearestIdx(-74.006, 40.713);
const atlIdx = nearestIdx(-84.388, 33.749);
console.log('NY node:', nyIdx, nodes[nyIdx]);
console.log('ATL node:', atlIdx, nodes[atlIdx]);

// BFS
const visited = new Set();
const queue = [nyIdx];
visited.add(nyIdx);
while (queue.length > 0) {
  const cur = queue.shift();
  if (cur === atlIdx) { console.log('✅ NY → Atlanta REACHABLE'); break; }
  if (adj[cur]) {
    for (const next of adj[cur]) {
      if (!visited.has(next)) { visited.add(next); queue.push(next); }
    }
  }
}
if (!visited.has(atlIdx)) console.log('❌ NY → Atlanta NOT REACHABLE');
console.log('Visited nodes from NY:', visited.size, '/', nodes.length);

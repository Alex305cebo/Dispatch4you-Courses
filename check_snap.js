const fs = require('fs');
const src = fs.readFileSync('us-map-data.js', 'utf8');
const hwStart = src.indexOf('const US_HIGHWAYS');
const hwEnd = src.lastIndexOf('];') + 2;
eval(src.substring(hwStart, hwEnd).replace('const US_HIGHWAYS', 'var US_HIGHWAYS'));

const cont = US_HIGHWAYS.filter(h => h.points && h.points[0][0] > -130 && h.points[0][0] < -60);

// Test with snap=1 (0.1 degree)
for (const SNAP of [1, 2, 3]) {
  const nodes = [], nodeIdx = new Map();
  function addN(pt) {
    const k = pt[0].toFixed(SNAP) + ',' + pt[1].toFixed(SNAP);
    if (nodeIdx.has(k)) return nodeIdx.get(k);
    const i = nodes.length; nodes.push(pt); nodeIdx.set(k, i); return i;
  }
  const adj = [];
  cont.forEach(h => {
    for (let i = 0; i < h.points.length - 1; i++) {
      const a = addN(h.points[i]), b = addN(h.points[i+1]);
      if (!adj[a]) adj[a] = []; if (!adj[b]) adj[b] = [];
      adj[a].push(b); adj[b].push(a);
    }
  });
  
  // BFS from nearest to NY
  function nearIdx(lng, lat) {
    let best = 0, bestD = Infinity;
    nodes.forEach((n, i) => { const d = Math.hypot(n[0]-lng, n[1]-lat); if (d < bestD) { bestD = d; best = i; } });
    return best;
  }
  
  const nyI = nearIdx(-74.006, 40.713);
  const atlI = nearIdx(-84.388, 33.749);
  const visited = new Set(); const queue = [nyI]; visited.add(nyI);
  while (queue.length > 0) {
    const cur = queue.shift();
    if (adj[cur]) for (const next of adj[cur]) { if (!visited.has(next)) { visited.add(next); queue.push(next); } }
  }
  console.log(`SNAP=${SNAP}: nodes=${nodes.length}, reachable from NY=${visited.size}, ATL reachable=${visited.has(atlI)}`);
}

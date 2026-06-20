/* =============================================
   MAP.JS — Animated USA Route Map
   SVG-based with Canvas routes & truck dots
============================================= */
'use strict';

(function initUSAMap() {
  const canvas = document.getElementById('usaMapCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Major US cities with approximate SVG coordinates (scaled to canvas)
  const CITIES = [
    { id:'NYC', name:'New York',     x:0.82, y:0.28 },
    { id:'LAX', name:'Los Angeles',  x:0.08, y:0.60 },
    { id:'CHI', name:'Chicago',      x:0.62, y:0.26 },
    { id:'HOU', name:'Houston',      x:0.50, y:0.72 },
    { id:'PHX', name:'Phoenix',      x:0.18, y:0.62 },
    { id:'DAL', name:'Dallas',       x:0.48, y:0.65 },
    { id:'ATL', name:'Atlanta',      x:0.70, y:0.60 },
    { id:'MIA', name:'Miami',        x:0.78, y:0.80 },
    { id:'SEA', name:'Seattle',      x:0.08, y:0.14 },
    { id:'DEN', name:'Denver',       x:0.32, y:0.38 },
    { id:'LAS', name:'Las Vegas',    x:0.13, y:0.52 },
    { id:'MSP', name:'Minneapolis',  x:0.54, y:0.20 },
    { id:'STL', name:'St. Louis',    x:0.60, y:0.42 },
    { id:'KCK', name:'Kansas City',  x:0.53, y:0.42 },
    { id:'SLC', name:'Salt Lake',    x:0.22, y:0.36 },
    { id:'POR', name:'Portland',     x:0.07, y:0.18 },
    { id:'CLT', name:'Charlotte',    x:0.74, y:0.52 },
    { id:'PHI', name:'Philadelphia', x:0.80, y:0.32 },
    { id:'BOX', name:'Boston',       x:0.86, y:0.22 },
    { id:'DET', name:'Detroit',      x:0.70, y:0.25 },
  ];

  // Active routes (pairs of city IDs)
  const ROUTES = [
    { from:'LAX', to:'NYC', rate:4800, load:'Dry Van',    active:true  },
    { from:'CHI', to:'MIA', rate:3200, load:'Reefer',     active:true  },
    { from:'HOU', to:'ATL', rate:2400, load:'Flatbed',    active:false },
    { from:'SEA', to:'CHI', rate:3900, load:'Dry Van',    active:true  },
    { from:'DEN', to:'DAL', rate:1800, load:'Box Truck',  active:false },
    { from:'NYC', to:'ATL', rate:2800, load:'Reefer',     active:true  },
    { from:'LAX', to:'PHX', rate:1200, load:'Dry Van',    active:false },
    { from:'MSP', to:'STL', rate:1600, load:'Flatbed',    active:true  },
    { from:'SLC', to:'LAS', rate:900,  load:'Box Truck',  active:false },
    { from:'POR', to:'SEA', rate:600,  load:'Dry Van',    active:true  },
    { from:'BOX', to:'PHI', rate:700,  load:'Reefer',     active:false },
    { from:'DET', to:'CHI', rate:800,  load:'Flatbed',    active:true  },
    { from:'KCK', to:'HOU', rate:2100, load:'Dry Van',    active:true  },
    { from:'CLT', to:'NYC', rate:1900, load:'Reefer',     active:false },
  ];

  // Trucks moving along routes
  let trucks = [];
  let W, H, frame = 0;

  function resize() {
    W = canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
    H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
  }

  function getXY(city) {
    return { x: city.x * W, y: city.y * H };
  }

  function cityById(id) { return CITIES.find(c => c.id === id); }

  // Init trucks
  function initTrucks() {
    trucks = ROUTES.filter(r => r.active).map((route, i) => {
      const from = cityById(route.from);
      const to   = cityById(route.to);
      return {
        route,
        progress: Math.random(), // start at random position
        speed: 0.0008 + Math.random() * 0.0006,
        from, to,
        color: ['#06b6d4','#4ade80','#f59e0b','#a78bfa'][i % 4]
      };
    });
  }

  function bezierPoint(p0, p1, t) {
    // Quadratic bezier control point — arc upward
    const cx = (p0.x + p1.x) / 2;
    const cy = Math.min(p0.y, p1.y) - Math.abs(p1.x - p0.x) * 0.25;
    const x = (1-t)*(1-t)*p0.x + 2*(1-t)*t*cx + t*t*p1.x;
    const y = (1-t)*(1-t)*p0.y + 2*(1-t)*t*cy + t*t*p1.y;
    return {x, y, cx, cy};
  }

  function drawRoutes() {
    ROUTES.forEach(route => {
      const from = cityById(route.from);
      const to   = cityById(route.to);
      if (!from || !to) return;
      const f = getXY(from);
      const t = getXY(to);
      const cx = (f.x + t.x) / 2;
      const cy = Math.min(f.y, t.y) - Math.abs(t.x - f.x) * 0.25;

      ctx.beginPath();
      ctx.moveTo(f.x, f.y);
      ctx.quadraticCurveTo(cx, cy, t.x, t.y);

      if (route.active) {
        ctx.strokeStyle = 'rgba(6,182,212,0.22)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 6]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  function drawCities() {
    CITIES.forEach(city => {
      const {x, y} = getXY(city);
      const isHub = ['NYC','LAX','CHI','HOU','ATL','MIA','SEA'].includes(city.id);

      // Outer ring pulse
      const pulse = 0.5 + 0.5 * Math.sin(frame * 0.04 + city.x * 10);
      if (isHub) {
        ctx.beginPath();
        ctx.arc(x, y, 12 + pulse * 4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(6,182,212,${0.08 + pulse * 0.06})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Dot
      ctx.beginPath();
      ctx.arc(x, y, isHub ? 5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = isHub ? '#06b6d4' : 'rgba(148,163,184,0.5)';
      ctx.fill();

      if (isHub) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }

      // Label (only hubs)
      if (isHub && W > 600) {
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(226,232,240,0.7)';
        ctx.fillText(city.id, x + 8, y - 6);
      }
    });
  }

  function drawTrucks() {
    trucks.forEach(truck => {
      truck.progress += truck.speed;
      if (truck.progress > 1) truck.progress = 0;

      const f = getXY(truck.from);
      const t = getXY(truck.to);
      const {x, y} = bezierPoint(f, t, truck.progress);

      // Glow
      const grd = ctx.createRadialGradient(x, y, 0, x, y, 10);
      grd.addColorStop(0, truck.color.replace(')', ',0.6)').replace('rgb(', 'rgba(') );
      grd.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = truck.color;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // Trail
      for (let i = 1; i <= 5; i++) {
        const tp = Math.max(0, truck.progress - i * 0.015);
        const {x: tx, y: ty} = bezierPoint(f, t, tp);
        ctx.beginPath();
        ctx.arc(tx, ty, 2 - i * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = truck.color.replace(')', `,${0.4 - i * 0.07})`);
        ctx.fill();
      }
    });
  }

  function drawGrid() {
    // Subtle hex grid
    const size = 40;
    ctx.strokeStyle = 'rgba(6,182,212,0.04)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += size) {
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += size) {
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(W, y);
      ctx.stroke();
    }
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);

    // BG
    const grad = ctx.createRadialGradient(W*0.5, H*0.5, 0, W*0.5, H*0.5, W*0.7);
    grad.addColorStop(0, 'rgba(6,9,22,1)');
    grad.addColorStop(1, 'rgba(2,4,10,1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    drawGrid();
    drawRoutes();
    drawCities();
    drawTrucks();

    frame++;
    requestAnimationFrame(drawFrame);
  }

  window.addEventListener('resize', () => {
    resize();
    initTrucks();
  });

  resize();
  initTrucks();
  drawFrame();
})();

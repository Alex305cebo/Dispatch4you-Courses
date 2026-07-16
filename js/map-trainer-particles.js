/**
 * map-trainer-particles.js — мелкие частицы-«пылинки» на канве ВНУТРИ карточки
 * секции Map Trainer: медленно дрейфуют вверх/в стороны, мерцают — как пыль в
 * лучах света, позади текста и карты. Пауза вне экрана (IntersectionObserver),
 * reduced-motion — статично (без анимации).
 */
(function () {
  'use strict';

  var canvas = document.querySelector('.map-trainer-particles');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, parts = [], raf = 0, running = false;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function smooth(t) { return t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t); }

  // Плавное угасание у краёв: частица прозрачна у грани и полностью видна
  // в центре → появляется «из ниоткуда» и растворяется, не доходя до края.
  function edge(x, y) {
    var fx = Math.min(x, W - x) / (W * 0.14);
    var fy = Math.min(y, H - y) / (H * 0.20);
    return smooth(Math.min(fx, fy));
  }

  function build() {
    // Плотность по площади, с потолком — чтобы не грузить слабые машины.
    var count = Math.max(24, Math.min(90, Math.round((W * H) / 9000)));
    parts = [];
    for (var i = 0; i < count; i++) {
      parts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: rand(0.4, 1.8),
        vx: rand(-0.14, 0.14),
        vy: rand(-0.28, -0.05),          // дрейф вверх, как пылинки
        a: rand(0.12, 0.6),
        tw: rand(0.006, 0.02),           // скорость мерцания
        tp: Math.random() * Math.PI * 2
      });
    }
  }

  function resize() {
    var r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    if (!W || !H) return;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
    if (calm.matches) paintStatic();
  }

  function paintStatic() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(190,232,255,' + (p.a * edge(p.x, p.y)).toFixed(3) + ')';
      ctx.fill();
    }
  }

  function step() {
    raf = 0;
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.x += p.vx; p.y += p.vy; p.tp += p.tw;
      if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; }
      if (p.x < -4) p.x = W + 4; else if (p.x > W + 4) p.x = -4;
      var alpha = p.a * (0.55 + 0.45 * Math.sin(p.tp)) * edge(p.x, p.y);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(190,232,255,' + alpha.toFixed(3) + ')';
      ctx.fill();
    }
    if (running) raf = requestAnimationFrame(step);
  }

  function start() {
    if (calm.matches || running) return;
    running = true;
    if (!raf) raf = requestAnimationFrame(step);
  }
  function stop() {
    running = false;
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }

  resize();

  var tick = false;
  window.addEventListener('resize', function () {
    if (tick) return; tick = true;
    requestAnimationFrame(function () { tick = false; resize(); });
  });

  var section = canvas.closest('.map-trainer-section') || canvas;
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) start(); else stop();
    }, { threshold: 0 }).observe(section);
  } else {
    start();
  }
})();

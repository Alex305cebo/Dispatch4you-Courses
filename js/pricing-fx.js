/**
 * pricing-fx.js — канвас-эффект секции тарифов: дрейфующие вверх «искры»
 * брендовых цветов за карточками (сквозь стеклянный blur карточек — мягкое
 * свечение) + parallax-сдвиг всего канваса по скроллу (глубина). Уважает
 * prefers-reduced-motion; крутится только когда секция видима.
 *
 * ВАЖНО: pricing-section.css грузится лениво (media=print→all) → размеры мерим
 * не на DOMContentLoaded, а в самом frame() (самовосстановление, пока clientW/H
 * не готовы). Размер канваса (кроме высоты-запаса под parallax) задаёт CSS
 * (width/height:100%) — style.width/height НЕ трогаем, только transform.
 * Видимость — по getBoundingClientRect на scroll (надёжнее IO на любом скролле).
 * («Осталось N мест» — статичный HTML/CSS.)
 */
(function () {
  'use strict';
  var section = document.querySelector('.pricing-section.p2-root');
  if (!section) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var canvas = section.querySelector('.p2-fx');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, parts = [], raf = 0, visible = false;
  var COLORS = ['6,182,212', '139,92,246', '249,115,22']; // cyan / purple / orange

  function mk() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      r: 1 + Math.random() * 2.4,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -0.12 - Math.random() * 0.4,
      a: 0.14 + Math.random() * 0.4,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      tw: Math.random() * Math.PI * 2
    };
  }
  function resize() {
    W = canvas.clientWidth || section.clientWidth;
    H = Math.min(canvas.clientHeight || section.clientHeight, 2400);
    if (!W || !H) return false;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.max(10, Math.round(Math.min(60, W / 22)));
    parts = []; for (var i = 0; i < n; i++) parts.push(mk());
    return true;
  }
  function frame() {
    raf = 0; if (!visible) return;
    // самовосстановление: если размеры ещё не готовы (ленивый CSS) — ждём след. кадр
    if (!parts.length && !resize()) { raf = requestAnimationFrame(frame); return; }
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.x += p.vx; p.y += p.vy; p.tw += 0.03;
      if (p.y < -12) { p.y = H + 12; p.x = Math.random() * W; }
      if (p.x < -12) p.x = W + 12; else if (p.x > W + 12) p.x = -12;
      var tw = 0.6 + 0.4 * Math.sin(p.tw);
      var rad = p.r * 6;
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
      g.addColorStop(0, 'rgba(' + p.c + ',' + (p.a * tw).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + p.c + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    raf = requestAnimationFrame(frame);
  }
  var PARALLAX = 50; // px — амплитуда сдвига канваса от верха до низа прохода секции
  function inView(r, vh) {
    return r.bottom > 0 && r.top < vh;
  }
  // Сдвигаем весь канвас-слой медленнее/быстрее контента — эффект глубины при скролле.
  // Реальный запас (CSS: top:-60px, height:+120px) не даёт обнажиться пустому краю.
  function parallax(r, vh) {
    var p = (vh - r.top) / (vh + r.height); // 0 — секция снизу входит, 1 — сверху выходит
    p = p < 0 ? 0 : p > 1 ? 1 : p;
    canvas.style.transform = 'translate3d(0,' + ((p - 0.5) * PARALLAX).toFixed(1) + 'px,0)';
  }
  function update() {
    var r = section.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    visible = inView(r, vh);
    if (visible) parallax(r, vh);
    if (visible && !raf) raf = requestAnimationFrame(frame);
  }

  window.addEventListener('scroll', update, { passive: true });
  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { if (visible) resize(); update(); }, 200);
  });
  window.addEventListener('load', update);
  update();
})();

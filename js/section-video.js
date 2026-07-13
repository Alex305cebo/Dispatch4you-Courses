/**
 * section-video.js — фоновое видео СЕКЦИИ «Как это работает».
 *
 * «Симулированный пин» без position:fixed: видео всегда position:absolute
 * внутри секции, но JS на каждом кадре скролла совмещает его по вертикали
 * с вьюпортом (top = -r.top секции), а overflow:hidden стейджа естественно
 * обрезает всё, что выходит за границы секции. Итог — тот же визуальный
 * эффект «видео во весь экран, пока секция на экране», но:
 *  - без утечки в соседние секции (в отличие от честного position:fixed,
 *    который рисуется поверх всей страницы, если окно «пина» расширить);
 *  - без бага «видео пропадает/скачет при росте секции» (аккордеон и т.п.) —
 *    просто пересчитывается на каждом скролле/ResizeObserver, как обычно;
 *  - видимо на протяжении ВСЕЙ прокрутки секции (вход → все шаги → выход),
 *    а не только в узком окне «секция ровно = высоте экрана».
 *
 * Яркость — широкое плато с плавным подъёмом/спадом по краям (доля EDGE от
 * общего прогресса прохождения секции), не короткий острый пик.
 * reduced-motion: статичный кадр, приглушённая яркость.
 */
(function () {
  'use strict';

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var narrow = window.matchMedia('(max-width: 768px)');
  var items = [].slice.call(document.querySelectorAll('.section-bg-video'));
  if (!items.length) return;

  var OP_PEAK = narrow.matches ? 0.55 : 0.60;   // яркость на плато
  var EDGE    = 0.1;    // доля общего прогресса на подъём/спад по краям
  var RATE    = 6;      // плавность подхода кадра к цели при скрабе

  items.forEach(function (video) {
    var stage = video.closest('.section-bg-stage');
    var section = stage ? stage.parentElement : video.parentElement;
    if (!section) return;

    var dur = 0, curT = 0, tgtT = 0, raf = 0, lastT = 0;

    function ready() {
      var d = video.duration;
      if (isFinite(d) && d > 0) { dur = d; return true; }
      return false;
    }

    // Совмещает видео с вьюпортом (симулированный пин) и считает яркость.
    // Возвращает общий прогресс p (0 — секция только входит снизу, 1 — вышла).
    function apply() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var r = section.getBoundingClientRect();
      var secH = r.height;

      video.style.top = (-r.top) + 'px';

      var p = (vh - r.top) / (vh + secH);
      p = p < 0 ? 0 : (p > 1 ? 1 : p);
      var bell = p < EDGE ? p / EDGE : (p > 1 - EDGE ? (1 - p) / EDGE : 1);
      video.style.opacity = (OP_PEAK * bell).toFixed(3);

      return p;
    }

    // Scrub-петля: кадр мягко догоняет target, шаг зависит от реального dt.
    function tick(now) {
      raf = 0;
      if (!ready()) return;
      var dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0.016;
      lastT = now;
      var diff = tgtT - curT;
      if (Math.abs(diff) < 0.008) { curT = tgtT; }
      else { curT += diff * (1 - Math.exp(-RATE * dt)); raf = requestAnimationFrame(tick); }
      try { video.currentTime = curT; } catch (e) {}
    }

    function onScroll() {
      var p = apply();
      if (!ready()) return;
      tgtT = p * dur;
      if (!raf) { lastT = 0; raf = requestAnimationFrame(tick); }
    }

    if (calm.matches) {
      video.pause();
      video.style.top = '0px';
      video.style.opacity = (OP_PEAK * 0.5).toFixed(3);
      return;
    }

    video.removeAttribute('autoplay');
    video.muted = true;
    video.pause();
    video.preload = 'auto';
    try { video.load(); } catch (e) {}

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    video.addEventListener('loadedmetadata', onScroll);

    // Высота секции может меняться без scroll/resize (аккордеон таймлайна
    // открывает контент под узлом) — apply() опирается на getBoundingClientRect(),
    // без пересчёта тут позиция/яркость зависают устаревшими. ResizeObserver
    // ловит любое такое изменение.
    if (window.ResizeObserver) {
      new ResizeObserver(onScroll).observe(section);
    }

    onScroll();
  });
})();

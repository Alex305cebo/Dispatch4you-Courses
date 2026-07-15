/**
 * hero-parallax.js — фоновое видео верха страницы.
 *
 * Скролл (throttle rAF): параллакс (transform) + «колокол» яркости (opacity).
 * Воспроизведение: обычная скорость. На конце — быстрый fade-out (в темноту),
 * мгновенный рестарт с начала и fade-in (осветление). Зациклено вручную.
 * Источник (моб/десктоп) из data-* ; media= у <source> игнорит Firefox.
 * Вне экрана — пауза (IntersectionObserver). reduced-motion — статичный постер.
 */
(function () {
  'use strict';

  var video = document.querySelector('.hero-bg-video');
  if (!video) return;

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var narrow = window.matchMedia('(max-width: 768px)');   // выровнено с CSS-брейкпоинтом

  var RANGE   = narrow.matches ? 1700 : 1600;   // затухание к концу 2-й секции
  var SPEED   = narrow.matches ? 0.5 : 0.30;    // параллакс: фон отстаёт от контента
  var OP_TOP  = narrow.matches ? 0.45 : 0.30;   // яркость вверху страницы
  var OP_PEAK = narrow.matches ? 0.90 : 0.70;   // пик яркости
  var PEAK_AT = 0.32;                           // где пик, доля RANGE

  var FADE_OUT_MS = 650;   // уход в темноту на конце
  var FADE_IN_MS  = 600;   // проявление после рестарта

  if (calm.matches) {                           // reduced-motion — статичный кадр
    video.style.opacity = OP_TOP.toFixed(3);
    return;
  }

  var src = video.getAttribute(narrow.matches ? 'data-mobile' : 'data-desktop');
  if (src) video.src = src;

  // Яркость «колоколом» по прогрессу p (0..1): подъём к пику, затем спад к 0.
  function opacityAt(p) {
    return p <= PEAK_AT
      ? OP_TOP + (OP_PEAK - OP_TOP) * (p / PEAK_AT)
      : OP_PEAK * (1 - (p - PEAK_AT) / (1 - PEAK_AT));
  }

  // Итоговая прозрачность = «колокол» скролла × fade лупа. transform — от скролла.
  var curY = 0, curP = 0, fade = 1;
  function writeStyles() {
    video.style.transform = 'translate3d(0,' + (curY * SPEED).toFixed(1) + 'px,0)';
    video.style.opacity = (opacityAt(curP) * fade).toFixed(3);
  }

  // ── Скролл: пишем стили раз в кадр, а не на каждый scroll-эвент ──
  var tickScroll = false;
  function paintScroll() {
    tickScroll = false;
    curY = window.scrollY || window.pageYOffset || 0;
    curP = curY > 0 ? Math.min(1, curY / RANGE) : 0;
    writeStyles();
  }
  function onScroll() {
    if (tickScroll) return;
    tickScroll = true;
    requestAnimationFrame(paintScroll);
  }

  // ── Луп через fade. rAF крутится ТОЛЬКО во время перехода (быстро), не в игре ──
  var fadeState = 'none';   // 'out' | 'in' | 'none'
  var fadeStart = 0, rafFade = 0;
  function fadeStep(ts) {
    rafFade = 0;
    if (fadeState === 'out') {                 // гаснем в темноту
      var k = (ts - fadeStart) / FADE_OUT_MS;
      if (k >= 1) {                            // погасли → мгновенный рестарт с начала
        fade = 0;
        try { video.currentTime = 0; } catch (e) {}
        var pr = video.play(); if (pr && pr.catch) pr.catch(function () {});
        fadeState = 'in'; fadeStart = ts;
      } else { fade = 1 - k; }
    } else if (fadeState === 'in') {           // проявляемся
      var k2 = (ts - fadeStart) / FADE_IN_MS;
      fade = k2 >= 1 ? 1 : k2;
      if (k2 >= 1) fadeState = 'none';
    }
    writeStyles();
    if (fadeState !== 'none') rafFade = requestAnimationFrame(fadeStep);
  }
  video.addEventListener('ended', function () {  // конец → быстрый fade-out → рестарт
    if (fadeState === 'none') {
      fadeState = 'out'; fadeStart = performance.now();
      if (!rafFade) rafFade = requestAnimationFrame(fadeStep);
    }
  });

  // ── Автоплей + пауза вне экрана ──
  var retryArmed = false;
  function tryPlay() {
    var pr = video.play();
    if (pr && pr.catch) pr.catch(function () {
      if (retryArmed) return;
      retryArmed = true;
      var kick = function () { video.play().catch(function () {}); };
      window.addEventListener('pointerdown', kick, { once: true });
      window.addEventListener('scroll', kick, { once: true, passive: true });
    });
  }

  // Запуск после window.load — 2 МБ фона не конкурируют с критичным рендером.
  function start() {
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) tryPlay();
        else video.pause();
      }, { threshold: 0 }).observe(video);
    } else {
      tryPlay();
    }
  }
  if (document.readyState === 'complete') { start(); }
  else { window.addEventListener('load', start, { once: true }); }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  paintScroll();
})();

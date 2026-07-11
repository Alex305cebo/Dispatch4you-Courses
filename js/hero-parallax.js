/**
 * hero-parallax.js — Apple-стиль: фоновое видео вверху страницы, кадр которого
 * привязан к прокрутке (scrub), с параллаксом и «дыханием» яркости.
 *
 * ДЕСКТОП: currentTime видео = позиция скролла (0..RANGE ↔ 0..длительность).
 *   Вниз — вперёд, вверх — назад; на концах стоит (пауза, кадр не двигается).
 *   Кадр догоняет цель через FRAME-RATE-INDEPENDENT демпфинг k=1-exp(-RATE*dt)
 *   (Rory Driscoll / Freya Holmér) — одинаково плавно на 60 и 120 Гц.
 *   Параллакс: фон отстаёт от контента (translateY = scroll*SPEED).
 *   Яркость «колоколом»: OP_TOP (тёмно, верх) → OP_PEAK (ярко) на PEAK_AT доле
 *   диапазона → 0 к концу RANGE (конец 2-й секции). Ниже фон погас.
 * МОБИЛЬНЫЙ: тач-скролл + перемотка ненадёжны → видео просто играет по кругу
 *   (loop+play), а яркость идёт тем же «колоколом» по скроллу.
 * reduced-motion: статичный первый кадр, низкая непрозрачность.
 */
(function () {
  'use strict';

  var video = document.querySelector('.hero-bg-video');
  if (!video) return;

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var narrow = window.matchMedia('(max-width: 768px)');

  var RANGE   = narrow.matches ? 1700 : 1600;   // затухание к концу 2-й секции (моб ~1593px)
  var SPEED   = narrow.matches ? 0.5 : 0.30;    // на мобиле больше лаг → видео дольше на экране
  var OP_TOP  = narrow.matches ? 0.45 : 0.30;   // мобайл ярче (был слишком тусклый)
  var OP_PEAK = narrow.matches ? 0.90 : 0.70;   // пик яркости
  var PEAK_AT = 0.32;   // где пик, доля RANGE (≈ 1-я секция)
  var RATE    = 6;      // плавность подхода кадра к цели при скрабе (меньше = мягче)

  var dur = 0, curT = 0, tgtT = 0, raf = 0, lastT = 0;

  function ready() {
    var d = video.duration;
    if (isFinite(d) && d > 0) { dur = d; return true; }
    return false;
  }

  // Яркость «колоколом» по прогрессу p (0..1): подъём к пику, затем спад к 0.
  function opacityAt(p) {
    return p <= PEAK_AT
      ? OP_TOP + (OP_PEAK - OP_TOP) * (p / PEAK_AT)
      : OP_PEAK * (1 - (p - PEAK_AT) / (1 - PEAK_AT));
  }

  // Параллакс + яркость. Возвращает прогресс p.
  function paint(y) {
    var p = y > 0 ? Math.min(1, y / RANGE) : 0;
    video.style.transform = 'translate3d(0,' + (y * SPEED).toFixed(1) + 'px,0)';
    video.style.opacity = opacityAt(p).toFixed(3);
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

  function onScrollDesktop() {
    if (!ready()) return;
    var y = window.scrollY || window.pageYOffset || 0;
    tgtT = paint(y) * dur;                         // прогресс скролла → кадр видео
    if (!raf) { lastT = 0; raf = requestAnimationFrame(tick); }
  }
  function onScrollMobile() {
    paint(window.scrollY || window.pageYOffset || 0);
  }

  if (calm.matches) {                              // reduced-motion — статичный кадр
    video.pause();
    video.style.opacity = OP_TOP.toFixed(3);
    return;
  }

  if (narrow.matches) {                            // мобильный — видео играет по кругу
    video.loop = true; video.muted = true;
    var pm = video.play();
    if (pm && pm.catch) pm.catch(function () {});
    window.addEventListener('scroll', onScrollMobile, { passive: true });
    window.addEventListener('resize', onScrollMobile);
    onScrollMobile();
  } else {                                         // десктоп — scrub по скроллу
    video.removeAttribute('autoplay');
    video.pause();
    window.addEventListener('scroll', onScrollDesktop, { passive: true });
    window.addEventListener('resize', onScrollDesktop);
    video.addEventListener('loadedmetadata', onScrollDesktop);
    if (video.readyState >= 1) onScrollDesktop();
  }
})();

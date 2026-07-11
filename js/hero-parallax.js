/* hero-parallax.js — hero-видео управляется скроллом (scrub-блок ниже).
 * Старый JS-параллакс (translateY по скроллу) УДАЛЁН: он дублировал скраб и
 * translateY заталкивал видео за нижний обрез .hero-bg-stage (overflow:hidden),
 * из-за чего видео резко обрезалось секцией ниже. Теперь видео стоит на CSS
 * transform translate3d(-50%,0,0) и гасится маской до обреза. */

/**
 * Hero-видео управляется скроллом (scrub); в покое — СТОП-КАДР (не играет).
 *
 * currentTime ведём за скроллом: вниз — вперёд, вверх — назад. sens = длит/RANGE,
 * поэтому RANGE больше → скраб медленнее. Позиция относительная (по dy).
 * Кадр догоняет цель через FRAME-RATE-INDEPENDENT демпфинг:
 *   k = 1 - exp(-RATE * dt)   (Rory Driscoll / Freya Holmér)
 * Одинаково плавно на 60 и 120 Гц, мягко замедляется к цели (ease-out).
 * Меньше RATE = мягче и дольше доезжает. В простое кадр стоит — авто-проигрывания нет.
 * Живёт отдельно от параллакса: работает и на телефоне.
 */
(function () {
  'use strict';

  var video = document.querySelector('.hero-bg-video');
  if (!video) return;

  video.removeAttribute('autoplay');
  video.pause();

  var RANGE = 3600;   // px скролла на всё видео (больше = медленнее скраб)
  var RATE = 5;       // скорость догоняния цели, 1/сек. Меньше = мягче/дольше замедляется

  var dur = 0, sens = 0;
  var target = 0, current = 0, raf = 0, lastT = 0, lastY = 0;

  function ready() {
    var d = video.duration;
    if (isFinite(d) && d > 0) { dur = d; sens = d / RANGE; return true; }
    return false;
  }

  // Кадр мягко догоняет target; шаг зависит от реального dt → одинаково на 60/120 Гц.
  function frame(now) {
    raf = 0;
    var dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0.016;
    lastT = now;
    var diff = target - current;
    if (Math.abs(diff) < 0.008) { current = target; lastT = 0; }   // доехали — стоп
    else {
      current += diff * (1 - Math.exp(-RATE * dt));
      raf = requestAnimationFrame(frame);
    }
    try { video.currentTime = current; } catch (e) {}
  }

  function onScroll() {
    if (!ready()) return;
    var y = window.scrollY || window.pageYOffset || 0;
    var dy = y - lastY;
    lastY = y;
    target += dy * sens;                 // относительно, не сбрасываем к абсолюту
    if (target < 0) target = 0;
    if (target > dur) target = dur;
    if (!raf) { lastT = 0; raf = requestAnimationFrame(frame); }
  }

  function start() {
    if (!ready()) return;
    lastY = window.scrollY || window.pageYOffset || 0;
    current = target = Math.min(dur, Math.max(0, lastY * sens));
    try { video.currentTime = current; } catch (e) {}
    // стоп-кадр: пока не скроллят — ничего не запускаем.
  }

  video.addEventListener('loadedmetadata', start);
  window.addEventListener('scroll', onScroll, { passive: true });
  if (video.readyState >= 1) start();
})();

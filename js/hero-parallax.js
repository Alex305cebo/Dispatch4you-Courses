/**
 * hero-parallax.js — фоновое видео уезжает медленнее контента.
 *
 * ТОЛЬКО ДЕСКТОП (>768px). На телефоне параллакса нет намеренно: прокрутка там
 * идёт в отдельном (композиторном) потоке, а JS — в основном, поэтому любой
 * сдвиг через скрипт отстаёт на кадр и «догоняет» после отпускания пальца.
 * На мобильном видео — обычный элемент в потоке: скроллится вместе со
 * страницей, мгновенно и без рывков, потому что это и есть нативная прокрутка.
 */
(function () {
  'use strict';

  var video = document.querySelector('.hero-bg-video');
  var stage = document.querySelector('.hero-bg-stage');
  if (!video || !stage) return;

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var narrow = window.matchMedia('(max-width: 768px)');

  var SPEED = 0.38;   // 0 = стоит, 1 = едет с текстом
  var SMOOTH = 0.22;  // плавность подхода к цели (десктоп)
  var EPS = 0.05;

  var current = 0, target = 0, running = false, idle = 0;

  function disabled() { return calm.matches || narrow.matches; }

  // Снять инлайн-transform, чтобы им управлял CSS (на мобильном — scroll-driven
  // анимация, в reduced-motion — базовое правило). Инлайн перебил бы их.
  function releaseToCss() { if (video.style.transform) video.style.transform = ''; }

  function loop() {
    if (disabled()) {
      releaseToCss();
      running = false;
      return;
    }

    var y = window.scrollY || window.pageYOffset || 0;
    target = (y > stage.offsetTop + stage.offsetHeight) ? target : y * SPEED;

    var diff = target - current;
    if (Math.abs(diff) < EPS) {
      current = target;
      video.style.transform = 'translate3d(-50%, ' + current.toFixed(2) + 'px, 0)';
      if (++idle > 12) { running = false; return; }   // прокрутка стоит — засыпаем
    } else {
      idle = 0;
      current += diff * SMOOTH;
      video.style.transform = 'translate3d(-50%, ' + current.toFixed(2) + 'px, 0)';
    }
    requestAnimationFrame(loop);
  }

  function wake() {
    if (disabled()) {
      releaseToCss();
      return;
    }
    idle = 0;
    if (running) return;
    running = true;
    requestAnimationFrame(loop);
  }

  window.addEventListener('scroll', wake, { passive: true });
  window.addEventListener('resize', wake);
  window.addEventListener('orientationchange', wake);
  wake();
})();

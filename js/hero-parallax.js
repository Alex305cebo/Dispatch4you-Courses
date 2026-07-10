/**
 * hero-parallax.js — ФОЛБЭК-параллакс для десктопа без scroll-timeline.
 *
 * Основной механизм — CSS scroll-driven animation (см. hero.css): она идёт на
 * композиторном потоке и не лагает. Этот скрипт нужен ТОЛЬКО там, где её нет
 * (Safari desktop) И это не телефон: на мобильном Safari JS-параллакс отставал
 * бы на тач-скролле, поэтому там оставляем обычную прокрутку со страницей.
 */
(function () {
  'use strict';

  var video = document.querySelector('.hero-bg-video');
  var stage = document.querySelector('.hero-bg-stage');
  if (!video || !stage) return;

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var narrow = window.matchMedia('(max-width: 768px)');
  // scroll-driven animation поддержана — CSS всё делает сам, JS не нужен
  var cssHandles = window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()');

  var SPEED = 0.38;   // 0 = стоит, 1 = едет с текстом
  var SMOOTH = 0.22;  // плавность подхода к цели
  var EPS = 0.05;

  var current = 0, target = 0, running = false, idle = 0;

  function disabled() { return calm.matches || narrow.matches || cssHandles; }

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

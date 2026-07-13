/**
 * hero-parallax.js — фоновое видео верха страницы.
 *
 * Видео проигрывается ОДИН раз (muted+playsinline) и останавливается на
 * последнем кадре — без loop и без scroll-scrub: перемотка currentTime на
 * каждый кадр гоняла декодер вручную и убивала слабые машины; обычное
 * воспроизведение декодируется аппаратно и почти бесплатно.
 * По скроллу остаются только дешёвые эффекты: параллакс (transform)
 * и «колокол» яркости (opacity) — OP_TOP вверху → OP_PEAK на PEAK_AT
 * доле RANGE → 0 к концу RANGE.
 * Источник (моб/десктоп) подставляет JS из data-mobile/data-desktop:
 * media= у <source> внутри <video> игнорирует Firefox.
 * Автоплей может быть заблокирован (энергосбережение, экономия данных) —
 * тогда повтор по первому жесту; не вышло — остаётся постер.
 * Вне экрана видео на паузе (IntersectionObserver); при возврате на экран
 * доигрывает, а если уже доиграло — проигрывается заново с начала.
 * reduced-motion: статичный постер.
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

  function onScroll() {
    var y = window.scrollY || window.pageYOffset || 0;
    var p = y > 0 ? Math.min(1, y / RANGE) : 0;
    video.style.transform = 'translate3d(0,' + (y * SPEED).toFixed(1) + 'px,0)';
    video.style.opacity = opacityAt(p).toFixed(3);
  }

  // Однократное воспроизведение. play() сам дотягивает данные (preload=metadata
  // в HTML не мешает). Отказ автоплея → повтор по первому жесту пользователя.
  var retryArmed = false;
  function tryPlay() {
    if (video.ended) { try { video.currentTime = 0; } catch (e) {} }   // повтор с начала
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
        if (entries[0].isIntersecting) tryPlay();   // вернулось на экран — доиграть/заново
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
  onScroll();
})();

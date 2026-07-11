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

/**
 * Hero-видео: скролл управляет промоткой, а в простое видео само медленно доигрывает.
 *
 * ВО ВРЕМЯ СКРОЛЛА — скраб: currentTime плавно ведём за скроллом (вниз вперёд,
 * вверх назад). sens = длительность / RANGE, поэтому RANGE больше → скраб медленнее.
 * Позиция накапливается относительно (по dy), а не привязана к абсолютному scrollY —
 * иначе авто-дрейф сбрасывался бы к положению страницы.
 *
 * В ПРОСТОЕ — через IDLE_DELAY после последнего скролла видео начинает МЕДЛЕННО
 * играть само (video.play() + низкий playbackRate). Это плавно и дёшево (обычный
 * декод + loop), в отличие от посекундного seek. Новый скролл прерывает
 * проигрывание и продолжает скраб с текущего кадра — без прыжка.
 *
 * НА СТАРТЕ видео сразу медленно играет (через IDLE_DELAY) — чтобы фон был живым,
 * а не выглядел статичной картинкой. Первый же скролл перехватывает на скраб.
 * Живёт отдельно от параллакса: работает и на телефоне.
 */
(function () {
  'use strict';

  var video = document.querySelector('.hero-bg-video');
  if (!video) return;

  video.removeAttribute('autoplay');
  video.pause();

  var RANGE = 3600;       // px скролла на всё видео (больше = медленнее скраб)
  var EASE = 0.12;        // плавность подхода кадра к цели при скрабе
  var IDLE_DELAY = 700;   // мс тишины после скролла до старта медленного проигрывания
  var SLOW_RATE = 0.25;   // скорость авто-проигрывания в простое (доля обычной)

  var dur = 0, sens = 0;
  var target = 0, current = 0, raf = 0;
  var lastY = 0, idleTimer = 0, playing = false;

  function ready() {
    var d = video.duration;
    if (isFinite(d) && d > 0) { dur = d; sens = d / RANGE; return true; }
    return false;
  }

  // Скраб: плавно ведём currentTime к target через seek (видео на паузе).
  function scrubFrame() {
    raf = 0;
    var diff = target - current;
    if (Math.abs(diff) < 0.01) { current = target; }
    else { current += diff * EASE; raf = requestAnimationFrame(scrubFrame); }
    try { video.currentTime = current; } catch (e) {}
  }

  // Простой: видео само медленно играет вперёд (эффективно, зациклено loop-атрибутом).
  function startIdlePlay() {
    if (!ready()) return;
    playing = true;
    video.playbackRate = SLOW_RATE;
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }

  function onScroll() {
    if (!ready()) return;
    if (playing) {                       // прерываем авто-проигрывание, назад в скраб
      video.pause();
      playing = false;
      current = target = video.currentTime;
    }
    var y = window.scrollY || window.pageYOffset || 0;
    var dy = y - lastY;
    lastY = y;
    target += dy * sens;                 // относительно, не сбрасываем к абсолюту
    if (target < 0) target = 0;
    if (target > dur) target = dur;
    if (!raf) raf = requestAnimationFrame(scrubFrame);
    clearTimeout(idleTimer);             // задержка перед медленным проигрыванием
    idleTimer = setTimeout(startIdlePlay, IDLE_DELAY);
  }

  function start() {
    if (!ready()) return;
    lastY = window.scrollY || window.pageYOffset || 0;
    current = target = Math.min(dur, Math.max(0, lastY * sens));
    try { video.currentTime = current; } catch (e) {}
    // Оживляем сразу: через IDLE_DELAY видео начинает медленно играть само,
    // чтобы фон не выглядел статичной картинкой. Скролл перехватит на скраб.
    clearTimeout(idleTimer);
    idleTimer = setTimeout(startIdlePlay, IDLE_DELAY);
  }

  video.addEventListener('loadedmetadata', start);
  window.addEventListener('scroll', onScroll, { passive: true });
  if (video.readyState >= 1) start();
})();

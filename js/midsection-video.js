/**
 * midsection-video.js — видео-фон за секциями «Что вы получите» + «USA Map
 * Trainer». Абсолютный слой в <main>; top/height ставим под диапазон от
 * начала features до конца map-trainer. Видео в loop, приглушено CSS.
 * Ленивая загрузка + пауза вне экрана (IntersectionObserver). Без скролл-
 * эффектов (нет параллакса/бела) → нет per-frame нагрузки при скролле.
 * reduced-motion: статичный постер.
 */
(function () {
  'use strict';

  var stage = document.querySelector('.midfx-bg-stage');
  if (!stage) return;
  var video = stage.querySelector('.midfx-bg-video');
  var first = document.querySelector('.features-section');
  var last = document.querySelector('.profession-section');
  if (!video || !first || !last) return;

  // Слой абсолютный в <main> — считаем top/height через документные позиции.
  function layout() {
    var scrollY = window.scrollY || window.pageYOffset || 0;
    var op = stage.offsetParent || document.documentElement;
    var opTop = op.getBoundingClientRect().top + scrollY;
    var top = first.getBoundingClientRect().top + scrollY;
    var bottom = last.getBoundingClientRect().bottom + scrollY;
    stage.style.top = (top - opTop) + 'px';
    stage.style.height = (bottom - top) + 'px';
  }
  layout();
  window.addEventListener('resize', layout);
  window.addEventListener('load', layout);
  // Контент выше/внутри может менять высоту (ленивый CSS, шрифты, карусель).
  if (window.ResizeObserver) { new ResizeObserver(layout).observe(document.body); }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // постер

  // Параллакс как у первого видео: видео ЗАКРЕПЛЕНО к вьюпорту (translateY = −sr.top)
  // → фон стоит на месте, контент/текст прокручивается поверх (сильный эффект),
  // + мягкий дрейф. rAF-throttle, GPU-transform (нет маски → без лагов при скролле).
  var SLACK = 0.10;   // запас высоты видео (120svh → 10% сверху/снизу)
  var PLX = 0.14;     // амплитуда мягкого дрейфа (< SLACK → без провалов)
  var narrowVp = window.matchMedia('(max-width: 768px)');
  var PEAK = narrowVp.matches ? 0.5 : 0.62;   // пик яркости «колокола»
  var EDGE = 0.22;    // доля прохода на осветление/затемнение по краям
  function smooth(t) { return t * t * (3 - 2 * t); }   // smoothstep
  var ticking = false;
  function paintParallax() {
    ticking = false;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var sr = stage.getBoundingClientRect();
    var p = (vh - sr.top) / (vh + sr.height);   // прогресс прохода слоя через вьюпорт
    p = p < 0 ? 0 : (p > 1 ? 1 : p);
    // «Колокол» яркости, как у второго видео (Марины): тускло на входе/выходе,
    // ярко по центру — плавное затемнение при скролле.
    var e = p < EDGE ? smooth(p / EDGE)
          : (p > 1 - EDGE ? smooth((1 - p) / EDGE) : 1);
    video.style.opacity = (PEAK * e).toFixed(3);
    var drift = (p - 0.5) * PLX * vh;
    var y = -sr.top - SLACK * vh + drift;       // закрепляем к вьюпорту + дрейф
    video.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(paintParallax);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', paintParallax);
  paintParallax();

  var narrow = window.matchMedia('(max-width: 768px)');
  var src = video.getAttribute(narrow.matches ? 'data-mobile' : 'data-desktop');
  if (!src) return;
  video.loop = true;

  var retryArmed = false;
  function tryPlay() {
    if (src && !video.src) video.src = src;   // ленивая загрузка — только у вьюпорта
    var pr = video.play();
    if (pr && pr.catch) pr.catch(function () {
      if (retryArmed) return;
      retryArmed = true;
      var kick = function () { video.play().catch(function () {}); };
      window.addEventListener('pointerdown', kick, { once: true });
      window.addEventListener('scroll', kick, { once: true, passive: true });
    });
  }

  if (window.IntersectionObserver) {
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) tryPlay();
      else video.pause();
    }, { threshold: 0, rootMargin: '300px 0px' }).observe(stage);
  } else {
    if (src) video.src = src;
    tryPlay();
  }
})();

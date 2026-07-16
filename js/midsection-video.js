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

  // Параллакс как у ГЕРОЯ (мягкий), а не жёсткое закрепление: видео едет на
  // (1−SPEED)× скорости контента. Жёсткий пиннинг (translateY=−sr.top) требует
  // компенсировать скролл 1:1 каждый кадр, а JS отстаёт на кадр → видео дёргалось.
  // Мягкий сдвиг эту задержку не выдаёт (как у героя — там рывка нет). rAF-throttle.
  var SPEED  = 0.30;  // видео 0.7× к скорости контента (совпадает с героем)
  var CENTER = 0.10;  // видео 120svh: (1.2−1)/2 → центр вьюпорта в середине прохода
  var narrowVp = window.matchMedia('(max-width: 768px)');
  var PEAK = narrowVp.matches ? 0.5 : 0.62;   // пик яркости «колокола»
  var EDGE = 0.40;    // доля прохода на осветление/затемнение по краям (широкая зона →
                      // затемнение на входе/выходе видно при скролле, как у Марины)
  function smooth(t) { return t * t * (3 - 2 * t); }   // smoothstep
  // Под конец ролик гаснет до полупрозрачного (как у Марины) и застывает таким.
  var ENDDIM_SEC = 2.5;   // за сколько секунд до конца начинать гасить
  var ENDDIM_MIN = 0.2;   // финальная доля яркости — тускло, «сквозь стекло»
  var endFade = 1, curE = 0;   // множитель к «колоколу» + кэш последнего e
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
    curE = e;
    video.style.opacity = (PEAK * e * endFade).toFixed(3);
    // Мягкий параллакс (не жёсткое закрепление): видео едет медленнее контента.
    // Авто-центровка по высоте слоя, чтобы панель не уезжала за кадр на высоком слое.
    var half = (sr.height - vh) / 2;
    var y = -SPEED * sr.top - CENTER * vh + (1 - SPEED) * half;
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

  // Под конец ролика гасим яркость (endFade 1 → ENDDIM_MIN): картинка тускнеет,
  // становится полупрозрачной и застывает так, растворяясь в тёмном фоне — как Марина.
  // rAF крутится только пока видео играет. Скорость НЕ трогаем.
  var rafDim = 0;
  function dimAt(t, d) {
    var tail = d - ENDDIM_SEC;
    return t > tail ? Math.max(ENDDIM_MIN, 1 - (1 - ENDDIM_MIN) * ((t - tail) / ENDDIM_SEC)) : 1;
  }
  function dimLoop() {
    rafDim = 0;
    if (video.paused) return;
    var d = video.duration || 0;
    if (d) {
      var nf = dimAt(video.currentTime, d);
      if (nf !== endFade) { endFade = nf; video.style.opacity = (PEAK * curE * endFade).toFixed(3); }
    }
    rafDim = requestAnimationFrame(dimLoop);
  }
  video.addEventListener('play', function () { if (!rafDim) rafDim = requestAnimationFrame(dimLoop); });

  var narrow = window.matchMedia('(max-width: 768px)');
  var src = video.getAttribute(narrow.matches ? 'data-mobile' : 'data-desktop');
  if (!src) return;
  // Как у второго видео (Марины): играет ОДИН раз и застывает на последнем кадре
  // (без loop). Затемнение даёт «колокол» яркости выше. Секция ушла и вернулась —
  // проигрывается заново с начала.

  var retryArmed = false;
  function tryPlay() {
    if (src && !video.src) video.src = src;   // ленивая загрузка — только у вьюпорта
    try { video.currentTime = 0; } catch (e) {} endFade = 1;   // вход/возврат — всегда с начала, яркость сброшена
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

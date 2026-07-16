/**
 * section-video.js — фоновый слой видео СЕКЦИИ «Как это работает».
 *
 * Видео проигрывается, когда секция входит во вьюпорт, и останавливается
 * на последнем кадре — без loop и без scroll-scrub (перемотка currentTime
 * на скролл убивала слабые машины; обычное воспроизведение декодируется
 * аппаратно). Секция ушла с экрана и вернулась — проигрывается заново.
 *
 * По скроллу остаются дешёвые эффекты (transform/opacity):
 *   - яркость по положению секции: плато со smoothstep-краями —
 *     входит снизу → проявляется, по центру → светло, уходит вверх → гаснет;
 *   - видео закреплено к вьюпорту (translateY = -stageTop) + мягкий
 *     параллакс-дрейф в пределах запаса высоты 120svh.
 * Источник (моб/десктоп) подставляет JS из data-mobile/data-desktop:
 * media= у <source> внутри <video> игнорирует Firefox.
 * Отказ автоплея → повтор по первому жесту; не вышло — остаётся постер.
 * Края растворяет радиальная маска (CSS), читаемость держит scrim.
 * reduced-motion: статичный приглушённый постер.
 */
(function () {
  'use strict';

  var video = document.querySelector('.section-bg-video');
  if (!video) return;
  var stage = video.closest('.section-bg-stage');
  var section = document.querySelector('.how-it-works-section');
  if (!stage || !section) return;

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var narrow = window.matchMedia('(max-width: 768px)');

  var PEAK  = narrow.matches ? 0.90 : 0.70;   // пик яркости (светло) — как у hero
  var EDGE  = 0.22;                           // доля прохода на осветление/затемнение по краям
  var SPEED = 0.30;                           // мягкий параллакс как у героя: видео на 0.7× скорости контента (не рвётся)
  var CENTER = 0.10;                          // видео 120svh: (1.2−1)/2 → центр вьюпорта в середине прохода

  // Под конец ролик тускнеет/полупрозрачен (как через стекло) и застывает так.
  var ENDDIM_SEC = 2.5;                       // за сколько секунд до конца начать гасить
  var ENDDIM_MIN = 0.2;                       // финальная доля яркости — тускло, сквозь стекло
  var endFade = 1, curE = 0;                  // множитель к «колоколу» + кэш последнего e

  function smooth(t) { return t * t * (3 - 2 * t); }   // smoothstep

  // Абсолютный слой ПОД секцию (top/height). offsetTop ненадёжен (offsetParent
  // слоя мог отличаться от секции) → считаем через документные позиции.
  function layout() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var scrollY = window.scrollY || window.pageYOffset || 0;
    var op = stage.offsetParent || document.documentElement;
    var opTop = op.getBoundingClientRect().top + scrollY;
    var secTop = section.getBoundingClientRect().top + scrollY;
    stage.style.top = (secTop - opTop) + 'px';
    stage.style.height = (section.offsetHeight + vh) + 'px';
  }

  function paint() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var r = section.getBoundingClientRect();

    // Прогресс по положению секции: 0 — только входит снизу, 1 — ушла вверх.
    var p = (vh - r.top) / (vh + r.height);
    p = p < 0 ? 0 : (p > 1 ? 1 : p);

    // Плато-«колокол»: smoothstep-подъём за первые EDGE, светлое плато, smoothstep-спад.
    var e = p < EDGE ? smooth(p / EDGE)
          : (p > 1 - EDGE ? smooth((1 - p) / EDGE) : 1);
    curE = e;
    video.style.opacity = (PEAK * e * endFade).toFixed(3);

    // Видео ПРИКРЕПЛЕНО к вьюпорту (центрируем на нём) + мягкий параллакс-дрейф,
    // ОГРАНИЧЕННЫЙ фактическим запасом высоты (vidH − vh). Запас меряем по реальной
    // высоте видео (устойчиво к расхождению svh/vh на мобильных), а НЕ от высоты
    // секции — поэтому на высоких вертикальных секциях край видео не оголяется.
    var sr = stage.getBoundingClientRect();
    var vidH = video.getBoundingClientRect().height || vh * 1.35;
    var spare = Math.max(0, vidH - vh);
    var prog = (vh - sr.top) / (vh + sr.height);
    prog = prog < 0 ? 0 : (prog > 1 ? 1 : prog);
    var y = -sr.top - spare / 2 + (prog - 0.5) * spare * 0.8;
    video.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
  }

  if (calm.matches) {                    // reduced-motion — статичный кадр
    layout();
    video.style.opacity = (PEAK * 0.5).toFixed(3);
    paint();
    return;
  }

  var src = video.getAttribute(narrow.matches ? 'data-mobile' : 'data-desktop');

  // Воспроизведение при входе секции во вьюпорт; ушла и вернулась — заново.
  var retryArmed = false;
  function tryPlay() {
    if (src && !video.src) video.src = src;   // ленивая загрузка: 2.2 МБ ролика грузим только у вьюпорта, не на старте
    try { video.currentTime = 0; } catch (e) {} endFade = 1;   // вход/возврат в секцию — всегда с начала, яркость сброшена
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
    // rootMargin 300px — начинаем грузить/играть чуть раньше входа, без вспышки постера.
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) tryPlay();   // вернулась на экран — доиграть/заново
      else video.pause();
    }, { threshold: 0, rootMargin: '300px 0px' }).observe(stage);
  } else {
    if (src) video.src = src;
    tryPlay();
  }

  // Под конец ролика гасим яркость (endFade 1 → ENDDIM_MIN): картинка тускнеет,
  // становится полупрозрачной и застывает так, растворяясь в тёмном фоне.
  // Скорость НЕ трогаем. rAF крутится только пока видео играет.
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

  // rAF-throttle: один paint на кадр вместо записи на каждый scroll-эвент.
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; paint(); });
  }
  function onResize() { layout(); paint(); }

  layout();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  // Секция растёт (аккордеон) без scroll/resize → пересчитать layout.
  if (window.ResizeObserver) { new ResizeObserver(onResize).observe(section); }

  paint();
})();

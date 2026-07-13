/**
 * section-video.js — фоновый слой видео СЕКЦИИ «Как это работает».
 *
 * Яркость привязана к ПОЛОЖЕНИЮ секции во вьюпорте (не к абсолютному скроллу):
 *   - секция входит снизу  → видео проявляется из темноты (осветляется);
 *   - секция заполняет/по центру экрана → светло (плато яркости);
 *   - секция уходит вверх   → снова затемняется.
 * Кривая — плато со smoothstep-краями (C1-плавно, без «излома»).
 *
 * Видео закреплено к вьюпорту (translateY = -r.top) — гарантированное
 * покрытие и на высокой (моб), и на короткой (десктоп) секции, без тёмных
 * провалов. Поверх — мягкий параллакс-дрейф (±, симметрично, в пределах
 * запаса высоты 120svh, поэтому край не оголяется даже на плато). Кадр
 * скрабится по прогрессу (currentTime), демпфинг k=1-exp(-RATE·dt).
 * Края растворяет радиальная маска (CSS), читаемость держит scrim.
 * reduced-motion: статичный приглушённый кадр.
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
  var EDGE  = 0.22;                            // доля прохода на осветление/затемнение по краям
  var SLACK = 0.10;                            // запас высоты видео (120svh → 10% сверху/снизу)
  var PLX   = 0.12;                            // амплитуда параллакса (±6% vh, < SLACK → без провалов)
  var RATE  = 6;                               // плавность подхода кадра при скрабе

  var dur = 0, curT = 0, tgtT = 0, raf = 0, lastT = 0;

  function smooth(t) { return t * t * (3 - 2 * t); }   // smoothstep

  // Абсолютный слой ПОД секцию (top/height). offsetTop ненадёжен (offsetParent
   // слоя мог отличаться от секции) → считаем через документные позиции.
  function layout() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var scrollY = window.scrollY || window.pageYOffset || 0;
    var op = stage.offsetParent || document.documentElement;
    var opTop = op.getBoundingClientRect().top + scrollY;              // документный top offsetParent
    var secTop = section.getBoundingClientRect().top + scrollY;        // документный top секции
    stage.style.top = (secTop - opTop) + 'px';
    stage.style.height = (section.offsetHeight + vh) + 'px';
  }

  function ready() {
    var d = video.duration;
    if (isFinite(d) && d > 0) { dur = d; return true; }
    return false;
  }

  function paint() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var r = section.getBoundingClientRect();
    var secH = r.height;

    // Прогресс по положению секции: 0 — только входит снизу, 1 — ушла вверх.
    var p = (vh - r.top) / (vh + secH);
    p = p < 0 ? 0 : (p > 1 ? 1 : p);

    // Плато-«колокол»: smoothstep-подъём за первые EDGE, светлое плато, smoothstep-спад.
    var e = p < EDGE ? smooth(p / EDGE)
          : (p > 1 - EDGE ? smooth((1 - p) / EDGE) : 1);
    video.style.opacity = (PEAK * e).toFixed(3);

    // Закрепление к вьюпорту по ФАКТ-положению слоя (-stageRect.top, не по
    // section.offsetTop) + центровка под 120%-видео (-SLACK·vh) + симметричный
    // параллакс-дрейф. Всё одним GPU-transform.
    var sr = stage.getBoundingClientRect();
    var parallax = (p - 0.5) * PLX * vh;
    var y = -sr.top - SLACK * vh + parallax;
    video.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';

    return p;
  }

  // Scrub-петля: кадр мягко догоняет target.
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

  function onScroll() {
    var p = paint();
    if (!ready()) return;
    tgtT = p * dur;
    if (!raf) { lastT = 0; raf = requestAnimationFrame(tick); }
  }

  if (calm.matches) {                    // reduced-motion — статичный кадр
    layout();
    video.pause();
    video.style.opacity = (PEAK * 0.5).toFixed(3);
    paint();
    return;
  }

  video.removeAttribute('autoplay');
  video.pause();

  // preload="metadata" в HTML → полную буферизацию включаем после load/первого скролла.
  var kicked = false;
  function kickLoad() {
    if (kicked) return;
    kicked = true;
    video.preload = 'auto';
    try { video.load(); } catch (e) {}
    window.removeEventListener('scroll', kickLoad);
  }
  if (document.readyState === 'complete') { kickLoad(); }
  else {
    window.addEventListener('load', kickLoad, { once: true });
    window.addEventListener('scroll', kickLoad, { passive: true });
  }

  function onResize() { layout(); onScroll(); }

  layout();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  video.addEventListener('loadedmetadata', onScroll);
  // Секция растёт (аккордеон) без scroll/resize → пересчитать layout.
  if (window.ResizeObserver) { new ResizeObserver(onResize).observe(section); }

  onScroll();
})();

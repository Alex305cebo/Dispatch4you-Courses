/**
 * midsection-video.js — видео-фон за секциями «Что вы получите» + «Профессия
 * диспетчера» (Марина). Видео — position:fixed (midsection-video.css):
 * закреплено относительно экрана и в принципе не двигается, пока не
 * скрыто — двигается только контент вокруг. Раньше было position:sticky,
 * но у sticky есть фазы входа/выхода (пока элемент ещё не "прилип"/уже
 * "отлип" — едет вместе с контентом), и смена геометрии контейнера во
 * время скролла дёргала его в эти моменты. На fixed таких фаз нет вообще:
 * позиция всегда одна точка экрана, видимость (opacity) включает/выключает
 * JS по факту пересечения секции-диапазона с вьюпортом.
 * Ленивая загрузка + пауза вне экрана (IntersectionObserver).
 * reduced-motion: статичный постер, тоже гейтится диапазоном (fixed иначе
 * был бы виден на всей странице).
 */
(function () {
  'use strict';

  var stage = document.querySelector('.midfx-bg-stage');
  if (!stage) return;
  var video = stage.querySelector('.midfx-bg-video');
  var first = document.querySelector('.features-section');
  var last = document.querySelector('.profession-section');
  if (!video || !first || !last) return;

  // stage больше не визуальный контейнер видео (видео на position:fixed) —
  // чисто измерительный ориентир: JS читает её геометрию для прогресса
  // скролла (яркость) и для диапазона видимости.
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
  window.addEventListener('load', layout);
  // Контент выше/внутри может менять высоту (ленивый CSS, шрифты, карусель) —
  // ResizeObserver на document.body может сработать несколько раз подряд,
  // пока страница ещё "устаканивается". Дебаунсим — synchronно оставляем
  // только самый первый вызов при загрузке.
  var layoutTimer = 0;
  function scheduleLayout() {
    clearTimeout(layoutTimer);
    layoutTimer = setTimeout(layout, 150);
  }
  window.addEventListener('resize', scheduleLayout);
  if (window.ResizeObserver) { new ResizeObserver(scheduleLayout).observe(document.body); }

  // ---- Видимость: видео на position:fixed было бы видно НА ВСЕЙ странице
  // без явного гейта. Гейт — по пересечению stage с вьюпортом (запас 300px,
  // чтобы видео успевало прогрузиться/сыграть до фактического появления). ----
  var inRange = false;
  function setInRange(v) {
    inRange = v;
    if (!v) video.style.opacity = '0';
  }

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    // Статичный постер — без скролл-логики, просто показать/скрыть по диапазону.
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (entries) {
        var on = entries[0].isIntersecting;
        setInRange(on);
        if (on) video.style.opacity = '0.3';
      }, { threshold: 0 }).observe(stage);
    }
    return;
  }

  var narrowVp = window.matchMedia('(max-width: 768px)');
  var PEAK = narrowVp.matches ? 0.72 : 0.62;  // пик яркости «колокола» (на мобильном ярче — было плохо видно)
  var EDGE = narrowVp.matches ? 0.16 : 0.25;  // доля прохода на осветление/затемнение по краям;
                      // меньше EDGE = короче фейд, дольше плато полной яркости
                      // на мобильном зона у́же → видео ярко бо́льшую часть прокрутки
  function smooth(t) { return t * t * (3 - 2 * t); }   // smoothstep
  // Под конец ролик гаснет до полупрозрачного (как у Марины) и застывает таким.
  var ENDDIM_SEC = 2.5;   // за сколько секунд до конца начинать гасить
  var ENDDIM_MIN = 0.2;   // финальная доля яркости — тускло, «сквозь стекло»
  var endFade = 1, curE = 0;   // множитель к «колоколу» + кэш последнего e
  var ticking = false;
  function updateBrightness() {
    ticking = false;
    if (!inRange) { video.style.opacity = '0'; return; }
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var sr = stage.getBoundingClientRect();
    var p = (vh - sr.top) / (vh + sr.height);   // прогресс прохода слоя через вьюпорт
    p = p < 0 ? 0 : (p > 1 ? 1 : p);
    // «Колокол» яркости, как у второго видео (Марины): тускло на входе/выходе,
    // ярко по центру — плавное затемнение при скролле. Позицию не трогаем.
    var e = p < EDGE ? smooth(p / EDGE)
          : (p > 1 - EDGE ? smooth((1 - p) / EDGE) : 1);
    curE = e;
    video.style.opacity = (PEAK * e * endFade).toFixed(3);
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateBrightness);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateBrightness);

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
  video.addEventListener('play', function () { if (video.loop) return; if (!rafDim) rafDim = requestAnimationFrame(dimLoop); });

  var narrow = window.matchMedia('(max-width: 768px)');
  var src = video.getAttribute(narrow.matches ? 'data-mobile' : 'data-desktop');
  if (!src) return;
  // На узких экранах секция высокая → ЗАЦИКЛИВАЕМ, чтобы фон не «доигрывал» и не
  // тускнел, пока пользователь долго скроллит. Десктоп — как Марина: раз + freeze.
  video.loop = narrow.matches;
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
      var intersecting = entries[0].isIntersecting;
      setInRange(intersecting);
      if (intersecting) { tryPlay(); onScroll(); }
      else video.pause();
    }, { threshold: 0, rootMargin: '300px 0px' }).observe(stage);
  } else {
    if (src) video.src = src;
    setInRange(true);
    tryPlay();
  }
})();

/**
 * section-video.js — фоновое видео СЕКЦИИ «Как это работает», Apple-стиль пин.
 *
 * Пока секция ПОЛНОСТЬЮ покрывает вьюпорт, слой .section-bg-stage прилипает
 * (класс .is-pinned → position:fixed на весь экран), а кадр видео скрабится по
 * прогрессу прокрутки сквозь секцию (currentTime ↔ q). Яркость «колоколом»:
 * тёмный на входе → светлее в середине → снова тёмный к концу. На входе/выходе
 * (секция не покрывает экран целиком) слой отлеплён и погашен.
 *
 * Если секция короче экрана (десктоп) — пина нет, обычный проход cover в секции.
 * Пин сделан через fixed, а не sticky: у body overflow-x:hidden ломает sticky.
 * reduced-motion: статичный кадр, приглушённая яркость.
 */
(function () {
  'use strict';

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var narrow = window.matchMedia('(max-width: 768px)');
  var items = [].slice.call(document.querySelectorAll('.section-bg-video'));
  if (!items.length) return;

  var OP_PEAK = narrow.matches ? 0.55 : 0.60;   // пик яркости
  var OP_TOP  = narrow.matches ? 0.20 : 0.30;   // яркость на входе (режим без пина)
  var PEAK_AT = 0.4;   // где пик в режиме без пина, доля прогресса
  var RATE    = 6;     // плавность подхода кадра к цели при скрабе

  items.forEach(function (video) {
    var stage = video.closest('.section-bg-stage');
    var section = stage ? stage.parentElement : video.parentElement;
    if (!section) return;

    var dur = 0, curT = 0, tgtT = 0, raf = 0, lastT = 0;

    function ready() {
      var d = video.duration;
      if (isFinite(d) && d > 0) { dur = d; return true; }
      return false;
    }

    // Считает прогресс/пин/яркость, вешает класс, пишет opacity. Возвращает p (0..1).
    function apply() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var r = section.getBoundingClientRect();
      var secH = r.height;
      var p, op, pinned;

      if (secH > vh + 40) {                 // секция выше экрана → возможен пин
        var denom = secH - vh;
        var q = -r.top / denom;
        q = q < 0 ? 0 : (q > 1 ? 1 : q);
        pinned = (r.top <= 0 && r.bottom >= vh);   // секция полностью покрывает экран
        p = q;
        op = pinned ? OP_PEAK * Math.sin(Math.PI * q) : 0;   // вне пина — скрыто
      } else {                              // короткая секция (десктоп) — обычный проход
        var pp = (vh - r.top) / (vh + secH);
        pp = pp < 0 ? 0 : (pp > 1 ? 1 : pp);
        pinned = false;
        p = pp;
        op = pp <= PEAK_AT
          ? OP_TOP + (OP_PEAK - OP_TOP) * (pp / PEAK_AT)
          : OP_PEAK * (1 - (pp - PEAK_AT) / (1 - PEAK_AT));
      }

      stage.classList.toggle('is-pinned', pinned);
      video.style.opacity = op.toFixed(3);
      return p;
    }

    // Scrub-петля: кадр мягко догоняет target, шаг зависит от реального dt.
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
      var p = apply();
      if (!ready()) return;
      tgtT = p * dur;
      if (!raf) { lastT = 0; raf = requestAnimationFrame(tick); }
    }

    if (calm.matches) {
      video.pause();
      stage.classList.remove('is-pinned');
      video.style.opacity = (OP_PEAK * 0.5).toFixed(3);
      apply();
      return;
    }

    video.removeAttribute('autoplay');
    video.muted = true;
    video.pause();
    video.preload = 'auto';
    try { video.load(); } catch (e) {}

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    video.addEventListener('loadedmetadata', onScroll);
    onScroll();
  });
})();
